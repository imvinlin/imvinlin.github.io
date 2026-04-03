---
title: Debugging a Slow API on Linux
date: 2026-04-02
author: Vincent Lin
tags: [linux, debugging, networking, troubleshooting]
description: "workflow on debugging a slow api"
toc: true
---

# Debugging a Slow API on Linux

When someone says that an API is slow, the main job is to figure out **where** the delay is happening instead of guessing.

A general workflow for this issue is:

1. confirm the symptom
2. check DNS and network path
3. measure TCP and TLS timing
4. inspect the server
5. confirm with logs

Within this process, there are numerous different tools you could use but I will only show the native Linux ones. However, there may be more detailed tools that have been built but not natively installed.

# 1. Clarify the problem

Before running commands ask yourself these questions:

- Is it all users or only some users?
- Is it every endpoint or one endpoint?
- Did it start suddenly?
- Is it timing out or just slow?
- Was there a deploy or config change?

# 2. Check reachability

## ping

```bash
ping api.company.com
```

What it does:

- `ping` sends ICMP echo requests to check for basic reachability and latency

Example:

```txt
PING api.company.com (203.0.113.24) 56(84) bytes of data.
64 bytes from 203.0.113.24: icmp_seq=1 ttl=54 time=18.4 ms
64 bytes from 203.0.113.24: icmp_seq=2 ttl=54 time=17.9 ms
64 bytes from 203.0.113.24: icmp_seq=3 ttl=54 time=52.1 ms

--- api.company.com ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 17.9/29.5/52.1/15.9 ms
```

Look for packet loss and unstable latency. A good ping does not prove the API is healthy but shows basic reachability.

## traceroute

```bash
traceroute api.company.com
```

What it does:

- `traceroute` shows the path packets take to the destination hop by hop
- it helps you see where latency increases or where packets may be getting dropped
- each line is usually a router or network hop between you and the target

Example:

```txt
traceroute to api.company.com (203.0.113.24), 30 hops max, 60 byte packets
 1  192.168.1.1       1.123 ms   1.042 ms   0.991 ms
 2  10.10.0.1         4.821 ms   4.764 ms   4.903 ms
 3  198.51.100.10    12.442 ms  13.018 ms  12.771 ms
 4  203.0.113.24     18.993 ms  19.204 ms  18.857 ms
```

Look for:

- sudden jumps in latency between hops
- timeouts shown as `* * *`
- where the route seems to stop
- whether the path looks much longer than expected

A few timed out hops do not always mean the route is broken. Some routers simply do not reply to traceroute probes. What matters more is whether later hops still respond and whether the final destination is reachable.

# 3. Check DNS

## getent hosts

```bash
getent hosts api.company.com

```
What it does:

- `getent` queries system databases through Name Service Switch (NSS)
- hosts tells it to resolve a hostname the way the local Linux system normally would which is configured within `/etc/nsswitch.conf`

Example:

```txt
203.0.113.24    api.company.com
203.0.113.25    api.company.com
```

Look for:

- wrong IPs
- whether the name resolves at all
- whether multiple IPs are returned

If DNS is wrong or missing, the API can feel broken before the connection even starts.

For deeper DNS inspection, `nslookup` or `dig` can show more detail, but they may not be installed by default.

## dig (not native)

```bash
dig api.company.com
```

What it does:

- `dig` asks DNS servers for records such as A, AAAA, MX, and TXT
- It is useful for seeing returned IPs, TTLs, and query time

Example:

```txt
;; QUESTION SECTION:
;api.company.com.              IN      A

;; ANSWER SECTION:
api.company.com.       60      IN      A       203.0.113.24
api.company.com.       60      IN      A       203.0.113.25

;; Query time: 148 msec
```

Look for:

- wrong IPs
- high query time
- unexpected TTLs

If DNS is slow, the API may feel slow before the connection even starts.

# 4. Check the TCP port

## Bash TCP check

```bash
timeout 3 bash -c '</dev/tcp/api.company.com/443'
````

What it does:

- `timeout 3` stops the command after 3 seconds so it does not hang forever
- `bash -c '...'` runs the check inside Bash
- `/dev/tcp/api.company.com/443` is a Bash feature that tries to open a TCP connection to host `api.company.com` on port `443`
- port `443` was chosen as it is the default port served for **HTTPS** meanwhile port `80` is the default port served for **HTTP**
- if the connection succeeds, the command exits successfully
- if it fails, Bash prints an error

Success example:

```txt

```

There may be times in which nothing is printed for success which is normal.

Failure example:

```txt
bash: connect: Connection timed out
bash: /dev/tcp/api.company.com/443: Connection timed out
```

Look for:

- `Connection timed out` which often suggests firewall, routing, or packet drop issues
- `Connection refused` which usually means the host is reachable but nothing is listening on that port
- no output with a successful exit, which usually means the TCP connection worked

## nc (not installed by default)

```bash
nc -zv api.company.com 443
```

What it does:

- `nc` aka netcat, is a simple tool for testing raw network connections
- `-z` means zero I/O mode, so it checks whether the port is open without sending application data
- `-v` means verbose, so it prints more connection details

Success example:

```txt
Connection to api.company.com (203.0.113.24) 443 port [tcp/https] succeeded!
```

Failure example:

```txt
nc: connect to api.company.com (203.0.113.24) port 443 (tcp) failed: Connection timed out
```

Look for:

- `timed out` which often suggests firewall or routing issues
- `refused` which usually means the host is up but nothing is listening


# 5. Break the HTTP request into phases

## curl

This is one of the **most useful** checks.

```bash
curl -w "@curl-format.txt" -o /dev/null -s "https://api.company.com/health"
```

What it does:

- `curl` makes HTTP requests from the command line
- `-w` prints timing information using the format file
- `-o /dev/null` throws away the response body because we only care about timing
- `-s` means silent mode, so progress output is hidden

`curl-format.txt`:

```txt
time_namelookup: %{time_namelookup}
time_connect: %{time_connect}
time_appconnect: %{time_appconnect}
time_starttransfer: %{time_starttransfer}
time_total: %{time_total}
```

Example:

```txt
time_namelookup: 0.012
time_connect: 0.031
time_appconnect: 0.084
time_starttransfer: 2.487
time_total: 2.488
```

Interpretation:

- high `time_namelookup` means DNS may be slow
- high `time_connect` suggests TCP connection issues
- high `time_appconnect` points to TLS delay
- high `time_starttransfer` usually means the backend is slow

# 6. Inspect the server

## top

```bash
top
```

What it does:

- `top` shows live CPU, memory, load average, and process activity

Example:

```txt
top - 14:42:01 up 15 days,  3:11,  2 users,  load average: 4.82, 5.01, 4.97
Tasks: 224 total,   2 running, 221 sleeping,   0 stopped,   1 zombie
%Cpu(s): 72.3 us, 11.4 sy, 13.1 id, 2.4 wa
MiB Mem : 15884.0 total, 412.3 free, 14211.5 used, 1260.2 buff/cache
MiB Swap: 2048.0 total, 1801.0 free, 247.0 used
```

Look for:

- high CPU
- low free memory
- swap usage
- high load average
- I/O wait

## vmstat

```bash
vmstat 1
```

What it does:

- `vmstat` shows process, memory, swap, disk, and CPU summary stats
- `1` means refresh every 1 second

Example:

```txt
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so   bi   bo   in   cs us sy id wa st
 5  2 252928 185432  60344 990224   12   48  320  410 1320 2890 61 14 10 15  0
```

Key fields:

- `r` = runnable processes
- `b` = blocked processes
- `si` and `so` = swap in and swap out
- `bi` and `bo` = disk input and output
- `wa` = CPU waiting on I/O

If `wa`, `bi`, and `bo` are high, the problem may be storage or memory pressure instead of networking.

## iostat (not native)

```bash
iostat -x 1
```

What it does:

- `iostat` shows disk I/O statistics
- `-x` means extended stats, so you get fields like await and utilization
- `1` means refresh every 1 second

Example:

```txt
Device            r/s     rkB/s     w/s     wkB/s  r_await  w_await  %util
nvme0n1         120.00   4096.00   85.00   2048.00   18.20    22.41  94.20
```

Look for high `%util` and high await times.

In general here is the rule of thumb for these 3:
- `top` tells you **who** is busy right now 
- `vmstat` tells you the **system pressure** across the **entire** machine 
- `iostat` tells you if storage devices are the bottlenecks 

# 7. Check active sockets

```bash
ss -tuln
```

What it does:

- `ss` shows socket information
- `-t` shows TCP sockets
- `-u` shows UDP sockets
- `-l` shows listening sockets
- `-n` shows numeric addresses and ports instead of resolving names

Example:

```txt
Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port
tcp   LISTEN 0      511    0.0.0.0:443         0.0.0.0:*
tcp   LISTEN 0      128    127.0.0.1:5432      0.0.0.0:*
```

This helps verify the service is listening and gives a quick view of connection pressure.

# 8. Confirm with logs

```bash
tail -f /var/log/application.log
grep "slow\|timeout\|error" /var/log/application.log
```

What they do:

- `tail -f` shows the end of a file and keeps **following** new lines as they are written
- `grep` searches for matching text patterns
- `\|` means OR in basic `grep` regex, so this command looks for lines containing `slow`, `timeout`, or `error`

Example:

```txt
2026-04-02T14:46:03Z WARN request_id=ab12 path=/health upstream=db latency_ms=2410 msg="database query slow"
2026-04-02T14:46:05Z ERROR request_id=ab13 path=/users timeout_ms=3000 msg="redis timeout"
2026-04-02T14:46:08Z WARN request_id=ab14 path=/orders latency_ms=1988 msg="connection pool exhausted"
```

This is often where the real root cause becomes obvious.

# Quick interpretation guide

- High DNS time: check resolver and DNS config
- High connect time: check routing, firewall, load balancer
- High TLS time: check certificates, proxies, CPU pressure
- High start transfer time: check app, DB, cache, thread pools
- High `wa`, `bi`, `bo`, `swap`: check disk and memory pressure

# Final thoughts

A slow API is not one problem. It is a symptom. The useful question is: **which phase is slow???**

That is why I like this order:

```bash
ping api.company.com
traceroute api.company.com
getent hosts api.company.com
dig api.company.com
nc -zv api.company.com 443
curl -w "@curl-format.txt" -o /dev/null -s "https://api.company.com/health"
top
vmstat 1
iostat -x 1
ss -tuln
tail -f /var/log/application.log
```

Once the delay is separated into DNS, TCP, TLS, backend, or machine health, the debugging process becomes **much more** manageable. Good luck!! :)

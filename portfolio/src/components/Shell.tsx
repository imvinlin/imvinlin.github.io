'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Terminal, Book, Network, Brain, Wrench } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Blog from './Blog';
import Contact from './Contact';
import type { BlogPost } from '../lib/markdown';

interface ShellProps {
  posts?: BlogPost[];
  initialPost?: BlogPost;
}

export default function Shell({ posts = [], initialPost }: ShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = useMemo(() => [
    { id: '/', icon: <Terminal className="w-5 h-5" />, label: 'MAIN' },
    { id: '/blog', icon: <Book className="w-5 h-5" />, label: 'BLOG' },
    { id: '/contact', icon: <Network className="w-5 h-5" />, label: 'INFO' }
  ], []);
    
    useEffect(() => {
      navItems.forEach(({ id }) => {
        router.prefetch(id);
      });
    }, [router, navItems]);

  // Debug scroll events
  useEffect(() => {
    const handleScroll = () => {
      console.log('Scroll event detected', {
        pathname,
        currentHref: window.location.href,
        currentPath: window.location.pathname
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleNavigation = useCallback((path: string) => {
    if (path === pathname) return;
    
    // Remove references to glitch effect
    router.push(path);
  }, [pathname, router]);


   // Only render content after initial mount to prevent hydration issues
   const renderContent = () => {
if (pathname === '/' || pathname === '') {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="mb-12">
        <h2 className="text-xl md:text-2xl mb-4 font-bold">ABOUT ME</h2>
        <div className="space-y-4 opacity-90">
            <p>Hi, I am Vincent.</p>
          <p>I&apos;m an engineer from UF who spends most of his time figuring out how to make things faster and why they work at all.
            I like working across the stack -> from GPU kernels to distributed systems to compilers. If it compiles and runs fast, I&apos;m interested.</p>
          <p>Most of my work sits at the intersection of ML and systems engineering. I care about building things that actually work in production, not just on a benchmark.
            When I&apos;m not optimizing something, I&apos;m probably building it from scratch.</p>
        </div>
      </div>

      <div className="border-t border-dotted transition-colors duration-100 
        dark:border-white/20 border-black/20 pt-8 w-full" />

      {/* Research Domains */}
      <div className="mb-12">
        <h2 className="text-xl md:text-2xl mb-4 font-bold">DOMAINS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Core Research */}
          <div>
            <h3 className="text-xl mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5"/> RESEARCH
            </h3>
            <div className="space-y-2">
              <div className="border transition-colors duration-100
                dark:border-white/20 border-black/20 p-2
                dark:hover:border-white/40 hover:border-black/40">
                <span className="text-rose-400 mr-2">»</span>
                Inference Optimization
              </div>
              <div className="border transition-colors duration-100
                dark:border-white/20 border-black/20 p-2
                dark:hover:border-white/40 hover:border-black/40">
                <span className="text-rose-400 mr-2">»</span>
                Efficient Model Training
              </div>
              <div className="border transition-colors duration-100
                dark:border-white/20 border-black/20 p-2
                dark:hover:border-white/40 hover:border-black/40">
                <span className="text-rose-400 mr-2">»</span>
                ML Systems & Compilers
              </div>
            </div>
          </div>

          {/* Current Goals */}
          <div>
            <h3 className="text-xl mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5" /> BUILDING
            </h3>
            <div className="space-y-2">
              <div className="border transition-colors duration-100
                dark:border-white/20 border-black/20 p-2
                dark:hover:border-white/40 hover:border-black/40">
                <span className="text-green-400 mr-2">»</span>
                Distributed Systems
              </div>
              <div className="border transition-colors duration-100
                dark:border-white/20 border-black/20 p-2
                dark:hover:border-white/40 hover:border-black/40">
                <span className="text-green-400 mr-2">»</span>
                Full-Stack ML Applications
              </div>
              <div className="border transition-colors duration-100
                dark:border-white/20 border-black/20 p-2
                dark:hover:border-white/40 hover:border-black/40">
                <span className="text-green-400 mr-2">»</span>
                Low-Level Systems Programming
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-dotted transition-colors duration-100 
        dark:border-white/20 border-black/20 pt-8 w-full" />

      {/* Offline Mode */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl mb-4 font-bold">OFFLINE MODE</h2>
        <p className="text-sm md:text-base opacity-90">
          Beyond the terminal, I write blog posts about whatever I&apos;m nerding out on, cook food that&apos;s occasionally edible,
          and explore virtual worlds where the physics engine is more forgiving than real life. You can find my thoughts on my blog or follow
          what I&apos;m building on <a href='https://github.com/imvinlin'><u>GitHub</u></a>.
        </p>
      </div>
    </div>
  );
}
    // Blog pages
    if (pathname === '/blog' || pathname === '/blog/') {
      return <Blog posts={posts} />;
  }
    
    if (pathname.startsWith('/blog/')) {
      if (initialPost) {
        return (
          <article className="prose dark:prose-invert max-w-none">
            {initialPost.toc && initialPost.tocItems.length > 0 && (
              <nav className="not-prose mb-8 border transition-colors duration-100 dark:border-white/20 border-black/20 p-6">
                <h2 className="text-lg font-bold mb-3">TABLE OF CONTENTS</h2>
                <ul className="space-y-1">
                  {initialPost.tocItems.map((item) => (
                    <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 1}rem` }}>
                      <a href={`#${item.id}`} className="opacity-70 hover:opacity-100 transition-opacity duration-100 text-sm font-mono">
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <div
              dangerouslySetInnerHTML={{ __html: initialPost.content }}
              className="math-content"
            />
            <style jsx global>{`
              .math-block {
                @apply my-4 overflow-x-auto;
              }
              .MathJax {
                @apply dark:text-white text-black;
              }
            `}</style>
          </article>
        );
      }
    }
    
    // Contact Page
    if (pathname === '/contact' || pathname === '/contact/') {
      return <Contact />;
    }

  };

  return (
    <div className="min-h-screen transition-colors duration-100
        dark:bg-black dark:text-white
        bg-white text-black
        font-mono p-2 md:p-4 max-w-4xl mx-auto">
        
      {/* Header */}
      <header className="border transition-colors duration-100 dark:border-white border-black p-4 md:p-6 mb-6 md:mb-8 relative group">
        <div className="flex items-start justify-between">
          <div className="transition-all duration-100">
            <h1 className="text-2xl md:text-4xl mb-2 font-bold relative">
              <span className="opacity-90 absolute -left-1 top-px text-rose-400">林</span>
              <span className="opacity-90 absolute left-1 -top-px text-emerald-400">林</span>
              林 / VINCENT LIN
            </h1>
            <p className="text-sm md:text-base opacity-90">
              BUILDER
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Navigation */}
       <nav className="grid grid-cols-3 gap-4 mb-8">
                {navItems.map(({id, icon, label}) => (
                    <button
                        key={id}
                        onClick={() => handleNavigation(id)}
                        className={`border transition-all duration-100
                            dark:border-white border-black p-4 
                            flex items-center justify-center gap-2 relative group
                            ${pathname === id || (id === '/' && pathname === '') 
                                ? 'dark:bg-white dark:text-black bg-black text-white' 
                                : ''}
                            dark:hover:bg-white dark:hover:text-black
                            hover:bg-black hover:text-white`}
                    >
              <div className="relative">
                <div className="opacity-80 absolute -left-0.5 -top-0.5 text-rose-400 pointer-events-none
                  group-hover:translate-x-1 transition-transform duration-100">
                  {icon}
                </div>
                <div className="opacity-80 absolute -left-0.5 top-0.5 text-emerald-400 pointer-events-none 
                  group-hover:-translate-x-1 transition-transform duration-100">
                  {icon}
                </div>
                {icon}
              </div>
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </nav>

      {/* Main Content Container */}
      <main className="border transition-colors duration-100 dark:border-white border-black">
          <div className="p-4 md:p-6">
              {renderContent()}
          </div>
      </main>

      <footer className="p-4 mt-8 opacity-70 hover:opacity-100 transition-opacity duration-100">
        <p className="text-center">© 2026 Vincent Lin</p>
      </footer>
    </div>
  );
}
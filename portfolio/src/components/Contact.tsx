import React from 'react';
import { Twitter, Github, Linkedin } from 'lucide-react';
import ResumeViewer from './ResumeViewer';

const Contact = () => {
  const contactItems = [
    { icon: <Github className="w-5 h-5" />, label: 'GitHub', value: 'imvinlin', link: 'https://github.com/imvinlin' },
    { icon: <Linkedin className="w-5 h-5" />, label: 'LinkedIn', value: 'vincent-lin-uf', link: 'https://www.linkedin.com/in/vincent-lin-uf/' },
    { icon: <Twitter className="w-5 h-5" />, label: 'Twitter', value: '@imvinlin', link: 'https://x.com/imvinlin' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Contact Header */}
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">INFO</h2>
      </div>

      {/* Contact Grid - Clean Version */}
      <div className="space-y-4">
        {contactItems.map((item) => (
          <div 
            key={item.label}
            className="border transition-colors duration-100 dark:border-white border-black p-6 relative group hover:bg-black/5 dark:hover:bg-white/5"
          >
            <div className="flex items-center gap-6">
              <div className="w-5 flex-shrink-0">
                {item.icon}
              </div>

              <div className="flex flex-col">
                <p className="text-sm opacity-70 mb-1">{item.label}</p>
                {item.link ? (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors duration-100 font-mono"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="font-mono">
                    {item.value}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* About Section */}
      <div className="border transition-colors duration-100 dark:border-white border-black">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">GET IN TOUCH</h2>
          <p className="font-mono opacity-80">
            Feel free to reach out if you want to build something together,
            talk shop about systems and ML, or just say hi. I&apos;m always
            down to connect with other engineers and builders.
          </p>
        </div>
      </div>
      {/* Resume */}
      <ResumeViewer />
    </div>
  );
};

export default Contact;
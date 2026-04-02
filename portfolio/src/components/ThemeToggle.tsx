'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const isDark = theme === 'dark';

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  return (
    <button
      onClick={handleToggle}
      className="relative h-16 w-6 overflow-visible"
    >
      {/* Rose glitch - slides to active icon */}
      <div className={`absolute left-0 transition-all duration-500 ease-in-out text-rose-400 opacity-80
        ${isDark ? 'top-[2.75rem]' : 'top-0'}
        ${isAnimating ? '-translate-x-1.5' : '-translate-x-0.5'}
        ${isAnimating ? '-translate-y-0.5' : '-translate-y-0.5'}`}
      >
        {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </div>

      {/* Emerald glitch - slides to active icon */}
      <div className={`absolute left-0 transition-all duration-500 ease-in-out text-emerald-400 opacity-80
        ${isDark ? 'top-[2.75rem]' : 'top-0'}
        ${isAnimating ? 'translate-x-1.5' : '-translate-x-0.5'}
        ${isAnimating ? 'translate-y-0.5' : 'translate-y-0.5'}`}
      >
        {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </div>

      {/* Sun (top) */}
      <div className={`absolute left-0 top-0 z-10 transition-opacity duration-300
        ${isDark ? 'opacity-40' : 'opacity-100'}`}>
        <Sun className="w-5 h-5" />
      </div>

      {/* Moon (bottom) */}
      <div className={`absolute left-0 top-[2.75rem] z-10 transition-opacity duration-300
        ${isDark ? 'opacity-100' : 'opacity-40'}`}>
        <Moon className="w-5 h-5" />
      </div>
    </button>
  );
};

export default ThemeToggle;

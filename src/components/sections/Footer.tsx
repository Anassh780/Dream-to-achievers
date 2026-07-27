import React, { useState, useEffect } from 'react';
import { ArrowUp, TrendUp } from '@phosphor-icons/react';

export const Footer: React.FC = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-8 bg-[#07090e] border-t border-white/10 text-xs font-mono text-slate-400">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center space-x-3">
          <TrendUp size={16} className="text-[#00f0ff]" />
          <p>© {new Date().getFullYear()} Vanguard Growth Agency. All Rights Reserved. Engineered with Anti-Slop UI.</p>
        </div>

        {/* Local Time Display */}
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Agency Operations Desk:</span>
          <span className="font-bold text-[#00f0ff]">{time || '00:00:00'}</span>
        </div>

        {/* Back to Top */}
        <button
          onClick={scrollToTop}
          className="flex items-center space-x-1.5 text-slate-400 hover:text-[#00f0ff] transition-colors cursor-pointer"
        >
          <span>Back to top</span>
          <ArrowUp size={14} />
        </button>
      </div>
    </footer>
  );
};

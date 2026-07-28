import React, { useState, useEffect } from 'react';
import { ArrowUp, TrendUp, WhatsappLogo } from '@phosphor-icons/react';

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
    <footer className="py-8 bg-[#07090e] border-t border-white/10 text-xs font-mono text-slate-400 space-y-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center space-x-3">
          <TrendUp size={16} className="text-[#00f0ff]" />
          <p>© {new Date().getFullYear()} Faria Imran. All Rights Reserved. Vanguard Growth Portfolio.</p>
        </div>

        {/* Local Time & WhatsApp Contact */}
        <div className="flex items-center space-x-4 text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Operations Desk:</span>
            <span className="font-bold text-[#00f0ff]">{time || '00:00:00'}</span>
          </div>
          <span className="text-slate-600">|</span>
          <a
            href="https://wa.me/923054511395?text=Hi%20Faria,%20I%20would%20like%20to%20discuss%20a%20growth%20collaboration%20for%20my%20brand."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-bold"
          >
            <WhatsappLogo size={15} weight="fill" />
            <span>WhatsApp</span>
          </a>
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

      {/* Prominent Center Credit Bar */}
      <div className="pt-4 border-t border-white/5 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-mono text-slate-200 shadow-lg">
          <span>Made with</span>
          <span className="text-red-500 text-base animate-pulse">❤️</span>
          <span>by</span>
          <span className="text-[#00f0ff] font-bold tracking-wide">Anas</span>
        </div>
      </div>
    </footer>
  );
};

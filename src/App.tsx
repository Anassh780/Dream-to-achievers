import React, { useState } from 'react';
import { Navbar } from '@/components/sections/Navbar';
import { Hero } from '@/components/sections/Hero';
import { OwnerProfile } from '@/components/sections/OwnerProfile';
import { BentoWork } from '@/components/sections/BentoWork';
import { TechStack } from '@/components/sections/TechStack';
import { Experience } from '@/components/sections/Experience';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';
import { TargetCursor } from '@/components/ui/TargetCursor';
import { Target } from '@phosphor-icons/react';

export const App: React.FC = () => {
  const [targetCursorEnabled, setTargetCursorEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col selection:bg-[#00f0ff]/30 selection:text-white">
      {/* Target Cursor Component */}
      <TargetCursor
        enabled={targetCursorEnabled}
        cursorColor="#00f0ff"
        cursorColorOnTarget="#00f0ff"
        spinDuration={2.5}
        hoverDuration={0.2}
        parallaxOn={true}
      />

      {/* Navigation Bar */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-grow">
        <Hero />
        <OwnerProfile />
        <BentoWork />
        <TechStack />
        <Experience />
        <Contact />
      </main>

      {/* Floating Target Cursor Mode Toggle Pill */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setTargetCursorEnabled(!targetCursorEnabled)}
          className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-full text-xs font-mono font-bold backdrop-blur-xl border transition-all duration-300 shadow-xl cursor-target cursor-pointer ${
            targetCursorEnabled
              ? 'bg-[#00f0ff]/15 border-[#00f0ff]/50 text-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.25)]'
              : 'bg-[#0e1422]/80 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
          }`}
          title="Toggle Target Cursor vs Default Cursor"
        >
          <Target size={16} weight={targetCursorEnabled ? 'bold' : 'regular'} className={targetCursorEnabled ? 'animate-spin' : ''} style={{ animationDuration: '6s' }} />
          <span>Cursor: {targetCursorEnabled ? 'Target Locked' : 'Default'}</span>
          <span className={`w-2 h-2 rounded-full ${targetCursorEnabled ? 'bg-[#00f0ff] animate-pulse' : 'bg-slate-500'}`} />
        </button>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;

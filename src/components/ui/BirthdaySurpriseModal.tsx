import React, { useState, useEffect, useRef } from 'react';
import { Gift, Sparkle, X, Heart, Rocket, Trophy, Globe } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  decay: number;
  gravity: number;
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
}

// Global Online Counter Endpoint (Shared globally across all PCs & devices)
const GLOBAL_COUNTER_NAMESPACE = 'faria_imran_bday_online_counter_2026';
const GET_COUNTER_URL = `https://api.counterapi.dev/v1/${GLOBAL_COUNTER_NAMESPACE}/opens`;
const INCREMENT_COUNTER_URL = `https://api.counterapi.dev/v1/${GLOBAL_COUNTER_NAMESPACE}/opens/up`;

export const BirthdaySurpriseModal: React.FC = () => {
  const [globalCount, setGlobalCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isGiftOpened, setIsGiftOpened] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Check global online count on component mount across all PCs/devices
  useEffect(() => {
    let isMounted = true;

    // Check for developer reset override in query string (?reset_bday=1)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset_bday') === '1') {
      try {
        localStorage.removeItem('faria_bday_completed');
      } catch (e) {}
    }

    const checkGlobalCount = async () => {
      try {
        // Fast local completed check fallback
        if (localStorage.getItem('faria_bday_completed') === 'true') {
          if (isMounted) setIsOpen(false);
          setIsLoading(false);
          return;
        }

        const res = await fetch(GET_COUNTER_URL);
        const data = await res.json();
        
        const count = data && typeof data.count === 'number' ? data.count : 0;
        
        if (isMounted) {
          setGlobalCount(count);
          // Global Auto-Destruct: If 2 or more opens occurred globally online, auto-destruct!
          if (count >= 2) {
            setIsOpen(false);
            try {
              localStorage.setItem('faria_bday_completed', 'true');
            } catch (e) {}
          } else {
            setIsOpen(true);
          }
        }
      } catch (err) {
        // Fallback: If network fails, default to opening for first 2 views
        if (isMounted) setIsOpen(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkGlobalCount();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fireworks Animation Engine
  useEffect(() => {
    if (!isGiftOpened || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvasRef.current) return;
      width = canvasRef.current.width = window.innerWidth;
      height = canvasRef.current.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#00f0ff', '#ff2a85', '#fbbf24', '#34d399', '#a855f7', '#38bdf8', '#f43f5e'];
    const fireworks: Firework[] = [];
    const particles: Particle[] = [];

    const createFirework = () => {
      const x = Math.random() * (width - 200) + 100;
      const targetY = Math.random() * (height * 0.5) + 80;
      const color = colors[Math.floor(Math.random() * colors.length)];
      fireworks.push({
        x,
        y: height,
        targetY,
        vy: -(Math.random() * 4 + 7),
        color,
        exploded: false,
      });
    };

    const explode = (x: number, y: number, color: string) => {
      const count = 75;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
        const speed = Math.random() * 6.5 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          radius: Math.random() * 2.5 + 1,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.008,
          gravity: 0.08,
        });
      }
    };

    // Launch initial burst of fireworks
    for (let i = 0; i < 6; i++) {
      setTimeout(createFirework, i * 250);
    }

    const interval = setInterval(createFirework, 500);

    const render = () => {
      ctx.fillStyle = 'rgba(8, 11, 17, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Update Fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        fw.y += fw.vy;

        ctx.beginPath();
        ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = fw.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = fw.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (fw.y <= fw.targetY) {
          explode(fw.x, fw.y, fw.color);
          fireworks.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isGiftOpened]);

  // Handle Unwrap Gift Action: Increment Global Online Counter & Show Fireworks
  const handleOpenGift = async () => {
    setIsGiftOpened(true);
    try {
      // Increment global online counter on server
      const res = await fetch(INCREMENT_COUNTER_URL);
      const data = await res.json();
      const updatedCount = data && typeof data.count === 'number' ? data.count : globalCount + 1;
      setGlobalCount(updatedCount);

      if (updatedCount >= 2) {
        localStorage.setItem('faria_bday_completed', 'true');
      }
    } catch (e) {
      // Fallback
      setGlobalCount((prev) => prev + 1);
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  // If loading or destroyed globally, render nothing
  if (isLoading || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#080b11]/95 backdrop-blur-3xl animate-in fade-in duration-500">
      
      {/* Real Fireworks HTML5 Canvas */}
      {isGiftOpened && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-0"
        />
      )}

      <div className="relative z-10 max-w-xl w-full text-center space-y-6 p-8 rounded-[2.5rem] bg-[#0c111d]/90 border border-white/15 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,240,255,0.25)] overflow-hidden">
        
        {/* Ambient Radial Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#00f0ff]/20 via-[#ff2a85]/20 to-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Global Online Counter Badge */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-white/10">
          <span className="flex items-center space-x-1.5 text-[#00f0ff] font-semibold">
            <Globe size={14} className="animate-pulse" />
            <span>Global Online Trail #{globalCount + 1} of 2</span>
          </span>
          <span className="text-[11px] text-slate-400 font-bold bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
            {globalCount === 0 ? 'Trail 1: Developer Check' : 'Trail 2: Faria Birthday Surprise'}
          </span>
        </div>

        {!isGiftOpened ? (
          /* GIFT COVER PHASE */
          <div className="space-y-7 py-4">
            
            {/* Animated Wrapped Gift Box Graphic */}
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#00f0ff] via-[#ff2a85] to-amber-400 animate-pulse blur-xl opacity-60" />
              <div
                className="relative w-28 h-28 rounded-3xl bg-[#0e1424] border border-white/20 shadow-2xl flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform"
                onClick={handleOpenGift}
              >
                <Gift size={56} className="text-[#00f0ff] group-hover:rotate-12 transition-transform duration-300" weight="fill" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#ff2a85] text-white flex items-center justify-center text-xs font-bold shadow-lg animate-bounce">
                  ✨
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                Special Birthday Gift for <span className="text-gradient-cyan">Faria Imran</span> 🎂
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                A personalized birthday surprise has been prepared for you online. Tap the gift below to unwrap your fireworks celebration!
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleOpenGift}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold shadow-[0_0_30px_rgba(0,240,255,0.4)]"
              iconLeft={<Gift size={20} weight="fill" />}
            >
              Unwrap Birthday Gift 🎉
            </Button>
          </div>
        ) : (
          /* FIREWORKS & CELEBRATION PHASE */
          <div className="space-y-6 py-2 animate-in zoom-in-95 duration-500">
            
            {/* Celebration Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00f0ff]/20 to-[#ff2a85]/20 border border-[#00f0ff]/40 flex items-center justify-center mx-auto text-[#00f0ff] shadow-xl">
              <Sparkle size={36} weight="fill" className="animate-bounce text-[#ff2a85]" />
            </div>

            {/* Main Greeting */}
            <div className="space-y-3">
              <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#ff2a85]/15 border border-[#ff2a85]/40 text-xs font-mono text-[#ff2a85] font-bold">
                <Heart size={14} weight="fill" /> HAPPY BIRTHDAY FARIA!
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight leading-tight">
                Happy Birthday to You, <span className="text-gradient-cyan">Faria!</span> 🎂✨
              </h2>
              <p className="text-sm sm:text-base text-slate-200 max-w-md mx-auto leading-relaxed pt-1">
                May your day be filled with boundless joy, laughter, and incredible success! Here's to another extraordinary year of scaling heights and breaking records! 🚀🎉
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleCloseModal}
                className="w-full sm:w-auto font-bold"
                iconRight={<Rocket size={16} weight="bold" />}
              >
                Enter Portfolio Website
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

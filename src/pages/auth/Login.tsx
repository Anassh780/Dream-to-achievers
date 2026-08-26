import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { DreamLogo } from '@/components/ui/DreamLogo';
import {
  EnvelopeSimple,
  Lock,
  Eye,
  EyeSlash,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  Sparkle,
} from '@phosphor-icons/react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your partner email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Failed to sign in. Please verify your email and password.');
    }
  };

  const partnerHighlights = [
    'Instant wholesale catalog access with +PKR 500/unit gross profit',
    'Milestone cash bonuses up to PKR 10,000 (Level 01 to Level 04)',
    'Automated referral tracking & real-time sales performance ledgers',
  ];

  return (
    <div className="min-h-[85vh] bg-[#020612] text-[#F8FAFC] flex items-center justify-center px-4 sm:px-6 py-20 sm:py-24 font-sans selection:bg-cyan-500/30">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Brand Story & Trust Perks */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-6">
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <DreamLogo size={36} />
            </Link>
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-extrabold text-white tracking-tight">
                Welcome back to your partner terminal.
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Access wholesale product margins, submit customer orders, and track your milestone bonuses in real time.
              </p>
            </div>

            {/* Feature Perks */}
            <div className="space-y-2.5 pt-2">
              {partnerHighlights.map((perk, i) => (
                <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-300">
                  <CheckCircle size={15} weight="fill" className="text-cyan-400 shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#060B18] border border-white/[0.08] flex items-center space-x-3 text-xs text-cyan-300">
            <ShieldCheck size={18} weight="fill" className="text-cyan-400 shrink-0" />
            <span className="text-[11px] font-mono">256-Bit Encrypted Partner Session</span>
          </div>
        </div>

        {/* Right Column: Sign In Card */}
        <div className="lg:col-span-7">
          <div className="p-7 sm:p-9 rounded-3xl bg-[#060B18] border border-white/[0.08] shadow-2xl space-y-6">
            <div className="space-y-1 pb-2 border-b border-white/[0.08]">
              <div className="lg:hidden pb-3">
                <DreamLogo size={28} />
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-white">Partner Authentication</h3>
              <p className="text-xs text-slate-400">Enter your credentials to enter your workspace.</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold animate-in fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Registered Email</label>
                <div className="relative">
                  <EnvelopeSimple size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-semibold">Password</label>
                  <Link to="/forgot-password" className="text-[11px] font-mono text-cyan-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                size="md"
                className="w-full justify-center rounded-xl font-bold text-xs shadow-lg mt-2"
                iconRight={<ArrowRight size={14} weight="bold" />}
              >
                {loading ? 'Authenticating...' : 'Enter Partner Terminal'}
              </Button>
            </form>

            <div className="text-center pt-2 border-t border-white/[0.08] text-xs text-slate-400">
              <span>New to DreamToAchievers? </span>
              <Link to="/signup" className="text-cyan-300 hover:underline font-bold">
                Create Free Partner Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

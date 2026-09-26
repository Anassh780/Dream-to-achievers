import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { Loader } from '@/components/ui/Loader';
import {
  EnvelopeSimple,
  Lock,
  Eye,
  EyeSlash,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from '@phosphor-icons/react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaderSubtitle, setLoaderSubtitle] = useState('Verifying partner credentials & ledger access...');
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
    setLoaderSubtitle('Verifying partner credentials...');

    setTimeout(() => {
      setLoaderSubtitle('Synchronizing wholesale catalog & margin ledger...');
    }, 600);

    // Smooth interactive pause for real feel
    await new Promise((r) => setTimeout(r, 1200));

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
    <div className="min-h-[85vh] bg-[var(--bg)] text-[var(--ink)] flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-14 font-sans selection:bg-[var(--accent)]/25 relative">
      {/* Back to Home Quick Bar */}
      <div className="w-full max-w-4xl pb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#9EABA2] hover:text-[#D9C08A] transition-colors py-1.5 px-3 rounded-xl bg-[#0D1512]/80 border border-white/10 shadow-sm"
        >
          <ArrowLeft size={13} />
          <span>Back to Home</span>
        </Link>
        <span className="text-[11px] font-mono text-[#9EABA2]">Dream to Achievers Network</span>
      </div>

      {/* Fullscreen Smooth Animated Loader */}
      {loading && (
        <Loader
          fullScreen
          title="Authenticating Partner Session"
          subtitle={loaderSubtitle}
          size="md"
        />
      )}

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Brand Story & Trust Perks */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-6">
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <DreamLogo size={38} />
            </Link>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#F4F7F5] tracking-tight leading-tight">
                Welcome back to your partner terminal.
              </h2>
              <p className="text-xs text-[#9EABA2] leading-relaxed">
                Access wholesale product margins, submit customer orders, and track your milestone bonuses in real time.
              </p>
            </div>

            {/* Feature Perks */}
            <div className="space-y-3 pt-2">
              {partnerHighlights.map((perk, i) => (
                <div key={i} className="flex items-start space-x-2.5 text-xs text-[#9EABA2]">
                  <CheckCircle size={15} weight="bold" className="text-[#34D399] shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1512]/80 border border-white/10 flex items-center space-x-3 text-xs text-[#34D399] shadow-md">
            <ShieldCheck size={18} weight="bold" className="text-[#34D399] shrink-0" />
            <span className="text-[11px] font-mono">256-Bit Encrypted Partner Session</span>
          </div>
        </div>

        {/* Right Column: Sign In Card */}
        <div className="lg:col-span-7">
          <div className="p-7 sm:p-9 rounded-3xl bg-[#0D1512]/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(217,192,138,0.06)] space-y-6">
            <div className="space-y-1.5 pb-3 border-b border-white/10">
              <div className="lg:hidden pb-3">
                <DreamLogo size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-normal text-[#F4F7F5]">Partner Authentication</h3>
              <p className="text-xs text-[#9EABA2]">Enter your credentials to enter your workspace.</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium animate-in fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[#9EABA2] font-medium">Registered Email</label>
                <div className="relative">
                  <EnvelopeSimple size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9EABA2]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#070B09]/90 border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/50 text-xs focus:outline-none focus:border-[#D9C08A] font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[#9EABA2] font-medium">Password</label>
                  <Link to="/forgot-password" className="text-[11px] font-mono text-[#D9C08A] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9EABA2]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#070B09]/90 border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/50 text-xs focus:outline-none focus:border-[#D9C08A] font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9EABA2] hover:text-[#F4F7F5]"
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="champagne"
                size="md"
                className="w-full justify-center font-medium text-xs shadow-lg mt-2"
                iconRight={<ArrowRight size={14} />}
              >
                {loading ? 'Authenticating...' : 'Enter Partner Terminal'}
              </Button>
            </form>

            <div className="text-center pt-3 border-t border-white/10 text-xs text-[#9EABA2]">
              <span>New to Dream to Achievers? </span>
              <Link to="/signup" className="text-[#D9C08A] hover:underline font-medium">
                Create Free Partner Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

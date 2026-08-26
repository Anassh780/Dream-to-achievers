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
    <div className="min-h-[85vh] bg-[#FAF7EF] text-[#1E241F] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 font-sans selection:bg-[#B8862E]/25 relative">
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
              <h2 className="text-2xl font-display font-medium text-[#1E241F] tracking-tight leading-tight">
                Welcome back to your partner terminal.
              </h2>
              <p className="text-xs text-[#5B5C50] leading-relaxed">
                Access wholesale product margins, submit customer orders, and track your milestone bonuses in real time.
              </p>
            </div>

            {/* Feature Perks */}
            <div className="space-y-2.5 pt-2">
              {partnerHighlights.map((perk, i) => (
                <div key={i} className="flex items-start space-x-2.5 text-xs text-[#5B5C50]">
                  <CheckCircle size={15} weight="bold" className="text-[#1F4D3E] shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] flex items-center space-x-3 text-xs text-[#1F4D3E] shadow-xs">
            <ShieldCheck size={18} weight="bold" className="text-[#1F4D3E] shrink-0" />
            <span className="text-[11px] font-mono">256-Bit Encrypted Partner Session</span>
          </div>
        </div>

        {/* Right Column: Sign In Card */}
        <div className="lg:col-span-7">
          <div className="p-7 sm:p-9 rounded-xl bg-white border border-[#E3DCC8] shadow-xs space-y-6">
            <div className="space-y-1 pb-2 border-b border-[#E3DCC8]">
              <div className="lg:hidden pb-3">
                <DreamLogo size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-display font-medium text-[#1E241F]">Partner Authentication</h3>
              <p className="text-xs text-[#5B5C50]">Enter your credentials to enter your workspace.</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium animate-in fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[#5B5C50] font-medium">Registered Email</label>
                <div className="relative">
                  <EnvelopeSimple size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B5C50]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] placeholder:text-[#5B5C50]/60 text-xs focus:outline-none focus:border-[#1F4D3E] font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[#5B5C50] font-medium">Password</label>
                  <Link to="/forgot-password" className="text-[11px] font-mono text-[#1F4D3E] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B5C50]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] placeholder:text-[#5B5C50]/60 text-xs focus:outline-none focus:border-[#1F4D3E] font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B5C50] hover:text-[#1E241F]"
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
                className="w-full justify-center font-medium text-xs shadow-xs mt-2"
                iconRight={<ArrowRight size={14} />}
              >
                {loading ? 'Authenticating...' : 'Enter Partner Terminal'}
              </Button>
            </form>

            <div className="text-center pt-2 border-t border-[#E3DCC8] text-xs text-[#5B5C50]">
              <span>New to DreamToAchievers? </span>
              <Link to="/signup" className="text-[#1F4D3E] hover:underline font-medium">
                Create Free Partner Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

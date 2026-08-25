import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { Button } from '@/components/ui/Button';
import {
  EnvelopeSimple,
  Lock,
  Eye,
  EyeSlash,
  CheckCircle,
  ShieldCheck,
  Sparkle,
  ArrowRight,
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
    'Milestone cash bonuses up to PKR 10,000 (Silver to Diamond)',
    'Automated referral tracking & real-time sales performance ledgers',
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 font-sans selection:bg-[#3B82F6]/30">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Brand Story & Trust Perks */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8 p-2">
          <div className="space-y-5">
            <Link to="/" className="inline-block transition-transform hover:scale-105">
              <DreamLogo size={36} />
            </Link>

            <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono font-semibold px-3 py-1 rounded-full bg-white/[0.04] text-blue-400 border border-white/[0.08] tracking-wider">
              <Sparkle size={12} weight="fill" />
              <span>PARTNER PORTAL</span>
            </div>

            <h2 className="text-3xl font-outfit font-semibold text-white tracking-tight leading-tight">
              Welcome back to your partner portal.
            </h2>

            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Track customer sales, monitor your referral network volume, and review your progress toward the next cash milestone.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/[0.06]">
            {partnerHighlights.map((perk, i) => (
              <div key={i} className="flex items-start space-x-2.5 text-xs text-white/80">
                <CheckCircle size={16} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{perk}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-[#0A0F19] border border-white/[0.06] flex items-center space-x-3 text-xs text-white/60">
            <ShieldCheck size={20} className="text-blue-400 shrink-0" />
            <span>End-to-end encrypted partner sessions</span>
          </div>
        </div>

        {/* Right Column: High-End Authentication Card */}
        <div className="lg:col-span-7">
          <div className="relative rounded-3xl bg-[#0A0F19] border border-white/[0.08] p-6 sm:p-9 shadow-2xl space-y-6">
            
            {/* Form Header */}
            <div className="space-y-1.5 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-outfit font-semibold text-white tracking-tight">
                  Sign In to Dashboard
                </h3>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                  Partner Access
                </span>
              </div>
              <p className="text-xs text-white/60">
                Enter your verified email and password to manage your sales and team.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-white/80 font-medium">Work / Partner Email</label>
                <div className="relative">
                  <EnvelopeSimple size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@domain.com"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#06090F] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-white/80 font-medium">Password</label>
                  <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors text-[11px]">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#06090F] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center rounded-xl font-semibold mt-2 group shadow-lg"
                isLoading={loading}
                iconRight={<ArrowRight size={14} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />}
              >
                Sign In to Partner Portal
              </Button>
            </form>

            {/* Bottom Link */}
            <p className="text-center text-xs text-white/50 pt-2 border-t border-white/[0.06]">
              Don't have a partner account yet?{' '}
              <Link to="/signup" className="text-blue-400 font-medium hover:text-blue-300 transition-colors underline">
                Create Free Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

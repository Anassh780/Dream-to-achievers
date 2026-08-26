import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { DreamLogo } from '@/components/ui/DreamLogo';
import {
  User,
  EnvelopeSimple,
  Lock,
  Eye,
  EyeSlash,
  Tag,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  Sparkle,
} from '@phosphor-icons/react';

export const Signup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralCode(refParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full legal name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('Please acknowledge the Partner Terms and Disclaimers to proceed.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await signup({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      referralCode: referralCode.trim() || undefined,
    });

    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Failed to create partner account. Please try again.');
    }
  };

  const partnerPerks = [
    'Zero upfront inventory investment needed to start',
    'Instant wholesale catalog with PKR 500+ unit profit margins',
    'Dual milestone qualification bonuses up to PKR 10,000',
    '24/7 direct WhatsApp support desk access',
  ];

  return (
    <div className="min-h-[85vh] bg-[#020612] text-[#F8FAFC] flex items-center justify-center px-4 sm:px-6 py-20 sm:py-24 font-sans selection:bg-cyan-500/30">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Platform Promise */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-6">
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <DreamLogo size={36} />
            </Link>
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-extrabold text-white tracking-tight">
                Join Pakistan's leading wholesale distribution ecosystem.
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect directly with vetted product suppliers, distribute high-margin inventory, and earn structured milestone bonuses.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {partnerPerks.map((perk, i) => (
                <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-300">
                  <CheckCircle size={15} weight="fill" className="text-cyan-400 shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#060B18] border border-white/[0.08] flex items-center space-x-3 text-xs text-emerald-300">
            <ShieldCheck size={18} weight="fill" className="text-emerald-400 shrink-0" />
            <span className="text-[11px] font-mono">100% Free Partner Registration</span>
          </div>
        </div>

        {/* Right Column: Sign Up Form Card */}
        <div className="lg:col-span-7">
          <div className="p-7 sm:p-9 rounded-3xl bg-[#060B18] border border-white/[0.08] shadow-2xl space-y-6">
            <div className="space-y-1 pb-2 border-b border-white/[0.08]">
              <div className="lg:hidden pb-3">
                <DreamLogo size={28} />
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-white">Create Partner Account</h3>
              <p className="text-xs text-slate-400">Unlock wholesale catalog rates and start earning today.</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold animate-in fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Faria Ahmed"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Email Address *</label>
                <div className="relative">
                  <EnvelopeSimple size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@example.com"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Confirm Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Referral Sponsor Code (Optional)</label>
                <div className="relative">
                  <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="e.g. DTA-FARIA-88"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#030712] border border-white/10 text-cyan-300 placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-all font-mono uppercase"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="termsCheck"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-400 mt-0.5"
                />
                <label htmlFor="termsCheck" className="text-slate-400 text-[11px] leading-snug cursor-pointer">
                  I agree to the <Link to="/terms" className="text-cyan-300 hover:underline font-medium">Partner Terms</Link>, <Link to="/privacy" className="text-cyan-300 hover:underline font-medium">Privacy Policy</Link>, and <Link to="/disclaimer" className="text-cyan-300 hover:underline font-medium">Earnings Disclaimers</Link>.
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                size="md"
                className="w-full justify-center rounded-xl font-bold text-xs shadow-lg mt-2"
                iconRight={<ArrowRight size={14} weight="bold" />}
              >
                {loading ? 'Creating Workspace...' : 'Complete Partner Registration'}
              </Button>
            </form>

            <div className="text-center pt-2 border-t border-white/[0.08] text-xs text-slate-400">
              <span>Already registered? </span>
              <Link to="/login" className="text-cyan-300 hover:underline font-bold">
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

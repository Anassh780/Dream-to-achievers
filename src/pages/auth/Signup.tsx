import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { Loader } from '@/components/ui/Loader';
import { storage } from '@/services/storage';
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
  ArrowLeft,
} from '@phosphor-icons/react';

export const Signup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState(
    searchParams.get('ref') || searchParams.get('r') || searchParams.get('referral') || storage.getRaw('CAPTURED_REF') || ''
  );
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaderSubtitle, setLoaderSubtitle] = useState('Registering partner identity & allocating tracking code...');

  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urlRef = searchParams.get('ref') || searchParams.get('r') || searchParams.get('referral');
    if (urlRef) {
      const clean = urlRef.trim().toUpperCase();
      setReferralCode(clean);
      storage.setRaw('CAPTURED_REF', clean);
    } else {
      const stored = storage.getRaw('CAPTURED_REF');
      if (stored) {
        setReferralCode(stored.trim().toUpperCase());
      }
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
    setLoaderSubtitle('Registering partner account & allocating unique referral code...');

    setTimeout(() => {
      setLoaderSubtitle('Initializing wholesale margin ledger & Level 01 progress...');
    }, 700);

    setTimeout(() => {
      setLoaderSubtitle('Finalizing partner terminal setup...');
    }, 1400);

    // Smooth interactive pause for real feel
    await new Promise((r) => setTimeout(r, 1800));

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
    <div className="min-h-[85vh] bg-[#FAF7EF] text-[#1E241F] flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-14 font-sans selection:bg-[#B8862E]/25 relative">
      {/* Back to Home Quick Bar */}
      <div className="w-full max-w-4xl pb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5B5C50] hover:text-[#1E241F] transition-colors py-1.5 px-3 rounded-lg bg-white border border-[#E3DCC8] shadow-2xs"
        >
          <ArrowLeft size={13} />
          <span>Back to Home</span>
        </Link>
        <span className="text-[11px] font-mono text-[#7C7D70]">DreamToAchievers Network</span>
      </div>

      {/* Fullscreen Smooth Animated Loader */}
      {loading && (
        <Loader
          fullScreen
          title="Configuring Your Partner Account"
          subtitle={loaderSubtitle}
          size="md"
        />
      )}

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Platform Promise */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-6">
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <DreamLogo size={38} />
            </Link>
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-medium text-[#1E241F] tracking-tight leading-tight">
                Join Pakistan's leading wholesale distribution ecosystem.
              </h2>
              <p className="text-xs text-[#5B5C50] leading-relaxed">
                Connect directly with vetted product suppliers, distribute high-margin inventory, and earn structured milestone bonuses.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {partnerPerks.map((perk, i) => (
                <div key={i} className="flex items-start space-x-2.5 text-xs text-[#5B5C50]">
                  <CheckCircle size={15} weight="bold" className="text-[#1F4D3E] shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] flex items-center space-x-3 text-xs text-[#1F4D3E] shadow-xs">
            <ShieldCheck size={18} weight="bold" className="text-[#1F4D3E] shrink-0" />
            <span className="text-[11px] font-mono">100% Free Partner Registration</span>
          </div>
        </div>

        {/* Right Column: Sign Up Form Card */}
        <div className="lg:col-span-7">
          <div className="p-7 sm:p-9 rounded-xl bg-white border border-[#E3DCC8] shadow-xs space-y-6">
            <div className="space-y-1 pb-2 border-b border-[#E3DCC8]">
              <div className="lg:hidden pb-3">
                <DreamLogo size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-display font-medium text-[#1E241F]">Create Partner Account</h3>
              <p className="text-xs text-[#5B5C50]">Unlock wholesale catalog rates and start earning today.</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium animate-in fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block text-[#5B5C50] font-medium">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B5C50]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Faria Ahmed"
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] placeholder:text-[#5B5C50]/60 text-xs focus:outline-none focus:border-[#1F4D3E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[#5B5C50] font-medium">Email Address *</label>
                <div className="relative">
                  <EnvelopeSimple size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B5C50]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@example.com"
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] placeholder:text-[#5B5C50]/60 text-xs focus:outline-none focus:border-[#1F4D3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[#5B5C50] font-medium">Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B5C50]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] placeholder:text-[#5B5C50]/60 text-xs focus:outline-none focus:border-[#1F4D3E]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[#5B5C50] font-medium">Confirm Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B5C50]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] placeholder:text-[#5B5C50]/60 text-xs focus:outline-none focus:border-[#1F4D3E]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[#5B5C50] font-medium">Referral Sponsor Code (Optional)</label>
                <div className="relative">
                  <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B5C50]" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="e.g. DTA-FARIA-88"
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] placeholder:text-[#5B5C50]/60 text-xs focus:outline-none focus:border-[#1F4D3E] font-mono uppercase"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="termsCheck"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#1F4D3E] mt-0.5"
                />
                <label htmlFor="termsCheck" className="text-[#5B5C50] text-[11px] leading-snug cursor-pointer">
                  I agree to the <Link to="/terms" className="text-[#1F4D3E] hover:underline font-medium">Partner Terms</Link>, <Link to="/privacy" className="text-[#1F4D3E] hover:underline font-medium">Privacy Policy</Link>, and <Link to="/disclaimer" className="text-[#1F4D3E] hover:underline font-medium">Earnings Disclaimers</Link>.
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                size="md"
                className="w-full justify-center font-medium text-xs shadow-xs mt-2"
                iconRight={<ArrowRight size={14} />}
              >
                {loading ? 'Configuring Account...' : 'Complete Partner Registration'}
              </Button>
            </form>

            <div className="text-center pt-2 border-t border-[#E3DCC8] text-xs text-[#5B5C50]">
              <span>Already registered? </span>
              <Link to="/login" className="text-[#1F4D3E] hover:underline font-medium">
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

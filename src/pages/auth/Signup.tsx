import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { referralService } from '@/services/referralService';
import { Button } from '@/components/ui/Button';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { Loader } from '@/components/ui/Loader';
import { storage } from '@/services/storage';
import { User as UserType } from '@/types';
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
  Check,
  WarningCircle,
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
  const [verifiedSponsor, setVerifiedSponsor] = useState<UserType | null>(null);
  const [validatingSponsor, setValidatingSponsor] = useState(false);
  const [referralError, setReferralError] = useState('');
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

  useEffect(() => {
    if (!referralCode.trim()) {
      setVerifiedSponsor(null);
      setReferralError('');
      return;
    }
    const timer = setTimeout(async () => {
      setValidatingSponsor(true);
      setReferralError('');
      try {
        const res = await referralService.validateReferralCode(referralCode.trim());
        if (res.valid && res.referrer) {
          setVerifiedSponsor(res.referrer);
          setReferralError('');
        } else {
          setVerifiedSponsor(null);
          setReferralError(`Sponsor code "${referralCode.trim().toUpperCase()}" does not exist in our database.`);
        }
      } catch {
        setVerifiedSponsor(null);
        setReferralError(`Could not verify sponsor code "${referralCode.trim().toUpperCase()}".`);
      } finally {
        setValidatingSponsor(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [referralCode]);

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

    // Strict validation: if referral code is provided, sponsor MUST exist
    if (referralCode.trim() && !verifiedSponsor) {
      setError(`The referral code "${referralCode.trim().toUpperCase()}" is invalid or does not exist. Please enter a valid sponsor code or clear the field.`);
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
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#F4F7F5] tracking-tight leading-tight">
                Join Pakistan&apos;s leading wholesale distribution ecosystem.
              </h2>
              <p className="text-xs text-[#9EABA2] leading-relaxed">
                Connect directly with vetted product suppliers, distribute high-margin inventory, and earn structured milestone bonuses.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {partnerPerks.map((perk, i) => (
                <div key={i} className="flex items-start space-x-2.5 text-xs text-[#9EABA2]">
                  <CheckCircle size={15} weight="bold" className="text-[#34D399] shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1512]/80 border border-white/10 flex items-center space-x-3 text-xs text-[#34D399] shadow-md">
            <ShieldCheck size={18} weight="bold" className="text-[#34D399] shrink-0" />
            <span className="text-[11px] font-mono">100% Free Partner Registration</span>
          </div>
        </div>

        {/* Right Column: Sign Up Form Card */}
        <div className="lg:col-span-7">
          <div className="p-7 sm:p-9 rounded-3xl bg-[#0D1512]/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(217,192,138,0.06)] space-y-6">
            <div className="space-y-1.5 pb-3 border-b border-white/10">
              <div className="lg:hidden pb-3">
                <DreamLogo size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-normal text-[#F4F7F5]">Create Partner Account</h3>
              <p className="text-xs text-[#9EABA2]">Unlock wholesale catalog rates and start earning today.</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium animate-in fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block text-[#9EABA2] font-medium">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9EABA2]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Faria Ahmed"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#070B09]/90 border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/50 text-xs focus:outline-none focus:border-[#D9C08A] font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[#9EABA2] font-medium">Email Address *</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[#9EABA2] font-medium">Password *</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="text-[10px] font-mono text-[#D9C08A] hover:underline cursor-pointer"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9EABA2]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#070B09]/90 border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/50 text-xs focus:outline-none focus:border-[#D9C08A] font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[#9EABA2] font-medium">Confirm Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9EABA2]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#070B09]/90 border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/50 text-xs focus:outline-none focus:border-[#D9C08A] font-sans"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[#9EABA2] font-medium">Referral Sponsor Code (Optional)</label>
                  {validatingSponsor && (
                    <span className="text-[10px] font-mono text-[#D9C08A]">Checking sponsor...</span>
                  )}
                </div>
                <div className="relative">
                  <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9EABA2]" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="e.g. DTA-FARIA-88"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#070B09]/90 border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/50 text-xs focus:outline-none focus:border-[#D9C08A] font-mono uppercase"
                  />
                </div>
                {verifiedSponsor && (
                  <div className="p-3 rounded-xl bg-[#34D399]/10 border border-[#34D399]/30 flex items-center justify-between text-xs text-[#34D399] animate-in fade-in">
                    <div className="flex items-center space-x-2 truncate">
                      <CheckCircle size={16} weight="fill" className="text-[#34D399] shrink-0" />
                      <span className="truncate text-[#F4F7F5]">
                        Referred by: <strong className="text-[#34D399]">{verifiedSponsor.fullName}</strong> <span className="font-mono text-xs opacity-75">({verifiedSponsor.referralCode})</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#34D399]/20 text-[#34D399] font-bold shrink-0 border border-[#34D399]/30">
                      Verified Sponsor
                    </span>
                  </div>
                )}
                {!verifiedSponsor && referralError && !validatingSponsor && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center space-x-2 text-xs text-rose-400 animate-in fade-in">
                    <WarningCircle size={16} weight="fill" className="text-rose-400 shrink-0" />
                    <span>{referralError}</span>
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-2.5 pt-1">
                <input
                  type="checkbox"
                  id="termsCheck"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#D9C08A] mt-0.5 cursor-pointer"
                />
                <label htmlFor="termsCheck" className="text-[#9EABA2] text-[11px] leading-snug cursor-pointer select-none">
                  I agree to the <Link to="/terms" className="text-[#D9C08A] hover:underline font-medium">Partner Terms</Link>, <Link to="/privacy" className="text-[#D9C08A] hover:underline font-medium">Privacy Policy</Link>, and <Link to="/disclaimer" className="text-[#D9C08A] hover:underline font-medium">Earnings Disclaimers</Link>.
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="champagne"
                size="md"
                className="w-full justify-center font-medium text-xs shadow-lg mt-2"
                iconRight={<ArrowRight size={14} />}
              >
                {loading ? 'Configuring Account...' : 'Complete Partner Registration'}
              </Button>
            </form>

            <div className="text-center pt-3 border-t border-white/10 text-xs text-[#9EABA2]">
              <span>Already registered? </span>
              <Link to="/login" className="text-[#D9C08A] hover:underline font-medium">
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

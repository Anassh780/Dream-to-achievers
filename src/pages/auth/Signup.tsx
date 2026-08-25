import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { referralService } from '@/services/referralService';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { Button } from '@/components/ui/Button';
import {
  User,
  EnvelopeSimple,
  Lock,
  Eye,
  EyeSlash,
  TreeStructure,
  Phone,
  MapPin,
  CheckCircle,
  ShieldCheck,
  Sparkle,
  ArrowRight,
  Gift,
} from '@phosphor-icons/react';

export const Signup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const refParam = searchParams.get('ref') || referralService.captureFromUrl();
    if (refParam) {
      setReferralCode(refParam.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the partner terms and conditions.');
      return;
    }
    setError('');
    setLoading(true);

    const res = await signup({
      fullName,
      email,
      password,
      referralCode: referralCode.trim() || undefined,
      phone,
      city,
    });
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Failed to create partner account. Please verify your details.');
    }
  };

  const partnerPerks = [
    'Direct wholesale catalog access with +PKR 500/unit profit margin',
    'Tier milestone cash rewards up to PKR 10,000 (Silver to Diamond)',
    'Automated referral tracking links & personal analytics portal',
    'Full nationwide delivery & logistics support for your customers',
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 font-sans selection:bg-cyan-500/30">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Brand Story & Milestone Perks */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8 p-2">
          <div className="space-y-5">
            <Link to="/" className="inline-block transition-transform hover:scale-105">
              <DreamLogo size={36} />
            </Link>

            <div className="inline-flex items-center space-x-1.5 text-[10px] font-mono font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 tracking-wider shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <Sparkle size={12} weight="fill" className="text-cyan-400" />
              <span>PARTNER REGISTRATION</span>
            </div>

            <h2 className="text-3xl font-outfit font-bold text-white tracking-tight leading-tight">
              Begin your journey from Silver to Diamond Rank.
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join active partners across Pakistan selling verified products, earning direct margins, and unlocking guaranteed milestone rewards.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/[0.08]">
            {partnerPerks.map((perk, i) => (
              <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-200">
                <CheckCircle size={16} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{perk}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-[#080E1E] border border-white/[0.08] flex items-center space-x-3 text-xs">
            <Gift size={22} className="text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-white">Stage 01: Silver Milestone</p>
              <p className="text-[11px] text-slate-400">10 Sales + 20 Members = PKR 2,000 Cash Bonus</p>
            </div>
          </div>
        </div>

        {/* Right Column: High-End Registration Card */}
        <div className="lg:col-span-7">
          <div className="relative rounded-3xl bg-[#080E1E] border border-white/10 p-6 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,242,254,0.1)] space-y-6">
            
            {/* Form Header */}
            <div className="space-y-1.5 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-outfit font-bold text-white tracking-tight">
                  Create Partner Account
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  Quick Activation
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Enter your information to unlock wholesale product rates.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-slate-200 font-medium">Full Name *</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Hamza Tariq"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-200 font-medium">Work / Contact Email Address *</label>
                <div className="relative">
                  <EnvelopeSimple size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. partner@brand.com"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-slate-200 font-medium">Password *</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-9 py-3 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-200 font-medium">Referral Code (Optional)</label>
                  <div className="relative">
                    <TreeStructure size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="DTA-ADMIN"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#030712] border border-white/10 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-slate-200 font-medium">WhatsApp / Phone</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-200 font-medium">City</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lahore"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-white/20 bg-[#030712] text-cyan-400 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-300 cursor-pointer">
                  I agree to the{' '}
                  <Link to="/terms" className="text-cyan-400 underline hover:text-cyan-300">
                    Partner Terms
                  </Link>{' '}
                  and Statutory Earnings Disclaimer.
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center rounded-xl font-bold mt-2 shadow-lg"
                isLoading={loading}
                iconRight={<ArrowRight size={14} weight="bold" />}
              >
                Create Free Partner Account
              </Button>
            </form>

            {/* Bottom Link */}
            <p className="text-center text-xs text-slate-400 pt-2 border-t border-white/[0.08]">
              Already have a partner account?{' '}
              <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { authService } from '@/services/authService';
import { EnvelopeSimple, CheckCircle, ArrowLeft, ArrowRight, ShieldCheck } from '@phosphor-icons/react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError('');
    setLoading(true);

    const res = await authService.sendPasswordReset(email);
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#020612] text-[#F8FAFC] flex items-center justify-center px-4 sm:px-6 py-20 sm:py-24 font-sans selection:bg-cyan-500/30">
      <div className="w-full max-w-md rounded-3xl bg-[#060B18] border border-white/[0.08] p-7 sm:p-9 shadow-2xl space-y-6">
        <div className="text-center space-y-2 pb-2 border-b border-white/[0.08]">
          <Link to="/" className="flex items-center justify-center gap-3 mb-2">
            <DreamLogo size={36} showText={false} />
          </Link>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-white">
            Reset Partner Password
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter your registered partner email address to receive password recovery instructions.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold animate-in fade-in">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-3 text-xs animate-in fade-in">
            <CheckCircle size={32} weight="fill" className="text-emerald-400 mx-auto" />
            <h3 className="font-heading text-base font-bold text-white">Recovery Instructions Sent</h3>
            <p className="text-slate-300 leading-relaxed">
              If an active partner account exists for <strong className="text-white font-mono">{email}</strong>, a secure reset token has been dispatched.
            </p>
            <Link to="/login" className="block pt-2">
              <Button variant="primary" size="sm" className="w-full justify-center rounded-xl font-bold">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block text-slate-300 font-semibold">Registered Email Address</label>
              <div className="relative">
                <EnvelopeSimple size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@domain.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-all font-mono"
                />
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
              {loading ? 'Transmitting...' : 'Send Password Reset'}
            </Button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-white/[0.08] text-xs">
          <Link to="/login" className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={13} />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { EnvelopeSimple, CheckCircle, ArrowLeft, ArrowRight } from '@phosphor-icons/react';

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
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 font-sans selection:bg-cyan-500/30">
      <div className="w-full max-w-md relative rounded-3xl bg-[#080E1E] border border-white/10 p-6 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,242,254,0.1)] space-y-6">
        <div className="text-center space-y-2 pb-2">
          <Link to="/" className="inline-block transition-transform hover:scale-105 mb-2">
            <DreamLogo size={36} />
          </Link>
          <h2 className="text-2xl font-outfit font-bold text-white tracking-tight">
            Reset Partner Password
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-3 text-xs">
            <CheckCircle size={32} weight="fill" className="text-emerald-400 mx-auto" />
            <h3 className="text-sm font-semibold text-white">Reset Link Dispatched</h3>
            <p className="text-slate-200 leading-relaxed">
              If an active partner account exists for <strong className="text-white">{email}</strong>, a secure recovery link has been sent to your inbox.
            </p>
            <Link to="/login" className="block pt-2">
              <Button variant="primary" size="sm" className="w-full justify-center rounded-xl font-bold">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-slate-200 font-medium">Work Email Address</label>
              <div className="relative">
                <EnvelopeSimple size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@domain.com"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center rounded-xl font-bold shadow-lg"
              isLoading={loading}
              iconRight={<ArrowRight size={14} weight="bold" />}
            >
              Send Password Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={13} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

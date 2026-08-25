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
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 font-sans selection:bg-[#3B82F6]/30">
      <div className="w-full max-w-md relative rounded-3xl bg-[#0A0F19] border border-white/[0.08] p-6 sm:p-9 shadow-2xl space-y-6">
        <div className="text-center space-y-2 pb-2">
          <Link to="/" className="inline-block transition-transform hover:scale-105 mb-2">
            <DreamLogo size={36} />
          </Link>
          <h2 className="text-2xl font-outfit font-semibold text-white tracking-tight">
            Reset Partner Password
          </h2>
          <p className="text-xs text-white/60 leading-relaxed">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3 text-xs">
            <CheckCircle size={32} weight="fill" className="text-emerald-400 mx-auto" />
            <h3 className="text-sm font-semibold text-white">Reset Link Dispatched</h3>
            <p className="text-white/70 leading-relaxed">
              If an active partner account exists for <strong className="text-white">{email}</strong>, a secure recovery link has been sent to your inbox.
            </p>
            <Link to="/login" className="block pt-2">
              <Button variant="primary" size="sm" className="w-full justify-center rounded-xl font-medium">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-white/80 font-medium">Work Email Address</label>
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

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center rounded-xl font-semibold shadow-lg"
              isLoading={loading}
              iconRight={<ArrowRight size={14} weight="bold" />}
            >
              Send Password Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs text-white/60 hover:text-white transition-colors">
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

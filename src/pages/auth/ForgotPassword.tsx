import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { DreamLogo } from '@/components/ui/DreamLogo';
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
    <div className="min-h-[85vh] bg-[#FAF7EF] text-[#1E241F] flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-14 font-sans selection:bg-[#B8862E]/25">
      {/* Back to Home Quick Bar */}
      <div className="w-full max-w-md pb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5B5C50] hover:text-[#1E241F] transition-colors py-1.5 px-3 rounded-lg bg-white border border-[#E3DCC8] shadow-2xs"
        >
          <ArrowLeft size={13} />
          <span>Back to Home</span>
        </Link>
        <span className="text-[11px] font-mono text-[#7C7D70]">DTA Network</span>
      </div>

      <div className="w-full max-w-md rounded-xl bg-white border border-[#E3DCC8] p-7 sm:p-9 shadow-xs space-y-6">
        <div className="text-center space-y-2 pb-2 border-b border-[#E3DCC8]">
          <Link to="/" className="flex items-center justify-center gap-3 mb-2">
            <DreamLogo size={38} showText={false} />
          </Link>
          <h1 className="font-display text-xl sm:text-2xl font-medium text-[#1E241F]">
            Reset Partner Password
          </h1>
          <p className="text-xs text-[#5B5C50] leading-relaxed">
            Enter your registered partner email address to receive password recovery instructions.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="p-6 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-center space-y-3 text-xs">
            <CheckCircle size={32} weight="bold" className="text-[#1F4D3E] mx-auto" />
            <h3 className="font-display font-medium text-base text-[#1E241F]">Recovery Instructions Sent</h3>
            <p className="text-[#5B5C50] leading-relaxed">
              If an active partner account exists for <strong className="text-[#1E241F] font-mono">{email}</strong>, a secure reset token has been dispatched.
            </p>
            <Link to="/login" className="block pt-2">
              <Button variant="primary" size="sm" className="w-full justify-center font-medium">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block text-[#5B5C50] font-medium">Registered Email Address</label>
              <div className="relative">
                <EnvelopeSimple size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B5C50]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@domain.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] placeholder:text-[#5B5C50]/60 text-xs focus:outline-none focus:border-[#1F4D3E]"
                />
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
              {loading ? 'Transmitting...' : 'Send Password Reset'}
            </Button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-[#E3DCC8] text-xs">
          <Link to="/login" className="inline-flex items-center space-x-1.5 text-[#5B5C50] hover:text-[#1E241F] transition-colors font-medium">
            <ArrowLeft size={13} />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

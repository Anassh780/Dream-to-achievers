import React, { useState } from 'react';
import { AppNotification } from '@/types';
import { emailNotificationService, EmailTemplateData } from '@/services/emailNotificationService';
import { Button } from '@/components/ui/Button';
import {
  X,
  EnvelopeSimple,
  PaperPlaneTilt,
  CheckCircle,
  Copy,
  Eye,
  Code,
  ShieldCheck,
  Check,
} from '@phosphor-icons/react';

interface EmailNotificationModalProps {
  notification: AppNotification | null;
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  defaultName?: string;
}

export const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({
  notification,
  isOpen,
  onClose,
  defaultEmail = '',
  defaultName = '',
}) => {
  const [recipientEmail, setRecipientEmail] = useState(defaultEmail);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');

  React.useEffect(() => {
    if (defaultEmail) {
      setRecipientEmail(defaultEmail);
    }
  }, [defaultEmail]);

  if (!isOpen || !notification) return null;

  const emailData: EmailTemplateData = emailNotificationService.generateEmailForNotification(
    notification,
    {
      recipientName: defaultName || 'Partner Reseller',
      recipientEmail: recipientEmail || defaultEmail || 'partner@dreamtoachievers.com',
    }
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) return;

    setIsSending(true);
    const result = await emailNotificationService.sendEmailNotification(notification, {
      recipientName: defaultName,
      recipientEmail: recipientEmail.trim(),
    });

    setIsSending(false);
    if (result.success) {
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 2500);
    }
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(emailData.htmlContent);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain touch-pan-y"
      role="dialog"
      aria-modal="true"
      aria-label="Email Notification Studio"
    >
      <div className="rounded-t-3xl sm:rounded-3xl bg-[#090F0C] border border-white/10 p-5 sm:p-6 max-w-2xl w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[92vh] flex flex-col justify-between space-y-4 shadow-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6 text-xs text-[#F4F7F5] animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#34D399]">
              <EnvelopeSimple size={18} weight="bold" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#F4F7F5] flex items-center gap-1.5">
                Luxury Email Notification
                <ShieldCheck size={14} weight="fill" className="text-[#34D399]" />
              </h3>
              <p className="text-[11px] font-mono text-[#9EABA2]">
                Customized high-converting HTML template for this alert
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/[0.04] p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('visual')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'visual'
                    ? 'bg-[#34D399] text-[#070B09] shadow-xs'
                    : 'text-[#9EABA2] hover:text-[#F4F7F5]'
                }`}
              >
                <Eye size={12} />
                <span>Visual</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('code')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'code'
                    ? 'bg-[#34D399] text-[#070B09] shadow-xs'
                    : 'text-[#9EABA2] hover:text-[#F4F7F5]'
                }`}
              >
                <Code size={12} />
                <span>HTML</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center rounded-xl text-[#9EABA2] hover:text-[#F4F7F5] cursor-pointer"
              aria-label="Close email modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {sentSuccess && (
          <div className="p-3.5 rounded-2xl bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] flex items-center gap-2 font-mono text-xs animate-in fade-in">
            <CheckCircle size={17} weight="fill" className="shrink-0" />
            <span>Official luxury email dispatched successfully to {recipientEmail}!</span>
          </div>
        )}

        {/* Content Viewer Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain pr-1 rounded-2xl bg-[#060907] border border-white/[0.08] min-h-[260px] max-h-[460px]">
          {viewMode === 'visual' ? (
            <div className="p-2 sm:p-4">
              <div className="mb-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-[#9EABA2] flex justify-between items-center">
                <span>Subject: <strong className="text-[#F4F7F5]">{emailData.subject}</strong></span>
                <span className="text-[10px] text-[#34D399]">Live HTML Canvas</span>
              </div>
              <iframe
                title="Email Preview"
                srcDoc={emailData.htmlContent}
                className="w-full h-[400px] rounded-xl border border-white/10 bg-black"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#9EABA2]">Raw HTML Template Code:</span>
                <button
                  type="button"
                  onClick={handleCopyHtml}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-[#34D399] border border-white/10 inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedHtml ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedHtml ? 'Copied HTML' : 'Copy HTML'}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-[10.5px] font-mono text-[#D9C08A] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {emailData.htmlContent}
              </pre>
            </div>
          )}
        </div>

        {/* Bottom Dispatch Controls */}
        <form onSubmit={handleSend} className="space-y-3 pt-2 border-t border-white/[0.08] shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter recipient email address..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/60 text-xs font-mono focus:outline-none focus:border-[#34D399] min-h-[44px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyHtml}
                className="funding-ghost-pill px-4 py-2.5 text-xs font-medium text-[#F4F7F5] hover:border-white/20 inline-flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] flex-1 sm:flex-initial"
              >
                {copiedHtml ? <Check size={14} className="text-[#34D399]" /> : <Copy size={14} />}
                <span>Copy Code</span>
              </button>

              <button
                type="submit"
                disabled={isSending || !recipientEmail}
                className="funding-sheen-btn px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 min-h-[44px] flex-1 sm:flex-initial active:scale-[0.98]"
              >
                <PaperPlaneTilt size={15} weight="bold" />
                <span>{isSending ? 'Dispatching...' : 'Send Email Now'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

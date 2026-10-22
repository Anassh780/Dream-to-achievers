import React, { useState, useRef } from 'react';
import { User as UserType } from '@/types';
import { RealQrCode } from '@/components/common/RealQrCode';
import {
  downloadQrCodeImage,
  copyQrCodeImageToClipboard,
  shareReferralToWhatsApp,
} from '@/utils/qrCodeHelper';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import {
  QrCode,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  Crown,
  ShieldCheck,
  Link,
  Palette,
  Smartphone,
} from 'lucide-react';

interface ProfileQrCardProps {
  user: UserType;
}

type QrStyleTheme = 'holographic' | 'gold' | 'cyber' | 'minimal' | 'clean';

export const ProfileQrCard: React.FC<ProfileQrCardProps> = ({ user }) => {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [selectedTheme, setSelectedTheme] = useState<QrStyleTheme>('holographic');
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [isCopiedImage, setIsCopiedImage] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dream-to-achievers.vercel.app';
  const referralCode = user.referralCode || 'DTA-VIP';
  const referralUrl = `${origin}/signup?ref=${encodeURIComponent(referralCode)}`;

  const partnerRank = user.currentRankSlug
    ? user.currentRankSlug.toUpperCase()
    : 'SILVER';

  // Handle Copy Referral Link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setIsCopiedLink(true);
      toastSuccess('VIP Referral URL copied to clipboard!');
      setTimeout(() => setIsCopiedLink(false), 2500);
    } catch {
      toastInfo(`Referral Link: ${referralUrl}`);
    }
  };

  // Handle Download QR PNG
  const handleDownloadQr = async () => {
    try {
      const filename = `DTA_Partner_QR_${referralCode}.png`;
      await downloadQrCodeImage(referralUrl, filename, {
        width: 1024,
        margin: 2,
        color: {
          dark: selectedTheme === 'clean' ? '#000000' : selectedTheme === 'cyber' ? '#041727' : '#0B1536',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });
      toastSuccess(`High-resolution QR code saved as ${filename}`);
    } catch (err) {
      console.error(err);
      toastError('Failed to download QR code image.');
    }
  };

  // Handle Copy QR Image directly to clipboard
  const handleCopyQrImage = async () => {
    setIsCopyingImage(true);
    try {
      await copyQrCodeImageToClipboard(referralUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: '#0B1536',
          light: '#FFFFFF',
        },
      });
      setIsCopiedImage(true);
      toastSuccess('QR Code image copied! You can now paste it directly into WhatsApp or Instagram.');
      setTimeout(() => setIsCopiedImage(false), 2500);
    } catch (err) {
      console.warn('Clipboard image copy fallback:', err);
      toastInfo('Browser blocked clipboard image writing. Downloading PNG instead...');
      handleDownloadQr();
    } finally {
      setIsCopyingImage(false);
    }
  };

  // Handle WhatsApp Share
  const handleWhatsAppShare = () => {
    shareReferralToWhatsApp(user.fullName || 'VIP Partner', referralCode, referralUrl);
    toastSuccess('Opening WhatsApp to share your QR & referral pitch...');
  };

  // Dynamic styling based on theme
  const getThemeFrameStyles = () => {
    switch (selectedTheme) {
      case 'holographic':
        return {
          wrapper: 'bg-gradient-to-br from-blue-600 via-indigo-700 to-sky-900 border-indigo-400/30 text-white',
          qrFrame: 'bg-gradient-to-tr from-[#A7F3D0] via-[#FDE047] via-[#F472B6] to-[#60A5FA] p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.35)]',
          badge: 'bg-white/20 text-white border-white/30 backdrop-blur-md',
          accentText: 'text-sky-300',
        };
      case 'gold':
        return {
          wrapper: 'bg-gradient-to-br from-[#1A160E] via-[#0C0B08] to-[#17140B] border-amber-500/40 text-amber-100 shadow-[0_10px_35px_rgba(245,158,11,0.15)]',
          qrFrame: 'bg-gradient-to-br from-[#FFE58F] via-[#D4AF37] to-[#8C6D15] p-1.5 shadow-[0_8px_25px_rgba(212,175,55,0.3)]',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          accentText: 'text-amber-400',
        };
      case 'cyber':
        return {
          wrapper: 'bg-[#060D1A] border-cyan-500/40 text-slate-100 shadow-[0_10px_35px_rgba(6,182,212,0.15)]',
          qrFrame: 'bg-gradient-to-br from-cyan-400 via-emerald-400 to-teal-500 p-1.5 shadow-[0_8px_25px_rgba(6,182,212,0.3)]',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          accentText: 'text-emerald-400',
        };
      case 'minimal':
        return {
          wrapper: 'bg-[#0F172A] border-slate-700 text-slate-100 shadow-xl',
          qrFrame: 'bg-slate-800 p-1.5 border border-slate-600 shadow-md',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          accentText: 'text-slate-300',
        };
      case 'clean':
      default:
        return {
          wrapper: 'bg-white border-slate-300 text-slate-900 shadow-lg',
          qrFrame: 'bg-slate-100 p-1.5 border border-slate-300 shadow-sm',
          badge: 'bg-slate-100 text-slate-800 border-slate-200',
          accentText: 'text-blue-700',
        };
    }
  };

  const currentStyles = getThemeFrameStyles();

  return (
    <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-6">
      {/* Header with Title & Explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[var(--ink)] flex items-center gap-2">
                <span>Reseller Profile QR Code Generator</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase font-bold tracking-wider">
                  Live &amp; Scannable
                </span>
              </h3>
              <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                Generate, customize, and share your personal QR code. When customers or team members scan it, they register directly under your partner tree.
              </p>
            </div>
          </div>
        </div>

        {/* Theme Picker Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] self-start sm:self-auto">
          <Palette size={14} className="text-[var(--ink-soft)] ml-1.5 mr-1" />
          <button
            type="button"
            onClick={() => setSelectedTheme('holographic')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
              selectedTheme === 'holographic'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            Holo Foil
          </button>
          <button
            type="button"
            onClick={() => setSelectedTheme('gold')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
              selectedTheme === 'gold'
                ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            VIP Gold
          </button>
          <button
            type="button"
            onClick={() => setSelectedTheme('cyber')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
              selectedTheme === 'cyber'
                ? 'bg-cyan-600 text-white shadow-xs font-semibold'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            Cyber Node
          </button>
          <button
            type="button"
            onClick={() => setSelectedTheme('clean')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
              selectedTheme === 'clean'
                ? 'bg-slate-800 text-white shadow-xs font-semibold'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            Studio
          </button>
        </div>
      </div>

      {/* Main Interactive Presentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Visual Live Card Preview */}
        <div className="lg:col-span-5 flex justify-center">
          <div
            ref={cardRef}
            className={`w-full max-w-sm rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center space-y-4 ${currentStyles.wrapper}`}
          >
            {/* Subtle background cyber grid */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            {/* Top Partner Header */}
            <div className="relative z-10 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border shadow-2xs">
                <Crown size={12} className={currentStyles.accentText} />
                <span>{partnerRank} Partner</span>
                <span>•</span>
                <span>DTA Node</span>
              </div>
              <h4 className="font-serif font-black text-xl tracking-tight pt-1">
                {user.fullName || 'Authorized Partner'}
              </h4>
              <p className="font-mono text-xs opacity-80 tracking-wide">
                Ref Code: <span className="font-bold underline">{referralCode}</span>
              </p>
            </div>

            {/* Central Scannable QR Code Frame */}
            <div className="relative z-10">
              <div className={`rounded-2xl transition-transform hover:scale-105 duration-300 ${currentStyles.qrFrame}`}>
                <div className="bg-white p-2.5 rounded-xl shadow-inner flex items-center justify-center">
                  <RealQrCode
                    value={referralUrl}
                    size={160}
                    fgColor="#0B1536"
                    bgColor="#FFFFFF"
                    level="H"
                    logoUrl="/brand-logo.png"
                    logoSize={36}
                    title={`Scan to register with ${user.fullName || 'Partner'}`}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Scannability Instruction */}
            <div className="relative z-10 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-semibold opacity-90">
                <Smartphone size={14} className={currentStyles.accentText} />
                <span>Scan with Camera to Join Team</span>
              </div>
              <div className="text-[10px] font-mono opacity-70 truncate max-w-[260px]">
                {referralUrl}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls & Sharing Dock */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
              <Sparkles size={14} />
              Instant Partner Distribution
            </span>
            <h4 className="font-serif font-bold text-xl text-[var(--ink)]">
              Share Your QR Across WhatsApp, TikTok &amp; Print
            </h4>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              Every customer or affiliate who scans this QR code will automatically have your referral code <strong className="font-mono text-[var(--ink)]">{referralCode}</strong> attached to their sign up, locking their lifetime volume and wholesale commissions to your ledger.
            </p>
          </div>

          {/* Quick Sharing Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* 1-Click WhatsApp Share */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Share2 size={16} />
              <span>Share to WhatsApp</span>
            </button>

            {/* 1-Click Download High-Res PNG */}
            <button
              type="button"
              onClick={handleDownloadQr}
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--line)] text-[var(--ink)] font-medium text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Download size={16} className="text-[var(--primary)]" />
              <span>Download 1024px PNG</span>
            </button>

            {/* Copy QR Image to Clipboard */}
            <button
              type="button"
              onClick={handleCopyQrImage}
              disabled={isCopyingImage}
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--line)] text-[var(--ink)] font-medium text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {isCopiedImage ? (
                <>
                  <Check size={16} className="text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Image Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="text-[var(--ink-soft)]" />
                  <span>Copy QR Image</span>
                </>
              )}
            </button>

            {/* Copy Referral URL */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-[var(--surface-alt)] hover:bg-[var(--surface-hover)] border border-[var(--line)] text-[var(--ink)] font-medium text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {isCopiedLink ? (
                <>
                  <Check size={16} className="text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Link size={16} className="text-[var(--ink-soft)]" />
                  <span>Copy Referral Link</span>
                </>
              )}
            </button>
          </div>

          {/* Quick verification reassurance */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] flex items-start gap-3 text-xs text-[var(--ink-soft)]">
            <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[var(--ink)] block">Guaranteed Attribution Engine</span>
              <span>Scanning this QR code sets an immutable persistent referral attribution cookie and cloud token on the user&apos;s device before registration.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

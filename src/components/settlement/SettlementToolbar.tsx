import React, { useState } from 'react';
import {
  SettlementRecord,
  SettlementTemplateType,
  buildSettlementFilename,
  formatSettlementAmount,
} from '@/types/settlement';
import { toBlob, toPng, toSvg } from 'html-to-image';
import {
  Copy,
  Download,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCode,
  Share2,
  Printer,
  Sparkles,
  Crown,
  Link as LinkIcon,
  FileText,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface SettlementToolbarProps {
  record: SettlementRecord;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onFitWidth: () => void;
  onTemplateChange?: (newTemplate: SettlementTemplateType) => void;
  canEdit?: boolean;
  showEditor?: boolean;
  onToggleEditor?: () => void;
}

export const SettlementToolbar: React.FC<SettlementToolbarProps> = ({
  record,
  canvasRef,
  zoom,
  onZoomChange,
  onFitWidth,
  onTemplateChange,
  canEdit = false,
  showEditor = false,
  onToggleEditor,
}) => {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [copiedLinkSuccess, setCopiedLinkSuccess] = useState(false);

  // Helper to ensure webfonts and images are settled before screenshot
  const captureCanvasBlob = async (): Promise<Blob | null> => {
    if (!canvasRef.current) return null;
    const node = canvasRef.current;

    return await toBlob(node, {
      pixelRatio: 3.0,
      cacheBust: true,
      skipFonts: false,
    });
  };

  /**
   * Copy high-resolution PNG image directly to clipboard.
   */
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    setIsCopying(true);

    try {
      if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
        throw new Error('Clipboard API not supported in this browser.');
      }

      const blob = await captureCanvasBlob();
      if (!blob) throw new Error('Could not generate canvas image blob.');

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);

      setCopiedSuccess(true);
      toastSuccess('Certificate image copied to clipboard!');
      setTimeout(() => setCopiedSuccess(false), 2500);
    } catch (err: any) {
      console.warn('Clipboard write image failed, offering download fallback:', err);
      toastInfo('Browser blocked direct clipboard image copying. Downloading PNG instead...');
      handleDownloadPng();
    } finally {
      setIsCopying(false);
    }
  };

  /**
   * Downloads high-resolution PNG image.
   */
  const handleDownloadPng = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);

    try {
      const node = canvasRef.current;
      const dataUrl = await toPng(node, {
        pixelRatio: 3.0,
        cacheBust: true,
        skipFonts: false,
      });

      const recipient =
        record.recipientName || record.signatoryName || record.businessName || 'Partner';
      const filename = buildSettlementFilename(
        recipient,
        record.settlementDate,
        record.utrReference
      );

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      toastSuccess(`Certificate saved as ${filename}`);
    } catch (err: any) {
      console.error('Download PNG failed:', err);
      toastError('Failed to render certificate PNG. Please check browser permissions.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Copy verification link to clipboard.
   */
  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/dashboard/sales?certificate=${record.id}`;
      await navigator.clipboard.writeText(url);
      setCopiedLinkSuccess(true);
      toastSuccess('Certificate verification link copied to clipboard!');
      setTimeout(() => setCopiedLinkSuccess(false), 2500);
    } catch {
      toastInfo(`Certificate ID: ${record.id}`);
    }
  };

  /**
   * 1-Click WhatsApp Share.
   */
  const handleShareWhatsApp = () => {
    const recipient =
      record.recipientName || record.signatoryName || record.businessName || 'Reseller';
    const amountStr = formatSettlementAmount(record.amount, record.currency);
    const products = record.totalProductsSold || 1;
    const msg = encodeURIComponent(
      `🏆 Official Payout Certificate Attestation\n\n` +
      `👑 Recipient: ${recipient}\n` +
      `💰 Amount Disbursed: ${amountStr}\n` +
      `📦 Total Products Sold: ${products}\n` +
      `⚡ Certificate ID: ${record.id}\n` +
      `🏛️ Verified via Dream to Achievers Financial Clearing\n` +
      `Status: VERIFIED & DISBURSED ✅`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  /**
   * Trigger print / PDF dialog.
   */
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-2 p-2 sm:p-3 rounded-2xl bg-slate-900/95 border border-slate-800 text-xs shadow-md">
      {/* Row 1: Zoom / Scaling Controls & Primary Action Buttons */}
      <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        {/* Center/Left: Zoom / Scaling Controls */}
        <div className="flex items-center space-x-1 font-mono shrink-0">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(0.18, zoom - 0.08))}
            className="min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700 active:bg-slate-800 cursor-pointer transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>

          <span className="px-1.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 min-w-[44px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={() => onZoomChange(Math.min(1.2, zoom + 0.08))}
            className="min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700 active:bg-slate-800 cursor-pointer transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn size={15} />
          </button>

          <button
            type="button"
            onClick={onFitWidth}
            className="min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20 active:bg-cyan-500/20 cursor-pointer ml-1 inline-flex items-center gap-1 font-sans font-medium"
            title="Fit Canvas to Screen"
          >
            <Maximize2 size={12} />
            <span className="hidden xs:inline">Fit Screen</span>
          </button>
        </div>

        {/* Right: Sleek Action Row matching Funding Pips / Mobile First */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 ml-auto">
          {/* [ ↓ PNG ] Button */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPng}
            className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95 disabled:opacity-50 shrink-0"
            title="Download High-Resolution PNG Image"
          >
            <Download size={14} />
            <span>{isExporting ? 'Saving...' : 'PNG'}</span>
          </button>

          {/* [ 💬 WhatsApp ] Button */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
            title="Share on WhatsApp"
          >
            <Share2 size={14} />
            <span className="hidden xs:inline">WhatsApp</span>
          </button>

          {/* [ 📋 Image ] Button */}
          <button
            type="button"
            disabled={isCopying}
            onClick={handleCopyImage}
            className="min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all active:scale-95 disabled:opacity-50 shrink-0"
            title="Copy Image to clipboard"
          >
            {copiedSuccess ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-400 hidden xs:inline">Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} className="text-slate-300" />
                <span className="hidden xs:inline">Image</span>
              </>
            )}
          </button>

          {/* [ 🔗 Link ] Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all active:scale-95 shrink-0"
            title="Copy Verification Link"
          >
            {copiedLinkSuccess ? (
              <>
                <Check size={14} className="text-cyan-400" />
                <span className="text-cyan-400 hidden xs:inline">Linked</span>
              </>
            ) : (
              <>
                <LinkIcon size={14} className="text-slate-300" />
                <span className="hidden xs:inline">Link</span>
              </>
            )}
          </button>

          {/* [ ↓ PDF ] Button */}
          <button
            type="button"
            onClick={handlePrintPdf}
            className="min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all active:scale-95 shrink-0"
            title="Export / Print Certificate as PDF"
          >
            <FileText size={14} />
            <span className="hidden xs:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Row 2: Horizontally Scrollable Template Selector Pills & Admin Studio Toggle */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 touch-pan-x">
        {canEdit && onToggleEditor && (
          <button
            type="button"
            onClick={onToggleEditor}
            className={`min-h-[34px] px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              showEditor
                ? 'bg-amber-400 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-xs'
            }`}
            title="Toggle real-time visual styling studio (Fonts, Colors & Backgrounds)"
          >
            <Sparkles size={13} className={showEditor ? 'text-slate-950' : 'text-amber-400'} />
            <span className="whitespace-nowrap">
              {showEditor ? 'Hide Studio' : '🎨 Styling Studio'}
            </span>
          </button>
        )}

        {onTemplateChange && (
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => onTemplateChange('funding_pips_portrait')}
              className={`min-h-[32px] px-2.5 sm:px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                record.template === 'funding_pips_portrait' || !record.template
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>⚡ <span className="hidden sm:inline">Funding Pips </span>(Sky Blue)</span>
            </button>

            <button
              type="button"
              onClick={() => onTemplateChange('emerald_website_ui')}
              className={`min-h-[32px] px-2.5 sm:px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                record.template === 'emerald_website_ui'
                  ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>💎 <span className="hidden sm:inline">Website UI </span>(Emerald)</span>
            </button>

            <button
              type="button"
              onClick={() => onTemplateChange('funding_pips_vip')}
              className={`min-h-[32px] px-2.5 sm:px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                record.template === 'funding_pips_vip'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crown size={12} className="text-amber-400" />
              <span>Obsidian Gold</span>
            </button>

            <button
              type="button"
              onClick={() => onTemplateChange('executive_statement')}
              className={`min-h-[32px] px-2.5 sm:px-3 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                record.template === 'executive_statement'
                  ? 'bg-slate-800 text-slate-100 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Executive<span className="hidden sm:inline"> Minimal</span></span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

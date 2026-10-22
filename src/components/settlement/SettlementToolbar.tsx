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
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/95 border border-slate-800 text-xs shadow-md">
      {/* Left: Template Selector Pills & Admin Studio Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {canEdit && onToggleEditor && (
          <button
            type="button"
            onClick={onToggleEditor}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              showEditor
                ? 'bg-amber-400 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-xs'
            }`}
            title="Toggle real-time visual styling studio (Fonts, Colors & Backgrounds)"
          >
            <Sparkles size={13} className={showEditor ? 'text-slate-950' : 'text-amber-400'} />
            <span>{showEditor ? 'Hide Styling Studio' : '🎨 Styling Studio (Fonts & Colors)'}</span>
          </button>
        )}

        {onTemplateChange && (
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
            <button
              type="button"
              onClick={() => onTemplateChange('funding_pips_portrait')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                record.template === 'funding_pips_portrait' || !record.template
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>⚡ Funding Pips (Sky Blue)</span>
            </button>

            <button
              type="button"
              onClick={() => onTemplateChange('emerald_website_ui')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                record.template === 'emerald_website_ui'
                  ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>💎 Website UI (Emerald)</span>
            </button>

            <button
              type="button"
              onClick={() => onTemplateChange('funding_pips_vip')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer ${
                record.template === 'executive_statement'
                  ? 'bg-slate-800 text-slate-100 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Executive Minimal</span>
            </button>
          </div>
        )}
      </div>

      {/* Center: Zoom / Scaling Controls */}
      <div className="flex items-center space-x-1.5 font-mono">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(0.25, zoom - 0.08))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700 cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>

        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300 min-w-[50px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          onClick={() => onZoomChange(Math.min(1.2, zoom + 0.08))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700 cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>

        <button
          type="button"
          onClick={onFitWidth}
          className="px-2.5 py-1 rounded-lg text-[11px] text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20 cursor-pointer ml-1 inline-flex items-center gap-1"
          title="Fit Canvas to Screen"
        >
          <Maximize2 size={12} />
          <span>Fit Screen</span>
        </button>
      </div>

      {/* Right: Sleek Action Row matching Funding Pips Image 2 */}
      <div className="flex flex-wrap items-center gap-2">
        {/* [ ↓ PNG ] Button */}
        <button
          type="button"
          disabled={isExporting}
          onClick={handleDownloadPng}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95 disabled:opacity-50"
          title="Download High-Resolution PNG Image"
        >
          <Download size={14} />
          <span>{isExporting ? 'Generating...' : 'PNG'}</span>
        </button>

        {/* [ ↓ PDF ] Button */}
        <button
          type="button"
          onClick={handlePrintPdf}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all active:scale-95"
          title="Export / Print Certificate as PDF"
        >
          <FileText size={14} />
          <span>PDF</span>
        </button>

        {/* [ 📋 Image ] Button */}
        <button
          type="button"
          disabled={isCopying}
          onClick={handleCopyImage}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          title="Copy Image to clipboard"
        >
          {copiedSuccess ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} className="text-slate-300" />
              <span>Image</span>
            </>
          )}
        </button>

        {/* [ 🔗 Link ] Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all active:scale-95"
          title="Copy Verification Link"
        >
          {copiedLinkSuccess ? (
            <>
              <Check size={14} className="text-cyan-400" />
              <span className="text-cyan-400">Linked</span>
            </>
          ) : (
            <>
              <LinkIcon size={14} className="text-slate-300" />
              <span>Link</span>
            </>
          )}
        </button>

        {/* [ 💬 WhatsApp ] Button */}
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          title="Share on WhatsApp"
        >
          <Share2 size={14} />
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  );
};

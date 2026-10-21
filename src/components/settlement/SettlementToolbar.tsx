import React, { useState } from 'react';
import { SettlementRecord, buildSettlementFilename } from '@/types/settlement';
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
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface SettlementToolbarProps {
  record: SettlementRecord;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onFitWidth: () => void;
}

export const SettlementToolbar: React.FC<SettlementToolbarProps> = ({
  record,
  canvasRef,
  zoom,
  onZoomChange,
  onFitWidth,
}) => {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Helper to ensure webfonts and images are settled before screenshot
  const captureCanvasBlob = async (): Promise<Blob | null> => {
    if (!canvasRef.current) return null;
    const node = canvasRef.current;

    // Use toBlob with pixelRatio 2 to ensure 1600x1000 / retina sharpness
    return await toBlob(node, {
      pixelRatio: 2,
      cacheBust: true,
      skipFonts: false,
      backgroundColor: '#080C14',
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
      toastSuccess('Settlement certificate copied to clipboard as high-res PNG!');
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
   * Downloads high-resolution 1600x1000 PNG image with sanitized B2B naming.
   */
  const handleDownloadPng = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);

    try {
      const node = canvasRef.current;
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: false,
        backgroundColor: '#080C14',
      });

      const filename = buildSettlementFilename(
        record.businessName,
        record.settlementDate,
        record.utrReference
      );

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      toastSuccess(`Settlement certificate saved as ${filename}`);
    } catch (err: any) {
      console.error('Download PNG failed:', err);
      toastError('Failed to render certificate PNG. Please check image permissions.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export vector SVG.
   */
  const handleDownloadSvg = async () => {
    if (!canvasRef.current) return;
    try {
      const svgData = await toSvg(canvasRef.current, { backgroundColor: '#080C14' });
      const filename = buildSettlementFilename(
        record.businessName,
        record.settlementDate,
        record.utrReference
      ).replace('.png', '.svg');

      const link = document.createElement('a');
      link.download = filename;
      link.href = svgData;
      link.click();
      toastSuccess(`Vector SVG settlement document saved.`);
    } catch (err) {
      console.error('SVG export failed:', err);
      toastError('Failed to export vector SVG.');
    }
  };

  /**
   * Trigger print dialog.
   */
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs shadow-md">
      {/* Zoom / Scaling Controls */}
      <div className="flex items-center space-x-1.5 font-mono">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(0.35, zoom - 0.1))}
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
          onClick={() => onZoomChange(Math.min(1.2, zoom + 0.1))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700 cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>

        <button
          type="button"
          onClick={onFitWidth}
          className="px-2 py-1 rounded-lg text-[10px] text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20 cursor-pointer ml-1 inline-flex items-center gap-1"
          title="Fit Canvas to Screen"
        >
          <Maximize2 size={12} />
          <span>Fit Screen</span>
        </button>
      </div>

      {/* Main Export & Copy Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Copy Image Button */}
        <button
          type="button"
          disabled={isCopying}
          onClick={handleCopyImage}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          title="Copy 1600x1000 PNG to clipboard"
        >
          {copiedSuccess ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Image Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} className="text-slate-300" />
              <span>{isCopying ? 'Copying...' : 'Copy Image'}</span>
            </>
          )}
        </button>

        {/* Download PNG Button */}
        <button
          type="button"
          disabled={isExporting}
          onClick={handleDownloadPng}
          className="min-h-[38px] px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95 disabled:opacity-50"
          title="Download High-Resolution PNG (1600x1000 px)"
        >
          <Download size={15} />
          <span>{isExporting ? 'Generating PNG...' : 'Download HD PNG'}</span>
        </button>

        {/* Vector SVG Export */}
        <button
          type="button"
          onClick={handleDownloadSvg}
          className="min-h-[38px] p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800 cursor-pointer"
          title="Download Vector SVG"
        >
          <FileCode size={15} />
        </button>

        {/* Print Document */}
        <button
          type="button"
          onClick={handlePrint}
          className="min-h-[38px] p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800 cursor-pointer"
          title="Print Certificate"
        >
          <Printer size={15} />
        </button>
      </div>
    </div>
  );
};

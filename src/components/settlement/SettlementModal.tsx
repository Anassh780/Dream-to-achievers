import React, { useState, useRef, useEffect } from 'react';
import { SettlementRecord, SettlementTemplateType, formatSettlementAmount } from '@/types/settlement';
import { SettlementCanvas } from './SettlementCanvas';
import { SettlementForm } from './SettlementForm';
import { SettlementToolbar } from './SettlementToolbar';
import { settlementService } from '@/services/settlementService';
import { X, Crown, ShieldCheck, Sparkles, SlidersHorizontal, Package, CheckCircle2 } from 'lucide-react';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecord?: SettlementRecord;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({
  isOpen,
  onClose,
  initialRecord,
}) => {
  const [record, setRecord] = useState<SettlementRecord>(
    () => initialRecord || settlementService.createSampleRecord()
  );
  const [zoom, setZoom] = useState(0.68);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialRecord) {
      setRecord(initialRecord);
    }
  }, [initialRecord]);

  // Auto-fit zoom to modal viewport so canvas is 100% visible on screen
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (previewContainerRef.current) {
        const isPortrait =
          !record.template ||
          record.template === 'funding_pips_portrait' ||
          record.template === 'emerald_website_ui';
        const baseWidth = isPortrait ? 600 : 1200;
        const baseHeight = isPortrait ? 840 : 750;

        const availableWidth = previewContainerRef.current.clientWidth - 40;
        const availableHeight = previewContainerRef.current.clientHeight - 40;
        const widthScale = availableWidth / baseWidth;
        const heightScale = availableHeight / baseHeight;
        const autoZoom = Math.min(isPortrait ? 0.95 : 0.92, Math.max(0.25, Math.min(widthScale, heightScale)));
        setZoom(autoZoom);
      }
    };

    // Run slightly deferred to ensure DOM dimensions have settled
    const timer = setTimeout(handleResize, 50);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, showEditDrawer, record.template]);

  const handleFitWidth = () => {
    if (previewContainerRef.current) {
      const isPortrait =
        !record.template ||
        record.template === 'funding_pips_portrait' ||
        record.template === 'emerald_website_ui';
      const baseWidth = isPortrait ? 600 : 1200;
      const baseHeight = isPortrait ? 840 : 750;

      const availableWidth = previewContainerRef.current.clientWidth - 48;
      const availableHeight = previewContainerRef.current.clientHeight - 48;
      const widthScale = availableWidth / baseWidth;
      const heightScale = availableHeight / baseHeight;
      const autoZoom = Math.min(1.0, Math.max(0.25, Math.min(widthScale, heightScale)));
      setZoom(autoZoom);
    }
  };

  const handleTemplateChange = (newTemplate: SettlementTemplateType) => {
    const updated = { ...record, template: newTemplate };
    setRecord(updated);
    settlementService.saveCertificate(updated);
  };

  const handleReset = () => {
    setRecord(settlementService.createSampleRecord());
  };

  const handleSamplePrefill = () => {
    setRecord(settlementService.createSampleRecord());
  };

  if (!isOpen) return null;

  const honoree =
    record.recipientName || record.signatoryName || record.businessName || 'Distinguished Reseller';
  const totalProducts = record.totalProductsSold || 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[1550px] h-[94vh] bg-[#07090F] border border-amber-500/30 rounded-3xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Modal Top Header (VIP Style) */}
        <div className="shrink-0 px-6 py-3.5 bg-slate-950/90 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-yellow-500/15 to-transparent border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Crown size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-black text-base text-slate-100 flex items-center gap-1.5">
                  <span>VIP Payout Certificate</span>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase">
                    Funding Pips VIP Protocol
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-sans flex items-center gap-2 mt-0.5">
                <span className="text-slate-200 font-semibold">{honoree}</span>
                <span>•</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {formatSettlementAmount(record.amount, record.currency)}
                </span>
                <span>•</span>
                <span className="text-cyan-400 font-mono flex items-center gap-1">
                  <Package size={12} />
                  {totalProducts} {totalProducts === 1 ? 'Product Sold' : 'Products Sold'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Optional Manual Editor Toggle Button */}
            <button
              type="button"
              onClick={() => setShowEditDrawer(!showEditDrawer)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-mono inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                showEditDrawer
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Toggle manual field overrides (optional)"
            >
              <SlidersHorizontal size={14} />
              <span>{showEditDrawer ? 'Hide Editor' : 'Customize Certificate'}</span>
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="min-h-[38px] min-w-[38px] p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Close generator"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Main VIP Certificate Showcase Area (Full Width by Default!) */}
          <div className="flex-1 flex flex-col bg-[#05070B] overflow-hidden min-w-0">
            {/* Pinned Action Toolbar */}
            <div className="shrink-0 p-3.5 border-b border-slate-800/80 bg-slate-950/80">
              <SettlementToolbar
                record={record}
                canvasRef={canvasRef}
                zoom={zoom}
                onZoomChange={setZoom}
                onFitWidth={handleFitWidth}
                onTemplateChange={handleTemplateChange}
              />
            </div>

            {/* Canvas Display Viewport (Perfect Centering, Zero Clipping) */}
            <div
              ref={previewContainerRef}
              className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center overscroll-contain bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05),transparent_75%)]"
            >
              <div className="w-full flex items-center justify-center">
                <SettlementCanvas ref={canvasRef} record={record} scale={zoom} />
              </div>
            </div>
          </div>

          {/* Optional Collapsible Side Drawer for Manual Overrides (Hidden by default) */}
          {showEditDrawer && (
            <div className="w-full sm:w-[460px] xl:w-[500px] shrink-0 border-l border-slate-800 bg-[#080B12]/95 backdrop-blur-md overflow-y-auto p-5 space-y-4 shadow-2xl animate-in slide-in-from-right duration-200 z-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-serif font-bold text-sm text-slate-100">Certificate Overrides</h3>
                  <p className="text-[11px] text-slate-400">Tweak recipient name, metrics, or custom notes</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-100 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <SettlementForm
                record={record}
                onChange={setRecord}
                onReset={handleReset}
                onSamplePrefill={handleSamplePrefill}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

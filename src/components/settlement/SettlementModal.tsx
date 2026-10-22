import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isUserAdminOrSuperAdmin } from '@/services/authService';
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
  const { user, isAdmin: authIsAdmin, isSuperAdmin } = useAuth();
  const canEdit = Boolean(authIsAdmin || isSuperAdmin || isUserAdminOrSuperAdmin(user));

  const [record, setRecord] = useState<SettlementRecord>(
    () => initialRecord || settlementService.createSampleRecord()
  );
  const [zoom, setZoom] = useState(0.68);
  const [showEditDrawer, setShowEditDrawer] = useState(() => {
    // If admin or super admin on desktop, open editor by default
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      return true;
    }
    return false;
  });
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

        const containerW = previewContainerRef.current.clientWidth;
        const containerH = previewContainerRef.current.clientHeight;
        const paddingX = containerW < 640 ? 16 : 36;
        const paddingY = containerH < 640 ? 16 : 36;

        const availableWidth = Math.max(100, containerW - paddingX);
        const availableHeight = Math.max(100, containerH - paddingY);
        const widthScale = availableWidth / baseWidth;
        const heightScale = availableHeight / baseHeight;
        const minScale = isPortrait ? 0.28 : 0.18;
        const autoZoom = Math.min(isPortrait ? 0.95 : 0.92, Math.max(minScale, Math.min(widthScale, heightScale)));
        setZoom(Number(autoZoom.toFixed(3)));
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

      const containerW = previewContainerRef.current.clientWidth;
      const containerH = previewContainerRef.current.clientHeight;
      const paddingX = containerW < 640 ? 16 : 36;
      const paddingY = containerH < 640 ? 16 : 36;

      const availableWidth = Math.max(100, containerW - paddingX);
      const availableHeight = Math.max(100, containerH - paddingY);
      const widthScale = availableWidth / baseWidth;
      const heightScale = availableHeight / baseHeight;
      const minScale = isPortrait ? 0.28 : 0.18;
      const autoZoom = Math.min(1.0, Math.max(minScale, Math.min(widthScale, heightScale)));
      setZoom(Number(autoZoom.toFixed(3)));
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
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[1550px] h-full sm:h-[94vh] max-h-[100dvh] bg-[#07090F] border-0 sm:border border-amber-500/30 rounded-none sm:rounded-3xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Modal Top Header (VIP Style) */}
        <div className="shrink-0 px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-slate-950/90 border-b border-amber-500/20 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-yellow-500/15 to-transparent border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0">
              <Crown size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-serif font-black text-sm sm:text-base text-slate-100 flex items-center gap-1.5 truncate">
                  <span>VIP Payout Certificate</span>
                </h2>
                <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase">
                  VIP Protocol
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-sans flex items-center gap-1.5 mt-0.5 truncate">
                <span className="text-slate-200 font-semibold truncate max-w-[110px] sm:max-w-none">{honoree}</span>
                <span>•</span>
                <span className="text-emerald-400 font-mono font-bold whitespace-nowrap">
                  {formatSettlementAmount(record.amount, record.currency)}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline-flex text-cyan-400 font-mono items-center gap-1 whitespace-nowrap">
                  <Package size={12} />
                  {totalProducts} {totalProducts === 1 ? 'Product Sold' : 'Products Sold'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Admin & Super Admin Manual Customizer Toggle Button */}
            {canEdit && (
              <button
                type="button"
                onClick={() => setShowEditDrawer(!showEditDrawer)}
                className={`min-h-[38px] px-2.5 sm:px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                  showEditDrawer
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                    : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-xs'
                }`}
                title="Toggle visual style and field customization (Admin & Super Admin)"
              >
                <SlidersHorizontal size={14} className={showEditDrawer ? 'text-slate-950' : 'text-amber-400'} />
                <span className="whitespace-nowrap">
                  {showEditDrawer ? (
                    <>
                      <span className="hidden sm:inline">Hide Styling Studio</span>
                      <span className="sm:hidden">Close Studio</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">🎨 Styling Studio (Fonts &amp; Colors)</span>
                      <span className="sm:hidden">🎨 Studio</span>
                    </>
                  )}
                </span>
              </button>
            )}

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="min-h-[38px] min-w-[38px] p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Close generator"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Main VIP Certificate Showcase Area (Full Width by Default, hidden on mobile if editing drawer active) */}
          <div
            className={`flex-1 flex flex-col bg-[#05070B] overflow-hidden min-w-0 ${
              showEditDrawer ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Pinned Action Toolbar */}
            <div className="shrink-0 p-2 sm:p-3.5 border-b border-slate-800/80 bg-slate-950/80">
              <SettlementToolbar
                record={record}
                canvasRef={canvasRef}
                zoom={zoom}
                onZoomChange={setZoom}
                onFitWidth={handleFitWidth}
                onTemplateChange={handleTemplateChange}
                canEdit={canEdit}
                showEditor={showEditDrawer}
                onToggleEditor={() => setShowEditDrawer(!showEditDrawer)}
              />
            </div>

            {/* Canvas Display Viewport (Perfect Centering, Zero Clipping) */}
            <div
              ref={previewContainerRef}
              className="flex-1 overflow-auto p-2 sm:p-6 flex items-center justify-center overscroll-contain touch-pan-x touch-pan-y bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05),transparent_75%)]"
            >
              <div className="w-full flex items-center justify-center my-auto">
                <SettlementCanvas ref={canvasRef} record={record} scale={zoom} />
              </div>
            </div>
          </div>

          {/* Side Drawer for Manual Overrides (Admin & Super Admin Only) */}
          {canEdit && showEditDrawer && (
            <div className="w-full lg:w-[460px] xl:w-[500px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 bg-[#080B12]/98 backdrop-blur-md overflow-y-auto p-3.5 sm:p-5 space-y-4 shadow-2xl animate-in fade-in lg:slide-in-from-right duration-200 z-20">
              {/* Mobile Quick Return Pill */}
              <div className="lg:hidden flex items-center justify-between gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <span className="text-xs font-mono font-bold flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  Styling Studio Active
                </span>
                <button
                  type="button"
                  onClick={() => setShowEditDrawer(false)}
                  className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-mono text-xs font-black cursor-pointer shadow-xs active:scale-95 transition-transform"
                >
                  👁️ View Certificate
                </button>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-serif font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Certificate Studio &amp; Styling</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Fonts, text colors, luxury backgrounds &amp; ledger parameters</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditDrawer(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer"
                  aria-label="Close editor"
                >
                  <X size={16} />
                </button>
              </div>

              <SettlementForm
                record={record}
                onChange={setRecord}
                onReset={handleReset}
                onSamplePrefill={handleSamplePrefill}
                defaultTab="styles"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

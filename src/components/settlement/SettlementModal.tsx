import React, { useState, useRef, useEffect } from 'react';
import { SettlementRecord } from '@/types/settlement';
import { SettlementCanvas } from './SettlementCanvas';
import { SettlementForm } from './SettlementForm';
import { SettlementToolbar } from './SettlementToolbar';
import { settlementService } from '@/services/settlementService';
import { X, Award, ShieldCheck, Sparkles } from 'lucide-react';

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
  const [zoom, setZoom] = useState(0.58);
  const canvasRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialRecord) {
      setRecord(initialRecord);
    }
  }, [initialRecord]);

  // Adjust default zoom on viewport resize to fit canvas
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (previewContainerRef.current) {
        const availableWidth = previewContainerRef.current.clientWidth - 32;
        const autoZoom = Math.min(0.9, Math.max(0.28, availableWidth / 1200));
        setZoom(autoZoom);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const handleFitWidth = () => {
    if (previewContainerRef.current) {
      const availableWidth = previewContainerRef.current.clientWidth - 48;
      const autoZoom = Math.min(1.0, Math.max(0.3, availableWidth / 1200));
      setZoom(autoZoom);
    }
  };

  const handleReset = () => {
    setRecord(settlementService.createSampleRecord());
  };

  const handleSamplePrefill = () => {
    setRecord(settlementService.createSampleRecord());
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[1550px] h-[94vh] bg-[#070A10] border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Header */}
        <div className="shrink-0 px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Award size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base text-slate-100">
                  B2B Withdrawal Certificate &amp; Settlement Generator
                </h2>
                <span
                  className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold ${
                    record.mode === 'verified'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {record.mode === 'verified' ? 'Authenticated Ledger' : 'Draft Preview'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Executive settlement announcements and official partner disbursement certificates.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Close generator"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Main Body (Split View) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Left Column: Form Editor Panel (Scrollable) */}
          <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 border-r border-slate-800 overflow-y-auto p-5 bg-[#080B12]/80 space-y-4">
            <SettlementForm
              record={record}
              onChange={setRecord}
              onReset={handleReset}
              onSamplePrefill={handleSamplePrefill}
            />
          </div>

          {/* Right Column: Interactive Canvas & Toolbar */}
          <div className="flex-1 flex flex-col bg-[#05070B] overflow-hidden min-w-0">
            {/* Pinned Action Toolbar */}
            <div className="shrink-0 p-4 border-b border-slate-800/80 bg-slate-950/60">
              <SettlementToolbar
                record={record}
                canvasRef={canvasRef}
                zoom={zoom}
                onZoomChange={setZoom}
                onFitWidth={handleFitWidth}
              />
            </div>

            {/* Canvas Scroll Area */}
            <div
              ref={previewContainerRef}
              className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center overscroll-contain bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.6),transparent_80%)]"
            >
              <div className="shadow-2xl rounded-2xl overflow-hidden border border-slate-800/60 transition-transform">
                <SettlementCanvas ref={canvasRef} record={record} scale={zoom} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

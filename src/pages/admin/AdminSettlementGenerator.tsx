import React, { useState, useRef, useEffect } from 'react';
import { SettlementRecord, SettlementTemplateType } from '@/types/settlement';
import { SettlementCanvas } from '@/components/settlement/SettlementCanvas';
import { SettlementForm } from '@/components/settlement/SettlementForm';
import { SettlementToolbar } from '@/components/settlement/SettlementToolbar';
import { settlementService } from '@/services/settlementService';
import { payoutService } from '@/services/payoutService';
import { WithdrawalRequest, Reward } from '@/types';
import { storage } from '@/services/storage';
import {
  Award,
  ShieldCheck,
  Building2,
  FileCheck2,
  AlertTriangle,
  History,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const AdminSettlementGenerator: React.FC = () => {
  const [record, setRecord] = useState<SettlementRecord>(() =>
    settlementService.createSampleRecord()
  );
  const [allWithdrawals, setAllWithdrawals] = useState<WithdrawalRequest[]>(() =>
    payoutService.getAllWithdrawals()
  );
  const [recentCertificates, setRecentCertificates] = useState<SettlementRecord[]>(() =>
    settlementService.getSavedCertificates()
  );
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string>('');
  const [zoom, setZoom] = useState(0.65);

  const canvasRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllWithdrawals(payoutService.getAllWithdrawals());
    setRecentCertificates(settlementService.getSavedCertificates());
  }, []);

  // Responsive auto-fit zoom
  useEffect(() => {
    const handleResize = () => {
      if (previewContainerRef.current) {
        const availableWidth = previewContainerRef.current.clientWidth - 48;
        const autoZoom = Math.min(0.85, Math.max(0.32, availableWidth / 1200));
        setZoom(autoZoom);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFitWidth = () => {
    if (previewContainerRef.current) {
      const availableWidth = previewContainerRef.current.clientWidth - 48;
      const autoZoom = Math.min(1.0, Math.max(0.32, availableWidth / 1200));
      setZoom(autoZoom);
    }
  };

  /**
   * Load real authoritative withdrawal into verified Mode A.
   */
  const handleSelectWithdrawal = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedWithdrawalId(id);
    if (!id) return;

    const target = allWithdrawals.find((w) => w.id === id);
    if (!target) return;

    const verifiedRecord = await settlementService.createRecordFromWithdrawal(target, {
      template: record.template,
    });
    setRecord(verifiedRecord);
    settlementService.saveCertificate(verifiedRecord);
    setRecentCertificates(settlementService.getSavedCertificates());
  };

  const handleReset = () => {
    setRecord(settlementService.createSampleRecord());
    setSelectedWithdrawalId('');
  };

  const handleSamplePrefill = () => {
    setRecord(settlementService.createSampleRecord());
    setSelectedWithdrawalId('');
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl selection:bg-cyan-500/25">
      {/* 1. Header Banner */}
      <div className="funding-card p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 w-64 h-64 bg-[radial-gradient(circle,rgba(6,182,212,0.1),transparent_70%)] blur-2xl" />

        <div className="space-y-1.5 z-10">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span className="funding-ghost-pill px-2.5 py-0.5 text-[10px] text-cyan-400 border-cyan-500/30">
              Treasury Operations
            </span>
            <span>•</span>
            <span>Settlement Attestation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 tracking-tight">
            B2B Withdrawal Certificate &amp; Settlement Generator
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Generate executive-grade payout receipts, partner milestone certificates, and institutional settlement announcements for records, investor relations, and corporate PR.
          </p>
        </div>

        {/* Quick Authoritative Record Pre-load */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto z-10 shrink-0">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
              Load Verified Payout Record
            </span>
            <select
              value={selectedWithdrawalId}
              onChange={handleSelectWithdrawal}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer max-w-xs"
            >
              <option value="">-- Mode B: Custom Demo Draft --</option>
              {allWithdrawals.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.id} · {w.userName} (PKR {w.amount.toLocaleString()}) - {w.status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Main Workstation: Split-View Editor & Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: Form Editor */}
        <div className="lg:col-span-5 space-y-4">
          <SettlementForm
            record={record}
            onChange={setRecord}
            onReset={handleReset}
            onSamplePrefill={handleSamplePrefill}
          />
        </div>

        {/* Right 7 Cols: Canvas Preview & Toolbar */}
        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-20">
          {/* Action Toolbar */}
          <SettlementToolbar
            record={record}
            canvasRef={canvasRef}
            zoom={zoom}
            onZoomChange={setZoom}
            onFitWidth={handleFitWidth}
          />

          {/* Canvas Viewport Frame */}
          <div
            ref={previewContainerRef}
            className="p-4 sm:p-6 rounded-3xl bg-[#06080E] border border-slate-800 shadow-2xl flex items-center justify-center overflow-auto min-h-[520px] max-h-[780px]"
          >
            <div className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] rounded-2xl overflow-hidden border border-slate-800/80 transition-all">
              <SettlementCanvas ref={canvasRef} record={record} scale={zoom} />
            </div>
          </div>

          {/* Quick Details Callout */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Target Render: 1600 × 1000 px High-DPI Output</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Selected Theme:</span>
              <span className="text-cyan-300 font-bold capitalize">
                {record.template.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettlementGenerator;

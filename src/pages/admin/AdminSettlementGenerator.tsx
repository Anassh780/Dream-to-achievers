import React, { useState, useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SettlementRecord, SettlementTemplateType } from '@/types/settlement';
import { SettlementCanvas } from '@/components/settlement/SettlementCanvas';
import { SettlementForm } from '@/components/settlement/SettlementForm';
import { SettlementToolbar } from '@/components/settlement/SettlementToolbar';
import { settlementService } from '@/services/settlementService';
import { payoutService } from '@/services/payoutService';
import { WithdrawalRequest, Reward } from '@/types';
import { storage } from '@/services/storage';
import {
  Crown,
  Award,
  ShieldCheck,
  Building2,
  FileCheck2,
  SlidersHorizontal,
  Package,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';

export const AdminSettlementGenerator: React.FC = () => {
  const { user } = useAuth();

  // Strict Admin-Only Guard: Resellers cannot access this studio
  if (user && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

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
  const [zoom, setZoom] = useState(0.72);
  const [showEditDrawer, setShowEditDrawer] = useState(false);

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
        const isPortrait =
          !record.template ||
          record.template === 'funding_pips_portrait' ||
          record.template === 'emerald_website_ui';
        const baseWidth = isPortrait ? 600 : 1200;
        const baseHeight = isPortrait ? 840 : 750;

        const availableWidth = previewContainerRef.current.clientWidth - 48;
        const availableHeight = previewContainerRef.current.clientHeight - 48;
        const widthScale = availableWidth / baseWidth;
        const heightScale = availableHeight > 0 ? availableHeight / baseHeight : 1;
        const autoZoom = Math.min(isPortrait ? 0.95 : 0.92, Math.max(0.3, Math.min(widthScale, heightScale || widthScale)));
        setZoom(autoZoom);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showEditDrawer, record.template]);

  const handleFitWidth = () => {
    if (previewContainerRef.current) {
      const isPortrait =
        !record.template ||
        record.template === 'funding_pips_portrait' ||
        record.template === 'emerald_website_ui';
      const baseWidth = isPortrait ? 600 : 1200;
      const baseHeight = isPortrait ? 840 : 750;

      const availableWidth = previewContainerRef.current.clientWidth - 48;
      const autoZoom = Math.min(1.0, Math.max(0.32, availableWidth / baseWidth));
      setZoom(autoZoom);
    }
  };

  /**
   * Load real authoritative withdrawal into verified VIP Mode automatically.
   */
  const handleSelectWithdrawal = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedWithdrawalId(id);
    if (!id) return;

    const target = allWithdrawals.find((w) => w.id === id);
    if (!target) return;

    // Pull user sales to calculate total products sold
    const userSales = storage.get<any[]>('SALES', []).filter((s: any) => s.userId === target.userId);
    const totalProducts = userSales
      .filter((s: any) => s.status !== 'cancelled' && s.status !== 'rejected')
      .reduce((sum: number, s: any) => sum + (Number(s.quantity) || 1), 0);

    const verifiedRecord = await settlementService.createRecordFromWithdrawal(target, {
      recipientName: target.userName,
      totalProductsSold: totalProducts > 0 ? totalProducts : (userSales.length > 0 ? userSales.length : 1),
      template: record.template || 'funding_pips_portrait',
    });

    setRecord(verifiedRecord);
    settlementService.saveCertificate(verifiedRecord);
    setRecentCertificates(settlementService.getSavedCertificates());
  };

  const handleTemplateChange = (newTemplate: SettlementTemplateType) => {
    const updated = { ...record, template: newTemplate };
    setRecord(updated);
    settlementService.saveCertificate(updated);
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
    <div className="space-y-6 font-sans max-w-7xl selection:bg-amber-500/25">
      {/* 1. Header Banner */}
      <div className="funding-card p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden border-amber-500/20">
        <div className="pointer-events-none absolute -right-20 -top-20 w-72 h-72 bg-[radial-gradient(circle,rgba(245,158,11,0.12),transparent_70%)] blur-2xl" />

        <div className="space-y-1.5 z-10">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span className="funding-ghost-pill px-2.5 py-0.5 text-[10px] text-amber-400 border-amber-500/30 font-bold flex items-center gap-1">
              <Crown size={12} className="text-amber-400" />
              VIP Treasury Protocol
            </span>
            <span>•</span>
            <span>Funding Pips Auto Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-100 tracking-tight flex items-center gap-2">
            <span>VIP Payout Certificate Hub</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Auto-generate high-prestige, luxury VIP payout certificates with recipient name, verified disbursement amount,
            and total products sold milestone. Zero manual typing required.
          </p>
        </div>

        {/* Quick Authoritative Record Pre-load */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto z-10 shrink-0">
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-1.5 shadow-md">
            <span className="text-[10px] font-mono uppercase text-amber-300 block font-bold flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              Select Payout to Auto-Generate
            </span>
            <select
              value={selectedWithdrawalId}
              onChange={handleSelectWithdrawal}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono font-semibold text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer max-w-xs"
            >
              <option value="">-- Mode B: Sample VIP Demo --</option>
              {allWithdrawals.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.userName} · PKR {w.amount.toLocaleString()} ({w.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Main Workstation: Certificate Showcase & Toolbar */}
      <div className="space-y-4">
        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SettlementToolbar
            record={record}
            canvasRef={canvasRef}
            zoom={zoom}
            onZoomChange={setZoom}
            onFitWidth={handleFitWidth}
            onTemplateChange={handleTemplateChange}
          />

          <button
            type="button"
            onClick={() => setShowEditDrawer(!showEditDrawer)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-mono inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              showEditDrawer
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>{showEditDrawer ? 'Hide Overrides' : 'Custom Overrides'}</span>
          </button>
        </div>

        {/* Workstation Body */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Main Canvas Viewport Frame */}
          <div
            ref={previewContainerRef}
            className="flex-1 w-full p-4 sm:p-8 rounded-3xl bg-[#05070C] border border-amber-500/25 shadow-2xl flex items-center justify-center overflow-auto min-h-[560px]"
          >
            <div className="w-full flex items-center justify-center">
              <SettlementCanvas ref={canvasRef} record={record} scale={zoom} />
            </div>
          </div>

          {/* Optional Side Editor Drawer for Overrides */}
          {showEditDrawer && (
            <div className="w-full lg:w-[460px] shrink-0 border border-slate-800 rounded-3xl bg-[#080B12]/95 p-5 space-y-4 shadow-2xl animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-serif font-bold text-sm text-slate-100">Optional Overrides</h3>
                <span className="text-[10px] font-mono text-amber-400">Real-time sync</span>
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

      {/* 3. Recently Generated VIP Certificates History */}
      {recentCertificates.length > 0 && (
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-slate-200 flex items-center gap-2">
              <Crown size={15} className="text-amber-400" />
              <span>Recently Generated VIP Certificates</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{recentCertificates.length} Records</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentCertificates.slice(0, 6).map((cert) => (
              <div
                key={cert.id}
                onClick={() => setRecord(cert)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  record.id === cert.id
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-amber-400 block">{cert.id}</span>
                  <p className="font-bold text-xs text-slate-100 truncate">
                    {cert.recipientName || cert.businessName}
                  </p>
                  <span className="text-[10px] font-mono text-slate-400">
                    {cert.currency} {Number(cert.amount || 0).toLocaleString()} • {cert.totalProductsSold || 1} sold
                  </span>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-200 hover:text-white"
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

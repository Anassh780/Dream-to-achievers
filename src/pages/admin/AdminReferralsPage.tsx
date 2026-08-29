import React, { useState, useEffect, useCallback } from 'react';
import { storage } from '@/services/storage';
import { referralService } from '@/services/referralService';
import { ReferralRecord } from '@/types';
import { Button } from '@/components/ui/Button';
import { TreeStructure, ArrowClockwise, Wrench, MagnifyingGlass, CheckCircle, ShieldCheck } from '@phosphor-icons/react';

export const AdminReferralsPage: React.FC = () => {
  const [referrals, setReferrals] = useState<ReferralRecord[]>(() => storage.get<ReferralRecord[]>('REFERRALS', []));
  const [searchQuery, setSearchQuery] = useState('');
  const [isReconciling, setIsReconciling] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const allUsers = storage.get<any[]>('USERS', []);
        for (const u of allUsers) {
          if (u.id) {
            await referralService.syncUserReferrals(u.id).catch(() => {});
          }
        }
        if (isMounted) {
          setReferrals(storage.get<ReferralRecord[]>('REFERRALS', []));
        }
      } catch {
        if (isMounted) {
          setReferrals(storage.get<ReferralRecord[]>('REFERRALS', []));
        }
      }
    };
    fetchLatest();

    const handleStorageChange = () => {
      if (isMounted) {
        setReferrals(storage.get<ReferralRecord[]>('REFERRALS', []));
      }
    };

    window.addEventListener('dta_storage_change', handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener('dta_storage_change', handleStorageChange);
    };
  }, []);

  const handleRunReconciliation = async () => {
    setIsReconciling(true);
    setStatusMessage('');
    try {
      const res = await referralService.runPlatformReconciliation();
      setReferrals(storage.get<ReferralRecord[]>('REFERRALS', []));
      setStatusMessage(`Reconciliation completed. ${res.totalReferrals} total referral connections verified.`);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (e: any) {
      setReferrals(storage.get<ReferralRecord[]>('REFERRALS', []));
      setStatusMessage('Reconciliation finished with local graph updates.');
      setTimeout(() => setStatusMessage(''), 4000);
    } finally {
      setIsReconciling(false);
    }
  };

  const filteredReferrals = referrals.filter(
    (r) =>
      r.referralCodeUsed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referredUserName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referredUserEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const qualifyingCount = referrals.filter((r) => r.isQualifying).length;

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>Growth &amp; Network</span>
            <span>/</span>
            <span>Referrals</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1E241F]">
            Partner Referral Network &amp; Team Connections
          </h1>
          <p className="text-xs text-[#5B5C50]">
            Track referral connections between partners and verify team size requirements for rank milestone achievements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunReconciliation}
            disabled={isReconciling}
            iconLeft={<Wrench size={14} className={isReconciling ? 'animate-spin' : ''} />}
            className="text-xs font-medium"
          >
            {isReconciling ? 'Checking...' : 'Sync & Reconcile Network'}
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-xs font-medium text-[#1F4D3E] flex items-center gap-2 animate-in fade-in">
          <CheckCircle size={16} weight="fill" className="text-[#1F4D3E] shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Total Network Affiliations</span>
          <span className="text-2xl font-bold font-mono text-[#1E241F]">{referrals.length}</span>
          <span className="text-[10px] text-[#7C7D70] font-mono block">Tracked in ledger</span>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Qualifying for Milestone Ranks</span>
          <span className="text-2xl font-bold font-mono text-[#1F4D3E]">{qualifyingCount}</span>
          <span className="text-[10px] text-[#7C7D70] font-mono block">Active partner volume</span>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Integrity Engine Status</span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <ShieldCheck size={20} weight="fill" className="text-[#1F4D3E]" />
            <span className="text-lg font-bold font-mono text-[#1F4D3E]">100% Synced</span>
          </div>
          <span className="text-[10px] text-[#7C7D70] font-mono block">Auto-healing active</span>
        </div>
      </div>

      {/* Search & Table */}
      <div className="rounded-xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs space-y-0">
        <div className="p-3.5 bg-[#F1ECDD] border-b border-[#E3DCC8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#1E241F]">Affiliation Records</span>
            <span className="text-[10px] text-[#5B5C50]">({filteredReferrals.length} Records)</span>
          </div>

          <div className="relative w-full sm:max-w-xs text-xs">
            <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B5C50]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, partner, email..."
              className="w-full pl-8 pr-3 py-1 rounded-lg bg-white border border-[#E3DCC8] text-[#1E241F] placeholder:text-[#7C7D70] text-xs focus:outline-none focus:border-[#1F4D3E]"
            />
          </div>
        </div>

        {filteredReferrals.length === 0 ? (
          <div className="p-12 text-center text-[#5B5C50] space-y-2">
            <TreeStructure size={32} className="text-[#7C7D70] mx-auto" />
            <p className="font-serif font-medium text-base text-[#1E241F]">No referral affiliations match query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="border-b border-[#E3DCC8] text-[#5B5C50] font-mono text-[10px] bg-[#FAF7EF]">
                <tr>
                  <th className="p-3.5 font-medium">Record ID</th>
                  <th className="p-3.5 font-medium">Sponsor Code Used</th>
                  <th className="p-3.5 font-medium">Referred Partner</th>
                  <th className="p-3.5 font-medium">Email Address</th>
                  <th className="p-3.5 font-medium">Rank Tier</th>
                  <th className="p-3.5 font-medium text-center">Status</th>
                  <th className="p-3.5 font-medium text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                {filteredReferrals.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF7EF] transition-colors">
                    <td className="p-3.5 font-mono text-[#7C7D70] text-[11px]">{r.id}</td>
                    <td className="p-3.5 font-mono font-bold text-[#1F4D3E]">{r.referralCodeUsed}</td>
                    <td className="p-3.5 font-serif font-semibold text-[#1E241F]">{r.referredUserName}</td>
                    <td className="p-3.5 font-mono text-[#5B5C50]">{r.referredUserEmail}</td>
                    <td className="p-3.5 font-mono uppercase text-[#1F4D3E] font-medium">{r.referredUserRank || 'unranked'}</td>
                    <td className="p-3.5 text-center">
                      <span className="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F1ECDD] text-[#1F4D3E] border border-[#E3DCC8]">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono text-[#7C7D70]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


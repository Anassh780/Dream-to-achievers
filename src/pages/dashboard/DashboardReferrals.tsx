import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { referralService } from '@/services/referralService';
import { Button } from '@/components/ui/Button';
import { Copy, Check, Users } from '@phosphor-icons/react';

export const DashboardReferrals: React.FC = () => {
  const { user, rankProgress, refreshUserData } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState(() => (user ? referralService.getUserReferrals(user.id) : []));

  useEffect(() => {
    if (!user) return;
    referralService.syncUserReferrals(user.id).then((synced) => {
      setReferrals(synced);
      refreshUserData();
    }).catch(() => {
      setReferrals(referralService.getUserReferrals(user.id));
    });

    const handleStorageChange = () => {
      if (user) setReferrals(referralService.getUserReferrals(user.id));
    };

    window.addEventListener('dta_storage_change', handleStorageChange);
    return () => window.removeEventListener('dta_storage_change', handleStorageChange);
  }, [user, refreshUserData]);

  if (!user || !rankProgress) return null;

  const referralUrl = referralService.getReferralUrl(user.referralCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-[#E3DCC8]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
          <span>Network</span>
          <span>/</span>
          <span>Partner Network</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1E241F] tracking-tight">
          Partner Network &amp; Community Growth
        </h1>
        <p className="text-xs text-[#5B5C50]">
          Monitor your direct distributor team members. Active verified members count toward Level 01–04 milestone rank unlocks.
        </p>
      </div>

      {/* Shareable Link Box */}
      <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 text-xs shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E3DCC8]">
          <div>
            <h3 className="font-serif text-base font-medium text-[#1E241F]">Your Unique Partner Referral Link</h3>
            <p className="text-[11px] text-[#5B5C50]">Share this link with prospective resellers to attribute registrations permanently to your team.</p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#F1ECDD] text-[#1F4D3E] font-bold border border-[#E3DCC8]">
            Code: {user.referralCode}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex-1 p-2.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] font-mono text-xs text-[#1E241F] break-all select-all">
            {referralUrl}
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleCopy}
            className="shrink-0 text-xs font-medium"
            iconLeft={copied ? <Check size={14} /> : <Copy size={14} />}
          >
            {copied ? 'Link Copied' : 'Copy Referral Link'}
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Direct Team Partners</span>
          <span className="text-2xl font-bold font-mono text-[#1E241F]">{referrals.length}</span>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Active / Qualifying for Level</span>
          <span className="text-2xl font-bold font-mono text-[#1F4D3E]">{rankProgress.qualifyingCommunity}</span>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Attribution Security</span>
          <span className="text-2xl font-bold font-mono text-[#B8862E]">100% Immutable</span>
        </div>
      </div>

      {/* Downline Table */}
      <div className="rounded-xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs">
        <div className="p-3.5 bg-[#F1ECDD] border-b border-[#E3DCC8] flex items-center justify-between font-mono">
          <span className="font-semibold text-[#1E241F]">Team Partner Directory</span>
          <span className="text-[10px] text-[#5B5C50]">{referrals.length} Members</span>
        </div>

        {referrals.length === 0 ? (
          <div className="p-12 text-center text-[#5B5C50] space-y-2">
            <Users size={32} className="text-[#7C7D70] mx-auto" />
            <p className="font-serif font-medium text-base text-[#1E241F]">No team members referred yet</p>
            <p className="text-xs">Share your referral link to onboard new distributor partners.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="border-b border-[#E3DCC8] text-[#5B5C50] font-mono text-[10px] bg-[#FAF7EF]">
                <tr>
                  <th className="p-3.5 font-medium">Partner Name</th>
                  <th className="p-3.5 font-medium">Email Address</th>
                  <th className="p-3.5 font-medium">Current Level</th>
                  <th className="p-3.5 font-medium text-center">Status</th>
                  <th className="p-3.5 font-medium text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-[#FAF7EF] transition-colors">
                    <td className="p-3.5 font-serif font-semibold text-[#1E241F]">{ref.referredUserName}</td>
                    <td className="p-3.5 font-mono text-[#5B5C50]">{ref.referredUserEmail}</td>
                    <td className="p-3.5 font-mono uppercase text-[#1F4D3E] font-medium">{ref.referredUserRank}</td>
                    <td className="p-3.5 text-center">
                      <span className="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F1ECDD] text-[#1F4D3E] border border-[#E3DCC8]">
                        {ref.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono text-[#7C7D70]">
                      {new Date(ref.createdAt).toLocaleDateString()}
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

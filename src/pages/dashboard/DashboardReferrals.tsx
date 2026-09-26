import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { referralService } from '@/services/referralService';
import { Button } from '@/components/ui/Button';
import { Copy, Check, Users, ArrowClockwise, ShareNetwork, WhatsappLogo, ShieldCheck } from '@phosphor-icons/react';

export const DashboardReferrals: React.FC = () => {
  const { user, rankProgress, refreshUserData } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [referrals, setReferrals] = useState<any[]>(() => (user ? referralService.getUserReferrals(user.id) : []));

  // Manual sync triggered on button click
  const handleManualSync = async () => {
    if (!user || isSyncing) return;
    setIsSyncing(true);
    setSyncMessage('');
    try {
      const synced = await referralService.syncUserReferrals(user.id);
      setReferrals(synced);
      refreshUserData();
      setSyncMessage('Team network synchronized successfully.');
      setTimeout(() => setSyncMessage(''), 3500);
    } catch {
      setReferrals(referralService.getUserReferrals(user.id));
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial silent background sync on component mount
  useEffect(() => {
    if (!user) return;
    
    let isMounted = true;
    referralService.syncUserReferrals(user.id).then((synced) => {
      if (isMounted) {
        setReferrals(synced);
        refreshUserData();
      }
    }).catch(() => {
      if (isMounted) {
        setReferrals(referralService.getUserReferrals(user.id));
      }
    });

    const handleStorageChange = () => {
      if (isMounted && user) {
        setReferrals(referralService.getUserReferrals(user.id));
      }
    };

    window.addEventListener('dta_storage_change', handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener('dta_storage_change', handleStorageChange);
    };
  }, [user?.id]);

  if (!user || !rankProgress) return null;

  const referralUrl = referralService.getReferralUrl(user.referralCode);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Join my partner distribution team on Dream to Achievers and access wholesale catalog margins with milestone bonuses!\n\nSign up using my link: ${referralUrl}\nOr use sponsor code: ${user.referralCode}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl selection:bg-[#D9C08A]/25">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#9EABA2]">
            <span className="funding-ghost-pill px-2.5 py-0.5 text-[10px] text-[#34D399] border-[#34D399]/30">Network</span>
            <span>/</span>
            <span>Partner Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F4F7F5] tracking-tight">
            Partner Network &amp; Community Growth
          </h1>
          <p className="text-xs text-[#9EABA2]">
            Monitor your direct distributor team members. Active verified members count toward Level 01–04 milestone rank unlocks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="funding-ghost-pill px-4 py-2 text-xs font-medium text-[#F4F7F5] hover:border-white/20 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
          >
            <ArrowClockwise size={14} className={isSyncing ? 'animate-spin text-[#34D399]' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Network'}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3.5 rounded-2xl bg-[#34D399]/15 border border-[#34D399]/30 text-xs font-semibold text-[#34D399] flex items-center gap-2 animate-in fade-in">
          <Check size={16} weight="bold" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Shareable Link Box */}
      <div className="funding-card p-6 sm:p-7 space-y-4 text-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-white/[0.08]">
          <div>
            <h3 className="font-serif text-base font-bold text-[#F4F7F5]">Your Unique Partner Referral Link</h3>
            <p className="text-[11px] text-[#9EABA2]">Share this link with prospective resellers to attribute registrations permanently to your team.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              title="Click to copy sponsor code"
              className="funding-ghost-pill font-mono text-xs px-3 py-1 text-[#D9C08A] font-bold border-[#D9C08A]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Code: {user.referralCode}</span>
              {copiedCode ? <Check size={13} className="text-[#34D399]" /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-xs text-[#F4F7F5] break-all select-all">
            {referralUrl}
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="funding-sheen-btn px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              {copiedLink ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
              <span>{copiedLink ? 'Link Copied' : 'Copy Referral Link'}</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="funding-ghost-pill px-4 py-2.5 text-xs font-medium text-[#25D366] hover:border-[#25D366]/40 flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <WhatsappLogo size={16} weight="fill" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-1 relative overflow-hidden group">
          <span className="text-xs text-[#9EABA2] font-mono block">Direct Team Partners</span>
          <span className="text-2xl font-bold font-mono text-[#F4F7F5] block">{referrals.length}</span>
          <span className="text-[10px] text-[#9EABA2] font-mono block">Registered Resellers</span>
        </div>
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-1 relative overflow-hidden group border-[#34D399]/30 hover:border-[#34D399]/50">
          <span className="text-xs text-[#34D399] font-mono font-medium block">Active / Qualifying for Level</span>
          <span className="text-2xl font-bold font-mono text-[#34D399] block">{rankProgress.qualifyingCommunity}</span>
          <span className="text-[10px] text-[#9EABA2] font-mono block">Counts toward milestone ranks</span>
        </div>
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-1 relative overflow-hidden group border-[#D9C08A]/30 hover:border-[#D9C08A]/50">
          <span className="text-xs text-[#D9C08A] font-mono font-medium block">Attribution Security</span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <ShieldCheck size={20} weight="fill" className="text-[#34D399]" />
            <span className="text-lg font-bold font-mono text-[#F4F7F5]">Cloud Verified</span>
          </div>
          <span className="text-[10px] text-[#9EABA2] font-mono block">Multi-database redundancy</span>
        </div>
      </div>

      {/* Downline Table */}
      <div className="funding-table-wrap text-xs shadow-xl">
        <div className="p-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between font-mono">
          <span className="font-semibold text-[#F4F7F5]">Team Partner Directory</span>
          <span className="text-[10px] text-[#9EABA2]">{referrals.length} Members</span>
        </div>

        {referrals.length === 0 ? (
          <div className="p-12 text-center text-[#9EABA2] space-y-2">
            <Users size={32} className="text-[#9EABA2]/60 mx-auto" />
            <p className="font-serif font-bold text-base text-[#F4F7F5]">No team members referred yet</p>
            <p className="text-xs text-[#9EABA2]">Share your referral link or sponsor code to onboard new distributor partners.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full touch-pan-x overscroll-x-contain">
            <table className="w-full min-w-[750px] text-left font-sans border-collapse">
              <thead className="border-b border-white/[0.08] text-[#9EABA2] font-mono text-[10px] bg-white/[0.02]">
                <tr>
                  <th className="p-3.5 font-medium min-w-[160px]">Partner Name</th>
                  <th className="p-3.5 font-medium min-w-[180px]">Email Address</th>
                  <th className="p-3.5 font-medium min-w-[130px] whitespace-nowrap">Current Level</th>
                  <th className="p-3.5 font-medium text-center min-w-[110px] whitespace-nowrap">Status</th>
                  <th className="p-3.5 font-medium text-right min-w-[120px] whitespace-nowrap">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-[#9EABA2]">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-3.5 font-serif font-semibold text-[#F4F7F5] min-w-[160px]">{ref.referredUserName || 'Teammate'}</td>
                    <td className="p-3.5 font-mono text-[#9EABA2] min-w-[180px] truncate">{ref.referredUserEmail || '—'}</td>
                    <td className="p-3.5 font-mono uppercase text-[#34D399] font-medium min-w-[130px] whitespace-nowrap">{ref.referredUserRank || 'unranked'}</td>
                    <td className="p-3.5 text-center min-w-[110px] whitespace-nowrap">
                      <span className="inline-block text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30 whitespace-nowrap">
                        {ref.status || 'active'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono text-[#9EABA2] min-w-[120px] whitespace-nowrap">
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


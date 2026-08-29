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
    <div className="space-y-6 font-sans max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
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

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSync}
            disabled={isSyncing}
            iconLeft={<ArrowClockwise size={14} className={isSyncing ? 'animate-spin text-[#1F4D3E]' : ''} />}
            className="text-xs"
          >
            {isSyncing ? 'Syncing...' : 'Sync Network'}
          </Button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-xs font-medium text-[#1F4D3E] flex items-center gap-2 animate-in fade-in">
          <Check size={14} weight="bold" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Shareable Link Box */}
      <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 text-xs shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E3DCC8]">
          <div>
            <h3 className="font-serif text-base font-medium text-[#1E241F]">Your Unique Partner Referral Link</h3>
            <p className="text-[11px] text-[#5B5C50]">Share this link with prospective resellers to attribute registrations permanently to your team.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              title="Click to copy sponsor code"
              className="font-mono text-xs px-2.5 py-1 rounded bg-[#F1ECDD] hover:bg-[#E3DCC8] text-[#1F4D3E] font-bold border border-[#E3DCC8] transition-colors flex items-center gap-1.5"
            >
              <span>Code: {user.referralCode}</span>
              {copiedCode ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex-1 p-2.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] font-mono text-xs text-[#1E241F] break-all select-all">
            {referralUrl}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={handleCopyLink}
              className="text-xs font-medium"
              iconLeft={copiedLink ? <Check size={14} /> : <Copy size={14} />}
            >
              {copiedLink ? 'Link Copied' : 'Copy Referral Link'}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleShareWhatsApp}
              className="text-xs font-medium text-[#25D366] hover:bg-[#25D366]/10 border-[#E3DCC8]"
              iconLeft={<WhatsappLogo size={16} weight="fill" />}
            >
              WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Direct Team Partners</span>
          <span className="text-2xl font-bold font-mono text-[#1E241F]">{referrals.length}</span>
          <span className="text-[10px] text-[#7C7D70] font-mono block">Registered Resellers</span>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Active / Qualifying for Level</span>
          <span className="text-2xl font-bold font-mono text-[#1F4D3E]">{rankProgress.qualifyingCommunity}</span>
          <span className="text-[10px] text-[#7C7D70] font-mono block">Counts toward milestone ranks</span>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Attribution Security</span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <ShieldCheck size={20} weight="fill" className="text-[#1F4D3E]" />
            <span className="text-lg font-bold font-mono text-[#1F4D3E]">Cloud Verified</span>
          </div>
          <span className="text-[10px] text-[#7C7D70] font-mono block">Multi-database redundancy</span>
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
            <p className="text-xs">Share your referral link or sponsor code to onboard new distributor partners.</p>
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


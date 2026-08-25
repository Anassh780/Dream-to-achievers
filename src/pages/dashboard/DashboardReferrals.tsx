import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { referralService } from '@/services/referralService';
import { Button } from '@/components/ui/Button';
import { Copy, Check, ShareNetwork } from '@phosphor-icons/react';

export const DashboardReferrals: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const referrals = referralService.getUserReferrals(user.id);
  const qualifyingCount = referralService.getQualifyingCommunityCount(user.id);
  const referralUrl = referralService.getReferralUrl(user.referralCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Dream to Achievers Partner Network',
        text: `Join my partner team on Dream to Achievers using referral code ${user.referralCode}!`,
        url: referralUrl,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
          <span>Community</span>
          <span>•</span>
          <span>Partner Network</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
          Referrals & Community Roster
        </h1>
        <p className="text-xs sm:text-sm text-[#8996A8]">
          Share your referral code to grow your partner network and unlock rank milestones.
        </p>
      </div>

      {/* Referral Link Sharing Card */}
      <div className="p-6 rounded-2xl bg-[#111A27] border border-white/[0.08] space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-sm font-semibold text-white">Your Referral Link</h3>
            <p className="text-xs text-[#8996A8]">Partners who register using this link are attributed to your team.</p>
          </div>
          <span className="text-xs font-mono text-[#60A5FA] bg-[#3B82F6]/10 px-2.5 py-1 rounded">
            CODE: {user.referralCode}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex-1 p-2.5 rounded-lg bg-[#0D141F] border border-white/[0.06] font-mono text-xs text-[#CBD5E1] break-all select-all">
            {referralUrl}
          </div>
          <Button variant="primary" size="md" onClick={handleCopy} className="shrink-0">
            {copied ? <Check size={15} className="mr-1.5" /> : <Copy size={15} className="mr-1.5" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </Button>
          <Button variant="secondary" size="md" onClick={handleNativeShare} className="shrink-0">
            <ShareNetwork size={15} className="mr-1.5" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08]">
          <span className="text-xs text-[#8996A8] block">Verified Members</span>
          <span className="text-2xl font-bold text-white">{qualifyingCount}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08]">
          <span className="text-xs text-[#8996A8] block">Attribution Rate</span>
          <span className="text-2xl font-bold text-[#22C55E]">100%</span>
        </div>
        <div className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08]">
          <span className="text-xs text-[#8996A8] block">Rank Contribution</span>
          <span className="text-2xl font-bold text-white">+{qualifyingCount} Units</span>
        </div>
      </div>

      {/* Community Members Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#111A27] overflow-hidden text-xs">
        <div className="p-3.5 bg-[#0D141F] border-b border-white/[0.06] flex items-center justify-between">
          <span className="font-semibold text-white">Team Directory ({referrals.length})</span>
          <span className="text-xs text-[#8996A8]">Verified Registrations</span>
        </div>

        {referrals.length === 0 ? (
          <div className="p-8 text-center text-[#8996A8]">No community members registered under your code yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/[0.06] text-[#8996A8] text-[11px]">
                <tr>
                  <th className="p-3.5 font-medium">Partner Name</th>
                  <th className="p-3.5 font-medium">Email</th>
                  <th className="p-3.5 font-medium text-center">Rank Tier</th>
                  <th className="p-3.5 font-medium text-center">Status</th>
                  <th className="p-3.5 font-medium text-right">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-[#CBD5E1]">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5 font-medium text-white">{ref.referredUserName}</td>
                    <td className="p-3.5 text-[#8996A8]">{ref.referredUserEmail}</td>
                    <td className="p-3.5 text-center">
                      <span className="text-[10px] font-medium capitalize px-2 py-0.5 rounded bg-white/5 text-[#CBD5E1]">
                        {ref.referredUserRank}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="text-[10px] font-medium capitalize px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#4ADE80]">
                        {ref.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right text-[#8996A8]">
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

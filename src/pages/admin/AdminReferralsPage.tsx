import React from 'react';
import { storage } from '@/services/storage';
import { ReferralRecord, User } from '@/types';

export const AdminReferralsPage: React.FC = () => {
  const referrals = storage.get<ReferralRecord[]>('REFERRALS', []);
  const users = storage.get<User[]>('USERS', []);

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.fullName || userId;
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
          <span>Admin</span>
          <span>•</span>
          <span>Community Attribution</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
          Referral Network Audits
        </h1>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#111A27] overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/[0.06] text-[#8996A8] text-[11px]">
              <tr>
                <th className="p-3.5 font-medium">Attribution ID</th>
                <th className="p-3.5 font-medium">Inviting Partner</th>
                <th className="p-3.5 font-medium">Referred Member</th>
                <th className="p-3.5 font-medium">Code Used</th>
                <th className="p-3.5 font-medium text-center">Status</th>
                <th className="p-3.5 font-medium text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#CBD5E1]">
              {referrals.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="p-3.5 font-mono text-[#8996A8]">{r.id}</td>
                  <td className="p-3.5 font-medium text-white">{getUserName(r.referrerId)}</td>
                  <td className="p-3.5 text-[#CBD5E1]">{r.referredUserName} ({r.referredUserEmail})</td>
                  <td className="p-3.5 font-mono text-white font-medium">{r.referralCodeUsed}</td>
                  <td className="p-3.5 text-center">
                    <span className="text-[10px] font-medium capitalize px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#4ADE80]">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right text-[#8996A8]">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

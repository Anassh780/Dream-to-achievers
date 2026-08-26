import React from 'react';
import { storage } from '@/services/storage';
import { ReferralRecord } from '@/types';
import { TreeStructure } from '@phosphor-icons/react';

export const AdminReferralsPage: React.FC = () => {
  const referrals = storage.get<ReferralRecord[]>('REFERRALS', []);

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      <div className="space-y-1 pb-4 border-b border-[#E3DCC8]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
          <span>Network</span>
          <span>/</span>
          <span>Referral Graph</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1E241F]">
          Referral Attribution Engine &amp; Tree Audit
        </h1>
        <p className="text-xs text-[#5B5C50]">
          Immutable ledger of sponsor-partner affiliations powering the dual-qualification milestone engine.
        </p>
      </div>

      <div className="rounded-xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs">
        <div className="p-3.5 bg-[#F1ECDD] border-b border-[#E3DCC8] flex items-center justify-between font-mono">
          <span className="font-semibold text-[#1E241F]">Affiliation Records</span>
          <span className="text-[10px] text-[#5B5C50]">{referrals.length} Total</span>
        </div>

        {referrals.length === 0 ? (
          <div className="p-12 text-center text-[#5B5C50] space-y-2">
            <TreeStructure size={32} className="text-[#7C7D70] mx-auto" />
            <p className="font-serif font-medium text-base text-[#1E241F]">No referral affiliations recorded yet</p>
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
                  <th className="p-3.5 font-medium text-center">Status</th>
                  <th className="p-3.5 font-medium text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                {referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAF7EF] transition-colors">
                    <td className="p-3.5 font-mono text-[#7C7D70]">{r.id}</td>
                    <td className="p-3.5 font-mono font-bold text-[#1F4D3E]">{r.referralCodeUsed}</td>
                    <td className="p-3.5 font-serif font-semibold text-[#1E241F]">{r.referredUserName}</td>
                    <td className="p-3.5 font-mono text-[#5B5C50]">{r.referredUserEmail}</td>
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

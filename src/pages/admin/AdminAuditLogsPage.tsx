import React from 'react';
import { auditService } from '@/services/auditService';

export const AdminAuditLogsPage: React.FC = () => {
  const logs = auditService.getLogs();

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
          <span>Admin</span>
          <span>•</span>
          <span>Security & Compliance</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
          System Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-[#8996A8]">
          Chronological record of manual rank overrides, threshold changes, and payout approvals.
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#111A27] overflow-hidden text-xs">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-[#8996A8]">
            No administrative audit events recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/[0.06] text-[#8996A8] text-[11px]">
                <tr>
                  <th className="p-3.5 font-medium">Log ID</th>
                  <th className="p-3.5 font-medium">Action</th>
                  <th className="p-3.5 font-medium">Admin</th>
                  <th className="p-3.5 font-medium">Entity</th>
                  <th className="p-3.5 font-medium">Details</th>
                  <th className="p-3.5 font-medium text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-[#CBD5E1]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5 font-mono text-[#8996A8]">{log.id}</td>
                    <td className="p-3.5 font-medium text-white">{log.action}</td>
                    <td className="p-3.5 text-[#8996A8]">{log.adminEmail}</td>
                    <td className="p-3.5 font-mono text-[#60A5FA] uppercase">{log.entityType} #{log.entityId}</td>
                    <td className="p-3.5 text-[#CBD5E1]">{log.details}</td>
                    <td className="p-3.5 text-right text-[#8996A8]">
                      {new Date(log.timestamp).toLocaleString()}
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

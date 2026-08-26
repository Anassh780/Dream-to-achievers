import React, { useState } from 'react';
import { storage } from '@/services/storage';
import { AdminAuditLog } from '@/types';
import { Scroll } from '@phosphor-icons/react';

export const AdminAuditLogsPage: React.FC = () => {
  const logs = storage.get<AdminAuditLog[]>('AUDIT_LOGS', []);
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = filterAction === 'all' ? logs : logs.filter((l) => l.action.toLowerCase().includes(filterAction.toLowerCase()));

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>Security</span>
            <span>/</span>
            <span>Audit Trail</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1E241F]">
            System Operations &amp; Audit Logs
          </h1>
          <p className="text-xs text-[#5B5C50]">
            Tamper-resistant audit registry capturing all admin modifications, rank promotions, and catalog adjustments.
          </p>
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white border border-[#E3DCC8] text-xs text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
        >
          <option value="all">All Actions</option>
          <option value="user">User Actions</option>
          <option value="product">Product Actions</option>
          <option value="category">Category Actions</option>
          <option value="reward">Reward Actions</option>
        </select>
      </div>

      <div className="rounded-xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs">
        <div className="p-3.5 bg-[#F1ECDD] border-b border-[#E3DCC8] flex items-center justify-between font-mono">
          <span className="font-semibold text-[#1E241F]">Audit Log Records</span>
          <span className="text-[10px] text-[#5B5C50]">{filteredLogs.length} Events Logged</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-[#5B5C50] space-y-2">
            <Scroll size={32} className="text-[#7C7D70] mx-auto" />
            <p className="font-serif font-medium text-base text-[#1E241F]">No audit log records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="border-b border-[#E3DCC8] text-[#5B5C50] font-mono text-[10px] bg-[#FAF7EF]">
                <tr>
                  <th className="p-3.5 font-medium">Log ID</th>
                  <th className="p-3.5 font-medium">Actor</th>
                  <th className="p-3.5 font-medium">Action</th>
                  <th className="p-3.5 font-medium">Target Entity</th>
                  <th className="p-3.5 font-medium">Details</th>
                  <th className="p-3.5 font-medium text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF7EF] transition-colors">
                    <td className="p-3.5 font-mono text-[#7C7D70]">{log.id}</td>
                    <td className="p-3.5 font-medium text-[#1E241F]">{log.adminEmail}</td>
                    <td className="p-3.5 font-mono font-semibold text-[#1F4D3E]">{log.action}</td>
                    <td className="p-3.5 font-mono text-[#5B5C50]">{log.entityType} ({log.entityId})</td>
                    <td className="p-3.5 text-[#5B5C50] max-w-xs truncate">{log.details}</td>
                    <td className="p-3.5 text-right font-mono text-[#7C7D70]">
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

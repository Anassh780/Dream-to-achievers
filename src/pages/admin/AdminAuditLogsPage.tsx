import React, { useState } from 'react';
import { storage } from '@/services/storage';
import { AdminAuditLog } from '@/types';
import { Scroll } from '@phosphor-icons/react';

export const AdminAuditLogsPage: React.FC = () => {
  const logs = storage.get<AdminAuditLog[]>('AUDIT_LOGS', []);
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = filterAction === 'all' ? logs : logs.filter((l) => l.action.toLowerCase().includes(filterAction.toLowerCase()));

  return (
    <div className="space-y-6 font-sans max-w-7xl selection:bg-[var(--accent)]/25">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[var(--ink-soft)]">
            <span>System</span>
            <span>/</span>
            <span>Activity Logs</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)]">
            Administrative Activity Logs
          </h1>
          <p className="text-xs text-[var(--ink-soft)]">
            Live history log tracking all administrative changes, product updates, user promotions, and payout disbursements.
          </p>
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
        >
          <option value="all">All Actions</option>
          <option value="user">User Actions</option>
          <option value="product">Product Actions</option>
          <option value="category">Category Actions</option>
          <option value="reward">Reward Actions</option>
        </select>
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden text-xs shadow-xs">
        <div className="p-3.5 bg-[var(--surface-alt)] border-b border-[var(--line)] flex items-center justify-between font-mono">
          <span className="font-semibold text-[var(--ink)]">Audit Log Records</span>
          <span className="text-[10px] text-[var(--ink-soft)]">{filteredLogs.length} Events Logged</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-[var(--ink-soft)] space-y-2">
            <Scroll size={32} className="text-[var(--ink-soft)]/70 mx-auto" />
            <p className="font-serif font-medium text-base text-[var(--ink)]">No audit log records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full touch-pan-x overscroll-x-contain">
            <table className="w-full min-w-[850px] text-left font-sans border-collapse">
              <thead className="border-b border-[var(--line)] text-[var(--ink-soft)] font-mono text-[10px] bg-[var(--surface-alt)]">
                <tr>
                  <th className="p-3.5 font-medium min-w-[100px] whitespace-nowrap">Log ID</th>
                  <th className="p-3.5 font-medium min-w-[160px] whitespace-nowrap">Actor</th>
                  <th className="p-3.5 font-medium min-w-[140px] whitespace-nowrap">Action</th>
                  <th className="p-3.5 font-medium min-w-[140px] whitespace-nowrap">Target Entity</th>
                  <th className="p-3.5 font-medium min-w-[200px]">Details</th>
                  <th className="p-3.5 font-medium text-right min-w-[150px] whitespace-nowrap">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-[var(--ink-soft)]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--surface-alt)]/60 transition-colors">
                    <td className="p-3.5 font-mono text-[var(--ink-soft)]/70 min-w-[100px] whitespace-nowrap">{log.id}</td>
                    <td className="p-3.5 font-medium text-[var(--ink)] min-w-[160px] whitespace-nowrap">{log.adminEmail}</td>
                    <td className="p-3.5 font-mono font-semibold text-[var(--primary)] min-w-[140px] whitespace-nowrap">{log.action}</td>
                    <td className="p-3.5 font-mono text-[var(--ink-soft)] min-w-[140px] whitespace-nowrap">{log.entityType} ({log.entityId})</td>
                    <td className="p-3.5 text-[var(--ink-soft)] min-w-[200px] max-w-xs truncate">{log.details}</td>
                    <td className="p-3.5 text-right font-mono text-[var(--ink-soft)]/70 min-w-[150px] whitespace-nowrap">
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

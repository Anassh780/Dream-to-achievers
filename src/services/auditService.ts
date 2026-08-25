import { AdminAuditLog } from '@/types';
import { storage } from './storage';

export const auditService = {
  getLogs(): AdminAuditLog[] {
    const logs = storage.get<AdminAuditLog[]>('AUDIT_LOGS', []);
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  logAction({
    adminId,
    adminEmail,
    action,
    entityType,
    entityId,
    details,
  }: {
    adminId: string;
    adminEmail: string;
    action: string;
    entityType: 'rank' | 'user' | 'product' | 'sale' | 'reward' | 'settings';
    entityId: string;
    details: string;
  }): void {
    const logs = storage.get<AdminAuditLog[]>('AUDIT_LOGS', []);
    const newLog: AdminAuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminId,
      adminEmail,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    storage.set('AUDIT_LOGS', logs);
  },
};

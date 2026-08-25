import React, { useState } from 'react';
import { storage } from '@/services/storage';
import { auditService } from '@/services/auditService';
import { rankEngine } from '@/services/rankEngine';
import { useAuth } from '@/context/AuthContext';
import { Sale, SaleStatus } from '@/types';

export const AdminSalesPage: React.FC = () => {
  const { user: currentAdmin, refreshUserData } = useAuth();
  const [sales, setSales] = useState<Sale[]>(storage.get<Sale[]>('SALES', []));

  const handleUpdateStatus = (saleId: string, newStatus: SaleStatus) => {
    if (!currentAdmin) return;
    const target = sales.find((s) => s.id === saleId);
    if (!target) return;

    const isQualifying = newStatus === 'confirmed' || newStatus === 'fulfilled';
    const updated = sales.map((s) => (s.id === saleId ? { ...s, status: newStatus, isQualifying } : s));
    setSales(updated);
    storage.set('SALES', updated);

    auditService.logAction({
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      action: 'UPDATE_SALE_STATUS',
      entityType: 'sale',
      entityId: saleId,
      details: `Changed sale #${saleId} status to ${newStatus} (Qualifying: ${isQualifying}).`,
    });

    // Re-evaluate rank for the affected partner
    rankEngine.checkAndPromoteUser(target.userId);
    refreshUserData();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
          <span>Admin</span>
          <span>•</span>
          <span>Order Verifications</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
          Sales & Order Verifications
        </h1>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#111A27] overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/[0.06] text-[#8996A8] text-[11px]">
              <tr>
                <th className="p-3.5 font-medium">Sale ID</th>
                <th className="p-3.5 font-medium">Product</th>
                <th className="p-3.5 font-medium">Customer</th>
                <th className="p-3.5 font-medium text-right">Price</th>
                <th className="p-3.5 font-medium text-right">Margin</th>
                <th className="p-3.5 font-medium text-center">Qualifying</th>
                <th className="p-3.5 font-medium text-center">Status</th>
                <th className="p-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#CBD5E1]">
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <td className="p-3.5 font-mono text-[#8996A8]">{s.id}</td>
                  <td className="p-3.5 font-medium text-white">{s.productName}</td>
                  <td className="p-3.5 text-[#CBD5E1]">{s.customerName}</td>
                  <td className="p-3.5 text-right text-white">PKR {s.sellingPrice.toLocaleString()}</td>
                  <td className="p-3.5 text-right font-medium text-[#22C55E]">
                    +PKR {(s.profitMargin * s.quantity).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`text-[11px] font-medium ${s.isQualifying ? 'text-[#22C55E]' : 'text-[#8996A8]'}`}>
                      {s.isQualifying ? 'Yes (+1)' : 'No'}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-white/5 text-[#CBD5E1]">
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1">
                    {s.status !== 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(s.id, 'confirmed')}
                        className="px-2 py-1 rounded bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#4ADE80] text-[10px] cursor-pointer"
                      >
                        Confirm
                      </button>
                    )}
                    {s.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdateStatus(s.id, 'cancelled')}
                        className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[10px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
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

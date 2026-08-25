import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { salesService } from '@/services/salesService';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export const DashboardSales: React.FC = () => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!user) return null;

  const sales = salesService.getUserSales(user.id);
  const totalProfit = salesService.getTotalProfitEarned(user.id);
  const qualifyingCount = salesService.getQualifyingSalesCount(user.id);

  const filteredSales = sales.filter((s) => (filterStatus === 'all' ? true : s.status === filterStatus));

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
            <span>Ledger</span>
            <span>•</span>
            <span>Product Margins</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
            Sales & Margin Transactions
          </h1>
        </div>

        <Link to="/dashboard/products">
          <Button variant="primary" size="sm">
            + Record Sale
          </Button>
        </Link>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08]">
          <span className="text-xs text-[#8996A8] block">Qualifying Units</span>
          <span className="text-2xl font-bold text-white">{qualifyingCount}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08]">
          <span className="text-xs text-[#8996A8] block">Total Gross Margin</span>
          <span className={`text-2xl font-bold ${totalProfit > 0 ? 'text-[#22C55E]' : 'text-white'}`}>
            PKR {totalProfit.toLocaleString()}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08]">
          <span className="text-xs text-[#8996A8] block">Average Margin / Unit</span>
          <span className="text-2xl font-bold text-white">
            PKR {qualifyingCount > 0 ? Math.round(totalProfit / qualifyingCount).toLocaleString() : '0'}
          </span>
        </div>
      </div>

      {/* Professional Table (Step 32) */}
      <div className="rounded-xl border border-white/[0.08] bg-[#111A27] overflow-hidden text-xs">
        <div className="p-3.5 bg-[#0D141F] border-b border-white/[0.06] flex items-center justify-between">
          <span className="font-semibold text-white">Transaction History ({filteredSales.length})</span>
          <div className="flex items-center space-x-1.5">
            {['all', 'confirmed', 'fulfilled', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2 py-0.8 rounded text-[11px] capitalize transition-colors ${
                  filterStatus === st
                    ? 'bg-[#3B82F6] text-white font-medium'
                    : 'text-[#8996A8] hover:text-white hover:bg-white/5'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div className="p-8 text-center text-[#8996A8]">No transactions match the selected filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/[0.06] text-[#8996A8] text-[11px]">
                <tr>
                  <th className="p-3.5 font-medium">Transaction ID</th>
                  <th className="p-3.5 font-medium">Product</th>
                  <th className="p-3.5 font-medium">Customer</th>
                  <th className="p-3.5 font-medium text-right">Retail</th>
                  <th className="p-3.5 font-medium text-right">Partner Price</th>
                  <th className="p-3.5 font-medium text-right">Margin</th>
                  <th className="p-3.5 font-medium text-center">Status</th>
                  <th className="p-3.5 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-[#CBD5E1]">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5 font-mono text-[#8996A8]">{sale.id}</td>
                    <td className="p-3.5 font-medium text-white">{sale.productName}</td>
                    <td className="p-3.5 text-[#CBD5E1]">{sale.customerName}</td>
                    <td className="p-3.5 text-right text-white">PKR {sale.sellingPrice.toLocaleString()}</td>
                    <td className="p-3.5 text-right text-[#CBD5E1]">PKR {sale.partnerPrice.toLocaleString()}</td>
                    <td className="p-3.5 text-right font-medium text-[#22C55E]">
                      +PKR {(sale.profitMargin * sale.quantity).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block text-[10px] font-medium capitalize px-2 py-0.5 rounded ${
                          sale.status === 'confirmed' || sale.status === 'fulfilled'
                            ? 'bg-[#22C55E]/10 text-[#4ADE80] border border-[#22C55E]/20'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right text-[#8996A8]">
                      {new Date(sale.createdAt).toLocaleDateString()}
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

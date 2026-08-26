import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { salesService } from '@/services/salesService';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package } from '@phosphor-icons/react';

export const DashboardSales: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const sales = salesService.getUserSales(user.id);
  const totalProfit = salesService.getTotalProfitEarned(user.id);
  const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>Commercials</span>
            <span>/</span>
            <span>Customer Sales Ledger</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1E241F] tracking-tight">
            Direct Customer Sales &amp; Margin Ledger
          </h1>
          <p className="text-xs text-[#5B5C50]">
            All verified customer retail transactions credited with direct wholesale margins.
          </p>
        </div>

        <Link to="/dashboard/products">
          <Button variant="primary" size="sm" iconLeft={<ShoppingCart size={14} />}>
            Record New Sale
          </Button>
        </Link>
      </div>

      {/* Accounting Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Total Orders Recorded</span>
          <span className="text-2xl font-bold font-mono text-[#1E241F]">{sales.length}</span>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Delivered Units (Rank Qualifying)</span>
          <span className="text-2xl font-bold font-mono text-[#1F4D3E]">{totalUnits}</span>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Accumulated Gross Margin</span>
          <span className="text-2xl font-bold font-mono text-[#B8862E]">
            PKR {totalProfit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Sales Table */}
      <div className="rounded-xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs">
        <div className="p-3.5 bg-[#F1ECDD] border-b border-[#E3DCC8] flex items-center justify-between font-mono">
          <span className="font-semibold text-[#1E241F]">Customer Orders Ledger</span>
          <span className="text-[10px] text-[#5B5C50]">{sales.length} Records</span>
        </div>

        {sales.length === 0 ? (
          <div className="p-12 text-center text-[#5B5C50] space-y-2">
            <Package size={32} className="text-[#7C7D70] mx-auto" />
            <p className="font-serif font-medium text-base text-[#1E241F]">No sales recorded yet</p>
            <p className="text-xs">Browse the wholesale catalog to record your first client purchase.</p>
            <Link to="/dashboard/products" className="inline-block pt-2">
              <Button variant="outline" size="sm">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="border-b border-[#E3DCC8] text-[#5B5C50] font-mono text-[10px] bg-[#FAF7EF]">
                <tr>
                  <th className="p-3.5 font-medium">Order ID</th>
                  <th className="p-3.5 font-medium">Product</th>
                  <th className="p-3.5 font-medium">Client Info</th>
                  <th className="p-3.5 font-medium text-center">Qty</th>
                  <th className="p-3.5 font-medium text-right">Unit Margin</th>
                  <th className="p-3.5 font-medium text-right">Total Profit</th>
                  <th className="p-3.5 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-[#FAF7EF] transition-colors">
                    <td className="p-3.5 font-mono text-[#7C7D70]">{sale.id}</td>
                    <td className="p-3.5">
                      <p className="font-serif font-semibold text-[#1E241F]">{sale.productName}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="text-[#1E241F] font-medium">{sale.customerName}</p>
                      <p className="text-[10px] text-[#7C7D70] font-mono">{sale.customerEmail || 'No email'}</p>
                    </td>
                    <td className="p-3.5 text-center font-mono font-medium text-[#1E241F]">
                      {sale.quantity}
                    </td>
                    <td className="p-3.5 text-right font-mono text-[#1F4D3E]">
                      +PKR {sale.profitMargin.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-[#B8862E]">
                      +PKR {(sale.profitMargin * sale.quantity).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right text-[#7C7D70] font-mono">
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

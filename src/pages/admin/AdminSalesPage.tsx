import React from 'react';
import { storage } from '@/services/storage';
import { Sale } from '@/types';
import { ShoppingCart } from '@phosphor-icons/react';

export const AdminSalesPage: React.FC = () => {
  const sales = storage.get<Sale[]>('SALES', []);

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      <div className="space-y-1 pb-4 border-b border-[#E3DCC8]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
          <span>Commerce</span>
          <span>/</span>
          <span>Sales Ledger</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1E241F]">
          Platform Customer Sales Audit
        </h1>
        <p className="text-xs text-[#5B5C50]">
          Complete transaction registry of all partner product sales with gross profit distributions.
        </p>
      </div>

      <div className="rounded-xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs">
        <div className="p-3.5 bg-[#F1ECDD] border-b border-[#E3DCC8] flex items-center justify-between font-mono">
          <span className="font-semibold text-[#1E241F]">Transactions Ledger</span>
          <span className="text-[10px] text-[#5B5C50]">{sales.length} Records</span>
        </div>

        {sales.length === 0 ? (
          <div className="p-12 text-center text-[#5B5C50] space-y-2">
            <ShoppingCart size={32} className="text-[#7C7D70] mx-auto" />
            <p className="font-serif font-medium text-base text-[#1E241F]">No sales records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="border-b border-[#E3DCC8] text-[#5B5C50] font-mono text-[10px] bg-[#FAF7EF]">
                <tr>
                  <th className="p-3.5 font-medium">Transaction ID</th>
                  <th className="p-3.5 font-medium">Product / SKU</th>
                  <th className="p-3.5 font-medium">Client Info</th>
                  <th className="p-3.5 font-medium text-center">Qty</th>
                  <th className="p-3.5 font-medium text-right">Selling Price</th>
                  <th className="p-3.5 font-medium text-right">Partner Profit</th>
                  <th className="p-3.5 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-[#FAF7EF] transition-colors">
                    <td className="p-3.5 font-mono text-[#7C7D70]">{sale.id}</td>
                    <td className="p-3.5">
                      <p className="font-serif font-semibold text-[#1E241F]">{sale.productName}</p>
                      <p className="text-[10px] font-mono text-[#7C7D70]">{sale.productId}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="text-[#1E241F] font-medium">{sale.customerName}</p>
                      <p className="text-[10px] text-[#7C7D70] font-mono">{sale.customerEmail || 'No email'}</p>
                    </td>
                    <td className="p-3.5 text-center font-mono font-medium text-[#1E241F]">
                      {sale.quantity}
                    </td>
                    <td className="p-3.5 text-right font-mono text-[#1E241F]">
                      PKR {(sale.sellingPrice * sale.quantity).toLocaleString()}
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

import React, { useState, useEffect } from 'react';
import { storage } from '@/services/storage';
import { salesService } from '@/services/salesService';
import { Sale, SaleStatus, User } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  ShoppingCart,
  Truck,
  CheckCircle,
  Clock,
  WhatsappLogo,
  X,
  Eye,
  Check,
  Package,
  ShieldCheck,
  User as UserIcon,
} from '@phosphor-icons/react';

export const AdminSalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>(() => salesService.getAllSales());
  const [users] = useState<User[]>(() => storage.get<User[]>('USERS', []));
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Fulfillment form states
  const [editStatus, setEditStatus] = useState<SaleStatus>('pending_verification');
  const [courier, setCourier] = useState('');
  const [trackingNo, setTrackingNo] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const refreshData = () => {
    setSales(salesService.getAllSales());
  };

  useEffect(() => {
    refreshData();
    const handleStorage = () => refreshData();
    window.addEventListener('dta_storage_change', handleStorage);
    return () => window.removeEventListener('dta_storage_change', handleStorage);
  }, []);

  const openFulfillmentModal = (sale: Sale) => {
    setSelectedSale(sale);
    setEditStatus(sale.status);
    setCourier(sale.shippingCourier || 'TCS Express');
    setTrackingNo(sale.trackingNumber || '');
    setShippingNotes(sale.shippingNotes || '');
    setAdminNote(sale.adminReviewNote || '');
  };

  const handleSaveFulfillment = async (statusOverride?: SaleStatus) => {
    if (!selectedSale) return;
    setIsUpdating(true);

    const targetStatus = statusOverride || editStatus;
    await salesService.updateSaleFulfillment({
      saleId: selectedSale.id,
      status: targetStatus,
      shippingCourier: courier,
      trackingNumber: trackingNo,
      shippingNotes,
      adminReviewNote: adminNote,
    });

    refreshData();
    setIsUpdating(false);
    setSuccessMsg(`Order ${selectedSale.id} updated to ${targetStatus.replace('_', ' ')}.`);
    setTimeout(() => {
      setSuccessMsg('');
      setSelectedSale(null);
    }, 2000);
  };

  const getUserInfo = (userId: string) => {
    const u = users.find((item) => item.id === userId);
    return u ? { name: u.fullName, code: u.referralCode, email: u.email } : { name: userId, code: 'N/A', email: '' };
  };

  const filteredSales = sales.filter((s) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return s.status === 'pending_verification' || s.status === 'payment_verified';
    if (statusFilter === 'shipping') return s.status === 'processing' || s.status === 'dispatched' || s.status === 'in_transit';
    if (statusFilter === 'delivered') return s.status === 'delivered' || s.status === 'confirmed' || s.status === 'fulfilled';
    if (statusFilter === 'rejected') return s.status === 'rejected' || s.status === 'cancelled';
    return true;
  });

  const totalDelivered = sales.filter((s) => s.status === 'delivered' || s.status === 'confirmed' || s.status === 'fulfilled').length;
  const totalPending = sales.filter((s) => s.status === 'pending_verification' || s.status === 'payment_verified').length;
  const totalGrossProfit = sales
    .filter((s) => s.status === 'delivered' || s.status === 'confirmed' || s.status === 'fulfilled')
    .reduce((sum, s) => sum + s.profitMargin * s.quantity, 0);

  const getStatusBadge = (status: Sale['status']) => {
    switch (status) {
      case 'delivered':
      case 'confirmed':
      case 'fulfilled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F1ECDD] text-[#1F4D3E] border border-[#E3DCC8]">
            <CheckCircle size={12} weight="fill" /> Delivered
          </span>
        );
      case 'dispatched':
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <Truck size={12} weight="bold" /> Dispatched
          </span>
        );
      case 'processing':
      case 'payment_verified':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#EFE2C4] text-[#B8862E] border border-[#B8862E]/30">
            <Clock size={12} weight="bold" /> Verified / Prep
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            Rejected
          </span>
        );
      case 'pending_verification':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> Under Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-[#E3DCC8]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
          <span>Commerce</span>
          <span>/</span>
          <span>Order Fulfillment &amp; Shipping</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1E241F]">
          Platform Customer Sales &amp; Shipping Operations
        </h1>
        <p className="text-xs text-[#5B5C50]">
          Inspect customer payment receipts, verify transactions, assign courier tracking numbers, and release wholesale margins.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Pending Review / Verification</span>
          <span className="text-2xl font-bold font-mono text-[#B8862E]">{totalPending}</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Delivered Orders</span>
          <span className="text-2xl font-bold font-mono text-[#1F4D3E]">{totalDelivered}</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Profit Margins Released</span>
          <span className="text-2xl font-bold font-mono text-[#1E241F]">
            PKR {totalGrossProfit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-mono">
        {[
          { id: 'all', label: `All Orders (${sales.length})` },
          { id: 'pending', label: `Pending Verification (${totalPending})` },
          { id: 'shipping', label: 'In Transit / Packing' },
          { id: 'delivered', label: `Delivered (${totalDelivered})` },
          { id: 'rejected', label: 'Rejected / Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              statusFilter === tab.id
                ? 'bg-[#1F4D3E] text-white border-[#1F4D3E] font-medium'
                : 'bg-white text-[#5B5C50] border-[#E3DCC8] hover:bg-[#FAF7EF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs">
        <div className="p-3.5 bg-[#F1ECDD] border-b border-[#E3DCC8] flex items-center justify-between font-mono">
          <span className="font-semibold text-[#1E241F]">Orders Ledger</span>
          <span className="text-[10px] text-[#5B5C50]">{filteredSales.length} Records</span>
        </div>

        {filteredSales.length === 0 ? (
          <div className="p-12 text-center text-[#5B5C50] space-y-2">
            <ShoppingCart size={32} className="text-[#7C7D70] mx-auto" />
            <p className="font-serif font-medium text-base text-[#1E241F]">No sales records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="border-b border-[#E3DCC8] text-[#5B5C50] font-mono text-[10px] bg-[#FAF7EF]">
                <tr>
                  <th className="p-3.5 font-medium">Order ID</th>
                  <th className="p-3.5 font-medium">Product / SKU</th>
                  <th className="p-3.5 font-medium">Reseller Partner</th>
                  <th className="p-3.5 font-medium">Customer (Buyer)</th>
                  <th className="p-3.5 font-medium text-center">Qty</th>
                  <th className="p-3.5 font-medium text-right">Profit Margin</th>
                  <th className="p-3.5 font-medium text-center">Status</th>
                  <th className="p-3.5 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                {filteredSales.map((sale) => {
                  const partner = getUserInfo(sale.userId);

                  return (
                    <tr key={sale.id} className="hover:bg-[#FAF7EF] transition-colors">
                      <td className="p-3.5 font-mono text-[#7C7D70]">{sale.id}</td>
                      <td className="p-3.5">
                        <p className="font-serif font-semibold text-[#1E241F]">{sale.productName}</p>
                        <p className="text-[10px] font-mono text-[#7C7D70]">{new Date(sale.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-medium text-[#1E241F]">{partner.name}</p>
                        <p className="text-[10px] font-mono text-[#1F4D3E] font-semibold">
                          Code: {partner.code}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <p className="text-[#1E241F] font-medium">{sale.customerName}</p>
                        <div className="flex items-center space-x-2 text-[10px] text-[#7C7D70] font-mono">
                          {sale.customerPhone && (
                            <a
                              href={`https://wa.me/${sale.customerPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#1F4D3E] flex items-center space-x-0.5 hover:underline"
                            >
                              <WhatsappLogo size={11} weight="fill" />
                              <span>{sale.customerPhone}</span>
                            </a>
                          )}
                          {sale.customerCity && <span>• {sale.customerCity}</span>}
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono font-medium text-[#1E241F]">
                        {sale.quantity}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-[#B8862E]">
                        +PKR {(sale.profitMargin * sale.quantity).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-center">
                        {getStatusBadge(sale.status)}
                      </td>
                      <td className="p-3.5 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openFulfillmentModal(sale)}
                          iconLeft={<Eye size={13} />}
                          className="text-[11px] px-2.5 py-1"
                        >
                          Fulfill / Verify
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fulfillment & Verification Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white border border-[#E3DCC8] p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
              <div>
                <h3 className="font-serif font-medium text-base text-[#1E241F]">
                  Order Fulfillment &amp; Payment Audit
                </h3>
                <p className="text-[11px] font-mono text-[#5B5C50]">
                  Transaction ID: {selectedSale.id} • Reseller: {getUserInfo(selectedSale.userId).name}
                </p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="text-[#5B5C50] hover:text-[#1E241F]">
                <X size={18} />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 rounded-lg bg-[#F1ECDD] border border-[#E3DCC8] text-[#1F4D3E] text-xs flex items-center space-x-2">
                <Check size={16} weight="bold" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Payment Proof Preview */}
            <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2">
              <span className="font-mono font-semibold text-[#1E241F] text-xs block">
                Attached Client Payment Proof
              </span>
              {selectedSale.paymentScreenshotUrl ? (
                <div className="text-center">
                  <a href={selectedSale.paymentScreenshotUrl} target="_blank" rel="noreferrer">
                    <img
                      src={selectedSale.paymentScreenshotUrl}
                      alt="Payment Receipt"
                      className="max-h-60 max-w-full rounded-lg object-contain mx-auto border border-[#E3DCC8] bg-white shadow-2xs hover:opacity-95 cursor-zoom-in"
                    />
                  </a>
                  <p className="text-[10px] text-[#7C7D70] font-mono mt-1">
                    Click image to expand in new tab
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#7C7D70] italic">No payment screenshot attached by seller.</p>
              )}
              {selectedSale.paymentProofNotes && (
                <p className="text-[11px] font-mono text-[#5B5C50]">
                  Seller Note: <span className="text-[#1E241F]">{selectedSale.paymentProofNotes}</span>
                </p>
              )}
            </div>

            {/* Buyer Delivery Information */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E3DCC8] space-y-2 text-xs">
              <h4 className="font-serif font-semibold text-[#1E241F]">Buyer &amp; Shipping Details</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#5B5C50] block text-[10px]">Client Name:</span>
                  <span className="font-medium text-[#1E241F]">{selectedSale.customerName}</span>
                </div>
                <div>
                  <span className="text-[#5B5C50] block text-[10px]">Client WhatsApp:</span>
                  {selectedSale.customerPhone ? (
                    <a
                      href={`https://wa.me/${selectedSale.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1F4D3E] font-bold font-mono flex items-center space-x-1 hover:underline"
                    >
                      <WhatsappLogo size={13} weight="fill" />
                      <span>{selectedSale.customerPhone}</span>
                    </a>
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[#5B5C50] block text-[10px]">Destination Address:</span>
                <p className="text-[11px] text-[#1E241F] font-sans">
                  {selectedSale.customerAddress || 'No address specified'} ({selectedSale.customerCity || 'PK'})
                </p>
              </div>
            </div>

            {/* Fulfillment Status & Courier Details Form */}
            <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-3">
              <h4 className="font-serif font-semibold text-[#1E241F]">
                Fulfillment &amp; Courier Update
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">Order Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as SaleStatus)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] text-xs font-mono"
                  >
                    <option value="pending_verification">Pending Verification</option>
                    <option value="payment_verified">Payment Verified</option>
                    <option value="processing">Processing &amp; Packing</option>
                    <option value="dispatched">Dispatched with Courier</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered (Releases Profit)</option>
                    <option value="rejected">Rejected (Invalid Payment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">Courier Service</label>
                  <input
                    type="text"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    placeholder="e.g. TCS Express / Leopards / Trax"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">Tracking Number / Consignment #</label>
                  <input
                    type="text"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    placeholder="e.g. TCS9482948201"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">Shipping / Admin Note</label>
                  <input
                    type="text"
                    value={shippingNotes}
                    onChange={(e) => setShippingNotes(e.target.value)}
                    placeholder="e.g. Estimated delivery in 2 business days"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E3DCC8]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSaveFulfillment('delivered')}
                  className="bg-[#F1ECDD] text-[#1F4D3E] border-[#E3DCC8] hover:bg-[#EAE4D2] text-xs font-medium"
                >
                  Mark Delivered &amp; Unlock Profit
                </Button>

                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSale(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveFulfillment()}
                    isLoading={isUpdating}
                  >
                    Save Status Update
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};


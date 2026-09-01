import React, { useState, useEffect } from 'react';
import { storage } from '@/services/storage';
import { salesService } from '@/services/salesService';
import { notificationService } from '@/services/notificationService';
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
  DownloadSimple,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowClockwise,
  Prohibit,
  WarningCircle,
} from '@phosphor-icons/react';

export const AdminSalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>(() => salesService.getAllSales());
  const [users] = useState<User[]>(() => storage.get<User[]>('USERS', []));
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Lightbox Slip Preview States
  const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(1);
  const [previewRotation, setPreviewRotation] = useState<number>(0);

  // Rejection Modal States
  const [rejectingSale, setRejectingSale] = useState<Sale | null>(null);
  const [selectedReasonTag, setSelectedReasonTag] = useState<string>('Unreadable / Incomplete Payment Slip');
  const [customRejectReason, setCustomRejectReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Fulfillment form states
  const [editStatus, setEditStatus] = useState<SaleStatus>('pending_verification');
  const [courier, setCourier] = useState('');
  const [trackingNo, setTrackingNo] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const REJECTION_REASONS = [
    'Unreadable / Incomplete Payment Slip',
    'Bank Account / Sender Name Mismatch',
    'Amount Transferred is Less than Required Wholesale/Retail Price',
    'Duplicate / Reused Transaction ID or Slip',
    'Invalid or Incomplete Delivery Address / Contact',
    'Other / Custom Reason',
  ];

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
    setCourier(sale.shippingCourier || '');
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

    if (targetStatus === 'delivered' || targetStatus === 'confirmed') {
      notificationService.createNotification({
        userId: selectedSale.userId,
        title: 'Order Delivered & Margin Released! 💰',
        message: `Your client order #${selectedSale.id} (${selectedSale.productName}) was confirmed delivered. Profit margin of PKR ${(selectedSale.profitMargin * selectedSale.quantity).toLocaleString()} has been unlocked in your wallet.`,
        type: 'sale_confirmed',
        link: '/dashboard/sales',
      });
    }

    refreshData();
    setIsUpdating(false);
    setSuccessMsg(`Order ${selectedSale.id} updated to ${targetStatus.replace('_', ' ')}.`);
    setTimeout(() => {
      setSuccessMsg('');
      setSelectedSale(null);
    }, 1500);
  };

  const handleConfirmRejection = async () => {
    if (!rejectingSale) return;
    setIsRejecting(true);

    const finalReason =
      selectedReasonTag === 'Other / Custom Reason'
        ? customRejectReason.trim() || 'Payment slip not verified by admin'
        : selectedReasonTag + (customRejectReason.trim() ? ` - Note: ${customRejectReason.trim()}` : '');

    await salesService.updateSaleFulfillment({
      saleId: rejectingSale.id,
      status: 'rejected',
      adminReviewNote: finalReason,
    });

    // Notify Partner with actionable feedback
    notificationService.createNotification({
      userId: rejectingSale.userId,
      title: 'Order Payment Rejected ❌',
      message: `Your order #${rejectingSale.id} (${rejectingSale.productName}) was rejected: "${finalReason}". Please upload a valid payment receipt or contact admin.`,
      type: 'system',
      link: '/dashboard/sales',
    });

    refreshData();
    setIsRejecting(false);
    setRejectingSale(null);
    setSelectedSale(null);
    setCustomRejectReason('');
  };

  const handleDownloadSlip = (dataUrl: string, fileName = 'payment_slip.jpg') => {
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(dataUrl, '_blank');
    }
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
          <span className="inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
            Delivered
          </span>
        );
      case 'pending_verification':
        return (
          <span className="inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase">
            Pending Audit
          </span>
        );
      case 'payment_verified':
        return (
          <span className="inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 uppercase">
            Slip Verified
          </span>
        );
      case 'processing':
      case 'dispatched':
      case 'in_transit':
        return (
          <span className="inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 uppercase">
            In Transit
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 uppercase">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200 uppercase">
            {status}
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
          <span>Orders &amp; Shipping Verification</span>
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
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
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
        <div className="p-3.5 bg-[#FAF7EF] border-b border-[#E3DCC8] flex items-center justify-between font-mono">
          <span className="font-semibold text-[#1E241F]">Orders Ledger</span>
          <span className="text-[10px] text-[#5B5C50]">{filteredSales.length} Records</span>
        </div>

        {filteredSales.length === 0 ? (
          <div className="p-12 text-center text-[#5B5C50] space-y-2">
            <ShoppingCart size={32} className="text-[#7C7D70] mx-auto" />
            <p className="font-bold text-base text-[#1E241F]">No sales records found</p>
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
                        <p className="font-semibold text-[#1E241F]">{sale.productName}</p>
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

      {/* 1. Fulfillment & Verification Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl bg-white border border-[#E3DCC8] p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
              <div>
                <h3 className="font-bold text-base text-[#1E241F]">
                  Order Fulfillment &amp; Payment Audit
                </h3>
                <p className="text-[11px] font-mono text-[#5B5C50]">
                  Transaction ID: {selectedSale.id} • Reseller: {getUserInfo(selectedSale.userId).name}
                </p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="p-1 rounded-lg text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF]">
                <X size={18} />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-[#1F4D3E] text-xs flex items-center space-x-2">
                <Check size={16} weight="bold" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Payment Proof Preview (Safe In-App Lightbox) */}
            <div className="p-4 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-[#1E241F] text-xs block">
                  Attached Client Payment Proof Slip
                </span>
                {selectedSale.paymentScreenshotUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewSlipUrl(selectedSale.paymentScreenshotUrl!);
                      setPreviewZoom(1);
                      setPreviewRotation(0);
                    }}
                    className="text-[10.5px] font-mono text-[#1F4D3E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <MagnifyingGlassPlus size={13} />
                    <span>Expand &amp; Zoom Slip</span>
                  </button>
                )}
              </div>

              {selectedSale.paymentScreenshotUrl ? (
                <div className="text-center group">
                  <div
                    onClick={() => {
                      setPreviewSlipUrl(selectedSale.paymentScreenshotUrl!);
                      setPreviewZoom(1);
                      setPreviewRotation(0);
                    }}
                    className="cursor-zoom-in relative inline-block max-w-full"
                    title="Click to view full receipt safely"
                  >
                    <img
                      src={selectedSale.paymentScreenshotUrl}
                      alt="Payment Receipt"
                      className="max-h-56 max-w-full rounded-xl object-contain mx-auto border border-[#E3DCC8] bg-white shadow-2xs group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                      <span>Click to Open Full View</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#7C7D70] font-mono mt-1">
                    Click slip image to zoom, rotate, and inspect details without browser crashes.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#7C7D70] italic">No payment screenshot attached by seller.</p>
              )}

              {selectedSale.paymentProofNotes && (
                <p className="text-[11px] font-mono text-[#5B5C50] bg-white p-2.5 rounded-xl border border-[#E3DCC8]">
                  Seller Note: <span className="text-[#1E241F] font-semibold">{selectedSale.paymentProofNotes}</span>
                </p>
              )}
            </div>

            {/* Buyer Delivery Information */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E3DCC8] space-y-2 text-xs">
              <h4 className="font-bold text-[#1E241F]">Buyer &amp; Shipping Details</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#5B5C50] block text-[10px]">Client Name:</span>
                  <span className="font-semibold text-[#1E241F]">{selectedSale.customerName}</span>
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
            <div className="p-4 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-3">
              <h4 className="font-bold text-[#1E241F]">
                Fulfillment &amp; Courier Update
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-semibold text-[11px]">Order Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as SaleStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] text-xs font-mono"
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
                  <label className="block text-[#5B5C50] mb-1 font-semibold text-[11px]">Courier Service</label>
                  <input
                    type="text"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    placeholder="e.g. TCS Express / Leopards / Trax"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-semibold text-[11px]">Tracking Number / Consignment #</label>
                  <input
                    type="text"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    placeholder="e.g. TCS9482948201"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#5B5C50] mb-1 font-semibold text-[11px]">Shipping / Admin Note</label>
                  <input
                    type="text"
                    value={shippingNotes}
                    onChange={(e) => setShippingNotes(e.target.value)}
                    placeholder="e.g. Estimated delivery in 2 business days"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E3DCC8]">
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveFulfillment('delivered')}
                    className="bg-[#F1ECDD] text-[#1F4D3E] border-[#E3DCC8] hover:bg-[#EAE4D2] text-xs font-semibold"
                  >
                    Mark Delivered &amp; Unlock Profit
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRejectingSale(selectedSale)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 text-xs font-semibold"
                    iconLeft={<Prohibit size={13} />}
                  >
                    Reject Payment...
                  </Button>
                </div>

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

      {/* 2. Lightbox Slip Zoom & Inspection Modal */}
      {previewSlipUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewSlipUrl(null)}
        >
          {/* Top Control Bar */}
          <div
            className="flex items-center justify-between w-full max-w-3xl pb-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm">Payment Proof Receipt Preview</span>
              <span className="text-xs text-gray-400 font-mono">({Math.round(previewZoom * 100)}% Zoom)</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPreviewZoom((z) => Math.min(3, z + 0.25))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <MagnifyingGlassPlus size={18} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewZoom((z) => Math.max(0.5, z - 0.25))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <MagnifyingGlassMinus size={18} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewRotation((r) => (r + 90) % 360)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Rotate 90°"
              >
                <ArrowClockwise size={18} />
              </button>
              <button
                type="button"
                onClick={() => handleDownloadSlip(previewSlipUrl, `order_${selectedSale?.id || 'slip'}_receipt.jpg`)}
                className="p-2 rounded-xl bg-[#1F4D3E] hover:bg-[#183D31] text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3"
                title="Save & Download Slip"
              >
                <DownloadSimple size={16} />
                <span>Download Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewSlipUrl(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors cursor-pointer ml-2"
                title="Close Lightbox (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Main Image Container */}
          <div
            className="flex-1 flex items-center justify-center w-full max-w-4xl max-h-[80vh] overflow-hidden p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewSlipUrl}
              alt="Payment Slip Preview"
              style={{
                transform: `scale(${previewZoom}) rotate(${previewRotation}deg)`,
                transition: 'transform 0.2s ease-in-out',
              }}
              className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain select-none"
            />
          </div>
        </div>
      )}

      {/* 3. Rejection Reason Modal */}
      {rejectingSale && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white border border-[#E3DCC8] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center space-x-3 text-rose-700 pb-3 border-b border-[#E3DCC8]">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-200">
                <Prohibit size={22} weight="bold" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1E241F]">Reject Order Payment</h3>
                <p className="text-[11px] text-[#5B5C50]">Select structured rejection reason to notify reseller.</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[#1E241F] font-semibold">
                Reason for Rejection:
              </label>

              <div className="space-y-1.5">
                {REJECTION_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedReasonTag(r)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      selectedReasonTag === r
                        ? 'bg-rose-50 text-rose-900 border-rose-300 font-semibold'
                        : 'bg-[#FAF7EF] text-[#5B5C50] border-[#E3DCC8] hover:bg-[#F1ECDD]'
                    }`}
                  >
                    <span>{r}</span>
                    {selectedReasonTag === r && <Check size={14} className="text-rose-700" />}
                  </button>
                ))}
              </div>

              <div className="space-y-1 pt-1">
                <label className="block text-[#5B5C50] font-medium text-[11px]">
                  Additional Clarification Note (Sent to Partner):
                </label>
                <textarea
                  rows={3}
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                  placeholder="e.g. Please ask your customer to re-send the original bank transfer PDF or high-res photo..."
                  className="w-full p-2.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-rose-600 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E3DCC8]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRejectingSale(null)}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmRejection}
                isLoading={isRejecting}
                className="bg-rose-700 hover:bg-rose-800 text-white border-transparent"
              >
                Confirm Payment Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

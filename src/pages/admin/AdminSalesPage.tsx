import React, { useState, useEffect } from 'react';
import { storage } from '@/services/storage';
import { salesService } from '@/services/salesService';
import { notificationService } from '@/services/notificationService';
import { Sale, SaleStatus, User } from '@/types';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
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
  const { success: toastSuccess, error: toastError } = useToast();
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
  const [adminProofSlip, setAdminProofSlip] = useState<string>('');
  const [adminProofNotes, setAdminProofNotes] = useState<string>('');
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
    setAdminProofSlip(sale.adminPaymentProofUrl || '');
    setAdminProofNotes(sale.adminProofNotes || '');
  };

  const handleAdminProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toastError('Proof slip image must be smaller than 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAdminProofSlip(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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
      adminPaymentProofUrl: adminProofSlip,
      adminProofNotes: adminProofNotes,
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
    toastSuccess(`Order #${selectedSale.id} updated to ${targetStatus.replace('_', ' ')}.`);
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
    toastSuccess('Order rejected and partner notified.');
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
      <div className="space-y-1 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[var(--ink-soft)]">
          <span>Commerce</span>
          <span>/</span>
          <span>Orders &amp; Shipping Verification</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)]">
          Platform Customer Sales &amp; Shipping Operations
        </h1>
        <p className="text-xs text-[var(--ink-soft)]">
          Inspect customer payment receipts, verify transactions, assign courier tracking numbers, and release wholesale margins.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1 shadow-xs">
          <span className="text-xs text-[var(--ink-soft)] font-mono block">Pending Review / Verification</span>
          <span className="text-2xl font-bold font-mono text-[var(--accent)]">{totalPending}</span>
        </div>
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1 shadow-xs">
          <span className="text-xs text-[var(--ink-soft)] font-mono block">Delivered Orders</span>
          <span className="text-2xl font-bold font-mono text-[var(--primary-dark)]">{totalDelivered}</span>
        </div>
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1 shadow-xs">
          <span className="text-xs text-[var(--ink-soft)] font-mono block">Profit Margins Released</span>
          <span className="text-2xl font-bold font-mono text-[var(--ink)]">
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
                ? 'bg-[var(--primary)] text-white border-[var(--primary)] font-medium'
                : 'bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--line)] hover:bg-[var(--surface)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden text-xs shadow-xs">
        <div className="p-3.5 bg-[var(--surface)] border-b border-[var(--line)] flex items-center justify-between font-mono">
          <span className="font-semibold text-[var(--ink)]">Orders Ledger</span>
          <span className="text-[10px] text-[var(--ink-soft)]">{filteredSales.length} Records</span>
        </div>

        {filteredSales.length === 0 ? (
          <div className="p-12 text-center text-[var(--ink-soft)] space-y-2">
            <ShoppingCart size={32} className="text-[var(--ink-soft)] mx-auto" />
            <p className="font-bold text-base text-[var(--ink)]">No sales records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full touch-pan-x overscroll-x-contain">
            <table className="w-full min-w-[1050px] text-left font-sans border-collapse">
              <thead className="border-b border-[var(--line)] text-[var(--ink-soft)] font-mono text-[10px] bg-[var(--surface)]">
                <tr>
                  <th className="p-3.5 font-medium min-w-[110px] whitespace-nowrap">Order ID</th>
                  <th className="p-3.5 font-medium min-w-[180px]">Product / SKU</th>
                  <th className="p-3.5 font-medium min-w-[160px] whitespace-nowrap">Reseller Partner</th>
                  <th className="p-3.5 font-medium min-w-[180px]">Customer (Buyer)</th>
                  <th className="p-3.5 font-medium text-center min-w-[70px] whitespace-nowrap">Qty</th>
                  <th className="p-3.5 font-medium text-right min-w-[140px] whitespace-nowrap">Profit Margin</th>
                  <th className="p-3.5 font-medium text-center min-w-[120px] whitespace-nowrap">Status</th>
                  <th className="p-3.5 font-medium text-center min-w-[130px] whitespace-nowrap">Proof Slip</th>
                  <th className="p-3.5 font-medium text-right min-w-[120px] whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-[var(--ink-soft)]">
                {filteredSales.map((sale) => {
                  const partner = getUserInfo(sale.userId);

                  return (
                    <tr key={sale.id} className="hover:bg-[var(--surface-alt)]/60 transition-colors">
                      <td className="p-3.5 font-mono text-[var(--ink-soft)]/70 min-w-[110px] whitespace-nowrap">{sale.id}</td>
                      <td className="p-3.5 min-w-[180px]">
                        <p className="font-serif font-semibold text-[var(--ink)]">{sale.productName}</p>
                        <p className="text-[10px] font-mono text-[var(--ink-soft)]/70 whitespace-nowrap">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-3.5 min-w-[160px]">
                        <p className="font-semibold text-[var(--ink)] text-xs">{partner.name}</p>
                        <p className="text-[10px] font-mono text-[var(--primary-dark)]">{partner.code}</p>
                      </td>
                      <td className="p-3.5 min-w-[180px]">
                        <p className="font-medium text-[var(--ink)]">{sale.customerName}</p>
                        <p className="text-[11px] text-[var(--ink-soft)] font-mono">{sale.customerEmail}</p>
                      </td>
                      <td className="p-3.5 text-center font-mono font-medium text-[var(--ink)] min-w-[70px] whitespace-nowrap">
                        {sale.quantity}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-[var(--accent)] min-w-[140px] whitespace-nowrap">
                        +PKR {(sale.profitMargin * sale.quantity).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-center min-w-[120px] whitespace-nowrap">{getStatusBadge(sale.status)}</td>
                      <td className="p-3.5 text-center min-w-[130px] whitespace-nowrap">
                        {sale.paymentScreenshotUrl ? (
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSale(sale);
                                setPreviewSlipUrl(sale.paymentScreenshotUrl!);
                                setPreviewZoom(1);
                                setPreviewRotation(0);
                              }}
                              className="p-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              title="Click to Zoom Proof Slip"
                            >
                              <MagnifyingGlassPlus size={13} className="text-[var(--primary)]" />
                              <span>View Slip</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadSlip(sale.paymentScreenshotUrl!, `order_${sale.id}_receipt.jpg`)}
                              className="p-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--primary)] transition-colors cursor-pointer shadow-2xs"
                              title="Save / Download Slip"
                            >
                              <DownloadSimple size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-[var(--ink-soft)]/70">No slip</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right min-w-[120px] whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSale(sale);
                            setCourier(sale.shippingCourier || 'TCS Express');
                            setTrackingNo(sale.trackingNumber || '');
                            setShippingNotes(sale.shippingNotes || '');
                          }}
                          className="text-xs"
                        >
                          Audit &amp; Fulfill
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain">
          <div className="rounded-t-3xl sm:rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-5 sm:p-6 max-w-xl w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl text-xs pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6 overscroll-contain animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 ease-out">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">
                  Order Fulfillment &amp; Payment Audit
                </h3>
                <p className="text-[11px] font-mono text-[var(--ink-soft)]">
                  Transaction ID: {selectedSale.id} • Reseller: {getUserInfo(selectedSale.userId).name}
                </p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface)] active:scale-[0.96] transition-transform"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--primary-dark)] text-xs flex items-center space-x-2">
                <Check size={16} weight="bold" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Payment Proof Preview (Safe In-App Lightbox) */}
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-[var(--ink)] text-xs block">
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
                    className="text-[10.5px] font-mono text-[var(--primary-dark)] font-bold hover:underline flex items-center gap-1 cursor-pointer"
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
                      className="max-h-56 max-w-full rounded-xl object-contain mx-auto border border-[var(--line)] bg-[var(--surface)] shadow-2xs group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                      <span>Click to Open Full View</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[var(--ink-soft)] font-mono mt-1">
                    Click slip image to zoom, rotate, and inspect details without browser crashes.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[var(--ink-soft)] italic">No payment screenshot attached by seller.</p>
              )}

              {selectedSale.paymentProofNotes && (
                <p className="text-[11px] font-mono text-[var(--ink-soft)] bg-[var(--surface)] p-2.5 rounded-xl border border-[var(--line)]">
                  Seller Note: <span className="text-[var(--ink)] font-semibold">{selectedSale.paymentProofNotes}</span>
                </p>
              )}
            </div>

            {/* Buyer Delivery Information */}
            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-2 text-xs">
              <h4 className="font-bold text-[var(--ink)]">Buyer &amp; Shipping Details</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[var(--ink-soft)] block text-[10px]">Client Name:</span>
                  <span className="font-semibold text-[var(--ink)]">{selectedSale.customerName}</span>
                </div>
                <div>
                  <span className="text-[var(--ink-soft)] block text-[10px]">Client WhatsApp:</span>
                  {selectedSale.customerPhone ? (
                    <a
                      href={`https://wa.me/${selectedSale.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--primary-dark)] font-bold font-mono flex items-center space-x-1 hover:underline"
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
                <span className="text-[var(--ink-soft)] block text-[10px]">Destination Address:</span>
                <p className="text-[11px] text-[var(--ink)] font-sans">
                  {selectedSale.customerAddress || 'No address specified'} ({selectedSale.customerCity || 'PK'})
                </p>
              </div>
            </div>

            {/* Fulfillment Status & Courier Details Form */}
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
              <h4 className="font-bold text-[var(--ink)]">
                Fulfillment &amp; Courier Update
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--ink-soft)] mb-1 font-semibold text-[11px]">Order Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as SaleStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] text-xs font-mono"
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
                  <label className="block text-[var(--ink-soft)] mb-1 font-semibold text-[11px]">Courier Service</label>
                  <input
                    type="text"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    placeholder="e.g. TCS Express / Leopards / Trax"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--ink-soft)] mb-1 font-semibold text-[11px]">Tracking Number / Consignment #</label>
                  <input
                    type="text"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    placeholder="e.g. TCS9482948201"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[var(--ink-soft)] mb-1 font-semibold text-[11px]">Shipping / Admin Note</label>
                  <input
                    type="text"
                    value={shippingNotes}
                    onChange={(e) => setShippingNotes(e.target.value)}
                    placeholder="e.g. Estimated delivery in 2 business days"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] text-xs"
                  />
                </div>
              </div>

              {/* Admin Payment / Dispatch / Courier Proof Slip Uploader */}
              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[var(--ink)] font-semibold text-[11px]">
                    Admin Proof Slip (Bank Transfer / Courier Receipt)
                  </label>
                  {adminProofSlip && (
                    <button
                      type="button"
                      onClick={() => setAdminProofSlip('')}
                      className="text-[10px] text-rose-600 hover:underline font-mono"
                    >
                      Remove Slip
                    </button>
                  )}
                </div>

                {adminProofSlip ? (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
                    <img
                      src={adminProofSlip}
                      alt="Admin Proof"
                      onClick={() => {
                        setPreviewSlipUrl(adminProofSlip);
                        setPreviewZoom(1);
                        setPreviewRotation(0);
                      }}
                      className="w-16 h-16 rounded-md object-cover border border-[var(--line)] cursor-zoom-in"
                    />
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-[var(--primary-dark)] font-bold block">✓ Admin Proof Attached</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewSlipUrl(adminProofSlip);
                          setPreviewZoom(1);
                          setPreviewRotation(0);
                        }}
                        className="text-[10px] text-[var(--primary-dark)] font-mono font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} /> Inspect Full Screen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-[var(--line)] rounded-xl p-3 text-center hover:bg-[var(--surface)] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdminProofFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <p className="text-[11px] font-mono text-[var(--ink-soft)]">
                      Click to upload Admin Payment / Courier Dispatch Slip (JPG, PNG)
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--line)]">
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveFulfillment('delivered')}
                    className="bg-[var(--surface-alt)] text-[var(--primary-dark)] border-[var(--line)] hover:bg-[var(--surface)] text-xs font-semibold"
                  >
                    Mark Delivered &amp; Unlock Profit
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRejectingSale(selectedSale)}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border-rose-500/20 text-xs font-semibold"
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
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] animate-in fade-in overscroll-contain"
          onClick={() => setPreviewSlipUrl(null)}
        >
          {/* Top Control Bar */}
          <div
            className="flex flex-wrap items-center justify-between w-full max-w-3xl pb-3 gap-2 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm">Payment Proof Receipt Preview</span>
              <span className="text-xs text-white/60 font-mono">({Math.round(previewZoom * 100)}% Zoom)</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPreviewZoom((z) => Math.min(3, z + 0.25))}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-[var(--surface)]/10 hover:bg-[var(--surface)]/20 active:scale-[0.96] text-white transition-all cursor-pointer inline-flex items-center justify-center"
                title="Zoom In"
              >
                <MagnifyingGlassPlus size={18} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewZoom((z) => Math.max(0.5, z - 0.25))}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-[var(--surface)]/10 hover:bg-[var(--surface)]/20 active:scale-[0.96] text-white transition-all cursor-pointer inline-flex items-center justify-center"
                title="Zoom Out"
              >
                <MagnifyingGlassMinus size={18} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewRotation((r) => (r + 90) % 360)}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-[var(--surface)]/10 hover:bg-[var(--surface)]/20 active:scale-[0.96] text-white transition-all cursor-pointer inline-flex items-center justify-center"
                title="Rotate 90°"
              >
                <ArrowClockwise size={18} />
              </button>
              <button
                type="button"
                onClick={() => handleDownloadSlip(previewSlipUrl, `order_${selectedSale?.id || 'slip'}_receipt.jpg`)}
                className="min-h-[44px] p-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] active:scale-[0.96] text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3"
                title="Save & Download Slip"
              >
                <DownloadSimple size={16} />
                <span className="hidden sm:inline">Download Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewSlipUrl(null)}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-[var(--surface)]/10 hover:bg-rose-600 active:scale-[0.96] text-white transition-all cursor-pointer inline-flex items-center justify-center ml-1 sm:ml-2"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain">
          <div className="w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto p-5 sm:p-7 rounded-t-3xl sm:rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl space-y-4 text-xs pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-7 overscroll-contain animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 ease-out">
            <div className="flex items-center space-x-3 text-rose-600 pb-3 border-b border-[var(--line)]">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                <Prohibit size={22} weight="bold" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">Reject Order Payment</h3>
                <p className="text-[11px] text-[var(--ink-soft)]">Select structured rejection reason to notify reseller.</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[var(--ink)] font-semibold">
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
                        ? 'bg-rose-500/10 text-rose-600 border-rose-500/30 font-semibold'
                        : 'bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--line)] hover:bg-[var(--surface-alt)]'
                    }`}
                  >
                    <span>{r}</span>
                    {selectedReasonTag === r && <Check size={14} className="text-rose-600" />}
                  </button>
                ))}
              </div>

              <div className="space-y-1 pt-1">
                <label className="block text-[var(--ink-soft)] font-medium text-[11px]">
                  Additional Clarification Note (Sent to Partner):
                </label>
                <textarea
                  rows={3}
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                  placeholder="e.g. Please ask your customer to re-send the original bank transfer PDF or high-res photo..."
                  className="w-full p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-rose-600 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[var(--line)]">
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
                className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
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

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { salesService } from '@/services/salesService';
import { payoutService } from '@/services/payoutService';
import { Sale, WithdrawalRequest, PaymentMethod } from '@/types';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  Clock,
  CurrencyDollar,
  HandCoins,
  X,
  Eye,
  WhatsappLogo,
  ArrowRight,
  ShieldCheck,
  Check,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowClockwise,
  DownloadSimple,
  Plus,
} from '@phosphor-icons/react';

export const DashboardSales: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'withdrawals'>('orders');

  const [sales, setSales] = useState<Sale[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Modals
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  // Slip Lightbox Modal
  const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(1);
  const [previewRotation, setPreviewRotation] = useState<number>(0);

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

  const loadData = () => {
    if (!user) return;
    setSales(salesService.getUserSales(user.id));
    setWithdrawals(payoutService.getUserWithdrawals(user.id));
    const methods = payoutService.getUserPaymentMethods(user.id);
    setPaymentMethods(methods);
    const defaultM = methods.find((m) => m.isDefault) || methods[0];
    if (defaultM && !selectedMethodId) {
      setSelectedMethodId(defaultM.id);
    }
  };

  useEffect(() => {
    loadData();

    const handleStorage = () => loadData();
    window.addEventListener('dta_storage_change', handleStorage);
    return () => window.removeEventListener('dta_storage_change', handleStorage);
  }, [user?.id]);

  if (!user) return null;

  const totalDeliveredProfit = salesService.getTotalProfitEarned(user.id);
  const availableBalance = salesService.getAvailableProfitBalance(user.id);
  const pendingProfit = salesService.getPendingProfit(user.id);
  const totalWithdrawn = salesService.getWithdrawnProfit(user.id);
  const totalUnits = sales
    .filter((s) => s.isQualifying || s.status === 'delivered' || s.status === 'confirmed' || s.status === 'fulfilled')
    .reduce((sum, s) => sum + s.quantity, 0);

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    const method = paymentMethods.find((m) => m.id === selectedMethodId);
    if (!method) {
      setWithdrawError('Please select or add a payout payment method first.');
      return;
    }

    if (withdrawAmount < 500) {
      setWithdrawError('Minimum withdrawal amount is PKR 500.');
      return;
    }

    if (withdrawAmount > availableBalance) {
      setWithdrawError(`Amount exceeds your available balance of PKR ${availableBalance.toLocaleString()}.`);
      return;
    }

    setWithdrawLoading(true);
    const res = await payoutService.createWithdrawalRequest({
      user,
      amount: withdrawAmount,
      payoutMethod: method,
    });

    setWithdrawLoading(false);
    if (res.success) {
      setWithdrawSuccess('Withdrawal request submitted successfully! Admin will process manual payout.');
      setWithdrawAmount(0);
      loadData();
      setTimeout(() => {
        setWithdrawSuccess('');
        setShowWithdrawModal(false);
      }, 3000);
    } else {
      setWithdrawError(res.error || 'Failed to submit withdrawal request.');
    }
  };

  const getStatusBadge = (status: Sale['status']) => {
    switch (status) {
      case 'delivered':
      case 'confirmed':
      case 'fulfilled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--surface-alt)] text-[var(--primary)] border border-[var(--line)]">
            <CheckCircle size={12} weight="fill" /> Delivered
          </span>
        );
      case 'dispatched':
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <Truck size={12} weight="bold" /> In Transit
          </span>
        );
      case 'processing':
      case 'payment_verified':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
            <Clock size={12} weight="bold" /> Processing
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20">
            Rejected
          </span>
        );
      case 'pending_verification':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Clock size={12} /> Under Review
          </span>
        );
    }
  };

  const getShippingStepIndex = (status: Sale['status']) => {
    switch (status) {
      case 'pending_verification':
        return 1;
      case 'payment_verified':
        return 2;
      case 'processing':
        return 3;
      case 'dispatched':
      case 'in_transit':
        return 4;
      case 'delivered':
      case 'confirmed':
      case 'fulfilled':
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl selection:bg-[#D9C08A]/25">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#9EABA2]">
            <span className="funding-ghost-pill px-2.5 py-0.5 text-[10px] text-[#34D399] border-[#34D399]/30">Commercials</span>
            <span>/</span>
            <span>Sales &amp; Profit Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F4F7F5] tracking-tight">
            Direct Customer Sales &amp; Profit Ledger
          </h1>
          <p className="text-xs text-[#9EABA2]">
            Track customer orders, live shipping status, wholesale profit margins, and withdrawal payouts.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="funding-ghost-pill px-4 py-2.5 text-xs font-medium text-[#D9C08A] hover:border-[#D9C08A]/40 inline-flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <HandCoins size={15} className="text-[#D9C08A]" />
            <span>Request Withdrawal</span>
          </button>

          <Link to="/dashboard/products">
            <button className="funding-sheen-btn px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md cursor-pointer">
              <ShoppingCart size={14} weight="bold" />
              <span>Record New Sale</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Beginner Helper Tip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-xs text-[#F4F7F5] flex items-start space-x-3">
        <span className="text-base leading-none">💡</span>
        <div className="space-y-0.5">
          <p className="font-bold text-[#34D399]">How Order Verification &amp; Profit Withdrawal Works:</p>
          <p className="text-[#9EABA2] text-[11.5px] leading-relaxed">
            When you submit a customer order with their shipping details, admin operations verify the payment proof and updates shipping progress live. Once verified, your unit profit is credited directly to <strong className="text-[#F4F7F5]">Available Balance</strong> for instant withdrawal into your added Easypaisa, JazzCash, or Bank Account.
          </p>
        </div>
      </div>

      {/* Accounting Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-1 relative overflow-hidden group border-[#34D399]/30 hover:border-[#34D399]/50">
          <span className="text-[11px] text-[#34D399] font-mono font-medium block">
            Available for Withdrawal
          </span>
          <span className="text-2xl font-bold font-mono text-[#34D399] block">
            PKR {availableBalance.toLocaleString()}
          </span>
          <p className="text-[10px] text-[#9EABA2] font-mono">Ready for instant manual payout</p>
        </div>

        {/* Pending In-Transit Profit */}
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-1 relative overflow-hidden group border-[#D9C08A]/30 hover:border-[#D9C08A]/50">
          <span className="text-[11px] text-[#D9C08A] font-mono font-medium block">
            Pending / In-Transit Profit
          </span>
          <span className="text-2xl font-bold font-mono text-[#D9C08A] block">
            PKR {pendingProfit.toLocaleString()}
          </span>
          <p className="text-[10px] text-[#9EABA2] font-mono">Released upon customer delivery</p>
        </div>

        {/* Lifetime Profit Earned */}
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-1 relative overflow-hidden group">
          <span className="text-[11px] text-[#9EABA2] font-mono block">
            Total Delivered Profit
          </span>
          <span className="text-2xl font-bold font-mono text-[#F4F7F5] block">
            PKR {totalDeliveredProfit.toLocaleString()}
          </span>
          <p className="text-[10px] text-[#9EABA2] font-mono">Across all confirmed deliveries</p>
        </div>

        {/* Total Withdrawn */}
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-1 relative overflow-hidden group">
          <span className="text-[11px] text-[#9EABA2] font-mono block">
            Total Withdrawn
          </span>
          <span className="text-2xl font-bold font-mono text-[#F4F7F5] block">
            PKR {totalWithdrawn.toLocaleString()}
          </span>
          <p className="text-[10px] text-[#9EABA2] font-mono">{totalUnits} qualifying delivered units</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/[0.08] pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30 font-semibold shadow-[0_0_15px_rgba(52,211,153,0.12)]'
              : 'text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.04]'
          }`}
        >
          Customer Orders Ledger ({sales.length})
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
            activeTab === 'withdrawals'
              ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30 font-semibold shadow-[0_0_15px_rgba(52,211,153,0.12)]'
              : 'text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.04]'
          }`}
        >
          Profit Withdrawals ({withdrawals.length})
        </button>
      </div>

      {/* TAB 1: Customer Orders */}
      {activeTab === 'orders' && (
        <div className="funding-table-wrap text-xs shadow-xl">
          <div className="p-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between font-mono">
            <span className="font-semibold text-[var(--ink)]">Customer Orders Ledger</span>
            <span className="text-[10px] text-[var(--ink-soft)]">{sales.length} Records</span>
          </div>

          {sales.length === 0 ? (
            <div className="p-12 text-center text-[var(--ink-soft)] space-y-2">
              <Package size={32} className="text-[var(--ink-soft)]/70 mx-auto" />
              <p className="font-serif font-medium text-base text-[var(--ink)]">No sales recorded yet</p>
              <p className="text-xs">Browse the wholesale catalog to record your first client purchase.</p>
              <Link to="/dashboard/products" className="inline-block pt-2">
                <Button variant="outline" size="sm">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto w-full touch-pan-x overscroll-x-contain">
              <table className="w-full min-w-[950px] text-left font-sans border-collapse">
                <thead className="border-b border-[var(--line)] text-[var(--ink-soft)] font-mono text-[10px] bg-[var(--surface-alt)]">
                  <tr>
                    <th className="p-3.5 font-medium min-w-[110px] whitespace-nowrap">Order ID</th>
                    <th className="p-3.5 font-medium min-w-[180px]">Product</th>
                    <th className="p-3.5 font-medium min-w-[180px]">Client Info</th>
                    <th className="p-3.5 font-medium text-center min-w-[70px] whitespace-nowrap">Qty</th>
                    <th className="p-3.5 font-medium text-right min-w-[140px] whitespace-nowrap">Profit Margin</th>
                    <th className="p-3.5 font-medium text-center min-w-[110px] whitespace-nowrap">Status</th>
                    <th className="p-3.5 font-medium text-center min-w-[150px] whitespace-nowrap">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] text-[var(--ink-soft)]">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-[var(--surface-alt)]/60 transition-colors">
                      <td className="p-3.5 font-mono text-[var(--ink-soft)]/70 min-w-[110px] whitespace-nowrap">{sale.id}</td>
                      <td className="p-3.5 min-w-[180px]">
                        <p className="font-serif font-semibold text-[var(--ink)]">{sale.productName}</p>
                        <p className="text-[10px] font-mono text-[var(--ink-soft)]/70 whitespace-nowrap">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-3.5 min-w-[180px]">
                        <p className="text-[var(--ink)] font-medium">{sale.customerName}</p>
                        <div className="flex items-center space-x-2 text-[10px] text-[var(--ink-soft)]/70 font-mono whitespace-nowrap">
                          {sale.customerPhone ? (
                            <a
                              href={`https://wa.me/${sale.customerPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[var(--primary)] flex items-center space-x-0.5 hover:underline whitespace-nowrap"
                            >
                              <WhatsappLogo size={12} weight="fill" className="shrink-0" />
                              <span>{sale.customerPhone}</span>
                            </a>
                          ) : (
                            <span className="truncate">{sale.customerEmail || 'No contact'}</span>
                          )}
                          {sale.customerCity && <span className="whitespace-nowrap">• {sale.customerCity}</span>}
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono font-medium text-[var(--ink)] min-w-[70px] whitespace-nowrap">
                        {sale.quantity}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-[var(--accent)] min-w-[140px] whitespace-nowrap">
                        +PKR {(sale.profitMargin * sale.quantity).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-center min-w-[110px] whitespace-nowrap">
                        {getStatusBadge(sale.status)}
                      </td>
                      <td className="p-3.5 text-center min-w-[150px] whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSale(sale)}
                          iconLeft={<Truck size={13} className="shrink-0" />}
                          className="text-[11px] px-2.5 py-1 whitespace-nowrap shrink-0"
                        >
                          Track Shipping
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Withdrawals History */}
      {activeTab === 'withdrawals' && (
        <div className="funding-table-wrap text-xs shadow-xl">
          <div className="p-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between font-mono">
            <span className="font-semibold text-[#F4F7F5]">Profit Withdrawal Claims</span>
            <span className="text-[#9EABA2] text-[11px] font-mono">{withdrawals.length} Submitted</span>
          </div>

          {withdrawals.length === 0 ? (
            <div className="p-12 text-center text-[#9EABA2] space-y-3">
              <HandCoins size={32} className="text-[#9EABA2]/60 mx-auto" />
              <p className="font-serif font-bold text-base text-[#F4F7F5]">No profit withdrawals requested yet</p>
              <p className="text-xs text-[#9EABA2] max-w-sm mx-auto">
                Once your delivered sales profits clear, request payout directly to your bank account or mobile wallet.
              </p>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="funding-sheen-btn px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md cursor-pointer mt-2"
              >
                <Plus size={14} weight="bold" />
                <span>Request Payout Now</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto w-full touch-pan-x overscroll-x-contain">
              <table className="w-full min-w-[950px] text-left font-sans border-collapse">
                <thead className="border-b border-[var(--line)] text-[var(--ink-soft)] font-mono text-[10px] bg-[var(--surface-alt)]">
                  <tr>
                    <th className="p-3.5 font-medium min-w-[110px] whitespace-nowrap">Request ID</th>
                    <th className="p-3.5 font-medium min-w-[200px]">Payout Account</th>
                    <th className="p-3.5 font-medium text-right min-w-[130px] whitespace-nowrap">Amount (PKR)</th>
                    <th className="p-3.5 font-medium text-center min-w-[110px] whitespace-nowrap">Status</th>
                    <th className="p-3.5 font-medium min-w-[150px]">Admin Reference / Note</th>
                    <th className="p-3.5 font-medium text-right min-w-[110px] whitespace-nowrap">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] text-[var(--ink-soft)]">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-[var(--surface-alt)]/60 transition-colors">
                      <td className="p-3.5 font-mono text-[var(--ink-soft)]/70 min-w-[110px] whitespace-nowrap">{w.id}</td>
                      <td className="p-3.5 min-w-[200px]">
                        <p className="font-serif font-semibold text-[var(--ink)] whitespace-nowrap">
                          {w.payoutMethod.bankName}
                        </p>
                        <p className="text-[10px] font-mono text-[var(--ink-soft)]/70 whitespace-nowrap">
                          {w.payoutMethod.accountTitle} • {w.payoutMethod.accountNumber}
                        </p>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-[var(--primary)] min-w-[130px] whitespace-nowrap">
                        PKR {w.amount.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-center min-w-[110px] whitespace-nowrap">
                        <span
                          className={`inline-block text-[10px] font-mono font-semibold capitalize px-2 py-0.5 rounded border whitespace-nowrap ${
                            w.status === 'paid'
                              ? 'bg-[var(--surface-alt)] text-[var(--primary)] border-[var(--line)]'
                              : w.status === 'approved'
                              ? 'bg-[var(--surface-alt)] text-[var(--primary)] border-[var(--line)]'
                              : w.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                              : 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[var(--ink-soft)] min-w-[150px]">
                        <p>{w.transactionReference || w.adminNote || 'Pending manual transfer'}</p>
                        {w.payoutProofUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewSlipUrl(w.payoutProofUrl!);
                              setPreviewZoom(1);
                              setPreviewRotation(0);
                            }}
                            className="mt-1 text-[10px] text-[var(--primary)] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <MagnifyingGlassPlus size={11} />
                            <span>View Payment Slip Receipt</span>
                          </button>
                        )}
                      </td>
                      <td className="p-3.5 text-right text-[var(--ink-soft)]/70 font-mono">
                        {new Date(w.requestedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 1. Request Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain">
          <div className="rounded-t-3xl sm:rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-5 sm:p-6 max-w-md w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-y-auto space-y-4 shadow-xl pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6 text-xs overscroll-contain animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 ease-out">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="font-serif font-medium text-base text-[var(--ink)]">
                  Request Profit Withdrawal
                </h3>
                <p className="text-[11px] font-mono text-[var(--ink-soft)]">
                  Available Balance: <span className="font-bold text-[var(--primary)]">PKR {availableBalance.toLocaleString()}</span>
                </p>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)] active:scale-[0.96] transition-transform"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {withdrawError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                {withdrawError}
              </div>
            )}

            {withdrawSuccess && (
              <div className="p-3 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--primary)] text-xs flex items-center space-x-2">
                <Check size={16} weight="bold" />
                <span>{withdrawSuccess}</span>
              </div>
            )}

            {paymentMethods.length === 0 ? (
              <div className="p-5 text-center rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] space-y-2">
                <p className="text-[var(--ink)] font-medium">No Payout Methods Found</p>
                <p className="text-xs text-[var(--ink-soft)]">
                  Please add your Pakistani Bank or EasyPaisa/JazzCash account in your Profile first.
                </p>
                <Link to="/dashboard/profile">
                  <Button variant="primary" size="sm" className="mt-2 text-xs">
                    Add Payout Method
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                <div>
                  <label className="block text-[var(--ink-soft)] mb-1 font-medium">Select Receiving Account *</label>
                  <select
                    value={selectedMethodId}
                    onChange={(e) => setSelectedMethodId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-xs font-mono"
                  >
                    {paymentMethods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.bankName} - {m.accountTitle} ({m.accountNumber}) {m.isDefault ? '[Primary]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[var(--ink-soft)] font-medium">Withdrawal Amount (PKR) *</label>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(availableBalance)}
                      className="text-[10px] font-mono text-[var(--primary)] hover:underline"
                    >
                      Max: PKR {availableBalance.toLocaleString()}
                    </button>
                  </div>
                  <input
                    type="number"
                    required
                    min={500}
                    max={availableBalance}
                    value={withdrawAmount || ''}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    placeholder="Min 500"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] font-mono font-bold text-sm"
                  />
                  <p className="text-[10px] text-[var(--ink-soft)]/70 mt-1 font-mono">
                    Manual payout processed by platform administrator within 24-48 hours.
                  </p>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWithdrawModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={withdrawLoading || availableBalance < 500}
                    isLoading={withdrawLoading}
                  >
                    Confirm Payout Request
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Order Details & Live Shipping Tracking Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain">
          <div className="rounded-t-3xl sm:rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-5 sm:p-6 max-w-lg w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-y-auto space-y-5 shadow-xl pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6 text-xs overscroll-contain animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 ease-out">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="font-serif font-medium text-base text-[var(--ink)]">
                  Order Fulfillment &amp; Shipping Tracker
                </h3>
                <p className="text-[11px] font-mono text-[var(--ink-soft)]">
                  Order: {selectedSale.id} • {new Date(selectedSale.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)] active:scale-[0.96] transition-transform"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* 5-Step Shipping Progress Stepper */}
            <div className="p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[var(--ink)]">
                  Live Fulfillment Progress
                </span>
                {getStatusBadge(selectedSale.status)}
              </div>

              <div className="relative pt-2">
                {/* Stepper Dots & Line */}
                <div className="flex items-center justify-between relative z-10">
                  {[
                    { step: 1, label: 'Submitted' },
                    { step: 2, label: 'Payment Verified' },
                    { step: 3, label: 'Packing' },
                    { step: 4, label: 'Dispatched' },
                    { step: 5, label: 'Delivered' },
                  ].map((s) => {
                    const currentStep = getShippingStepIndex(selectedSale.status);
                    const isCompleted = currentStep >= s.step;
                    const isCurrent = currentStep === s.step;

                    return (
                      <div key={s.step} className="flex flex-col items-center text-center w-1/5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold transition-all ${
                            isCompleted
                              ? 'bg-[var(--primary)] text-white'
                              : 'bg-[var(--surface)] text-[var(--ink-soft)]/70 border border-[var(--line)]'
                          } ${isCurrent ? 'ring-3 ring-[var(--primary)]/20' : ''}`}
                        >
                          {isCompleted && s.step < currentStep ? '✓' : s.step}
                        </div>
                        <span
                          className={`text-[9px] font-mono mt-1 leading-tight ${
                            isCurrent ? 'font-bold text-[var(--primary)]' : 'text-[var(--ink-soft)]'
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedSale.shippingCourier && (
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] space-y-1 font-mono text-xs mt-2">
                  <div className="flex justify-between text-[var(--ink-soft)]">
                    <span>Courier Service:</span>
                    <span className="text-[var(--ink)] font-bold">{selectedSale.shippingCourier}</span>
                  </div>
                  {selectedSale.trackingNumber && (
                    <div className="flex justify-between text-[var(--ink-soft)]">
                      <span>Tracking ID:</span>
                      <span className="text-[var(--primary)] font-bold select-all">
                        {selectedSale.trackingNumber}
                      </span>
                    </div>
                  )}
                  {selectedSale.shippingNotes && (
                    <div className="pt-1 border-t border-[var(--line)] text-[10px] text-[var(--ink-soft)]">
                      Note: {selectedSale.shippingNotes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Buyer Details */}
            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-2">
              <h4 className="font-serif font-semibold text-xs text-[var(--ink)]">
                Customer &amp; Shipping Destination
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--ink-soft)]">Customer:</span>
                  <span className="text-[var(--ink)] font-medium">{selectedSale.customerName}</span>
                </div>
                {selectedSale.customerPhone && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--ink-soft)]">WhatsApp:</span>
                    <a
                      href={`https://wa.me/${selectedSale.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--primary)] flex items-center space-x-1 font-mono hover:underline font-bold"
                    >
                      <WhatsappLogo size={13} weight="fill" />
                      <span>{selectedSale.customerPhone}</span>
                    </a>
                  </div>
                )}
                {selectedSale.customerAddress && (
                  <div className="pt-1 border-t border-[var(--line)] text-[var(--ink-soft)]">
                    <span className="font-medium text-[var(--ink)] block">Shipping Address:</span>
                    <p className="text-[11px] leading-relaxed mt-0.5">{selectedSale.customerAddress} ({selectedSale.customerCity || 'PK'})</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financials */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-[var(--ink-soft)]">
                <span>Product:</span>
                <span className="text-[var(--ink)] font-medium">{selectedSale.productName} (x{selectedSale.quantity})</span>
              </div>
              <div className="flex justify-between text-[var(--ink-soft)]">
                <span>Wholesale Margin:</span>
                <span className="text-[var(--accent)] font-bold">
                  +PKR {(selectedSale.profitMargin * selectedSale.quantity).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Proof Screenshots - Both Seller Slip & Admin Slip */}
            <div className="space-y-3 pt-1">
              {/* 1. Seller's Customer Payment Slip */}
              {selectedSale.paymentScreenshotUrl && (
                <div className="space-y-1.5 p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[var(--ink)] flex items-center gap-1">
                      📸 Your Attached Customer Payment Slip
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewSlipUrl(selectedSale.paymentScreenshotUrl!);
                        setPreviewZoom(1);
                        setPreviewRotation(0);
                      }}
                      className="text-[10px] font-mono text-[var(--primary)] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <MagnifyingGlassPlus size={12} />
                      <span>Zoom Slip</span>
                    </button>
                  </div>
                  <div
                    onClick={() => {
                      setPreviewSlipUrl(selectedSale.paymentScreenshotUrl!);
                      setPreviewZoom(1);
                      setPreviewRotation(0);
                    }}
                    className="p-2 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] text-center cursor-zoom-in group relative"
                    title="Click to view full receipt"
                  >
                    <img
                      src={selectedSale.paymentScreenshotUrl}
                      alt="Seller Payment Slip"
                      className="max-h-48 max-w-full rounded-lg object-contain mx-auto border border-[var(--line)] bg-[var(--surface)] shadow-2xs group-hover:opacity-90 transition-opacity"
                    />
                    {selectedSale.paymentProofNotes && (
                      <p className="text-[10px] text-[var(--ink-soft)] font-mono mt-1.5">
                        Your Note: {selectedSale.paymentProofNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Admin's Official Verification & Courier Slip */}
              {selectedSale.adminPaymentProofUrl && (
                <div className="space-y-1.5 p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--primary)]/30">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--primary)] flex items-center gap-1">
                      <ShieldCheck size={14} weight="fill" /> Official Admin Verification / Courier Slip
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewSlipUrl(selectedSale.adminPaymentProofUrl!);
                        setPreviewZoom(1);
                        setPreviewRotation(0);
                      }}
                      className="text-[10px] font-mono text-[var(--primary)] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <MagnifyingGlassPlus size={12} />
                      <span>Inspect Full</span>
                    </button>
                  </div>
                  <div
                    onClick={() => {
                      setPreviewSlipUrl(selectedSale.adminPaymentProofUrl!);
                      setPreviewZoom(1);
                      setPreviewRotation(0);
                    }}
                    className="p-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-center cursor-zoom-in group relative"
                    title="Click to inspect admin proof slip"
                  >
                    <img
                      src={selectedSale.adminPaymentProofUrl}
                      alt="Admin Proof Slip"
                      className="max-h-48 max-w-full rounded-lg object-contain mx-auto border border-[var(--line)] bg-[var(--surface)] shadow-2xs group-hover:opacity-90 transition-opacity"
                    />
                    {selectedSale.adminProofNotes && (
                      <p className="text-[10px] text-[var(--primary)] font-mono mt-1.5 font-semibold">
                        Admin Note: {selectedSale.adminProofNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedSale(null)}>
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Slip Lightbox Zoom Modal */}
      {previewSlipUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] animate-in fade-in overscroll-contain"
          onClick={() => setPreviewSlipUrl(null)}
        >
          <div
            className="flex flex-wrap items-center justify-between w-full max-w-3xl pb-3 gap-2 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm">Payment Proof Preview</span>
              <span className="text-xs text-gray-400 font-mono">({Math.round(previewZoom * 100)}% Zoom)</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPreviewZoom((z) => Math.min(3, z + 0.25))}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.96] text-white transition-all cursor-pointer inline-flex items-center justify-center"
                title="Zoom In"
              >
                <MagnifyingGlassPlus size={18} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewZoom((z) => Math.max(0.5, z - 0.25))}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.96] text-white transition-all cursor-pointer inline-flex items-center justify-center"
                title="Zoom Out"
              >
                <MagnifyingGlassMinus size={18} />
              </button>
              <button
                type="button"
                onClick={() => setPreviewRotation((r) => (r + 90) % 360)}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.96] text-white transition-all cursor-pointer inline-flex items-center justify-center"
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
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-white/10 hover:bg-rose-600 active:scale-[0.96] text-white transition-all cursor-pointer inline-flex items-center justify-center ml-1 sm:ml-2"
                title="Close Lightbox (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

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

    </div>
  );
};


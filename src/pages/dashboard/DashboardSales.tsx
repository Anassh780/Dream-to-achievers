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
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F1ECDD] text-[#1F4D3E] border border-[#E3DCC8]">
            <CheckCircle size={12} weight="fill" /> Delivered
          </span>
        );
      case 'dispatched':
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <Truck size={12} weight="bold" /> In Transit
          </span>
        );
      case 'processing':
      case 'payment_verified':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#EFE2C4] text-[#B8862E] border border-[#B8862E]/30">
            <Clock size={12} weight="bold" /> Processing
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
    <div className="space-y-6 font-sans max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>Commercials</span>
            <span>/</span>
            <span>Sales &amp; Profit Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E241F] tracking-tight">
            Direct Customer Sales &amp; Profit Ledger
          </h1>
          <p className="text-xs text-[#5B5C50]">
            Track customer orders, live shipping status, wholesale profit margins, and withdrawal payouts.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWithdrawModal(true)}
            iconLeft={<HandCoins size={15} className="text-[#1F4D3E]" />}
            className="text-xs font-semibold py-2.5"
          >
            Request Withdrawal
          </Button>

          <Link to="/dashboard/products">
            <Button variant="primary" size="sm" iconLeft={<ShoppingCart size={14} />} className="text-xs font-semibold py-2.5">
              Record New Sale
            </Button>
          </Link>
        </div>
      </div>

      {/* Beginner Helper Tip */}
      <div className="p-4 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-xs text-[#1E241F] flex items-start space-x-3">
        <span className="text-base leading-none">💡</span>
        <div className="space-y-0.5">
          <p className="font-bold text-[#1F4D3E]">How Order Verification &amp; Profit Withdrawal Works:</p>
          <p className="text-[#5B5C50] text-[11.5px] leading-relaxed">
            When you submit a customer order with their shipping details, admin operations verify the payment proof and updates shipping progress live. Once verified, your unit profit is credited directly to <strong className="text-[#1E241F]">Available Balance</strong> for instant withdrawal into your added Easypaisa, JazzCash, or Bank Account.
          </p>
        </div>
      </div>

      {/* Accounting Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-5 rounded-2xl bg-[#FAF7EF] border border-[#1F4D3E]/30 space-y-1 shadow-xs ring-1 ring-[#1F4D3E]/10">
          <span className="text-[11px] text-[#1F4D3E] font-mono font-medium block">
            Available for Withdrawal
          </span>
          <span className="text-2xl font-bold font-mono text-[#1F4D3E]">
            PKR {availableBalance.toLocaleString()}
          </span>
          <p className="text-[10px] text-[#5B5C50]">Ready for instant manual payout</p>
        </div>

        {/* Pending In-Transit Profit */}
        <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-[11px] text-[#B8862E] font-mono font-medium block">
            Pending / In-Transit Profit
          </span>
          <span className="text-2xl font-bold font-mono text-[#B8862E]">
            PKR {pendingProfit.toLocaleString()}
          </span>
          <p className="text-[10px] text-[#5B5C50]">Released upon customer delivery</p>
        </div>

        {/* Lifetime Profit Earned */}
        <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-[11px] text-[#5B5C50] font-mono block">
            Total Delivered Profit
          </span>
          <span className="text-2xl font-bold font-mono text-[#1E241F]">
            PKR {totalDeliveredProfit.toLocaleString()}
          </span>
          <p className="text-[10px] text-[#5B5C50]">Across all confirmed deliveries</p>
        </div>

        {/* Total Withdrawn */}
        <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-[11px] text-[#5B5C50] font-mono block">
            Total Withdrawn
          </span>
          <span className="text-2xl font-bold font-mono text-[#1E241F]">
            PKR {totalWithdrawn.toLocaleString()}
          </span>
          <p className="text-[10px] text-[#5B5C50]">{totalUnits} qualifying delivered units</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E3DCC8] pb-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-mono font-medium transition-all border-b-2 -mb-[5px] ${
            activeTab === 'orders'
              ? 'border-[#1F4D3E] text-[#1F4D3E]'
              : 'border-transparent text-[#5B5C50] hover:text-[#1E241F]'
          }`}
        >
          Customer Orders Ledger ({sales.length})
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2 text-xs font-mono font-medium transition-all border-b-2 -mb-[5px] ${
            activeTab === 'withdrawals'
              ? 'border-[#1F4D3E] text-[#1F4D3E]'
              : 'border-transparent text-[#5B5C50] hover:text-[#1E241F]'
          }`}
        >
          Profit Withdrawals ({withdrawals.length})
        </button>
      </div>

      {/* TAB 1: Customer Orders */}
      {activeTab === 'orders' && (
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
                    <th className="p-3.5 font-medium text-right">Profit Margin</th>
                    <th className="p-3.5 font-medium text-center">Status</th>
                    <th className="p-3.5 font-medium text-center">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#FAF7EF] transition-colors">
                      <td className="p-3.5 font-mono text-[#7C7D70]">{sale.id}</td>
                      <td className="p-3.5">
                        <p className="font-serif font-semibold text-[#1E241F]">{sale.productName}</p>
                        <p className="text-[10px] font-mono text-[#7C7D70]">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <p className="text-[#1E241F] font-medium">{sale.customerName}</p>
                        <div className="flex items-center space-x-2 text-[10px] text-[#7C7D70] font-mono">
                          {sale.customerPhone ? (
                            <a
                              href={`https://wa.me/${sale.customerPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#1F4D3E] flex items-center space-x-0.5 hover:underline"
                            >
                              <WhatsappLogo size={12} weight="fill" />
                              <span>{sale.customerPhone}</span>
                            </a>
                          ) : (
                            <span>{sale.customerEmail || 'No contact'}</span>
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
                          onClick={() => setSelectedSale(sale)}
                          iconLeft={<Truck size={13} />}
                          className="text-[11px] px-2.5 py-1"
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
        <div className="rounded-xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs">
          <div className="p-3.5 bg-[#F1ECDD] border-b border-[#E3DCC8] flex items-center justify-between font-mono">
            <span className="font-semibold text-[#1E241F]">Profit Withdrawal Claims</span>
            <span className="text-[10px] text-[#5B5C50]">{withdrawals.length} Records</span>
          </div>

          {withdrawals.length === 0 ? (
            <div className="p-12 text-center text-[#5B5C50] space-y-2">
              <CurrencyDollar size={32} className="text-[#7C7D70] mx-auto" />
              <p className="font-serif font-medium text-base text-[#1E241F]">No withdrawal requests yet</p>
              <p className="text-xs">
                When you have approved profit margin in your account, you can request a manual payout.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowWithdrawModal(true)}
                disabled={availableBalance < 500}
                className="mt-2 text-xs"
              >
                Request Withdrawal
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                <thead className="border-b border-[#E3DCC8] text-[#5B5C50] font-mono text-[10px] bg-[#FAF7EF]">
                  <tr>
                    <th className="p-3.5 font-medium">Request ID</th>
                    <th className="p-3.5 font-medium">Payout Account</th>
                    <th className="p-3.5 font-medium text-right">Amount (PKR)</th>
                    <th className="p-3.5 font-medium text-center">Status</th>
                    <th className="p-3.5 font-medium">Admin Reference / Note</th>
                    <th className="p-3.5 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-[#FAF7EF] transition-colors">
                      <td className="p-3.5 font-mono text-[#7C7D70]">{w.id}</td>
                      <td className="p-3.5">
                        <p className="font-serif font-semibold text-[#1E241F]">
                          {w.payoutMethod.bankName}
                        </p>
                        <p className="text-[10px] font-mono text-[#7C7D70]">
                          {w.payoutMethod.accountTitle} • {w.payoutMethod.accountNumber}
                        </p>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-[#1F4D3E]">
                        PKR {w.amount.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block text-[10px] font-mono font-semibold capitalize px-2 py-0.5 rounded border ${
                            w.status === 'paid'
                              ? 'bg-[#F1ECDD] text-[#1F4D3E] border-[#E3DCC8]'
                              : w.status === 'approved'
                              ? 'bg-[#F1ECDD] text-[#1F4D3E] border-[#E3DCC8]'
                              : w.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-[#EFE2C4] text-[#B8862E] border-[#B8862E]/30'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[#5B5C50]">
                        {w.transactionReference || w.adminNote || 'Pending manual transfer'}
                      </td>
                      <td className="p-3.5 text-right text-[#7C7D70] font-mono">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white border border-[#E3DCC8] p-6 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
              <div>
                <h3 className="font-serif font-medium text-base text-[#1E241F]">
                  Request Profit Withdrawal
                </h3>
                <p className="text-[11px] font-mono text-[#5B5C50]">
                  Available Balance: <span className="font-bold text-[#1F4D3E]">PKR {availableBalance.toLocaleString()}</span>
                </p>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 rounded-lg text-[#5B5C50] hover:text-[#1E241F]"
              >
                <X size={18} />
              </button>
            </div>

            {withdrawError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {withdrawError}
              </div>
            )}

            {withdrawSuccess && (
              <div className="p-3 rounded-lg bg-[#F1ECDD] border border-[#E3DCC8] text-[#1F4D3E] text-xs flex items-center space-x-2">
                <Check size={16} weight="bold" />
                <span>{withdrawSuccess}</span>
              </div>
            )}

            {paymentMethods.length === 0 ? (
              <div className="p-5 text-center rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2">
                <p className="text-[#1E241F] font-medium">No Payout Methods Found</p>
                <p className="text-xs text-[#5B5C50]">
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
                  <label className="block text-[#5B5C50] mb-1 font-medium">Select Receiving Account *</label>
                  <select
                    value={selectedMethodId}
                    onChange={(e) => setSelectedMethodId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] text-xs font-mono"
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
                    <label className="text-[#5B5C50] font-medium">Withdrawal Amount (PKR) *</label>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(availableBalance)}
                      className="text-[10px] font-mono text-[#1F4D3E] hover:underline"
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
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] font-mono font-bold text-sm"
                  />
                  <p className="text-[10px] text-[#7C7D70] mt-1 font-mono">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white border border-[#E3DCC8] p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
              <div>
                <h3 className="font-serif font-medium text-base text-[#1E241F]">
                  Order Fulfillment &amp; Shipping Tracker
                </h3>
                <p className="text-[11px] font-mono text-[#5B5C50]">
                  Order: {selectedSale.id} • {new Date(selectedSale.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="p-1 rounded-lg text-[#5B5C50] hover:text-[#1E241F]"
              >
                <X size={18} />
              </button>
            </div>

            {/* 5-Step Shipping Progress Stepper */}
            <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#1E241F]">
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
                              ? 'bg-[#1F4D3E] text-white'
                              : 'bg-white text-[#7C7D70] border border-[#E3DCC8]'
                          } ${isCurrent ? 'ring-3 ring-[#1F4D3E]/20' : ''}`}
                        >
                          {isCompleted && s.step < currentStep ? '✓' : s.step}
                        </div>
                        <span
                          className={`text-[9px] font-mono mt-1 leading-tight ${
                            isCurrent ? 'font-bold text-[#1F4D3E]' : 'text-[#5B5C50]'
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
                <div className="p-2.5 rounded-lg bg-white border border-[#E3DCC8] space-y-1 font-mono text-xs mt-2">
                  <div className="flex justify-between text-[#5B5C50]">
                    <span>Courier Service:</span>
                    <span className="text-[#1E241F] font-bold">{selectedSale.shippingCourier}</span>
                  </div>
                  {selectedSale.trackingNumber && (
                    <div className="flex justify-between text-[#5B5C50]">
                      <span>Tracking ID:</span>
                      <span className="text-[#1F4D3E] font-bold select-all">
                        {selectedSale.trackingNumber}
                      </span>
                    </div>
                  )}
                  {selectedSale.shippingNotes && (
                    <div className="pt-1 border-t border-[#E3DCC8] text-[10px] text-[#5B5C50]">
                      Note: {selectedSale.shippingNotes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Buyer Details */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E3DCC8] space-y-2">
              <h4 className="font-serif font-semibold text-xs text-[#1E241F]">
                Customer &amp; Shipping Destination
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5B5C50]">Customer:</span>
                  <span className="text-[#1E241F] font-medium">{selectedSale.customerName}</span>
                </div>
                {selectedSale.customerPhone && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#5B5C50]">WhatsApp:</span>
                    <a
                      href={`https://wa.me/${selectedSale.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1F4D3E] flex items-center space-x-1 font-mono hover:underline font-bold"
                    >
                      <WhatsappLogo size={13} weight="fill" />
                      <span>{selectedSale.customerPhone}</span>
                    </a>
                  </div>
                )}
                {selectedSale.customerAddress && (
                  <div className="pt-1 border-t border-[#E3DCC8] text-[#5B5C50]">
                    <span className="font-medium text-[#1E241F] block">Shipping Address:</span>
                    <p className="text-[11px] leading-relaxed mt-0.5">{selectedSale.customerAddress} ({selectedSale.customerCity || 'PK'})</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financials */}
            <div className="p-3.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-[#5B5C50]">
                <span>Product:</span>
                <span className="text-[#1E241F] font-medium">{selectedSale.productName} (x{selectedSale.quantity})</span>
              </div>
              <div className="flex justify-between text-[#5B5C50]">
                <span>Wholesale Margin:</span>
                <span className="text-[#B8862E] font-bold">
                  +PKR {(selectedSale.profitMargin * selectedSale.quantity).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Proof Screenshot */}
            {selectedSale.paymentScreenshotUrl && (
              <div className="space-y-1.5">
                <h4 className="font-serif font-semibold text-xs text-[#1E241F]">
                  Attached Payment Proof Screenshot
                </h4>
                <div className="p-2 rounded-xl border border-[#E3DCC8] bg-[#FAF7EF] text-center">
                  <img
                    src={selectedSale.paymentScreenshotUrl}
                    alt="Payment Slip"
                    className="max-h-56 max-w-full rounded-lg object-contain mx-auto border border-[#E3DCC8] bg-white shadow-2xs"
                  />
                  {selectedSale.paymentProofNotes && (
                    <p className="text-[10px] text-[#5B5C50] font-mono mt-1.5">
                      Note: {selectedSale.paymentProofNotes}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedSale(null)}>
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


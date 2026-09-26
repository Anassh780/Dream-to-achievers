import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/services/storage';
import { authService } from '@/services/authService';
import { payoutService } from '@/services/payoutService';
import { User as UserType, PaymentMethod, PaymentMethodType } from '@/types';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/context/ToastContext';
import {
  User,
  EnvelopeSimple,
  Phone,
  MapPin,
  Check,
  CreditCard,
  Bank,
  DeviceMobile,
  Plus,
  Trash,
  CheckCircle,
  X,
  Star,
} from '@phosphor-icons/react';

export const DashboardProfile: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);
  const [methodType, setMethodType] = useState<PaymentMethodType>('easypaisa');
  const [bankName, setBankName] = useState('EasyPaisa');
  const [accountTitle, setAccountTitle] = useState(user?.fullName || '');
  const [accountNumber, setAccountNumber] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [methodMsg, setMethodMsg] = useState('');

  useEffect(() => {
    if (user?.id) {
      setPaymentMethods(payoutService.getUserPaymentMethods(user.id));
    }
  }, [user?.id]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updatedUser: UserType = {
      ...user,
      fullName: fullName.trim() || user.fullName,
      phone: phone.trim() || '',
      city: city.trim() || '',
    };
    await authService.saveUserProfile(updatedUser);

    refreshUserData();
    setLoading(false);
    setSaved(true);
    toastSuccess('Profile details saved successfully.');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountTitle || !accountNumber || !bankName) return;

    await payoutService.addPaymentMethod({
      userId: user.id,
      methodType,
      bankName,
      accountTitle,
      accountNumber,
      branchCity: branchCity || undefined,
      isDefault,
    });

    setPaymentMethods(payoutService.getUserPaymentMethods(user.id));
    setShowAddMethodModal(false);
    setAccountTitle(user.fullName || '');
    setAccountNumber('');
    setBranchCity('');
    setIsDefault(false);
    toastSuccess(`Payout method (${bankName} - ${accountNumber}) saved.`);
    setMethodMsg('Payout method added successfully.');
    setTimeout(() => setMethodMsg(''), 3000);
  };

  const handleDeleteMethod = (method: PaymentMethod) => {
    setMethodToDelete(method);
  };

  const handleConfirmDeleteMethod = () => {
    if (!methodToDelete || !user) return;
    payoutService.deletePaymentMethod(user.id, methodToDelete.id);
    setPaymentMethods(payoutService.getUserPaymentMethods(user.id));
    toastSuccess(`Payout method (${methodToDelete.bankName}) removed.`);
    setMethodToDelete(null);
  };

  const handleSetDefaultMethod = (id: string) => {
    payoutService.setDefaultPaymentMethod(user.id, id);
    setPaymentMethods(payoutService.getUserPaymentMethods(user.id));
    toastSuccess('Default payout account updated.');
  };

  const getMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case 'bank_transfer':
        return <Bank size={18} className="text-[var(--primary)]" />;
      case 'easypaisa':
      case 'jazzcash':
      case 'sadapay':
      case 'nayapay':
      default:
        return <DeviceMobile size={18} className="text-[var(--primary)]" />;
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl selection:bg-[var(--accent)]/25">
      
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-[var(--line)]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[var(--ink-soft)]">
          <span>Account</span>
          <span>/</span>
          <span>Profile &amp; Payout Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] tracking-tight">
          Partner Identity &amp; Payout Methods
        </h1>
        <p className="text-xs text-[var(--ink-soft)]">
          Manage your partner profile details, contact information, and local bank/wallet payout accounts.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--primary)] text-xs flex items-center space-x-2 animate-in fade-in">
          <Check size={16} weight="bold" />
          <span className="font-semibold">Profile details saved successfully.</span>
        </div>
      )}

      {methodMsg && (
        <div className="p-3.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--primary)] text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle size={16} weight="fill" />
          <span className="font-semibold">{methodMsg}</span>
        </div>
      )}

      {/* 1. Profile Form Card */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-5 shadow-xs">
        <div className="flex items-center space-x-4 pb-4 border-b border-[var(--line)]">
          <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-serif font-semibold text-lg">
            {(user.fullName || 'P').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-serif font-medium text-base text-[var(--ink)]">{user.fullName || 'Partner Member'}</h3>
            <p className="text-xs font-mono text-[var(--ink-soft)]">
              Partner Code: <span className="text-[var(--primary)] font-semibold">{user.referralCode || 'NO-CODE'}</span> • Rank: <span className="uppercase text-[var(--ink)] font-semibold">{user.currentRankSlug || 'unranked'}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[var(--ink-soft)] mb-1 font-medium">Full Legal Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]/70" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium">Email Address (Read-only)</label>
              <div className="relative">
                <EnvelopeSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]/70" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink-soft)] cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium">Referral Code (Immutable)</label>
              <input
                type="text"
                disabled
                value={user.referralCode}
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] font-mono font-bold cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium">Mobile Phone (WhatsApp)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]/70" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300 1234567"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium">City of Operations</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]/70" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lahore / Islamabad"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="text-xs font-medium"
              isLoading={loading}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Local Seller Payout Accounts Section */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--line)]">
          <div>
            <div className="flex items-center space-x-2">
              <CreditCard size={18} className="text-[var(--primary)]" />
              <h3 className="font-serif font-medium text-base text-[var(--ink)]">
                Local Payout &amp; Bank Methods
              </h3>
            </div>
            <p className="text-xs text-[var(--ink-soft)]">
              Add your Pakistani Bank accounts, EasyPaisa, or JazzCash for manual admin profit withdrawals.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddMethodModal(true)}
            iconLeft={<Plus size={14} />}
            className="text-xs shrink-0"
          >
            Add Payout Account
          </Button>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] space-y-2">
            <DeviceMobile size={28} className="text-[var(--ink-soft)]/70 mx-auto" />
            <h4 className="font-serif font-medium text-[var(--ink)] text-sm">No Payout Methods Configured</h4>
            <p className="text-xs text-[var(--ink-soft)] max-w-md mx-auto">
              Add your Bank Account, EasyPaisa, or JazzCash so you can apply for profit margin withdrawals.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddMethodModal(true)}
              className="mt-2 text-xs"
            >
              Add First Account
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paymentMethods.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-xl border relative transition-all flex flex-col justify-between space-y-3 ${
                  m.isDefault
                    ? 'bg-[var(--surface-alt)] border-[var(--primary)] ring-1 ring-[var(--primary)]/20'
                    : 'bg-[var(--surface)] border-[var(--line)] hover:border-[var(--primary)]/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
                      {getMethodIcon(m.methodType)}
                    </div>
                    <div>
                      <span className="font-serif font-semibold text-sm text-[var(--ink)] block">
                        {m.bankName}
                      </span>
                      <span className="text-[10.5px] font-mono text-[var(--ink-soft)] capitalize">
                        {m.methodType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {m.isDefault && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--surface-alt)] text-[var(--primary)] border border-[var(--line)]">
                      <Star size={11} weight="fill" /> Primary
                    </span>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-[var(--ink-soft)]">
                    <span>Title:</span>
                    <span className="text-[var(--ink)] font-medium">{m.accountTitle}</span>
                  </div>
                  <div className="flex justify-between text-[var(--ink-soft)]">
                    <span>Account / No:</span>
                    <span className="text-[var(--primary)] font-bold select-all">{m.accountNumber}</span>
                  </div>
                  {m.branchCity && (
                    <div className="flex justify-between text-[var(--ink-soft)] text-[10px]">
                      <span>Branch / City:</span>
                      <span>{m.branchCity}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                  {!m.isDefault ? (
                    <button
                      onClick={() => handleSetDefaultMethod(m.id)}
                      className="text-[var(--primary)] hover:underline cursor-pointer"
                    >
                      Set as Primary
                    </button>
                  ) : (
                    <span className="text-[10px] text-[var(--ink-soft)]/70">Selected for payouts</span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteMethod(m)}
                    className="text-[var(--ink-soft)] hover:text-rose-600 p-1 transition-colors cursor-pointer"
                    title={`Remove ${m.bankName} account`}
                    aria-label={`Remove ${m.bankName} account`}
                  >
                    <Trash size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Payout Method Modal */}
      {showAddMethodModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-6 max-w-md w-full max-h-[calc(100dvh-2rem)] overflow-y-auto space-y-4 shadow-xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="font-serif font-medium text-base text-[var(--ink)]">
                  Add Payout Account
                </h3>
                <p className="text-[11px] font-mono text-[var(--ink-soft)]">
                  Configure your local Pakistani receiving account
                </p>
              </div>
              <button
                onClick={() => setShowAddMethodModal(false)}
                className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)]"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPaymentMethod} className="space-y-3.5">
              <div>
                <label className="block text-[var(--ink-soft)] mb-1 font-medium">Payment Provider *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'easypaisa', label: 'EasyPaisa' },
                    { id: 'jazzcash', label: 'JazzCash' },
                    { id: 'bank_transfer', label: 'Bank (IBFT)' },
                    { id: 'sadapay', label: 'SadaPay' },
                    { id: 'nayapay', label: 'NayaPay' },
                    { id: 'other', label: 'Other Bank' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setMethodType(item.id as PaymentMethodType);
                        if (item.id === 'easypaisa') setBankName('EasyPaisa');
                        else if (item.id === 'jazzcash') setBankName('JazzCash');
                        else if (item.id === 'sadapay') setBankName('SadaPay');
                        else if (item.id === 'nayapay') setBankName('NayaPay');
                        else if (item.id === 'bank_transfer') setBankName('Meezan Bank');
                      }}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        methodType === item.id
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)] font-medium'
                          : 'bg-[var(--surface-alt)] text-[var(--ink-soft)] border-[var(--line)] hover:bg-[var(--surface-alt)]/80'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[var(--ink-soft)] mb-1 font-medium">
                  Bank / Wallet Name *
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Meezan Bank / HBL / EasyPaisa"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--ink-soft)] mb-1 font-medium">
                  Account Title (Full Name on Account) *
                </label>
                <input
                  type="text"
                  required
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  placeholder="e.g. Muhammad Anas"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--ink-soft)] mb-1 font-medium">
                  Account Number / Mobile Number / IBAN *
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 03001234567 or PK36MEZN00..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] font-mono"
                />
              </div>

              <div>
                <label className="block text-[var(--ink-soft)] mb-1 font-medium">
                  Branch / City (Optional)
                </label>
                <input
                  type="text"
                  value={branchCity}
                  onChange={(e) => setBranchCity(e.target.value)}
                  placeholder="e.g. Main Boulevard Gulberg, Lahore"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--primary)]"
                />
                <label htmlFor="defaultCheck" className="text-[var(--ink-soft)] text-xs cursor-pointer">
                  Set as primary payout method for future withdrawals
                </label>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddMethodModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Payout Method
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Removing Payout Method */}
      <ConfirmDialog
        isOpen={!!methodToDelete}
        title={`Remove Payout Account`}
        description={`Are you sure you want to remove your ${methodToDelete?.bankName || 'bank'} account (${methodToDelete?.accountNumber || ''})? Future payouts will not be sent to this destination.`}
        confirmLabel="Remove Account"
        cancelLabel="Keep Account"
        variant="danger"
        onConfirm={handleConfirmDeleteMethod}
        onClose={() => setMethodToDelete(null)}
      />

    </div>
  );
};


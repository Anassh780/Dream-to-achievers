import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/services/storage';
import { payoutService } from '@/services/payoutService';
import { User as UserType, PaymentMethod, PaymentMethodType } from '@/types';
import { Button } from '@/components/ui/Button';
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
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const users = storage.get<UserType[]>('USERS', []);
    const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, fullName, phone, city } : u));
    storage.set('USERS', updatedUsers);

    refreshUserData();
    setLoading(false);
    setSaved(true);
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
    setMethodMsg('Payout method added successfully.');
    setTimeout(() => setMethodMsg(''), 3000);
  };

  const handleDeleteMethod = (id: string) => {
    payoutService.deletePaymentMethod(user.id, id);
    setPaymentMethods(payoutService.getUserPaymentMethods(user.id));
  };

  const handleSetDefaultMethod = (id: string) => {
    payoutService.setDefaultPaymentMethod(user.id, id);
    setPaymentMethods(payoutService.getUserPaymentMethods(user.id));
  };

  const getMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case 'bank_transfer':
        return <Bank size={18} className="text-[#1F4D3E]" />;
      case 'easypaisa':
      case 'jazzcash':
      case 'sadapay':
      case 'nayapay':
      default:
        return <DeviceMobile size={18} className="text-[#1F4D3E]" />;
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-[#E3DCC8]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
          <span>Account</span>
          <span>/</span>
          <span>Profile &amp; Payout Settings</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1E241F] tracking-tight">
          Partner Identity &amp; Payout Methods
        </h1>
        <p className="text-xs text-[#5B5C50]">
          Manage your partner profile details, contact information, and local bank/wallet payout accounts.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-[#1F4D3E] text-xs flex items-center space-x-2 animate-in fade-in">
          <Check size={16} weight="bold" />
          <span className="font-semibold">Profile details saved successfully.</span>
        </div>
      )}

      {methodMsg && (
        <div className="p-3.5 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-[#1F4D3E] text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle size={16} weight="fill" />
          <span className="font-semibold">{methodMsg}</span>
        </div>
      )}

      {/* 1. Profile Form Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-5 shadow-xs">
        <div className="flex items-center space-x-4 pb-4 border-b border-[#E3DCC8]">
          <div className="w-12 h-12 rounded-full bg-[#1F4D3E] text-white flex items-center justify-center font-serif font-semibold text-lg">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-serif font-medium text-base text-[#1E241F]">{user.fullName}</h3>
            <p className="text-xs font-mono text-[#5B5C50]">
              Partner Code: <span className="text-[#1F4D3E] font-semibold">{user.referralCode}</span> • Rank: <span className="uppercase text-[#1E241F] font-semibold">{user.currentRankSlug}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#5B5C50] mb-1 font-medium">Full Legal Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C7D70]" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium">Email Address (Read-only)</label>
              <div className="relative">
                <EnvelopeSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C7D70]" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#F1ECDD] border border-[#E3DCC8] text-[#5B5C50] cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium">Referral Code (Immutable)</label>
              <input
                type="text"
                disabled
                value={user.referralCode}
                className="w-full px-3 py-2 rounded-lg bg-[#F1ECDD] border border-[#E3DCC8] text-[#1E241F] font-mono font-bold cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium">Mobile Phone (WhatsApp)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C7D70]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300 1234567"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium">City of Operations</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C7D70]" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lahore / Islamabad"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
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
      <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3DCC8]">
          <div>
            <div className="flex items-center space-x-2">
              <CreditCard size={18} className="text-[#1F4D3E]" />
              <h3 className="font-serif font-medium text-base text-[#1E241F]">
                Local Payout &amp; Bank Methods
              </h3>
            </div>
            <p className="text-xs text-[#5B5C50]">
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
          <div className="p-8 text-center rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2">
            <DeviceMobile size={28} className="text-[#7C7D70] mx-auto" />
            <h4 className="font-serif font-medium text-[#1E241F] text-sm">No Payout Methods Configured</h4>
            <p className="text-xs text-[#5B5C50] max-w-md mx-auto">
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
                    ? 'bg-[#FAF7EF] border-[#1F4D3E] ring-1 ring-[#1F4D3E]/20'
                    : 'bg-white border-[#E3DCC8] hover:border-[#D2C8AF]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-white border border-[#E3DCC8] shadow-2xs">
                      {getMethodIcon(m.methodType)}
                    </div>
                    <div>
                      <span className="font-serif font-semibold text-sm text-[#1E241F] block">
                        {m.bankName}
                      </span>
                      <span className="text-[10.5px] font-mono text-[#5B5C50] capitalize">
                        {m.methodType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {m.isDefault && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F1ECDD] text-[#1F4D3E] border border-[#E3DCC8]">
                      <Star size={11} weight="fill" /> Primary
                    </span>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-[#E3DCC8] space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-[#5B5C50]">
                    <span>Title:</span>
                    <span className="text-[#1E241F] font-medium">{m.accountTitle}</span>
                  </div>
                  <div className="flex justify-between text-[#5B5C50]">
                    <span>Account / No:</span>
                    <span className="text-[#1F4D3E] font-bold select-all">{m.accountNumber}</span>
                  </div>
                  {m.branchCity && (
                    <div className="flex justify-between text-[#5B5C50] text-[10px]">
                      <span>Branch / City:</span>
                      <span>{m.branchCity}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                  {!m.isDefault ? (
                    <button
                      onClick={() => handleSetDefaultMethod(m.id)}
                      className="text-[#1F4D3E] hover:underline cursor-pointer"
                    >
                      Set as Primary
                    </button>
                  ) : (
                    <span className="text-[10px] text-[#7C7D70]">Selected for payouts</span>
                  )}

                  <button
                    onClick={() => handleDeleteMethod(m.id)}
                    className="text-[#5B5C50] hover:text-rose-600 p-1 transition-colors cursor-pointer"
                    title="Remove method"
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
          <div className="rounded-2xl bg-white border border-[#E3DCC8] p-6 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
              <div>
                <h3 className="font-serif font-medium text-base text-[#1E241F]">
                  Add Payout Account
                </h3>
                <p className="text-[11px] font-mono text-[#5B5C50]">
                  Configure your local Pakistani receiving account
                </p>
              </div>
              <button
                onClick={() => setShowAddMethodModal(false)}
                className="p-1 rounded-lg text-[#5B5C50] hover:text-[#1E241F]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPaymentMethod} className="space-y-3.5">
              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">Payment Provider *</label>
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
                          ? 'bg-[#1F4D3E] text-white border-[#1F4D3E] font-medium'
                          : 'bg-[#FAF7EF] text-[#5B5C50] border-[#E3DCC8] hover:bg-[#F1ECDD]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">
                  Bank / Wallet Name *
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Meezan Bank / HBL / EasyPaisa"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>

              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">
                  Account Title (Full Name on Account) *
                </label>
                <input
                  type="text"
                  required
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  placeholder="e.g. Muhammad Anas"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>

              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">
                  Account Number / Mobile Number / IBAN *
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 03001234567 or PK36MEZN00..."
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">
                  Branch / City (Optional)
                </label>
                <input
                  type="text"
                  value={branchCity}
                  onChange={(e) => setBranchCity(e.target.value)}
                  placeholder="e.g. Main Boulevard Gulberg, Lahore"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#1F4D3E]"
                />
                <label htmlFor="defaultCheck" className="text-[#5B5C50] text-xs cursor-pointer">
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

    </div>
  );
};


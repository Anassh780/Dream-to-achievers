import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/services/storage';
import { User as UserType } from '@/types';
import { Button } from '@/components/ui/Button';
import { User, EnvelopeSimple, Phone, MapPin, Check } from '@phosphor-icons/react';

export const DashboardProfile: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="space-y-6 font-sans max-w-3xl">
      
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-[#E3DCC8]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
          <span>Account</span>
          <span>/</span>
          <span>Profile Settings</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1E241F] tracking-tight">
          Partner Identity &amp; Profile
        </h1>
        <p className="text-xs text-[#5B5C50]">
          Manage your partner profile details, contact information, and business location.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-[#1F4D3E] text-xs flex items-center space-x-2 animate-in fade-in">
          <Check size={16} weight="bold" />
          <span className="font-semibold">Profile details saved successfully.</span>
        </div>
      )}

      {/* Profile Form Card */}
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

    </div>
  );
};

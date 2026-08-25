import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/services/storage';
import { Button } from '@/components/ui/Button';
import { Check } from '@phosphor-icons/react';

export const DashboardProfile: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const users = storage.get<any[]>('USERS', []);
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx].fullName = fullName;
      users[idx].phone = phone;
      users[idx].city = city;
      storage.set('USERS', users);
      refreshUserData();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-2xl">
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
          <span>Account</span>
          <span>•</span>
          <span>Partner Information</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
          Profile Settings
        </h1>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#4ADE80] text-xs flex items-center space-x-2">
          <Check size={16} weight="bold" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Profile Form Card */}
      <div className="p-6 rounded-2xl bg-[#111A27] border border-white/[0.08] space-y-5">
        <div className="flex items-center space-x-4 pb-4 border-b border-white/[0.06]">
          <img
            src={
              user.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=1E293B&color=F8FAFC`
            }
            alt={user.fullName}
            className="w-12 h-12 rounded-full border border-white/10 object-cover"
          />
          <div>
            <h3 className="text-sm font-semibold text-white">{user.fullName}</h3>
            <p className="text-xs text-[#8996A8]">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded bg-white/5 text-[#CBD5E1] uppercase">
              {user.currentRankSlug} Tier
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#CBD5E1] mb-1 font-medium">Full Legal Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[#8996A8] mb-1 font-medium">Email Address (Read Only)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 rounded-lg bg-[#0A1019] border border-white/[0.04] text-[#8996A8] cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[#8996A8] mb-1 font-medium">Referral Code</label>
              <input
                type="text"
                disabled
                value={user.referralCode}
                className="w-full px-3 py-2 rounded-lg bg-[#0A1019] border border-white/[0.04] text-white font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[#CBD5E1] mb-1 font-medium">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="block text-[#CBD5E1] mb-1 font-medium">City / Location</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lahore"
                className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md">
              Save Profile Updates
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

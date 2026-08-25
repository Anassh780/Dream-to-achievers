import React, { useState } from 'react';
import { storage } from '@/services/storage';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/context/AuthContext';
import { User, RankSlug } from '@/types';
import { Button } from '@/components/ui/Button';
import { MagnifyingGlass, X } from '@phosphor-icons/react';

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin, refreshUserData } = useAuth();
  const [users, setUsers] = useState<User[]>(storage.get<User[]>('USERS', []));
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.referralCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleRankOverride = (newRank: RankSlug) => {
    if (!editingUser || !currentAdmin) return;

    const oldRank = editingUser.currentRankSlug;
    const updatedUsers = users.map((u) => (u.id === editingUser.id ? { ...u, currentRankSlug: newRank } : u));
    setUsers(updatedUsers);
    storage.set('USERS', updatedUsers);

    auditService.logAction({
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      action: 'OVERRIDE_USER_RANK',
      entityType: 'user',
      entityId: editingUser.id,
      details: `Changed rank for ${editingUser.fullName} from ${oldRank} to ${newRank}.`,
    });

    refreshUserData();
    setEditingUser(null);
  };

  const handleToggleActive = (userId: string) => {
    if (!currentAdmin) return;
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u));
    setUsers(updatedUsers);
    storage.set('USERS', updatedUsers);

    auditService.logAction({
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      action: target.isActive ? 'DEACTIVATE_USER' : 'ACTIVATE_USER',
      entityType: 'user',
      entityId: userId,
      details: `${target.isActive ? 'Deactivated' : 'Activated'} user account ${target.fullName} (${target.email}).`,
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
            <span>Admin</span>
            <span>•</span>
            <span>User Accounts</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
            Partner Directory
          </h1>
        </div>

        <div className="relative w-full sm:w-64 text-xs">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8996A8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, code..."
            className="w-full pl-8 pr-3 py-1.8 rounded-lg bg-[#111A27] border border-white/10 text-white placeholder:text-[#8996A8] focus:outline-none focus:border-[#3B82F6]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#111A27] overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/[0.06] text-[#8996A8] text-[11px]">
              <tr>
                <th className="p-3.5 font-medium">Partner Name</th>
                <th className="p-3.5 font-medium">Email</th>
                <th className="p-3.5 font-medium">Referral Code</th>
                <th className="p-3.5 font-medium text-center">Rank</th>
                <th className="p-3.5 font-medium text-center">Role</th>
                <th className="p-3.5 font-medium text-center">Status</th>
                <th className="p-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#CBD5E1]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02]">
                  <td className="p-3.5 font-medium text-white">{u.fullName}</td>
                  <td className="p-3.5 text-[#8996A8]">{u.email}</td>
                  <td className="p-3.5 font-mono text-white">{u.referralCode}</td>
                  <td className="p-3.5 text-center">
                    <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-white/5 text-[#CBD5E1]">
                      {u.currentRankSlug}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded ${
                        u.role === 'admin' ? 'bg-[#3B82F6]/10 text-[#60A5FA]' : 'bg-white/5 text-[#8996A8]'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded ${
                        u.isActive ? 'text-[#22C55E]' : 'text-rose-400'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="px-2.5 py-1 rounded bg-[#16202E] hover:bg-[#1C283A] text-white border border-white/10 text-[11px] cursor-pointer"
                    >
                      Override Rank
                    </button>
                    <button
                      onClick={() => handleToggleActive(u.id)}
                      className={`px-2 py-1 rounded text-[11px] border cursor-pointer ${
                        u.isActive
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20'
                          : 'bg-[#22C55E]/10 text-[#4ADE80] border border-[#22C55E]/20'
                      }`}
                    >
                      {u.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rank Override Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#111A27] border border-white/[0.12] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-semibold text-white">Override Rank: {editingUser.fullName}</h3>
              <button onClick={() => setEditingUser(null)} className="text-[#8996A8] hover:text-white">
                <X size={16} />
              </button>
            </div>
            <p className="text-[#8996A8]">Select new rank tier. Action will be recorded in audit log.</p>

            <div className="space-y-1.5 pt-1">
              {(['silver', 'platinum', 'gold', 'diamond'] as RankSlug[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRankOverride(r)}
                  className="w-full p-2 rounded-lg bg-[#0D141F] hover:bg-[#16202E] text-white font-medium capitalize border border-white/5 flex items-center justify-between cursor-pointer"
                >
                  <span>{r} Rank</span>
                  <span className="text-[#3B82F6]">Select →</span>
                </button>
              ))}
            </div>

            <Button variant="secondary" size="sm" onClick={() => setEditingUser(null)} className="w-full justify-center mt-2">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

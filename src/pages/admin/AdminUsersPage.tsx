import React, { useState } from 'react';
import { storage } from '@/services/storage';
import { User, RankSlug } from '@/types';
import { MagnifyingGlass, Users, X } from '@phosphor-icons/react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => storage.get<User[]>('USERS', []));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.referralCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRankOverride = (newRank: RankSlug) => {
    if (!selectedUser) return;
    const updated = users.map((u) => (u.id === selectedUser.id ? { ...u, currentRankSlug: newRank } : u));
    storage.set('USERS', updated);
    setUsers(updated);
    setSelectedUser(null);
  };

  const handleToggleStatus = (u: User) => {
    const updated = users.map((item) => (item.id === u.id ? { ...item, isActive: !item.isActive } : item));
    storage.set('USERS', updated);
    setUsers(updated);
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>Store Admin</span>
            <span>/</span>
            <span>User Accounts</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1E241F]">
            User Accounts &amp; Permissions
          </h1>
          <p className="text-xs text-[#5B5C50]">
            Manage registered members, view referral codes, adjust rank milestones, and control account permissions.
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs text-xs">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B5C50]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, code..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-[#E3DCC8] text-[#1E241F] placeholder:text-[#7C7D70] focus:outline-none focus:border-[#1F4D3E]"
          />
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Total Accounts</span>
          <span className="text-2xl font-bold font-mono text-[#1E241F]">{users.length}</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Active Partners</span>
          <span className="text-2xl font-bold font-mono text-[#1F4D3E]">
            {users.filter((u) => u.isActive !== false).length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Administrators</span>
          <span className="text-2xl font-bold font-mono text-[#B8862E]">
            {users.filter((u) => u.role === 'admin').length}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs">
        <div className="p-3.5 bg-[#F1ECDD] border-b border-[#E3DCC8] flex items-center justify-between font-mono">
          <span className="font-semibold text-[#1E241F]">Registered Distributors</span>
          <span className="text-[10px] text-[#5B5C50]">{filteredUsers.length} Partners</span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-[#5B5C50] space-y-2">
            <Users size={32} className="text-[#7C7D70] mx-auto" />
            <p className="font-serif font-medium text-base text-[#1E241F]">No partner accounts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="border-b border-[#E3DCC8] text-[#5B5C50] font-mono text-[10px] bg-[#FAF7EF]">
                <tr>
                  <th className="p-3.5 font-medium">Partner Profile</th>
                  <th className="p-3.5 font-medium">Referral Code</th>
                  <th className="p-3.5 font-medium">Current Level</th>
                  <th className="p-3.5 font-medium">Role</th>
                  <th className="p-3.5 font-medium text-center">Status</th>
                  <th className="p-3.5 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF7EF] transition-colors">
                    <td className="p-3.5">
                      <p className="font-serif font-semibold text-[#1E241F]">{u.fullName}</p>
                      <p className="text-[10px] font-mono text-[#7C7D70]">{u.email}</p>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-[#1F4D3E]">{u.referralCode}</td>
                    <td className="p-3.5 font-mono uppercase text-[#1E241F] font-semibold">{u.currentRankSlug}</td>
                    <td className="p-3.5 capitalize font-mono text-[#5B5C50]">{u.role}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block text-[10px] font-mono font-semibold capitalize px-2 py-0.5 rounded border ${
                          u.isActive
                            ? 'bg-[#F1ECDD] text-[#1F4D3E] border-[#E3DCC8]'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-2 py-1 rounded bg-[#FAF7EF] hover:bg-[#F1ECDD] text-[#1E241F] border border-[#E3DCC8] text-[11px] font-mono"
                        >
                          Change Level
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="px-2 py-1 rounded bg-[#FAF7EF] hover:bg-rose-50 text-[#5B5C50] hover:text-rose-700 border border-[#E3DCC8] text-[11px] font-mono"
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change Level Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-white border border-[#E3DCC8] shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3DCC8]">
              <h3 className="font-serif font-medium text-base text-[#1E241F]">
                Override Partner Level: {selectedUser.fullName}
              </h3>
              <button onClick={() => setSelectedUser(null)} className="text-[#5B5C50] hover:text-[#1E241F]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {(['unranked', 'silver', 'platinum', 'gold', 'diamond'] as RankSlug[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRankOverride(r)}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between font-mono uppercase ${
                    selectedUser.currentRankSlug === r
                      ? 'bg-[#1F4D3E] text-white border-[#1F4D3E] font-bold'
                      : 'bg-[#FAF7EF] text-[#1E241F] border-[#E3DCC8] hover:bg-[#F1ECDD]'
                  }`}
                >
                  <span>{r}</span>
                  {selectedUser.currentRankSlug === r && <span className="text-xs">Current</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { storage } from '@/services/storage';
import { authService } from '@/services/authService';
import { referralService } from '@/services/referralService';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/context/AuthContext';
import { User, RankSlug, ReferralRecord } from '@/types';
import { Button } from '@/components/ui/Button';
import { db, rtdb } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { ref, remove } from 'firebase/database';
import {
  MagnifyingGlass,
  Users,
  X,
  Trash,
  CheckCircle,
  ShieldCheck,
  TreeStructure,
  UserCircle,
  Crown,
  Check,
  Warning,
  Eye,
  ArrowClockwise,
} from '@phosphor-icons/react';

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>(() => storage.get<User[]>('USERS', []));
  const [referrals, setReferrals] = useState<ReferralRecord[]>(() => storage.get<ReferralRecord[]>('REFERRALS', []));
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Modals state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const refreshData = async () => {
    try {
      const allUsers = await authService.getAllUsers();
      setUsers(allUsers);
      setReferrals(storage.get<ReferralRecord[]>('REFERRALS', []));
    } catch {
      setUsers(storage.get<User[]>('USERS', []));
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const synced = await authService.getAllUsers();
      setUsers(synced);
      showToast(`Successfully synchronized ${synced.length} registered users from cloud database.`);
    } catch (e) {
      showToast('Could not reach cloud database. Showing local cached users.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // 1. Initial sync & Real-time Cloud Firestore/RTDB stream listener
    const unsubscribe = authService.subscribeToAllUsers((cloudUsers) => {
      setUsers(cloudUsers);
    });

    const handleStorage = () => refreshData();
    window.addEventListener('dta_storage_change', handleStorage);
    return () => {
      unsubscribe();
      window.removeEventListener('dta_storage_change', handleStorage);
    };
  }, []);

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
    showToast(`Updated ${selectedUser.fullName}'s rank to ${newRank.toUpperCase()}.`);
  };

  const handleToggleStatus = (u: User) => {
    const updated = users.map((item) => (item.id === u.id ? { ...item, isActive: !item.isActive } : item));
    storage.set('USERS', updated);
    setUsers(updated);
    showToast(`Account ${u.fullName} is now ${!u.isActive ? 'Active' : 'Suspended'}.`);
  };

  const handleDeleteUserConfirm = async () => {
    if (!deletingUser) return;

    if (deletingUser.id === currentAdmin?.id) {
      showToast('You cannot delete your own active administrator account.', 'error');
      setDeletingUser(null);
      return;
    }

    setIsDeleting(true);

    try {
      // 1. Remove from local storage USERS
      const updatedUsers = users.filter((u) => u.id !== deletingUser.id);
      storage.set('USERS', updatedUsers);
      setUsers(updatedUsers);

      // 2. Remove from Firestore if connected
      try {
        await deleteDoc(doc(db, 'users', deletingUser.id));
      } catch (err) {
        console.warn('Firestore user delete error:', err);
      }

      // 3. Remove from RTDB if connected
      try {
        await remove(ref(rtdb, `users/${deletingUser.id}`));
      } catch (err) {
        console.warn('RTDB user delete error:', err);
      }

      // 4. Record in audit log
      if (currentAdmin) {
        auditService.logAction({
          adminId: currentAdmin.id,
          adminEmail: currentAdmin.email,
          action: 'DELETE_USER',
          entityType: 'user',
          entityId: deletingUser.id,
          details: `Permanently deleted user account "${deletingUser.fullName}" (${deletingUser.email}, Code: ${deletingUser.referralCode})`,
        });
      }

      showToast(`User ${deletingUser.fullName} (${deletingUser.email}) permanently deleted.`);
    } catch (e: any) {
      showToast('Failed to delete user account.', 'error');
    } finally {
      setIsDeleting(false);
      setDeletingUser(null);
    }
  };

  const getUserReferralsList = (userId: string) => {
    return referralService.getUserReferrals(userId);
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>Store Admin</span>
            <span>/</span>
            <span>User Accounts &amp; Onboarding</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E241F]">
            User Accounts &amp; Partner Directory
          </h1>
          <p className="text-xs text-[#5B5C50]">
            All registered users across Cloud Firestore, Realtime DB, and local ledger are synchronized here live.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <Button
            onClick={handleManualSync}
            variant="outline"
            size="sm"
            className="text-xs font-medium shrink-0"
            isLoading={isSyncing}
            iconLeft={<ArrowClockwise size={14} className={isSyncing ? 'animate-spin' : ''} />}
            title="Fetch all registered users from Cloud Firestore & RTDB"
          >
            {isSyncing ? 'Syncing Cloud...' : 'Sync Cloud Database'}
          </Button>

          <div className="relative w-full sm:w-64 text-xs">
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
      </div>

      {toastMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 animate-in fade-in ${
            toastMsg.type === 'success'
              ? 'bg-[#F1ECDD] border-[#E3DCC8] text-[#1F4D3E]'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {toastMsg.type === 'success' ? <Check size={16} weight="bold" /> : <Warning size={16} weight="bold" />}
          <span className="font-semibold">{toastMsg.text}</span>
        </div>
      )}

      {/* User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Total Registered Accounts</span>
          <span className="text-2xl font-bold font-mono text-[#1E241F]">{users.length}</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Active Distributors</span>
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

      {/* Users Table */}
      <div className="rounded-xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs">
        <div className="p-3.5 bg-[#F1ECDD] border-b border-[#E3DCC8] flex items-center justify-between font-mono">
          <span className="font-semibold text-[#1E241F]">Registered Partner Directory</span>
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
                  <th className="p-3.5 font-medium text-center">Onboarded Referrals</th>
                  <th className="p-3.5 font-medium text-center">Role</th>
                  <th className="p-3.5 font-medium text-center">Status</th>
                  <th className="p-3.5 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                {filteredUsers.map((u) => {
                  const downline = getUserReferralsList(u.id);
                  const qualifyingCount = downline.filter((r) => r.isQualifying).length;

                  return (
                    <tr key={u.id} className="hover:bg-[#FAF7EF] transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#1F4D3E] text-white flex items-center justify-center font-serif font-bold text-xs shrink-0">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-serif font-semibold text-[#1E241F]">{u.fullName}</p>
                            <p className="text-[10px] font-mono text-[#7C7D70]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-[#1F4D3E]">{u.referralCode}</td>
                      <td className="p-3.5">
                        <span className="font-mono uppercase text-[10.5px] font-semibold text-[#1E241F] px-2 py-0.5 rounded bg-[#FAF7EF] border border-[#E3DCC8]">
                          {u.currentRankSlug}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setInspectingUser(u)}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7EF] hover:bg-[#F1ECDD] text-[#1E241F] border border-[#E3DCC8] font-mono text-[11px] transition-colors cursor-pointer"
                          title="Inspect Onboarded Teammates"
                        >
                          <TreeStructure size={13} className="text-[#1F4D3E]" />
                          <span className="font-bold">{downline.length}</span>
                          <span className="text-[10px] text-[#7C7D70]">({qualifyingCount} Active)</span>
                        </button>
                      </td>
                      <td className="p-3.5 text-center capitalize font-mono text-[#5B5C50]">
                        {u.role === 'admin' ? (
                          <span className="px-2 py-0.5 rounded bg-[#1F4D3E] text-white font-semibold text-[9.5px]">Admin</span>
                        ) : (
                          <span>Partner</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block text-[10px] font-mono font-semibold capitalize px-2 py-0.5 rounded border ${
                            u.isActive !== false
                              ? 'bg-[#F1ECDD] text-[#1F4D3E] border-[#E3DCC8]'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {u.isActive !== false ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="px-2 py-1 rounded bg-[#FAF7EF] hover:bg-[#F1ECDD] text-[#1E241F] border border-[#E3DCC8] text-[11px] font-mono"
                          >
                            Level
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className="px-2 py-1 rounded bg-[#FAF7EF] hover:bg-rose-50 text-[#5B5C50] hover:text-rose-700 border border-[#E3DCC8] text-[11px] font-mono"
                          >
                            {u.isActive !== false ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => setDeletingUser(u)}
                            disabled={u.id === currentAdmin?.id}
                            className={`p-1.5 rounded border text-[11px] transition-colors ${
                              u.id === currentAdmin?.id
                                ? 'opacity-30 cursor-not-allowed text-gray-400 border-gray-200'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 cursor-pointer'
                            }`}
                            title={u.id === currentAdmin?.id ? 'Cannot delete current logged in admin' : 'Permanently Delete User'}
                          >
                            <Trash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Onboarded Referrals Detail Inspection */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl p-6 rounded-2xl bg-white border border-[#E3DCC8] shadow-xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
              <div>
                <h3 className="font-serif font-medium text-base text-[#1E241F]">
                  Onboarded Referrals &amp; Downline
                </h3>
                <p className="text-[11px] font-mono text-[#5B5C50]">
                  Sponsor: <span className="font-bold text-[#1E241F]">{inspectingUser.fullName}</span> (Code: <span className="text-[#1F4D3E] font-bold">{inspectingUser.referralCode}</span>)
                </p>
              </div>
              <button onClick={() => setInspectingUser(null)} className="text-[#5B5C50] hover:text-[#1E241F]">
                <X size={18} />
              </button>
            </div>

            {/* Quick Teammate Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
              <div className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8]">
                <span className="text-[10px] text-[#5B5C50] block">Direct Onboarded</span>
                <span className="text-xl font-bold text-[#1E241F]">
                  {getUserReferralsList(inspectingUser.id).length} Members
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8]">
                <span className="text-[10px] text-[#5B5C50] block">Qualifying Active</span>
                <span className="text-xl font-bold text-[#1F4D3E]">
                  {getUserReferralsList(inspectingUser.id).filter((r) => r.isQualifying).length} Verified
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] col-span-2 sm:col-span-1">
                <span className="text-[10px] text-[#5B5C50] block">Sponsor Level</span>
                <span className="text-xl font-bold text-[#B8862E] uppercase">
                  {inspectingUser.currentRankSlug}
                </span>
              </div>
            </div>

            {/* Teammates List */}
            {getUserReferralsList(inspectingUser.id).length === 0 ? (
              <div className="p-8 text-center text-[#5B5C50] space-y-1 bg-[#FAF7EF] rounded-xl border border-[#E3DCC8]">
                <Users size={28} className="text-[#7C7D70] mx-auto" />
                <p className="font-serif font-medium text-[#1E241F]">No referred teammates onboarded yet.</p>
                <p className="text-[11px] text-[#7C7D70]">
                  When new members register with code {inspectingUser.referralCode}, they will appear here.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-[#E3DCC8] overflow-x-auto">
                <table className="w-full text-left font-sans">
                  <thead className="bg-[#FAF7EF] border-b border-[#E3DCC8] text-[#5B5C50] font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Teammate</th>
                      <th className="p-3">Rank Level</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                    {getUserReferralsList(inspectingUser.id).map((r) => (
                      <tr key={r.id} className="hover:bg-[#FAF7EF]">
                        <td className="p-3">
                          <p className="font-medium text-[#1E241F]">{r.referredUserName}</p>
                          <p className="text-[10px] font-mono text-[#7C7D70]">{r.referredUserEmail || 'No email'}</p>
                        </td>
                        <td className="p-3 font-mono uppercase text-[10px]">
                          {r.referredUserRank || 'unranked'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                              r.isQualifying
                                ? 'bg-[#F1ECDD] text-[#1F4D3E] border-[#E3DCC8]'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {r.isQualifying ? 'Qualifying Active' : 'Pending Activation'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-[10px] text-[#7C7D70]">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-[#E3DCC8]">
              <Button variant="outline" size="sm" onClick={() => setInspectingUser(null)}>
                Close Breakdown
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Delete User Confirmation */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-[#E3DCC8] shadow-xl space-y-4 text-xs">
            <div className="flex items-center space-x-3 text-rose-700 pb-3 border-b border-[#E3DCC8]">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash size={20} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#1E241F]">Permanently Delete User?</h3>
                <p className="text-[11px] text-[#5B5C50]">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5 text-xs text-[#1E241F]">
              <p className="font-medium">
                Are you sure you want to permanently delete partner:
              </p>
              <div className="font-mono text-[11px] space-y-0.5 pt-1">
                <p>• Name: <span className="font-bold">{deletingUser.fullName}</span></p>
                <p>• Email: <span className="font-bold">{deletingUser.email}</span></p>
                <p>• Referral Code: <span className="font-bold">{deletingUser.referralCode}</span></p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#E3DCC8]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingUser(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleDeleteUserConfirm}
                isLoading={isDeleting}
                className="bg-rose-700 hover:bg-rose-800 text-white border-transparent"
              >
                Delete Account Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Change Level Modal */}
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


/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Search, Plus, Mail, ShieldAlert, Users, Loader2, UserX, Trash2 } from 'lucide-react';
import { IUser } from '@/types/user.interface';
import UserDetailsModal from './UserDetailsModal';
import Swal from 'sweetalert2';

export default function AdminUserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteBox, setShowInviteBox] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  
  // 🎯 হুক থেকে deleteUser এবং ইরেজিং লোডিং স্টেট নেওয়া হয়েছে
  const { users, isLoading, inviteUser, isInviting, toggleUserStatus, isStatusToggling, deleteUser, isDeleting } = useAdminUsers(searchTerm);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    Swal.fire({
      title: 'Sending Invitation...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      await inviteUser(inviteEmail);
      Swal.fire({
        icon: 'success',
        title: 'Dispatched!',
        text: 'Invitation onboarding setup successful via Nodemailer.',
        timer: 3000,
        confirmButtonColor: '#4f46e5'
      });
      setInviteEmail('');
      setShowInviteBox(false);
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Failed!',
        text: err?.response?.data?.message || 'Failed to execute secure invite delivery.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleQuickStatusToggle = async (user: IUser) => {
    const userId = (user as any)._id;
    if (!userId) {
      toastMissingId();
      return;
    }

    const nextStatus = user.status === 'active' ? 'blocked' : 'active';
    const isBlocking = nextStatus === 'blocked';
    
    const result = await Swal.fire({
      title: isBlocking ? `Block ${user.name}?` : `Unblock ${user.name}?`,
      text: isBlocking 
        ? `All of their active hardware sessions will be wiped and they will be logged out instantly!`
        : `This will restore their portal access immediately.`,
      icon: isBlocking ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: isBlocking ? '#ef4444' : '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: isBlocking ? 'Yes, Block User!' : 'Yes, Unblock User!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: isBlocking ? 'Restricting access...' : 'Restoring access...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      try {
        await toggleUserStatus({ userId, status: nextStatus });
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: `User status successfully changed to: ${nextStatus.toUpperCase()}`,
          timer: 2500,
          confirmButtonColor: '#4f46e5'
        });
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Execution Failed',
          text: err?.response?.data?.message || 'Failed to execute status transition overlay.',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  // 🎯 নতুন: ইউজার সম্পূর্ণ ডিলিট করার হ্যান্ডলার ফাংশন
  const handleDeleteUser = async (user: IUser) => {
    const userId = (user as any)._id;
    if (!userId) {
      toastMissingId();
      return;
    }

    const result = await Swal.fire({
      title: `Delete ${user.name}?`,
      text: "🚨 WARNING: This action is permanent! All profile registries, database linkages, and logs associated with this user will be completely purged from the system.",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#dc2626', // ডিলিটের জন্য গাঢ় লাল রং
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete Permanently',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Purging node from database...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      try {
        await deleteUser(userId);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The user account has been permanently expunged.',
          timer: 2500,
          confirmButtonColor: '#4f46e5'
        });
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Purge Failed',
          text: err?.response?.data?.message || 'Failed to delete account from remote server.',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const toastMissingId = () => {
    Swal.fire({
      icon: 'warning',
      title: 'Error!',
      text: 'User ID missing from registry schema!',
      confirmButtonColor: '#ef4444'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-sm text-slate-800">
      
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="text-indigo-600" /> Sreyoshi User Access Board
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Filter accounts, tweak permissions, flag credentials, or send setup link tokens.</p>
        </div>
        <button 
          onClick={() => setShowInviteBox(!showInviteBox)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
        >
          <Plus size={16} /> Invite Account
        </button>
      </div>

      {/* ইনভাইট ফর্ম */}
      {showInviteBox && (
        <form onSubmit={handleInviteSubmit} className="p-4 bg-slate-900 text-white rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="email" 
              placeholder="Enter user email address..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-xs text-white focus:outline-none"
              required
            />
          </div>
          <button type="submit" disabled={isInviting} className="px-4 py-2 bg-indigo-600 font-bold rounded-lg hover:bg-indigo-500 text-xs disabled:opacity-50">
            Send Invite
          </button>
        </form>
      )}

      {/* সার্চ */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Filter by core parameters (name, phone, mail)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 shadow-sm font-medium"
        />
      </div>

      {/* টেবিল */}
      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-2 border border-dashed rounded-2xl bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="text-xs text-slate-400 font-semibold">Reading Node Cluster Matrices...</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Profile Reference</th>
                  <th className="p-4">Secure Contacts</th>
                  <th className="p-4">Permission Level</th>
                  <th className="p-4 text-right">Access Controls & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users && users.length > 0 ? (
                  users.map((user: IUser) => (
                    <tr key={user.phone} className={`hover:bg-slate-50/50 transition-colors ${user.status === 'blocked' ? 'bg-rose-50/40' : ''}`}>
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                          {user.profileImage ? (
                            <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-indigo-600 font-black text-sm uppercase">{user.name.slice(0, 2)}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900">{user.name}</p>
                            {user.status === 'blocked' && (
                              <span className="flex items-center gap-0.5 bg-rose-100 text-rose-700 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md">
                                <UserX size={10} /> Suspended
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user.phone}</p>
                        </div>
                      </td>

                      <td className="p-4 space-y-0.5">
                        <p className="text-slate-800 font-mono font-bold">{user.phone}</p>
                        <p className="text-xs text-slate-400">{user.email || 'No registry fallback'}</p>
                      </td>

                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                          {user.role}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        {/* ব্লক বাটন */}
                        <button
                          onClick={() => handleQuickStatusToggle(user)}
                          disabled={isStatusToggling || isDeleting}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            user.status === 'blocked'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {user.status === 'blocked' ? 'Unblock' : 'Block'}
                        </button>

                        {/* 🎯 নতুন: ডিলিট বাটন */}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={isStatusToggling || isDeleting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                        </button>

                        {/* ভিউ ডিটেইলস বাটন */}
                        <button 
                          onClick={() => setSelectedUser(user)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <ShieldAlert size={14} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-slate-400 italic">No access logs verified on data stream.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <UserDetailsModal 
        isOpen={!!selectedUser} 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
}
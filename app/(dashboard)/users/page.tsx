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
      confirmButtonColor: '#dc2626',
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
    <div className="p-2 md:p-6 space-y-5 md:space-y-6 text-xs md:text-sm text-slate-800 bg-[#FAFAFA] min-h-screen">
      
      {/* 🎯 ১. হেডার প্যানেল (মোবাইলে ফ্লুইড কলাম) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2 font-serif">
            <Users className="text-indigo-600 shrink-0" /> Sreyoshi User Access Board
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Filter accounts, tweak permissions, flag credentials, or send setup link tokens.</p>
        </div>
        <button 
          onClick={() => setShowInviteBox(!showInviteBox)}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm cursor-pointer uppercase tracking-wider text-xs"
        >
          <Plus size={16} /> Invite Account
        </button>
      </div>

      {/* ইনভাইট বক্স ফর্ম */}
      {showInviteBox && (
        <form onSubmit={handleInviteSubmit} className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center gap-3 animate-in slide-in-from-top-2">
          <div className="flex-1 relative w-full">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="email" 
              placeholder="Enter user email address..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none"
              required
            />
          </div>
          <button type="submit" disabled={isInviting} className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 font-bold rounded-lg hover:bg-indigo-500 text-xs disabled:opacity-50 cursor-pointer text-center">
            Send Invite
          </button>
        </form>
      )}

      {/* সার্চবার */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Filter by core parameters (name, phone, mail)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 shadow-xs bg-white font-medium"
        />
      </div>

      {/* ড্যাশবোর্ড কন্টেন্ট লোডিং এরিয়া */}
      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-2 border border-dashed rounded-2xl bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="text-xs text-slate-400 font-semibold">Reading Node Cluster Matrices...</span>
        </div>
      ) : (
        <>
          {/* 🎯 ২. মোবাইল মোড: প্রিমিয়াম কার্ড সিস্টেম (md স্ক্রিনের নিচে টেবিল হাইড থাকবে) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {users && users.length > 0 ? (
              users.map((user: IUser) => (
                <div 
                  key={user.phone} 
                  className={`p-4 rounded-2xl border bg-white shadow-2xs space-y-4 transition-all ${
                    user.status === 'blocked' ? 'border-red-200 bg-rose-50/20' : 'border-slate-100'
                  }`}
                >
                  {/* প্রোফাইল হেডার কার্ড */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-indigo-600 font-black text-sm uppercase">{user.name.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{user.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide shrink-0 ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                          {user.role}
                        </span>
                      </div>
                      
                      {user.status === 'blocked' && (
                        <span className="inline-flex items-center gap-0.5 text-rose-600 text-[10px] font-bold mt-0.5">
                          <UserX size={11} /> Account Suspended
                        </span>
                      )}
                    </div>
                  </div>

                  {/* কন্টাক্ট ডেটা ডিসপ্লে */}
                  <div className="bg-slate-50/70 border border-slate-100 p-3 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Secure Phone:</span>
                      <span className="font-bold font-mono text-slate-700">{user.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Registry Email:</span>
                      <span className="font-medium text-slate-600 truncate max-w-[180px]">{user.email || 'No registry fallback'}</span>
                    </div>
                  </div>

                  {/* মোবাইল অ্যাকশন কন্ট্রোল প্যানেল */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleQuickStatusToggle(user)}
                      disabled={isStatusToggling || isDeleting}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                        user.status === 'blocked'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}
                    >
                      {user.status === 'blocked' ? 'Unblock' : 'Block'}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(user)}
                      disabled={isStatusToggling || isDeleting}
                      className="px-3.5 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-2xs flex items-center justify-center cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>

                    <button 
                      onClick={() => setSelectedUser(user)}
                      disabled={isDeleting}
                      className="px-3.5 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
                      title="View Details"
                    >
                      <ShieldAlert size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-400 italic bg-white border rounded-2xl">No access logs verified on data stream.</div>
            )}
          </div>

          {/* 🎯 ৩. ডেস্কটপ মোড: ওল্ড স্ট্যান্ডার্ড টেবিল ভিউ (hidden md:block) */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
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
                          <button
                            onClick={() => handleQuickStatusToggle(user)}
                            disabled={isStatusToggling || isDeleting}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              user.status === 'blocked'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                            }`}
                          >
                            {user.status === 'blocked' ? 'Unblock' : 'Block'}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={isStatusToggling || isDeleting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>

                          <button 
                            onClick={() => setSelectedUser(user)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
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
        </>
      )}

      <UserDetailsModal 
        isOpen={!!selectedUser} 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
}
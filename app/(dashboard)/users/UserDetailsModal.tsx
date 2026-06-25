"use client";

import React, { useState } from 'react';
import { X, Shield, ShieldAlert, Monitor, Loader2 } from 'lucide-react';
import { IUser } from '@/types/user.interface';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import toast from 'react-hot-toast';


interface UserDetailsModalProps {
  isOpen: boolean;
  user: IUser | null;
  onClose: () => void;
}

export default function UserDetailsModal({ isOpen, user, onClose }: UserDetailsModalProps) {
  const { updateUserRole, isUpdatingRole } = useAdminUsers();
  const [currentRole, setCurrentRole] = useState<'user' | 'admin'>(user?.role || 'user');

  const userId = user ? ((user as any)._id || (user as any).id) : null;

  React.useEffect(() => {
    if (user) setCurrentRole(user.role);
  }, [user]);

  if (!isOpen || !user) return null;

  const handleRoleChange = async (newRole: 'user' | 'admin') => {
    if (!userId) return;
    try {
      setCurrentRole(newRole);
      await updateUserRole({ userId, role: newRole });
      toast.success(`User role successfully changed to ${newRole.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to modify role permissions.');
      setCurrentRole(user.role); // রিভার্ট ব্যাক টু ওল্ড রোল
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-sm">
        
        {/* হেডার */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-indigo-400" />
            <div>
              <h3 className="text-base font-bold">Sensitive Profile Configuration</h3>
              <p className="text-xs text-slate-400">Security Clearance Access Verified</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* বডি */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* রোল ও অথ সোর্স */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Manage Access Role</span>
              </div>
              <div className="mt-3 relative">
                {isUpdatingRole && <Loader2 size={16} className="absolute right-2 top-2 animate-spin text-indigo-600" />}
                <select
                  value={currentRole}
                  disabled={isUpdatingRole || user.status === 'blocked'}
                  onChange={(e) => handleRoleChange(e.target.value as 'user' | 'admin')}
                  className="w-full font-bold text-xs p-2.5 rounded-lg border bg-white focus:outline-none uppercase cursor-pointer"
                >
                  <option value="user">General User</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Authentication Source</span>
              <span className="text-slate-800 font-bold block mt-2">
                {user.isSocialLogin ? '🌐 OAuth (Google/Social)' : '🔑 Secure Password Hash'}
              </span>
            </div>
          </div>

          {/* প্রিফারেন্স এবং সেশন ট্র্যাকার প্যানেল */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b pb-2">
              <ShieldAlert size={16} className="text-indigo-600" /> System Notification Protocols
            </h4>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold text-slate-700">
              <div className="flex justify-between p-1.5 bg-slate-50/50 rounded">
                <span>Order Alerts:</span>
                <span className={user.preferences?.orderNotifications ? "text-emerald-600" : "text-rose-500"}>
                  {user.preferences?.orderNotifications ? "ENABLED" : "DISABLED"}
                </span>
              </div>
              <div className="flex justify-between p-1.5 bg-slate-50/50 rounded">
                <span>Promotional:</span>
                <span className={user.preferences?.promotionalAlerts ? "text-emerald-600" : "text-rose-500"}>
                  {user.preferences?.promotionalAlerts ? "ENABLED" : "DISABLED"}
                </span>
              </div>
              <div className="flex justify-between p-1.5 bg-slate-50/50 rounded">
                <span>SMS Triggers:</span>
                <span className={user.preferences?.smsAlerts ? "text-emerald-600" : "text-rose-500"}>
                  {user.preferences?.smsAlerts ? "ENABLED" : "DISABLED"}
                </span>
              </div>
              <div className="flex justify-between p-1.5 bg-slate-50/50 rounded">
                <span>Marketing Emails:</span>
                <span className={user.preferences?.marketingEmails ? "text-emerald-600" : "text-rose-500"}>
                  {user.preferences?.marketingEmails ? "ENABLED" : "DISABLED"}
                </span>
              </div>
            </div>
          </div>

          {/* একটিভ সেশন */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Monitor size={16} className="text-amber-500" /> Verified System Logins ({user.activeSessions?.length || 0})
            </h4>
            {user.activeSessions && user.activeSessions.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {user.activeSessions.map((session, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50/50 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{session.device}</p>
                      <p className="text-slate-400 text-[11px]">📍 {session.location}</p>
                    </div>
                    <span className="text-slate-400 font-mono">{new Date(session.lastActive).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-dashed text-center">No active connections found.</p>
            )}
          </div>
        </div>

        {/* ফুটার একশন জোন */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useAdminDelivery } from '@/hooks/useAdminDelivery';
import { Plus, Trash2, ToggleLeft, ToggleRight, Truck, Loader2 } from 'lucide-react';

export default function DeliveryManagement() {
  const [zoneName, setZoneName] = useState('');
  // 🎯 আপডেট: টাইপ থেকে specific-city বাদ দেওয়া হয়েছে
  const [zoneType, setZoneType] = useState<'inside' | 'outside'>('inside');
  const [charge, setCharge] = useState<number>(0);

  const { 
    zones,
    isLoadingZones, 
    createZone, 
    toggleZoneStatus, 
    deleteZone, 
    isMutating 
  } = useAdminDelivery();

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim() || charge < 0) return;

    Swal.fire({
      title: 'Saving Rule...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      // 🎯 আপডেট: পেলোড থেকে cities পুরোপুরি বাদ
      await createZone({
        zoneName: zoneName.trim(),
        zoneType,
        charge,
      });

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Delivery configuration added successfully!',
        timer: 2000,
        confirmButtonColor: '#4f46e5'
      });

      setZoneName('');
      setCharge(0);
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: err.response?.data?.message || 'Authorization rejected, unique rule violation or API error.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleZoneStatus(id, currentStatus);
      Swal.fire({ icon: 'success', title: 'Status updated', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Action failed', confirmButtonColor: '#ef4444' });
    }
  };

  const handleDeleteZone = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This logistics rule node configuration will be permanently purged!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Purge Rule!'
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Purging node...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
      try {
        await deleteZone(id);
        Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Rule wiped out.', timer: 2000 });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Purge requests rejected.', confirmButtonColor: '#ef4444' });
      }
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-800 text-sm">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Truck className="text-indigo-600 w-6 h-6" />
        <div>
          <h1 className="text-xl font-black text-slate-900">Dynamic Logistic Configuration</h1>
          <p className="text-xs text-slate-400">Define basic perimeter strategies, controlling pricing structures for Inside/Outside Dhaka vectors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ফর্ম */}
        <form onSubmit={handleCreateZone} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-4">
          <h2 className="font-bold text-base text-slate-900 border-b pb-2">Register Logistics Rule</h2>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Zone Reference Name</label>
            <input type="text" placeholder="e.g., Inside Dhaka" value={zoneName} onChange={e => setZoneName(e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Zone Strategy Type</label>
            <select value={zoneType} onChange={e => setZoneType(e.target.value as any)} className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none bg-white">
              <option value="inside">Inside Location</option>
              <option value="outside">Outside Location (Everywhere Else)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Delivery Fee (BDT)</label>
            <input type="number" value={charge === 0 ? "" : charge} onChange={e => setCharge(Number(e.target.value))} className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none" placeholder="e.g. 60" required min="0" />
          </div>

          <button type="submit" disabled={isMutating} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-indigo-700 transition-colors disabled:opacity-50">
            <Plus size={16} /> Save Configuration
          </button>
        </form>

        {/* টেবিল */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {isLoadingZones ? (
            <div className="p-20 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="text-xs text-slate-400 font-semibold">Loading Logistic Nodes...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Zone Cluster</th>
                    <th className="p-4">Strategy Vector</th>
                    <th className="p-4">Price Gate</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-xs">
                  {zones.length > 0 ? (
                    zones.map((zone: any) => (
                      <tr key={zone._id} className={`transition-colors hover:bg-slate-50/40 ${!zone.isActive ? 'bg-slate-50/80 opacity-60' : ''}`}>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{zone.zoneName}</p>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] uppercase font-mono px-2 py-0.5 font-bold rounded ${
                            zone.zoneType === 'inside' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {zone.zoneType === 'inside' ? 'Inside Hub' : 'Outside Hub'}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-900">{zone.charge} BDT</td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button onClick={() => handleToggleActive(zone._id, zone.isActive)} disabled={isMutating} className="inline-flex items-center align-middle focus:outline-none disabled:opacity-50">
                            {zone.isActive ? <ToggleRight size={26} className="text-emerald-500" /> : <ToggleLeft size={26} className="text-slate-400" />}
                          </button>
                          <button onClick={() => handleDeleteZone(zone._id)} disabled={isMutating} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors align-middle focus:outline-none disabled:opacity-50">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 italic">No delivery configurations found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
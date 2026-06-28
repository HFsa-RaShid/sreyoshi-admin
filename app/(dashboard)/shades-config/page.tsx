/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useShades } from '@/hooks/useShades';
import { useCategories } from '@/hooks/useCategories';
import { AddShadeModal } from './AddShadeModal';
import { EditShadeModal } from './EditShadeModal';
import { FiPlus, FiDownload, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

export const ShadeManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedShadeData, setSelectedShadeData] = useState<any>(null);

  // React Query Hooks
  const { shades, isLoading, addShade, updateShade, deleteShade } = useShades();
  const { categories } = useCategories(); 

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateShade({ id, data: { status: newStatus } });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this configuration?")) {
      try {
        await deleteShade(id);
      } catch (error) {
        console.error("Failed to delete shade:", error);
      }
    }
  };

  const handleAddSave = async (newData: any) => {
    try {
      await addShade(newData);
    } catch (error) {
      console.error("Failed to add shade:", error);
      throw error;
    }
  };

  const handleEditUpdate = async (id: string, updatedData: any) => {
    try {
      await updateShade({ id, data: updatedData });
    } catch (error) {
      console.error("Failed to update shade:", error);
      throw error;
    }
  };

  const openEditModal = (item: any) => {
    setSelectedShadeData(item);
    setIsEditModalOpen(true);
  };

  // --- Calculations ---
  const totalItems = shades.length;
  const activeItems = shades.filter(s => s.status === 'Active').length;
  const inactiveItems = shades.filter(s => s.status === 'Inactive').length;
  const totalShadesCount = shades.reduce((acc, curr) => acc + (curr.availableShades?.length || 0), 0);

  // Search Filtering
  const filteredShades = shades.filter(item => 
    item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-6 bg-[#FAFAFA] min-h-screen font-sans text-xs sm:text-sm">
      
      {/* ─── টপ হেডার ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Shade Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage shade details, colors, and item categories.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button className="flex-1 sm:flex-none justify-center flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2.5 bg-white font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
            <FiDownload /> Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-[#D96B27] text-white rounded-xl px-4 py-2.5 font-bold hover:bg-[#b8561e] transition-colors cursor-pointer"
          >
            <FiPlus /> Add Shade
          </button>
        </div>
      </div>

      {/* ─── ওভারভিউ কার্ড গ্রিড ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="text-gray-400 text-[11px] sm:text-xs font-bold uppercase tracking-wide mb-1">Total Configs</div>
          <div className="text-xl sm:text-3xl font-black text-gray-800">{totalItems}</div>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="text-green-500 text-[11px] sm:text-xs font-bold uppercase tracking-wide mb-1">Active Items</div>
          <div className="text-xl sm:text-3xl font-black text-gray-800">{activeItems}</div>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="text-red-400 text-[11px] sm:text-xs font-bold uppercase tracking-wide mb-1">Inactive Items</div>
          <div className="text-xl sm:text-3xl font-black text-gray-800">{inactiveItems}</div>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="text-orange-400 text-[11px] sm:text-xs font-bold uppercase tracking-wide mb-1">Unique Shades</div>
          <div className="text-xl sm:text-3xl font-black text-gray-800">{totalShadesCount}</div>
        </div>
      </div>

      {/* ─── টেবিল সেকশন কন্টেইনার ─── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        
        {/* টেবিল সার্চ হেডার */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white">
          <h3 className="font-bold text-gray-700 text-sm sm:text-base">Item Shades List</h3>
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search items or sub-categories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-400 bg-white"
            />
          </div>
        </div>

        {/* লোডিং ও এম্পটি স্টেট */}
        {isLoading ? (
          <div className="text-center p-12 text-gray-400 font-medium animate-pulse">Loading shades configuration...</div>
        ) : filteredShades.length === 0 ? (
          <div className="text-center p-12 text-gray-400 font-medium">No shades configuration found.</div>
        ) : (
          <>
            {/* 📱 ক. মোবাইল রেসপন্সিভ কার্ড ভিউ */}
            <div className="block md:hidden divide-y divide-gray-100">
              {filteredShades.map((item, index) => (
                <div key={item._id} className="p-4 space-y-3 bg-white hover:bg-slate-50/40 transition">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 bg-slate-100 px-1.5 py-0.5 rounded mr-1.5">#{index + 1}</span>
                      <span className="font-bold text-slate-900 text-sm">{item.itemName}</span>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-0.5">{item.subCategory}</div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input 
                        type="checkbox" 
                        checked={item.status === 'Active'} 
                        onChange={() => handleStatusToggle(item._id, item.status)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D96B27]"></div>
                      <span className="ml-1.5 text-[10px] font-bold text-gray-500 w-10">
                        {item.status}
                      </span>
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.availableShades?.map((shade: any, idx: number) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 border border-slate-200 text-slate-700 shadow-3xs"
                      >
                        <span 
                          className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shrink-0" 
                          style={{ backgroundColor: shade.shadeColorCode }}
                        />
                        {shade.shadeName}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-end gap-4 pt-2 border-t border-dashed border-gray-100 text-gray-400">
                    <button 
                      onClick={() => openEditModal(item)}
                      className="p-1 flex items-center gap-1 text-xs font-medium hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <FiEdit2 size={13} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item._id)} 
                      className="p-1 flex items-center gap-1 text-xs font-medium hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <FiTrash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 💻 খ. স্ট্যান্ডার্ড ডেস্কটপ ভিউ টেবিল */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-gray-200 text-xs font-semibold uppercase text-gray-500 tracking-wider">
                    <th className="p-4 w-16">Serial</th>
                    <th className="p-4">Item Details</th>
                    <th className="p-4">Available Shades (Colors)</th>
                    <th className="p-4 w-28">Status</th>
                    <th className="p-4 w-28 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {filteredShades.map((item, index) => (
                    <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-medium text-gray-400">{index + 1}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{item.itemName}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">{item.subCategory}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {item.availableShades?.map((shade: any, idx: number) => (
                            <span 
                              key={idx} 
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 border border-gray-200 text-gray-800 shadow-sm"
                            >
                              <span 
                                className="w-3 h-3 rounded-full border border-black/10 inline-block" 
                                style={{ backgroundColor: shade.shadeColorCode }}
                              />
                              {shade.shadeName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={item.status === 'Active'} 
                            onChange={() => handleStatusToggle(item._id, item.status)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D96B27]"></div>
                          <span className="ml-2 text-xs font-medium text-gray-600 w-12">
                            {item.status}
                          </span>
                        </label>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-4 text-gray-400">
                          <button 
                            onClick={() => openEditModal(item)}
                            className="hover:text-blue-600 transition-colors cursor-pointer" 
                            title="Edit text/shades"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item._id)} 
                            className="hover:text-red-600 transition-colors cursor-pointer" 
                            title="Delete Configuration"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ─── মোডাল ইন্টিগ্রেশন ─── */}
      <AddShadeModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddSave}
        categories={categories}
      />

      <EditShadeModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedShadeData(null);
        }}
        onUpdate={handleEditUpdate}
        shadeData={selectedShadeData}
        categories={categories}
      />

    </div>
  );
};

export default ShadeManagementPage;
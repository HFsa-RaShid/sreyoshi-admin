/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useShades } from '@/hooks/useShades';
import { useCategories } from '@/hooks/useCategories'; // ক্যাটাগরি ডেটার জন্য আপনার কাস্টম হুক
import { AddShadeModal } from './AddShadeModal'; // সঠিক পাথ অনুযায়ী অ্যাড মোডাল ইমপোর্ট করুন
import { EditShadeModal } from './EditShadeModal'; // সঠিক পাথ অনুযায়ী এডিট মোডাল ইমপোর্ট করুন
import { FiPlus, FiDownload, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

export const ShadeManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedShadeData, setSelectedShadeData] = useState<any>(null);

  // React Query Hooks (Shades and Categories)
  const { shades, isLoading, addShade, updateShade, deleteShade } = useShades();
  const { categories } = useCategories(); 

  // স্ট্যাটাস একটিভ/ইনএকটিভ টগল করার ফাংশন
  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateShade({ id, data: { status: newStatus } });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // ডিলিট হ্যান্ডলার
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this configuration?")) {
      try {
        await deleteShade(id);
      } catch (error) {
        console.error("Failed to delete shade:", error);
      }
    }
  };

  // নতুন শেড কনফিগুরেশন সেভ হ্যান্ডলার
  const handleAddSave = async (newData: any) => {
    try {
      await addShade(newData);
    } catch (error) {
      console.error("Failed to add shade:", error);
      throw error;
    }
  };

  // শেড কনফিগুরেশন আপডেট হ্যান্ডলার
  const handleEditUpdate = async (id: string, updatedData: any) => {
    try {
      await updateShade({ id, data: updatedData });
    } catch (error) {
      console.error("Failed to update shade:", error);
      throw error;
    }
  };

  // এডিট বাটন ক্লিক অ্যাকশন
  const openEditModal = (item: any) => {
    setSelectedShadeData(item);
    setIsEditModalOpen(true);
  };

  // --- ওভারভিউ কার্ডের জন্য ক্যালকুলেশনস ---
  const totalItems = shades.length;
  const activeItems = shades.filter(s => s.status === 'Active').length;
  const inactiveItems = shades.filter(s => s.status === 'Inactive').length;
  const totalShadesCount = shades.reduce((acc, curr) => acc + (curr.availableShades?.length || 0), 0);

  // সার্চ ফিল্টারিং
  const filteredShades = shades.filter(item => 
    item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#FAFAFA] min-h-screen font-sans">
      
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shade Management</h1>
          <p className="text-sm text-gray-500">Manage shade details, colors, and item categories.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <FiDownload /> Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#D96B27] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#b8561e] transition-colors"
          >
            <FiPlus /> Add Shade
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-sm font-medium mb-2">Total Configurations</div>
          <div className="text-3xl font-bold text-gray-800">{totalItems}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-green-500 text-sm font-medium mb-2">Active Items</div>
          <div className="text-3xl font-bold text-gray-800">{activeItems}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-red-400 text-sm font-medium mb-2">Inactive Items</div>
          <div className="text-3xl font-bold text-gray-800">{inactiveItems}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-orange-400 text-sm font-medium mb-2">Total Unique Shades</div>
          <div className="text-3xl font-bold text-gray-800">{totalShadesCount}</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Table Search Header */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
          <h3 className="font-semibold text-gray-700 text-lg">Item Shades List</h3>
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search items or sub-categories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="overflow-x-auto">
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-400 animate-pulse">
                    Loading shades configuration...
                  </td>
                </tr>
              ) : filteredShades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-400">
                    No shades found.
                  </td>
                </tr>
              ) : (
                filteredShades.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-medium text-gray-400">{index + 1}</td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{item.itemName}</div>
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
                      {/* Toggle Switch */}
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
                    <td className="p-4">
                      <div className="flex justify-center gap-4 text-gray-400">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="hover:text-blue-600 transition-colors" 
                          title="Edit text/shades"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item._id)} 
                          className="hover:text-red-600 transition-colors" 
                          title="Delete Configuration"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODALS CODES INTEGRATION ================= */}
      
      {/* 1. Add Shade Modal */}
      <AddShadeModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddSave}
        categories={categories}
      />

      {/* 2. Edit Shade Modal */}
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
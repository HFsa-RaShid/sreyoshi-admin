/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

interface EditShadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  shadeData: any; // যে রোর ডাটা এডিট হবে তা পাস হবে এখানে
  categories: any[];
}

export const EditShadeModal: React.FC<EditShadeModalProps> = ({ isOpen, onClose, onUpdate, shadeData, categories }) => {
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [availableShades, setAvailableShades] = useState<{ shadeName: string; shadeColorCode: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // মোডাল ওপেন হলে কারেন্ট ডাটা পপুলেট হবে
  useEffect(() => {
    if (shadeData) {
      setCategory(shadeData.category?._id || shadeData.category || '');
      setSubCategory(shadeData.subCategory || '');
      setItemName(shadeData.itemName || '');
      setStatus(shadeData.status || 'Active');
      setAvailableShades(shadeData.availableShades ? [...shadeData.availableShades] : []);
    }
  }, [shadeData, isOpen]);

  if (!isOpen) return null;

  const handleAddShadeRow = () => {
    setAvailableShades([...availableShades, { shadeName: '', shadeColorCode: '#000000' }]);
  };

  const handleRemoveShadeRow = (index: number) => {
    setAvailableShades(availableShades.filter((_, i) => i !== index));
  };

  const handleShadeChange = (index: number, field: 'shadeName' | 'shadeColorCode', value: string) => {
    const updated = [...availableShades];
    updated[index][field] = value;
    setAvailableShades(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // 💡 শুধুমাত্র status এবং availableShades ব্যাকএন্ডে পাঠানো হচ্ছে
      await onUpdate(shadeData._id, {
        status,
        availableShades: availableShades.filter(s => s.shadeName.trim() !== '')
      });
      
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">Update Shades & Status</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* রিড-অনলি সেকশন (Category & Sub Category) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-60">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Category (Disabled)</label>
              <select
                value={category}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed focus:outline-none"
                disabled
              >
                <option value="">Select Category</option>
                {categories.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>{cat.name || cat.categoryName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Sub Category (Disabled)</label>
              <input
                type="text"
                value={subCategory}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed focus:outline-none"
                disabled
              />
            </div>
          </div>

          {/* রিড-অনলি সেকশন (Item Name) এবং এডিটেবল সেকশন (Status) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="opacity-60">
              <label className="block text-sm font-medium text-gray-500 mb-1">Item Name (Disabled)</label>
              <input
                type="text"
                value={itemName}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed focus:outline-none"
                disabled
              />
            </div>

            {/* 🔓 এটি এডিট করা যাবে */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1-orange-500">Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* 🔓 এডিটেবল সেকশন: Dynamic Shade List */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-800">Available Shades & Colors *</label>
              <button
                type="button"
                onClick={handleAddShadeRow}
                className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                <FiPlus /> Add Shade Row
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {availableShades.map((shade, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Shade Name"
                    value={shade.shadeName}
                    onChange={(e) => handleShadeChange(idx, 'shadeName', e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500"
                    required
                  />
                  <div className="flex items-center gap-2 border rounded-lg px-2 py-1 bg-gray-50">
                    <input
                      type="color"
                      value={shade.shadeColorCode}
                      onChange={(e) => handleShadeChange(idx, 'shadeColorCode', e.target.value)}
                      className="w-6 h-6 cursor-pointer border-none bg-transparent"
                    />
                    <span className="text-xs text-gray-500 uppercase">{shade.shadeColorCode}</span>
                  </div>
                  {availableShades.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveShadeRow(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 border-t pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-[#D96B27] text-white rounded-lg hover:bg-[#b8561e] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
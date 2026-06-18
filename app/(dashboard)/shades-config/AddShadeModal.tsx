/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

interface AddShadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  categories: any[];
}

export const AddShadeModal: React.FC<AddShadeModalProps> = ({ isOpen, onClose, onSave, categories }) => {
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [availableShades, setAvailableShades] = useState<{ shadeName: string; shadeColorCode: string }[]>([
    { shadeName: '', shadeColorCode: '#000000' }
  ]);
  const [loading, setLoading] = useState(false);
  
  // ডাইনামিক অপশন স্টেটস
  const [subCategoryOptions, setSubCategoryOptions] = useState<any[]>([]);
  const [itemOptions, setItemOptions] = useState<any[]>([]);

  // ১. ক্যাটাগরি চেঞ্জ হলে সাব-ক্যাটাগরি ফিল্টার করা (sub.title অনুযায়ী)
  useEffect(() => {
    if (category) {
      const selectedCat = categories.find((cat: any) => cat._id === category);
      setSubCategoryOptions(selectedCat?.subCategories || []);
    } else {
      setSubCategoryOptions([]);
    }
    setSubCategory(''); 
    setItemOptions([]);
    setItemName('');
  }, [category, categories]);

  // ২. সাব-ক্যাটাগরি চেঞ্জ হলে আইটেম লিস্ট ফিল্টার করা (sub.title ম্যাচ করে)
  useEffect(() => {
    if (subCategory) {
      const selectedSub = subCategoryOptions.find((sub: any) => sub.title === subCategory);
      setItemOptions(selectedSub?.items || []);
    } else {
      setItemOptions([]);
    }
    setItemName('');
  }, [subCategory, subCategoryOptions]);

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
    if (!category || !subCategory || !itemName) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await onSave({
        category,
        subCategory, // ব্যাকএন্ডে "FACE" বা "EYES" স্ট্রিং আকারে যাবে
        itemName,    // ব্যাকএন্ডে "Foundation" বা "Concealer" স্ট্রিং আকারে যাবে
        status,
        availableShades: availableShades.filter(s => s.shadeName.trim() !== '')
      });
      
      // Reset Form
      setCategory('');
      setSubCategory('');
      setItemName('');
      setAvailableShades([{ shadeName: '', shadeColorCode: '#000000' }]);
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
          <h2 className="text-xl font-bold text-gray-900">Add New Shade Config</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>{cat.name || cat.categoryName}</option>
                ))}
              </select>
            </div>

            {/* Sub Category Select (FIXED: Использует sub.title) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category *</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 ${!category ? 'bg-gray-50 cursor-not-allowed text-gray-400' : 'bg-white'}`}
                required
                disabled={!category}
              >
                <option value="">{category ? 'Select Sub Category' : 'First select a category'}</option>
                {subCategoryOptions.map((sub: any) => (
                  <option key={sub.id || sub._id} value={sub.title}>
                    {sub.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Item Name Select (টেক্সট ইনপুট থেকে ড্রপডাউনে রূপান্তর) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <select
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 ${!subCategory ? 'bg-gray-50 cursor-not-allowed text-gray-400' : 'bg-white'}`}
                required
                disabled={!subCategory}
              >
                <option value="">{subCategory ? 'Select Item' : 'Select sub-category first'}</option>
                {itemOptions.map((item: any, idx: number) => (
                  <option key={idx} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Dynamic Shade List */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-800">Available Shades & Colors</label>
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
                    placeholder="Shade Name (e.g. NC15)"
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
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
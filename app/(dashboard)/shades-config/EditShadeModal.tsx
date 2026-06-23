/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { ICategory, IShadeItem } from '../../../types/shade.interface'; 

interface EditShadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, payload: any) => Promise<void>; 
  shadeData: any; 
  categories: ICategory[]; 
}

export const EditShadeModal: React.FC<EditShadeModalProps> = ({ isOpen, onClose, onUpdate, shadeData, categories }) => {
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  
  const [availableShades, setAvailableShades] = useState<IShadeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (shadeData && isOpen) {
      const catId = shadeData.category?.$oid || shadeData.category?._id || shadeData.category || '';
      setCategory(catId);
      setSubCategory(shadeData.subCategory || '');
      setItemName(shadeData.itemName || '');
      setStatus(shadeData.status || 'Active');
      
      const shadesList = shadeData.availableShades || shadeData.shadeDetails || [];
      
      const mappedShades = shadesList.map((sh: any) => ({
        shadeName: sh.shadeName || '',
        shadeColorCode: sh.shadeColorCode || '#000000',
        status: sh.status || 'Active'
      }));
      
      setAvailableShades(mappedShades);
    }
  }, [shadeData, isOpen]);

  if (!isOpen) return null;

  const handleAddShadeRow = () => {
    setAvailableShades([
      ...availableShades, 
      { shadeName: '', shadeColorCode: '#000000', status: 'Active' }
    ]);
  };

  const handleRemoveShadeRow = (index: number) => {
    setAvailableShades(availableShades.filter((_, i) => i !== index));
  };

  const handleShadeChange = <K extends keyof IShadeItem>(index: number, field: K, value: IShadeItem[K]) => {
    const updated = [...availableShades];
    updated[index][field] = value;
    setAvailableShades(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const documentId = shadeData._id?.$oid || shadeData._id;

    try {
      setLoading(true);

      const validShades = availableShades.filter(s => s.shadeName.trim() !== '');
      
      const payload = {
        status,
        availableShades: validShades.map((sh) => ({
          shadeName: sh.shadeName,
          shadeColorCode: sh.shadeColorCode,
          status: sh.status
        }))
      };

      await onUpdate(documentId, payload);
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update shade data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">Update Shades Config</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><FiX size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Read only info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-60">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
              <select value={category} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed" disabled>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Sub Category</label>
              <input type="text" value={subCategory} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed" disabled />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="opacity-60">
              <label className="block text-sm font-medium text-gray-500 mb-1">Item Name</label>
              <input type="text" value={itemName} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Global Config Status *</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#D96B27]">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-800">Available Shades Configuration *</label>
              <button type="button" onClick={handleAddShadeRow} className="flex items-center gap-1 text-xs text-orange-600 font-medium hover:underline"><FiPlus /> Add Shade Row</button>
            </div>

  
            <div className="hidden md:grid grid-cols-12 gap-4 px-3 mb-1 text-xs font-semibold text-gray-600">
              <div className="col-span-5">Shade Name *</div>
              <div className="col-span-3">Color Picker</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
              {availableShades.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                  No shades available. Click &quot;Add Shade Row&quot; to add one.
                </div>
              ) : (
                availableShades.map((shade, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                    
                    {/* শেড নেম */}
                    <div className="md:col-span-5">
                      <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Shade Name</label>
                      <input
                        type="text"
                        placeholder="Shade Name"
                        value={shade.shadeName}
                        onChange={(e) => handleShadeChange(idx, 'shadeName', e.target.value)}
                        className="w-full border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-[#D96B27]"
                        required
                      />
                    </div>

                    {/* কালার পিকার */}
                    <div className="md:col-span-3">
                      <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Color Code</label>
                      <div className="flex items-center gap-2 bg-white border rounded-lg px-2 py-1">
                        <input 
                          type="color" 
                          value={shade.shadeColorCode} 
                          onChange={(e) => handleShadeChange(idx, 'shadeColorCode', e.target.value)} 
                          className="w-8 h-8 cursor-pointer border-none bg-transparent flex-shrink-0" 
                        />
                        <span className="text-xs font-mono font-medium uppercase text-gray-600">{shade.shadeColorCode}</span>
                      </div>
                    </div>

                    {/* স্ট্যাটাস */}
                    <div className="md:col-span-3">
                      <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Status</label>
                      <select
                        value={shade.status}
                        onChange={(e) => handleShadeChange(idx, 'status', e.target.value as 'Active' | 'Inactive')}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#D96B27]"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    {/* ডিলিট বাটন */}
                    <div className="md:col-span-1 flex justify-end">
                      {availableShades.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveShadeRow(idx)} 
                          className="text-red-500 hover:text-red-700 p-1 mt-2 md:mt-0 transition-colors"
                          title="Delete Shade"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* অ্যাকশন বাটন সেকশন */}
          <div className="flex justify-end gap-3 border-t pt-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg text-gray-700" disabled={loading}>Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-[#D96B27] text-white rounded-lg active:scale-95 disabled:bg-gray-400" disabled={loading}>
              {loading ? 'Updating...' : 'Update Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
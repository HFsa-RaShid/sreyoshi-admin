/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';

// ১. প্রপার ইন্টারফেস এবং টাইপ ডেফিনিশনস
export interface IEditShadeRowInput {
  shadeName: string;
  shadeColorCode: string;
  shadeImageFile: File | null; // 💡 নতুন সিলেক্ট করা ফাইলের জন্য
  shadeImagePreview: string;   // 💡 লাইভ প্রিভিউ (পুরাতন ইউআরএল বা নতুন ব্লব ইউআরএল)
  stock: number;
  status: 'Active' | 'Inactive';
}

interface ICategoryConfig {
  _id: string;
  name?: string;
  categoryName?: string;
}

interface EditShadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, formData: FormData) => Promise<void>; // 💡 FormData এক্সেপ্ট করবে
  shadeData: any; // ডাটাবেজ থেকে আসা র-ডাটা (যেহেতু মঙ্গুস স্ট্রাকচার ডাইনামিক)
  categories: ICategoryConfig[];
}

export const EditShadeModal: React.FC<EditShadeModalProps> = ({ isOpen, onClose, onUpdate, shadeData, categories }) => {
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  
  // ডাইনামিক এডিট রো-এর স্টেট টাইপ ফিক্সড
  const [availableShades, setAvailableShades] = useState<IEditShadeRowInput[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (shadeData && isOpen) {
      const catId = shadeData.category?.$oid || shadeData.category?._id || shadeData.category || '';
      setCategory(catId);
      setSubCategory(shadeData.subCategory || '');
      setItemName(shadeData.itemName || '');
      setStatus(shadeData.status || 'Active');
      
      const shadesList = shadeData.availableShades || shadeData.shadeDetails || [];
      
      // 💡 ডাটাবেজ থেকে আসা ডাটাকে আমাদের ইনপুট স্ট্রাকচারে ম্যাপ করা
      const mappedShades = shadesList.map((sh: any) => ({
        shadeName: sh.shadeName || '',
        shadeColorCode: sh.shadeColorCode || '#000000',
        shadeImageFile: null, // শুরুতে কোনো নতুন ফাইল থাকবে না
        shadeImagePreview: sh.shadeImage || '', // পুরাতন ক্লাউডিনারি লিংক প্রিভিউতে বসবে
        stock: sh.stock || 0,
        status: sh.status || 'Active'
      }));
      
      setAvailableShades(mappedShades);
    }
  }, [shadeData, isOpen]);

  if (!isOpen) return null;

  const handleAddShadeRow = () => {
    setAvailableShades([
      ...availableShades, 
      { shadeName: '', shadeColorCode: '#000000', shadeImageFile: null, shadeImagePreview: '', stock: 0, status: 'Active' }
    ]);
  };

  const handleRemoveShadeRow = (index: number) => {
    setAvailableShades(availableShades.filter((_, i) => i !== index));
  };

  const handleShadeChange = <K extends keyof IEditShadeRowInput>(index: number, field: K, value: IEditShadeRowInput[K]) => {
    const updated = [...availableShades];
    updated[index][field] = value;
    setAvailableShades(updated);
  };

  // 💡 FileReader বাদ দিয়ে ব্রাউজার মেমোরি প্রিভিউ (URL.createObjectURL)
  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleShadeChange(index, 'shadeImageFile', file);
    handleShadeChange(index, 'shadeImagePreview', URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const documentId = shadeData._id?.$oid || shadeData._id;

    try {
      setLoading(true);

      // 💡 ১. ফাইল ও টেক্সট একসাথে পাঠানোর জন্য FormData তৈরি
      const formData = new FormData();

      const payload = {
        status,
        availableShades: availableShades.map((sh) => ({
          shadeName: sh.shadeName,
          shadeColorCode: sh.shadeColorCode,
          // যদি নতুন ফাইল না থাকে, তবে পুরাতন ইউআরএল-টিই বসে যাবে
          shadeImage: sh.shadeImageFile ? "" : sh.shadeImagePreview, 
          stock: sh.stock,
          status: sh.status
        }))
      };

      // 💡 ২. ডাটা অবজেক্টকে JSON স্ট্রিং বানিয়ে 'data' কি-তে অ্যাপেন্ড করা
      formData.append("data", JSON.stringify(payload));

      // 💡 ৩. রিয়াল ফাইল অবজেক্টগুলোকে সিরিয়ালি 'shadeImages' কি-তে অ্যাপেন্ড করা
      availableShades.forEach((sh) => {
        if (sh.shadeImageFile) {
          formData.append("shadeImages", sh.shadeImageFile);
        }
      });

      // parent অনআপডেট ফাংশনে formData পাস করা হলো
      await onUpdate(documentId, formData);
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
      <div className="w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">Update Shades & Live Stock Status</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><FiX size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Read only info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-60">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
              <select value={category} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" disabled>
                <option value={category}>Selected Category</option>
                {categories.map((cat) => {
                  const cId = cat._id;
                  return <option key={cId} value={cId}>{cat.name || cat.categoryName}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Sub Category</label>
              <input type="text" value={subCategory} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" disabled />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="opacity-60">
              <label className="block text-sm font-medium text-gray-500 mb-1">Item Name</label>
              <input type="text" value={itemName} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Global Config Status *</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Dynamic Shade List */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-800">Available Shades Configuration *</label>
              <button type="button" onClick={handleAddShadeRow} className="flex items-center gap-1 text-xs text-orange-600 font-medium hover:underline"><FiPlus /> Add Shade Row</button>
            </div>

            <div className="hidden md:grid grid-cols-12 gap-3 px-3 mb-1 text-xs font-semibold text-gray-600">
              <div className="col-span-3">Shade Name *</div>
              <div className="col-span-2">Live Stock *</div>
              <div className="col-span-2">Shade Status</div>
              <div className="col-span-2">Upload Image</div>
              <div className="col-span-2">Color Picker</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
              {availableShades.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                  No shades available. Click &quot;Add Shade Row&quot; to add one.
                </div>
              ) : (
                availableShades.map((shade, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="md:col-span-3">
                      <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Shade Name</label>
                      <input
                        type="text"
                        placeholder="Shade Name"
                        value={shade.shadeName}
                        onChange={(e) => handleShadeChange(idx, 'shadeName', e.target.value)}
                        className="w-full border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Stock</label>
                      <input
                        type="number"
                        placeholder="Stock"
                        min="0"
                        value={shade.stock}
                        onChange={(e) => handleShadeChange(idx, 'stock', parseInt(e.target.value) || 0)}
                        className="w-full border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Status</label>
                      <select
                        value={shade.status}
                        onChange={(e) => handleShadeChange(idx, 'status', e.target.value as 'Active' | 'Inactive')}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 flex items-center gap-2">
                      <div>
                        <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Upload Image</label>
                        <label className="flex items-center gap-1 border border-dashed border-gray-300 bg-white rounded-lg px-2 py-1.5 text-xs text-gray-600 cursor-pointer hover:bg-gray-50 flex-shrink-0">
                          <FiUpload />
                          <span>Upload</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(idx, e)} className="hidden" />
                        </label>
                      </div>

                      {shade.shadeImagePreview ? (
                        <div className="w-8 h-8 rounded-lg border overflow-hidden bg-white shadow-sm flex-shrink-0 mt-auto md:mt-0">
                          <img src={shade.shadeImagePreview} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic mt-auto md:mt-0">No File</span>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Color Code</label>
                      <div className="flex items-center gap-2 bg-white border rounded-lg px-2 py-1">
                        <input 
                          type="color" 
                          value={shade.shadeColorCode} 
                          onChange={(e) => handleShadeChange(idx, 'shadeColorCode', e.target.value)} 
                          className="w-7 h-7 cursor-pointer border-none bg-transparent flex-shrink-0" 
                        />
                        <span className="text-xs font-mono font-medium uppercase text-gray-600">{shade.shadeColorCode}</span>
                      </div>
                    </div>

                    <div className="md:col-span-1 flex justify-end">
                      <button 
                        type="button" 
                        onClick={() => handleRemoveShadeRow(idx)} 
                        className="text-red-500 hover:text-red-700 p-1 mt-4 md:mt-0 transition-colors"
                        title="Delete Shade"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

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
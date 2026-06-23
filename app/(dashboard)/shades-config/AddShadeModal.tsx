import React, { useState } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
// 💡 আপনার প্রজেক্টের টাইপ ফাইল থেকে সরাসরি টাইপস ইম্পোর্ট
import { ICategory, AddShadeModalProps, IShadeItem, ISubCategoryItem } from '../../../types/shade.interface'; 

export const AddShadeModal: React.FC<AddShadeModalProps> = ({ isOpen, onClose, onSave, categories }) => {
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  
  // ডাইনামিক শেড ইনপুট রো (টাইপ-সেফড উইথ IShadeItem)
  const [availableShades, setAvailableShades] = useState<IShadeItem[]>([
    { shadeName: '', shadeColorCode: '#000000', status: 'Active' }
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // ডাইনামিক ফিল্টারিং লজিক (ICategory স্ট্রাকচার অনুযায়ী)
  const selectedCategoryObj = categories.find((cat) => cat._id === category);
  const subCategoryOptions = selectedCategoryObj?.subCategories || [];
  
  const selectedSubCategoryObj = subCategoryOptions.find((sub) => sub.title === subCategory);
  const itemOptions = selectedSubCategoryObj?.items || [];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setSubCategory('');
    setItemName('');
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubCategory(e.target.value);
    setItemName('');
  };

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
    if (!category || !subCategory || !itemName) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const validShades = availableShades.filter(s => s.shadeName.trim() !== '');
      
      // IShade ইন্টারফেসের সাথে সামঞ্জস্যপূর্ণ ক্লিন JSON পে-লোড
      const payload = {
        category,
        subCategory,
        itemName,
        status,
        availableShades: validShades.map((sh) => ({
          shadeName: sh.shadeName,
          shadeColorCode: sh.shadeColorCode,
          status: sh.status
        }))
      };

      await onSave(payload);
      
      // সফল সাবমিট শেষে স্টেট ক্লিনআপ
      setCategory('');
      setSubCategory('');
      setItemName('');
      setAvailableShades([{ shadeName: '', shadeColorCode: '#000000', status: 'Active' }]);
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">Add New Shade Config</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><FiX size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* ক্যাটাগরি এবং সাব-ক্যাটাগরি সিলেকশন */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={category} onChange={handleCategoryChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D96B27]" required>
                <option value="">Select Category</option>
                {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category *</label>
              <select value={subCategory} onChange={handleSubCategoryChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D96B27]" required disabled={!category}>
                <option value="">Select Sub Category</option>
                {subCategoryOptions.map((sub, idx) => <option key={sub.id || idx} value={sub.title}>{sub.title}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <select value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D96B27]" required disabled={!subCategory}>
                <option value="">Select Item</option>
                {itemOptions.map((item, idx: number) => {
                  const itemNameStr = typeof item === 'string' ? item : (item as ISubCategoryItem).name;
                  return <option key={idx} value={itemNameStr}>{itemNameStr}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Global Configuration Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D96B27]">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* লাইভ ডাইনামিক শেড স্পেসিফিকেশন */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-800">Shades Specification *</label>
              <button type="button" onClick={handleAddShadeRow} className="flex items-center gap-1 text-xs text-orange-600 font-medium hover:underline"><FiPlus /> Add Shade Row</button>
            </div>

            <div className="hidden md:grid grid-cols-12 gap-4 px-3 mb-1 text-xs font-semibold text-gray-600">
              <div className="col-span-5">Shade Name *</div>
              <div className="col-span-3">Color Picker</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              {availableShades.map((shade, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                  
                  <div className="md:col-span-5">
                    <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Shade Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ruby Woo / NC15"
                      value={shade.shadeName}
                      onChange={(e) => handleShadeChange(idx, 'shadeName', e.target.value)}
                      className="w-full border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-[#D96B27]"
                      required
                    />
                  </div>

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

                  <div className="md:col-span-1 flex justify-end">
                    {availableShades.length > 1 && (
                      <button type="button" onClick={() => handleRemoveShadeRow(idx)} className="text-red-500 hover:text-red-700 p-1 mt-2 md:mt-0">
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg text-gray-700" disabled={loading}>Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-[#D96B27] text-white rounded-lg transition-all active:scale-95 disabled:bg-gray-400" disabled={loading}>
              {loading ? 'Saving Configuration...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
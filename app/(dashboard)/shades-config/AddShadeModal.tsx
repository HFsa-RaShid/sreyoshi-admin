// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState } from 'react';
// import { FiX, FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';

// interface AddShadeModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (data: any) => Promise<void>;
//   categories: any[];
// }

// export const AddShadeModal: React.FC<AddShadeModalProps> = ({ isOpen, onClose, onSave, categories }) => {
//   const [category, setCategory] = useState('');
//   const [subCategory, setSubCategory] = useState('');
//   const [itemName, setItemName] = useState('');
//   const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  
//   const [availableShades, setAvailableShades] = useState<any[]>([
//     { shadeName: '', shadeColorCode: '#000000', shadeImage: '', stock: 0, status: 'Active' }
//   ]);
//   const [loading, setLoading] = useState(false);

//   if (!isOpen) return null;

//   // 💡 useEffect ছাড়া সরাসরি ফাংশনে অপশন ফিল্টারিং
//   const selectedCategoryObj = categories.find((cat: any) => cat._id === category);
//   const subCategoryOptions = selectedCategoryObj?.subCategories || [];
  
//   const selectedSubCategoryObj = subCategoryOptions.find((sub: any) => sub.title === subCategory);
//   const itemOptions = selectedSubCategoryObj?.items || [];

//   const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setCategory(e.target.value);
//     setSubCategory('');
//     setItemName('');
//   };

//   const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setSubCategory(e.target.value);
//     setItemName('');
//   };

//   const handleAddShadeRow = () => {
//     setAvailableShades([...availableShades, { shadeName: '', shadeColorCode: '#000000', shadeImage: '', stock: 0, status: 'Active' }]);
//   };

//   const handleRemoveShadeRow = (index: number) => {
//     setAvailableShades(availableShades.filter((_, i) => i !== index));
//   };

//   const handleShadeChange = (index: number, field: string, value: any) => {
//     const updated = [...availableShades];
//     updated[index][field] = value;
//     setAvailableShades(updated);
//   };

//   const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       if (typeof reader.result === 'string') {
//         handleShadeChange(index, 'shadeImage', reader.result);
//       }
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!category || !subCategory || !itemName) {
//       alert("Please fill all required fields");
//       return;
//     }

//     try {
//       setLoading(true);
//       await onSave({
//         category,
//         subCategory,
//         itemName,
//         status,
//         availableShades: availableShades.filter(s => s.shadeName.trim() !== '')
//       });
      
//       setCategory('');
//       setSubCategory('');
//       setItemName('');
//       setAvailableShades([{ shadeName: '', shadeColorCode: '#000000', shadeImage: '', stock: 0, status: 'Active' }]);
//       onClose();
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
//       <div className="w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
//         <div className="flex items-center justify-between border-b pb-4">
//           <h2 className="text-xl font-bold text-gray-900">Add New Shade Config</h2>
//           <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><FiX size={20} /></button>
//         </div>

//         <form onSubmit={handleSubmit} className="mt-4 space-y-4">
//           {/* ক্যাটাগরি এবং সাব-ক্যাটাগরি সিলেকশন */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
//               <select value={category} onChange={handleCategoryChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" required>
//                 <option value="">Select Category</option>
//                 {categories.map((cat: any) => <option key={cat._id} value={cat._id}>{cat.name || cat.categoryName}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category *</label>
//               <select value={subCategory} onChange={handleSubCategoryChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" required disabled={!category}>
//                 <option value="">Select Sub Category</option>
//                 {subCategoryOptions.map((sub: any) => <option key={sub._id} value={sub.title}>{sub.title}</option>)}
//               </select>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
//               <select value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" required disabled={!subCategory}>
//                 <option value="">Select Item</option>
//                 {itemOptions.map((item: any, idx: number) => <option key={idx} value={item.name}>{item.name}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Global Configuration Status</label>
//               <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
//                 <option value="Active">Active</option>
//                 <option value="Inactive">Inactive</option>
//               </select>
//             </div>
//           </div>

//           {/* লাইভ ডাইনামিক শেড স্পেসিফিকেশন */}
//           <div className="border-t pt-4">
//             <div className="flex justify-between items-center mb-3">
//               <label className="block text-sm font-semibold text-gray-800">Shades Specification *</label>
//               <button type="button" onClick={handleAddShadeRow} className="flex items-center gap-1 text-xs text-orange-600 font-medium hover:underline"><FiPlus /> Add Shade Row</button>
//             </div>

//             {/* 💡 টেবিল হেডার / লেবেল গ্রিড যুক্ত করা হলো */}
//             <div className="hidden md:grid grid-cols-12 gap-3 px-3 mb-1 text-xs font-semibold text-gray-600">
//               <div className="col-span-3">Shade Name *</div>
//               <div className="col-span-2">Stock *</div>
//               <div className="col-span-2">Status</div>
//               <div className="col-span-2">Upload Image</div>
//               <div className="col-span-2">Color Picker</div>
//               <div className="col-span-1 text-right">Action</div>
//             </div>

//             <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
//               {availableShades.map((shade, idx) => (
//                 <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                  
//                   {/* মোবাইল ভিউ লেবেল সহ ইনপুট */}
//                   <div className="md:col-span-3">
//                     <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Shade Name</label>
//                     <input
//                       type="text"
//                       placeholder="e.g. Ruby Woo / NC15"
//                       value={shade.shadeName}
//                       onChange={(e) => handleShadeChange(idx, 'shadeName', e.target.value)}
//                       className="w-full border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-orange-500"
//                       required
//                     />
//                   </div>

//                   <div className="md:col-span-2">
//                     <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Stock</label>
//                     <input
//                       type="number"
//                       placeholder="Stock"
//                       min="0"
//                       value={shade.stock}
//                       onChange={(e) => handleShadeChange(idx, 'stock', parseInt(e.target.value) || 0)}
//                       className="w-full border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-orange-500"
//                       required
//                     />
//                   </div>

//                   <div className="md:col-span-2">
//                     <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Status</label>
//                     <select
//                       value={shade.status}
//                       onChange={(e) => handleShadeChange(idx, 'status', e.target.value)}
//                       className="w-full border rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-orange-500"
//                     >
//                       <option value="Active">Active</option>
//                       <option value="Inactive">Inactive</option>
//                     </select>
//                   </div>

//                   <div className="md:col-span-2 flex items-center gap-2">
//                     <div>
//                       <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Upload Image</label>
//                       <label className="flex items-center gap-1 border border-dashed border-gray-300 bg-white rounded-lg px-3 py-1.5 text-xs text-gray-600 cursor-pointer hover:bg-gray-100 flex-shrink-0">
//                         <FiUpload />
//                         <span>Upload</span>
//                         <input type="file" accept="image/*" onChange={(e) => handleFileChange(idx, e)} className="hidden" />
//                       </label>
//                     </div>

//                     {shade.shadeImage ? (
//                       <div className="w-8 h-8 rounded-lg border overflow-hidden bg-white shadow-sm flex-shrink-0 mt-auto md:mt-0">
//                         <img src={shade.shadeImage} alt="preview" className="w-full h-full object-cover" />
//                       </div>
//                     ) : (
//                       <span className="text-[10px] text-gray-400 italic mt-auto md:mt-0">No File</span>
//                     )}
//                   </div>

//                   {/* 💡 কালার পিকারের পাশে হেক্স কোড টেক্সট */}
//                   <div className="md:col-span-2">
//                     <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Color Code</label>
//                     <div className="flex items-center gap-2 bg-white border rounded-lg px-2 py-1">
//                       <input 
//                         type="color" 
//                         value={shade.shadeColorCode} 
//                         onChange={(e) => handleShadeChange(idx, 'shadeColorCode', e.target.value)} 
//                         className="w-7 h-7 cursor-pointer border-none bg-transparent flex-shrink-0" 
//                       />
//                       <span className="text-xs font-mono font-medium uppercase text-gray-600">{shade.shadeColorCode}</span>
//                     </div>
//                   </div>

//                   <div className="md:col-span-1 flex justify-end">
//                     {availableShades.length > 1 && (
//                       <button type="button" onClick={() => handleRemoveShadeRow(idx)} className="text-red-500 hover:text-red-700 p-1 mt-4 md:mt-0">
//                         <FiTrash2 size={16} />
//                       </button>
//                     )}
//                   </div>

//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="flex justify-end gap-3 border-t pt-4 mt-6">
//             <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg text-gray-700" disabled={loading}>Cancel</button>
//             <button type="submit" className="px-4 py-2 text-sm bg-[#D96B27] text-white rounded-lg" disabled={loading}>{loading ? 'Saving...' : 'Save Configuration'}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };


import React, { useState } from 'react';
import { FiX, FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';

// ১. প্রপার ইন্টারফেস এবং টাইপ ডেফিনিশন
export interface IShadeRowInput {
  shadeName: string;
  shadeColorCode: string;
  shadeImageFile: File | null; // 💡 ব্যাকএন্ডে পাঠানোর জন্য আসল ফাইল অবজেক্ট
  shadeImagePreview: string;   // 💡 ফর্মে লাইভ প্রিভিউ দেখানোর জন্য blob URL
  stock: number;
  status: 'Active' | 'Inactive';
}

interface ISubCategoryItem {
  name: string;
  status?: 'Active' | 'Inactive';
}

interface ISubCategoryGroup {
  _id: string;
  title: string;
  status?: 'Active' | 'Inactive';
  items: ISubCategoryItem[];
}

interface ICategoryConfig {
  _id: string;
  name?: string;
  categoryName?: string;
  subCategories: ISubCategoryGroup[];
}

interface AddShadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>; // 💡 যেহেতু ফাইল যাবে, তাই টাইপ হবে FormData
  categories: ICategoryConfig[];
}

export const AddShadeModal: React.FC<AddShadeModalProps> = ({ isOpen, onClose, onSave, categories }) => {
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  
  // ডাইনামিক শেড রো-এর টাইপ ফিক্স করা হলো
  const [availableShades, setAvailableShades] = useState<IShadeRowInput[]>([
    { shadeName: '', shadeColorCode: '#000000', shadeImageFile: null, shadeImagePreview: '', stock: 0, status: 'Active' }
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // অপশন ফিল্টারিং লজিক
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
      { shadeName: '', shadeColorCode: '#000000', shadeImageFile: null, shadeImagePreview: '', stock: 0, status: 'Active' }
    ]);
  };

  const handleRemoveShadeRow = (index: number) => {
    setAvailableShades(availableShades.filter((_, i) => i !== index));
  };

  // টাইপসেফ ফিল্ড হ্যান্ডলার
  const handleShadeChange = <K extends keyof IShadeRowInput>(index: number, field: K, value: IShadeRowInput[K]) => {
    const updated = [...availableShades];
    updated[index][field] = value;
    setAvailableShades(updated);
  };

  // 💡 FileReader (Base64) বাদ দিয়ে ব্রাউজার-মেমোরি প্রিভিউ (URL.createObjectURL) ব্যবহার করা হলো
  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleShadeChange(index, 'shadeImageFile', file);
    handleShadeChange(index, 'shadeImagePreview', URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subCategory || !itemName) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      // 💡 ১. ব্যাকএন্ডের রিকোয়ারমেন্ট অনুযায়ী FormData অবজেক্ট তৈরি
      const formData = new FormData();

      // valid শ্যাড ফিল্টার করে ব্যাকএন্ড স্কিমা অনুযায়ী ডাটা পে-লোড ম্যাপ করা
      const validShades = availableShades.filter(s => s.shadeName.trim() !== '');
      
      const payload = {
        category,
        subCategory,
        itemName,
        status,
        availableShades: validShades.map((sh) => ({
          shadeName: sh.shadeName,
          shadeColorCode: sh.shadeColorCode,
          shadeImage: "", // ব্যাকএন্ড এটি ক্লাউডিনারি ইউআরএল দিয়ে রিপ্লেস করবে
          stock: sh.stock,
          status: sh.status
        }))
      };

      // 💡 ২. ডাটা অবজেক্টকে JSON স্ট্রিং বানিয়ে 'data' কি-তে অ্যাপেন্ড করা
      formData.append("data", JSON.stringify(payload));

      // 💡 ৩. রিয়াল ফাইল অবজেক্টগুলোকে সিরিয়ালি 'shadeImages' কি-তে অ্যাপেন্ড করা
      validShades.forEach((sh) => {
        if (sh.shadeImageFile) {
          formData.append("shadeImages", sh.shadeImageFile);
        }
      });

      // অনসেভ হুকে formData-টি পাস করে দেওয়া হলো
      await onSave(formData);
      
      // স্টেট ক্লিনআপ
      setCategory('');
      setSubCategory('');
      setItemName('');
      setAvailableShades([{ shadeName: '', shadeColorCode: '#000000', shadeImageFile: null, shadeImagePreview: '', stock: 0, status: 'Active' }]);
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">Add New Shade Config</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><FiX size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* ক্যাটাগরি এবং সাব-ক্যাটাগরি সিলেকশন */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={category} onChange={handleCategoryChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" required>
                <option value="">Select Category</option>
                {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name || cat.categoryName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category *</label>
              <select value={subCategory} onChange={handleSubCategoryChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" required disabled={!category}>
                <option value="">Select Sub Category</option>
                {subCategoryOptions.map((sub) => <option key={sub._id} value={sub.title}>{sub.title}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <select value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" required disabled={!subCategory}>
                <option value="">Select Item</option>
                {itemOptions.map((item, idx: number) => <option key={idx} value={item.name}>{item.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Global Configuration Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
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

            <div className="hidden md:grid grid-cols-12 gap-3 px-3 mb-1 text-xs font-semibold text-gray-600">
              <div className="col-span-3">Shade Name *</div>
              <div className="col-span-2">Stock *</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Upload Image</div>
              <div className="col-span-2">Color Picker</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              {availableShades.map((shade, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                  
                  <div className="md:col-span-3">
                    <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">Shade Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ruby Woo / NC15"
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
                      <label className="flex items-center gap-1 border border-dashed border-gray-300 bg-white rounded-lg px-3 py-1.5 text-xs text-gray-600 cursor-pointer hover:bg-gray-100 flex-shrink-0">
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
                    {availableShades.length > 1 && (
                      <button type="button" onClick={() => handleRemoveShadeRow(idx)} className="text-red-500 hover:text-red-700 p-1 mt-4 md:mt-0">
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
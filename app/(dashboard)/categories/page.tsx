/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts'; // 🎯 লাইভ প্রোডাক্ট হুক ইম্পোর্ট করা হলো
import { ICategory, ISubCategoryItem } from '@/types/category.interface';
import { AddCategoryModal } from './AddCategoryModal';
import { EditCategoryModal } from './EditCategoryModal';
import { 
  FiChevronDown, FiChevronUp, FiEdit2, FiTrash2, 
  FiSearch, FiMenu, FiPlus, FiEye, FiEyeOff 
} from 'react-icons/fi';

export default function CategoryPage() {
  const { categories, isLoading: isLoadingCats, updateCategory, deleteCategory } = useCategories();
  const { products, isLoadingProducts } = useProducts(); // 🎯 সব লাইভ প্রোডাক্ট একসাথে রিড করা হচ্ছে
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedSubs, setExpandedSubs] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubCategory = (subUniqueKey: string) => {
    setExpandedSubs(prev => ({ ...prev, [subUniqueKey]: !prev[subUniqueKey] }));
  };

  const handleToggleStatus = async (category: ICategory) => {
    const nextStatus = category.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateCategory({ id: category._id, data: { status: nextStatus } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubStatus = async (category: ICategory, subIndex: number) => {
    const updatedSubs = category.subCategories.map((sub, idx) => {
      if (idx === subIndex) {
        const currentStatus = sub.status || 'Active';
        const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        return { ...sub, status: nextStatus as 'Active' | 'Inactive' };
      }
      return sub;
    });
    
    try {
      await updateCategory({ id: category._id, data: { subCategories: updatedSubs } });
    } catch (err) {
      console.error("Sub-category status toggle error:", err);
    }
  };

  const handleToggleItemStatus = async (category: ICategory, subIndex: number, itemIdx: number) => {
    const updatedSubs = category.subCategories.map((sub, sIdx) => {
      if (sIdx === subIndex) {
        const updatedItems = sub.items.map((item, iIdx) => {
          if (iIdx === itemIdx) {
            if (typeof item === 'string') {
              return { name: item, status: 'Inactive' as const } as ISubCategoryItem;
            } else {
              const currentItemStatus = item.status || 'Active';
              const nextStatus = currentItemStatus === 'Active' ? 'Inactive' : 'Active';
              return { ...item, status: nextStatus as 'Active' | 'Inactive' } as ISubCategoryItem;
            }
          }
          return item;
        });
        return { ...sub, items: updatedItems };
      }
      return sub;
    });

    try {
      await updateCategory({ id: category._id, data: { subCategories: updatedSubs } });
    } catch (err) {
      console.error("Item status toggle error:", err);
    }
  };

  const handleInlineAddItem = async (category: ICategory, subIndex: number) => {
    const { value: itemName } = await Swal.fire({
      title: 'Add New Item',
      input: 'text',
      inputPlaceholder: 'Enter item name...',
      showCancelButton: true,
      confirmButtonColor: '#1e1b4b'
    });

    if (!itemName?.trim()) return;

    const updatedSubs = category.subCategories.map((sub, idx) => {
      if (idx === subIndex) {
        const newItem = { name: itemName.trim(), status: 'Active' as const };
        return { ...sub, items: [...(sub.items || []), newItem] };
      }
      return sub;
    });

    try {
      await updateCategory({ id: category._id, data: { subCategories: updatedSubs as any } });
    } catch (err) {
      console.error("Error adding inline item:", err);
    }
  };

  const handleInlineEditItem = async (category: ICategory, subIndex: number, itemIdx: number, currentItem: string | ISubCategoryItem) => {
    const currentName = typeof currentItem === 'string' ? currentItem : currentItem.name;

    const { value: newName } = await Swal.fire({
      title: 'Edit Item Name',
      input: 'text',
      inputValue: currentName,
      showCancelButton: true,
      confirmButtonColor: '#1e1b4b'
    });

    if (!newName?.trim() || newName === currentName) return;

    const updatedSubs = category.subCategories.map((sub, sIdx) => {
      if (sIdx === subIndex) {
        const updatedItems = sub.items.map((item, iIdx) => {
          if (iIdx === itemIdx) {
            if (typeof item === 'string') {
              return { name: newName.trim(), status: 'Active' as const } as ISubCategoryItem;
            } else {
              return { ...item, name: newName.trim() } as ISubCategoryItem;
            }
          }
          return item;
        });
        return { ...sub, items: updatedItems };
      }
      return sub;
    });

    try {
      await updateCategory({ id: category._id, data: { subCategories: updatedSubs } });
    } catch (err) {
      console.error("Error editing inline item:", err);
    }
  };

  const handleInlineDeleteItem = async (category: ICategory, subIndex: number, itemIdx: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this item?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });

    if (!result.isConfirmed) return;

    const updatedSubs = category.subCategories.map((sub, sIdx) => {
      if (sIdx === subIndex) {
        return { ...sub, items: sub.items.filter((_, iIdx) => iIdx !== itemIdx) };
      }
      return sub;
    });

    await updateCategory({ id: category._id, data: { subCategories: updatedSubs } });
  };

  const handleDeleteCategory = (id: string) => {
    Swal.fire({
      title: 'Delete Category?',
      text: "Everything inside this category will be deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteCategory(id);
          Swal.fire('Deleted!', 'Category removed.', 'success');
        } catch (err) { console.error(err); }
      }
    });
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingCats || isLoadingProducts) return <div className="p-8 text-center text-sm font-medium text-gray-500">Loading Categories & Stocks...</div>;

  return (
    <div className="p-3 md:p-6 w-full space-y-6 min-h-screen text-xs sm:text-sm">
      
      {/* ─── টপ হেডার প্যানেল ─── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 font-serif">Category & Subcategory</h1>
          <p className="text-xs text-gray-500 mt-0.5">See all the Category, Subcategory & Items here...</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64 md:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm md:text-base" />
            <input 
              type="text" placeholder="Search categories..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl bg-white text-xs outline-none focus:border-slate-500 transition"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="bg-[#1E2E24] w-full sm:w-auto text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide hover:bg-opacity-95 shadow-xs transition shrink-0 cursor-pointer text-center"
          >
            + Add New Category
          </button>
        </div>
      </div>

      {/* ─── মেইন ক্যাটাগরি লিস্ট ─── */}
      <div className="space-y-4">
        {filteredCategories.map((cat) => {
          const isCatExpanded = !!expandedCategories[cat._id];

          {/* 🎯 ১. লাইভ ডাটাবেজ থেকে এই ক্যাটাগরির রিয়েল প্রোডাক্ট কাউন্ট লজিক */}
          const totalLiveProducts = products?.filter((p: any) => {
            const pCatId = typeof p.category === 'object' ? p.category?.$oid || p.category?._id : p.category;
            return pCatId === cat._id;
          }).length || 0;

          return (
            <div key={cat._id} className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
              
              {/* মূল ক্যাটাগরি রো */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FiMenu className="text-gray-400 text-base cursor-grab shrink-0 hidden xs:block" />
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-xl border border-gray-100 shadow-3xs shrink-0" />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[10px] text-gray-400 border border-dashed shrink-0">No Img</div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate">{cat.name}</h3>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                      {cat.subCategories?.length || 0} sub &bull; <span className="text-[#FF3F6C] font-bold">{totalLiveProducts} live products</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2.5 sm:pt-0 border-t border-dashed border-gray-100 sm:border-0">
                  <button
                    onClick={() => handleToggleStatus(cat)}
                    className={`px-2.5 py-0.5 text-[10px] sm:text-xs font-bold rounded-full border transition cursor-pointer ${
                      cat.status === 'Active' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                    }`}
                  >
                    ● {cat.status}
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setSelectedCategory(cat); setIsEditOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-slate-50 cursor-pointer"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-slate-50 cursor-pointer"><FiTrash2 size={14} /></button>
                    <button onClick={() => toggleCategory(cat._id)} className="p-2 border border-gray-100 rounded-xl text-gray-500 bg-slate-50 hover:bg-slate-100 transition cursor-pointer ml-1">
                      {isCatExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* সাব-ক্যাটাগরি টেবিল এরিয়া */}
              {isCatExpanded && (
                <div className="border-t border-gray-100 bg-slate-50/20 divide-y divide-gray-100">
                  {cat.subCategories?.map((sub, sIdx) => {
                    const subStatus = sub.status || 'Active';
                    const subKey = `${cat._id}-${sIdx}`;
                    const isSubExpanded = !!expandedSubs[subKey];

                    {/* 🎯 ২. সাব-ক্যাটাগরি লেভেলে রিয়েল লাইভ প্রোডাক্ট ফিল্টারিং */}
                    const totalSubLiveProducts = products?.filter((p: any) => {
                      const pCatId = typeof p.category === 'object' ? p.category?.$oid || p.category?._id : p.category;
                      return pCatId === cat._id && p.subCategory?.toLowerCase() === sub.title?.toLowerCase();
                    }).length || 0;

                    return (
                      <div key={sIdx} className="bg-white">
                        
                        <div className={`flex items-center justify-between p-3 pl-4 sm:pl-12 pr-3 sm:pr-4 border-b border-gray-50 transition-opacity gap-2 ${subStatus === 'Inactive' ? 'opacity-50' : ''}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <FiMenu className="text-gray-300 text-xs shrink-0 hidden xs:block" />
                            <h4 className="font-bold text-slate-700 text-xs sm:text-sm truncate">{sub.title}</h4>
                          </div>
                          
                          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                            {/* 🎯 এখানে রিয়েল কাউন্ট ব্যাজ বসানো হয়েছে */}
                            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50/70 px-1.5 py-0.5 rounded border border-indigo-100">
                              {totalSubLiveProducts} Products
                            </span>
                            
                            <div className="flex items-center gap-0.5">
                              <button onClick={() => handleToggleSubStatus(cat, sIdx)} className="p-1.5 text-gray-400 hover:text-purple-600 rounded-lg cursor-pointer">
                                {subStatus === 'Active' ? <FiEye size={14} /> : <FiEyeOff size={14} className="text-red-500" />}
                              </button>
                              <button onClick={() => handleInlineAddItem(cat, sIdx)} className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg cursor-pointer">
                                <FiPlus size={15} />
                              </button>
                            </div>

                            <button onClick={() => toggleSubCategory(subKey)} className="p-1 text-gray-400 hover:text-slate-700 cursor-pointer">
                              {isSubExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* চাইল্ড আইটেম টেবিল লিস্ট */}
                        {isSubExpanded && (
                          <div className="bg-slate-50/50 border-b border-gray-50 divide-y divide-gray-100 pl-6 sm:pl-20 pr-3 sm:pr-4">
                            {sub.items && sub.items.length > 0 ? (
                              sub.items.map((item, iIdx) => {
                                const isString = typeof item === 'string';
                                const itemName = isString ? item : item.name;
                                const itemStatus = isString ? 'Active' : item.status;

                                {/* 🎯 ৩. একদম শেষ চাইল্ড আইটেম লেভেলের (যেমন: Eye Shadow) রিয়েল কাউন্ট লজিক */}
                                const totalItemLiveProducts = products?.filter((p: any) => {
                                  const pCatId = typeof p.category === 'object' ? p.category?.$oid || p.category?._id : p.category;
                                  return pCatId === cat._id && 
                                         p.subCategory?.toLowerCase() === sub.title?.toLowerCase() &&
                                         p.itemName?.toLowerCase() === itemName?.toLowerCase();
                                }).length || 0;

                                return (
                                  <div key={iIdx} className={`flex items-center justify-between py-2 px-2 hover:bg-slate-100/40 transition gap-2 ${itemStatus === 'Inactive' ? 'opacity-40' : ''}`}>
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-gray-300 text-xs shrink-0">•</span>
                                      <span className={`text-xs sm:text-sm font-semibold truncate ${itemStatus === 'Inactive' ? 'line-through text-gray-400' : 'text-slate-600'}`}>
                                        {itemName} 
                                        {/* 🎯 ছোট করে লাইভ স্টক ব্র্যাকেটে শো করা হলো */}
                                        <span className="text-[10px] text-emerald-600 font-mono font-bold ml-1.5">({totalItemLiveProducts} live)</span>
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <button 
                                        onClick={() => handleToggleItemStatus(cat, sIdx, iIdx)}
                                        className={`px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded border cursor-pointer ${
                                          itemStatus === 'Active' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                                        }`}
                                      >
                                        {itemStatus}
                                      </button>

                                      <div className="flex items-center gap-0.5">
                                        <button type="button" onClick={() => handleInlineEditItem(cat, sIdx, iIdx, item)} className="p-1 text-gray-400 hover:text-blue-500 rounded cursor-pointer"><FiEdit2 size={12} /></button>
                                        <button type="button" onClick={() => handleInlineDeleteItem(cat, sIdx, iIdx)} className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"><FiTrash2 size={12} /></button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="py-3 text-center text-[11px] text-gray-400 italic">No items available in this subcategory.</div>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })}

                  {/* সাব-ক্যাটাগরি এরিয়ার নিচে ফুটার বাটন */}
                  <div className="p-3 pl-4 sm:pl-12 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white gap-2 border-t border-gray-50">
                    <span className="text-xs text-gray-400 italic">Want to add more subcategories or fields?</span>
                    <button 
                      onClick={() => { setSelectedCategory(cat); setIsEditOpen(true); }}
                      className="bg-[#1E2E24] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-opacity-95 cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <FiPlus size={13} /> Add New Subcategory
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      <AddCategoryModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditCategoryModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedCategory(null); }} category={selectedCategory} />
    </div>
  );
}
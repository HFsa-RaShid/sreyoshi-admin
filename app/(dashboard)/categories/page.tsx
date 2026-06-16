/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useCategories } from '@/hooks/useCategories';
import { ICategory, ISubCategoryItem } from '@/types/category.interface';
import { AddCategoryModal } from './AddCategoryModal';
import { EditCategoryModal } from './EditCategoryModal';
import { 
  FiChevronDown, FiChevronUp, FiEdit2, FiTrash2, 
  FiSearch, FiMenu, FiPlus, FiEye, FiEyeOff 
} from 'react-icons/fi';

export default function CategoryPage() {
  const { categories, isLoading, updateCategory, deleteCategory } = useCategories();
  
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

  // ১. মেইন ক্যাটাগরি স্ট্যাটাস পরিবর্তন
  const handleToggleStatus = async (category: ICategory) => {
    const nextStatus = category.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateCategory({ id: category._id, data: { status: nextStatus } });
    } catch (err) {
      console.error(err);
    }
  };

// ২. সাব-ক্যাটাগরি স্ট্যাটাস টগল (টাইপস্ক্রিপ্ট ফিক্সড)
  const handleToggleSubStatus = async (category: ICategory, subIndex: number) => {
    const updatedSubs = category.subCategories.map((sub, idx) => {
      if (idx === subIndex) {
        const currentStatus = sub.status || 'Active';
        const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        
        return { 
          ...sub, 
          status: nextStatus as 'Active' | 'Inactive' // 👈 'string' এর বদলে সঠিক টাইপ কাস্টিং
        };
      }
      return sub;
    });
    
    try {
      await updateCategory({ id: category._id, data: { subCategories: updatedSubs } });
    } catch (err) {
      console.error("Sub-category status toggle error:", err);
    }
  };

  // ৩. আইটেম স্ট্যাটাস টগল (আইডি ছাড়া এবং টাইপসেফ)
  const handleToggleItemStatus = async (category: ICategory, subIndex: number, itemIdx: number) => {
    const updatedSubs = category.subCategories.map((sub, sIdx) => {
      if (sIdx === subIndex) {
        const updatedItems = sub.items.map((item, iIdx) => {
          if (iIdx === itemIdx) {
            // যদি ডাটাবেজের পুরনো ডাটা (স্ট্রিং) হয়
            if (typeof item === 'string') {
              return { 
                name: item, 
                status: 'Inactive' as const 
              } as ISubCategoryItem; // 👈 ইন্টারফেসের সাথে মেলাতে কাস্টিং
            } 
            // যদি অলরেডি অবজেক্ট ডাটা হয়
            else {
              const currentItemStatus = item.status || 'Active';
              const nextStatus = currentItemStatus === 'Active' ? 'Inactive' : 'Active';
              return { 
                ...item, 
                status: nextStatus as 'Active' | 'Inactive'
              } as ISubCategoryItem; // 👈 ইন্টারফেসের সাথে মেলাতে কাস্টিং
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

// ৪. সাব-ক্যাটাগরির ভেতরে নতুন Item যুক্ত করা (টাইপস্ক্রিপ্ট ফিক্সড)
 // ৪. সাব-ক্যাটাগরির ভেতরে নতুন Item যুক্ত করা (Property 'id' missing এরর ফিক্সড)
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
        // 🔹 এখানে সরাসরি অবজেক্ট টাইপ ডিক্লেয়ার করা হয়েছে কোনো ইন্টারফেস বাইন্ডিং ছাড়া
        const newItem = {
          name: itemName.trim(),
          status: 'Active' as const
        };
        
        return { 
          ...sub, 
          items: [...(sub.items || []), newItem] 
        };
      }
      return sub;
    });

    try {
      // 🔹 ডাটা পাঠানোর সময় টাইপস্ক্রিপ্টকে নিশ্চিত করতে 'as any' অথবা 'as ISubCategory[]' কাস্টিং করা হয়েছে
      await updateCategory({ 
        id: category._id, 
        data: { subCategories: updatedSubs as any } 
      });
    } catch (err) {
      console.error("Error adding inline item:", err);
    }
  };

  // ৫. আইটেম এডিট করা (টাইপস্ক্রিপ্ট ফিক্সড)
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
            // পুরনো স্ট্রিং ডাটা হলে তাকে নতুন অবজেক্ট ফরম্যাটে কনভার্ট করার সময় কাস্টিং
            if (typeof item === 'string') {
              return { 
                name: newName.trim(), 
                status: 'Active' as const 
              } as ISubCategoryItem;
            } 
            // অলরেডি অবজেক্ট ডাটা হলে নাম আপডেট করার সময় কাস্টিং
            else {
              return { 
                ...item, 
                name: newName.trim() 
              } as ISubCategoryItem;
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

  // ৬. আইটেম ডিলিট করা
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

  // ৭. ক্যাটাগরি ডিলিট
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

  if (isLoading) return <div className="p-8 text-center text-base font-medium text-gray-500">Loading Categories...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 bg-[#f8fafc] min-h-screen">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Category & Subcategory</h1>
          <p className="text-sm text-gray-500">See all the Category, Subcategory & Items here...</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input 
              type="text" placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-sm outline-none focus:border-slate-500 transition"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="bg-[#1e1b4b] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 shadow-sm transition"
          >
            + Add New Category
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="space-y-4">
        {filteredCategories.map((cat) => {
          const isCatExpanded = !!expandedCategories[cat._id];
          const totalProducts = cat.subCategories?.reduce((acc, sub) => acc + (sub.items?.length || 0), 0) || 0;

          return (
            <div key={cat._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              
              {/* 🔹 ১. মূল ক্যাটাগরি রো */}
              <div className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <FiMenu className="text-gray-400 text-lg cursor-grab" />
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-12 h-12 object-cover rounded-lg border shadow-xs" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-gray-400 border">No Img</div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-800 text-base sm:text-lg">{cat.name}</h3>
                    <p className="text-xs text-gray-400 font-medium">
                      {cat.subCategories?.length || 0} subcategory &bull; {totalProducts} products
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleStatus(cat)}
                    className={`px-3 py-1 text-xs font-bold rounded-full border transition ${
                      cat.status === 'Active' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'
                    }`}
                  >
                    ● {cat.status}
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setSelectedCategory(cat); setIsEditOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-slate-50"><FiEdit2 size={16} /></button>
                    <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-gray-400 hover:text-red-500 rounded-md hover:bg-slate-50"><FiTrash2 size={16} /></button>
                  </div>

                  <button onClick={() => toggleCategory(cat._id)} className="p-1.5 border rounded-lg text-gray-500 bg-slate-50 hover:bg-slate-100 transition">
                    {isCatExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* 🔹 ২. সাব-ক্যাটাগরি টেবিল লিস্ট */}
              {isCatExpanded && (
                <div className="border-t bg-slate-50/40 divide-y divide-gray-200">
                  {cat.subCategories?.map((sub, sIdx) => {
                    const subStatus = sub.status || 'Active';
                    const subKey = `${cat._id}-${sIdx}`;
                    const isSubExpanded = !!expandedSubs[subKey];

                    return (
                      <div key={sIdx} className="bg-white">
                        
                        <div className={`flex items-center justify-between p-3.5 pl-12 pr-4 border-b border-gray-100 transition-opacity ${subStatus === 'Inactive' ? 'opacity-50' : ''}`}>
                          <div className="flex items-center gap-3">
                            <FiMenu className="text-gray-300 text-base" />
                            <h4 className="font-semibold text-slate-700 text-sm sm:text-base">{sub.title}</h4>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-400 font-semibold">{sub.items?.length || 0} products</span>
                            
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleToggleSubStatus(cat, sIdx)} className="p-2 text-gray-400 hover:text-purple-600 rounded-md" title="Toggle Subcategory Visibility">
                                {subStatus === 'Active' ? <FiEye size={15} /> : <FiEyeOff size={15} className="text-red-500" />}
                              </button>
                              <button onClick={() => handleInlineAddItem(cat, sIdx)} className="p-2 text-gray-400 hover:text-green-600 rounded-md" title="Add Item Inside Subcategory">
                                <FiPlus size={16} />
                              </button>
                            </div>

                            <button onClick={() => toggleSubCategory(subKey)} className="p-1 text-gray-400 hover:text-slate-700">
                              {isSubExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                            </button>
                          </div>
                        </div>

                        {/* 🔹 ৩. আইটেম টেবিল লিস্ট */}
                        {isSubExpanded && (
                          <div className="bg-slate-50/70 border-b border-gray-200 divide-y divide-gray-100 pl-20 pr-4">
                            {sub.items && sub.items.length > 0 ? (
                              sub.items.map((item, iIdx) => {
                                const isString = typeof item === 'string';
                                const itemName = isString ? item : item.name;
                                const itemStatus = isString ? 'Active' : item.status;

                                return (
                                  <div key={iIdx} className={`flex items-center justify-between py-2.5 px-3 hover:bg-slate-100/50 transition ${itemStatus === 'Inactive' ? 'opacity-40' : ''}`}>
                                    <div className="flex items-center gap-3">
                                      <span className="text-gray-300 text-xs">•</span>
                                      <span className={`text-sm font-medium ${itemStatus === 'Inactive' ? 'line-through text-gray-400' : 'text-slate-600'}`}>
                                        {itemName}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <button 
                                        onClick={() => handleToggleItemStatus(cat, sIdx, iIdx)}
                                        className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${
                                          itemStatus === 'Active' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'
                                        }`}
                                      >
                                        {itemStatus}
                                      </button>

                                      <div className="flex items-center gap-1">
                                        <button type="button" onClick={() => handleInlineEditItem(cat, sIdx, iIdx, item)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded" title="Edit Item">
                                          <FiEdit2 size={13} />
                                        </button>
                                        <button type="button" onClick={() => handleInlineDeleteItem(cat, sIdx, iIdx)} className="p-1.5 text-gray-400 hover:text-red-500 rounded" title="Delete Item">
                                          <FiTrash2 size={13} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="py-3 text-center text-xs text-gray-400 italic">No products available in this subcategory.</div>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })}

                  <div className="p-3 pl-12 flex items-center justify-between bg-white">
                    <span className="text-sm text-gray-400 italic">Want to add more subcategories or fields?</span>
                    <button 
                      onClick={() => { setSelectedCategory(cat); setIsEditOpen(true); }}
                      className="bg-[#1e1b4b] text-white px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 hover:bg-opacity-90"
                    >
                      <FiPlus size={14} /> Add New Subcategory
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
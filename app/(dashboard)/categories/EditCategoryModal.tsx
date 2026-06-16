"use client";

import { useCategories } from "@/hooks/useCategories";
import { ICategory, ISubCategory, ISubCategoryItem } from "@/types/category.interface";
import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface Props { isOpen: boolean; onClose: () => void; category: ICategory | null; }

export const EditCategoryModal: React.FC<Props> = ({ isOpen, onClose, category }) => {
  const { updateCategory } = useCategories();
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [subCategories, setSubCategories] = useState<{ id: string; title: string; status: "Active" | "Inactive"; rawItems: string }[]>([]);

  useEffect(() => {
    if (category && isOpen) {
      setName(category.name);
      setImageFile(null);
      setPreviewUrl(null);
      
      if (category.subCategories && category.subCategories.length > 0) {
        setSubCategories(
          category.subCategories.map((sub, idx) => {
            // হাইব্রিড সাপোর্ট: আইটেম স্ট্রিং বা অবজেক্ট যাই হোক তার নাম রিড করা হচ্ছে
            const rawText = sub.items
              .map(item => typeof item === 'string' ? item : item.name)
              .join(", ");

            return {
              id: sub.id || `sub-${Date.now()}-${idx}`,
              title: sub.title,
              status: sub.status || "Active",
              rawItems: rawText
            };
          })
        );
      } else {
        setSubCategories([{ id: `sub-${Date.now()}`, title: "", status: "Active", rawItems: "" }]);
      }
    }
  }, [category, isOpen]);

  if (!isOpen || !category) return null;

  const handleAddSubField = () => {
    setSubCategories([...subCategories, { id: `sub-${Date.now()}`, title: "", status: "Active", rawItems: "" }]);
  };

  const handleRemoveSubField = (id: string) => {
    setSubCategories(subCategories.filter(sub => sub.id !== id));
  };

  const handleSubChange = (id: string, field: "title" | "status" | "rawItems", value: string) => {
    setSubCategories(subCategories.map(sub => sub.id === id ? { ...sub, [field]: value } : sub));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedSubs: ISubCategory[] = subCategories
        .filter(sub => sub.title.trim() !== "")
        .map(sub => {
          // কমা সেপারেটেড স্ট্রিংকে ISubCategoryItem অবজেক্ট অ্যারেলিস্টে কনভার্ট করা হচ্ছে
          const itemsArray: ISubCategoryItem[] = sub.rawItems
            .split(",")
            .map(i => i.trim())
            .filter(i => i !== "")
            .map((itemName, idx) => ({
              id: `item-${Date.now()}-${idx}`,
              name: itemName,
              status: "Active" as const
            }));

          return {
            id: sub.id,
            title: sub.title.trim(),
            status: sub.status,
            items: itemsArray
          };
        });

      const formData = new FormData();
      formData.append("name", name || category.name);
      formData.append("subCategories", JSON.stringify(formattedSubs));
      if (imageFile) formData.append("image", imageFile);

      await updateCategory({ id: category._id, data: formData });
      onClose();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Edit Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Category Name</label>
            <input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm outline-none focus:border-slate-500" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Image</label>
            <input type="file" accept="image/*" className="w-full border border-gray-300 p-1.5 rounded-lg text-sm" onChange={(e) => { const f = e.target.files?.[0] || null; setImageFile(f); setPreviewUrl(f ? URL.createObjectURL(f) : null); }} />
            <div className="mt-2">
              {previewUrl ? <img src={previewUrl} className="w-16 h-16 object-cover rounded-lg border-2 border-green-500" /> : category.image && <img src={category.image} className="w-16 h-16 object-cover rounded-lg border" />}
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700">Sub-categories & Items</label>
              <button type="button" onClick={handleAddSubField} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md font-bold flex items-center gap-1"><FiPlus /> Add Sub</button>
            </div>

            {subCategories.map((sub) => (
              <div key={sub.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 relative">
                <button type="button" onClick={() => handleRemoveSubField(sub.id)} className="absolute right-2 top-2 text-gray-400 hover:text-red-500"><FiTrash2 size={15} /></button>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3">
                  <input type="text" placeholder="Sub-category Title" className="border border-gray-300 p-2 bg-white rounded-lg text-sm font-semibold outline-none" value={sub.title} onChange={(e) => handleSubChange(sub.id, "title", e.target.value)} required />
                  
                  <select 
                    className="border border-gray-300 p-2 bg-white rounded-lg text-sm outline-none font-medium"
                    value={sub.status}
                    onChange={(e) => handleSubChange(sub.id, "status", e.target.value as "Active" | "Inactive")}
                  >
                    <option value="Active">🟢 Active</option>
                    <option value="Inactive">🔴 Inactive</option>
                  </select>

                  <input type="text" placeholder="Items (separated by comma)" className="border border-gray-300 p-2 bg-white rounded-lg text-sm outline-none" value={sub.rawItems} onChange={(e) => handleSubChange(sub.id, "rawItems", e.target.value)} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 rounded-lg text-sm font-semibold">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-md">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};
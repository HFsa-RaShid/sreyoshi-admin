"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { ICategory } from "./types";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // ক্যাটাগরি ডাটা নিয়ে আসা (ড্রপডাউনের জন্য)
  const { data: categories } = useQuery<ICategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get("/api/v1/categories"); // আপনার ক্যাটাগরি এপিআই পাথ
      return res.data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post("/api/v1/products/create-product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
      resetForm();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to create product");
    },
  });

  const resetForm = () => {
    setImages([]);
    setImagePreviews([]);
    setError("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArray].slice(0, 3)); // সর্বোচ্চ ৩টি ইমেজ

      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews].slice(0, 3));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (images.length === 0) {
      setError("Please upload 3 common gallery images!");
      return;
    }

    const target = e.currentTarget;
    const formData = new FormData();

    const productData = {
      productCode: target.productCode.value,
      name: target.name.value,
      category: target.category.value,
      subCategory: target.subCategory.value.toUpperCase(),
      itemName: target.itemName.value,
      price: Number(target.price.value),
      oldPrice: target.oldPrice.value ? Number(target.oldPrice.value) : undefined,
      discount: target.discount.value || undefined,
      weightOrVolume: Number(target.weightOrVolume.value),
      unit: target.unit.value,
      description: target.description.value,
      howToUse: target.howToUse.value || undefined,
      promotion: target.promotion.value || undefined,
    };

    formData.append("data", JSON.stringify(productData));
    images.forEach((img) => formData.append("commonImages", img));

    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-lg font-bold font-serif text-gray-900">Add New Master Product</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {error && <div className="p-3 mb-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 📸 ড্রপজোন ইমেজ আপলোডার (শীর্ষে অবস্থিত) */}
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center bg-gray-50">
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="modalCommonImages" />
            <label htmlFor="modalCommonImages" className="cursor-pointer flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-400 border"><ImageIcon size={20} /></div>
              <span className="font-semibold text-gray-700">Upload Remaining 3 Common Gallery Images</span>
              <span className="text-[10px] text-gray-400">PNG, JPG up to 5MB (Max 3 files)</span>
            </label>

            {imagePreviews.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-3">
                {imagePreviews.map((src, i) => (
                  <img key={i} src={src} className="w-14 h-14 object-cover rounded-xl border border-gray-200" alt="Preview" />
                ))}
              </div>
            )}
          </div>

          {/* ইনপুট গ্রিড */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Product SKU / Code</label>
              <input name="productCode" required className="w-full p-2.5 bg-gray-50 border rounded-xl" placeholder="e.g. SC-LIP-01" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Product Name</label>
              <input name="name" required className="w-full p-2.5 bg-gray-50 border rounded-xl" placeholder="e.g. Silk Velvet Matte Lipstick" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
              <select name="category" required className="w-full p-2.5 bg-gray-50 border rounded-xl">
                <option value="">Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sub Category</label>
              <input name="subCategory" required className="w-full p-2.5 bg-gray-50 border rounded-xl" placeholder="e.g. LIPS, SKIN, EYES" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Item Name Type</label>
              <input name="itemName" required className="w-full p-2.5 bg-gray-50 border rounded-xl" placeholder="e.g. Lipstick, Moisturizer" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Price (BDT)</label>
                <input name="price" type="number" required className="w-full p-2.5 bg-gray-50 border rounded-xl" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Old Price</label>
                <input name="oldPrice" type="number" className="w-full p-2.5 bg-gray-50 border rounded-xl" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Discount Tag (Optional)</label>
              <input name="discount" className="w-full p-2.5 bg-gray-50 border rounded-xl" placeholder="e.g. 15% OFF" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Weight/Vol</label>
                <input name="weightOrVolume" type="number" required className="w-full p-2.5 bg-gray-50 border rounded-xl" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Unit</label>
                <select name="unit" className="w-full p-2.5 bg-gray-50 border rounded-xl">
                  <option value="ml">ml</option>
                  <option value="gm">gm</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Promotion Campaign</label>
            <select name="promotion" className="w-full p-2.5 bg-gray-50 border rounded-xl">
              <option value="">None</option>
              <option value="Best Sellers">Best Sellers</option>
              <option value="New Arrivals">New Arrivals</option>
              <option value="Trending">Trending</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
            <textarea name="description" required rows={2} className="w-full p-2.5 bg-gray-50 border rounded-xl" placeholder="Detailed specifications..."></textarea>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">How To Use (Optional)</label>
            <textarea name="howToUse" rows={2} className="w-full p-2.5 bg-gray-50 border rounded-xl" placeholder="Steps to apply product..."></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl font-bold text-gray-500 hover:bg-gray-50 uppercase tracking-wider">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-5 py-2 bg-[#1E2E24] hover:bg-[#FF3F6C] text-white rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-colors">
              {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
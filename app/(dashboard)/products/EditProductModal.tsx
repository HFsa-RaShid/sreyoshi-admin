"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { IProduct } from "./types";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProduct | null;
}

export default function EditProductModal({ isOpen, onClose, product }: EditProductModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      setExistingImages(product.commonImages || []);
      setNewImages([]);
      setNewPreviews([]);
    }
  }, [product]);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.patch(`/api/v1/products/${product?.productCode}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to update product");
    },
  });

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...filesArray]);
      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setNewPreviews((prev) => [...prev, ...previews]);
    }
  };

  const handleRemoveExistingImage = (imgUrl: string) => {
    // অ্যাক্টিভলি অ্যাডমিন ইমেজ কেটে দিলে ফ্রন্টএন্ডে রিমুভ হবে এবং ব্যাকএন্ড ক্লাউডিনারি সিঙ্কে যাবে
    setExistingImages((prev) => prev.filter((url) => url !== imgUrl));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;

    const target = e.currentTarget;
    const formData = new FormData();

    const updatedData = {
      name: target.productName.value,
      price: Number(target.price.value),
      oldPrice: target.oldPrice.value ? Number(target.oldPrice.value) : undefined,
      discount: target.discount.value || undefined,
      weightOrVolume: Number(target.weightOrVolume.value),
      unit: target.unit.value,
      description: target.description.value,
      howToUse: target.howToUse.value || undefined,
      promotion: target.promotion.value || undefined,
      commonImages: existingImages, // রিটেইনড ইমেজ ট্র্যাক
    };

    formData.append("data", JSON.stringify(updatedData));
    newImages.forEach((img) => formData.append("commonImages", img));

    mutation.mutate(formData);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-gray-900">Modify Master Product</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">SKU ID: {product.productCode}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        {error && <div className="p-3 mb-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* 📸 ইমেজ গ্যালারি এডিটর স্পেস */}
          <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-3">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Product Gallery (Side by Side)</span>
            
            <div className="flex flex-wrap gap-3">
              {/* ডাটাবেজের বিদ্যমান ছবি */}
              {existingImages.map((url, i) => (
                <div key={i} className="relative group w-16 h-16 border rounded-xl overflow-hidden bg-white shadow-sm">
                  <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleRemoveExistingImage(url)} className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full shadow-md opacity-90 hover:bg-red-600">
                    <X size={10} />
                  </button>
                </div>
              ))}

              {/* সদ্য সিলেক্ট করা নতুন ছবি */}
              {newPreviews.map((src, i) => (
                <div key={i} className="w-16 h-16 border border-dashed border-[#FF3F6C] rounded-xl overflow-hidden relative bg-white">
                  <img src={src} alt="New Preview" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 text-[8px] font-bold text-white uppercase">New</div>
                </div>
              ))}

              {/* নতুন ইমেজ যোগ করার ড্রপজোন টাইল */}
              <label htmlFor="editUploadImages" className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-white hover:border-gray-400 transition-colors">
                <ImageIcon size={14} className="text-gray-400" />
                <span className="text-[8px] text-gray-400 font-bold mt-1">+ Image</span>
                <input type="file" multiple accept="image/*" onChange={handleNewImageChange} className="hidden" id="editUploadImages" />
              </label>
            </div>
          </div>

          {/* ইনপুট ফিল্ডস */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Product Name</label>
              <input name="productName" defaultValue={product.name} required className="w-full p-2.5 bg-gray-50 border rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Price (BDT)</label>
                <input name="price" type="number" defaultValue={product.price} required className="w-full p-2.5 bg-gray-50 border rounded-xl" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Old Price</label>
                <input name="oldPrice" type="number" defaultValue={product.oldPrice || ""} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Discount Coupon Tag</label>
              <input name="discount" defaultValue={product.discount || ""} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Weight/Vol</label>
                <input name="weightOrVolume" type="number" defaultValue={product.weightOrVolume} required className="w-full p-2.5 bg-gray-50 border rounded-xl" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Unit</label>
                <select name="unit" defaultValue={product.unit} className="w-full p-2.5 bg-gray-50 border rounded-xl">
                  <option value="ml">ml</option>
                  <option value="gm">gm</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Promotion Banner Position</label>
            <select name="promotion" defaultValue={product.promotion || ""} className="w-full p-2.5 bg-gray-50 border rounded-xl">
              <option value="">None</option>
              <option value="Best Sellers">Best Sellers</option>
              <option value="New Arrivals">New Arrivals</option>
              <option value="Trending">Trending</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
            <textarea name="description" defaultValue={product.description} required rows={3} className="w-full p-2.5 bg-gray-50 border rounded-xl"></textarea>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">How To Use Guidelines</label>
            <textarea name="howToUse" defaultValue={product.howToUse || ""} rows={2} className="w-full p-2.5 bg-gray-50 border rounded-xl"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl font-bold text-gray-500 hover:bg-gray-50 uppercase tracking-wider">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-5 py-2 bg-[#1E2E24] hover:bg-[#FF3F6C] text-white rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-colors">
              {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : "Apply Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { Upload, X, Plus } from "lucide-react";

interface ProductMediaFormProps {
  singleImagePreview: string | null;
  setSingleImage: (file: File | null) => void;
  setSingleImagePreview: (src: string | null) => void;
  multiImages: File[];
  setMultiImages: React.Dispatch<React.SetStateAction<File[]>>;
  multiImagePreviews: string[];
  setMultiImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ProductMediaForm({
  singleImagePreview, setSingleImage, setSingleImagePreview,
  multiImages, setMultiImages,
  multiImagePreviews, setMultiImagePreviews
}: ProductMediaFormProps) {

  const handleSingleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSingleImage(file);
      setSingleImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMultiImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (multiImages.length + filesArray.length > 3) {
        alert("Maximum 3 gallery images allowed.");
        return;
      }
      setMultiImages((prev) => [...prev, ...filesArray]);
      setMultiImagePreviews((prev) => [...prev, ...filesArray.map(f => URL.createObjectURL(f))]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <h2 className="text-sm font-bold text-[#1E293B]">Product Media Files</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Main Image */}
        <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-[#F8FAFC] flex flex-col items-center justify-center min-h-[140px]">
          {singleImagePreview ? (
            <div className="relative h-24">
              <img src={singleImagePreview} className="max-h-full object-contain rounded-lg" alt="Main" />
              <button type="button" onClick={() => { setSingleImage(null); setSingleImagePreview(null); }} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"><X size={10} /></button>
            </div>
          ) : (
            <label className="cursor-pointer text-center">
              <Upload className="w-6 h-6 text-orange-400 mx-auto mb-1" />
              <span className="font-bold text-slate-700 block">Main Image</span>
              <input type="file" accept="image/*" onChange={handleSingleImageChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Gallery Images */}
        <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-[#F8FAFC] flex flex-col items-center justify-center min-h-[140px]">
          {multiImagePreviews.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 w-full">
              {multiImagePreviews.map((src: string, idx: number) => (
                <div key={idx} className="relative bg-white border p-1 rounded-lg flex items-center justify-center h-11">
                  <img src={src} className="max-h-full object-contain" alt="Gallery" />
                  <button type="button" onClick={() => { setMultiImages((p) => p.filter((_, i) => i !== idx)); setMultiImagePreviews((p) => p.filter((_, i) => i !== idx)); }} className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full"><X size={8} /></button>
                </div>
              ))}
              {multiImagePreviews.length < 3 && (
                <label className="border border-dashed rounded-lg flex items-center justify-center h-11 cursor-pointer bg-white">
                  <Plus size={14} />
                  <input type="file" accept="image/*" multiple onChange={handleMultiImageChange} className="hidden" />
                </label>
              )}
            </div>
          ) : (
            <label className="cursor-pointer text-center">
              <Upload className="w-6 h-6 text-orange-400 mx-auto mb-1" />
              <span className="font-bold text-slate-700 block">Gallery Images (Max 3)</span>
              <input type="file" accept="image/*" multiple onChange={handleMultiImageChange} className="hidden" />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
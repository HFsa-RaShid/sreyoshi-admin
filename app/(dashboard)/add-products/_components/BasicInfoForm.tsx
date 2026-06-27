

"use client";

import React from "react";
import DynamicReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface BasicInfoFormProps {
  productCode: string; setProductCode: (val: string) => void;
  productName: string; setProductName: (val: string) => void;
  skinType: string; setSkinType: (val: string) => void;
  promotion: string; setPromotion: (val: any) => void;
  sellPrice: number | ""; setSellPrice: (val: number | "") => void;
  regularPrice: number | ""; setRegularPrice: (val: number | "") => void;
  weightOrVolume: number | ""; setWeightOrVolume: (val: number | "") => void;
  unit: 'gm' | 'ml' | 'pcs'; setUnit: (val: 'gm' | 'ml' | 'pcs') => void;
  productStatus: 'Active' | 'Inactive'; setProductStatus: (val: 'Active' | 'Inactive') => void;
  description: string; setDescription: (val: string) => void;
  howToUse: string; setHowToUse: (val: string) => void;
}

const editorModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "clean"],
  ],
};

export default function BasicInfoForm({
  productCode, setProductCode,
  productName, setProductName,
  skinType, setSkinType,
  promotion, setPromotion,
  sellPrice, setSellPrice,
  regularPrice, setRegularPrice,
  weightOrVolume, setWeightOrVolume,
  unit, setUnit,
  productStatus, setProductStatus,
  description, setDescription,
  howToUse, setHowToUse
}: BasicInfoFormProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <h2 className="text-sm font-bold text-[#1E293B]">Basic Information</h2>
      
      {/* Code & Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-semibold text-slate-500 block mb-1.5">Product Code / SKU *</label>
          <input type="text" required value={productCode} onChange={(e) => setProductCode(e.target.value)} placeholder="e.g., PROD-MK-102" className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-orange-400" />
        </div>
        <div>
          <label className="font-semibold text-slate-500 block mb-1.5">Product Name *</label>
          <input type="text" required value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Matte Perfect Foundation" className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-orange-400" />
        </div>
      </div>

      {/* Skin Type & Promotion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-semibold text-slate-500 block mb-1.5">Skin Type</label>
          <select 
            value={skinType} 
            onChange={(e) => setSkinType(e.target.value)} 
            className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-sm"
          >
            {/* 🎯 ভ্যালু ফাঁকা ("") বা "All Skin Types" দিলে ব্যাকএন্ডে স্কিমা অনুযায়ী অপশনাল হিসেবে সেভ হতে সুবিধা হবে */}
            <option value="">All Skin Types</option>
            <option value="Normal">Normal</option>
            <option value="Oily">Oily</option>
            <option value="Dry">Dry</option>
            <option value="Combination">Combination</option>
            <option value="Sensitive">Sensitive</option>
          </select>
        </div>
        <div>
          <label className="font-semibold text-slate-500 block mb-1.5">Promotion / Tag</label>
          <select 
            value={promotion} 
            onChange={(e) => setPromotion(e.target.value === "None" ? undefined : e.target.value)} 
            className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-sm"
          >
            <option value="None">None</option>
            <option value="New Arrivals">New Arrivals</option>
            <option value="Best Sellers">Best Sellers</option>
            <option value="Trending">Trending</option>
          </select>
        </div>
      </div>

      {/* Pricing & Physical Metrics */}
      <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="font-semibold text-slate-600 block mb-1 text-xs">Price (৳) *</label>
            <input type="number" required value={sellPrice} onChange={(e) => setSellPrice(e.target.value !== "" ? Number(e.target.value) : "")} className="w-full border border-slate-200 rounded-lg p-2 bg-white text-sm" />
          </div>
          <div>
            <label className="font-semibold text-slate-600 block mb-1 text-xs">Old Price (৳)</label>
            <input type="number" value={regularPrice} onChange={(e) => setRegularPrice(e.target.value !== "" ? Number(e.target.value) : "")} className="w-full border border-slate-200 rounded-lg p-2 bg-white text-sm" />
          </div>
          <div>
            <label className="font-semibold text-slate-600 block mb-1 text-xs">Weight/Vol</label>
            <input type="number" value={weightOrVolume} onChange={(e) => setWeightOrVolume(e.target.value !== "" ? Number(e.target.value) : "")} className="w-full border border-slate-200 rounded-lg p-2 bg-white text-sm" />
          </div>
          <div>
            <label className="font-semibold text-slate-600 block mb-1 text-xs">Unit</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value as 'gm' | 'ml' | 'pcs')} className="w-full border border-slate-200 rounded-lg p-2 bg-white text-sm">
              <option value="ml">ml</option>
              <option value="gm">gm</option>
              <option value="pcs">pcs</option>
            </select>
          </div>
        </div>
        
        {/* Status Toggle */}
        <div className="flex items-center justify-between max-w-xs pt-2">
          <span className="font-semibold text-slate-600 text-xs">Product Status</span>
          <button 
            type="button" 
            onClick={() => setProductStatus(productStatus === "Active" ? "Inactive" : "Active")} 
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${productStatus === "Active" ? "bg-orange-500" : "bg-slate-200"}`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${productStatus === "Active" ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* Rich Text Editors */}
      <div className="space-y-4 pt-4">
        <div>
          <label className="font-semibold text-slate-500 block mb-1">Product Description *</label>
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 prose-editor">
            <DynamicReactQuill theme="snow" value={description} onChange={setDescription} modules={editorModules} />
          </div>
        </div>
        <div>
          <label className="font-semibold text-slate-500 block mb-1">How To Use</label>
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 prose-editor">
            <DynamicReactQuill theme="snow" value={howToUse} onChange={setHowToUse} modules={editorModules} />
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useMemo, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useShades } from "@/hooks/useShades";
import { IProductShadeState, IShadeItem } from "@/types/shade.interface";
import { FiTrash, FiUpload } from "react-icons/fi";

interface ShadesConfigFormProps {
  selectedSubCategory: string; 
  shades: IProductShadeState[];
  setShades: React.Dispatch<React.SetStateAction<IProductShadeState[]>>;
  onChangeTotalStock: (total: number) => void; // 💡 প্যারেন্ট ফর্মে totalStock আপডেট করার কলব্যাক
}

export default function ShadesConfigForm({ 
  selectedSubCategory, 
  shades, 
  setShades, 
  onChangeTotalStock 
}: ShadesConfigFormProps) {
  
  const { shades: dbShadesContext, isLoading } = useShades(selectedSubCategory);

  // ১. এই সাব-ক্যাটাগরি আইটেমের সমস্ত একটিভ শেডের লিস্ট
  const availableDbShades = useMemo<IShadeItem[]>(() => {
    if (!selectedSubCategory) return [];
    const rawData = Array.isArray(dbShadesContext) ? dbShadesContext[0] : dbShadesContext;
    return (rawData?.availableShades || []).filter((s: IShadeItem) => s.status === "Active");
  }, [dbShadesContext, selectedSubCategory]);

  // 💡 ২. অটোমেটিক টোটাল স্টক কাউন্ট করে প্যারেন্ট ফর্মে পাঠানো
  useEffect(() => {
    const total = shades.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
    onChangeTotalStock(total);
  }, [shades, onChangeTotalStock]);

  // ৩. বাটনে ক্লিক করলে সিলেক্ট/ডিসিলেক্ট হওয়ার লজিক
  const handleToggleShade = (dbShade: IShadeItem) => {
    const isAlreadySelected = shades.some(
      (s) => s.shadeName.trim().toLowerCase() === dbShade.shadeName.trim().toLowerCase()
    );

    if (isAlreadySelected) {
      // ডিসিলেক্ট করার সময় তৈরি করা অবজেক্ট ইউআরএল মেমোরি থেকে রিলিজ করে দেওয়া ভালো
      const shadeToRemove = shades.find((s) => s.shadeName.trim().toLowerCase() === dbShade.shadeName.trim().toLowerCase());
      if (shadeToRemove?.shadePreview && shadeToRemove.shadePreview.startsWith("blob:")) {
        URL.revokeObjectURL(shadeToRemove.shadePreview);
      }
      setShades((prev) => prev.filter(
        (s) => s.shadeName.trim().toLowerCase() !== dbShade.shadeName.trim().toLowerCase()
      ));
    } else {
      setShades((prev) => [
        ...prev,
        {
          shadeName: dbShade.shadeName,
          shadeColorCode: dbShade.shadeColorCode,
          shadeFile: null,
          shadePreview: "", // শুরুতে কোনো ইমেজ থাকবে না
          stock: "" as const, // শুরুতে স্টক ফাঁকা থাকবে
          status: "Active" as const
        }
      ]);
    }
  };

  // ৪. নির্দিষ্ট শেডের স্টক ইনপুট চেঞ্জ হ্যান্ডেলার
  const handleStockChange = (index: number, value: string) => {
    const updated = [...shades];
    updated[index].stock = value !== "" ? Number(value) : "";
    setShades(updated);
  };

  // 💡 ৫. শেড ইমেজ ফাইল চেঞ্জ ও লাইভ প্রিভিউ হ্যান্ডেলার
  const handleShadeFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const updated = [...shades];
    
    // আগের তৈরি করা ব্লব ইউআরএল থাকলে মেমোরি ফ্রি করা
    if (updated[index].shadePreview && updated[index].shadePreview.startsWith("blob:")) {
      URL.revokeObjectURL(updated[index].shadePreview);
    }

    updated[index].shadeFile = file;
    updated[index].shadePreview = URL.createObjectURL(file); // ব্রাউজার মেমোরি প্রিভিউ
    setShades(updated);
  };

  // 💡 ৬. সিলেক্টেড শেডের ইমেজ রিমুভ করার লজিক
  const handleRemoveImage = (index: number) => {
    const updated = [...shades];
    if (updated[index].shadePreview && updated[index].shadePreview.startsWith("blob:")) {
      URL.revokeObjectURL(updated[index].shadePreview);
    }
    updated[index].shadeFile = null;
    updated[index].shadePreview = "";
    setShades(updated);
  };

  if (!selectedSubCategory) {
    return (
      <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 italic">
        Please select a "Sub Category Item" first to see available shades.
      </div>
    );
  }

  if (isLoading) return <p className="text-center py-4 animate-pulse text-slate-400 text-xs">Loading item shades...</p>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-800">Select Item Shades, Images & Enter Stock</h3>
        <p className="text-xs text-slate-400">Click to select available shades. For each selected shade, upload a specific image and assign stock.</p>
      </div>

      {/* শেড বাটন প্যানেল */}
      {availableDbShades.length === 0 ? (
        <p className="text-xs text-red-400 italic bg-red-50/50 p-3 rounded-xl border border-red-100">
          No active shades configured for "{selectedSubCategory}" in database.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2.5 max-h-[180px] overflow-y-auto p-1">
          {availableDbShades.map((dbShade, idx) => {
            const isSelected = shades.some(
              (s) => s.shadeName.trim().toLowerCase() === dbShade.shadeName.trim().toLowerCase()
            );

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleToggleShade(dbShade)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-200 select-none ${
                  isSelected
                    ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-500/30 font-semibold"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div 
                  className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0" 
                  style={{ backgroundColor: dbShade.shadeColorCode }}
                />
                <span>{dbShade.shadeName}</span>
                {isSelected && <CheckCircle2 size={14} className="text-orange-600 ml-1 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* 💡 সিলেক্টেড শেডগুলোর জন্য ইমেজ আপলোড ও স্টক ইনপুট সেকশন */}
      {shades.length > 0 && (
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <label className="text-xs font-bold text-slate-700 block">Selected Shades Specification</label>
          
          <div className="space-y-2.5">
            {shades.map((shade, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                
                {/* ১. শেড নেম এবং কালার প্রিভিউ */}
                <div className="flex items-center gap-2.5 min-w-[140px]">
                  <div className="w-4 h-4 rounded-full border shadow-sm flex-shrink-0" style={{ backgroundColor: shade.shadeColorCode }} />
                  <span className="text-xs font-bold text-slate-800">{shade.shadeName}</span>
                </div>

                {/* ২. ডেডিকেটেড শেড ইমেজ আপলোড এবং লাইভ প্রিভিউ */}
                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex-1 max-w-xs">
                  {shade.shadePreview ? (
                    <div className="relative w-10 h-10 rounded-md border bg-slate-100 overflow-hidden group flex-shrink-0">
                      <img src={shade.shadePreview} alt="shade" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                      >
                        <FiTrash size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-10 h-10 rounded-md border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors flex-shrink-0">
                      <FiUpload size={14} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        required // 💡 প্রতিটা সিলেক্টেড শেডের জন্য ইমেজ ম্যান্ডেটরি করা হলো
                        onChange={(e) => handleShadeFileChange(idx, e)} 
                        className="hidden" 
                      />
                    </label>
                  )}
                  <div className="text-[11px] text-slate-500 truncate">
                    {shade.shadeFile ? shade.shadeFile.name : "Upload specific image *"}
                  </div>
                </div>

                {/* ৩. স্টক ইনপুট ফিল্ড */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <label className="text-[11px] text-slate-500 font-medium">Stock Qty:</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Qty"
                    value={shade.stock}
                    onChange={(e) => handleStockChange(idx, e.target.value)}
                    className="w-24 p-1.5 text-center text-xs border rounded-lg bg-white focus:outline-none focus:border-orange-500 font-bold text-slate-800 shadow-sm"
                  />
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
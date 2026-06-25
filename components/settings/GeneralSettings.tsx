"use client";

import React, { useState, useEffect } from 'react';
import { Upload, ImageIcon } from 'lucide-react';

export default function GeneralSettings({ register, setValue, watch }: { register: any; setValue: any; watch: any }) {
  const logoUrl = watch('logo');
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    // যদি ডাটাবেজ থেকে অলরেডি কোনো স্ট্রিং ইউআরএল আসে
    if (logoUrl && typeof logoUrl === 'string') {
      setPreview(logoUrl);
    }
  }, [logoUrl]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault(); // 🎯 পেজ রিফ্রেশ বা ভুল রিডাইরেকশন আটকাবে
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
      
      // 💡 ফ্রন্টএন্ড ফর্মে ফাইল অবজেক্ট সেট করা হলো
      setValue('logo', file, { shouldValidate: true, shouldDirty: true }); 
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900 border-b pb-2">General Info</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* লোগো আপলোডার বক্স */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 p-5 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors relative h-44">
          {preview ? (
            <img src={preview} alt="Logo Preview" className="h-24 w-auto object-contain mb-2 rounded-xl" />
          ) : (
            <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
          )}
          
          <button type="button" className="text-xs font-bold text-indigo-600 flex items-center gap-1 pointer-events-none">
            <Upload size={14} /> Upload Logo
          </button>
          <span className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 2MB</span>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleLogoChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          />
        </div>

        {/* ইনপুট ফিল্ডস এরিয়া */}
        <div className="md:col-span-2 space-y-4">
          {/* ওয়েবসাইট নাম ফিল্ড */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Website Name</label>
            <input 
              type="text" 
              {...register('websiteName')} 
              placeholder="e.g., Sreyoshi Shop"
              className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600" 
            />
          </div>

          {/* 🎯 নতুন যুক্ত করা ফিল্ড: ওয়েবসাইট সাবটাইটেল/টাইটেল */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Website Title / Subtitle</label>
            <input 
              type="text" 
              {...register('websiteTitle')} // আপনার পছন্দমতো 'subtitle' ও দিতে পারেন
              placeholder="e.g., Your Trusted Organic Bazar & Grocery Partner"
              className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
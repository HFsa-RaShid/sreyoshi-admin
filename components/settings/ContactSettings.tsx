/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React from 'react';
import { MapPin } from 'lucide-react';

export default function ContactSettings({ register, watch }: { register: any; watch: any }) {
  const mapUrl = watch('mapEmbedUrl');

  const cleanMapUrl = (input: string) => {
    if (!input) return '';
    if (input.includes('<iframe')) {
      const match = input.match(/src="([^"]+)"/);
      return match ? match[1] : '';
    }
    return input;
  };

  const iframeSrc = cleanMapUrl(mapUrl || '');

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-900 border-b pb-2">Contact & Social Links</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
          <input type="email" {...register('email')} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
          <input type="text" {...register('phone')} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Physical Address</label>
          <textarea {...register('address')} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm h-16 focus:outline-none focus:border-indigo-600" />
        </div>

        {/* গুগল ম্যাপ এমবেড */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
            <MapPin size={14} className="text-rose-500" /> Google Map Embed Link / HTML Code
          </label>
          <input 
            type="text" 
            {...register('mapEmbedUrl')} 
            placeholder='Paste Google Map <iframe> code'
            className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 bg-slate-50/50" 
          />
          
          {iframeSrc && (
            <div className="mt-2 w-full h-44 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
              <iframe
                title="Google Map Live Preview"
                src={iframeSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
              ></iframe>
            </div>
          )}
        </div>

  
        <div><label className="block text-xs font-bold  uppercase mb-1 text-blue-600">Facebook</label><input type="text" {...register('facebookUrl')} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" /></div>
        <div><label className="block text-xs font-bold  uppercase mb-1 text-pink-600">Instagram</label><input type="text" {...register('instagramUrl')} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-500" /></div>
        <div><label className="block text-xs font-bold  uppercase mb-1 text-red-600">YouTube</label><input type="text" {...register('youtubeUrl')} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-500" /></div>
        <div><label className="block text-xs font-bold  uppercase mb-1 text-sky-700">LinkedIn</label><input type="text" {...register('linkedinUrl')} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500" /></div>
      </div>
    </div>
  );
}
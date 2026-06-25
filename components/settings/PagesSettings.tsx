import React from 'react';
import { Controller } from 'react-hook-form';
import DynamicQuill from './DynamicQuill';

export default function PagesSettings({ control }: { control: any }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-900 border-b pb-2">About us & Story Context</h2>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">About Us</label>
        <Controller name="aboutUs" control={control} render={({ field }) => <DynamicQuill value={field.value} onChange={field.onChange} />} />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Our Story (Supports Images)</label>
        <Controller name="ourStory" control={control} render={({ field }) => <DynamicQuill value={field.value} onChange={field.onChange} isStory={true} />} />
      </div>
    </div>
  );
}
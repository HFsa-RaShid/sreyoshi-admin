import React from 'react';
import { Controller } from 'react-hook-form';
import DynamicQuill from './DynamicQuill';

export default function PolicySettings({ control }: { control: any }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-900 border-b pb-2">Store Legal Node Policies</h2>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Privacy Policy</label>
        <Controller name="privacyPolicy" control={control} render={({ field }) => <DynamicQuill value={field.value} onChange={field.onChange} />} />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Terms & Conditions</label>
        <Controller name="termsConditions" control={control} render={({ field }) => <DynamicQuill value={field.value} onChange={field.onChange} />} />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Refund & Returns</label>
        <Controller name="refundPolicy" control={control} render={({ field }) => <DynamicQuill value={field.value} onChange={field.onChange} />} />
      </div>
    </div>
  );
}
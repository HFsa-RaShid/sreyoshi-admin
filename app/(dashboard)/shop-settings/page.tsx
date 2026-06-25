"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast'; 
import { useShopSettings } from '@/hooks/useShopSettings';
import GeneralSettings from '@/components/settings/GeneralSettings';
import ContactSettings from '@/components/settings/ContactSettings';
import PagesSettings from '@/components/settings/PagesSettings';
import PolicySettings from '@/components/settings/PolicySettings';
import { Settings, Save, RotateCcw, Loader2 } from 'lucide-react';

export default function ShopSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'pages' | 'policy'>('general');
  const { settings, isLoading, updateSettings, resetSettings, isSaving } = useShopSettings();
  
  const { register, handleSubmit, reset, control, watch, setValue } = useForm();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  
  const onSubmit = async (data: any) => {
  
    const loadingToastId = toast.loading('Saving configurations...');
    
    try {
      await updateSettings(data);
     
      toast.success('Settings updated successfully! ', { id: loadingToastId });
    } catch (err) {
        console.log(err);
      toast.error('Authorization or Server rejected ', { id: loadingToastId });
    }
  };

 
  const handleReset = async () => {
    const isConfirmed = window.confirm(
      'Are you sure?\nThis will purge all shop settings configurations back to default!'
    );

    if (isConfirmed) {
      const loadingToastId = toast.loading('Purging infrastructure data...');
      
      try {
        await resetSettings();
        // 🎯 সাকসেস টোস্ট
        toast.success('Configurations reset done. Reloading...', { id: loadingToastId });
        
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        toast.error('Failed to purge data ', { id: loadingToastId });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-xs text-slate-400 font-semibold">Syncing Shop Core Cluster...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-800 text-sm">
      {/* গ্লোবাল টোস্ট কন্টেইনার */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Settings className="text-indigo-600 w-6 h-6" />
          <div>
            <h1 className="text-xl font-black text-slate-900">Global Shop Infrastructure</h1>
            <p className="text-xs text-slate-400">Manage runtime metadata nodes, policy vectors, and social parameters.</p>
          </div>
        </div>
        <button 
          type="button" 
          onClick={handleReset} 
          className="px-3 py-2 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl flex items-center gap-1 hover:bg-rose-100 transition-colors"
        >
          <RotateCcw size={14} /> Purge Infrastructure
        </button>
      </div>

      <div className="flex border-b border-slate-200 bg-white p-1.5 rounded-xl gap-2 shadow-sm">
        {(['general', 'contact', 'pages', 'policy'] as const).map((tab) => (
          <button 
            key={tab} 
            type="button" 
            onClick={() => setActiveTab(tab)} 
            className={`px-4 py-2 font-bold rounded-lg transition-all capitalize text-xs ${activeTab === tab ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            {tab === 'pages' ? 'About & Our Story' : tab + ' settings'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {activeTab === 'general' && (
          <GeneralSettings register={register} setValue={setValue} watch={watch} />
        )}
        
        {activeTab === 'contact' && (
          <ContactSettings register={register} watch={watch} />
        )}
        
        {activeTab === 'pages' && <PagesSettings control={control} />}
        {activeTab === 'policy' && <PolicySettings control={control} />}

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving} 
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Save size={16} /> Compile & Update Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
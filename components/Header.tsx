"use client";

import React, { useState } from 'react';
import { Bell, Search, Menu, ChevronDown, User, LogOut, Settings } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void; // মোবাইল সাইডবার টগল করার জন্য অপশনাল প্রপ
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 h-20 flex items-center justify-between px-10 sticky top-0 z-40 shadow-sm">
      
      {/* বাম পাশ: মোবাইল মেনু বাটন এবং সার্চ বার */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        {/* মোবাইল ডিভাইসে সাইডবার ওপেন করার বাটন */}
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-50 rounded-xl lg:hidden text-gray-500 transition-colors"
        >
          <Menu size={20} />
        </button>

      
      </div>

      {/* ডান পাশ: নোটিফিকেশন এবং ইউজার প্রোফাইল */}
      <div className="flex items-center gap-4">
        
        {/* নোটিফিকেশন বাটন */}
        <button className="p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl relative transition-colors border border-gray-100">
          <Bell size={18} />
          {/* রেড ডট (নতুন নোটিফিকেশন অ্যালার্ট) */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* ডিভাইডার লাইন */}
        <div className="h-6 w-[1px] bg-gray-200 hidden sm:block"></div>

        {/* ইউজার প্রোফাইল ড্রপডাউন মেনু */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-xl transition-colors"
          >
            {/* ইউজার অ্যাভাটার প্রিভিউ */}
            <div className="w-8 h-8 rounded-lg bg-[#1E2E24] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              A
            </div>
            {/* ইউজার ইনফো (ডেস্কটপে দেখাবে) */}
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-gray-800 leading-none">Admin User</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Manager</p>
            </div>
          
          </button>

          {/* ড্রপডাউন বডি */}
          {/* {isProfileOpen && (
            <>
             
              <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
              
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <button className="w-full px-4 py-2 text-left text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2 font-medium">
                  <User size={14} /> My Profile
                </button>
                <button className="w-full px-4 py-2 text-left text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2 font-medium">
                  <Settings size={14} /> Settings
                </button>
                <hr className="my-1 border-gray-100" />
                <button className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold">
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            </>
          )} */}
        </div>

      </div>
    </header>
  );
}
"use client";

import React, { useState } from 'react';
import { Bell, Menu, ChevronDown, User, LogOut, Settings } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 h-16 md:h-20 flex items-center justify-between px-4 md:px-10 sticky top-0 z-30 shadow-xs">
      
   
      <div className="flex items-center gap-3">
  
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-50 rounded-xl lg:hidden text-slate-700 transition-colors cursor-pointer border border-gray-100"
        >
          <Menu size={20} />
        </button>
        <span className="text-xs font-bold text-slate-400 lg:hidden font-serif">Sreyoshi</span>
      </div>

      
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* নোটিফিকেশন বাটন */}
        <button className="p-2 md:p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl relative transition-colors border border-gray-100 cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="h-6 w-[1px] bg-gray-200 hidden sm:block"></div>

   
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1E2E24] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              A
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-gray-800 leading-none">Admin User</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Manager</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* প্রোফাইল ড্রপডাউন কন্টেন্ট */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 text-xs text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-gray-50 md:hidden">
                <p className="font-bold text-gray-800">Admin User</p>
                <p className="text-[10px] text-gray-400">Manager</p>
              </div>
              <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left cursor-pointer">
                <User size={14} /> My Profile
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left text-red-500 cursor-pointer">
                <LogOut size={14} /> Log Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 🎯 মোবাইল ড্রয়ার ওপেন/ক্লোজ স্টেট কন্ট্রোল
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-800">
     
      {/* 🟢 সাইডবার ড্রয়ার পার্ট (স্টেট ও ক্লোজ হ্যান্ডলার সহ) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* 🟢 মেইন ইন্টারফেস এরিয়া (ডেস্কটপে বামে lg:pl-68 স্পেস ছেড়ে দেবে) */}
      <main className="flex-1 lg:pl-68 min-h-screen transition-all duration-300">
        <div className="flex flex-col min-h-screen">
          
          {/* 🟢 গ্লোবাল হেডার (মেনু ক্লিক হ্যান্ডলার সহ) */}
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          
          {/* 动态 সাব-পেজ ভিউ (FAQ, Coupon, Users ইত্যাদি) */}
          <div className="flex-1 p-2 sm:p-4 md:p-6 w-full mx-auto">
            {children}
          </div>

        </div>
      </main>

    </div>
  );
}
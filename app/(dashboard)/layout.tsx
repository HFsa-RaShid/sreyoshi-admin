"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // ⚡ সেশন ভেরিফাই করার কাজটি মিডলওয়্যার অলরেডি ব্যাকএন্ডে সাকসেসফুলি করে ফেলেছে।
  // তাই এখানে কোনো জটিল স্টেট বা কন্ডিশনাল রিটার্ন রাখার দরকার নেই। সরাসরি লেআউট রেন্ডার হবে।
  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-800">
      {/* বামপাশের ফিক্সড সাইডবার */}
      <Sidebar />

      {/* ডানপাশের ডাইনামিক পেজ কন্টেন্ট এরিয়া */}
      <main className="flex-1 pl-64 min-h-screen">
        <div className="p-8 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
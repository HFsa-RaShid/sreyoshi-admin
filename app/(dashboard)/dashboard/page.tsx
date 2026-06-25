"use client";

import React from "react";

export default function DashboardOverview() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-serif text-gray-900">Dashboard Overview</h1>
        <p className="text-xs text-gray-400 mt-1">Welcome back! Here is what&apos;s happening with your store today.</p>
      </div>

      {/* স্ট্যাটিস্টিকস কার্ডস গ্রিড (স্যাম্পল) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Sales</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">৳1,24,500</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Products</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">456 Items</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pending Orders</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">12 Orders</h3>
        </div>
      </div>
    </div>
  );
}
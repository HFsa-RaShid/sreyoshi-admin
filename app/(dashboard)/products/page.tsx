"use client";

import React from "react";

export default function ProductsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900">Product Management</h1>
          <p className="text-xs text-gray-400 mt-1">Add, update or delete products from your catalog.</p>
        </div>
        
        <button className="bg-[#1E2E24] hover:bg-[#FF3F6C] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md">
          + Add New Product
        </button>
      </div>

      {/* ডাটা টেবিল বা ফরম বসানোর প্লেসহোল্ডার বক্স */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-xs">
        Your product table and API integration will take place here.
      </div>
    </div>
  );
}
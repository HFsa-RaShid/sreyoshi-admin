"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-800">
     
      <Sidebar />
      <main className="flex-1 pl-68 min-h-screen">
        
        <div className="">
          <Header></Header>
          {children}
        </div>
      </main>
    </div>
  );
}
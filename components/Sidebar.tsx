/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, FolderOpen, Layers, Users, LogOut, Sparkles, X, Settings, HelpCircle, Ticket } from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // সাইডবারের সমস্ত রাউটের লিস্ট এবং সঠিক আইকন ম্যাপিং
  const menuItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/orders", icon: FolderOpen },
    { name: "Categories", href: "/categories", icon: FolderOpen },
    { name: "Shades Config", href: "/shades-config", icon: Layers },
    { name: "Brands Config", href: "/brands-config", icon: Layers },
    { name: "All Products", href: "/products", icon: ShoppingBag },
    { name: "Add Products", href: "/add-products", icon: ShoppingBag },
    { name: "Delivery Charge", href: "/deliveryManagement", icon: Users },
    { name: "Users", href: "/users", icon: Users },
    { name: "Coupon", href: "/coupons", icon: Ticket },
    { name: "FAQ", href: "/faqs", icon: HelpCircle },
    { name: "Shop Settings", href: "/shop-settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {/* 🟢 ওয়ান-ক্লিক ব্যাকড্রপ ব্লার ওভারলে (মোবাইলে বাইরে ক্লিক করলে ড্রয়ার বন্ধ হবে) */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* 🟢 রেসপন্সিভ ড্রয়ার স্লাইডার */}
      <aside className={`w-68 bg-[#1E2E24] text-white h-screen fixed top-0 left-0 flex flex-col justify-between shadow-2xl font-sans transition-transform duration-300 ease-in-out z-50 lg:z-20 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        
        {/* টপ হেডার সেকশন */}
        <div>
          <div className="p-5 md:p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-amber-300">
                <Sparkles size={16} />
              </div>
              <div>
                <h1 className="text-md font-bold tracking-wide font-serif">Sreyoshi Panel</h1>
                <p className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase">Cosmetics v1.0</p>
              </div>
            </div>

            {/* মোবাইলের জন্য ক্লোজ বাটন */}
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* নেভিগেশন রুটস (স্ক্রলযোগ্য যদি আইটেম বেশি হয়) */}
          <nav className="p-4 space-y-1.5 mt-2 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={onClose} // কোনো লিংকে ক্লিক করলে ড্রয়ার নিজে থেকেই বন্ধ হবে
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive 
                      ? "bg-white text-black shadow-md shadow-white/5" 
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* লগআউট ফুটার */}
        <div className="p-4 border-t border-white/10 bg-[#17241C]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Logout System
          </button>
        </div>
      </aside>
    </>
  );
}
"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, FolderOpen, Layers, Users, LogOut, Sparkles } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // সাইডবারের সমস্ত রাউটের লিস্ট
  const menuItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Categories", href: "/categories", icon: FolderOpen },
    { name: "All Products", href: "/products", icon: ShoppingBag },
    { name: "Add Products", href: "/add-products", icon: ShoppingBag },
    { name: "Shades Config", href: "/shades-config", icon: Layers },
    { name: "Customers", href: "/customers", icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/");
  };

  return (
    <aside className="w-64 bg-[#1E2E24] text-white h-screen fixed top-0 left-0 flex flex-col justify-between z-20 shadow-xl font-sans">
      <div>
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-amber-300">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-wide font-serif">Sreyoshi Panel</h1>
            <p className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase">Cosmetics v1.0</p>
          </div>
        </div>

        {/* Navigation Routes */}
        <nav className="p-4 space-y-1.5 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  isActive 
                    ? "bg-[#FF3F6C] text-white shadow-md shadow-[#FF3F6C]/20" 
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

      {/* Logout Footer */}
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <LogOut size={16} />
          Logout System
        </button>
      </div>
    </aside>
  );
}
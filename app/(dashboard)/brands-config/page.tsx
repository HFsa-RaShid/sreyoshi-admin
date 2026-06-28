/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useBrands } from "@/hooks/useBrands";
import { FiTrash2, FiEdit2, FiSearch, FiPlus } from "react-icons/fi";
import Image from "next/image";
import BrandModal from "./BrandModal";
import toast from "react-hot-toast";

export default function BrandsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // মডাল এবং সিলেক্টেড ব্র্যান্ডের স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);

  const { brands, isLoadingBrands, deleteBrand } = useBrands();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        await deleteBrand(id);
        toast.success("Brand deleted successfully!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete brand");
      }
    }
  };

  // নতুন ব্র্যান্ড তৈরির জন্য মডাল ওপেন
  const handleAddClick = () => {
    setSelectedBrand(null); // আগের সিলেক্টেড ডাটা ক্লিন করা
    setIsModalOpen(true);
  };

  // এডিটের জন্য মডাল ওপেন
  const handleEditClick = (brand: any) => {
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const filteredBrands = brands.filter((brand: any) =>
    brand.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-6 bg-[#FAFAFA] min-h-screen text-xs sm:text-sm">
      
      {/* ─── টপ হেডার (মোবাইলে নিচে নিচে এলিমেন্ট বসবে) ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">Brand Management</h1>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Manage your official brands seamlessly.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="w-full sm:w-auto justify-center bg-[#1E2E24] hover:bg-[#FF3F6C] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <FiPlus size={14} /> Add New Brand
        </button>
      </div>

      {/* ─── মেইন কন্টেন্ট ব্লক ─── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        
        {/* সার্চ হেডার */}
        <div className="p-4 sm:p-5 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white">
          <h3 className="font-bold text-gray-700 text-sm font-serif">All Brands</h3>
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by brand name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-100 rounded-xl text-xs focus:outline-none focus:border-[#1E2E24] bg-gray-50/50"
            />
          </div>
        </div>

        {/* লোডিং ও এম্পটি কন্ডিশনাল রেন্ডারিং */}
        {isLoadingBrands ? (
          <div className="text-center p-12 text-gray-400 font-medium animate-pulse">Loading Brands...</div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center p-12 text-gray-400 font-medium">No brands found.</div>
        ) : (
          <>
            {/* 📱 ১. মোবাইল ভিউ রেসপন্সিভ কার্ডস (ডেস্কটপে হাইড থাকবে) */}
            <div className="block md:hidden divide-y divide-gray-50">
              {filteredBrands.map((brand: any) => (
                <div key={brand._id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/30 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                      <Image 
                        src={brand.logo} 
                        alt={brand.name} fill className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm truncate">{brand.name}</h4>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">{brand.slug}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${brand.status === 'Active' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                      ● {brand.status || 'Active'}
                    </span>
                    <div className="flex gap-2 text-gray-400">
                      <button 
                        onClick={() => handleEditClick(brand)}
                        className="hover:text-blue-600 p-1.5 bg-slate-50 hover:bg-blue-50 border border-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button 
                        onClick={() => handleDelete(brand._id)} 
                        className="hover:text-red-600 p-1.5 bg-slate-50 hover:bg-red-50 border border-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 💻 ২. ডেস্কটপ টেবিল ভিউ (মোবাইলে হাইড থাকবে) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    <th className='p-4 text-center w-24'>Brand Logo</th>
                    <th className="p-4">Brand Name</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4 w-32">Status</th>
                    <th className="p-4 w-24 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                  {filteredBrands.map((brand: any) => (
                    <tr key={brand._id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="p-4 text-center">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 mx-auto">
                          <Image 
                            src={brand.logo} 
                            alt={brand.name} fill className="object-cover"
                          />
                        </div>
                      </td> 
                      <td className="p-4">
                        <div className="font-bold text-gray-800 text-sm">{brand.name}</div>
                      </td>
                      <td className="p-4 text-gray-400 font-mono text-[11px]">
                        {brand.slug}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${brand.status === 'Active' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                          ● {brand.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-3 text-gray-400">
                          <button 
                            onClick={() => handleEditClick(brand)}
                            className="hover:text-blue-600 p-1 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(brand._id)} 
                            className="hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ব্র্যান্ডের সিঙ্গেল মডাল (Add ও Edit দুটোর জন্যই কাজ করবে) */}
      <BrandModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        brand={selectedBrand}
      />
    </div>
  );
}
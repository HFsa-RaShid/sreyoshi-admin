/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useBrands } from "@/hooks/useBrands";
import { FiTrash2, FiEdit2, FiSearch, FiPlus } from "react-icons/fi";
import Image from "next/image";
import BrandModal from "./BrandModal";


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
        alert("Brand deleted successfully!");
      } catch (error) {
        console.error(error);
        alert("Failed to delete brand");
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
    <div className="p-6 bg-[#FAFAFA] min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Brand Management</h1>
          <p className="text-xs text-gray-400 mt-1">Manage your official brands seamlessly.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-[#1E2E24] hover:bg-[#FF3F6C] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-colors flex items-center gap-2 shadow-md"
        >
          <FiPlus size={14} /> Add New Brand
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 text-sm font-serif">All Brands</h3>
          <div className="relative w-72">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by brand name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-100 rounded-xl text-xs focus:outline-none focus:border-[#1E2E24] bg-gray-50/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                
                <th className="p-4">Brand Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Status</th>
                <th className="p-4 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
              {isLoadingBrands ? (
                <tr><td colSpan={5} className="text-center p-12 text-gray-400 animate-pulse">Loading Brands...</td></tr>
              ) : filteredBrands.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-12 text-gray-400">No brands found.</td></tr>
              ) : (
                filteredBrands.map((brand: any) => (
                  <tr key={brand._id} className="hover:bg-gray-50/40 transition-colors">
                    {/* <td className="p-4 text-center">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 mx-auto">
                        <Image 
                          src={brand.logo} 
                          alt={brand.name} fill className="object-cover"
                        />
                      </div>
                    </td> */}
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
                          className="hover:text-blue-600 p-1 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(brand._id)} 
                          className="hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
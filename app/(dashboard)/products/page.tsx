/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { FiTrash2, FiEdit2, FiSearch, FiPlus } from "react-icons/fi";
import Image from "next/image";
import EditProductModal from "./EditProductModal";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // মডাল কন্ট্রোল করার জন্য ২ টি স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { products, isLoadingProducts, deleteProduct, refetch } = useProducts() as any;

  const handleDelete = async (productCode: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productCode);
        alert("Product deleted successfully!");
      } catch (error) {
        console.error(error);
        alert("Failed to delete product");
      }
    }
  };

  // এডিট বাটনে ক্লিক করলে এই ফাংশনটি মডাল ওপেন করবে এবং ডাটা পাস করবে
  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const filteredProducts = products?.filter((product: any) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-3 sm:p-6 bg-[#FAFAFA] min-h-screen text-xs sm:text-sm">
      
      {/* ─── টপ হেডার (মোবাইলে নিচে নিচে এলিমেন্ট বসবে) ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">Product Management</h1>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Manage your catalog seamlessly.</p>
        </div>
        <Link href="/add-products" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto justify-center bg-[#1E2E24] hover:bg-[#FF3F6C] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-colors flex items-center gap-2 shadow-xs cursor-pointer">
            <FiPlus size={14} /> Add New Product
          </button>
        </Link>
      </div>

      {/* ─── কন্টেন্ট কন্টেইনার ─── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
        
        {/* সার্চ হেডার */}
        <div className="p-4 sm:p-5 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white">
          <h3 className="font-bold text-gray-700 text-sm font-serif">All Products</h3>
          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-100 rounded-xl text-xs focus:outline-none focus:border-[#1E2E24] bg-gray-50/50"
            />
          </div>
        </div>

        {/* লোডিং ও এম্পটি কন্ডিশনাল রেন্ডারিং */}
        {isLoadingProducts ? (
          <div className="text-center p-12 text-gray-400 font-medium animate-pulse">Loading Products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-12 text-gray-400 font-medium">No products found.</div>
        ) : (
          <>
            {/* 📱 ১. মোবাইল ভিউ রেসপন্সিভ লিস্ট (ডেস্কটপে হাইড থাকবে) */}
            <div className="block md:hidden divide-y divide-gray-50">
              {filteredProducts.map((product: any) => (
                <div key={product.productCode} className="p-4 flex gap-3 hover:bg-slate-50/30 transition">
                  {/* প্রোডাক্ট ইমেজ */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                    <Image 
                      src={product.commonImages?.[0] || "/placeholder.png"} 
                      alt="product" fill className="object-cover"
                    />
                  </div>

                  {/* প্রোডাক্ট মেটা ডিটেইলস */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-2 leading-tight">{product.name}</h4>
                      <span className={`inline-flex items-center shrink-0 gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${product.status === 'Active' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                        ● {product.status || 'Active'}
                      </span>
                    </div>

                    <div className="text-[10px] text-gray-400 font-mono">Code: {product.productCode}</div>
                    
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold text-gray-600">
                          {typeof product.category === 'object' ? product.category?.name : product.category}
                        </span>
                      </div>
                      <div className="font-black text-gray-900 text-xs">৳{product.price || product.regularPrice}</div>
                    </div>

                    {/* মোবাইল অ্যাকশন বোতাম */}
                    <div className="flex justify-end gap-3 pt-2 text-gray-400 border-t border-dashed border-gray-50 mt-2">
                      <button 
                        onClick={() => handleEditClick(product)}
                        className="hover:text-blue-600 flex items-center gap-1 text-[11px] p-1.5 bg-slate-50 hover:bg-blue-50 border border-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <FiEdit2 size={12} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product.productCode)} 
                        className="hover:text-red-600 flex items-center gap-1 text-[11px] p-1.5 bg-slate-50 hover:bg-red-50 border border-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <FiTrash2 size={12} /> Delete
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
                    <th className="p-4 w-16 text-center">Image</th>
                    <th className="p-4">Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4 w-32">Status</th>
                    <th className="p-4 w-24 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                  {filteredProducts.map((product: any) => (
                    <tr key={product.productCode} className="hover:bg-gray-50/40 transition-colors">
                      <td className="p-4 text-center">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 mx-auto">
                          <Image 
                            src={product.commonImages?.[0] || "/placeholder.png"} 
                            alt="product" fill className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800 text-sm">{product.name}</div>
                        <div className="text-[10px] text-gray-400">Code: {product.productCode}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] uppercase font-medium">
                          {typeof product.category === 'object' ? product.category?.name : product.category}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-900">৳{product.price || product.regularPrice}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${product.status === 'Active' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                          ● {product.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-3 text-gray-400">
                          <button 
                            onClick={() => handleEditClick(product)}
                            className="hover:text-blue-600 p-1 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.productCode)} 
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

      {/* এডিট প্রোডাক্ট মডাল */}
      <EditProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct}
        onSuccess={() => refetch?.()} // এডিট সফল হলে ডাটা রিফ্রেশ করবে
      />
    </div>
  );
}
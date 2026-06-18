// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import Link from "next/link";
// import React, { useState } from "react";
// import { useProducts } from "@/hooks/useProducts";
// import { FiTrash2, FiEdit2, FiSearch, FiPlus } from "react-icons/fi";
// import Image from "next/image";

// export default function ProductsPage() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const { products, isLoadingProducts, deleteProduct } = useProducts();

//   const handleDelete = async (productCode: string) => {
//     if (window.confirm("Are you sure you want to delete this product?")) {
//       try {
//         await deleteProduct(productCode);
//         alert("Product deleted successfully!");
//       } catch (error) {
//         console.error(error);
//         alert("Failed to delete product");
//       }
//     }
//   };

//   const filteredProducts = products.filter((product: any) =>
//     product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     product.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="p-6 bg-[#FAFAFA] min-h-screen">
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 font-serif">Product Management</h1>
//           <p className="text-xs text-gray-400 mt-1">Manage your catalog seamlessly.</p>
//         </div>
//         <Link href="/add-products">
//           <button className="bg-[#1E2E24] hover:bg-[#FF3F6C] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-colors flex items-center gap-2 shadow-md">
//             <FiPlus size={14} /> Add New Product
//           </button>
//         </Link>
//       </div>

//       <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
//         <div className="p-5 border-b border-gray-50 flex justify-between items-center">
//           <h3 className="font-bold text-gray-700 text-sm font-serif">All Products</h3>
//           <div className="relative w-72">
//             <FiSearch className="absolute left-3 top-3 text-gray-400" />
//             <input 
//               type="text" 
//               placeholder="Search by name or code..." 
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-9 pr-4 py-2 border border-gray-100 rounded-xl text-xs focus:outline-none focus:border-[#1E2E24] bg-gray-50/50"
//             />
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
//                 <th className="p-4 w-16 text-center">Image</th>
//                 <th className="p-4">Details</th>
//                 <th className="p-4">Category</th>
//                 <th className="p-4">Price</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4 w-24 text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
//               {isLoadingProducts ? (
//                 <tr><td colSpan={6} className="text-center p-12 text-gray-400 animate-pulse">Loading...</td></tr>
//               ) : filteredProducts.length === 0 ? (
//                 <tr><td colSpan={6} className="text-center p-12 text-gray-400">No products found.</td></tr>
//               ) : (
//                 filteredProducts.map((product: any) => (
//                   <tr key={product.productCode} className="hover:bg-gray-50/40 transition-colors">
                    
//                     {/* Product Image */}
//                     <td className="p-4 text-center">
//                       <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 mx-auto">
//                         <Image 
//                           src={product.commonImages?.[0] || "/placeholder.png"} 
//                           alt="product" 
//                           fill 
//                           className="object-cover"
//                         />
//                       </div>
//                     </td>

//                     {/* Details */}
//                     <td className="p-4">
//                       <div className="font-bold text-gray-800 text-sm">{product.name}</div>
//                       <div className="text-[10px] text-gray-400">Code: {product.productCode}</div>
//                     </td>

//                     {/* Category (💡 অবজেক্ট চেক ফিক্স করা হয়েছে) */}
//                     <td className="p-4">
//                       <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] uppercase font-medium">
//                         {typeof product.category === 'object' ? product.category?.name : product.category}
//                       </span>
//                     </td>

//                     {/* Price */}
//                     <td className="p-4 font-bold text-gray-900">৳{product.price || product.regularPrice}</td>

//                     {/* Status */}
//                     <td className="p-4">
//                       <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${product.status === 'Active' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
//                         ● {product.status || 'Active'}
//                       </span>
//                     </td>

//                     {/* Actions */}
//                    <td className="p-4 text-center">
//   <div className="flex justify-center gap-3 text-gray-400">
    
//     {/* 💡 এডিট বাটন: এখন আর Link নেই, সরাসরি handleEditClick ফাংশন কল হবে */}
//     <button 
//       onClick={() => handleEditClick(product)}
//       className="hover:text-blue-600 p-1 hover:bg-blue-50 rounded-lg transition-colors"
//       title="Edit Product"
//     >
//       <FiEdit2 size={14} />
//     </button>

//     {/* ডিলিট বাটন */}
//     <button 
//       onClick={() => handleDelete(product.productCode)} 
//       className="hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors"
//       title="Delete Product"
//     >
//       <FiTrash2 size={14} />
//     </button>

//   </div>
// </td>

//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

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
  
  // 💡 মডাল কন্ট্রোল করার জন্য ২ টি স্টেট
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

  // 💡 এডিট বাটনে ক্লিক করলে এই ফাংশনটি মডাল ওপেন করবে এবং ডাটা পাস করবে
  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter((product: any) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#FAFAFA] min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Product Management</h1>
          <p className="text-xs text-gray-400 mt-1">Manage your catalog seamlessly.</p>
        </div>
        <Link href="/add-products">
          <button className="bg-[#1E2E24] hover:bg-[#FF3F6C] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-colors flex items-center gap-2 shadow-md">
            <FiPlus size={14} /> Add New Product
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 text-sm font-serif">All Products</h3>
          <div className="relative w-72">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or code..." 
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
                <th className="p-4 w-16 text-center">Image</th>
                <th className="p-4">Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
              {isLoadingProducts ? (
                <tr><td colSpan={6} className="text-center p-12 text-gray-400 animate-pulse">Loading...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-12 text-gray-400">No products found.</td></tr>
              ) : (
                filteredProducts.map((product: any) => (
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
                        {/* 💡 এখানে onClick-এ মডাল ফাংশনটি কল করা হয়েছে */}
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="hover:text-blue-600 p-1 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(product.productCode)} className="hover:text-red-600 p-1 hover:bg-red-50 rounded-lg"><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 💡 এই মডাল কম্পোনেন্টটি টেবিলের বাইরে একদম নিচে বসিয়ে দিন */}
      <EditProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct}
        onSuccess={() => refetch?.()} // এডিট সফল হলে ডাটা রিফ্রেশ করবে
      />
    </div>
  );
}
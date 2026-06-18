/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useBrands } from "@/hooks/useBrands"; // আপনার সঠিক হুক পাথ দিন
import { FiX } from "react-icons/fi";

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: any; // যদি থাকে তবে 'Edit' মোড, না থাকলে 'Add' মোড
}

export default function BrandModal({ isOpen, onClose, brand }: BrandModalProps) {
  const { addBrand, updateBrand } = useBrands();
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // এডিট মোড হলে আগের ডাটা ফিল্ডে বসানোর জন্য
  useEffect(() => {
    if (brand) {
      setName(brand.name || "");
      setStatus(brand.status || "Active");
    } else {
      setName("");
      setStatus("Active");
      setLogoFile(null);
    }
  }, [brand, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("status", status);
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (brand) {
        // Update Mode
        await updateBrand({ id: brand._id, data: formData });
        alert("Brand updated successfully!");
      } else {
        // Add Mode
        await addBrand(formData);
        alert("Brand added successfully!");
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 font-serif mb-4">
          {brand ? "Edit Brand" : "Add New Brand"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Brand Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gucci, Sreyoshi"
              className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-xs focus:outline-none focus:border-[#1E2E24] bg-gray-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Brand Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-xs focus:outline-none focus:border-[#1E2E24] bg-gray-50/50"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1E2E24] hover:bg-[#FF3F6C] text-white py-3 rounded-xl text-xs font-bold uppercase transition-colors shadow-md mt-2"
          >
            {isSubmitting ? "Processing..." : brand ? "Update Brand" : "Save Brand"}
          </button>
        </form>
      </div>
    </div>
  );
}
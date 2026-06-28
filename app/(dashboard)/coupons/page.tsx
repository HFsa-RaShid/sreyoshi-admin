/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Loader2, Ticket, X, Check } from "lucide-react";
import { useCoupons, ICoupon } from "@/hooks/useCoupons"; 
import toast from "react-hot-toast";

export default function CouponManagement() {
  const { coupons, isLoading, isSaving, addCoupon, updateCoupon, deleteCoupon } = useCoupons();

  // ফর্ম ওপেন/ক্লোজ এবং ডেটা ট্র্যাকিং স্টেট
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);

  // ইনপুট ফিল্ড স্টেট
  const [code, setCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState<number | "">("");
  const [minOrderAmount, setMinOrderAmount] = useState<number | "">("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | "">("");
  const [expiryDate, setExpiryDate] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  // এডিট বাটনে ক্লিক করলে ফিল্ডগুলো পপুলেট হবে
  const handleOpenEdit = (coupon: ICoupon) => {
    setSelectedCoupon(coupon);
    setCode(coupon.code);
    setDiscountPercentage(coupon.discountPercentage);
    setMinOrderAmount(coupon.minOrderAmount);
    setMaxDiscountAmount(coupon.maxDiscountAmount);
    
    if (coupon.expiryDate) {
      const dateStr = new Date(coupon.expiryDate).toISOString().split("T")[0];
      setExpiryDate(dateStr);
    } else {
      setExpiryDate("");
    }
    
    setStatus(coupon.status);
    setIsFormOpen(true);

    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  // অ্যাড নিউ বাটনে ক্লিক করলে ফর্ম ক্লিন হবে
  const handleOpenAdd = () => {
    setSelectedCoupon(null);
    setCode("");
    setDiscountPercentage("");
    setMinOrderAmount("");
    setMaxDiscountAmount("");
    setExpiryDate("");
    setStatus("Active");
    setIsFormOpen(true);

    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCoupon(null);
    setCode("");
    setDiscountPercentage("");
    setMinOrderAmount("");
    setMaxDiscountAmount("");
    setExpiryDate("");
  };

  // কুপন স্ট্যাটাস টগল হ্যান্ডলার
  const handleToggleStatus = async (coupon: ICoupon) => {
    if (!coupon._id) return;
    const newStatus = coupon.status === "Active" ? "Inactive" : "Active";
    try {
      await updateCoupon({ id: coupon._id, data: { status: newStatus } });
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // কুপন ডিলিট হ্যান্ডলার
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      try {
        await deleteCoupon(id);
        if (selectedCoupon?._id === id) handleCloseForm();
        toast.success("Coupon deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete coupon");
      }
    }
  };

  // ফর্ম সাবমিট হ্যান্ডলার (ক্রিয়েট ও আপডেট)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountPercentage || !minOrderAmount || !maxDiscountAmount || !expiryDate) {
      toast.error("Please fill all required fields!");
      return;
    }

    const payload = {
      code: code.toUpperCase().trim(),
      discountPercentage: Number(discountPercentage),
      minOrderAmount: Number(minOrderAmount),
      maxDiscountAmount: Number(maxDiscountAmount),
      expiryDate: new Date(expiryDate),
      status,
    };

    try {
      if (selectedCoupon?._id) {
        await updateCoupon({ id: selectedCoupon._id, data: payload });
        toast.success("Coupon updated successfully!");
      } else {
        await addCoupon(payload);
        toast.success("Coupon created successfully!");
      }
      handleCloseForm();
    } catch (err) {
      toast.error("Something went wrong while saving coupon!");
    }
  };

  return (
    <div className="p-2 md:p-6 space-y-6 text-xs bg-[#FAFAFA] min-h-screen">
      
      {/* 🎯 ১. TOP HEADER PANEL (মোবাইলে নিচে নিচে, বড় স্ক্রিনে পাশাপাশি) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2 font-serif">
            <Ticket className="text-orange-500 shrink-0" size={22} /> Coupon Management
          </h1>
          <p className="text-gray-400 mt-0.5">Manage promotional codes and discount systems</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1.5 bg-[#1E2E24] text-white font-bold px-4 py-3 sm:py-2.5 rounded-xl transition-colors shadow-sm w-full sm:w-auto cursor-pointer uppercase tracking-wider"
          >
            <Plus size={16} /> Add New Coupon
          </button>
        )}
      </div>

      {/* DATA RENDER PANEL */}
      {isLoading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="animate-spin text-slate-700" size={24} />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl bg-white text-slate-400 font-medium">
          No coupons found in database. Click &apos;Add New Coupon&apos; to get started.
        </div>
      ) : (
        <>
          {/* 🎯 ২. মোবাইল মোড: রেসপন্সিভ কুপন কার্ড ভিউ (md স্ক্রিনের নিচে টেবিল হাইড) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {coupons.map((coupon) => (
              <div 
                key={coupon._id}
                className={`p-4 rounded-2xl border bg-white shadow-xs space-y-3 transition-all ${
                  selectedCoupon?._id === coupon._id ? "border-orange-200 bg-orange-50/10" : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg border font-bold text-slate-700 font-mono tracking-wider">
                    {coupon.code}
                  </span>
                  <span className="font-extrabold text-red-500 text-sm">
                    {coupon.discountPercentage}% OFF
                  </span>
                </div>

                {/* কন্ডিশনাল সেটিংস গ্রিড */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-gray-50 text-[10px]">
                  <div>
                    <span className="text-gray-400 block mb-0.5">Min Order</span>
                    <span className="font-bold text-slate-700">৳{coupon.minOrderAmount}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Max Discount</span>
                    <span className="font-bold text-slate-700">৳{coupon.maxDiscountAmount}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Expiry</span>
                    <span className="font-bold text-slate-600">
                      {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString("en-GB") : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  {/* স্ট্যাটাস টগল */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Status:</span>
                    <button
                      onClick={() => handleToggleStatus(coupon)}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        coupon.status === "Active" ? "bg-[#1E2E24]" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                          coupon.status === "Active" ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* অ্যাকশন বাটনসমূহ */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(coupon)}
                      className="p-2 border border-gray-100 bg-white text-slate-500 hover:text-orange-500 rounded-xl cursor-pointer"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => coupon._id && handleDelete(coupon._id)}
                      className="p-2 border border-gray-100 bg-white text-slate-400 hover:text-red-500 rounded-xl cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 🎯 ৩. ডেস্কটপ মোড: ওল্ড চওড়া টেবিল ভিউ (`hidden md:block`) */}
          <div className="hidden md:block bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider select-none text-[10px]">
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Discount Details</th>
                  <th className="p-4">Min Order</th>
                  <th className="p-4">Max Discount</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4 w-28 text-center">Status</th>
                  <th className="p-4 w-28 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {coupons.map((coupon) => (
                  <tr 
                    key={coupon._id} 
                    className={`transition-colors ${
                      selectedCoupon?._id === coupon._id ? "bg-orange-50/30" : "hover:bg-slate-50/20"
                    }`}
                  >
                    <td className="p-4 font-bold text-slate-800 tracking-wider">
                      <span className="bg-slate-100/80 px-2.5 py-1 rounded-md border border-gray-200 text-xs text-slate-700 font-mono">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-red-500 text-sm">
                      {coupon.discountPercentage}% OFF
                    </td>
                    <td className="p-4 text-slate-600 font-bold">
                      ৳{coupon.minOrderAmount}
                    </td>
                    <td className="p-4 text-slate-600 font-bold">
                      ৳{coupon.maxDiscountAmount}
                    </td>
                    <td className="p-4 text-slate-500 font-semibold">
                      {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString("en-GB") : "N/A"}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(coupon)}
                        className={`mx-auto w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                          coupon.status === "Active" ? "bg-[#1E2E24]" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                            coupon.status === "Active" ? "translate-x-4" : ""
                        }`}
                        />
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(coupon)}
                          className={`p-2 rounded-lg border bg-white shadow-2xs transition-all cursor-pointer ${
                            selectedCoupon?._id === coupon._id 
                              ? "text-orange-500 border-orange-200 bg-orange-50/50" 
                              : "text-slate-500 hover:text-[#1E2E24]"
                          }`}
                          title="Edit Coupon"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => coupon._id && handleDelete(coupon._id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg border bg-white shadow-2xs transition-all cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 size={13} />
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

      {/* 💡 ৪. ডাইনামিক ইন-লাইন ফর্ম সেকশন (রেসপন্সিভ কলাম ডিজাইন) */}
      {isFormOpen && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          {/* FORM HEADER */}
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {selectedCoupon ? "Modify Coupon Configs" : "Launch New Coupon Configs"}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Define conditions for checkout cart validation</p>
            </div>
            <button 
              onClick={handleCloseForm} 
              className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* FORM BODY */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              
              {/* PRIMARY INPUT FIELDS (মোবাইলে ১ কলাম, বড় স্ক্রিনে ২ কলাম) */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-500 block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., WINTER50"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-orange-400 bg-white uppercase font-bold tracking-wider font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-500 block mb-1">Discount Percentage (%) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    placeholder="e.g., 15"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 outline-none bg-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-500 block mb-1">Minimum Order Amount (৳) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g., 1000"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 outline-none bg-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-500 block mb-1">Maximum Discount Amount (৳) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g., 250"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 outline-none bg-white text-xs font-bold"
                  />
                </div>
              </div>

              {/* CONTROLS AND ACTIONS SECTION (মোবাইলে নিচে ফ্লুইড কলাম লেআউট) */}
              <div className="space-y-4 w-full">
                <div className="bg-slate-50/70 border border-gray-100 rounded-xl p-4 space-y-3">
                  <span className="font-bold text-slate-700 block">Validity Settings</span>
                  
                  {/* EXPIRY DATE */}
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2 outline-none bg-white text-slate-700 font-bold text-xs cursor-pointer"
                    />
                  </div>

                  {/* TOGGLE STATUS */}
                  <div className="flex items-center justify-between bg-white border border-gray-100 p-2.5 rounded-lg shadow-2xs">
                    <span className="font-bold text-slate-600">Active Status</span>
                    <button
                      type="button"
                      onClick={() => setStatus(status === "Active" ? "Inactive" : "Active")}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        status === "Active" ? "bg-[#1E2E24]" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                          status === "Active" ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 bg-white font-bold hover:bg-slate-50 transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-colors flex items-center justify-center gap-1.5 disabled:bg-slate-300 cursor-pointer"
                  >
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check size={14} />}
                    {selectedCoupon ? "Update" : "Save"}
                  </button>
                </div>
              </div>

            </div>
          </form>
        </div>
      )}

    </div>
  );
}
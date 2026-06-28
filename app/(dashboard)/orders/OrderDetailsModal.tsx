/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { X, User, ShoppingBag, CreditCard, MapPin, Package } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts'; // 🎯 তোমার তৈরি করা হুক ইম্পোর্ট
import { IOrderResponse } from '@/types/order.interface';

interface OrderDetailsModalProps {
  isOpen: boolean;
  order: IOrderResponse | null;
  onClose: () => void;
}

export default function OrderDetailsModal({ isOpen, order, onClose }: OrderDetailsModalProps) {
  // 🎯 গ্লোবাল প্রোডাক্ট লিস্ট একবারে নিয়ে আসা (TanStack Query ক্যাশ থেকে অটো রিড করবে)
  const { products } = useProducts();

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-250 text-xs sm:text-sm text-slate-800">
        
        {/* ─── মডাল হেডার ─── */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 truncate">
              <Package size={20} className="text-indigo-600 shrink-0" /> Invoice Details
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-mono tracking-wide truncate">ID: {order._id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── মডাল বডি ─── */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* ১. কাস্টমার ও শিপিং ইনফো */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200/60 space-y-2.5">
            <h3 className="font-extrabold text-slate-500 text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-2">
              <User size={13} className="text-indigo-600" /> Shipping Address Details
            </h3>
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-100 space-y-2 shadow-2xs">
              <p className="text-slate-900 font-bold text-base sm:text-lg">{order.shippingAddress?.name}</p>
              
              <p className="font-mono text-base sm:text-lg font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block select-all">
                📞 {order.shippingAddress?.phone}
              </p>
              
              <div className="h-[1px] bg-slate-100 my-1.5"></div>
              
              <div className="text-slate-700 leading-relaxed font-medium">
                <span className="font-bold text-slate-400 block text-[10px] uppercase mb-0.5">Full Address:</span>
                <span className="select-all text-slate-800 text-xs sm:text-sm font-semibold">
                  {order.shippingAddress?.address}, {order.shippingAddress?.city}
                </span>
              </div>
            </div>
          </div>

          {/* ২. প্রোডাক্টস তালিকা */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-500 text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag size={13} className="text-pink-600" /> Items ({order.orderItems?.length})
            </h3>

            <div className="space-y-3">
              {order.orderItems?.map((item: any, idx: number) => {
                // প্রোডাক্ট আইডি এক্সট্র্যাক্ট করা হচ্ছে
                const pId = item.product && typeof item.product === 'object' 
                  ? (item.product?.$oid || item.product?._id) 
                  : String(item.product);
                
                // 🎯 এন+১ কোয়েরি লুপ বাদ দিয়ে, সরাসরি ম্যাপ/ফাইন্ড করা হচ্ছে গ্লোবাল এপিআই স্টেট থেকে
                const liveProduct = products?.find((p: any) => p._id === pId);
                
                const productName = liveProduct?.name || `Product (ID: ${pId})`;
                const productCode = liveProduct?.productCode || "UNKNOWN";
                
                // শেড ডাটাবেজ থেকে ম্যাচ করা
                const matchedShade = liveProduct?.shades?.find(
                  (s: any) => s.shadeName?.toLowerCase()?.trim() === item.shadeName?.toLowerCase()?.trim()
                );

                let shadeColor = "#c53087"; 
                if (matchedShade && matchedShade.shadeColorCode) {
                  shadeColor = matchedShade.shadeColorCode;
                }

                // ইমেজ ফলব্যাক লজিক
                let mainImage = "https://res.cloudinary.com/dlrtn16cy/image/upload/v1782188102/sreyoshi-backend/q0om93ixdc6at0l4kw5f.jpg";
                if (matchedShade && matchedShade.shadeImage) {
                  mainImage = matchedShade.shadeImage; 
                } else if (liveProduct?.commonImages && liveProduct.commonImages.length > 0) {
                  mainImage = liveProduct.commonImages[0]; 
                }

                return (
                  <div key={idx} className="p-3 sm:p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 hover:shadow-2xs transition-all relative">
                    
                    <div className="flex sm:block items-center gap-3 w-full sm:w-auto">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-lg overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center shadow-2xs">
                        <img src={mainImage} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="sm:hidden">
                        <span className="bg-slate-900 text-white font-mono px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">
                          CODE: {productCode}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1 w-full min-w-0">
                      <div className="hidden sm:flex items-center gap-2">
                        <span className="bg-slate-900 text-white font-mono px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">
                          CODE: {productCode}
                        </span>
                      </div>
                      
                      <p className="font-bold text-sm sm:text-base text-slate-900 tracking-tight select-all leading-snug">
                        {productName}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium pt-0.5">
                        {item.shadeName && item.shadeName !== "NoShade" ? (
                          <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            <span className="text-slate-400">Shade:</span>
                            <div className="font-bold text-slate-700 uppercase flex items-center gap-1 font-mono">
                              <span 
                                className="w-3 h-3 rounded-full border border-black/10 block shadow-3xs shrink-0" 
                                style={{ backgroundColor: shadeColor }} 
                              />
                              <span>{item.shadeName}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Standard Variant</span>
                        )}
                        <span className="text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          Unit: <b className="text-slate-800 font-mono">৳{item.price}</b>
                        </span>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex justify-end sm:block shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-dashed border-slate-100">
                      <div className="bg-rose-50 text-rose-600 px-3 py-1 sm:py-2.5 rounded-xl text-center border border-rose-100 shadow-3xs flex sm:flex-col items-center gap-1.5 sm:gap-0 min-w-[90px] sm:min-w-[70px] justify-center">
                        <p className="text-[9px] uppercase font-black tracking-wider text-rose-400 leading-none">Qty</p>
                        <p className="text-sm sm:text-xl font-black font-mono leading-none">0{item.quantity}</p>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* ৩. গেটওয়ে ইনফো */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 border border-slate-200 bg-white rounded-xl space-y-0.5 shadow-2xs">
              <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={13} /> Gateway TXID
              </p>
              <p className="font-mono font-bold text-indigo-600 text-xs sm:text-sm select-all pt-0.5 truncate">{order.transactionId}</p>
            </div>
            <div className="p-3.5 border border-slate-200 bg-white rounded-xl space-y-0.5 shadow-2xs">
              <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={13} /> Method & Status
              </p>
              <p className="font-bold text-slate-800 font-mono text-xs sm:text-sm pt-0.5 truncate">
                {order.paymentMethod} — <span className={`font-extrabold ${order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-rose-500'}`}>{order.paymentStatus}</span>
              </p>
            </div>
          </div>

        </div>

        {/* ─── মডাল ফুটার ─── */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Grand Total</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 font-mono tracking-tight">৳{order.totalPrice}</p>
          </div>
          <button 
            onClick={onClose} 
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-98 cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
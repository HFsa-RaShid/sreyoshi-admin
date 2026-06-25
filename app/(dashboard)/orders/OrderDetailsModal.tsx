/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import { X, User, ShoppingBag, CreditCard, MapPin, Package, Loader2 } from 'lucide-react';
import { getSession } from 'next-auth/react';
import axios from 'axios';
import { IOrderResponse } from '@/types/order.interface';

interface OrderDetailsModalProps {
  isOpen: boolean;
  order: IOrderResponse | null;
  onClose: () => void;
}

export default function OrderDetailsModal({ isOpen, order, onClose }: OrderDetailsModalProps) {
  const [productDetails, setProductDetails] = useState<Record<string, any>>({});
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

  useEffect(() => {
    const fetchMissingProductData = async () => {
      if (!isOpen || !order || !order.orderItems) return;
      
      setLoadingProducts(true);
      const detailsMap: Record<string, any> = {};

      try {
        const session: any = await getSession();
        const token = session?.user?.accessToken;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        for (const item of order.orderItems) {
          let pId = "";
          if (item.product && typeof item.product === 'object') {
            pId = (item.product as any).$oid || (item.product as any)._id || "";
          } else {
            pId = String(item.product);
          }
          
          if (pId && !detailsMap[pId]) {
            try {
              const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/products/${pId}`, { headers });
              if (res.data?.success && res.data?.data) {
                detailsMap[pId] = res.data.data; 
              }
            } catch (singleProdError) {
              console.warn(`Fallback active for product ${pId}`);
            }
          }
        }
        setProductDetails(detailsMap);
      } catch (error) {
        console.error("Fetching error:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchMissingProductData();
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-sm text-slate-800">
        
        {/* ─── মডাল হেডার ─── */}
        <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package size={22} className="text-indigo-600" /> Invoice & Delivery Details
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono tracking-wide">ID: {order._id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* ─── মডাল বডি ─── */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* ১. কাস্টমার ও শিপিং ইনফো */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 space-y-3">
            <h3 className="font-extrabold text-slate-500 text-xs uppercase tracking-wider flex items-center gap-2">
              <User size={14} className="text-indigo-600" /> Shipping Address Details
            </h3>
            <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3 text-base shadow-sm">
              <p className="text-slate-900 font-bold text-lg">{order.shippingAddress?.name}</p>
              
              <p className="font-mono text-xl font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block select-all">
                📞 {order.shippingAddress?.phone}
              </p>
              
              <div className="h-[1px] bg-slate-100 my-2"></div>
              
              <p className="text-slate-700 leading-relaxed font-medium">
                <span className="font-bold text-slate-900 block text-xs uppercase text-slate-400 mb-1">Full Address:</span>
                <span className="select-all text-slate-800 text-md font-semibold">
                  {order.shippingAddress?.address}, {order.shippingAddress?.city}
                </span>
              </p>
            </div>
          </div>

          {/* ২. প্রোডাক্টস তালিকা */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-500 text-xs uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag size={14} className="text-pink-600" /> Items To Be Dispatched ({order.orderItems?.length})
            </h3>

            {loadingProducts ? (
              <div className="p-10 flex flex-col items-center justify-center gap-3 border border-dashed rounded-xl bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                <span className="text-xs text-slate-500 font-medium">Synchronizing live product assets...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {order.orderItems?.map((item: any, idx: number) => {
                  const pId = item.product && typeof item.product === 'object' 
                    ? (item.product?.$oid || item.product?._id) 
                    : String(item.product);
                  
                  const liveProduct = productDetails[pId];

                  let productName = liveProduct?.name;
                  let productCode = liveProduct?.productCode;
                  
                  // ১. ডাটাবেজ থেকে শেড খোঁজা
                  const matchedShade = liveProduct?.shades?.find(
                    (s: any) => s.shadeName?.toLowerCase()?.trim() === item.shadeName?.toLowerCase()?.trim()
                  );

                  // 🎯 ২. কালার কোড ডিফাইন (এখানে ট্রিক ফিক্স করা হয়েছে)
                  let shadeColor = "#c53087"; // ডিফল্ট আপনার পিংক কোড
                  if (matchedShade && matchedShade.shadeColorCode) {
                    shadeColor = matchedShade.shadeColorCode;
                  }

                  // ৩. ডাইনামিক ইমেজ লজিক
                  let mainImage = "";
                  if (matchedShade && matchedShade.shadeImage) {
                    mainImage = matchedShade.shadeImage; 
                  } else if (liveProduct?.commonImages && liveProduct.commonImages.length > 0) {
                    mainImage = liveProduct.commonImages[0]; 
                  } else {
                    mainImage = "https://res.cloudinary.com/dlrtn16cy/image/upload/v1782188102/sreyoshi-backend/q0om93ixdc6at0l4kw5f.jpg";
                  }

                  // হার্ডকোড ফিল্টার সিকিউরিটি
                  if (pId === "6a3a085780998bf8b4b73052") {
                    productName = productName || "fdvdsf";
                    productCode = productCode || "zdxc";
                    if (!matchedShade) {
                      mainImage = "https://res.cloudinary.com/dlrtn16cy/image/upload/v1782189988/sreyoshi-backend/yaf5dp6yops47leljeil.jpg";
                    }
                  } else {
                    productName = productName || `Product (ID: ${pId})`;
                    productCode = productCode || "UNKNOWN";
                  }

                  return (
                    <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-4 hover:shadow-md transition-all">
                      
                      {/* প্রোডাক্ট ইমেজ */}
                      <div className="w-20 h-20 bg-slate-50 rounded-lg overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center shadow-sm">
                        <img src={mainImage} alt="Ordered Variant" className="w-full h-full object-cover" />
                      </div>

                      {/* প্রোডাক্ট ডক */}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-900 text-white font-mono px-2 py-0.5 rounded text-xs font-bold tracking-wide">
                            CODE: {productCode}
                          </span>
                        </div>
                        
                        <p className="font-extrabold text-base text-slate-900 tracking-tight select-all">
                          {productName}
                        </p>
                        
                        {/* শেড ও অরিজিনাল কালার কোড ব্যাজ */}
                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium pt-1">
                          {item.shadeName && item.shadeName !== "NoShade" ? (
                            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                              <span className="text-slate-500">Shade:</span>
                              <div className="font-bold text-slate-800 uppercase flex items-center gap-1.5 font-mono">
                                {/* 🎯 কালার সার্কেল ফিক্সড ইনলাইন সিএসএস */}
                                <span 
                                  className="w-4 h-4 rounded-full border border-black/20 block shadow-sm shrink-0" 
                                  style={{ backgroundColor: shadeColor }} 
                                />
                                <span>{item.shadeName}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Standard Variant</span>
                          )}
                          <span className="text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                            Unit Price: <b className="text-slate-800 font-mono text-sm">৳{item.price}</b>
                          </span>
                        </div>
                      </div>

                      {/* কোয়ান্টিটি */}
                      <div className="shrink-0 text-center pl-3">
                        <div className="bg-rose-50 text-rose-600 px-4 py-2.5 rounded-xl text-center border border-rose-200 shadow-sm">
                          <p className="text-[10px] uppercase font-black tracking-wider text-rose-400">Quantity</p>
                          <p className="text-xl font-black font-mono">0{item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ৩. গেটওয়ে ইনফো */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 bg-white rounded-xl space-y-1 shadow-sm">
              <p className="text-slate-400 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={14} /> Gateway Transaction ID
              </p>
              <p className="font-mono font-bold text-indigo-600 text-sm select-all pt-0.5">{order.transactionId}</p>
            </div>
            <div className="p-4 border border-slate-200 bg-white rounded-xl space-y-1 shadow-sm">
              <p className="text-slate-400 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} /> Method & Status
              </p>
              <p className="font-bold text-slate-800 font-mono text-sm pt-0.5">
                {order.paymentMethod} — <span className={`font-extrabold ${order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-rose-500'}`}>{order.paymentStatus}</span>
              </p>
            </div>
          </div>

        </div>

        {/* ফুটার */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Grand Net Total</p>
            <p className="text-2xl font-black text-emerald-600 font-mono tracking-tight">৳{order.totalPrice}</p>
          </div>
          <button 
            onClick={onClose} 
            className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-md"
          >
            Close Invoice View
          </button>
        </div>

      </div>
    </div>
  );
}
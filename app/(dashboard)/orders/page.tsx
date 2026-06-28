/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Loader2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import OrderDetailsModal from './OrderDetailsModal';
import { IOrderResponse } from '@/types/order.interface';

export default function OrderManagementPage() {
  const { orders, isLoading, updateOrder, deleteOrder } = useOrders();
  
  const [selectedOrder, setSelectedOrder] = useState<IOrderResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleStatusUpdate = async (id: string, field: 'orderStatus' | 'paymentStatus', value: string) => {
    try {
      await updateOrder({ id, payload: { [field]: value } });
      toast.success(`Updated ${field} to ${value}`);
      
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder((prev) => prev ? { ...prev, [field]: value } : null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update order");
    }
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Remove Order?",
      text: "This will permanently delete this invoice record from history.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1E2E24",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteOrder(id);
          toast.success("Order removed successfully!");
          if (selectedOrder?._id === id) closeModal();
        } catch (error) {
          toast.error("Failed to delete order");
        }
      }
    });
  };

  const openModal = (order: IOrderResponse) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const getOrderStatusClass = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Processing': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
        <p className="text-xs text-slate-400">Loading master checkout list...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-[#FAFAFA] min-h-screen text-xs text-slate-800">
      
      {/* 🎯 ১. হেডার প্যানেল (মোবাইলে ফ্লুইড কলাম লেআউট) */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 font-serif">Invoices & Orders</h1>
          <p className="text-gray-400 mt-0.5">Control live item dispatches, shaded inventories, and payment logs.</p>
        </div>
        <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-xs font-bold text-center sm:text-left">
          Total Shipments: <span className="text-[#FF3F6C] font-extrabold">{orders?.length || 0}</span>
        </div>
      </div>

      {/* 🎯 ২. মোবাইল ভিউ: প্রিমিয়াম কার্ড লিস্ট লেআউট (md স্ক্রিনের নিচে টেবিল হাইড) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {orders.length === 0 ? (
          <div className="text-center p-8 bg-white border rounded-2xl text-gray-400">No orders found.</div>
        ) : (
          orders.map((order: IOrderResponse) => (
            <div key={order._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-3.5">
              
              {/* কাস্টমার ও মেথড হেডার */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{order.shippingAddress?.name || "Unknown"}</h4>
                  <p className="text-gray-400 font-mono text-[10px] mt-0.5">{order.shippingAddress?.phone}</p>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] shrink-0 ${order.paymentMethod === 'SSLCommerz' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 bg-slate-100'}`}>
                  {order.paymentMethod}
                </span>
              </div>

              {/* প্রাইস ও ট্রানজেকশন ডেটা */}
              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-50 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amount:</span>
                  <span className="font-extrabold text-slate-900 text-sm">৳{order.totalPrice}</span>
                </div>
                {order.transactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">TXID:</span>
                    <span className="font-mono text-gray-500 max-w-[160px] truncate">{order.transactionId}</span>
                  </div>
                )}
              </div>

              {/* ড্রপডাউন স্ট্যাটাস সিলেক্টর গ্রিড */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Payment Status</label>
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => handleStatusUpdate(order._id, 'paymentStatus', e.target.value)}
                    className={`w-full p-2 border rounded-xl font-bold focus:outline-none cursor-pointer ${
                      order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Fulfillment Status</label>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusUpdate(order._id, 'orderStatus', e.target.value)}
                    className={`w-full p-2 border rounded-xl font-bold focus:outline-none cursor-pointer ${getOrderStatusClass(order.orderStatus)}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* অ্যাকশন বাটন প্যানেল */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                <button
                  onClick={() => openModal(order)}
                  className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                >
                  <Eye size={14} /> View Details
                </button>
                <button
                  onClick={() => handleDelete(order._id)}
                  className="p-2 border border-gray-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                  title="Delete Order"
                >
                  <Trash2 size={14} />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* 🎯 ৩. ডেস্কটপ ভিউ: ট্র্যাডিশনাল চওড়া টেবিল (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-slate-500 font-bold">
                <th className="p-4">Customer</th>
                <th className="p-4">Financials</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-400">No orders found.</td>
                </tr>
              ) : (
                orders.map((order: IOrderResponse) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{order.shippingAddress?.name}</p>
                      <p className="text-gray-500 font-mono text-[11px] mt-0.5">{order.shippingAddress?.phone}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 text-sm">৳{order.totalPrice}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5 max-w-[150px] truncate">
                        {order.transactionId}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${order.paymentMethod === 'SSLCommerz' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 bg-slate-100'}`}>
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handleStatusUpdate(order._id, 'paymentStatus', e.target.value)}
                        className={`p-1.5 border rounded-xl font-bold focus:outline-none cursor-pointer ${
                          order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusUpdate(order._id, 'orderStatus', e.target.value)}
                        className={`p-1.5 border rounded-xl font-bold focus:outline-none cursor-pointer ${getOrderStatusClass(order.orderStatus)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(order)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <Eye size={13} /> Details
                        </button>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
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

      <OrderDetailsModal 
        isOpen={isModalOpen} 
        order={selectedOrder} 
        onClose={closeModal} 
      />
    </div>
  );
}
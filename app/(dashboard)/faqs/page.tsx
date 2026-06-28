/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Loader2, HelpCircle, X, Check } from "lucide-react";
import { useFaqs, IFaq } from "@/hooks/useFaqs";
import toast from "react-hot-toast";

export default function FaqManagement() {
  const { faqs, isLoading, isSaving, addFaq, updateFaq, deleteFaq } = useFaqs();
  
  // ফর্ম ওপেন/ক্লোজ এবং ডেটা ট্র্যাকিং স্টেট
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<IFaq | null>(null);

  // ইনপুট ফিল্ড স্টেট
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  // এডিট বাটনে ক্লিক করলে ফিল্ডগুলো পпуলেট হবে
  const handleOpenEdit = (faq: IFaq) => {
    setSelectedFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setStatus(faq.status);
    setIsFormOpen(true);
    
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  // অ্যাড নিউ বাটনে ক্লিক করলে ফর্ম ক্লিন হবে
  const handleOpenAdd = () => {
    setSelectedFaq(null);
    setQuestion("");
    setAnswer("");
    setStatus("Active");
    setIsFormOpen(true);
    
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedFaq(null);
    setQuestion("");
    setAnswer("");
  };

  const handleToggleStatus = async (faq: IFaq) => {
    if (!faq._id) return;
    const newStatus = faq.status === "Active" ? "Inactive" : "Active";
    try {
      await updateFaq({ id: faq._id, data: { status: newStatus } });
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await deleteFaq(id);
        if (selectedFaq?._id === id) handleCloseForm();
        toast.success("FAQ deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete FAQ");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    try {
      if (selectedFaq?._id) {
        await updateFaq({ id: selectedFaq._id, data: { question, answer, status } });
        toast.success("FAQ updated successfully!");
      } else {
        await addFaq({ question, answer, status });
        toast.success("FAQ created successfully!");
      }
      handleCloseForm();
    } catch (err) {
      toast.error("Something went wrong while saving!");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 text-xs bg-[#FAFAFA] min-h-screen">
      
      {/* 🎯 ১. TOP HEADER PANEL (মোবাইলে ফ্লুইড কলাম লেআউট) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2 font-serif">
            <HelpCircle className="text-[#1E2E24] shrink-0" size={22} /> FAQ Configuration
          </h1>
          <p className="text-gray-400 mt-0.5">Manage frequently asked questions directly on this screen</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1.5 bg-[#1E2E24] text-white font-bold px-4 py-3 sm:py-2.5 rounded-xl transition-colors shadow-sm w-full sm:w-auto cursor-pointer uppercase tracking-wider"
          >
            <Plus size={16} /> Add New FAQ
          </button>
        )}
      </div>

      {/* DATA RENDER PANEL */}
      {isLoading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="animate-spin text-slate-700" size={24} />
        </div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl bg-white text-slate-400 font-medium">
          No FAQs configured yet. Click &apos;Add New FAQ&apos; to populate fields.
        </div>
      ) : (
        <>
          {/* 🎯 ২. মোবাইল মোড: রেসপন্সিভ কিউ-অ্যান্ড-এ কার্ড ভিউ (md স্ক্রিনের নিচে টেবিল হাইড) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {faqs.map((faq) => (
              <div 
                key={faq._id}
                className={`p-4 rounded-2xl border bg-white shadow-xs space-y-3 transition-all ${
                  selectedFaq?._id === faq._id ? "border-orange-200 bg-orange-50/10" : "border-gray-100"
                }`}
              >
                <div className="space-y-2">
                  <div className="font-bold text-slate-800 text-sm flex items-start gap-1">
                    <span className="text-orange-500 font-extrabold">Q.</span> 
                    <span className="flex-1 leading-snug">{faq.question}</span>
                  </div>
                  <div className="text-slate-500 font-medium leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-slate-200 text-xs">
                    {faq.answer}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  {/* স্ট্যাটাস টগল */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-[10px]">Visibility:</span>
                    <button
                      onClick={() => handleToggleStatus(faq)}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        faq.status === "Active" ? "bg-[#1E2E24]" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                          faq.status === "Active" ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* অ্যাকশন কন্ট্রোলস */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(faq)}
                      className="p-2 border border-gray-100 bg-white text-slate-500 hover:text-orange-500 rounded-xl cursor-pointer"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => faq._id && handleDelete(faq._id)}
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
                  <th className="p-4">Question & Answer Mapping</th>
                  <th className="p-4 w-32 text-center">Visibility</th>
                  <th className="p-4 w-28 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {faqs.map((faq) => (
                  <tr 
                    key={faq._id} 
                    className={`transition-colors ${
                      selectedFaq?._id === faq._id ? "bg-orange-50/30" : "hover:bg-slate-50/20"
                    }`}
                  >
                    <td className="p-4 space-y-1.5 max-w-xl">
                      <div className="font-bold text-slate-800 text-sm">
                        <span className="text-orange-500 mr-1">Q.</span> {faq.question}
                      </div>
                      <div className="text-slate-500 font-medium leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-slate-200">
                        {faq.answer}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(faq)}
                        className={`mx-auto w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                          faq.status === "Active" ? "bg-[#1E2E24]" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                            faq.status === "Active" ? "translate-x-4" : ""
                          }`}
                        />
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(faq)}
                          className={`p-2 rounded-lg border bg-white shadow-2xs transition-all cursor-pointer ${
                            selectedFaq?._id === faq._id 
                              ? "text-orange-500 border-orange-200 bg-orange-50/50" 
                              : "text-slate-500 hover:text-[#1E2E24]"
                          }`}
                          title="Edit FAQ"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => faq._id && handleDelete(faq._id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg border bg-white shadow-2xs transition-all cursor-pointer"
                          title="Delete FAQ"
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
                {selectedFaq ? "Modify FAQ Fields" : "Setup New FAQ Fields"}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Fill out the fields below to update the live database</p>
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
              
              {/* QUESTION & ANSWER FIELDS */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="font-semibold text-slate-500 block mb-1">Question Schema *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Is there a return policy for cosmetics?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-orange-400 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-500 block mb-1">Detailed Answer Schema *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write the public response here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-orange-400 bg-white resize-none text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* STATUS & SIDE CONTROLS (মোবাইলে নিচে ফুল চওড়া হয়ে যাবে) */}
              <div className="space-y-4 w-full">
                <div className="bg-slate-50/70 border border-gray-100 rounded-xl p-4 space-y-3">
                  <span className="font-bold text-slate-700 block">Controls & Metas</span>
                  
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
                    {selectedFaq ? "Update" : "Save"}
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
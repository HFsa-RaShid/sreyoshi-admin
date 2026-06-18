"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react"; 
import { Lock, Mail, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // ম্যানুয়াল রিডাইরেকশন
      });

      // লগইন ফেইল করলে
      if (result?.error || !result?.ok) {
        setError("Invalid email or password! Please check your credentials.");
        setLoading(false);
      } else {
        // ⚡ সাকসেস হলে উইন্ডো রিফ্রেশ দিয়ে ড্যাশবোর্ডে পাঠানো হলো (কুকি এবং সেশন লুপ ইমিডিয়েটলি ফিক্স হবে)
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Login Client Error:", err);
      setError("Failed to connect to the authentication server.");
      setLoading(false);
    }
  };

  // যদি অলরেডি সেশন লোড হতে থাকে, তবে ছোট একটা লোডার দেখাবে
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs font-medium text-gray-400">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1E2E24] text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 font-serif">Sreyoshi Admin</h1>
          <p className="text-xs text-gray-400 mt-1">Sign in to manage your e-commerce store</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-xl mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail size={16} />
              </span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sreyoshi.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E2E24] transition-colors text-black"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock size={16} />
              </span>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1E2E24] transition-colors text-black"
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E2E24] hover:bg-[#FF3F6C] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-colors mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Verifying...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
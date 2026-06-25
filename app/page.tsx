"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react"; 
import { Lock, Mail, Loader2 } from "lucide-react";

function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" || session) {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const sanitizedEmail = email.trim().toLowerCase();

      const res = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity: sanitizedEmail, password }),
      });

      if (!res.ok) {
        setError("Invalid email or password! Please check your credentials.");
        setLoading(false);
        return;
      }

      const responseData = await res.json();
      const actualData = responseData?.data || responseData;
      const token = responseData?.accessToken || responseData?.token || actualData?.accessToken;

      if (!token) {
        setError("Invalid email or password! Please check your credentials.");
        setLoading(false);
        return;
      }


      const decodedToken = decodeJwt(token);
      const userRole = decodedToken?.role;

      
      if (userRole !== "admin") {
        setError("Access Denied! Only admins can access this dashboard panel.");
        setLoading(false);
        return; 
      }

     
      const result = await signIn("credentials", {
        email: sanitizedEmail,
        password,
        redirect: false, 
      });

      if (result?.error || !result?.ok) {
        setError("Invalid email or password! Please check your credentials.");
        setLoading(false);
      } else {
        router.refresh();
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Login Client Error:", err);
      setError("Failed to connect to the authentication server.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs font-medium text-gray-400">
        <Loader2 className="animate-spin mr-2" size={16} /> Checking session...
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
          <h1 className="text-xl font-bold text-gray-900 font-serif">Khati-Bazar Admin</h1>
          <p className="text-xs text-gray-400 mt-1">Sign in to manage your e-commerce store</p>
        </div>

        {/*  ডাইনামিক টোস্ট এরর মেসেজ বক্স */}
        {error && (
          <div className={`text-xs font-semibold p-3 rounded-xl mb-4 text-center border ${
            error.includes("Access Denied") 
              ? "bg-amber-50 text-amber-700 border-amber-200 shadow-sm animate-bounce" // অ্যাডমিন না হলে চমৎকার ওয়ার্নিং অ্যালার্ট
              : "bg-red-50 text-red-600 border-red-100"
          }`}>
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
                placeholder="admin@gmail.com"
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
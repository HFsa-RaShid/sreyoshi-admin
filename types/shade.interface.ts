// src/types/shade.interface.ts

;

export interface IShadeItem {
  shadeName: string;
  shadeColorCode: string;
  shadeImage?: string; // 💡 মঙ্গুস ডক অনুযায়ী ক্লাউডিনারি URL এর ব্যাকআপ
  stock?: number;      // 💡 গ্লোবাল কনফিগারেশনের স্টক (ঐচ্ছিক)
  status?: "Active" | "Inactive"; // 💡 নির্দিষ্ট শেডটি একটিভ নাকি ইনএকটিভ
}

export interface IShade {
  _id: string;
  category?: string | { _id: string; name?: string; categoryName?: string }; // মঙ্গুস পপুলেট সাপোর্ট
  subCategory?: string;     // যেমন: EYES
  itemName: string;         // যে subCategory item এর সাথে ম্যাপ করা (যেমন: Eye Shadow)
  availableShades: IShadeItem[];
  status: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface IShadePayload {
  itemName: string;
  availableShades: IShadeItem[];
  status?: "Active" | "Inactive";
}

// 💡 প্রোডাক্ট এন্ট্রি/ক্রিয়েশন কম্পোনেন্টের স্টেটের জন্য পারফেক্ট টাইপ
export interface IProductShadeState {
  shadeName: string;
  shadeColorCode: string;
  shadeFile: File | null;   // মাল্টার দিয়ে ব্যাকএন্ডে পাঠানোর জন্য আসল ফাইল
  shadePreview: string;     // ব্রাউজার ব্লব বা পুরাতন ইমেজ ইউআরএল প্রিভিউয়ের জন্য
  stock: number | "";       // ইনপুট হ্যান্ডেল করার জন্য নাম্বার অথবা খালি স্ট্রিং
  status: "Active" | "Inactive";
}

export type ProductUnit = "gm" | "ml" | "pcs";
export type ProductStatus = "Active" | "Inactive";
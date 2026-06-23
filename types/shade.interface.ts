import { Types } from "mongoose";

// ১. প্রতিটি একক শেডের ইন্টারফেস (image ও stock ছাড়া ব্যাকএন্ড স্কিমা অনুযায়ী)
export interface IShadeItem {
  shadeName: string;
  shadeColorCode: string;
  status: "Active" | "Inactive"; 
}


export interface IShade {
  _id: string;
  category: string | { _id: string; name?: string; categoryName?: string }; 
  subCategory: string;     // যেমন: EYES
  itemName: string;         // যেমন: Eye Shadow
  availableShades: IShadeItem[];
  status: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
}


export interface ISubCategoryItem {
  id: string; 
  name: string;
  status: 'Active' | 'Inactive';
}

export interface ISubCategory {
  id?: string; 
  title: string;
  status?: 'Active' | 'Inactive'; 
  items: (string | ISubCategoryItem)[]; 
}

export interface ICategory {
  _id: string;
  name: string;
  image?: string;
  status: 'Active' | 'Inactive';
  subCategories: ISubCategory[];
  createdAt?: string;
  updatedAt?: string;
}

// ৪. মডালের জন্য ডেডিকেটেড প্রপস ইন্টারফেস
export interface AddShadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Omit<IShade, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>; 
  categories: ICategory[]; // গ্লোবাল ICategory ইন্টারফেস ব্যবহার করা হলো
}

export interface IProductShadeState {
  shadeName: string;
  shadeColorCode: string;
  shadeFile: File | null;   // 💡 মাল্টার (Multer) দিয়ে ব্যাকএন্ডে পাঠানোর জন্য আসল ফাইল
  shadePreview: string;     // 💡 ব্রাউজারে ব্লব ইউআরএল বা পুরাতন ইমেজ ইউআরএল প্রিভিউয়ের জন্য
  stock: number | "";       // ইনপুট হ্যান্ডেল করার জন্য নাম্বার অথবা খালি স্ট্রিং
  status: "Active" | "Inactive";
}
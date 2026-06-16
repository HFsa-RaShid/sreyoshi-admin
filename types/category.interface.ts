export interface ISubCategoryItem {
  id: string; // ইউনিক আইডি
  name: string;
  status: 'Active' | 'Inactive';
}

export interface ISubCategory {
  id?: string; // পুরানো ডাটাতে আইডি নাও থাকতে পারে, তাই অপশনাল
  title: string;
  status?: 'Active' | 'Inactive'; // অপশনাল (ডিফল্ট Active ধরা হবে)
  items: (string | ISubCategoryItem)[]; // 🔹 পুরানো স্ট্রিং অ্যারে এবং নতুন অবজেক্ট দুইটাই সাপোর্ট করবে
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
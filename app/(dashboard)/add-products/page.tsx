/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X, Search } from "lucide-react";
import { ICategory, ISubCategoryItem } from "@/types/category.interface";
import { useCategories } from "@/hooks/useCategories"; // 👈 আপনার হুকটি এখানে ইম্পোর্ট করুন

// প্রোডাক্ট ক্রিয়েট করার জন্য যদি আলাদা হুক থাকে তা এখানে ইম্পোর্ট করবেন। 
// সাময়িকভাবে এক্সিওস বা ডামি দিয়ে কানেক্ট করা আছে।
import axios from "axios";

export default function AddProductPage() {
  const router = useRouter();

  // ১. TanStack Query হুক দিয়ে রিয়েল ব্যাকএন্ড থেকে ক্যাটাগরি ডেটা নিয়ে আসা
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  
  // প্রোডাক্ট লিস্ট এবং ক্রিয়েশন মিউটেশন (প্রয়োজন অনুযায়ী আপনার আসল প্রোডাক্ট হুক দিয়ে রিপ্লেস করবেন)
  const productsData: any[] = []; 
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // --- FORM STATES (Image 18-6-26 at 12.39 PM.png অনুযায়ী) ---
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [productType, setProductType] = useState("Single");
  const [brand, setBrand] = useState("");
  
  const [purchasePrice, setPurchasePrice] = useState<number | "">("");
  const [sellPrice, setSellPrice] = useState<number | "">("");
  const [regularPrice, setRegularPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [stockOut, setStockOut] = useState(false);
  const [productStatus, setProductStatus] = useState<"Active" | "Inactive">("Active");

  // ক্যাটাগরি ও সাব-ক্যাটাগরি স্টেট
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  // রিলেটেড প্রোডাক্ট স্টেট (Image 18-6-26 at 12.40 PM.png অনুযায়ী)
  const [relatedProductQuery, setRelatedProductQuery] = useState("");
  const [selectedRelatedProducts, setSelectedRelatedProducts] = useState<string[]>([]);

  // ডেসক্রিপশন স্টেট
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");

  // ইমেজ স্টেট
  const [singleImage, setSingleImage] = useState<File | null>(null);
  const [singleImagePreview, setSingleImagePreview] = useState<string | null>(null);
  const [multiImages, setMultiImages] = useState<File[]>([]);
  const [multiImagePreviews, setMultiImagePreviews] = useState<string[]>([]);

  // --- IMAGE HANDLERS ---
  const handleSingleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSingleImage(file);
      setSingleImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMultiImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (multiImages.length + filesArray.length > 4) {
        alert("Up to 4 additional images are allowed.");
        return;
      }
      setMultiImages((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setMultiImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeMultiImage = (index: number) => {
    setMultiImages((prev) => prev.filter((_, i) => i !== index));
    setMultiImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 🔹 API থেকে আসা ডেটা আর্কিটেকচার (String | ISubCategoryItem) নিখুঁতভাবে রেন্ডার করার মেমো
  const availableSubCategoryItems = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    const matchedCat = categories.find((cat) => cat._id === selectedCategory);
    if (!matchedCat || !matchedCat.subCategories) return [];
    
    const itemsList: string[] = [];
    matchedCat.subCategories.forEach((subCat) => {
      if (!subCat.status || subCat.status === "Active") {
        subCat.items.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            if ((item as ISubCategoryItem).status === "Active") {
              itemsList.push((item as ISubCategoryItem).name);
            }
          } else if (typeof item === "string") {
            itemsList.push(item);
          }
        });
      }
    });
    return itemsList;
  }, [selectedCategory, categories]);

  // রিলেটেড প্রোডাক্ট ফিল্টার
  const filteredRelatedProducts = useMemo(() => {
    if (!relatedProductQuery.trim()) return productsData.slice(0, 3);
    return productsData.filter((prod) =>
      prod.name.toLowerCase().includes(relatedProductQuery.toLowerCase())
    );
  }, [relatedProductQuery, productsData]);

  const toggleRelatedProduct = (id: string) => {
    setSelectedRelatedProducts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // --- SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !sellPrice || !selectedCategory) {
      alert("Please fill in the required fields.");
      return;
    }

    setIsCreatingProduct(true);
    const formData = new FormData();
    
    // ব্যাকএন্ড স্কিমার সাথে মিল রেখে সাব-ক্যাটাগরি টাইটেল খোঁজা
    const matchedCat = categories.find((cat) => cat._id === selectedCategory);
    const subCategoryGroupTitle = matchedCat?.subCategories.find((sub) =>
      sub.items.some((item) => {
        const name = typeof item === "object" ? item.name : item;
        return name === selectedSubCategory;
      })
    )?.title || "";

    const productPayload = {
      productCode: sku || `PROD-${Date.now().toString().slice(-6)}`,
      name: productName,
      category: selectedCategory,
      subCategory: subCategoryGroupTitle, 
      itemName: selectedSubCategory,       
      price: Number(sellPrice),
      oldPrice: regularPrice ? Number(regularPrice) : undefined,
      description: longDescription || shortDescription,
      availability: stock && Number(stock) > 0 ? "In Stock" : "Out of Stock",
      status: productStatus,
      isDiscountDisabled: false,
      weightOrVolume: 30, 
      unit: "ml",
    };

    formData.append("data", JSON.stringify(productPayload));

    if (singleImage) formData.append("commonImages", singleImage);
    multiImages.forEach((file) => formData.append("commonImages", file));

    try {
      // এখানে আপনার প্রোডাকশন API এন্ডপয়েন্টটি বসিয়ে দিন
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      alert("Failed to save product.");
    } finally {
      setIsCreatingProduct(false);
    }
  };

  if (isCategoriesLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
        <p className="text-sm text-slate-400">Loading configurations from server...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans text-slate-800 antialiased">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-[#1E293B]">Add Product</h1>
          <p className="text-sm text-slate-400 mt-1">
            Fill in product details, pricing, images, and descriptions. Preview updates live on the right.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT CONTAINER (Image 18-6-26 at 12.39 PM.png) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* BASIC INFORMATION CARD */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-sm">
              <h2 className="text-base font-bold text-[#1E293B] mb-5">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-2">Product Name <span className="text-slate-400 font-normal">(Max 120 characters.)</span></label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Polo Shirt"
                    className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none focus:border-orange-400 bg-white placeholder-slate-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-2">SKU <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SKU-001"
                    className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none focus:border-orange-400 bg-white placeholder-slate-300 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-2">Product Type</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg p-3 bg-white outline-none focus:border-orange-400 text-slate-700"
                  >
                    <option value="Single">Single</option>
                    <option value="Variant">Variant</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-2">Brand <span className="text-slate-400 font-normal">(optional)</span></label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg p-3 bg-white text-slate-400 outline-none focus:border-orange-400"
                  >
                    <option value="">Select brand</option>
                    <option value="Sreyoshi">Sreyoshi</option>
                  </select>
                </div>
              </div>

              {/* SINGLE PRODUCT DETAILS CONTAINER BOX */}
              <div className="bg-[#F8FAFC] border border-slate-200/60 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 tracking-wide mb-5">Single Product Details</h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="text-xs font-semibold text-slate-600 md:w-32 shrink-0">Purchase Price</label>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">৳</span>
                      <input
                        type="number"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value !== "" ? Number(e.target.value) : "")}
                        placeholder="500"
                        className="w-full max-w-sm text-sm border border-slate-200 rounded-lg py-2.5 pl-7 pr-3 bg-white outline-none focus:border-orange-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="text-xs font-semibold text-slate-600 md:w-32 shrink-0">Sell Price</label>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">৳</span>
                      <input
                        type="number"
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value !== "" ? Number(e.target.value) : "")}
                        placeholder="650"
                        className="w-full max-w-sm text-sm border border-slate-200 rounded-lg py-2.5 pl-7 pr-3 bg-white outline-none focus:border-orange-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="text-xs font-semibold text-slate-600 md:w-32 shrink-0">Regular Price <span className="text-slate-400 font-normal">(optional)</span></label>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">৳</span>
                      <input
                        type="number"
                        value={regularPrice}
                        onChange={(e) => setRegularPrice(e.target.value !== "" ? Number(e.target.value) : "")}
                        placeholder="800"
                        className="w-full max-w-sm text-sm border border-slate-200 rounded-lg py-2.5 pl-7 pr-3 bg-white outline-none focus:border-orange-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="text-xs font-semibold text-slate-600 md:w-32 shrink-0">Stock</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value !== "" ? Number(e.target.value) : "")}
                      placeholder="600"
                      className="w-full max-w-sm text-sm border border-slate-200 rounded-lg p-2.5 bg-white outline-none focus:border-orange-400"
                    />
                  </div>

                  <div className="flex items-center justify-between max-w-sm pt-2">
                    <span className="text-xs font-semibold text-slate-600">Stock Out</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-medium">{stockOut ? "Active" : "Inactive"}</span>
                      <button
                        type="button"
                        onClick={() => setStockOut(!stockOut)}
                        className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 ${stockOut ? "bg-amber-500" : "bg-slate-200"}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${stockOut ? "translate-x-5" : ""}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between max-w-sm pt-2">
                    <span className="text-xs font-semibold text-slate-600">Product Status</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-medium">{productStatus}</span>
                      <button
                        type="button"
                        onClick={() => setProductStatus(productStatus === "Active" ? "Inactive" : "Active")}
                        className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 ${productStatus === "Active" ? "bg-orange-500" : "bg-slate-200"}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${productStatus === "Active" ? "translate-x-5" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* CATEGORY SELECTION CARD (ব্যাকএন্ড ডেটা কানেক্টেড) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-sm">
              <h2 className="text-base font-bold text-[#1E293B] mb-5">Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubCategory("");
                    }}
                    className="w-full text-sm border border-slate-200 rounded-lg p-3 bg-white text-slate-700 outline-none focus:border-orange-400"
                  >
                    <option value="">Select category</option>
                    {categories?.map((cat: ICategory) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-2">Sub Category <span className="text-slate-400 font-normal">(optional)</span></label>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    disabled={!selectedCategory}
                    className="w-full text-sm border border-slate-200 rounded-lg p-3 bg-white text-slate-700 outline-none focus:border-orange-400 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">{selectedCategory ? "Select sub category" : "Select category first"}</option>
                    {availableSubCategoryItems.map((name, idx) => (
                      <option key={idx} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* RELATED PRODUCTS CARD (Image 18-6-26 at 12.40 PM.png) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-sm">
              <h2 className="text-base font-bold text-[#1E293B] mb-1">Related Products</h2>
              <p className="text-xs text-slate-400 mb-4">Select which related products you want to show on the product page.</p>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input
                  type="text"
                  value={relatedProductQuery}
                  onChange={(e) => setRelatedProductQuery(e.target.value)}
                  placeholder="Search Product..."
                  className="w-full text-sm border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 outline-none focus:border-orange-400"
                />
              </div>

              <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3 max-h-48 overflow-y-auto bg-slate-50/30">
                {filteredRelatedProducts.map((prod) => (
                  <label key={prod._id} className="flex items-center gap-3 cursor-pointer text-sm text-slate-600 font-medium hover:text-black transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedRelatedProducts.includes(prod._id)}
                      onChange={() => toggleRelatedProduct(prod._id)}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 accent-slate-800"
                    />
                    {prod.name}
                  </label>
                ))}
              </div>
            </div>

            {/* DESCRIPTION CARD */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-sm">
              <h2 className="text-base font-bold text-[#1E293B] mb-5">Description</h2>
              
              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-500 block mb-1">Short Description <span className="text-slate-400 font-normal">(optional)</span></label>
                <p className="text-[11px] text-slate-400 mb-2">Just 1 line summary</p>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Premium cotton polo shirt for everyday wear"
                  className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none focus:border-orange-400 bg-white placeholder-slate-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-3">Long Description</label>
                
                <div className="border border-slate-200 border-b-0 rounded-t-lg bg-[#F8FAFC] p-2 flex flex-wrap gap-1.5 items-center">
                  {["B", "I", "U", "S", "H2", "H3", "”", "List-Bullet", "List-Num", "Align-L", "Align-C", "Align-R", "Link"].map((btn, idx) => (
                    <button key={idx} type="button" className="text-xs font-bold px-2.5 py-1 bg-white border border-slate-200 rounded shadow-sm text-slate-500 hover:bg-slate-50">{btn}</button>
                  ))}
                  <button type="button" onClick={() => setLongDescription("")} className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded shadow-sm text-red-500 hover:bg-red-50 ml-auto">Clear</button>
                </div>
                
                <textarea
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  placeholder="Write detailed product description..."
                  rows={6}
                  className="w-full text-sm border border-slate-200 rounded-b-lg p-4 outline-none focus:border-orange-400 bg-white resize-none placeholder-slate-300"
                />
                <div className="text-[11px] text-slate-400 text-right mt-1.5">Rich text editor <span className="float-right">{longDescription.length} characters</span></div>
              </div>
            </div>

            {/* PRODUCT IMAGES CARD */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/70 shadow-sm">
              <h2 className="text-base font-bold text-[#1E293B] mb-1">Product Images</h2>
              <p className="text-xs text-slate-400 mb-5">Select or upload up to 4 images.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* SINGLE IMAGE */}
                <div className="border border-dashed border-slate-200 rounded-xl p-5 bg-[#F8FAFC] flex flex-col items-center justify-center min-h-[160px] relative transition-colors hover:bg-slate-50">
                  {singleImagePreview ? (
                    <div className="relative w-full h-full min-h-[120px] flex items-center justify-center">
                      <img src={singleImagePreview} alt="Preview" className="max-h-[120px] object-contain rounded-lg" />
                      <button type="button" onClick={() => { setSingleImage(null); setSingleImagePreview(null); }} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow"><X size={12} /></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center text-center">
                      <Upload className="w-7 h-7 text-orange-400 mb-2" />
                      <span className="text-xs font-bold text-slate-700">Single Image</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Main product image</span>
                      <input type="file" accept="image/*" onChange={handleSingleImageChange} className="hidden" />
                    </label>
                  )}
                </div>

                {/* MULTI IMAGES */}
                <div className="border border-dashed border-slate-200 rounded-xl p-5 bg-[#F8FAFC] flex flex-col items-center justify-center min-h-[160px] transition-colors hover:bg-slate-50">
                  {multiImagePreviews.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      {multiImagePreviews.map((src, idx) => (
                        <div key={idx} className="relative bg-white border border-slate-200 p-1 rounded-lg flex items-center justify-center h-14 shadow-sm">
                          <img src={src} alt="Preview" className="max-h-full object-contain" />
                          <button type="button" onClick={() => removeMultiImage(idx)} className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600"><X size={8} /></button>
                        </div>
                      ))}
                      {multiImagePreviews.length < 4 && (
                        <label className="border border-dashed border-slate-200 rounded-lg flex items-center justify-center h-14 cursor-pointer bg-white text-slate-400 hover:text-slate-600">
                          <Upload className="w-4 h-4" />
                          <input type="file" accept="image/*" multiple onChange={handleMultiImageChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center text-center">
                      <Upload className="w-7 h-7 text-orange-400 mb-2" />
                      <span className="text-xs font-bold text-slate-700">Multi Images</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Up to 4 additional images</span>
                      <input type="file" accept="image/*" multiple onChange={handleMultiImageChange} className="hidden" />
                    </label>
                  )}
                </div>

              </div>
            </div>

            {/* BUTTON GROUP */}
            <div className="flex justify-end gap-3.5 mt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingProduct}
                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-black transition-colors flex items-center gap-2 disabled:bg-slate-400"
              >
                {isCreatingProduct && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Product
              </button>
            </div>

          </div>

          {/* RIGHT SIDEBAR PREVIEW CONTAINER */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-sm sticky top-6">
            <h3 className="text-sm font-bold text-[#1E293B] mb-0.5">Preview</h3>
            <p className="text-[11px] text-slate-400 mb-5">Live product snapshot</p>

            <div className="border border-slate-200/60 rounded-xl p-4 bg-white flex gap-4 items-start">
              <div className="w-20 h-20 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-center overflow-hidden shrink-0 border border-slate-100">
                {singleImagePreview ? (
                  <img src={singleImagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-medium text-slate-400 p-2">No image</span>
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-800 truncate">{productName || "Product name"}</h4>
                <span className="text-xs text-slate-400 font-medium block mt-0.5">
                  {categories?.find((c: any) => c._id === selectedCategory)?.name || "Category"}
                </span>
                <span className="text-[11px] text-slate-400 font-medium block">Brand</span>
                
                <div className="h-[2px] w-4 bg-orange-400 my-2 rounded" />
                
                <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-500 font-medium">
                  <div>Purchase</div>
                  <div className="text-slate-800 text-right">{purchasePrice ? `৳ ${purchasePrice}` : "—"}</div>
                  <div>Regular</div>
                  <div className="text-slate-800 text-right">{regularPrice ? `৳ ${regularPrice}` : "—"}</div>
                  <div>Stock</div>
                  <div className="text-slate-800 text-right">{stock || "0"}</div>
                  <div>Status</div>
                  <div className="text-right font-bold text-slate-700 capitalize">{productStatus.toLowerCase()}</div>
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
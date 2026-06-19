/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X, Plus, Trash2 } from "lucide-react";
import { ICategory, ISubCategoryItem } from "@/types/category.interface";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts"; 
import { useBrands } from "@/hooks/useBrands"; // ব্র্যান্ড হুক ইম্পোর্ট করা হলো

// Rich Text Editor
import DynamicReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface IShadeState {
  shadeName: string;
  shadeColorCode: string;
  shadeFile: File | null;
  shadePreview: string;
  stock: number | "";
  status: "Active" | "Inactive";
}

const editorModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "clean"],
  ],
};

export default function AddProductPage() {
  const router = useRouter();
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const { brands, isLoadingBrands } = useBrands(); // ব্র্যান্ড ডাটা লোড করা হলো
  const { createProduct } = useProducts(); 
  
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // --- FORM STATES ---
  const [productCode, setProductCode] = useState(""); 
  const [productName, setProductName] = useState("");
  const [skinType, setSkinType] = useState("All");
  const [promotion, setPromotion] = useState("None");
  
  const [sellPrice, setSellPrice] = useState<number | "">("");
  const [regularPrice, setRegularPrice] = useState<number | "">(""); 
  const [weightOrVolume, setWeightOrVolume] = useState<number | "">(30);
  const [unit, setUnit] = useState<"gm" | "ml" | "pcs">("ml"); 
  const [productStatus, setProductStatus] = useState<"Active" | "Inactive">("Active");

  const [selectedBrand, setSelectedBrand] = useState(""); // ব্র্যান্ড স্টেট
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const [description, setDescription] = useState("");
  const [howToUse, setHowToUse] = useState("");

  // IMAGE STATES
  const [singleImage, setSingleImage] = useState<File | null>(null);
  const [singleImagePreview, setSingleImagePreview] = useState<string | null>(null);
  const [multiImages, setMultiImages] = useState<File[]>([]);
  const [multiImagePreviews, setMultiImagePreviews] = useState<string[]>([]);

  // SHADES STATE
  const [shades, setShades] = useState<IShadeState[]>([]);

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
      if (multiImages.length + filesArray.length > 3) {
        alert("Maximum 3 gallery images allowed (Total 4 with main image) due to backend limits.");
        return;
      }
      setMultiImages((prev) => [...prev, ...filesArray]);
      setMultiImagePreviews((prev) => [...prev, ...filesArray.map(f => URL.createObjectURL(f))]);
    }
  };

  const removeMultiImage = (index: number) => {
    setMultiImages((prev) => prev.filter((_, i) => i !== index));
    setMultiImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- SHADES HANDLERS ---
  const addShadeField = () => {
    setShades((prev) => [
      ...prev,
      { shadeName: "", shadeColorCode: "#000000", shadeFile: null, shadePreview: "", stock: "", status: "Active" }
    ]);
  };

  const removeShadeField = (index: number) => {
    setShades((prev) => prev.filter((_, i) => i !== index));
  };

  const handleShadeChange = (index: number, field: keyof IShadeState, value: any) => {
    setShades((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleShadeImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleShadeChange(index, "shadeFile", file);
      handleShadeChange(index, "shadePreview", URL.createObjectURL(file));
    }
  };

  const isMakeupSelected = useMemo(() => {
    const matched = categories?.find((cat) => cat._id === selectedCategory);
    return matched?.name?.toLowerCase() === "makeup";
  }, [selectedCategory, categories]);

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

  // --- SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanDescription = description.replace(/<(.|\n)*?>/g, "").trim() === "" ? "" : description;
    const cleanHowToUse = howToUse.replace(/<(.|\n)*?>/g, "").trim() === "" ? "" : howToUse;

    if (!productCode || !productName || !sellPrice || !selectedBrand || !selectedCategory || !cleanDescription) {
      alert("Please fill out required fields (SKU, Name, Price, Brand, Category, and Description).");
      return;
    }

    setIsCreatingProduct(true);
    const formData = new FormData();
    
    const matchedCat = categories?.find((cat) => cat._id === selectedCategory);
    const subCategoryGroupTitle = matchedCat?.subCategories.find((sub) =>
      sub.items.some((item) => (typeof item === "object" ? item.name : item) === selectedSubCategory)
    )?.title || "General";

    const totalStock = isMakeupSelected 
      ? shades.reduce((acc, curr) => acc + Number(curr.stock || 0), 0)
      : 50; 

    // Mongoose Model অনুযায়ী ১০০% সঠিক ডাটা স্ট্রাকচার
    const productPayload: any = {
      productCode: productCode,
      name: productName,
      category: selectedCategory,
      brand: selectedBrand, // পেলোডে ব্র্যান্ড যুক্ত করা হলো
      subCategory: subCategoryGroupTitle, 
      itemName: selectedSubCategory || "General",    
      price: Number(sellPrice),
      oldPrice: regularPrice ? Number(regularPrice) : undefined,
      isDiscountDisabled: false, 
      description: cleanDescription, 
      howToUse: cleanHowToUse || undefined,
      rating: 0,
      ratingCount: 0,
      salesCount: 0,
      skinType: skinType !== "All" ? skinType : undefined,
      promotion: promotion !== "None" ? promotion : undefined,
      availability: totalStock > 0 ? "In Stock" : "Out of Stock",
      status: productStatus,
      weightOrVolume: Number(weightOrVolume),
      unit: unit, 
      shades: [] 
    };

    if (isMakeupSelected) {
      productPayload.shades = shades.map((sh) => ({
        shadeName: sh.shadeName,
        shadeColorCode: sh.shadeColorCode,
        stock: Number(sh.stock || 0),
        status: sh.status
      }));
    }

    formData.append("data", JSON.stringify(productPayload));

    if (singleImage) formData.append("commonImages", singleImage);
    multiImages.slice(0, 3).forEach((file) => formData.append("commonImages", file));

    if (isMakeupSelected) {
      shades.forEach((sh) => {
        if (sh.shadeFile) {
          formData.append("shadeImages", sh.shadeFile);
        }
      });
    }

    try {
      await createProduct(formData);
      alert("Product saved successfully!");
      router.push("/products");
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Failed to save product. Check backend logs.");
    } finally {
      setIsCreatingProduct(false);
    }
  };

  if (isCategoriesLoading || isLoadingBrands) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
        <p className="text-sm text-slate-400">Loading configurations from server...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-[#FAFAFA] text-slate-800 antialiased text-xs">
      <div className="">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1E293B] font-serif">Add New Product</h1>
          <p className="text-slate-400 mt-1">Fill out specifications, categories, and dynamic product variants/shades below.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* BASIC INFORMATION */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-[#1E293B]">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-500 block mb-1.5">Product Code / SKU *</label>
                  <input
                    type="text"
                    required
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    placeholder="e.g., PROD-MK-102"
                    className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-orange-400 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-500 block mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., Matte Perfect Foundation"
                    className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-orange-400 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-500 block mb-1.5">Skin Type</label>
                  <select value={skinType} onChange={(e) => setSkinType(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-white">
                    <option value="All">All Skin Types</option>
                    <option value="Oily">Oily</option>
                    <option value="Dry">Dry</option>
                    <option value="Sensitive">Sensitive</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-500 block mb-1.5">Promotion / Tag</label>
                  <select value={promotion} onChange={(e) => setPromotion(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-white">
                    <option value="None">None</option>
                    <option value="New Arrivals">New Arrivals</option>
                    <option value="Best Sellers">Best Sellers</option>
                    <option value="Trending">Trending</option>
                  </select>
                </div>
              </div>

              {/* PRICING & SPECIFICATIONS */}
              <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-4 space-y-4">
                <h3 className="font-bold text-slate-700 tracking-wide">Pricing & Volume Spec</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Price (৳) *</label>
                    <input type="number" required value={sellPrice} onChange={(e) => setSellPrice(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="1250" className="w-full border border-slate-200 rounded-lg p-2 bg-white outline-none" />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Old Price (৳)</label>
                    <input type="number" value={regularPrice} onChange={(e) => setRegularPrice(e.target.value !== "" ? Number(e.target.value) : "")} placeholder="1500" className="w-full border border-slate-200 rounded-lg p-2 bg-white outline-none" />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Weight/Vol</label>
                    <input type="number" value={weightOrVolume} onChange={(e) => setWeightOrVolume(e.target.value !== "" ? Number(e.target.value) : "")} className="w-full border border-slate-200 rounded-lg p-2 bg-white outline-none" />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Unit</label>
                    <select value={unit} onChange={(e) => setUnit(e.target.value as any)} className="w-full border border-slate-200 rounded-lg p-2 bg-white outline-none">
                      <option value="ml">ml</option>
                      <option value="gm">gm</option>
                      <option value="pcs">pcs</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between max-w-xs pt-2">
                  <span className="font-semibold text-slate-600">Product Status</span>
                  <button
                    type="button"
                    onClick={() => setProductStatus(productStatus === "Active" ? "Inactive" : "Active")}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${productStatus === "Active" ? "bg-orange-500" : "bg-slate-200"}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow transform transition ${productStatus === "Active" ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* BRAND, CATEGORY & SUB CATEGORY */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div>
                <label className="font-semibold text-slate-500 block mb-1.5">Brand *</label>
                <select
                  required
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none"
                >
                  <option value="">Select brand</option>
                  {brands?.map((br: any) => (
                    <option key={br._id} value={br._id}>{br.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-500 block mb-1.5">Category *</label>
                  <select
                    required
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory(""); setShades([]); }}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white outline-none"
                  >
                    <option value="">Select category</option>
                    {categories?.map((cat: ICategory) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-500 block mb-1.5">Sub Category</label>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    disabled={!selectedCategory}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white disabled:bg-slate-50 outline-none"
                  >
                    <option value="">Select sub category</option>
                    {availableSubCategoryItems.map((name, idx) => (
                      <option key={idx} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SHADES SETUP (CONDITIONAL) */}
            {isMakeupSelected && (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 transition-all duration-300">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-[#1E293B]">Product Shades Setup</h2>
                  </div>
                  <button
                    type="button"
                    onClick={addShadeField}
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all"
                  >
                    <Plus size={14} /> Add Shade
                  </button>
                </div>

                {shades.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 italic">No shades added yet.</p>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    {shades.map((shade, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 w-full">
                          <div>
                            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Shade Name</label>
                            <input type="text" required placeholder="e.g., NC15" value={shade.shadeName} onChange={(e) => handleShadeChange(idx, "shadeName", e.target.value)} className="w-full p-2 border rounded-lg bg-white outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Color Picker</label>
                            <div className="flex items-center gap-2 border rounded-lg bg-white p-1">
                              <input type="color" value={shade.shadeColorCode} onChange={(e) => handleShadeChange(idx, "shadeColorCode", e.target.value)} className="w-8 h-7 border-0 cursor-pointer p-0" />
                              <span className="text-[11px] font-mono">{shade.shadeColorCode}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Stock</label>
                            <input type="number" required placeholder="50" value={shade.stock} onChange={(e) => handleShadeChange(idx, "stock", e.target.value !== "" ? Number(e.target.value) : "")} className="w-full p-2 border rounded-lg bg-white outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Shade Image</label>
                            <div className="border rounded-lg bg-white p-1 flex items-center gap-2 max-h-[38px]">
                              {shade.shadePreview ? (
                                <div className="relative w-8 h-7 border rounded bg-slate-50 flex items-center justify-center overflow-hidden">
                                  <img src={shade.shadePreview} alt="shade" className="w-full h-full object-cover" />
                                  <button type="button" onClick={() => { handleShadeChange(idx, "shadeFile", null); handleShadeChange(idx, "shadePreview", ""); }} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"><X size={10} /></button>
                                </div>
                              ) : (
                                <label className="cursor-pointer flex items-center gap-1.5 text-slate-500 hover:text-slate-800 p-1">
                                  <Upload size={12} className="text-orange-400" />
                                  <span className="text-[10px] font-medium">Upload File</span>
                                  <input type="file" accept="image/*" onChange={(e) => handleShadeImageChange(idx, e)} className="hidden" />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeShadeField(idx)} className="text-slate-400 hover:text-red-500 p-1 md:mt-4 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DESCRIPTIONS & USAGE */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-sm font-bold text-[#1E293B]">Descriptions & Usage</h2>
              
              <div className="space-y-2">
                <label className="font-semibold text-slate-500 block mb-1">Product Description *</label>
                <div className="prose-editor bg-white rounded-xl overflow-hidden border border-slate-200">
                  <DynamicReactQuill 
                    theme="snow" 
                    value={description} 
                    onChange={setDescription} 
                    modules={editorModules}
                    placeholder="Write detailed product specifications..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-500 block mb-1">How To Use</label>
                <div className="prose-editor bg-white rounded-xl overflow-hidden border border-slate-200">
                  <DynamicReactQuill 
                    theme="snow" 
                    value={howToUse} 
                    onChange={setHowToUse} 
                    modules={editorModules}
                    placeholder="Step-by-step application guide..."
                  />
                </div>
              </div>
            </div>

            {/* MEDIA FILES BOX */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-[#1E293B]">Product Media Files</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Main Image */}
                <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-[#F8FAFC] flex flex-col items-center justify-center min-h-[140px] relative">
                  {singleImagePreview ? (
                    <div className="relative h-24 flex items-center justify-center">
                      <img src={singleImagePreview} className="max-h-full object-contain rounded-lg" />
                      <button type="button" onClick={() => { setSingleImage(null); setSingleImagePreview(null); }} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"><X size={10} /></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer text-center">
                      <Upload className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                      <span className="font-bold text-slate-700 block">Main Image</span>
                      <input type="file" accept="image/*" onChange={handleSingleImageChange} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Additional Multi Images */}
                <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-[#F8FAFC] flex flex-col items-center justify-center min-h-[140px]">
                  {multiImagePreviews.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      {multiImagePreviews.map((src, idx) => (
                        <div key={idx} className="relative bg-white border border-slate-200 p-1 rounded-lg flex items-center justify-center h-11">
                          <img src={src} className="max-h-full object-contain" />
                          <button type="button" onClick={() => removeMultiImage(idx)} className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full"><X size={8} /></button>
                        </div>
                      ))}
                      {multiImagePreviews.length < 3 && (
                        <label className="border border-dashed border-slate-200 rounded-lg flex items-center justify-center h-11 cursor-pointer bg-white">
                          <Plus size={14} />
                          <input type="file" accept="image/*" multiple onChange={handleMultiImageChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  ) : (
                    <label className="cursor-pointer text-center">
                      <Upload className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                      <span className="font-bold text-slate-700 block">Gallery Images (Max 3)</span>
                      <input type="file" accept="image/*" multiple onChange={handleMultiImageChange} className="hidden" />
                    </label>
                  )}
                </div>

              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => router.back()} className="px-5 py-2 rounded-xl border bg-white font-medium hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={isCreatingProduct} className="px-6 py-2 bg-slate-900 hover:bg-black text-white font-medium rounded-xl flex items-center gap-2 disabled:bg-slate-400">
                {isCreatingProduct && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Product
              </button>
            </div>

          </div>

          {/* LIVE PREVIEW */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm sticky top-6 space-y-4">
            <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Live Preview</h3>
            <div className="border border-slate-100 rounded-xl p-4 bg-white flex gap-4 items-start">
              <div className="w-16 h-16 bg-[#F1F5F9] rounded-lg flex items-center justify-center overflow-hidden shrink-0 border">
                {singleImagePreview ? <img src={singleImagePreview} className="w-full h-full object-cover" /> : <span className="text-[9px] text-slate-400">No Img</span>}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 truncate text-sm">{productName || "Product Title"}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{productCode || "Code: —"}</p>
                <div className="h-[2px] w-4 bg-orange-400 my-2 rounded" />
                <div className="grid grid-cols-2 gap-y-1 text-slate-500 font-medium text-[11px]">
                  <div>Price:</div>
                  <div className="text-slate-900 text-right font-bold">{sellPrice ? `৳ ${sellPrice}` : "—"}</div>
                  <div>Old Price:</div>
                  <div className="text-slate-500 text-right line-through">{regularPrice ? `৳ ${regularPrice}` : "—"}</div>
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
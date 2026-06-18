

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Loader2, Upload, X, Plus, Trash2 } from "lucide-react";
import { ICategory, ISubCategoryItem } from "@/types/category.interface";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts"; 

interface IShadeState {
  shadeName: string;
  shadeColorCode: string;
  shadeFile: File | null;
  shadePreview: string; // এক্সিস্টিং ইমেজ URL অথবা নতুন প্রিভিউ URL হোল্ড করবে
  stock: number | "";
  status: "Active" | "Inactive";
  isExisting?: boolean; // সার্ভারের পুরাতন ইমেজ নাকি নতুন ফাইল তা ট্র্যাক করার জন্য
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any; 
  onSuccess: () => void; 
}

export default function EditProductModal({ isOpen, onClose, product, onSuccess }: EditProductModalProps) {
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  
  // 💡 আপনার কাস্টম হুক থেকে মেথড এবং লোডিং স্টেট নিয়ে আসা হলো
  const { updateProduct, isSaving } = useProducts(product?.productCode);

  // --- FORM STATES ---
  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [skinType, setSkinType] = useState("All");
  const [promotion, setPromotion] = useState("None");
  
  const [sellPrice, setSellPrice] = useState<number | "">("");
  const [regularPrice, setRegularPrice] = useState<number | "">("");
  const [weightOrVolume, setWeightOrVolume] = useState<number | "">(30);
  const [unit, setUnit] = useState("ml");
  const [productStatus, setProductStatus] = useState<"Active" | "Inactive">("Active");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [description, setDescription] = useState("");
  const [howToUse, setHowToUse] = useState("");

  // ইমেজ স্টেট
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [singleImage, setSingleImage] = useState<File | null>(null);
  const [singleImagePreview, setSingleImagePreview] = useState<string | null>(null);
  const [multiImages, setMultiImages] = useState<File[]>([]);
  const [multiImagePreviews, setMultiImagePreviews] = useState<string[]>([]);

  // 💡 SHADES STATE
  const [shades, setShades] = useState<IShadeState[]>([]);

  // 💡 মডাল ওপেন হলে বা প্রোডাক্ট চেঞ্জ হলে এক্সিস্টিং ডাটা পপুলেট করা
  useEffect(() => {
    if (isOpen && product) {
      setProductCode(product.productCode || "");
      setProductName(product.name || "");
      setBrand(product.brand || "");
      setSkinType(product.skinType || "All");
      setPromotion(product.promotion || "None");
      setSellPrice(product.price || "");
      setRegularPrice(product.oldPrice || "");
      setWeightOrVolume(product.weightOrVolume || 30);
      setUnit(product.unit || "ml");
      setProductStatus(product.status || "Active");
      
      setSelectedCategory(typeof product.category === 'object' ? product.category?._id : product.category || "");
      setSelectedSubCategory(product.itemName || "");
      setDescription(product.description || "");
      setHowToUse(product.howToUse || "");
      setExistingImages(product.commonImages || []);
      
      // এক্সিস্টিং শেড থাকলে তা স্টেট-এ ম্যাপ করা
      if (product.shades && Array.isArray(product.shades)) {
        const loadedShades = product.shades.map((sh: any) => ({
          shadeName: sh.shadeName || "",
          shadeColorCode: sh.shadeColorCode || "#000000",
          shadeFile: null,
          shadePreview: sh.shadeImages || "", 
          stock: sh.stock || "",
          status: sh.status || "Active",
          isExisting: true
        }));
        setShades(loadedShades);
      } else {
        setShades([]);
      }

      // নিউ আপলোডস ক্লিয়ার
      setSingleImage(null);
      setSingleImagePreview(null);
      setMultiImages([]);
      setMultiImagePreviews([]);
    }
  }, [isOpen, product]);

  // বর্তমান সিলেক্টেড ক্যাটাগরি "Makeup" কিনা চেক করার মেমো
  const isMakeupSelected = useMemo(() => {
    const matched = categories?.find((cat) => cat._id === selectedCategory);
    return matched?.name?.toLowerCase() === "makeup";
  }, [selectedCategory, categories]);

  // সাব-ক্যাটাগরি ফিল্টার মেমো
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

  if (!isOpen || !product) return null;

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
      setMultiImagePreviews((prev) => [...prev, ...filesArray.map((f) => URL.createObjectURL(f))]);
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
      { shadeName: "", shadeColorCode: "#000000", shadeFile: null, shadePreview: "", stock: "", status: "Active", isExisting: false }
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
      handleShadeChange(index, "isExisting", false);
    }
  };

  // --- SUBMIT UPDATE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    const matchedCat = categories?.find((cat) => cat._id === selectedCategory);
    const subCategoryGroupTitle = matchedCat?.subCategories.find((sub) =>
      sub.items.some((item) => (typeof item === "object" ? item.name : item) === selectedSubCategory)
    )?.title || "";

    const totalStock = isMakeupSelected 
      ? shades.reduce((acc, curr) => acc + Number(curr.stock || 0), 0)
      : product.stock || 50;

    const productPayload: any = {
      name: productName,
      category: selectedCategory,
      subCategory: subCategoryGroupTitle,
      itemName: selectedSubCategory,
      price: Number(sellPrice),
      oldPrice: regularPrice ? Number(regularPrice) : undefined,
      description: description,
      howToUse: howToUse,
      skinType: skinType,
      promotion: promotion !== "None" ? promotion : undefined,
      availability: totalStock > 0 ? "In Stock" : "Out of Stock",
      status: productStatus,
      weightOrVolume: Number(weightOrVolume),
      unit: unit,
      shades: []
    };

    if (isMakeupSelected) {
      productPayload.shades = shades.map((sh, idx) => ({
        shadeName: sh.shadeName,
        shadeColorCode: sh.shadeColorCode,
        stock: Number(sh.stock || 0),
        status: sh.status,
        shadeImages: sh.isExisting ? sh.shadePreview : undefined,
        index: idx
      }));
    }

    formData.append("data", JSON.stringify(productPayload));
    
    if (singleImage) formData.append("commonImages", singleImage);
    multiImages.forEach((file) => formData.append("commonImages", file));

    if (isMakeupSelected) {
      shades.forEach((sh) => {
        if (sh.shadeFile) {
          formData.append("shadeImages", sh.shadeFile);
        }
      });
    }

    try {
      // 💡 আপনার কাস্টম API হুকের updateProduct মেথড এখানে ব্যবহার করা হলো
      await updateProduct({ productCode: product.productCode, formData });
      alert("Product updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to update product.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-5xl rounded-2xl bg-[#FAFAFA] p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B] font-serif">📝 Edit Product Configuration</h2>
            <p className="text-xs text-slate-400 mt-0.5">Modify properties for Code: {productCode}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {isCategoriesLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-700" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-xs">
            
            {/* LEFT FIELDS */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* BASIC INFO */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">Product Code</label>
                    <input type="text" value={productCode} disabled className="w-full border rounded-lg p-2.5 bg-gray-50 text-slate-400 cursor-not-allowed font-mono" />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">Product Name *</label>
                    <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} required className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-400 bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">Brand</label>
                    <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full border rounded-lg p-2.5 bg-white">
                      <option value="">Select brand</option>
                      <option value="Sreyoshi">Sreyoshi</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">Skin Type</label>
                    <select value={skinType} onChange={(e) => setSkinType(e.target.value)} className="w-full border rounded-lg p-2.5 bg-white">
                      <option value="All">All</option>
                      <option value="Oily">Oily</option>
                      <option value="Dry">Dry</option>
                      <option value="Sensitive">Sensitive</option>
                      <option value="Normal">Normal</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">Promotion</label>
                    <select value={promotion} onChange={(e) => setPromotion(e.target.value)} className="w-full border rounded-lg p-2.5 bg-white">
                      <option value="None">None</option>
                      <option value="New Arrivals">New Arrivals</option>
                      <option value="Best Sellers">Best Sellers</option>
                      <option value="Trending">Trending</option>
                    </select>
                  </div>
                </div>

                {/* DETAILS INNER BOX */}
                <div className="bg-[#F8FAFC] border border-slate-200/60 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Price (৳) *</label>
                      <input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value !== "" ? Number(e.target.value) : "")} required className="w-full border rounded-lg p-2 bg-white" />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Old Price (৳)</label>
                      <input type="number" value={regularPrice} onChange={(e) => setRegularPrice(e.target.value !== "" ? Number(e.target.value) : "")} className="w-full border rounded-lg p-2 bg-white" />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Weight/Vol</label>
                      <input type="number" value={weightOrVolume} onChange={(e) => setWeightOrVolume(e.target.value !== "" ? Number(e.target.value) : "")} className="w-full border rounded-lg p-2 bg-white" />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Unit</label>
                      <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full border rounded-lg p-2 bg-white">
                        <option value="ml">ml</option>
                        <option value="gm">gm</option>
                        <option value="pcs">pcs</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between max-w-xs pt-2">
                    <span className="font-semibold text-slate-600">Product Status</span>
                    <button type="button" onClick={() => setProductStatus(productStatus === "Active" ? "Inactive" : "Active")} className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${productStatus === "Active" ? "bg-orange-500" : "bg-slate-200"}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow transform transition ${productStatus === "Active" ? "translate-x-4" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* CATEGORIES */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-500 block mb-1">Category *</label>
                  <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory(""); setShades([]); }} required className="w-full border rounded-lg p-2.5 bg-white">
                    <option value="">Select category</option>
                    {categories?.map((cat: ICategory) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-500 block mb-1">Sub Category</label>
                  <select value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)} disabled={!selectedCategory} className="w-full border rounded-lg p-2.5 bg-white disabled:bg-slate-50">
                    <option value="">Select sub category</option>
                    {availableSubCategoryItems.map((name, idx) => <option key={idx} value={name}>{name}</option>)}
                  </select>
                </div>
              </div>

              {/* SHADES MANAGEMENT CARD - CONDITIONAL */}
              {isMakeupSelected && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-bold text-slate-800 text-sm">Product Shades Setup</h3>
                    <button type="button" onClick={addShadeField} className="flex items-center gap-1 bg-orange-500 text-white font-bold px-2.5 py-1.5 rounded-lg">
                      <Plus size={12} /> Add Shade
                    </button>
                  </div>

                  {shades.length === 0 ? (
                    <p className="text-center py-4 text-slate-400 italic">No shades added for this makeup product.</p>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {shades.map((shade, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1 w-full">
                            <div>
                              <input type="text" required placeholder="Shade Name" value={shade.shadeName} onChange={(e) => handleShadeChange(idx, "shadeName", e.target.value)} className="w-full p-1.5 border rounded bg-white" />
                            </div>
                            <div className="flex items-center gap-1.5 border rounded bg-white p-1">
                              <input type="color" value={shade.shadeColorCode} onChange={(e) => handleShadeChange(idx, "shadeColorCode", e.target.value)} className="w-6 h-6 border-0 cursor-pointer" />
                              <span className="font-mono text-[10px]">{shade.shadeColorCode}</span>
                            </div>
                            <div>
                              <input type="number" required placeholder="Stock" value={shade.stock} onChange={(e) => handleShadeChange(idx, "stock", e.target.value !== "" ? Number(e.target.value) : "")} className="w-full p-1.5 border rounded bg-white" />
                            </div>
                            <div>
                              <div className="border rounded bg-white p-1 flex items-center justify-between">
                                {shade.shadePreview ? (
                                  <div className="relative w-6 h-5 border rounded overflow-hidden">
                                    <img src={shade.shadePreview} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => { handleShadeChange(idx, "shadeFile", null); handleShadeChange(idx, "shadePreview", ""); handleShadeChange(idx, "isExisting", false); }} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100"><X size={8} /></button>
                                  </div>
                                ) : (
                                  <label className="cursor-pointer text-[10px] text-orange-400 font-semibold flex items-center gap-1">
                                    <Upload size={10} /> Upload
                                    <input type="file" accept="image/*" onChange={(e) => handleShadeImageChange(idx, e)} className="hidden" />
                                  </label>
                                )}
                              </div>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeShadeField(idx)} className="text-slate-400 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DESCRIPTION & HOW TO USE */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <label className="font-semibold text-slate-500 block mb-1">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border rounded-lg p-3 outline-none focus:border-orange-400 resize-none" placeholder="Detailed specifications..." />
                </div>
                <div>
                  <label className="font-semibold text-slate-500 block mb-1">How To Use</label>
                  <textarea value={howToUse} onChange={(e) => setHowToUse(e.target.value)} rows={3} className="w-full border rounded-lg p-3 outline-none focus:border-orange-400 resize-none" placeholder="Application guide..." />
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR IMAGES */}
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Media & Images</h3>
                
                {/* CURRENT IMAGES */}
                {existingImages.length > 0 && (
                  <div>
                    <span className="block font-semibold text-slate-400 text-[10px] uppercase tracking-wider mb-2">Active Server Images</span>
                    <div className="flex flex-wrap gap-2">
                      {existingImages.map((img, i) => (
                        <div key={i} className="relative w-12 h-12 border rounded-lg overflow-hidden bg-slate-50">
                          <img src={img} alt="server image" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* NEW SINGLE IMAGE */}
                <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-[#F8FAFC] text-center min-h-[100px] flex items-center justify-center relative">
                  {singleImagePreview ? (
                    <div className="relative w-full h-20 flex items-center justify-center">
                      <img src={singleImagePreview} className="max-h-full object-contain rounded" />
                      <button type="button" onClick={() => { setSingleImage(null); setSingleImagePreview(null); }} className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full"><X size={10} /></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                      <span className="font-bold text-slate-700 block">Replace Main Image</span>
                      <input type="file" accept="image/*" onChange={handleSingleImageChange} className="hidden" />
                    </label>
                  )}
                </div>

                {/* NEW GALLERY IMAGES */}
                <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-[#F8FAFC] text-center min-h-[100px] flex items-center justify-center relative">
                  {multiImagePreviews.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      {multiImagePreviews.map((src, idx) => (
                        <div key={idx} className="relative bg-white border border-slate-200 p-1 rounded-lg flex items-center justify-center h-11 shadow-sm">
                          <img src={src} className="max-h-full object-contain" />
                          <button type="button" onClick={() => removeMultiImage(idx)} className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full"><X size={8} /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                      <span className="font-bold text-slate-700 block">Upload New Gallery Files</span>
                      <input type="file" accept="image/*" multiple onChange={handleMultiImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-slate-600 bg-white font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                {/* 💡 isSaving স্টেট ব্যবহার করে বাটন নিষ্ক্রিয় করা হলো এবং স্পিনার লোডার দেওয়া হলো */}
                <button type="submit" disabled={isSaving} className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:bg-slate-300">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Now
                </button>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}



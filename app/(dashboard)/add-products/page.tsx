"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";
import { useProducts } from "@/hooks/useProducts";
import { ICategory } from "@/types/category.interface";
import { IProductShadeState, ProductUnit, ProductStatus } from "../../../types/shade.interface";

// কম্পোনেন্ট ইম্পোর্ট
import BasicInfoForm from "./_components/BasicInfoForm";
import CategoryBrandForm from "./_components/CategoryBrandForm";
import ShadesConfigForm from "./_components/ShadesConfigForm";
import ProductMediaForm from "./_components/ProductMediaForm";

export default function AddProductPage() {
  const router = useRouter();
  const { categories = [], isLoading: isCategoriesLoading } = useCategories();
  const { brands = [], isLoadingBrands } = useBrands();
  const { createProduct } = useProducts();
  
  const [isCreatingProduct, setIsCreatingProduct] = useState<boolean>(false);

  // --- FORM STATES ---
  const [productCode, setProductCode] = useState<string>(""); 
  const [productName, setProductName] = useState<string>("");
  const [skinType, setSkinType] = useState<string>("All");
  const [promotion, setPromotion] = useState<string>("None");
  
  const [sellPrice, setSellPrice] = useState<number | "">("");
  const [regularPrice, setRegularPrice] = useState<number | "">(""); 
  const [weightOrVolume, setWeightOrVolume] = useState<number | "">(30);
  const [unit, setUnit] = useState<ProductUnit>("ml"); 
  const [productStatus, setProductStatus] = useState<ProductStatus>("Active");

  const [selectedBrand, setSelectedBrand] = useState<string>(""); 
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(""); 

  // 💡 মেইকআপ বাদে অন্য ক্যাটাগরির জন্য ম্যানুয়াল স্টক স্টেট
  const [manualStock, setManualStock] = useState<number | "">("");
  const [derivedTotalStock, setDerivedTotalStock] = useState<number>(0);

  const [description, setDescription] = useState<string>("");
  const [howToUse, setHowToUse] = useState<string>("");

  // IMAGE STATES
  const [singleImage, setSingleImage] = useState<File | null>(null);
  const [singleImagePreview, setSingleImagePreview] = useState<string | null>(null);
  const [multiImages, setMultiImages] = useState<File[]>([]);
  const [multiImagePreviews, setMultiImagePreviews] = useState<string[]>([]);

  // SHADES STATE
  const [shades, setShades] = useState<IProductShadeState[]>([]);

  // মেকআপ ক্যাটেগরি চেক
  const isMakeupSelected = useMemo<boolean>(() => {
    const matched = categories?.find((cat: ICategory) => cat._id === selectedCategory);
    return matched?.name?.toLowerCase() === "makeup";
  }, [selectedCategory, categories]);

  // 💡 শেড কনফিগার ফর্ম থেকে টোটাল স্টক রিসিভ করার মেথড
  const handleShadeTotalStockChange = useCallback((total: number) => {
    setDerivedTotalStock(total);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanDescription = description.replace(/<(.|\n)*?>/g, "").trim() === "" ? "" : description;
    const cleanHowToUse = howToUse.replace(/<(.|\n)*?>/g, "").trim() === "" ? "" : howToUse;

    if (!productCode || !productName || !sellPrice || !selectedBrand || !selectedCategory || !cleanDescription) {
      alert("Please fill out required fields (SKU, Name, Price, Brand, Category, and Description).");
      return;
    }

    // 💡 ফাইনাল স্টক নির্ধারণ: মেকআপ হলে অটো-ক্যালকুলেটেড স্টক, না হলে ম্যানুয়াল ইনপুট স্টক
    const finalTotalStock = isMakeupSelected ? derivedTotalStock : Number(manualStock || 0);

    setIsCreatingProduct(true);
    const formData = new FormData();
    
    const matchedCat = categories?.find((cat: ICategory) => cat._id === selectedCategory);
    const subCategoryGroupTitle = matchedCat?.subCategories.find((sub) =>
      sub.items.some((item) => (typeof item === "object" ? item.name : item) === selectedSubCategory)
    )?.title || "General";

    const productPayload = {
      productCode,
      name: productName,
      category: selectedCategory,
      brand: selectedBrand,
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
      totalStock: finalTotalStock, // 💡 ডাইনামিক স্টক অ্যাসাইন
      availability: finalTotalStock > 0 ? "In Stock" : "Out of Stock",
      status: productStatus,
      weightOrVolume: Number(weightOrVolume),
      unit: unit, 
      shades: isMakeupSelected ? shades.map((sh) => ({
        shadeName: sh.shadeName,
        shadeColorCode: sh.shadeColorCode,
        stock: Number(sh.stock || 0),
        status: sh.status
      })) : []
    };

    formData.append("data", JSON.stringify(productPayload));

    if (singleImage) formData.append("commonImages", singleImage);
    multiImages.slice(0, 3).forEach((file) => formData.append("commonImages", file));

    try {
      await createProduct(formData);
      alert("Product saved successfully!");
      router.push("/products");
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Failed to save product.");
    } finally {
      setIsCreatingProduct(false);
    }
  };

  if (isCategoriesLoading || isLoadingBrands) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
        <p className="text-sm text-slate-400">Loading configurations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-[#FAFAFA] text-slate-800 antialiased text-xs">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B] font-serif">Add New Product</h1>
        <p className="text-slate-400 mt-1">Fill out specifications and dynamic product variants below.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <BasicInfoForm 
            productCode={productCode} setProductCode={setProductCode}
            productName={productName} setProductName={setProductName}
            skinType={skinType} setSkinType={setSkinType}
            promotion={promotion} setPromotion={setPromotion}
            sellPrice={sellPrice} setSellPrice={setSellPrice}
            regularPrice={regularPrice} setRegularPrice={setRegularPrice}
            weightOrVolume={weightOrVolume} setWeightOrVolume={setWeightOrVolume}
            unit={unit} setUnit={setUnit}
            productStatus={productStatus} setProductStatus={setProductStatus}
            description={description} setDescription={setDescription}
            howToUse={howToUse} setHowToUse={setHowToUse}
          />

          <CategoryBrandForm 
            categories={categories}
            brands={brands}
            selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand}
            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
            selectedSubCategory={selectedSubCategory} setSelectedSubCategory={setSelectedSubCategory}
            setShades={setShades}
          />

          {/* 💡 কন্ডিশনাল রেন্ডারিং লজিক */}
          {isMakeupSelected ? (
            <ShadesConfigForm 
              selectedSubCategory={selectedSubCategory}
              shades={shades}
              setShades={setShades}
              onChangeTotalStock={handleShadeTotalStockChange} // আপডেটেড কলব্যাক পাস
            />
          ) : (
            selectedSubCategory && (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Total Product Stock *</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="Enter total stock quantity"
                  value={manualStock}
                  onChange={(e) => setManualStock(e.target.value !== "" ? Number(e.target.value) : "")}
                  className="w-full sm:w-1/2 p-2 text-xs border rounded-xl bg-white focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>
            )
          )}

          <ProductMediaForm 
            singleImagePreview={singleImagePreview} setSingleImage={setSingleImage} setSingleImagePreview={setSingleImagePreview}
            multiImages={multiImages} setMultiImages={setMultiImages}
            multiImagePreviews={multiImagePreviews} setMultiImagePreviews={setMultiImagePreviews}
          />

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => router.back()} className="px-5 py-2 rounded-xl border bg-white font-medium hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isCreatingProduct} className="px-6 py-2 bg-slate-900 hover:bg-black text-white font-medium rounded-xl flex items-center gap-2 disabled:bg-slate-400">
              {isCreatingProduct && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Product
            </button>
          </div>

        </div>

        {/* LIVE PREVIEW BOX */}
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
                <div>Total Stock:</div>
                <div className="text-slate-900 text-right font-bold">
                  {isMakeupSelected ? derivedTotalStock : (manualStock || 0)} pcs
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
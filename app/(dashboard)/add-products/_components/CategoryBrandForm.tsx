"use client";

import React, { useMemo } from "react";
import { ICategory, ISubCategoryItem } from "@/types/category.interface";
import { IProductShadeState } from "@/types/shade.interface";


interface IBrand {
  _id: string;
  name: string;
}

interface CategoryBrandFormProps {
  categories: ICategory[];
  brands: IBrand[];
  selectedBrand: string; setSelectedBrand: (val: string) => void;
  selectedCategory: string; setSelectedCategory: (val: string) => void;
  selectedSubCategory: string; setSelectedSubCategory: (val: string) => void;
  setShades: React.Dispatch<React.SetStateAction<IProductShadeState[]>>;
}

export default function CategoryBrandForm({
  categories,
  brands,
  selectedBrand, setSelectedBrand,
  selectedCategory, setSelectedCategory,
  selectedSubCategory, setSelectedSubCategory,
  setShades
}: CategoryBrandFormProps) {

  const availableSubCategoryItems = useMemo<string[]>(() => {
    if (!categories || categories.length === 0) return [];
    const matchedCat = categories.find((cat: ICategory) => cat._id === selectedCategory);
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

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div>
        <label className="font-semibold text-slate-500 block mb-1.5">Brand *</label>
        <select required value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 bg-white">
          <option value="">Select brand</option>
          {brands?.map((br: IBrand) => (
            <option key={br._id} value={br._id}>{br.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-semibold text-slate-500 block mb-1.5">Category *</label>
          <select required value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory(""); setShades([]); }} className="w-full border border-slate-200 rounded-xl p-2.5 bg-white">
            <option value="">Select category</option>
            {categories?.map((cat: ICategory) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-semibold text-slate-500 block mb-1.5">Sub Category Item *</label>
          <select required value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)} disabled={!selectedCategory} className="w-full border border-slate-200 rounded-xl p-2.5 bg-white disabled:bg-slate-50">
            <option value="">Select item name</option>
            {availableSubCategoryItems.map((name, idx) => (
              <option key={idx} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
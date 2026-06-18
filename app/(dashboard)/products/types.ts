export interface IProductShade {
  shadeName: string;
  shadeColorCode?: string;
  shadeImages: string;
  stock: number;
  status: 'Active' | 'Inactive';
}

export interface IProduct {
  _id: string;
  productCode: string;
  name: string;
  category: { _id: string; name: string } | string;
  subCategory: string;
  itemName: string;
  skinType?: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  isDiscountDisabled: boolean;
  description: string;
  howToUse?: string;
  rating: number;
  ratingCount: number;
  salesCount: number;
  promotion?: 'Best Sellers' | 'New Arrivals' | 'Trending';
  availability: 'In Stock' | 'Out of Stock';
  status: 'Active' | 'Inactive';
  commonImages: string[];
  weightOrVolume: number;
  unit: 'gm' | 'ml';
  shades?: IProductShade[];
}

export interface ICategory {
  _id: string;
  name: string;
}
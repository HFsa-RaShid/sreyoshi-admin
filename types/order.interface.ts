/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IOrderProduct {
  _id?: string;
  product: {
    _id: string;
    name: string;
    images?: string[];
    [key: string]: any; 
  } | string; 
  quantity: number;
  price: number;
  shadeName?: string;
}

export interface IShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  email?: string;
}

export interface IOrderResponse {
  _id: string;
  user?: string;
  orderItems: IOrderProduct[];
  shippingAddress: IShippingAddress;
  totalPrice: number;
  paymentMethod: "COD" | "SSLCommerz";
  paymentStatus: "Pending" | "Paid" | "Failed";
  orderStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  transactionId: string;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}
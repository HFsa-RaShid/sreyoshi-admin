/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react'; 
import axios from 'axios';

export interface ICoupon {
  _id?: string;
  code: string;
  discountPercentage: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  expiryDate: string | Date;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/coupons`;

export const useCoupons = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession(); 

  const getAuthHeaders = () => {
   
    const token = (session?.user as any)?.accessToken;
    

    console.log("--- 🔑 NEXTAUTH COUPON TOKEN CHECK ---");
    console.log("Extracted Token:", token);

    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  
  const { data: coupons = [], isLoading, error } = useQuery<ICoupon[]>({
    queryKey: ['coupons'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/all-coupons`); 
      return res.data?.data || res.data;
    },
  });

  
  const addCouponMutation = useMutation({
    mutationFn: async (data: Omit<ICoupon, '_id'>) => {
      const res = await axios.post(`${API_URL}/create-coupon`, data, {
        headers: getAuthHeaders() 
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  // ৩. কুপন আপডেট করার মিউটেশন
  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ICoupon> }) => {
      const res = await axios.patch(`${API_URL}/update-coupon/${id}`, data, {
        headers: getAuthHeaders() 
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  // ৪. কুপন ডিলিট করার মিউটেশন
  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`${API_URL}/delete-coupon/${id}`, {
        headers: getAuthHeaders() 
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  return {
    coupons,
    isLoading,
    error,
    addCoupon: addCouponMutation.mutateAsync,
    updateCoupon: updateCouponMutation.mutateAsync,
    deleteCoupon: deleteCouponMutation.mutateAsync,
    isSaving: addCouponMutation.isPending || updateCouponMutation.isPending,
  };
};
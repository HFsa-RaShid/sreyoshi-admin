// src/hooks/useShades.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { IShade, IShadePayload } from '@/types/shade.interface';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/shades`;

// API Methods with Strict Types
export const shadeApi = {
  getAllShades: async (itemName?: string): Promise<IShade[]> => {
    // যদি itemName পাঠানো হয় তবে কুয়েরি প্যারাম হিসেবে যাবে, নতুবা সব আসবে
    const url = itemName ? `${API_BASE_URL}?itemName=${itemName}` : API_BASE_URL;
    const res = await axios.get(url);
    return res.data?.data || res.data;
  },

  createShade: async (data: IShadePayload): Promise<IShade> => {
    const res = await axios.post(API_BASE_URL, data);
    return res.data;
  },

  updateShade: async ({ id, data }: { id: string; data: Partial<IShadePayload> }): Promise<IShade> => {
    const res = await axios.patch(`${API_BASE_URL}/${id}`, data);
    return res.data;
  },

  deleteShade: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await axios.delete(`${API_BASE_URL}/${id}`);
    return res.data;
  }
};

// Custom Hook with Optional Filter
export const useShades = (itemName?: string) => {
  const queryClient = useQueryClient();

  // itemName চেঞ্জ হলে রিয়্যাক্ট কুয়েরি অটোমেটিক রি-ফেচ করবে
  const { data: shades = [], isLoading, error } = useQuery<IShade[]>({
    queryKey: ['shades', itemName],
    queryFn: () => shadeApi.getAllShades(itemName),
    enabled: true, // যদি চান itemName ছাড়া কল হবে না, তবে দিতে পারেন: enabled: !!itemName
  });

  const addShadeMutation = useMutation({
    mutationFn: shadeApi.createShade,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shades'] }),
  });

  const updateShadeMutation = useMutation({
    mutationFn: shadeApi.updateShade,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shades'] }),
  });

  const deleteShadeMutation = useMutation({
    mutationFn: shadeApi.deleteShade,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shades'] }),
  });

  return {
    shades,
    isLoading,
    error,
    addShade: addShadeMutation.mutateAsync,
    updateShade: updateShadeMutation.mutateAsync,
    deleteShade: deleteShadeMutation.mutateAsync,
  };
};
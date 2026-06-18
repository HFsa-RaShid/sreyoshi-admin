/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/shades`;

// API Methods
export const shadeApi = {
  getAllShades: async () => {
    const res = await axios.get(API_BASE_URL);
    // যদি ব্যাকএন্ড ডাটা রেসপন্স এর .data.data তে পাঠায় (যেমন আপনার ক্যাটাগরি হুকে ছিল)
    return res.data?.data || res.data;
  },

  createShade: async (data: any) => {
    const res = await axios.post(API_BASE_URL, data);
    return res.data;
  },

  // 👇 এই ফাংশনটি PUT থেকে PATCH এ পরিবর্তন করা হয়েছে
  updateShade: async ({ id, data }: { id: string; data: any }) => {
    const res = await axios.patch(`${API_BASE_URL}/${id}`, data); // 👈 FIXED: put -> patch
    return res.data;
  },

  deleteShade: async (id: string) => {
    const res = await axios.delete(`${API_BASE_URL}/${id}`);
    return res.data;
  }
};

// Custom Hook (বাকি অংশ অপরিবর্তিত)
export const useShades = () => {
  const queryClient = useQueryClient();

  const { data: shades = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['shades'],
    queryFn: shadeApi.getAllShades,
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
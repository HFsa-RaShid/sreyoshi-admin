/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/shop-settings`;

export const useShopSettings = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const getAuthHeaders = () => {
    const token = (session?.user as any)?.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // READ Settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['shop-settings'],
    queryFn: async () => {
      const res = await axios.get(API_BASE_URL);
      return res.data?.data;
    },
  });


  // UPDATE / CREATE Mutation (useShopSettings.ts)
  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: any) => {
      const formData = new FormData();

      Object.keys(payload).forEach((key) => {
        // যদি লোগো ফিল্ডে নতুন ফাইল সিলেক্ট করা হয়, সেটি ফাইলে রূপান্তর হবে
        // আর যদি আগের স্ট্রিং ইউআরএল-ই থাকে, সেটিও টেক্সট আকারে চলে যাবে
        if (payload[key] !== undefined && payload[key] !== null) {
          formData.append(key, payload[key]);
        }
      });

      const res = await axios.patch(`${API_BASE_URL}/update`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data', // 🎯 ফাইল এনকোডিং সিগন্যাল
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-settings'] });
    },
  });

  // DELETE / RESET Mutation
  const resetSettingsMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`${API_BASE_URL}/reset`, {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-settings'] });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettingsMutation.mutateAsync,
    resetSettings: resetSettingsMutation.mutateAsync,
    isSaving: updateSettingsMutation.isPending,
    isResetting: resetSettingsMutation.isPending,
  };
};
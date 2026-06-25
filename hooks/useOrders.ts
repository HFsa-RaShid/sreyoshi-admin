/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getSession } from 'next-auth/react'; // 🎯 NextAuth ক্লায়েন্ট সেশন ইম্পোর্ট

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/orders`;

// 🎯 ডাইনামিকভাবে সেশন থেকে টোকেন নিয়ে হেডার তৈরি করার ফাংশন
const getAuthHeader = async () => {
  const session: any = await getSession(); // ক্লায়েন্ট সাইড থেকে একটিভ সেশন গেট করা
  const token = session?.user?.accessToken; // আপনার NextAuth কনফিগারেশনের accessToken
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const orderApi = {
  getAllOrders: async () => {
    const headers = await getAuthHeader(); // 👈 হেডার জেনারেট করা হলো
    const res = await axios.get(API_BASE_URL, { headers });
    return res.data?.data || [];
  },

  updateOrder: async ({ id, payload }: { id: string; payload: any }) => {
    const headers = await getAuthHeader();
    const res = await axios.patch(`${API_BASE_URL}/${id}`, payload, { headers });
    return res.data;
  },

  deleteOrder: async (id: string) => {
    const headers = await getAuthHeader();
    const res = await axios.delete(`${API_BASE_URL}/${id}`, { headers });
    return res.data;
  }
};

export const useOrders = () => {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: orderApi.getAllOrders,
  });

  const updateMutation = useMutation({
    mutationFn: orderApi.updateOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: orderApi.deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    updateOrder: updateMutation.mutateAsync,
    deleteOrder: deleteMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react'; // 👈 NextAuth সেশন ইমপোর্ট করা হলো
import axios from 'axios';

interface IDeliveryZone {
  _id: string;
  zoneName: string;
  zoneType: 'inside' | 'outside' | 'specific-city';
  cities: string[];
  charge: number;
  isActive: boolean;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/delivery-charge`;

export const useAdminDelivery = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession(); // 👈 সেশন থেকে ডেটা নেওয়া হচ্ছে

  // 🔒 সেশন থেকে ডায়নামিকালি ফ্রেশ টোকেন বের করার মেথড
  const getAuthHeaders = () => {
    const token = (session?.user as any)?.accessToken;
    
    console.log("--- 🔑 NEXTAUTH DELIVERY TOKEN CHECK ---");
    console.log("Extracted Token:", token);

    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ১. সব ডেলিভারি জোন গেট করা (কুপন মডিউলের মতো এখানে হেডার ছাড়া পাবলিক রাখা হলো)
  const { data: zones = [], isLoading: isLoadingZones, error, refetch } = useQuery<IDeliveryZone[]>({
    queryKey: ['delivery-zones'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/all-zones`);
      return res.data?.data || res.data;
    },
  });

  // ২. নতুন জোন তৈরি করার মিউটেশন (NextAuth হেডার সহ)
  const createZoneMutation = useMutation({
    mutationFn: async (payload: { zoneName: string; zoneType: string; cities: string[]; charge: number }) => {
      const res = await axios.post(`${API_BASE_URL}/create`, payload, {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery-zones'] }),
  });

  // ৩. একটিভ/ইনঅ্যাক্টিভ স্টেট পরিবর্তন করার মিউটেশন (NextAuth হেডার সহ)
  const toggleZoneMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await axios.patch(`${API_BASE_URL}/update/${id}`, { isActive }, {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery-zones'] }),
  });

  // ৪. জোন ডিলিট করার মিউটেশন (NextAuth হেডার সহ)
  const deleteZoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`${API_BASE_URL}/delete/${id}`, {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery-zones'] }),
  });

  return {
    zones,
    isLoadingZones,
    error,
    refetch,
    createZone: createZoneMutation.mutateAsync,
    toggleZoneStatus: async (id: string, currentStatus: boolean) => 
      toggleZoneMutation.mutateAsync({ id, isActive: !currentStatus }),
    deleteZone: deleteZoneMutation.mutateAsync,
    isMutating: createZoneMutation.isPending || toggleZoneMutation.isPending || deleteZoneMutation.isPending,
  };
};
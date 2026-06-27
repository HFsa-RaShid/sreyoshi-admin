/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react'; 
import axios from 'axios';

interface IDeliveryZone {
  _id: string;
  zoneName: string;
  zoneType: 'inside' | 'outside'; // 🎯 আপডেট
  charge: number;
  isActive: boolean;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/delivery-charge`;

export const useAdminDelivery = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession(); 

  const getAuthHeaders = () => {
    const token = (session?.user as any)?.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ১. গেট অল জোনস
  const { data: zones = [], isLoading: isLoadingZones, error, refetch } = useQuery<IDeliveryZone[]>({
    queryKey: ['delivery-zones'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/all-zones`);
      return res.data?.data || res.data;
    },
  });

  // ২. নতুন জোন তৈরি (পেলোড থেকে cities টাইপ ও অবজেক্ট রিমুভড)
  const createZoneMutation = useMutation({
    mutationFn: async (payload: { zoneName: string; zoneType: 'inside' | 'outside'; charge: number }) => {
      const res = await axios.post(`${API_BASE_URL}/create`, payload, {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery-zones'] }),
  });

  // ৩. একটিভ/ইনঅ্যাক্টিভ টগল
  const toggleZoneMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await axios.patch(`${API_BASE_URL}/update/${id}`, { isActive }, {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery-zones'] }),
  });

  // ৪. জোন ডিলিট
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
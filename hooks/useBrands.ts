/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/brands`;

// API Methods
export const brandApi = {
  getAllBrands: async () => {
    const res = await axios.get(API_BASE_URL);
    return res.data?.data || res.data;
  },

  createBrand: async (data: FormData) => {
  
    const res = await axios.post(`${API_BASE_URL}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateBrand: async ({ id, data }: { id: string; data: FormData }) => {
    const res = await axios.patch(`${API_BASE_URL}/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteBrand: async (id: string) => {
    const res = await axios.delete(`${API_BASE_URL}/${id}`);
    return res.data;
  }
};

// Custom Hook
export const useBrands = () => {
  const queryClient = useQueryClient();

  const { data: brands = [], isLoading: isLoadingBrands, error, refetch } = useQuery<any[]>({
    queryKey: ['brands'],
    queryFn: brandApi.getAllBrands,
  });

  const addBrandMutation = useMutation({
    mutationFn: brandApi.createBrand,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  });

  const updateBrandMutation = useMutation({
    mutationFn: brandApi.updateBrand,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  });

  const deleteBrandMutation = useMutation({
    mutationFn: brandApi.deleteBrand,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  });

  return {
    brands,
    isLoadingBrands,
    error,
    refetch,
    addBrand: addBrandMutation.mutateAsync,
    updateBrand: updateBrandMutation.mutateAsync,
    deleteBrand: deleteBrandMutation.mutateAsync,
  };
};
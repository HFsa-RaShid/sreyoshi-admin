import { ICategory } from '@/types/category.interface';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';


const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/categories`;

export const useCategories = () => {
  const queryClient = useQueryClient();

  // ক্যাটাগরি গেট করার সময় ICategory[] অ্যারে ডিফাইন করা হলো
  const { data: categories = [], isLoading, error } = useQuery<ICategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axios.get(API_URL);
      return res.data?.data || res.data;
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  // এখানে ডাটা FormData অথবা আংশিক ক্যাটাগরি অবজেক্ট হতে পারে
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData | Partial<ICategory> }) => {
      const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
      const res = await axios.patch(`${API_URL}/${id}`, data, { headers });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`${API_URL}/${id}`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  return {
    categories,
    isLoading,
    error,
    addCategory: addCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
  };
};
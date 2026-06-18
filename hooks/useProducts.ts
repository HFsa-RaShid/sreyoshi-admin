/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/products`;

export const productApi = {
  getAllProducts: async () => {
    const res = await axios.get(API_BASE_URL);
    return res.data?.data || res.data;
  },
  
  getSingleProduct: async (productCode: string) => {
    if (!productCode) return null;
    const res = await axios.get(`${API_BASE_URL}/${productCode}`);
    return res.data?.data || res.data;
  },

  createProduct: async (formData: FormData) => {
    const res = await axios.post(API_BASE_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateProduct: async ({ productCode, formData }: { productCode: string; formData: FormData }) => {
    const res = await axios.patch(`${API_BASE_URL}/${productCode}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteProduct: async (productCode: string) => {
    const res = await axios.delete(`${API_BASE_URL}/${productCode}`);
    return res.data;
  }
};

export const useProducts = (productCode?: string) => {
  const queryClient = useQueryClient();

  // ১. Read All
  const productsQuery = useQuery<any[]>({
    queryKey: ['products'],
    queryFn: productApi.getAllProducts,
  });

  // ২. Read Single (For Edit Mode)
  const singleProductQuery = useQuery({
    queryKey: ['product', productCode],
    queryFn: () => productApi.getSingleProduct(productCode!),
    enabled: !!productCode,
  });

  // ৩. Create
  const createMutation = useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  // ৪. Update
  const updateMutation = useMutation({
    mutationFn: productApi.updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productCode] });
    },
  });

  // ৫. Delete
  const deleteMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  return {
    products: productsQuery.data || [],
    isLoadingProducts: productsQuery.isLoading,
    product: singleProductQuery.data,
    isLoadingProduct: singleProductQuery.isLoading,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';


export interface IFaq {
  _id?: string;
  question: string;
  answer: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/faqs`; 

export const useFaqs = () => {
  const queryClient = useQueryClient();


  const { data: faqs = [], isLoading, error } = useQuery<IFaq[]>({
    queryKey: ['faqs'],
    queryFn: async () => {
      const res = await axios.get(API_URL);
      return res.data?.data || res.data;
    },
  });

 
  const addFaqMutation = useMutation({
    mutationFn: async (data: Omit<IFaq, '_id'>) => {
      const res = await axios.post(API_URL, data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faqs'] }),
  });

  
  const updateFaqMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<IFaq> }) => {
      const res = await axios.patch(`${API_URL}/${id}`, data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faqs'] }),
  });

 
  const deleteFaqMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`${API_URL}/${id}`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faqs'] }),
  });

  return {
    faqs,
    isLoading,
    error,
    addFaq: addFaqMutation.mutateAsync,
    updateFaq: updateFaqMutation.mutateAsync,
    deleteFaq: deleteFaqMutation.mutateAsync,
    isSaving: addFaqMutation.isPending || updateFaqMutation.isPending, // লোডিং স্পিনারের জন্য কম্বাইন্ড স্টেট
  };
};
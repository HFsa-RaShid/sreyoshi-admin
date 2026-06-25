import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { IUser } from '@/types/user.interface';


const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/users/profile`; // আপনার এপিআই রাউট অনুযায়ী দেবেন

export const useUserProfile = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const getAuthHeaders = () => {
    const token = (session?.user as IUser)?.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ১. কারেন্ট লগইনড ইউজারের প্রোফাইল ডাটা গেট করা
  const { data: user, isLoading, error } = useQuery<IUser>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/me`, { headers: getAuthHeaders() });
      return res.data?.data || res.data;
    },
  });

  // ২. প্রোফাইল বেসিক ডাটা ও ছবি আপডেট (FormData)
  const updateProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.patch(`${API_URL}/update`, formData, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
  });

  // ৩. ইউজার প্রিফারেন্স আপডেট করা (যেমন: নোটিফিকেশন টগল)
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: IUser['preferences']) => {
      const res = await axios.patch(`${API_URL}/preferences`, { preferences }, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
  });

  // ৪. কোনো একটিভ সেশন ফোর্সড রিমুভ/লগআউট করা
  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await axios.delete(`${API_URL}/sessions/${sessionId}`, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
  });

  return {
    user,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutateAsync,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    revokeSession: revokeSessionMutation.mutateAsync,
    isSaving: updateProfileMutation.isPending || updatePreferencesMutation.isPending,
  };
};
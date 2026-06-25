import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { IUser } from '@/types/user.interface';

export const useAdminUsers = (searchTerm: string = '') => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const headers = {
    Authorization: `Bearer ${(session?.user as any)?.accessToken}`,
  };

  const { data: users, isLoading, refetch } = useQuery<IUser[]>({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/users/all-users?search=${searchTerm}`, { headers });
      return res.data?.data || [];
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/users/invite-user`, { email }, { headers });
      return res.data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'user' | 'admin' }) => {
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/update-role/${userId}`, { role }, { headers });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  // 🎯 নতুন: ইউজার ব্লক/আনব্লক করার মিউটেশন
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'active' | 'blocked' }) => {
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/toggle-status/${userId}`, { status }, { headers });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return {
    users,
    isLoading,
    refetch,
    inviteUser: inviteUserMutation.mutateAsync,
    isInviting: inviteUserMutation.isPending,
    updateUserRole: updateRoleMutation.mutateAsync,
    isUpdatingRole: updateRoleMutation.isPending,
    toggleUserStatus: toggleStatusMutation.mutateAsync,
    isStatusToggling: toggleStatusMutation.isPending,
  };
};
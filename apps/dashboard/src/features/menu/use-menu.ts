import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getApiMenuCategories,
  postApiMenuCategories,
  putApiMenuCategoriesId,
  deleteApiMenuCategoriesId,
  getApiMenuItems,
  postApiMenuItems,
  putApiMenuItemsId,
  deleteApiMenuItemsId,
} from '@/api/generated/menu/menu';
import type {
  GetApiMenuItemsParams,
  PostApiMenuCategoriesBody,
  PutApiMenuCategoriesIdBody,
  PostApiMenuItemsBody,
  PutApiMenuItemsIdBody,
} from '@/api/generated/restaurantDashboardAPI.schemas';

export function useMenuCategories() {
  return useQuery({
    queryKey: ['menu-categories'],
    queryFn: () => getApiMenuCategories(),
  });
}

export function useMenuItems(params?: GetApiMenuItemsParams) {
  return useQuery({
    queryKey: ['menu-items', params],
    queryFn: () => getApiMenuItems(params),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PostApiMenuCategoriesBody) => postApiMenuCategories(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu-categories'] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PutApiMenuCategoriesIdBody }) =>
      putApiMenuCategoriesId(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu-categories'] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApiMenuCategoriesId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PostApiMenuItemsBody) => postApiMenuItems(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu-items'] }),
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PutApiMenuItemsIdBody }) =>
      putApiMenuItemsId(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu-items'] }),
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApiMenuItemsId(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu-items'] }),
  });
}

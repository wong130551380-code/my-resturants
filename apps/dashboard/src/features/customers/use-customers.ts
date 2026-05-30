import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getApiCustomers,
  postApiCustomers,
  putApiCustomersId,
  deleteApiCustomersId,
  getApiCustomersIdOrders,
} from '@/api/generated/customers/customers';
import type { Customer, CustomerOrderHistory, GetApiCustomersParams, PostApiCustomersBody, PutApiCustomersIdBody } from '@/api/generated/restaurantDashboardAPI.schemas';

export function useCustomers(filters?: GetApiCustomersParams) {
  const query = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => getApiCustomers(filters),
  });
  return { ...query, data: query.data as unknown as Customer[] };
}

export function useCustomerOrders(customerId: string | null) {
  const query = useQuery({
    queryKey: ['customer-orders', customerId],
    queryFn: () => getApiCustomersIdOrders(customerId!),
    enabled: !!customerId,
  });
  return { ...query, data: query.data as unknown as CustomerOrderHistory | undefined };
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PostApiCustomersBody) => postApiCustomers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PutApiCustomersIdBody }) =>
      putApiCustomersId(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApiCustomersId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

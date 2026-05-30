import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiOrders, getApiOrdersId, patchApiOrdersIdStatus, postApiOrders } from '@/api/generated/orders/orders';
import type { OrderSummary, Order, GetApiOrdersParams, PatchApiOrdersIdStatusBodyStatus, PostApiOrdersBody } from '@/api/generated/restaurantDashboardAPI.schemas';

export function useOrders(filters?: GetApiOrdersParams) {
  const query = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => getApiOrders(filters),
    refetchInterval: 10000,
  });
  return { ...query, data: query.data as unknown as OrderSummary[] };
}

export function useOrderDetail(id: string | null) {
  const query = useQuery({
    queryKey: ['orders', id],
    queryFn: () => getApiOrdersId(id!),
    enabled: !!id,
  });
  return { ...query, data: query.data as unknown as Order | undefined };
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PostApiOrdersBody) => postApiOrders(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['popular-items'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PatchApiOrdersIdStatusBodyStatus }) =>
      patchApiOrdersIdStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
    },
  });
}

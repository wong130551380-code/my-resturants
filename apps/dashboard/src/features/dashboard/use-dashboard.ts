import { useQuery } from '@tanstack/react-query';
import { getApiDashboardStats, getApiDashboardPopularItems, getApiDashboardRecentOrders } from '@/api/generated/dashboard/dashboard';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getApiDashboardStats(),
    refetchInterval: 30000,
  });
}

export function usePopularItems(limit?: number) {
  return useQuery({
    queryKey: ['popular-items', { limit }],
    queryFn: () => getApiDashboardPopularItems(limit ? { limit: String(limit) } : undefined),
  });
}

export function useRecentOrders(limit?: number) {
  return useQuery({
    queryKey: ['recent-orders', { limit }],
    queryFn: () => getApiDashboardRecentOrders(limit ? { limit: String(limit) } : undefined),
    refetchInterval: 15000,
  });
}

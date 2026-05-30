import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiSettings, putApiSettings } from '@/api/generated/settings/settings';
import type { PutApiSettingsBody } from '@/api/generated/restaurantDashboardAPI.schemas';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => getApiSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PutApiSettingsBody) => putApiSettings(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });
}

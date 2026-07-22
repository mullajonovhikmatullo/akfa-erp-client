import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../../../services/dashboardService';

export const dashboardQueryKey = ['dashboard'] as const;

export const useDashboardData = () =>
  useQuery({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboardData,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

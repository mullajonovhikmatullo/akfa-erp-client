import { dashboardMock } from '../mocks/dashboardMock';
import type { DashboardData } from '../types/dashboard';

const REQUEST_DELAY_MS = 520;

const wait = (delay: number) =>
  new Promise((resolve) => {
    //
    window.setTimeout(resolve, delay);
  });

export const fetchDashboardData = async (): Promise<DashboardData> => {
  //
  await wait(REQUEST_DELAY_MS);
  return structuredClone(dashboardMock);
};

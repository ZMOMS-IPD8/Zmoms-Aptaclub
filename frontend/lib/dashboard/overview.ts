import { getDashboardCache } from "./cache";
import { transformDashboardData } from "./transform";

export function getOverviewData() {
  const cachedData = getDashboardCache();

  if (!cachedData) {
    throw new Error("Dashboard chưa có dữ liệu. Vui lòng đồng bộ dữ liệu.");
  }

  return transformDashboardData(cachedData.entries, cachedData.totalEntries);
}

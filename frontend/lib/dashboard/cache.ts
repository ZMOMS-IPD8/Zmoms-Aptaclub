import { getAllLeads } from "./pancake";

type LeadsData = Awaited<ReturnType<typeof getAllLeads>>;

let cachedData: LeadsData | null = null;
let syncingRequest: Promise<LeadsData> | null = null;

export function getDashboardCache(): LeadsData | null {
  return cachedData;
}

export function hasDashboardCache(): boolean {
  return cachedData !== null;
}

export async function syncDashboardCache(): Promise<LeadsData> {
  if (syncingRequest) {
    return syncingRequest;
  }

  cachedData = null;

  syncingRequest = getAllLeads();

  try {
    const data = await syncingRequest;

    cachedData = data;

    return data;
  } finally {
    syncingRequest = null;
  }
}

export function clearDashboardCache(): void {
  cachedData = null;
}

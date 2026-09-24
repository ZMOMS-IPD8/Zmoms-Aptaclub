import { getAllLeads } from "./pancake";

const CACHE_TTL = 10_000;

type LeadsData = Awaited<ReturnType<typeof getAllLeads>>;

let cachedData: LeadsData | null = null;
let cachedAt = 0;
let pendingRequest: Promise<LeadsData> | null = null;

export async function getCachedLeads(): Promise<LeadsData> {
  const now = Date.now();

  if (cachedData && now - cachedAt < CACHE_TTL) {
    return cachedData;
  }

  if (pendingRequest) {
    return pendingRequest;
  }

  pendingRequest = getAllLeads();

  try {
    const data = await pendingRequest;

    cachedData = data;
    cachedAt = Date.now();

    return data;
  } finally {
    pendingRequest = null;
  }
}

export function clearDashboardCache() {
  cachedData = null;
  cachedAt = 0;
}

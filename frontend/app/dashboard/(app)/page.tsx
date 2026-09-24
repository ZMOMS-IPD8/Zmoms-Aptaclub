import { getCachedLeads } from "@/lib/dashboard/cache";
import { transformDashboardData } from "@/lib/dashboard/transform";
import DashboardClient from "./components/DashboardClient";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const { entries, totalEntries } = await getCachedLeads();

  const data = transformDashboardData(entries, totalEntries);

  return <DashboardClient initialData={data} />;
}

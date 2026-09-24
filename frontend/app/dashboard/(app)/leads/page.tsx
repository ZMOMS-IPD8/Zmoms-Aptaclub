import { getCachedLeads } from "@/lib/dashboard/cache";
import { transformDashboardData } from "@/lib/dashboard/transform";
import LeadsClient from "./components/LeadsClient";

export const runtime = "nodejs";

export default async function LeadsPage() {
  const { entries, totalEntries } = await getCachedLeads();

  const data = transformDashboardData(entries, totalEntries);

  return (
    <LeadsClient
      entries={data.leads.entries}
      totalEntries={data.leads.total_entries}
    />
  );
}

import { getOverviewData } from "@/lib/dashboard/overview";
import DashboardClient from "./components/DashboardClient";

export const runtime = "nodejs";

export default function DashboardPage() {
  let data;

  try {
    data = getOverviewData();
  } catch {
    data = null;
  }

  return <DashboardClient initialData={data} />;
}

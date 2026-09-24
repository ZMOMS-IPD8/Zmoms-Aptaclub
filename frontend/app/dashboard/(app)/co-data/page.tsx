import { getCachedLeads } from "@/lib/dashboard/cache";
import CoDataClient from "./components/CoDataClient";

export const runtime = "nodejs";

export default async function CoDataPage() {
  const { entries } = await getCachedLeads();

  const coDataEntries = entries.filter(
    (lead) =>
      typeof lead.thoi_gian_dang_ky === "string" &&
      lead.thoi_gian_dang_ky.trim() !== "",
  );

  return <CoDataClient entries={coDataEntries} />;
}

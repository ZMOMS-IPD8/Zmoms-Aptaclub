type PancakeLead = Record<string, unknown>;

type PancakeResponse = {
  success: boolean;
  data?: {
    entries?: PancakeLead[];
    cursor?: string | null;
    page_size?: number;
    total_entries?: number;
  };
  fallback?: string;
  message?: string;
};

const PANCAKE_API_BASE = "https://crm.pancake.vn/api/workspaces";

export async function getAllLeads(): Promise<{
  entries: PancakeLead[];
  totalEntries: number;
}> {
  const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
  const apiKey = process.env.PANCAKE_CRM_API_KEY;

  if (!workspaceId || !apiKey) {
    throw new Error("Thiếu cấu hình Pancake CRM.");
  }

  const entries: PancakeLead[] = [];
  const seenCursors = new Set<string>();

  let cursor: string | null = null;
  let totalEntries: number | null = null;

  while (true) {
    const url = new URL(`${PANCAKE_API_BASE}/${workspaceId}/lead/records`);

    url.searchParams.set("api_key", apiKey);

    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Pancake API trả về HTTP ${response.status}.`);
    }

    const result = (await response.json()) as PancakeResponse;

    if (!result.success || !result.data) {
      throw new Error(
        result.message || "Không lấy được dữ liệu từ Pancake CRM.",
      );
    }

    const pageEntries = result.data.entries ?? [];

    entries.push(...pageEntries);

    if (typeof result.data.total_entries === "number") {
      totalEntries = result.data.total_entries;
    }

    const nextCursor = result.data.cursor ?? null;

    if (!nextCursor || pageEntries.length === 0) {
      break;
    }

    if (seenCursors.has(nextCursor)) {
      throw new Error("Pancake API trả về cursor trùng lặp.");
    }

    seenCursors.add(nextCursor);
    cursor = nextCursor;

    if (totalEntries !== null && entries.length >= totalEntries) {
      break;
    }
  }

  const resolvedTotalEntries = totalEntries ?? entries.length;

  if (totalEntries !== null && entries.length < totalEntries) {
    throw new Error(
      `Pancake trả về ${totalEntries} records nhưng chỉ lấy được ${entries.length} records.`,
    );
  }

  return {
    entries,
    totalEntries: resolvedTotalEntries,
  };
}

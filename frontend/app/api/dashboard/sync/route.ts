import { NextResponse } from "next/server";

import { getAllLeads } from "@/lib/dashboard/pancake";
import { getDashboardCookieName, getSession } from "@/lib/dashboard/auth";

export const runtime = "nodejs";

function getFieldValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => getFieldValue(item))
      .filter(Boolean)
      .join(", ")
      .trim();
  }

  if (value && typeof value === "object" && "value" in value) {
    return getFieldValue((value as { value?: unknown }).value);
  }

  return "";
}

function filterByDataScope(
  entries: Record<string, unknown>[],
  dataScope: "ALL" | "ZMOMS" | "CỘNG ĐỒNG BẦU",
) {
  if (dataScope === "ALL") {
    return entries;
  }

  return entries.filter(
    (lead) => getFieldValue(lead.team_thu_thap) === dataScope,
  );
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");

    const token = cookieHeader
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${getDashboardCookieName()}=`))
      ?.split("=")
      .slice(1)
      .join("=");

    const session = await getSession(token);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const data = await getAllLeads();

    const scopedEntries = filterByDataScope(data.entries, session.dataScope);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        dataScope: session.dataScope,
        syncedAt: new Date().toISOString(),
        totalEntries: scopedEntries.length,
        entries: scopedEntries,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể đồng bộ dữ liệu.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 500,
      },
    );
  }
}

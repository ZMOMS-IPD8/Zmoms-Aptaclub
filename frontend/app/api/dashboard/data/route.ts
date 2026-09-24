import { NextResponse } from "next/server";
import { getCachedLeads } from "@/lib/dashboard/cache";
import { transformDashboardData } from "@/lib/dashboard/transform";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { entries, totalEntries } = await getCachedLeads();

    const data = transformDashboardData(entries, totalEntries);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy dữ liệu Dashboard.",
      },
      { status: 500 },
    );
  }
}

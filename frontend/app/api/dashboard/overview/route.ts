import { NextResponse } from "next/server";

import { getOverviewData } from "@/lib/dashboard/overview";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = getOverviewData();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Không thể lấy dữ liệu Dashboard.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 503,
      },
    );
  }
}

import { NextResponse } from "next/server";
import { getAllLeads } from "@/lib/dashboard/pancake";
import { getDashboardCookieName, getSession } from "@/lib/dashboard/auth";

export const runtime = "nodejs";

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

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        syncedAt: new Date().toISOString(),
        totalEntries: data.totalEntries,
        entries: data.entries,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Không thể đồng bộ dữ liệu từ Pancake.";

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

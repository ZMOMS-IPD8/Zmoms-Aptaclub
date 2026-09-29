import { NextRequest, NextResponse } from "next/server";

import { getDashboardCookieName, getSession } from "@/lib/dashboard/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(getDashboardCookieName())?.value;

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

  return NextResponse.json({
    success: true,
    data: {
      sessionId: session.sessionId,
      username: session.username,
      role: session.role,
      dataScope: session.dataScope,
      exp: session.exp,
    },
  });
}

import { NextResponse } from "next/server";
import {
  createSession,
  getDashboardCookieName,
  getDashboardSessionDuration,
} from "@/lib/dashboard/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    const adminUsername = process.env.DASHBOARD_USERNAME;
    const adminPassword = process.env.DASHBOARD_PASSWORD;

    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Chưa cấu hình tài khoản Dashboard.",
        },
        { status: 500 },
      );
    }

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Tài khoản hoặc mật khẩu không đúng.",
        },
        { status: 401 },
      );
    }

    const session = await createSession(username);

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: getDashboardCookieName(),
      value: session,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getDashboardSessionDuration(),
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Dữ liệu đăng nhập không hợp lệ.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set({
    name: getDashboardCookieName(),
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

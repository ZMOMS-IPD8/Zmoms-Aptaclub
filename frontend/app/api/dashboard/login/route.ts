import { NextResponse } from "next/server";

import {
  createSession,
  getDashboardCookieName,
  getDashboardSessionDuration,
  type DashboardDataScope,
  type DashboardRole,
} from "@/lib/dashboard/auth";

export const runtime = "nodejs";

type DashboardAccount = {
  username: string;
  password: string;
  role: DashboardRole;
  dataScope: DashboardDataScope;
};

function getAccounts(): DashboardAccount[] {
  const customerUsername = process.env.DASHBOARD_CUSTOMER_USERNAME;
  const customerPassword = process.env.DASHBOARD_CUSTOMER_PASSWORD;

  const zmomsUsername = process.env.DASHBOARD_ZMOMS_USERNAME;
  const zmomsPassword = process.env.DASHBOARD_ZMOMS_PASSWORD;

  const communityUsername = process.env.DASHBOARD_CONG_DONG_BAU_USERNAME;

  const communityPassword = process.env.DASHBOARD_CONG_DONG_BAU_PASSWORD;

  const accounts: DashboardAccount[] = [];

  if (customerUsername && customerPassword) {
    accounts.push({
      username: customerUsername,
      password: customerPassword,
      role: "CUSTOMER",
      dataScope: "ALL",
    });
  }

  if (zmomsUsername && zmomsPassword) {
    accounts.push({
      username: zmomsUsername,
      password: zmomsPassword,
      role: "TEAM",
      dataScope: "ZMOMS",
    });
  }

  if (communityUsername && communityPassword) {
    accounts.push({
      username: communityUsername,
      password: communityPassword,
      role: "TEAM",
      dataScope: "CỘNG ĐỒNG BẦU",
    });
  }

  return accounts;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    const accounts = getAccounts();

    if (accounts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Chưa cấu hình tài khoản Dashboard.",
        },
        { status: 500 },
      );
    }

    const account = accounts.find(
      (item) => item.username === username && item.password === password,
    );

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          message: "Tài khoản hoặc mật khẩu không đúng.",
        },
        { status: 401 },
      );
    }

    const session = await createSession(
      account.username,
      account.role,
      account.dataScope,
    );

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

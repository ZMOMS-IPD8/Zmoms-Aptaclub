import { NextRequest, NextResponse } from "next/server";

const AUTH_API_URL = process.env.GOOGLE_AUTH_API_URL;
const AUTH_API_KEY = process.env.GOOGLE_AUTH_API_KEY;

type AuthResponse = {
  success: boolean;
  status?: string;
  message?: string;
  employee_id?: string;
  full_name?: string;
  session_token?: string;
  expires_in_hours?: number;
};

export async function POST(req: NextRequest) {
  try {
    if (!AUTH_API_URL || !AUTH_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          status: "SERVER_CONFIG_ERROR",
          message: "Chưa cấu hình Auth API.",
        },
        { status: 500 },
      );
    }

    const body = await req.json();

    const employeeId = String(body?.employee_id ?? "").trim();

    const password = String(body?.password ?? "");

    const setupToken = String(body?.setup_token ?? "").trim();

    if (!employeeId || !password || !setupToken) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_REQUEST",
          message: "Thiếu mã nhân viên, mật khẩu hoặc setup token.",
        },
        { status: 400 },
      );
    }

    const response = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: AUTH_API_KEY,
        action: "set_password",
        employee_id: employeeId,
        password,
        setup_token: setupToken,
      }),
      cache: "no-store",
    });

    const result = (await response.json()) as AuthResponse;

    if (
      result.success &&
      result.status === "PASSWORD_SET" &&
      result.session_token
    ) {
      const nextResponse = NextResponse.json({
        success: true,
        status: "PASSWORD_SET",
        employee_id: result.employee_id,
        full_name: result.full_name,
      });

      nextResponse.cookies.set("zmoms_session", result.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: (result.expires_in_hours ?? 24) * 60 * 60,
      });

      return nextResponse;
    }

    return NextResponse.json(
      {
        success: false,
        status: result.status ?? "SET_PASSWORD_FAILED",
        message: result.message ?? "Không thể thiết lập mật khẩu.",
      },
      {
        status:
          result.status === "USER_NOT_FOUND"
            ? 404
            : result.status === "INVALID_SETUP_TOKEN"
              ? 401
              : 400,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi thiết lập mật khẩu.",
      },
      { status: 500 },
    );
  }
}

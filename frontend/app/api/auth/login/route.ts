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
  setup_token?: string;
  expires_in_hours?: number;
  setup_token_expires_in_minutes?: number;
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

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_REQUEST",
          message: "Vui lòng nhập mã nhân viên.",
        },
        { status: 400 },
      );
    }

    const response = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        api_key: AUTH_API_KEY,
        action: "login",
        employee_id: employeeId,
        password,
      }),
      cache: "no-store",
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") || "";

    const responseText = await response.text();

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          status: "AUTH_API_INVALID_RESPONSE",
          message: "Auth API không trả về JSON.",
        },
        { status: 502 },
      );
    }

    let result: AuthResponse;

    try {
      result = JSON.parse(responseText) as AuthResponse;
    } catch {
      return NextResponse.json(
        {
          success: false,
          status: "AUTH_API_INVALID_JSON",
          message: "Auth API trả về dữ liệu JSON không hợp lệ.",
        },
        { status: 502 },
      );
    }

    if (
      result.success &&
      result.status === "LOGIN_SUCCESS" &&
      result.session_token
    ) {
      const nextResponse = NextResponse.json({
        success: true,
        status: "LOGIN_SUCCESS",
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

    if (
      result.status === "PASSWORD_NOT_SET" &&
      result.setup_token &&
      result.employee_id
    ) {
      return NextResponse.json({
        success: false,
        status: "PASSWORD_NOT_SET",
        message: result.message,
        employee_id: result.employee_id,
        full_name: result.full_name,
        setup_token: result.setup_token,
        setup_token_expires_in_minutes: result.setup_token_expires_in_minutes,
      });
    }

    return NextResponse.json(
      {
        success: false,
        status: result.status ?? "LOGIN_FAILED",
        message: result.message ?? "Đăng nhập thất bại.",
      },
      {
        status: result.status === "USER_NOT_FOUND" ? 401 : 400,
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
            : "Có lỗi xảy ra khi đăng nhập.",
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

const AUTH_API_URL = process.env.GOOGLE_AUTH_API_URL;
const AUTH_API_KEY = process.env.GOOGLE_AUTH_API_KEY;

export async function GET(request: NextRequest) {
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

    const sessionToken = request.cookies.get("zmoms_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          status: "SESSION_REQUIRED",
          message: "Chưa đăng nhập.",
        },
        { status: 401 },
      );
    }

    const response = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: AUTH_API_KEY,
        action: "validate_session",
        session_token: sessionToken,
      }),
      cache: "no-store",
    });

    const result = await response.json();

    if (!result.success) {
      const nextResponse = NextResponse.json(
        {
          success: false,
          status: result.status ?? "INVALID_SESSION",
          message: result.message ?? "Session không hợp lệ.",
        },
        { status: 401 },
      );

      nextResponse.cookies.delete("zmoms_session");

      return nextResponse;
    }

    return NextResponse.json({
      success: true,
      status: "SESSION_VALID",
      employee_id: result.employee_id,
      full_name: result.full_name,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Không thể kiểm tra session.",
      },
      { status: 500 },
    );
  }
}

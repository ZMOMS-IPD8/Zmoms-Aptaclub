import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    status: "LOGOUT_SUCCESS",
    message: "Đăng xuất thành công.",
  });

  response.cookies.set("zmoms_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

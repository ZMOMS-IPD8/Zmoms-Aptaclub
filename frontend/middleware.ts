import { NextRequest, NextResponse } from "next/server";
import { getDashboardCookieName, verifySession } from "./lib/dashboard/auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isDashboard = pathname.startsWith("/dashboard");

  const isDashboardApi = pathname.startsWith("/api/dashboard");

  const isLogin = pathname === "/dashboard/login";

  const isLoginApi = pathname === "/api/dashboard/login";

  if (!isDashboard && !isDashboardApi) {
    return NextResponse.next();
  }

  if (isLogin || isLoginApi) {
    return NextResponse.next();
  }

  const session = request.cookies.get(getDashboardCookieName())?.value;

  const isValid = await verifySession(session);

  if (!isValid) {
    if (isDashboardApi) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    return NextResponse.redirect(new URL("/dashboard/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};

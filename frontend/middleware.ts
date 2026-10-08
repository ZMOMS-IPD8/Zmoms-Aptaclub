import { NextRequest, NextResponse } from "next/server";
import { getDashboardCookieName, verifySession } from "./lib/dashboard/auth";

const AUTH_API_URL = process.env.GOOGLE_AUTH_API_URL;
const AUTH_API_KEY = process.env.GOOGLE_AUTH_API_KEY;

async function verifyZmomsSession(
  sessionToken: string | undefined,
): Promise<boolean> {
  if (!sessionToken || !AUTH_API_URL || !AUTH_API_KEY) {
    return false;
  }

  try {
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

    if (!response.ok) {
      return false;
    }

    const result = await response.json();

    return result?.success === true && result?.status === "SESSION_VALID";
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isLogin = pathname === "/login";
  const isDashboard = pathname.startsWith("/dashboard");
  const isDashboardApi = pathname.startsWith("/api/dashboard");

  const isDashboardLogin = pathname === "/dashboard/login";
  const isDashboardLoginApi = pathname === "/api/dashboard/login";

  const isCheckUser = pathname.startsWith("/check-user");

  if (isLogin || isCheckUser) {
    const session = request.cookies.get("zmoms_session")?.value;

    const isValid = await verifyZmomsSession(session);

    if (isLogin && isValid) {
      return NextResponse.redirect(new URL("/check-user", request.url));
    }

    if (isCheckUser && !isValid) {
      const loginUrl = new URL("/login", request.url);

      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (!isDashboard && !isDashboardApi) {
    return NextResponse.next();
  }

  if (isDashboardLoginApi) {
    return NextResponse.next();
  }

  const session = request.cookies.get(getDashboardCookieName())?.value;

  const isValid = await verifySession(session);

  if (isDashboardLogin) {
    if (isValid) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

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
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/api/dashboard/:path*",
    "/check-user/:path*",
  ],
};

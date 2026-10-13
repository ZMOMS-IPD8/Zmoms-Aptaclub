/* File: app/api/check-user/orders/route.ts */

import { NextRequest, NextResponse } from "next/server";
import {
  getRegisteredOrdersFromAppsScript,
  getOrderFulfillmentStatusesFromAppsScript,
} from "@/lib/google-apps-script/orders-query";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const AUTH_API_URL = process.env.GOOGLE_AUTH_API_URL;
const AUTH_API_KEY = process.env.GOOGLE_AUTH_API_KEY;

type SessionResponse = {
  success: boolean;
  status?: string;
  message?: string;
  full_name?: string;
};

type ErrorResponseBody = {
  success: false;
  status: string;
  message: string;
};

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json(
    {
      success: false,
      status: code,
      message,
    } satisfies ErrorResponseBody,
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

async function validateSession(
  request: NextRequest,
): Promise<
  | { success: true; fullName: string }
  | { success: false; response: NextResponse }
> {
  if (!AUTH_API_URL || !AUTH_API_KEY) {
    return {
      success: false,
      response: errorResponse(
        500,
        "SERVER_CONFIG_ERROR",
        "Chưa cấu hình Auth API.",
      ),
    };
  }

  const sessionToken = request.cookies.get("zmoms_session")?.value;

  if (!sessionToken) {
    return {
      success: false,
      response: errorResponse(401, "SESSION_REQUIRED", "Vui lòng đăng nhập."),
    };
  }

  let authResponse: Response;

  try {
    authResponse = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        api_key: AUTH_API_KEY,
        action: "validate_session",
        session_token: sessionToken,
      }),
      cache: "no-store",
    });
  } catch {
    return {
      success: false,
      response: errorResponse(
        502,
        "AUTH_API_UNAVAILABLE",
        "Không thể kết nối hệ thống xác thực.",
      ),
    };
  }

  let session: SessionResponse;

  try {
    session = (await authResponse.json()) as SessionResponse;
  } catch {
    return {
      success: false,
      response: errorResponse(
        502,
        "AUTH_API_INVALID_RESPONSE",
        "Auth API trả về dữ liệu không hợp lệ.",
      ),
    };
  }

  if (!authResponse.ok || session.success !== true) {
    const response = errorResponse(
      401,
      "INVALID_SESSION",
      "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
    );

    response.cookies.delete("zmoms_session");

    return {
      success: false,
      response,
    };
  }

  const fullName = String(session.full_name ?? "").trim();

  if (!fullName) {
    return {
      success: false,
      response: errorResponse(
        401,
        "EMPLOYEE_NAME_MISSING",
        "Không xác định được tên nhân viên.",
      ),
    };
  }

  return {
    success: true,
    fullName,
  };
}

function getQueryErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Không thể lấy dữ liệu. Vui lòng thử lại.";
}

function noStoreJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const auth = await validateSession(request);

    if (!auth.success) {
      return auth.response;
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action")?.trim() || "orders";

    if (action === "fulfillment-statuses") {
      try {
        const result = await getOrderFulfillmentStatusesFromAppsScript();

        return noStoreJson(result);
      } catch (error) {
        return errorResponse(
          502,
          "FULFILLMENT_STATUSES_ERROR",
          getQueryErrorMessage(error),
        );
      }
    }

    if (action !== "orders") {
      return errorResponse(400, "INVALID_ACTION", "Action không hợp lệ.");
    }

    const pageValue = searchParams.get("page");
    const pageSizeValue = searchParams.get("pageSize");

    const page = Math.max(1, Math.floor(Number(pageValue) || 1));

    const pageSize = Math.min(
      100,
      Math.max(1, Math.floor(Number(pageSizeValue) || 20)),
    );

    const startDate = searchParams.get("startDate")?.trim() ?? "";
    const endDate = searchParams.get("endDate")?.trim() ?? "";
    const fulfillmentStatus =
      searchParams.get("fulfillmentStatus")?.trim() ?? "";

    if (fulfillmentStatus.length > 100) {
      return errorResponse(
        400,
        "INVALID_FULFILLMENT_STATUS",
        "Giá trị tình trạng không hợp lệ.",
      );
    }

    if (
      (startDate && !isValidDate(startDate)) ||
      (endDate && !isValidDate(endDate))
    ) {
      return errorResponse(
        400,
        "INVALID_DATE_FORMAT",
        "Ngày lọc phải có định dạng YYYY-MM-DD và là ngày hợp lệ.",
      );
    }

    if (startDate && endDate && startDate > endDate) {
      return errorResponse(
        400,
        "INVALID_DATE_RANGE",
        "Ngày bắt đầu không được sau ngày kết thúc.",
      );
    }

    try {
      const result = await getRegisteredOrdersFromAppsScript({
        seller: auth.fullName,
        page,
        pageSize,
        startDate,
        endDate,
        fulfillmentStatus,
      });

      return noStoreJson({
        ...result,
        employee: {
          full_name: auth.fullName,
        },
      });
    } catch (error) {
      return errorResponse(
        502,
        "ORDERS_QUERY_ERROR",
        getQueryErrorMessage(error),
      );
    }
  } catch {
    return errorResponse(
      500,
      "SERVER_ERROR",
      "Đã xảy ra lỗi máy chủ. Vui lòng thử lại.",
    );
  }
}

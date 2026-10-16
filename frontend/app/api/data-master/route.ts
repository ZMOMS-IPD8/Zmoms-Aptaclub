/* app/api/data-master/route.ts */

import { NextRequest, NextResponse } from "next/server";
import {
  submitDataMasterToAppsScript,
  type DataMasterAppsScriptPayload,
} from "@/lib/google-apps-script/data-master-apps-script";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_CONTENT_TYPE",
          message: "Content-Type phải là application/json.",
        },
        { status: 415 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_JSON",
          message: "Dữ liệu JSON không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_REQUEST",
          message: "Dữ liệu request không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const data = body as Record<string, unknown>;

    const payload: DataMasterAppsScriptPayload = {
      pancakeId: normalizeField(data.pancakeId),
      registeredAt: normalizeField(data.registeredAt),
      fullName: normalizeField(data.fullName),
      phone: normalizeField(data.phone),
      babyDate: normalizeField(data.babyDate),
      motherStatus: normalizeField(data.motherStatus),
      province: normalizeField(data.province),
      memberConsent: normalizeField(data.memberConsent),
      aptamilPolicy: normalizeField(data.aptamilPolicy),
      notificationConsent: normalizeField(data.notificationConsent),
      aptaclubConsent: normalizeField(data.aptaclubConsent),
      staffCode: normalizeField(data.staffCode),
      sourceCode: normalizeField(data.sourceCode),
    };

    const result = await submitDataMasterToAppsScript(payload);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể ghi dữ liệu đăng ký.";

    return NextResponse.json(
      {
        success: false,
        status: "DATA_MASTER_ERROR",
        message,
      },
      { status: 400 },
    );
  }
}

function normalizeField(value: unknown): string {
  if (value === null || value === undefined) return "";

  if (typeof value !== "string") {
    return String(value);
  }

  return value.trim();
}

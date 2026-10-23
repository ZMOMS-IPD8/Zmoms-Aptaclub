// app/api/ai/check-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkImage, type ImageCheckResult } from "@/lib/openai/check-image";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_REQUEST_SIZE = 11 * 1024 * 1024;
const MAX_OCR_LENGTH = 10000;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type ErrorResponse = {
  success: false;
  message: string;
};

type SuccessResponse = {
  success: true;
  result: ImageCheckResult;
};

type UpstreamError = {
  status?: number;
};

function jsonError(message: string, status: number) {
  return NextResponse.json<ErrorResponse>(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function jsonSuccess(result: ImageCheckResult) {
  return NextResponse.json<SuccessResponse>(
    { success: true, result },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}

function detectImageType(bytes: Uint8Array): string | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (bytes.length >= 12) {
    const header = Buffer.from(bytes.subarray(0, 12)).toString("ascii");

    if (header.startsWith("RIFF") && header.slice(8, 12) === "WEBP") {
      return "image/webp";
    }
  }

  if (bytes.length >= 6) {
    const header = Buffer.from(bytes.subarray(0, 6)).toString("ascii");

    if (header === "GIF87a" || header === "GIF89a") {
      return "image/gif";
    }
  }

  return null;
}

async function validateImageContent(file: File): Promise<boolean> {
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return detectImageType(header) === file.type;
}

function isMultipartRequest(request: NextRequest): boolean {
  const contentType = request.headers.get("content-type") ?? "";

  return (
    /^multipart\/form-data\s*;/i.test(contentType) &&
    /(?:^|;)\s*boundary\s*=\s*(?:"[^"]+"|[^;\s]+)/i.test(contentType)
  );
}

function getUpstreamErrorStatus(error: UpstreamError): number {
  if (error.status === 429) return 503;
  if (error.status === 408 || error.status === 504) return 504;
  return 502;
}

export async function POST(request: NextRequest) {
  if (!isMultipartRequest(request)) {
    return jsonError("Yêu cầu phải sử dụng multipart/form-data hợp lệ.", 400);
  }

  const contentLength = request.headers.get("content-length");

  if (contentLength !== null) {
    const declaredLength = Number(contentLength);

    if (!Number.isSafeInteger(declaredLength) || declaredLength < 0) {
      return jsonError("Content-Length không hợp lệ.", 400);
    }

    if (declaredLength > MAX_REQUEST_SIZE) {
      return jsonError("Dung lượng yêu cầu vượt quá giới hạn cho phép.", 413);
    }
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch (error) {
    console.error("[ImageCheck API] FormData parse error", {
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return jsonError("Không thể đọc dữ liệu ảnh được gửi lên.", 400);
  }

  const imageEntries = formData.getAll("image");
  const ocrEntries = formData.getAll("ocrText");

  if (imageEntries.length !== 1 || !(imageEntries[0] instanceof File)) {
    return jsonError("Vui lòng gửi đúng một file ảnh với key image.", 400);
  }

  if (ocrEntries.length > 1) {
    return jsonError("Chỉ được gửi một trường ocrText.", 400);
  }

  const image = imageEntries[0];
  const rawOcrText = ocrEntries[0] ?? "";

  if (typeof rawOcrText !== "string") {
    return jsonError("ocrText phải là chuỗi văn bản.", 400);
  }

  if (image.size === 0) {
    return jsonError("File ảnh rỗng.", 400);
  }

  if (image.size > MAX_FILE_SIZE) {
    return jsonError("Ảnh không được vượt quá 10 MB.", 413);
  }

  if (!ALLOWED_TYPES.has(image.type)) {
    return jsonError("Chỉ hỗ trợ ảnh JPEG, PNG, WebP hoặc GIF.", 400);
  }

  try {
    const validImage = await validateImageContent(image);

    if (!validImage) {
      return jsonError("Nội dung file không khớp với định dạng ảnh.", 400);
    }
  } catch (error) {
    console.error("[ImageCheck API] Image validation error", {
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return jsonError("Không thể kiểm tra định dạng file ảnh.", 400);
  }

  const ocrText = rawOcrText.slice(0, MAX_OCR_LENGTH);

  try {
    const result = await checkImage(image, ocrText);

    if (result !== "PASS" && result !== "REJECT") {
      console.error("[ImageCheck API] Invalid verification result");
      return jsonError("Hệ thống xác minh trả về kết quả không hợp lệ.", 502);
    }

    return jsonSuccess(result);
  } catch (error: unknown) {
    if (error instanceof OpenAI.APIError) {
      console.error("[ImageCheck API] DeepInfra error", {
        status: error.status ?? null,
        code: error.code ?? null,
        type: error.type ?? null,
        requestId: error.requestID ?? null,
      });

      if (error.status === 429) {
        return jsonError(
          "Hệ thống xác minh đang bận. Vui lòng thử lại sau.",
          503,
        );
      }

      if (error.status === 408 || error.status === 504) {
        return jsonError(
          "Hệ thống xác minh phản hồi quá chậm. Vui lòng thử lại.",
          504,
        );
      }

      return jsonError(
        "Dịch vụ phân tích ảnh tạm thời không khả dụng.",
        getUpstreamErrorStatus(error),
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("[ImageCheck API] Processing error", {
      name: error instanceof Error ? error.name : "UnknownError",
      message,
    });

    if (message.includes("DEEPINFRA_API_KEY")) {
      return jsonError("Dịch vụ xác minh chưa được cấu hình.", 503);
    }

    if (
      message.includes("DeepInfra không trả về") ||
      message.includes("DeepInfra trả về") ||
      message.includes("AI không trả về")
    ) {
      return jsonError(
        "Không thể đọc kết quả phân tích ảnh. Vui lòng thử lại.",
        502,
      );
    }

    if (
      /timeout|timed out|connection error|connectionerror/i.test(message) ||
      (error instanceof Error && error.name === "APIConnectionTimeoutError")
    ) {
      return jsonError(
        "Không thể kết nối dịch vụ xác minh. Vui lòng thử lại.",
        504,
      );
    }

    return jsonError("Không thể xử lý ảnh lúc này. Vui lòng thử lại.", 500);
  }
}

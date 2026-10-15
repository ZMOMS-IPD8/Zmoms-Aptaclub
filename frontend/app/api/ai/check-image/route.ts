import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkImage } from "@/lib/openai/check-image";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Lỗi không xác định";
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return NextResponse.json(
      {
        success: false,
        message: "Content-Type phải là multipart/form-data",
        receivedContentType: contentType || null,
      },
      { status: 400 },
    );
  }

  try {
    let formData: FormData;

    try {
      formData = await request.formData();
    } catch (error) {
      console.error("FormData parse error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Không thể đọc FormData. Hãy kiểm tra cấu hình Postman.",
          detail: getErrorMessage(error),
        },
        { status: 400 },
      );
    }

    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng gửi file ảnh với key image và kiểu File",
        },
        { status: 400 },
      );
    }

    if (image.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "File ảnh rỗng",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(image.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Định dạng ảnh không được hỗ trợ",
          receivedType: image.type || null,
          allowedTypes: ALLOWED_TYPES,
        },
        { status: 400 },
      );
    }

    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Ảnh không được vượt quá 10 MB",
          fileSize: image.size,
          maxFileSize: MAX_FILE_SIZE,
        },
        { status: 413 },
      );
    }

    const result = await checkImage(image);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Image check error:", error);

    if (error instanceof OpenAI.APIError) {
      const status = error.status ?? 502;

      return NextResponse.json(
        {
          success: false,
          message: "OpenAI API xử lý ảnh thất bại",
          error: error.message,
          code: error.code ?? null,
          type: error.type ?? null,
          status: error.status ?? null,
        },
        {
          status: status >= 400 && status <= 599 ? status : 502,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Không thể xử lý ảnh",
        error: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}

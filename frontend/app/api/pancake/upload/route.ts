import { NextRequest, NextResponse } from "next/server";
import { uploadProofImage } from "@/lib/google-apps-script/uploadProofImage";

export const runtime = "nodejs";

const ENABLE_PROOF_IMAGE_UPLOAD =
  process.env.ENABLE_PROOF_IMAGE_UPLOAD !== "false";

function isImageFile(value: FormDataEntryValue | null): value is File {
  return (
    value !== null &&
    typeof value !== "string" &&
    typeof value.size === "number" &&
    typeof value.type === "string" &&
    typeof value.arrayBuffer === "function"
  );
}

export async function POST(req: NextRequest) {
  try {
    if (!ENABLE_PROOF_IMAGE_UPLOAD) {
      return NextResponse.json({
        success: true,
        status: "UPLOAD_DISABLED",
        uploadEnabled: false,
        message: "Chức năng upload ảnh minh chứng hiện đang tắt.",
      });
    }

    const formData = await req.formData();
    const phone = String(formData.get("phone") ?? "").trim();
    const image = formData.get("hinh_minh_chung");

    if (!isImageFile(image) || image.size === 0) {
      return NextResponse.json(
        {
          success: false,
          status: "PROOF_IMAGE_REQUIRED",
          message: "Vui lòng chọn ảnh minh chứng.",
        },
        { status: 400 },
      );
    }

    const uploadedImage = await uploadProofImage({
      image,
      phone,
    });

    return NextResponse.json({
      success: true,
      status: "UPLOADED",
      uploadEnabled: true,
      proofImage: uploadedImage,
    });
  } catch (error) {
    console.error("[PROOF_IMAGE_UPLOAD_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        status: "IMAGE_UPLOAD_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Không thể tải ảnh minh chứng lên. Vui lòng thử lại.",
      },
      { status: 502 },
    );
  }
}

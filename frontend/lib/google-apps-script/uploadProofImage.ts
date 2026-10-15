import { Buffer } from "node:buffer";

type UploadProofImageParams = {
  image: File;
  phone: string;
};

export type UploadProofImageResponse = {
  success: boolean;
  message?: string;
  file_id: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  size: number;
  folder_id: string;
};

type GasUploadResponse = {
  success?: unknown;
  message?: unknown;
  status?: unknown;
  file_id?: unknown;
  file_name?: unknown;
  file_url?: unknown;
  mime_type?: unknown;
  size?: unknown;
  folder_id?: unknown;
  data?: Record<string, unknown>;
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function getImageExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };

  return extensions[mimeType] ?? ".jpg";
}

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function readBase64(image: File): Promise<string> {
  const buffer = Buffer.from(await image.arrayBuffer());
  return buffer.toString("base64");
}

export async function uploadProofImage({
  image,
  phone,
}: UploadProofImageParams): Promise<UploadProofImageResponse> {
  if (!image || typeof image.arrayBuffer !== "function" || image.size === 0) {
    throw new Error("Không tìm thấy ảnh minh chứng hợp lệ.");
  }

  const cleanPhone = phone.replace(/\D/g, "");

  if (!/^0\d{9}$/.test(cleanPhone)) {
    throw new Error("Số điện thoại không đúng định dạng.");
  }

  if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
    throw new Error("Ảnh phải có định dạng JPEG, PNG, WebP hoặc GIF.");
  }

  if (image.size > MAX_IMAGE_SIZE) {
    throw new Error("Dung lượng ảnh không được vượt quá 10 MB.");
  }

  const gasUrl = process.env.EBOOK_APPS_SCRIPT_URL;
  const gasSecret = process.env.EBOOK_APPS_SCRIPT_SECRET;
  const folderId = process.env.DRIVE_IMAGE_FOLDER_ID;

  if (!gasUrl || !gasSecret || !folderId) {
    throw new Error("Chưa cấu hình Google Apps Script hoặc thư mục Drive.");
  }

  const base64 = await readBase64(image);
  const fileName = `${cleanPhone}${getImageExtension(image.type)}`;

  let response: Response;

  try {
    response = await fetch(gasUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        secret: gasSecret,
        action: "upload_image",
        folder_id: folderId,
        file_name: fileName,
        mime_type: image.type,
        file_base64: base64,
      }),
    });
  } catch {
    throw new Error("Không thể kết nối dịch vụ upload ảnh.");
  }

  const responseText = await response.text();

  let result: GasUploadResponse;

  try {
    result = JSON.parse(responseText) as GasUploadResponse;
  } catch {
    throw new Error(
      `Google Apps Script trả về dữ liệu không hợp lệ (HTTP ${response.status}).`,
    );
  }

  const data =
    result.data && typeof result.data === "object" ? result.data : result;

  if (!response.ok || result.success !== true) {
    throw new Error(
      getString(data.message) ||
        getString(result.message) ||
        `Upload ảnh minh chứng thất bại (HTTP ${response.status}).`,
    );
  }

  const fileId = getString(data.file_id);
  const returnedFileName = getString(data.file_name);
  const fileUrl = getString(data.file_url);
  const mimeType = getString(data.mime_type);
  const returnedFolderId = getString(data.folder_id);
  const rawSize = data.size;
  const size = typeof rawSize === "number" ? rawSize : Number(rawSize);

  if (
    !fileId ||
    !returnedFileName ||
    !fileUrl ||
    !Number.isFinite(size) ||
    size < 0
  ) {
    throw new Error(
      "Upload có phản hồi thành công nhưng thiếu thông tin ảnh từ Google Drive.",
    );
  }

  return {
    success: true,
    message:
      getString(data.message) ||
      getString(result.message) ||
      "Upload ảnh thành công.",
    file_id: fileId,
    file_name: returnedFileName,
    file_url: fileUrl,
    mime_type: mimeType || image.type,
    size,
    folder_id: returnedFolderId || folderId,
  };
}

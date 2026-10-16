export type DataMasterAppsScriptResponse = {
  success: boolean;
  status?: string;
  message?: string;
  rowNumber?: number;
};

export type DataMasterAppsScriptPayload = {
  pancakeId?: string;
  registeredAt?: string;
  fullName: string;
  phone: string;
  babyDate?: string;
  motherStatus: string;
  province: string;
  memberConsent: string;
  aptamilPolicy: string;
  notificationConsent: string;
  aptaclubConsent: string;
  staffCode: string;
  sourceCode: string;
};

function normalizeDataMasterText(value: unknown): string {
  return String(value ?? "").trim();
}

function isValidDataMasterDate(value: string): boolean {
  const normalized = normalizeDataMasterText(value);

  if (!normalized) return false;

  if (!/(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized)) {
    return false;
  }

  return Number.isFinite(Date.parse(normalized));
}

function parseDataMasterResponse(text: string): unknown {
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getDataMasterErrorMessage(result: unknown): string {
  if (typeof result === "string") {
    if (result.includes("<!DOCTYPE html") || result.includes("<html")) {
      return "Google Apps Script trả về HTML thay vì JSON. Hãy kiểm tra URL /exec, quyền truy cập Web App và phiên bản triển khai.";
    }

    return (
      result.trim().slice(0, 500) ||
      "Phản hồi từ Google Apps Script không hợp lệ."
    );
  }

  if (!result || typeof result !== "object") {
    return "Google Apps Script không trả về dữ liệu hợp lệ.";
  }

  const data = result as {
    message?: unknown;
    status?: unknown;
  };

  const message = typeof data.message === "string" ? data.message.trim() : "";

  const status = typeof data.status === "string" ? data.status.trim() : "";

  return (
    [status, message].filter(Boolean).join(": ") ||
    "Không thể ghi dữ liệu vào DATA_MASTER."
  );
}

function validateDataMasterPayload(payload: DataMasterAppsScriptPayload): void {
  const requiredFields: Array<[keyof DataMasterAppsScriptPayload, string]> = [
    ["fullName", "Họ và tên"],
    ["phone", "Số điện thoại đăng ký"],
    ["motherStatus", "Tình trạng mẹ"],
    ["province", "Tỉnh/Thành phố"],
    ["memberConsent", "Đồng ý đăng ký hội viên"],
    ["aptamilPolicy", "Đã đọc chính sách Aptamil"],
    ["notificationConsent", "Đồng ý nhận thông báo"],
    ["aptaclubConsent", "Đồng ý chia sẻ để đăng ký Aptaclub"],
    ["staffCode", "Mã nhân sự"],
    ["sourceCode", "Mã nguồn"],
  ];

  for (const [field, label] of requiredFields) {
    const value = payload[field];

    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`Thiếu thông tin: ${label}.`);
    }
  }

  if (!/^0\d{9}$/.test(payload.phone.trim())) {
    throw new Error("Số điện thoại đăng ký không hợp lệ.");
  }

  if (payload.registeredAt && !isValidDataMasterDate(payload.registeredAt)) {
    throw new Error("Thời gian đăng ký không hợp lệ.");
  }

  if (payload.babyDate) {
    const babyDate = normalizeDataMasterText(payload.babyDate);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(babyDate)) {
      throw new Error(
        "Ngày dự sinh / ngày sinh của bé phải theo định dạng YYYY-MM-DD.",
      );
    }

    const parsedDate = new Date(`${babyDate}T00:00:00.000Z`);

    if (
      !Number.isFinite(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== babyDate
    ) {
      throw new Error("Ngày dự sinh / ngày sinh của bé không hợp lệ.");
    }
  }
}

export async function submitDataMasterToAppsScript(
  payload: DataMasterAppsScriptPayload,
): Promise<DataMasterAppsScriptResponse> {
  const scriptUrl = process.env.ORDER_APPS_SCRIPT_URL;
  const scriptSecret = process.env.ORDER_APPS_SCRIPT_SECRET;

  if (!scriptUrl || !scriptSecret) {
    throw new Error("Chưa cấu hình Google Apps Script cho DATA_MASTER.");
  }

  if (
    !scriptUrl.startsWith("https://script.google.com/macros/s/") ||
    !scriptUrl.endsWith("/exec")
  ) {
    throw new Error(
      "DATA_MASTER_APPS_SCRIPT_URL không đúng URL Web App /exec.",
    );
  }

  validateDataMasterPayload(payload);

  const normalizedPayload: DataMasterAppsScriptPayload = {
    pancakeId: normalizeDataMasterText(payload.pancakeId),
    registeredAt: payload.registeredAt
      ? new Date(payload.registeredAt.trim()).toISOString()
      : new Date().toISOString(),
    fullName: payload.fullName.trim(),
    phone: payload.phone.trim(),
    babyDate: normalizeDataMasterText(payload.babyDate),
    motherStatus: payload.motherStatus.trim(),
    province: payload.province.trim(),
    memberConsent: payload.memberConsent.trim(),
    aptamilPolicy: payload.aptamilPolicy.trim(),
    notificationConsent: payload.notificationConsent.trim(),
    aptaclubConsent: payload.aptaclubConsent.trim(),
    staffCode: payload.staffCode.trim(),
    sourceCode: payload.sourceCode.trim(),
  };

  let response: Response;

  try {
    response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "create_data_master",
        secret: scriptSecret,
        ...normalizedPayload,
      }),
      cache: "no-store",
      redirect: "follow",
    });
  } catch {
    throw new Error("Không thể kết nối Google Apps Script. Vui lòng thử lại.");
  }

  const text = await response.text();
  const result = parseDataMasterResponse(text);

  if (!response.ok) {
    throw new Error(
      `Google Apps Script HTTP ${response.status}: ${getDataMasterErrorMessage(result)}`,
    );
  }

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new Error(getDataMasterErrorMessage(result));
  }

  const data = result as Partial<DataMasterAppsScriptResponse>;

  if (data.success !== true) {
    throw new Error(getDataMasterErrorMessage(data));
  }

  if (
    typeof data.rowNumber !== "number" ||
    !Number.isFinite(data.rowNumber) ||
    data.rowNumber < 1
  ) {
    throw new Error(
      "Google Apps Script báo thành công nhưng không trả về số dòng hợp lệ.",
    );
  }

  return {
    success: true,
    status: data.status,
    message: data.message,
    rowNumber: data.rowNumber,
  };
}

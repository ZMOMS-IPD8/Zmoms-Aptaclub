type PancakeLead = {
  id?: string;
  lead_id?: string;
  record_id?: string;

  name?: string | null;
  phone_number?: string | null;
  so_dien_thoai_dang_ky?: string | null;

  ho_va_ten_lien_he?: string | null | { value?: string | null };

  [key: string]: unknown;
};

type PancakeResponse = {
  success?: boolean;
  data?: {
    entries?: PancakeLead[];
    total_entries?: number;
    [key: string]: unknown;
  };
  message?: string;
  error?: string;

  [key: string]: unknown;
};

export type MemberCheckResult =
  | {
      success: true;
      registered: true;
      lead: PancakeLead;
      leadId: string;
      phone: string;
      fullName: string;
    }
  | {
      success: true;
      registered: false;
      lead: null;
      leadId: null;
      phone: string;
      fullName: "";
    };

function getFieldValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value).trim();
  }

  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value?: unknown }).value ?? "").trim();
  }

  return "";
}

async function parsePancakeResponse(
  response: Response,
): Promise<PancakeResponse> {
  const text = await response.text();

  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text) as PancakeResponse;
  } catch {
    return {
      message: text.slice(0, 500),
    };
  }
}

function getPancakeErrorMessage(
  result: PancakeResponse,
  response: Response,
): string {
  if (typeof result.message === "string" && result.message.trim()) {
    return result.message.trim();
  }

  if (typeof result.error === "string" && result.error.trim()) {
    return result.error.trim();
  }

  return `Pancake CRM trả lỗi HTTP ${response.status}.`;
}

export async function checkMemberByPhone(
  phone: string,
): Promise<MemberCheckResult> {
  const cleanPhone = String(phone).trim().replace(/\D/g, "");

  if (!/^0\d{9}$/.test(cleanPhone)) {
    throw new Error("Số điện thoại không hợp lệ.");
  }

  const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
  const apiKey = process.env.PANCAKE_CRM_API_KEY;

  if (!workspaceId || !apiKey) {
    throw new Error("Chưa cấu hình Pancake CRM API.");
  }

  const filter = {
    is_group: false,
    fields: [
      {
        field_name: "so_dien_thoai_dang_ky",
        type: "$enter_value",
        value: cleanPhone,
        is_filter_exclude: false,
      },
    ],
  };

  const findUrl =
    `https://crm.pancake.vn/api/workspaces/` +
    `${workspaceId}/lead/records` +
    `?api_key=${encodeURIComponent(apiKey)}` +
    `&filter=${encodeURIComponent(JSON.stringify(filter))}`;

  const response = await fetch(findUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const result = await parsePancakeResponse(response);

  if (!response.ok) {
    throw new Error(getPancakeErrorMessage(result, response));
  }

  const leads = Array.isArray(result?.data?.entries) ? result.data.entries : [];

  if (leads.length === 0) {
    return {
      success: true,
      registered: false,
      lead: null,
      leadId: null,
      phone: cleanPhone,
      fullName: "",
    };
  }

  const lead = leads[0];

  const leadId = lead?.id || lead?.lead_id || lead?.record_id || "";

  const registeredPhone =
    getFieldValue(lead?.so_dien_thoai_dang_ky) ||
    getFieldValue(lead?.phone_number) ||
    cleanPhone;

  const fullName = getFieldValue(lead?.ho_va_ten_lien_he);

  if (!fullName || !leadId) {
    return {
      success: true,
      registered: false,
      lead: null,
      leadId: null,
      phone: registeredPhone,
      fullName: "",
    };
  }

  return {
    success: true,
    registered: true,
    lead,
    leadId: String(leadId),
    phone: registeredPhone,
    fullName,
  };
}

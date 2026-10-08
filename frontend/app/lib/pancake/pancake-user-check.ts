import { checkMemberByPhone, type MemberCheckResult } from "./member";

type PancakeLead = {
  id?: string;
  lead_id?: string;
  record_id?: string;

  name?: string | null;
  phone_number?: string | null;
  so_dien_thoai_dang_ky?: string | null;
  trang_thai_giao_hang?: string | null;

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

export type UserCheckResult = {
  success: true;
  phone: string;
  registered: boolean;
  purchased: boolean;
  purchasedWithoutRegistration: boolean;
  member: MemberCheckResult;
  deliveredOrder: PancakeLead | null;
};

function getFieldValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => getFieldValue(item))
      .filter(Boolean)
      .join(", ")
      .trim();
  }

  if (value && typeof value === "object" && "value" in value) {
    return getFieldValue((value as { value?: unknown }).value);
  }

  return "";
}

function normalizePhone(value: unknown): string {
  return getFieldValue(value).replace(/\D/g, "");
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

function isSuccessfulDelivery(lead: PancakeLead): boolean {
  return (
    getFieldValue(lead.trang_thai_giao_hang).toLowerCase() === "giao thành công"
  );
}

function getPancakeConfig() {
  const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
  const apiKey = process.env.PANCAKE_CRM_API_KEY;

  if (!workspaceId || !apiKey) {
    throw new Error("Chưa cấu hình Pancake CRM API.");
  }

  return {
    workspaceId,
    apiKey,
  };
}

function buildFindUrl(
  workspaceId: string,
  apiKey: string,
  filter: Record<string, unknown>,
): string {
  return (
    `https://crm.pancake.vn/api/workspaces/` +
    `${workspaceId}/lead/records` +
    `?api_key=${encodeURIComponent(apiKey)}` +
    `&filter=${encodeURIComponent(JSON.stringify(filter))}`
  );
}

async function fetchLeads(
  filter: Record<string, unknown>,
): Promise<PancakeLead[]> {
  const { workspaceId, apiKey } = getPancakeConfig();

  const findUrl = buildFindUrl(workspaceId, apiKey, filter);

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

  return Array.isArray(result?.data?.entries) ? result.data.entries : [];
}

export async function findDeliveredOrderByPhone(
  phone: string,
): Promise<PancakeLead | null> {
  const cleanPhone = normalizePhone(phone);

  if (!/^0\d{9}$/.test(cleanPhone)) {
    throw new Error("Số điện thoại không hợp lệ.");
  }

  const filter = {
    is_group: false,
    fields: [
      {
        field_name: "phone_number",
        type: "$enter_value",
        value: cleanPhone,
        is_filter_exclude: false,
      },
    ],
  };

  const leads = await fetchLeads(filter);

  const deliveredLead = leads.find((lead) => {
    const orderPhone = normalizePhone(lead.phone_number);

    return orderPhone === cleanPhone && isSuccessfulDelivery(lead);
  });

  return deliveredLead ?? null;
}

export async function checkUserByPhone(
  phone: string,
): Promise<UserCheckResult> {
  const cleanPhone = normalizePhone(phone);

  if (!/^0\d{9}$/.test(cleanPhone)) {
    throw new Error("Số điện thoại không hợp lệ.");
  }

  const member = await checkMemberByPhone(cleanPhone);

  const deliveredOrder = await findDeliveredOrderByPhone(cleanPhone);

  const registered = member.registered;
  const purchased = Boolean(deliveredOrder);

  return {
    success: true,
    phone: cleanPhone,
    registered,
    purchased,
    purchasedWithoutRegistration: purchased && !registered,
    member,
    deliveredOrder,
  };
}

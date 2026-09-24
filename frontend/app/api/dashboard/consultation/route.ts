import { NextResponse } from "next/server";

type PancakeLead = {
  id?: string;
  name?: string | null;
  phone_number?: string | null;
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

async function getLeads(): Promise<PancakeLead[]> {
  const workspaceId = process.env.PANCAKE_WORKSPACE_ID;

  const apiKey = process.env.PANCAKE_CRM_API_KEY;

  if (!workspaceId || !apiKey) {
    throw new Error("Chưa cấu hình Pancake CRM API.");
  }

  const url =
    `https://crm.pancake.vn/api/workspaces/` +
    `${workspaceId}/lead/records` +
    `?api_key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await response.text();

  let result: PancakeResponse = {};

  if (text.trim()) {
    try {
      result = JSON.parse(text) as PancakeResponse;
    } catch {
      throw new Error("Pancake CRM trả về dữ liệu không hợp lệ.");
    }
  }

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        `Pancake CRM trả lỗi HTTP ${response.status}.`,
    );
  }

  return Array.isArray(result.data?.entries) ? result.data.entries : [];
}

function isCoData(lead: PancakeLead): boolean {
  return getFieldValue(lead.thoi_gian_dang_ky) !== "";
}

function isCoEdu(lead: PancakeLead): boolean {
  return isCoData(lead) && getFieldValue(lead.thoi_gian_dang_ky_lop) !== "";
}

function formatConsultation(lead: PancakeLead) {
  return {
    id: getFieldValue(lead.id),

    name: getFieldValue(lead.ho_va_ten_lien_he) || getFieldValue(lead.name),

    phone:
      getFieldValue(lead.so_dien_thoai_dang_ky) ||
      getFieldValue(lead.phone_number),

    consent: getFieldValue(lead.dong_y_tham_du_lop_hoc),

    registeredAt: getFieldValue(lead.thoi_gian_dang_ky_lop),

    attendedAt: getFieldValue(lead.thoi_gian_tham_du),

    classLink: getFieldValue(lead.link_lop_hoc),

    preSurvey: getFieldValue(lead.truoc_khi_tham_gia_lop_hoc),

    postSurvey: getFieldValue(lead.sau_khi_tham_gia_lop_hoc),

    postGroup: getFieldValue(lead.post_group),

    postRating: getFieldValue(lead.post_rating),

    supportNeed: getFieldValue(lead.nhu_cau_ho_tro_ncbsme),

    childOrder: getFieldValue(lead.thu_tu_con),

    developmentPriority: getFieldValue(lead.uu_tien_phat_trien_be),
  };
}

export async function GET() {
  try {
    const leads = await getLeads();

    const consultations = leads.filter(isCoEdu).map(formatConsultation);

    const registered = consultations.filter((item) => item.registeredAt !== "");

    const attended = consultations.filter((item) => item.attendedAt !== "");

    const preSurveyCompleted = consultations.filter(
      (item) => item.preSurvey !== "",
    );

    const postSurveyCompleted = consultations.filter(
      (item) => item.postSurvey !== "",
    );

    const attendanceRate =
      registered.length > 0
        ? Number(((attended.length / registered.length) * 100).toFixed(2))
        : 0;

    return NextResponse.json({
      success: true,

      data: {
        total: consultations.length,

        registered: registered.length,

        attended: attended.length,

        preSurveyCompleted: preSurveyCompleted.length,

        postSurveyCompleted: postSurveyCompleted.length,

        attendanceRate,

        consultations,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy dữ liệu consultation.",
      },
      { status: 500 },
    );
  }
}

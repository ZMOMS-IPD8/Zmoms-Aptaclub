import { NextRequest, NextResponse } from "next/server";

type PancakeLead = {
  id?: string;
  lead_id?: string;
  record_id?: string;
  name?: string | null;
  phone_number?: string | null;
  source?: string | number | null;
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
  [key: string]: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      fullName,
      phone,
      province,
      babyDate,
      referralCode,
      consentAptaclub,
      consentMarketing,
      consentDanone,
    } = body;

    if (!fullName || !phone || !province || !babyDate) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_DATA",
          message: "Thiếu thông tin bắt buộc.",
        },
        { status: 400 }
      );
    }

    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
    const apiKey = process.env.PANCAKE_API_KEY;
    const zaloUrl = process.env.ZMOMS_ZALO_OA_URL || "";

    if (!workspaceId || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          status: "CONFIG_ERROR",
          message: "Chưa cấu hình Pancake API.",
        },
        { status: 500 }
      );
    }

    const cleanPhone = String(phone).trim();
    const cleanFullName = String(fullName).trim();
    const cleanProvince = String(province).trim();
    const cleanReferralCode = String(referralCode ?? "").trim();

    console.log("=== REGISTRATION REQUEST ===");
    console.log("Phone:", cleanPhone);
    console.log("Full name:", cleanFullName);

    const rawBabyDate = String(babyDate).trim();
    const [year, month, day] = rawBabyDate.split("-");

    if (
      !year ||
      !month ||
      !day ||
      year.length !== 4 ||
      month.length !== 2 ||
      day.length !== 2
    ) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_DATE",
          message: "Định dạng ngày không hợp lệ.",
        },
        { status: 400 }
      );
    }

    const cleanBabyDate = `${year}-${month}-${day} 00:00:00`;

    const zmomsSourceId = "zl_626069465683660973";

    console.log("=== ZMOMS SOURCE ID ===");
    console.log(zmomsSourceId);

    const filter = {
      is_group: false,
      fields: [
        {
          field_name: "phone_number",
          type: "$enter_value",
          value: cleanPhone,
          is_filter_exclude: false,
        },
        {
          field_name: "source",
          type: "$enter_value",
          value: zmomsSourceId,
          is_filter_exclude: false,
        },
      ],
    };

    console.log("=== PANCAKE SEARCH FILTER ===");
    console.log(JSON.stringify(filter, null, 2));

    const checkUrl =
      `https://crm.pancake.vn/api/workspaces/` +
      `${workspaceId}/lead/records` +
      `?api_key=${encodeURIComponent(apiKey)}` +
      `&filter=${encodeURIComponent(JSON.stringify(filter))}`;

    const checkResponse = await fetch(checkUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const checkResult =
      (await checkResponse.json()) as PancakeResponse;

    console.log("=== PANCAKE SEARCH RESPONSE ===");
    console.log(JSON.stringify(checkResult, null, 2));

    if (!checkResponse.ok) {
      console.error("Pancake lead search error:", checkResult);

      return NextResponse.json(
        {
          success: false,
          status: "SEARCH_FAILED",
          message:
            "Không thể kiểm tra thông tin trên Pancake. Vui lòng thử lại.",
        },
        { status: checkResponse.status }
      );
    }

    const existingLeads = Array.isArray(
      checkResult?.data?.entries
    )
      ? checkResult.data.entries
      : [];

    console.log("=== MATCHING LEADS ===");
    console.log("Count:", existingLeads.length);
    console.log(JSON.stringify(existingLeads, null, 2));

    if (existingLeads.length === 0) {
      console.log("RESULT: NOT_IN_ZALO");

      return NextResponse.json(
        {
          success: false,
          status: "NOT_IN_ZALO",
          message:
            "Hiện tại bạn chưa tham gia Zalo OA của ZMoms. Vui lòng vào Zalo OA và để lại số điện thoại Zalo của mình để tiếp tục.",
          zaloUrl,
        },
        { status: 403 }
      );
    }

    const lead = existingLeads[0];

    console.log("=== SELECTED LEAD ===");
    console.log(
      JSON.stringify(
        {
          id: lead?.id,
          lead_id: lead?.lead_id,
          record_id: lead?.record_id,
          name: lead?.name,
          phone_number: lead?.phone_number,
          source: lead?.source,
          ho_va_ten_lien_he:
            lead?.ho_va_ten_lien_he,
        },
        null,
        2
      )
    );

    const existingContactName =
      typeof lead?.ho_va_ten_lien_he === "string"
        ? lead.ho_va_ten_lien_he.trim()
        : lead?.ho_va_ten_lien_he &&
          typeof lead.ho_va_ten_lien_he === "object" &&
          "value" in lead.ho_va_ten_lien_he
        ? String(
            lead.ho_va_ten_lien_he.value ?? ""
          ).trim()
        : "";

    console.log(
      "=== EXISTING CONTACT NAME ==="
    );
    console.log(
      JSON.stringify(existingContactName)
    );

    if (existingContactName) {
      console.log("RESULT: ALREADY_REGISTERED");

      return NextResponse.json(
        {
          success: false,
          status: "ALREADY_REGISTERED",
          message:
            "Thông tin của bạn đã được đăng ký rồi. Vui lòng liên hệ ZMoms để được hỗ trợ.",
          zaloUrl,
        },
        { status: 409 }
      );
    }

    const leadId =
      lead?.id ||
      lead?.lead_id ||
      lead?.record_id;

    console.log("=== LEAD ID TO UPDATE ===");
    console.log(leadId);

    if (!leadId) {
      return NextResponse.json(
        {
          success: false,
          status: "MISSING_LEAD_ID",
          message:
            "Không xác định được Lead cần cập nhật trên Pancake.",
        },
        { status: 500 }
      );
    }

    const eligibleForDanoneCRM =
      consentAptaclub === true &&
      consentDanone === true;

    const pancakePayload = {
      id: leadId,
      name:
        String(lead?.name ?? "").trim() ||
        cleanFullName,
      phone_number: cleanPhone,
      ho_va_ten_lien_he: cleanFullName,
      ngay_du_sinh_hoac_ngay_sinh_cua_be:
        cleanBabyDate,
      thanh_pho: cleanProvince,
      ma_gioi_thieu_dang_ky:
        cleanReferralCode,
      da_doc_chinh_sach_aptamil:
        consentDanone === true
          ? "true"
          : "false",
      dong_y_nhan_thong_bao:
        consentMarketing === true
          ? "true"
          : "false",
      chia_se_de_dang_ky_aptaclub:
        consentAptaclub === true
          ? "true"
          : "false",
    };

    console.log("=== PANCAKE UPDATE PAYLOAD ===");
    console.log(
      JSON.stringify(pancakePayload, null, 2)
    );

    const updateUrl =
      `https://crm.pancake.vn/api/workspaces/` +
      `${workspaceId}/lead/records` +
      `?api_key=${encodeURIComponent(apiKey)}`;

    const updateResponse = await fetch(updateUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pancakePayload),
    });

    const updateResult =
      (await updateResponse.json()) as PancakeResponse;

    console.log("=== PANCAKE UPDATE RESPONSE ===");
    console.log(
      JSON.stringify(updateResult, null, 2)
    );

    if (!updateResponse.ok) {
      console.error(
        "Pancake lead update error:",
        updateResult
      );

      return NextResponse.json(
        {
          success: false,
          status: "UPDATE_FAILED",
          message:
            updateResult?.message ||
            "Cập nhật thông tin thất bại. Vui lòng thử lại hoặc liên hệ ZMoms để được hỗ trợ.",
          zaloUrl,
        },
        { status: updateResponse.status }
      );
    }

    console.log("RESULT: UPDATED");

    return NextResponse.json({
      success: true,
      status: "UPDATED",
      message:
        "Thông tin của bạn đã được cập nhật thành công.",
      eligibleForDanoneCRM,
      pancake: updateResult,
    });
  } catch (error) {
    console.error("=== PANCAKE API ERROR ===");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message:
          "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.",
      },
      { status: 500 }
    );
  }
}
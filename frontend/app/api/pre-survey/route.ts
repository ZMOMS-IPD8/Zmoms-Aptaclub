import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../lib/pancake/member";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const leadId = String(body?.leadId ?? "").trim();
    const survey = body?.survey;

    if (!leadId) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_LEAD_ID",
          message: "Không xác định được thông tin hội viên.",
        },
        { status: 400 },
      );
    }

    if (!survey || typeof survey !== "object") {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_SURVEY",
          message: "Dữ liệu khảo sát không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const phone = String(survey?.member?.phone ?? "").trim();
    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^0\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_PHONE",
          message: "Không xác định được số điện thoại hội viên.",
        },
        { status: 400 },
      );
    }

    const member = await checkMemberByPhone(cleanPhone);

    if (!member.registered || !member.lead) {
      return NextResponse.json(
        {
          success: false,
          status: "MEMBER_NOT_FOUND",
          message: "Không tìm thấy thông tin hội viên.",
        },
        { status: 404 },
      );
    }

    if (String(member.leadId) !== leadId) {
      return NextResponse.json(
        {
          success: false,
          status: "LEAD_MISMATCH",
          message: "Thông tin hội viên không khớp.",
        },
        { status: 403 },
      );
    }

    const existingPreSurvey = getFieldValue(
      member.lead.truoc_khi_tham_gia_lop_hoc,
    );

    if (existingPreSurvey) {
      return NextResponse.json(
        {
          success: false,
          status: "PRE_SURVEY_ALREADY_COMPLETED",
          message:
            "Mẹ đã hoàn thành khảo sát trước buổi học trước đó. Mẹ không cần thực hiện lại khảo sát.",
        },
        { status: 409 },
      );
    }

    const tinhTrangMe = String(survey?.thongTinChung?.tinhTrangMe ?? "").trim();

    const thuTuCon = String(survey?.thongTinChung?.thuTuCon ?? "").trim();

    const duKienSinh = String(survey?.thongTinChung?.duKienSinh ?? "").trim();

    const nhuCauHoTro = String(survey?.nhuCau?.nhuCauHoTro ?? "").trim();

    const uuTienPhatTrien = String(
      survey?.nhuCau?.uuTienPhatTrien ?? "",
    ).trim();

    if (!tinhTrangMe || !thuTuCon || !duKienSinh) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_GENERAL_INFORMATION",
          message: "Thông tin khảo sát cơ bản chưa đầy đủ.",
        },
        { status: 400 },
      );
    }

    if (!nhuCauHoTro || !uuTienPhatTrien) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_COMMON_INFORMATION",
          message: "Thông tin nhu cầu chung chưa đầy đủ.",
        },
        { status: 400 },
      );
    }

    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
    const apiKey = process.env.PANCAKE_API_KEY;

    if (!workspaceId || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          status: "CONFIG_ERROR",
          message: "Chưa cấu hình Pancake API.",
        },
        { status: 500 },
      );
    }

    const surveyText = [
      "===== KHẢO SÁT TRƯỚC KHI THAM GIA =====",
      "",
      `Họ tên: ${survey?.member?.name ?? ""}`,
      `Số điện thoại: ${survey?.member?.phone ?? ""}`,
      "",
      "I. THÔNG TIN CHUNG",
      `Mẹ đang mang thai / đã sinh: ${tinhTrangMe}`,
      `Mẹ đang mang thai con thứ mấy: ${thuTuCon}`,
      `Dự kiến sinh: ${duKienSinh}`,
      "",
      "II. KHẢO SÁT THEO NHÁNH",
      JSON.stringify(survey?.conDauLong ?? survey?.conThuHai ?? null, null, 2),
      "",
      "III. NHU CẦU & KỲ VỌNG",
      `Mẹ có cần hỗ trợ bổ sung trong lúc Nuôi con bằng sữa mẹ không: ${nhuCauHoTro}`,
      `Mẹ ưu tiên yếu tố nào cho bé: ${uuTienPhatTrien}`,
      `Thương hiệu thực phẩm bổ sung: ${survey?.nhuCau?.thuongHieu ?? ""}`,
      `Kỳ vọng tư vấn: ${survey?.nhuCau?.kyVong ?? ""}`,
      `Mẹ biết về IPD8 qua đâu: ${survey?.nhuCau?.nhanBietIpd8 ?? ""}`,
      "",
      "IV. THÔNG TIN BUỔI HỌC",
      `Lớp học: ${survey?.booking?.classTitle ?? ""}`,
      `Mã lớp: ${survey?.booking?.classId ?? ""}`,
      `Ngày: ${survey?.booking?.date ?? ""}`,
      `Giờ: ${survey?.booking?.time ?? ""}`,
      "",
      `Thời gian gửi: ${survey?.submittedAt ?? ""}`,
    ].join("\n");

    const updatePayload = {
      id: leadId,
      tinh_trang_me: tinhTrangMe,
      thu_tu_con: thuTuCon,
      du_kien_sinh: duKienSinh,
      nhu_cau_ho_tro_ncbsme: nhuCauHoTro,
      uu_tien_phat_trien_be: uuTienPhatTrien,
      truoc_khi_tham_gia_lop_hoc: surveyText,
    };

    const updateUrl =
      `https://crm.pancake.vn/api/workspaces/` +
      `${workspaceId}/lead/records` +
      `?api_key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(updateUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          status: "UPDATE_FAILED",
          message:
            result?.message || "Pancake không thể lưu thông tin khảo sát.",
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      status: "SURVEY_SAVED",
      message: "Đã lưu khảo sát thành công.",
      leadId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi lưu khảo sát.",
      },
      { status: 500 },
    );
  }
}

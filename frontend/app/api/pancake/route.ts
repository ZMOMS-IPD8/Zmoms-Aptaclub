import { NextRequest, NextResponse } from "next/server";

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
          message: "Thiếu thông tin bắt buộc.",
        },
        { status: 400 }
      );
    }

    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
    const apiKey = process.env.PANCAKE_API_KEY;

    if (!workspaceId || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Chưa cấu hình Pancake API.",
        },
        { status: 500 }
      );
    }

    const eligibleForDanoneCRM =
      consentAptaclub === true && consentDanone === true;

    const pancakePayload = {
      name: String(fullName).trim(),
      phone_number: String(phone).trim(),

      ngay_du_sinh_hoac_ngay_sinh_cua_be: String(babyDate).trim(),
      thanh_pho: String(province).trim(),
      ma_gioi_thieu_dang_ky: String(referralCode ?? "").trim(),

      da_doc_chinh_sach_aptamil: consentDanone === true,
      dong_y_nhan_thong_bao: consentMarketing === true,
      chia_se_de_dang_ky_aptaclub: consentAptaclub === true,
    };

    const url =
      `https://crm.pancake.vn/api/workspaces/` +
      `${workspaceId}/lead/records?api_key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pancakePayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Pancake error:", result);
      console.error(
        "Pancake payload:",
        JSON.stringify(pancakePayload, null, 2)
      );

      return NextResponse.json(
        {
          success: false,
          message: "Không thể tạo Lead trên Pancake.",
          pancake: result,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      eligibleForDanoneCRM,
      pancake: result,
    });
  } catch (error) {
    console.error("Pancake API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Có lỗi xảy ra khi kết nối Pancake.",
      },
      { status: 500 }
    );
  }
}
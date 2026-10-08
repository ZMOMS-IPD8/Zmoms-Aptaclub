import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../../lib/pancake/member";

type OrderBody = {
  registrationPhone: string;
  receiverName: string;
  shippingPhone: string;
  shippingAddress: string;
  maNguoiBan: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderBody;

    const cleanRegistrationPhone = String(body.registrationPhone ?? "")
      .trim()
      .replace(/\D/g, "");

    const cleanReceiverName = String(body.receiverName ?? "").trim();

    const cleanShippingPhone = String(body.shippingPhone ?? "")
      .trim()
      .replace(/\D/g, "");

    const cleanShippingAddress = String(body.shippingAddress ?? "").trim();

    const cleanMaNguoiBan = String(body.maNguoiBan ?? "")
      .trim()
      .toUpperCase();

    if (!/^0\d{9}$/.test(cleanRegistrationPhone)) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_PHONE",
          message: "Số điện thoại đăng ký không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (!cleanReceiverName) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_RECEIVER_NAME",
          message: "Vui lòng nhập tên người nhận.",
        },
        { status: 400 },
      );
    }

    if (!/^0\d{9}$/.test(cleanShippingPhone)) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_SHIPPING_PHONE",
          message: "Số điện thoại nhận hàng không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (!cleanShippingAddress) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_ADDRESS",
          message: "Vui lòng nhập địa chỉ nhận hàng.",
        },
        { status: 400 },
      );
    }

    if (!cleanMaNguoiBan) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_SELLER",
          message: "Không xác định được mã người bán.",
        },
        { status: 400 },
      );
    }

    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
    const apiKey = process.env.PANCAKE_CRM_API_KEY;

    if (!workspaceId || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          status: "SERVER_ERROR",
          message: "Chưa cấu hình Pancake CRM API.",
        },
        { status: 500 },
      );
    }

    const member = await checkMemberByPhone(cleanRegistrationPhone);

    if (!member.registered || !member.lead) {
      return NextResponse.json(
        {
          success: false,
          status: "NOT_REGISTERED",
          message: "Số điện thoại chưa đăng ký hội viên.",
        },
        { status: 403 },
      );
    }

    const leadId = member.leadId;

    if (!leadId) {
      return NextResponse.json(
        {
          success: false,
          status: "LEAD_NOT_FOUND",
          message: "Không tìm thấy Lead trên Pancake.",
        },
        { status: 404 },
      );
    }

    const orderDate = new Date().toISOString();

    const updatePayload: Record<string, string> = {
      id: leadId,
      ten_nguoi_nhan: cleanReceiverName,
      so_dien_thoai_giao_hang: cleanShippingPhone,
      dia_chi_nhan_hang: cleanShippingAddress,
      ngay_dat_hang: orderDate,
      ma_nguoi_ban: cleanMaNguoiBan,
      trang_thai_giao_hang: "Giao thành công",
    };

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
      body: JSON.stringify(updatePayload),
    });

    const updateText = await updateResponse.text();

    let updateResult: Record<string, unknown> = {};

    try {
      updateResult = updateText
        ? (JSON.parse(updateText) as Record<string, unknown>)
        : {};
    } catch {
      updateResult = {};
    }

    if (!updateResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          status: "UPDATE_FAILED",
          leadFound: true,
          leadId,
          message:
            typeof updateResult.message === "string"
              ? updateResult.message
              : "Không thể cập nhật thông tin đặt hàng trên Pancake.",
        },
        { status: updateResponse.status },
      );
    }

    return NextResponse.json({
      success: true,
      status: "ORDERED",
      leadFound: true,
      leadId,
      registrationPhone: cleanRegistrationPhone,
      receiverName: cleanReceiverName,
      shippingPhone: cleanShippingPhone,
      shippingAddress: cleanShippingAddress,
      orderDate,
      maNguoiBan: cleanMaNguoiBan,
      message: "Đã cập nhật thông tin đặt hàng trên Pancake.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi cập nhật thông tin đặt hàng.",
      },
      { status: 500 },
    );
  }
}

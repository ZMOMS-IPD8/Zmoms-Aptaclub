import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../../lib/pancake/member";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const phone = String(body?.phone ?? "").trim();
    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^0\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          status: "INVALID_PHONE",
          message: "Số điện thoại không đúng định dạng.",
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

    const member = await checkMemberByPhone(cleanPhone);

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

    const currentDeliveryStatus = String(
      member.lead.trang_thai_giao_hang ?? "",
    ).trim();

    if (currentDeliveryStatus === "Giao thành công") {
      return NextResponse.json({
        success: true,
        status: "ALREADY_PURCHASED",
        registered: true,
        purchased: true,
        leadId,
        deliveryStatus: "Giao thành công",
        message: "Thông tin đã được cập nhật trước đó.",
      });
    }

    const updatePayload: Record<string, string> = {
      id: leadId,
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
              : "Không thể cập nhật tình trạng mua hàng trên Pancake.",
        },
        { status: updateResponse.status },
      );
    }

    return NextResponse.json({
      success: true,
      status: "UPDATED",
      registered: true,
      purchased: true,
      leadId,
      deliveryStatus: "Giao thành công",
      message: "Đã cập nhật tình trạng mua hàng thành công.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: "SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi cập nhật tình trạng mua hàng.",
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { registrationPhone, shippingPhone, fullAddress, maNguoiBan } = body;

    if (!registrationPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu số điện thoại đăng ký.",
        },
        { status: 400 },
      );
    }

    if (!shippingPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu số điện thoại giao hàng.",
        },
        { status: 400 },
      );
    }

    if (!fullAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu địa chỉ giao hàng.",
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
          message: "Chưa cấu hình Pancake API.",
        },
        { status: 500 },
      );
    }

    const cleanRegistrationPhone = String(registrationPhone)
      .trim()
      .replace(/\D/g, "");

    const cleanShippingPhone = String(shippingPhone).trim().replace(/\D/g, "");

    const cleanAddress = String(fullAddress).trim();

    const cleanMaNguoiBan = String(maNguoiBan ?? "").trim();

    if (!/^0\d{9}$/.test(cleanRegistrationPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Số điện thoại đăng ký không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (!/^0\d{9}$/.test(cleanShippingPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Số điện thoại giao hàng không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const filter = {
      is_group: false,
      fields: [
        {
          field_name: "phone_number",
          type: "$enter_value",
          value: cleanRegistrationPhone,
          is_filter_exclude: false,
        },
      ],
    };

    const findUrl =
      `https://crm.pancake.vn/api/workspaces/` +
      `${workspaceId}/lead/records` +
      `?api_key=${encodeURIComponent(apiKey)}` +
      `&filter=${encodeURIComponent(JSON.stringify(filter))}`;

    const findResponse = await fetch(findUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const findResult = await findResponse.json();

    if (!findResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Không thể tìm Lead trên Pancake.",
          pancake: findResult,
        },
        {
          status: findResponse.status,
        },
      );
    }

    const leads = Array.isArray(findResult?.data?.entries)
      ? findResult.data.entries
      : [];

    if (leads.length === 0) {
      return NextResponse.json(
        {
          success: false,
          leadFound: false,
          message: "Không tìm thấy Lead tương ứng với số điện thoại đăng ký.",
        },
        { status: 404 },
      );
    }

    const lead = leads[0];

    if (!lead?.id) {
      return NextResponse.json(
        {
          success: false,
          leadFound: false,
          message: "Lead tìm thấy nhưng không có ID.",
        },
        { status: 422 },
      );
    }

    const updatePayload: Record<string, string> = {
      id: String(lead.id),
      name: lead.name || "Khách hàng Zmoms",
      phone_number: lead.phone_number || cleanRegistrationPhone,
      so_dien_thoai_giao_hang: cleanShippingPhone,
      full_address: cleanAddress,
    };

    if (cleanMaNguoiBan) {
      updatePayload.ma_nguoi_ban = cleanMaNguoiBan;
    }

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

    const updateResult = await updateResponse.json();

    if (!updateResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          leadFound: true,
          leadId: lead.id,
          message:
            updateResult?.message ||
            "Không thể cập nhật thông tin Lead trên Pancake.",
          pancake: updateResult,
        },
        {
          status: updateResponse.status,
        },
      );
    }

    return NextResponse.json({
      success: true,
      leadFound: true,
      leadId: lead.id,
      maNguoiBan: cleanMaNguoiBan || null,
      message: "Đã cập nhật thông tin giao hàng và mã người bán trên Pancake.",
      pancake: updateResult,
    });
  } catch (error) {
    console.error("Pancake update lead error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Có lỗi xảy ra khi cập nhật Lead trên Pancake.",
      },
      { status: 500 },
    );
  }
}

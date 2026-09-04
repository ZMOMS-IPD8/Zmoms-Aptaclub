import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const phone = String(body?.phone ?? "").trim();

    if (!phone) {
      return NextResponse.json(
        {
          registered: false,
          purchased: false,
          message: "Vui lòng nhập số điện thoại.",
        },
        { status: 400 },
      );
    }

    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
    const apiKey = process.env.PANCAKE_API_KEY;

    if (!workspaceId || !apiKey) {
      return NextResponse.json(
        {
          registered: false,
          purchased: false,
          message: "Chưa cấu hình Pancake API.",
        },
        { status: 500 },
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^0\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        {
          registered: false,
          purchased: false,
          message: "Số điện thoại không đúng định dạng.",
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
          value: cleanPhone,
          is_filter_exclude: false,
        },
      ],
    };

    const checkUrl =
      `https://crm.pancake.vn/api/workspaces/` +
      `${workspaceId}/lead/records` +
      `?api_key=${encodeURIComponent(apiKey)}` +
      `&filter=${encodeURIComponent(JSON.stringify(filter))}`;

    const response = await fetch(checkUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json();

    console.log("Pancake registration check:", JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error(
        "Pancake registration check error:",
        JSON.stringify(result, null, 2),
      );

      return NextResponse.json(
        {
          registered: false,
          purchased: false,
          message: "Không thể kiểm tra số điện thoại trên Pancake.",
        },
        { status: response.status },
      );
    }

    const existingLeads = Array.isArray(result?.data?.entries)
      ? result.data.entries
      : [];

    if (existingLeads.length === 0) {
      console.log("Registered phone not found:", cleanPhone);

      return NextResponse.json({
        registered: false,
        purchased: false,
      });
    }

    const lead = existingLeads[0];

    const sanPham = lead?.san_pham;

    const purchased =
      sanPham !== null &&
      sanPham !== undefined &&
      String(sanPham).trim() !== "";

    console.log("Registered phone found:", cleanPhone);
    console.log("Pancake san_pham:", sanPham);
    console.log("Purchased:", purchased);

    return NextResponse.json({
      registered: true,
      purchased,
    });
  } catch (error) {
    console.error("Check registration API error:", error);

    return NextResponse.json(
      {
        registered: false,
        purchased: false,
        message: "Có lỗi xảy ra khi kiểm tra thông tin.",
      },
      { status: 500 },
    );
  }
}

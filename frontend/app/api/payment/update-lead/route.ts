import { NextRequest, NextResponse } from "next/server";
import { checkMemberByPhone } from "../../../lib/pancake/member";

type ComboType = "small" | "large";

type UpdateLeadBody = {
  registrationPhone: string;
  shippingPhone: string;
  fullName: string;
  Address: string;
  province: string;
  commune: string;
  country: string;
  maNguoiBan?: string;
  combo: ComboType;
  orderCode: string;
};

const COMBO_CONFIG: Record<
  ComboType,
  {
    name: string;
    price: number;
  }
> = {
  small: {
    name: "Combo nhỏ",
    price: 349000,
  },
  large: {
    name: "Combo lớn",
    price: 829000,
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as UpdateLeadBody;

    const {
      registrationPhone,
      shippingPhone,
      fullName,
      Address,
      province,
      commune,
      country,
      maNguoiBan,
      combo,
      orderCode,
    } = body;

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

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu họ tên người nhận.",
        },
        { status: 400 },
      );
    }

    if (!Address) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu địa chỉ giao hàng.",
        },
        { status: 400 },
      );
    }

    if (!province) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu tỉnh/thành phố.",
        },
        { status: 400 },
      );
    }

    if (!commune) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu phường/xã.",
        },
        { status: 400 },
      );
    }

    if (!country) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu quốc gia.",
        },
        { status: 400 },
      );
    }

    if (combo !== "small" && combo !== "large") {
      return NextResponse.json(
        {
          success: false,
          message: "Combo đặt hàng không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const cleanRegistrationPhone = String(registrationPhone)
      .trim()
      .replace(/\D/g, "");

    const cleanShippingPhone = String(shippingPhone).trim().replace(/\D/g, "");

    const cleanFullName = String(fullName).trim();
    const cleanAddress = String(Address).trim();
    const cleanProvince = String(province).trim();
    const cleanCommune = String(commune).trim();
    const cleanCountry = String(country).trim();

    const cleanMaNguoiBan = String(maNguoiBan ?? "")
      .trim()
      .toUpperCase();

    const cleanOrderCode = String(orderCode ?? "").trim();

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

    if (!cleanFullName) {
      return NextResponse.json(
        {
          success: false,
          message: "Họ tên người nhận không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (!cleanAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Địa chỉ giao hàng không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (!cleanProvince) {
      return NextResponse.json(
        {
          success: false,
          message: "Tỉnh/thành phố không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (!cleanCommune) {
      return NextResponse.json(
        {
          success: false,
          message: "Phường/xã không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (!cleanCountry) {
      return NextResponse.json(
        {
          success: false,
          message: "Quốc gia không hợp lệ.",
        },
        { status: 400 },
      );
    }

    if (!cleanOrderCode || !/^ZMOMS-\d+$/.test(cleanOrderCode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Mã đơn hàng không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
    const apiKey = process.env.PANCAKE_CRM_API_KEY;
    const zaloUrl = process.env.ZMOMS_ZALO_OA_URL || "";

    if (!workspaceId || !apiKey) {
      return NextResponse.json(
        {
          success: false,
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
          registered: false,
          message: "Số điện thoại chưa đăng ký hội viên.",
        },
        { status: 403 },
      );
    }

    const lead = member.lead;
    const leadId = member.leadId;

    const leadOrderCode = String(lead.ma_don_hang ?? "").trim();

    if (!leadOrderCode || leadOrderCode !== cleanOrderCode) {
      return NextResponse.json(
        {
          success: false,
          paymentConfirmed: false,
          orderMatched: false,
          message: "Mã đơn hàng không khớp với số điện thoại.",
        },
        { status: 409 },
      );
    }

    const paymentStatus = String(lead.trang_thai_thanh_toan ?? "").trim();

    if (paymentStatus !== "Đã thanh toán") {
      return NextResponse.json(
        {
          success: false,
          paymentConfirmed: false,
          orderMatched: true,
          paymentStatus: paymentStatus || "Chưa thanh toán",
          zaloUrl,
          message:
            "Đơn hàng chưa được xác nhận thanh toán thành công. Mẹ vui lòng chờ hệ thống xác nhận rồi nhập thông tin nhận hàng.",
        },
        { status: 409 },
      );
    }

    const selectedCombo = COMBO_CONFIG[combo];

    const updatePayload: Record<string, string> = {
      id: leadId,
      name: cleanFullName,
      so_dien_thoai_giao_hang: cleanShippingPhone,
      Address: cleanAddress,
      province: cleanProvince,
      commune: cleanCommune,
      country: cleanCountry,
      ma_nguoi_ban: cleanMaNguoiBan,
      ten_combo: selectedCombo.name,
      gia_tien: String(selectedCombo.price),
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

    const updateResult = await updateResponse.json();

    if (!updateResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          leadFound: true,
          leadId,
          message:
            updateResult?.message ||
            "Không thể cập nhật thông tin Lead trên Pancake.",
        },
        { status: updateResponse.status },
      );
    }

    return NextResponse.json({
      success: true,
      leadFound: true,
      leadId,
      paymentConfirmed: true,
      orderMatched: true,
      paymentStatus: "Đã thanh toán",
      orderCode: cleanOrderCode,
      maNguoiBan: cleanMaNguoiBan || null,
      tenCombo: selectedCombo.name,
      giaTien: selectedCombo.price,
      zaloUrl,
      message: "Đã cập nhật thông tin nhận hàng trên Pancake.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi cập nhật Lead trên Pancake.",
      },
      { status: 500 },
    );
  }
}

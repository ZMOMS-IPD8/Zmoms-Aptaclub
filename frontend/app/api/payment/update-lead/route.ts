import { NextRequest, NextResponse } from "next/server";
import { validateReferralCode } from "../../../uu-dai/data/referralCodes";
import { checkMemberByPhone } from "../../../lib/pancake/member";

type ComboType = "small" | "large";

type UpdateLeadBody = {
  registrationPhone: string;
  shippingPhone: string;
  fullAddress: string;
  maNguoiBan?: string;
  combo: ComboType;
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

    const { registrationPhone, shippingPhone, fullAddress, maNguoiBan, combo } =
      body;

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

    const cleanAddress = String(fullAddress).trim();

    const cleanMaNguoiBan = String(maNguoiBan ?? "")
      .trim()
      .toUpperCase();

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

    if (!validateReferralCode(cleanMaNguoiBan)) {
      return NextResponse.json(
        {
          success: false,
          message: "Mã người bán không hợp lệ.",
        },
        { status: 400 },
      );
    }

    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
    const apiKey = process.env.PANCAKE_API_KEY;
    const zaloUrl = process.env.ZMOMS_ZALO_OA_URL || "";

    if (!workspaceId || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Chưa cấu hình Pancake API.",
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

    const registeredReferralCode = String(lead.ma_gioi_thieu_dang_ky ?? "")
      .trim()
      .toUpperCase();

    if (!registeredReferralCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Chưa có mã giới thiệu trong thông tin đăng ký.",
        },
        { status: 403 },
      );
    }

    if (registeredReferralCode !== cleanMaNguoiBan) {
      return NextResponse.json(
        {
          success: false,
          message: "Mã người bán không khớp với thông tin đăng ký.",
        },
        { status: 403 },
      );
    }

    const existingOrderDate = String(lead.ngay_dat_hang ?? "").trim();

    if (existingOrderDate) {
      return NextResponse.json(
        {
          success: false,
          alreadyPurchased: true,
          zaloUrl,
          message:
            "Số điện thoại này đã đặt hàng. Mẹ vui lòng nhắn tin qua Zalo OA để biết tình trạng đơn hàng.",
        },
        { status: 409 },
      );
    }

    const selectedCombo = COMBO_CONFIG[combo];

    const orderDate = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).format(new Date());

    const updatePayload: Record<string, string> = {
      id: leadId,
      name: String(lead.name ?? "").trim() || "Khách hàng Zmoms",
      phone_number:
        String(lead.phone_number ?? "").trim() || cleanRegistrationPhone,
      so_dien_thoai_giao_hang: cleanShippingPhone,
      full_address: cleanAddress,
      ma_nguoi_ban: cleanMaNguoiBan,
      ten_combo: selectedCombo.name,
      gia_tien: String(selectedCombo.price),
      ngay_dat_hang: orderDate,
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
      maNguoiBan: cleanMaNguoiBan,
      tenCombo: selectedCombo.name,
      giaTien: selectedCombo.price,
      ngayDatHang: orderDate,
      zaloUrl,
      message:
        "Đã cập nhật thông tin giao hàng, combo, giá tiền và ngày đặt hàng trên Pancake.",
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

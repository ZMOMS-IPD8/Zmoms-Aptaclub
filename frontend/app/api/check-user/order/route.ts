import { NextRequest, NextResponse } from "next/server";
import { checkUserByPhone } from "../../../lib/pancake/pancake-user-check";
import { submitOrderToAppsScript } from "@/lib/google-apps-script/order";

export const dynamic = "force-dynamic";

type OrderBody = {
  registrationPhone?: string;
  receiverName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  nguoiBan?: string;
  salesSource?: string;
  bank?: string;
  orderDate?: string;
};

type PancakeUpdateResponse = {
  success?: boolean;
  message?: string;
};

const ALLOWED_SOURCES = ["PG", "SPA", "Tiêm Chủng", "Nữ Hộ Sinh", "Co-Edu"];

const ALLOWED_BANKS = ["Techcombank", "Vietcombank"];

function jsonError(
  status: number,
  code: string,
  message: string,
  extra: Record<string, unknown> = {},
) {
  return NextResponse.json(
    {
      success: false,
      status: code,
      message,
      ...extra,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function normalizePhone(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\D/g, "");
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function isValidIsoDate(value: string): boolean {
  if (!value) return false;

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);

  if (!hasTimezone) return false;

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp);
}

function resolveOrderDate(value: unknown): string {
  const normalized = normalizeText(value);

  if (isValidIsoDate(normalized)) {
    return new Date(normalized).toISOString();
  }

  return new Date().toISOString();
}

function jsonSuccess(data: Record<string, unknown>) {
  return NextResponse.json(data, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    let body: OrderBody;

    try {
      const parsed: unknown = await req.json();

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return jsonError(
          400,
          "INVALID_BODY",
          "Thông tin lên đơn không hợp lệ. Vui lòng kiểm tra lại.",
        );
      }

      body = parsed as OrderBody;
    } catch {
      return jsonError(
        400,
        "INVALID_BODY",
        "Thông tin lên đơn không hợp lệ. Vui lòng kiểm tra lại.",
      );
    }

    const registrationPhone = normalizePhone(body.registrationPhone);
    const receiverName = normalizeText(body.receiverName);
    const shippingPhone = normalizePhone(body.shippingPhone);
    const shippingAddress = normalizeText(body.shippingAddress);
    const nguoiBan = normalizeText(body.nguoiBan);
    const salesSource = normalizeText(body.salesSource);
    const bank = normalizeText(body.bank);
    const orderDate = resolveOrderDate(body.orderDate);

    if (!/^0\d{9}$/.test(registrationPhone)) {
      return jsonError(
        400,
        "INVALID_PHONE",
        "Số điện thoại đăng ký không hợp lệ.",
      );
    }

    if (!receiverName) {
      return jsonError(
        400,
        "INVALID_RECEIVER_NAME",
        "Vui lòng nhập tên người nhận.",
      );
    }

    if (!/^0\d{9}$/.test(shippingPhone)) {
      return jsonError(
        400,
        "INVALID_SHIPPING_PHONE",
        "Số điện thoại nhận hàng phải gồm 10 chữ số và bắt đầu bằng 0.",
      );
    }

    if (!shippingAddress) {
      return jsonError(
        400,
        "INVALID_ADDRESS",
        "Vui lòng nhập địa chỉ nhận hàng.",
      );
    }

    if (!nguoiBan) {
      return jsonError(
        400,
        "INVALID_SELLER",
        "Chưa xác định được người bán. Vui lòng đăng nhập lại.",
      );
    }

    const sourceParts = salesSource.split(" - ");
    const sourcePrefix = sourceParts[0]?.trim();
    const sourceNote = sourceParts.slice(1).join(" - ").trim();

    if (
      !salesSource ||
      !sourceNote ||
      !ALLOWED_SOURCES.includes(sourcePrefix)
    ) {
      return jsonError(
        400,
        "INVALID_SALES_SOURCE",
        "Vui lòng chọn nguồn bán và nhập nội dung ghi chú.",
      );
    }

    if (!ALLOWED_BANKS.includes(bank)) {
      return jsonError(400, "INVALID_BANK", "Vui lòng chọn ngân hàng hợp lệ.");
    }

    if (!process.env.PANCAKE_WORKSPACE_ID || !process.env.PANCAKE_CRM_API_KEY) {
      return jsonError(
        503,
        "ORDER_UNAVAILABLE",
        "Hiện chưa thể xử lý lên đơn hàng. Vui lòng thử lại sau.",
      );
    }

    let checkResult: Awaited<ReturnType<typeof checkUserByPhone>>;

    try {
      checkResult = await checkUserByPhone(registrationPhone);
    } catch {
      return jsonError(
        502,
        "MEMBER_CHECK_FAILED",
        "Chưa thể kiểm tra thông tin hội viên. Vui lòng thử lại.",
      );
    }

    if (!checkResult.success) {
      return jsonError(
        502,
        "MEMBER_CHECK_FAILED",
        "Chưa thể kiểm tra thông tin hội viên. Vui lòng thử lại.",
      );
    }

    if (!checkResult.registered || !checkResult.member?.lead) {
      return jsonError(
        403,
        "NOT_REGISTERED",
        "Số điện thoại chưa đăng ký hội viên.",
      );
    }

    if (checkResult.purchased) {
      return jsonError(
        409,
        "ALREADY_PURCHASED",
        "Khách hàng đã mua hàng. Không thể lên đơn mới cho số điện thoại này.",
        {
          purchased: true,
          leadFound: true,
          pancakeUpdated: false,
          sheetSaved: false,
        },
      );
    }

    const leadId = String(checkResult.member.leadId ?? "").trim();

    if (!leadId) {
      return jsonError(
        404,
        "LEAD_NOT_FOUND",
        "Chưa tìm thấy thông tin khách hàng. Vui lòng kiểm tra lại.",
        {
          leadFound: false,
          pancakeUpdated: false,
          sheetSaved: false,
        },
      );
    }

    const loaiDon = bank === "Techcombank" ? "Tặng" : "Bán";

    const note =
      registrationPhone !== shippingPhone
        ? `SĐT nhận hàng: ${shippingPhone}`
        : "";

    const updatePayload: Record<string, string> = {
      id: leadId,
      ten_nguoi_nhan: receiverName,
      so_dien_thoai_giao_hang: shippingPhone,
      dia_chi_nhan_hang: shippingAddress,
      ngay_dat_hang: orderDate,
      nguoi_ban: nguoiBan,
      nguon_mua_hang: salesSource,
      loai_don: loaiDon,
      trang_thai_giao_hang: "Giao thành công",
    };

    const workspaceId = process.env.PANCAKE_WORKSPACE_ID;
    const apiKey = process.env.PANCAKE_CRM_API_KEY;

    const updateUrl =
      `https://crm.pancake.vn/api/workspaces/` +
      `${workspaceId}/lead/records` +
      `?api_key=${encodeURIComponent(apiKey!)}`;

    let updateResponse: Response;

    try {
      updateResponse = await fetch(updateUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
        cache: "no-store",
      });
    } catch {
      return jsonError(
        502,
        "ORDER_UPDATE_FAILED",
        "Chưa thể cập nhật thông tin đơn hàng. Vui lòng thử lại sau.",
        {
          leadFound: true,
          leadId,
          pancakeUpdated: false,
          sheetSaved: false,
          orderDate,
        },
      );
    }

    let updateResult: PancakeUpdateResponse;

    try {
      const updateText = await updateResponse.text();

      if (!updateText.trim()) {
        throw new Error("EMPTY_RESPONSE");
      }

      const parsed: unknown = JSON.parse(updateText);

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("INVALID_RESPONSE");
      }

      updateResult = parsed as PancakeUpdateResponse;
    } catch {
      return jsonError(
        502,
        "ORDER_UPDATE_FAILED",
        "Chưa xác nhận được kết quả cập nhật đơn hàng. Vui lòng kiểm tra trạng thái đơn trước khi thử lại.",
        {
          leadFound: true,
          leadId,
          pancakeUpdated: false,
          sheetSaved: false,
          orderDate,
        },
      );
    }

    if (!updateResponse.ok || updateResult.success !== true) {
      return jsonError(
        502,
        "ORDER_UPDATE_FAILED",
        "Chưa thể cập nhật thông tin đơn hàng. Vui lòng thử lại sau.",
        {
          leadFound: true,
          leadId,
          pancakeUpdated: false,
          sheetSaved: false,
          orderDate,
        },
      );
    }

    let sheetResult: Awaited<ReturnType<typeof submitOrderToAppsScript>>;

    try {
      sheetResult = await submitOrderToAppsScript({
        registrationPhone,
        receiverName,
        shippingPhone,
        shippingAddress,
        nguoiBan,
        salesSource,
        bank,
        loaiDon,
        pancakeId: leadId,
        orderDate,
        note,
      });
    } catch {
      return jsonError(
        502,
        "ORDER_SAVE_INCOMPLETE",
        "Thông tin đơn hàng chưa được lưu hoàn tất. Vui lòng kiểm tra trạng thái đơn trước khi thực hiện lại.",
        {
          leadFound: true,
          leadId,
          pancakeUpdated: true,
          sheetSaved: false,
          orderDate,
        },
      );
    }

    if (
      !sheetResult ||
      sheetResult.success !== true ||
      typeof sheetResult.rowNumber !== "number"
    ) {
      return jsonError(
        502,
        "ORDER_SAVE_INCOMPLETE",
        "Thông tin đơn hàng chưa được lưu hoàn tất. Vui lòng kiểm tra trạng thái đơn trước khi thực hiện lại.",
        {
          leadFound: true,
          leadId,
          pancakeUpdated: true,
          sheetSaved: false,
          orderDate,
        },
      );
    }

    return jsonSuccess({
      success: true,
      status: "ORDERED",
      leadFound: true,
      leadId,
      pancakeUpdated: true,
      sheetSaved: true,
      rowNumber: sheetResult.rowNumber,
      registrationPhone,
      receiverName,
      shippingPhone,
      shippingAddress,
      nguoiBan,
      salesSource,
      bank,
      loaiDon,
      note,
      orderDate,
      message: "Lên đơn hàng thành công.",
    });
  } catch {
    return jsonError(
      500,
      "ORDER_FAILED",
      "Chưa thể hoàn tất lên đơn hàng. Vui lòng kiểm tra trạng thái đơn trước khi thử lại.",
    );
  }
}

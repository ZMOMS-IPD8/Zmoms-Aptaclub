import { useCallback, useRef, useState } from "react";

type OrderResult = {
  success: boolean;
  status?: string;
  message?: string;
  leadId?: string;
  leadFound?: boolean;
  pancakeUpdated?: boolean;
  sheetSaved?: boolean;
  orderDate?: string;
  rowNumber?: number;
  note?: string;
};

type OrderData = {
  registrationPhone: string;
  receiverName: string;
  shippingPhone: string;
  shippingAddress: string;
  nguoiBan: string;
  salesSource: string;
  note: string;
  bank: string;
};

const SALES_SOURCES = ["PG", "SPA", "Tiêm Chủng", "Nữ Hộ Sinh", "Co-Edu"];

const BANKS = ["Techcombank", "Vietcombank"];

function normalizePhone(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\D/g, "");
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function getBusinessErrorMessage(message: unknown): string {
  if (typeof message !== "string" || !message.trim()) {
    return "Chưa thể hoàn tất lên đơn hàng. Vui lòng kiểm tra thông tin và thử lại.";
  }

  const normalized = message.toLowerCase();

  const technicalKeywords = [
    "pancake",
    "google sheets",
    "spreadsheet",
    "google apps script",
    "api",
    "endpoint",
    "server",
    "máy chủ",
    "database",
    "database error",
    "internal server error",
    "stack trace",
    "token",
    "unauthorized",
    "forbidden",
    "fetch failed",
    "network error",
    "json",
    "exception",
    "timeout",
    "http ",
    "status code",
  ];

  if (technicalKeywords.some((keyword) => normalized.includes(keyword))) {
    return "Chưa thể hoàn tất lên đơn hàng. Vui lòng kiểm tra lại trạng thái đơn trước khi thử lại.";
  }

  return message.trim();
}

export function useOrder() {
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [error, setError] = useState("");

  const submittingRef = useRef(false);

  const resetOrder = useCallback(() => {
    if (submittingRef.current) return;

    setOrdering(false);
    setOrdered(false);
    setError("");
  }, []);

  const submitOrder = useCallback(
    async (data: OrderData): Promise<OrderResult | null> => {
      if (submittingRef.current) return null;

      setError("");
      setOrdered(false);

      const registrationPhone = normalizePhone(data.registrationPhone);
      const shippingPhone = normalizePhone(data.shippingPhone);
      const receiverName = normalizeText(data.receiverName);
      const shippingAddress = normalizeText(data.shippingAddress);
      const nguoiBan = normalizeText(data.nguoiBan);
      const salesSource = normalizeText(data.salesSource);
      const note = normalizeText(data.note);
      const bank = normalizeText(data.bank);

      if (!/^0\d{9}$/.test(registrationPhone)) {
        setError("Số điện thoại đăng ký không hợp lệ.");
        return null;
      }

      if (!receiverName) {
        setError("Vui lòng nhập tên người nhận.");
        return null;
      }

      if (!/^0\d{9}$/.test(shippingPhone)) {
        setError(
          "Số điện thoại nhận hàng phải gồm 10 chữ số và bắt đầu bằng 0.",
        );
        return null;
      }

      if (!shippingAddress) {
        setError("Vui lòng nhập địa chỉ nhận hàng.");
        return null;
      }

      if (!nguoiBan) {
        setError(
          "Chưa xác định được thông tin người bán. Vui lòng đăng nhập lại.",
        );
        return null;
      }

      if (!SALES_SOURCES.includes(salesSource)) {
        setError("Vui lòng chọn nguồn bán hợp lệ.");
        return null;
      }

      if (!note) {
        setError("Vui lòng nhập nội dung ghi chú.");
        return null;
      }

      if (!BANKS.includes(bank)) {
        setError("Vui lòng chọn Techcombank hoặc Vietcombank.");
        return null;
      }

      const combinedSalesSource = `${salesSource} - ${note}`;

      submittingRef.current = true;
      setOrdering(true);

      try {
        const response = await fetch("/api/check-user/order", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            registrationPhone,
            receiverName,
            shippingPhone,
            shippingAddress,
            nguoiBan,
            salesSource: combinedSalesSource,
            bank,
          }),
        });

        let result: OrderResult;

        try {
          const json: unknown = await response.json();

          if (
            !json ||
            typeof json !== "object" ||
            Array.isArray(json) ||
            !("success" in json) ||
            typeof json.success !== "boolean"
          ) {
            throw new Error("INVALID_RESPONSE");
          }

          result = json as OrderResult;
        } catch {
          setError(
            "Chưa xác định được kết quả lên đơn hàng. Vui lòng kiểm tra trạng thái đơn trước khi thực hiện lại.",
          );
          return null;
        }

        if (!response.ok || result.success !== true) {
          setError(getBusinessErrorMessage(result.message));
          return result;
        }

        if (result.pancakeUpdated !== true || result.sheetSaved !== true) {
          setError(
            "Đơn hàng chưa được xác nhận hoàn tất. Vui lòng kiểm tra trạng thái đơn trước khi thử lại.",
          );
          return result;
        }

        setOrdered(true);
        setError("");

        return result;
      } catch {
        setError(
          "Chưa xác định được kết quả lên đơn hàng. Vui lòng kiểm tra trạng thái đơn trước khi thực hiện lại.",
        );
        return null;
      } finally {
        submittingRef.current = false;
        setOrdering(false);
      }
    },
    [],
  );

  return {
    ordering,
    ordered,
    error,
    setError,
    submitOrder,
    resetOrder,
  };
}

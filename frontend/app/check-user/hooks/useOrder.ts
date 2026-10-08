import { useState } from "react";

type OrderResult = {
  success: boolean;
  status?: string;
  message?: string;
  leadId?: string;
};

type OrderData = {
  registrationPhone: string;
  receiverName: string;
  shippingPhone: string;
  shippingAddress: string;
  maNguoiBan: string;
};

export function useOrder() {
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [error, setError] = useState("");

  const submitOrder = async (data: OrderData): Promise<OrderResult | null> => {
    setError("");

    const registrationPhone = data.registrationPhone.replace(/\D/g, "");

    const shippingPhone = data.shippingPhone.replace(/\D/g, "");

    if (!/^0\d{9}$/.test(registrationPhone)) {
      setError("Số điện thoại đăng ký không hợp lệ.");
      return null;
    }

    if (!data.receiverName.trim()) {
      setError("Vui lòng nhập tên người nhận.");
      return null;
    }

    if (!/^0\d{9}$/.test(shippingPhone)) {
      setError("Số điện thoại nhận hàng không hợp lệ.");
      return null;
    }

    if (!data.shippingAddress.trim()) {
      setError("Vui lòng nhập địa chỉ nhận hàng.");
      return null;
    }

    if (!data.maNguoiBan.trim()) {
      setError("Không xác định được người bán.");
      return null;
    }

    try {
      setOrdering(true);

      const response = await fetch("/api/check-user/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationPhone,
          receiverName: data.receiverName.trim(),
          shippingPhone,
          shippingAddress: data.shippingAddress.trim(),
          maNguoiBan: data.maNguoiBan.trim(),
        }),
      });

      const result = (await response.json()) as OrderResult;

      if (!response.ok || !result.success) {
        setError(result.message || "Không thể cập nhật thông tin đặt hàng.");

        return result;
      }

      setOrdered(true);

      return result;
    } catch {
      setError("Có lỗi xảy ra khi cập nhật thông tin đặt hàng.");

      return null;
    } finally {
      setOrdering(false);
    }
  };

  return {
    ordering,
    ordered,
    error,
    setError,
    submitOrder,
  };
}

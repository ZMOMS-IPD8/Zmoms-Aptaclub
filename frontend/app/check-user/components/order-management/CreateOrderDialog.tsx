"use client";

import { useCallback, useEffect, useState } from "react";

import OrderForm from "./OrderForm";
import OrderCheckResult from "./OrderCheckResult";
import { useOrder } from "../../hooks/useOrder";

type Props = {
  open: boolean;
  fullName: string;
  onClose: () => void;
};

type CheckResult = {
  success: boolean;
  status?: string;
  registered?: boolean;
  purchased?: boolean;
  purchasedWithoutRegistration?: boolean;
  deliveryStatus?: string;
  message?: string;
};

const SALES_SOURCES = ["PG", "SPA", "Tiêm Chủng", "Nữ Hộ Sinh", "Co-Edu"];
const BANKS = ["Techcombank", "Vietcombank"];

function getBusinessErrorMessage(message?: string): string {
  const normalized = String(message || "").toLowerCase();

  const technicalKeywords = [
    "pancake",
    "google sheets",
    "spreadsheet",
    "apps script",
    "api",
    "unauthorized",
    "server_error",
    "invalid_response",
    "thiếu tiêu đề cột",
    "fetch failed",
    "network",
    "timeout",
    "exception",
    "token",
    "database",
    "internal server error",
  ];

  if (technicalKeywords.some((keyword) => normalized.includes(keyword))) {
    return "Chưa thể hoàn tất lên đơn hàng. Vui lòng liên hệ quản lý để được hỗ trợ.";
  }

  return (
    message ||
    "Chưa thể hoàn tất lên đơn hàng. Vui lòng kiểm tra thông tin và thử lại."
  );
}

export default function CreateOrderDialog({ open, fullName, onClose }: Props) {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [orderingMode, setOrderingMode] = useState(false);
  const [receiverName, setReceiverName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  const {
    ordering,
    ordered,
    error: orderError,
    setError: setOrderError,
    submitOrder,
    resetOrder,
  } = useOrder();

  const resetForm = useCallback(() => {
    setPhone("");
    setResult(null);
    setError("");
    setOrderingMode(false);
    setReceiverName("");
    setShippingPhone("");
    setShippingAddress("");
    setOrderError("");
    resetOrder();
  }, [resetOrder, setOrderError]);

  const handleClose = useCallback(() => {
    if (loading || ordering) return;

    resetForm();
    onClose();
  }, [loading, ordering, resetForm, onClose]);

  useEffect(() => {
    if (!open || ordered) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading && !ordering) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, ordered, loading, ordering, handleClose]);

  const handlePhoneChange = (value: string) => {
    if (loading || ordering || ordered) return;

    setPhone(value.replace(/\D/g, "").slice(0, 10));
    setResult(null);
    setError("");
    setOrderError("");
    setOrderingMode(false);
    setReceiverName("");
    setShippingPhone("");
    setShippingAddress("");
  };

  const handleCheck = async () => {
    if (loading || ordering || ordered || orderingMode) return;

    const cleanPhone = phone.replace(/\D/g, "");

    setError("");
    setOrderError("");
    setResult(null);

    if (!/^0\d{9}$/.test(cleanPhone)) {
      setError("Vui lòng nhập số điện thoại hợp lệ gồm 10 chữ số.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/check-user", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          phone: cleanPhone,
        }),
      });

      let data: CheckResult;

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

        data = json as CheckResult;
      } catch {
        setError("Chưa thể kiểm tra thông tin. Vui lòng thử lại.");
        return;
      }

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        setError(getBusinessErrorMessage(data.message));
        return;
      }

      setResult(data);
    } catch {
      setError("Chưa thể kiểm tra thông tin lúc này. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartOrder = () => {
    if (
      !result?.registered ||
      result.purchased ||
      result.purchasedWithoutRegistration ||
      ordering ||
      ordered
    ) {
      return;
    }

    setError("");
    setOrderError("");
    setShippingPhone(phone);
    setOrderingMode(true);
  };

  const handleSubmitOrder = async (
    salesSource: string,
    note: string,
    bank: string,
    fullShippingAddress: string,
  ) => {
    if (
      loading ||
      ordering ||
      ordered ||
      !result?.registered ||
      result.purchased ||
      result.purchasedWithoutRegistration
    ) {
      return;
    }

    const cleanRegistrationPhone = phone.replace(/\D/g, "");
    const cleanReceiverName = receiverName.trim();
    const cleanShippingPhone = shippingPhone.replace(/\D/g, "");
    const cleanShippingAddress = fullShippingAddress.trim();
    const cleanFullName = fullName.trim();
    const cleanSalesSource = salesSource.trim();
    const cleanNote = note.trim();
    const cleanBank = bank.trim();

    setError("");
    setOrderError("");

    if (!/^0\d{9}$/.test(cleanRegistrationPhone)) {
      setOrderError("Số điện thoại đăng ký không hợp lệ.");
      return;
    }

    if (!cleanFullName) {
      setOrderError(
        "Chưa xác định được thông tin người bán. Vui lòng đăng nhập lại.",
      );
      return;
    }

    if (!cleanReceiverName) {
      setOrderError("Vui lòng nhập họ tên người nhận.");
      return;
    }

    if (!/^0\d{9}$/.test(cleanShippingPhone)) {
      setOrderError("Vui lòng nhập số điện thoại nhận hàng hợp lệ.");
      return;
    }

    if (!cleanShippingAddress) {
      setOrderError("Vui lòng nhập đầy đủ địa chỉ nhận hàng.");
      return;
    }

    if (!SALES_SOURCES.includes(cleanSalesSource)) {
      setOrderError("Vui lòng chọn nguồn bán hợp lệ.");
      return;
    }

    if (!cleanNote) {
      setOrderError("Vui lòng nhập nội dung ghi chú.");
      return;
    }

    if (!BANKS.includes(cleanBank)) {
      setOrderError("Vui lòng chọn ngân hàng.");
      return;
    }

    try {
      const orderResult = await submitOrder({
        registrationPhone: cleanRegistrationPhone,
        receiverName: cleanReceiverName,
        shippingPhone: cleanShippingPhone,
        shippingAddress: cleanShippingAddress,
        nguoiBan: cleanFullName,
        salesSource: cleanSalesSource,
        note: cleanNote,
        bank: cleanBank,
      });

      if (
        orderResult?.success === true &&
        orderResult.pancakeUpdated === true &&
        orderResult.sheetSaved === true
      ) {
        setError("");
        setOrderError("");
        return;
      }

      if (orderResult && !orderResult.success) {
        setOrderError(getBusinessErrorMessage(orderResult.message));
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "";

      setOrderError(getBusinessErrorMessage(message));
    }
  };

  if (!open) return null;

  if (ordered) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1F33]/50 p-4 backdrop-blur-sm">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-success-title"
          aria-describedby="order-success-description"
          className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <svg
              viewBox="0 0 24 24"
              className="h-9 w-9 text-emerald-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>

          <h2
            id="order-success-title"
            className="mt-5 text-xl font-extrabold text-[#12335B]"
          >
            Lên đơn hàng thành công
          </h2>

          <p
            id="order-success-description"
            className="mt-2 text-sm leading-6 text-gray-500"
          >
            Đơn hàng đã được ghi nhận thành công.
          </p>

          <button
            type="button"
            autoFocus
            onClick={handleClose}
            className="mt-6 h-12 w-full rounded-xl bg-[#12335B] text-sm font-bold text-white transition hover:bg-[#0D2949] focus:outline-none focus:ring-4 focus:ring-[#12335B]/15"
          >
            Hoàn tất
          </button>
        </section>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0B1F33]/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading && !ordering) {
          handleClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-order-title"
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#E8EDF3] bg-white px-5 py-4 sm:px-6">
          <div>
            <h2
              id="create-order-title"
              className="text-lg font-extrabold text-[#12335B] sm:text-xl"
            >
              Lên đơn hàng
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Kiểm tra thông tin hội viên trước khi lên đơn.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading || ordering}
            aria-label="Đóng cửa sổ"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </header>

        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <label
              htmlFor="order-phone"
              className="mb-2 block text-sm font-semibold text-[#12335B]"
            >
              Số điện thoại đăng ký
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="order-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                maxLength={10}
                disabled={loading || ordering || ordered}
                required
                placeholder="Nhập số điện thoại"
                onChange={(event) => handlePhoneChange(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !loading &&
                    !ordering &&
                    !ordered &&
                    !orderingMode
                  ) {
                    event.preventDefault();
                    void handleCheck();
                  }
                }}
                className="h-12 min-w-0 flex-1 rounded-xl border border-[#D8E1EB] px-4 text-sm text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10 disabled:bg-gray-100"
              />

              <button
                type="button"
                onClick={() => void handleCheck()}
                disabled={loading || ordering || ordered || orderingMode}
                className="h-12 rounded-xl bg-[#12335B] px-5 text-sm font-bold text-white transition hover:bg-[#0D2949] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang kiểm tra..." : "Kiểm tra"}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-5 text-red-600"
            >
              {error}
            </div>
          )}

          {result && (
            <OrderCheckResult
              registered={result.registered}
              purchased={result.purchased}
              purchasedWithoutRegistration={result.purchasedWithoutRegistration}
              orderingMode={orderingMode}
              ordered={ordered}
              onStartOrder={handleStartOrder}
            />
          )}

          {orderingMode &&
            result?.registered &&
            !result.purchased &&
            !result.purchasedWithoutRegistration &&
            !ordered && (
              <div className="border-t border-[#E8EDF3] pt-5">
                <h3 className="mb-4 text-base font-bold text-[#12335B]">
                  Thông tin nhận hàng
                </h3>

                <OrderForm
                  receiverName={receiverName}
                  shippingPhone={shippingPhone}
                  shippingAddress={shippingAddress}
                  disabled={ordering}
                  loading={ordering}
                  error={orderError}
                  onReceiverNameChange={setReceiverName}
                  onShippingPhoneChange={setShippingPhone}
                  onShippingAddressChange={setShippingAddress}
                  onSubmit={handleSubmitOrder}
                />
              </div>
            )}

          {orderError && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-5 text-red-600"
            >
              {getBusinessErrorMessage(orderError)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

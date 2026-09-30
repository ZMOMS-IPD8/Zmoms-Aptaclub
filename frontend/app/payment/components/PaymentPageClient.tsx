"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import PaymentQR from "./PaymentQR";
import PaymentGuide from "./PaymentGuide";
import ShippingForm from "./ShippingForm";
import PaymentStatus from "./PaymentStatus";
import { OFFERS } from "../../deal/data/offerData";
import type { PaymentInfo } from "./PaymentQR";

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

type ShippingData = {
  fullName: string;
  phone: string;
  country: string;
  province: string;
  commune: string;
  address: string;
};

type ComboType = "small" | "large";

type AccessStatus = "checking" | "granted" | "alreadyPurchased" | "denied";

type PaymentState = "checking" | "pending" | "paid";

const PAYMENT_STORAGE_KEY = "zmoms_payment_info";

let paymentSnapshotRaw: string | null = null;
let paymentSnapshot: PaymentInfo | null = null;

function getStoredPaymentSnapshot(): PaymentInfo | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedPayment = window.sessionStorage.getItem(PAYMENT_STORAGE_KEY);

  if (storedPayment === paymentSnapshotRaw) {
    return paymentSnapshot;
  }

  paymentSnapshotRaw = storedPayment;

  if (!storedPayment) {
    paymentSnapshot = null;
    return null;
  }

  try {
    const parsedPayment = JSON.parse(storedPayment) as PaymentInfo;

    if (
      !parsedPayment ||
      !parsedPayment.paymentId ||
      !parsedPayment.bankCode ||
      !parsedPayment.bankName ||
      !parsedPayment.accountNumber ||
      !parsedPayment.accountName ||
      parsedPayment.amount <= 0 ||
      !parsedPayment.transferContent
    ) {
      paymentSnapshot = null;
      return null;
    }

    paymentSnapshot = parsedPayment;
    return paymentSnapshot;
  } catch {
    paymentSnapshot = null;
    return null;
  }
}

function subscribeToPaymentStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
  };
}

export default function PaymentPageClient() {
  const searchParams = useSearchParams();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [accessStatus, setAccessStatus] = useState<AccessStatus>("checking");
  const [paymentState, setPaymentState] = useState<PaymentState>("checking");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [zaloUrl, setZaloUrl] = useState("");

  const payment = useSyncExternalStore(
    subscribeToPaymentStorage,
    getStoredPaymentSnapshot,
    () => null,
  );

  const registrationPhone = searchParams.get("phone") || "";
  const referralCode = searchParams.get("referralCode") || "";
  const orderCode = searchParams.get("orderCode") || "";
  const comboParam = searchParams.get("combo");

  const combo: ComboType | null =
    comboParam === "large" ? "large" : comboParam === "small" ? "small" : null;

  const offer = useMemo(
    () => OFFERS.find((item) => item.type === combo),
    [combo],
  );

  const hasAccessParams =
    Boolean(registrationPhone) && Boolean(combo) && Boolean(orderCode);

  useEffect(() => {
    if (!hasAccessParams || !combo) {
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const verifyPaymentAccess = async () => {
      try {
        const response = await fetch("/api/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            phone: registrationPhone,
            referralCode,
            combo,
            orderCode,
          }),
        });

        const result = await response.json();

        if (cancelled) {
          return;
        }

        if (result.zaloUrl) {
          setZaloUrl(result.zaloUrl);
        }

        if (result.alreadyPurchased) {
          setAccessStatus("alreadyPurchased");
          setPaymentState("paid");

          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }

          return;
        }

        if (!response.ok || !result.success || !result.verified) {
          setAccessStatus("denied");
          setPaymentState("pending");
          return;
        }

        setAccessStatus("granted");

        const isPaid = result.paymentStatus === "Đã thanh toán";

        setPaymentState(isPaid ? "paid" : "pending");

        if (isPaid && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch {
        if (!cancelled) {
          setAccessStatus("denied");
          setPaymentState("pending");
        }
      }
    };

    verifyPaymentAccess();

    intervalId = setInterval(() => {
      verifyPaymentAccess();
    }, 5000);

    return () => {
      cancelled = true;

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [hasAccessParams, registrationPhone, referralCode, combo, orderCode]);

  const effectiveAccessStatus: AccessStatus = !hasAccessParams
    ? "denied"
    : accessStatus;

  const handleShippingSubmit = async (data: ShippingData) => {
    if (submitting || !combo || paymentState !== "paid") {
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    const address = data.address.trim();

    try {
      const response = await fetch("/api/payment/update-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationPhone,
          shippingPhone: data.phone,
          fullName: data.fullName,
          Address: address,
          province: data.province,
          commune: data.commune,
          country: data.country,
          maNguoiBan: referralCode,
          combo,
          orderCode,
        }),
      });

      const result = await response.json();

      if (result.zaloUrl) {
        setZaloUrl(result.zaloUrl);
      }

      if (result.alreadyPurchased) {
        setOrderSuccess(false);
        setAccessStatus("alreadyPurchased");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result?.message || "Không thể cập nhật thông tin giao hàng.",
        );
      }

      setSubmitError("");
      setOrderSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật thông tin giao hàng. Mẹ vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (effectiveAccessStatus === "checking") {
    return <PaymentStatus status="checking" />;
  }

  if (effectiveAccessStatus === "alreadyPurchased") {
    return <PaymentStatus status="alreadyPurchased" zaloUrl={zaloUrl} />;
  }

  if (effectiveAccessStatus === "denied") {
    return <PaymentStatus status="denied" />;
  }

  if (!combo || !offer) {
    return null;
  }

  if (!payment) {
    return (
      <main className="min-h-screen bg-[#FFFAF5] px-4 py-6 sm:py-10">
        <div className="mx-auto w-full max-w-[650px]">
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8">
            <p className="text-base font-extrabold text-[#12335B]">
              Không thể tải thông tin thanh toán
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Không tìm thấy thông tin thanh toán. Mẹ vui lòng quay lại và tạo
              đơn hàng lại.
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/success";
              }}
              className="mt-5 rounded-full bg-[#12335B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0D2949]"
            >
              QUAY LẠI
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (orderSuccess) {
    return <PaymentStatus status="success" zaloUrl={zaloUrl} />;
  }

  return (
    <main className="min-h-screen bg-[#FFFAF5] px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-[850px]">
        <section className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12.5L9.5 17L19 7.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600"
              />
            </svg>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold text-[#12335B] sm:text-3xl">
            Đặt mua {offer.title.toLowerCase()}
          </h1>

          <p className="mx-auto mt-2 max-w-[650px] text-sm leading-6 text-gray-600">
            Mẹ vui lòng hoàn tất chuyển khoản và nhập đầy đủ thông tin nhận hàng
            để Zmoms xử lý đơn hàng.
          </p>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500">
                SẢN PHẨM ĐÃ CHỌN
              </p>

              <p className="mt-1 text-lg font-extrabold text-[#12335B]">
                {offer.title}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-400 line-through">
                {formatPrice(offer.originalPrice)}
              </p>

              <p className="text-xl font-extrabold text-[#EC008C]">
                {formatPrice(payment.amount)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-[#F8FAFC] p-4 text-xs">
            <p className="text-gray-500">
              Số điện thoại:{" "}
              <span className="font-bold text-gray-700">
                {registrationPhone || "—"}
              </span>
            </p>
          </div>
        </section>

        <div className="mt-5">
          <PaymentQR payment={payment} combo={combo} />
        </div>

        <div className="mt-5">
          <PaymentGuide />
        </div>

        {paymentState === "checking" && (
          <div className="mt-5 rounded-2xl bg-gray-50 px-5 py-4 text-center">
            <p className="text-sm font-bold text-gray-600">
              Đang kiểm tra trạng thái thanh toán...
            </p>
          </div>
        )}

        {paymentState === "pending" && (
          <div className="mt-5 rounded-2xl bg-amber-50 px-5 py-4 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 7V12L15 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-600"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="8.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-amber-600"
                />
              </svg>
            </div>

            <p className="mt-3 text-base font-extrabold text-amber-700">
              ĐANG CHỜ THANH TOÁN
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-600">
              Mẹ vui lòng hoàn tất chuyển khoản theo thông tin bên trên. Sau khi
              thanh toán được xác nhận, phần nhập thông tin nhận hàng sẽ được
              hiển thị.
            </p>
          </div>
        )}

        {paymentState === "paid" && (
          <>
            <div className="mt-5 rounded-2xl bg-green-50 px-5 py-4 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12.5L9.5 17L19 7.5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-600"
                  />
                </svg>
              </div>

              <p className="mt-3 text-base font-extrabold text-green-700">
                🎉 CẢM ƠN MẸ!
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                Thanh toán đã được xác nhận. Mẹ vui lòng nhập thông tin nhận
                hàng bên dưới để Zmoms xử lý đơn.
              </p>
            </div>

            <div className="mt-5">
              <ShippingForm
                initialPhone={registrationPhone}
                onSubmit={handleShippingSubmit}
                submitting={submitting}
              />
            </div>

            {submitError && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium leading-5 text-red-600">
                {submitError}
              </div>
            )}
          </>
        )}

        <p className="mx-auto mt-5 max-w-[650px] text-center text-[11px] leading-5 text-gray-400">
          Ưu đãi áp dụng theo thể lệ chương trình.
        </p>
      </div>
    </main>
  );
}

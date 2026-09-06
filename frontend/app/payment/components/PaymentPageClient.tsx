"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PaymentQR from "./PaymentQR";
import PaymentGuide from "./PaymentGuide";
import ShippingForm from "./ShippingForm";
import PaymentStatus from "./PaymentStatus";
import { OFFERS } from "../../deal/data/offerData";
import { getPaymentConfig } from "../data/paymentData";

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

type ShippingData = {
  fullName: string;
  phone: string;
  province: string;
  ward: string;
  address: string;
};

type ComboType = "small" | "large";

type AccessStatus = "checking" | "granted" | "alreadyPurchased" | "denied";

export default function PaymentPageClient() {
  const searchParams = useSearchParams();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [accessStatus, setAccessStatus] = useState<AccessStatus>("checking");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [zaloUrl, setZaloUrl] = useState("");

  const registrationPhone = searchParams.get("phone") || "";
  const referralCode = searchParams.get("referralCode") || "";
  const comboParam = searchParams.get("combo");

  const combo: ComboType | null =
    comboParam === "large" ? "large" : comboParam === "small" ? "small" : null;

  const offer = useMemo(
    () => OFFERS.find((item) => item.type === combo),
    [combo],
  );

  useEffect(() => {
    let cancelled = false;

    const verifyPaymentAccess = async () => {
      if (!registrationPhone || !referralCode || !combo) {
        if (!cancelled) {
          setAccessStatus("denied");
        }

        return;
      }

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
          return;
        }

        if (!response.ok || !result.success || !result.verified) {
          setAccessStatus("denied");
          return;
        }

        setAccessStatus("granted");
      } catch {
        if (!cancelled) {
          setAccessStatus("denied");
        }
      }
    };

    verifyPaymentAccess();

    return () => {
      cancelled = true;
    };
  }, [registrationPhone, referralCode, combo]);

  const handleShippingSubmit = async (data: ShippingData) => {
    if (submitting || !combo) {
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    const fullAddress = [data.address, data.ward, data.province]
      .filter(Boolean)
      .join(", ");

    try {
      const response = await fetch("/api/payment/update-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationPhone,
          shippingPhone: data.phone,
          fullAddress,
          maNguoiBan: referralCode,
          combo,
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

  if (accessStatus === "checking") {
    return <PaymentStatus status="checking" />;
  }

  if (accessStatus === "alreadyPurchased") {
    return <PaymentStatus status="alreadyPurchased" zaloUrl={zaloUrl} />;
  }

  if (accessStatus === "denied") {
    return <PaymentStatus status="denied" />;
  }

  if (!combo || !offer) {
    return null;
  }

  if (orderSuccess) {
    return <PaymentStatus status="success" zaloUrl={zaloUrl} />;
  }

  const payment = getPaymentConfig(combo);

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
            Mẹ vui lòng hoàn tất chuyển khoản và điền thông tin nhận hàng để
            Zmoms tiếp tục xử lý đơn.
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

          <div className="mt-4 grid gap-2 rounded-xl bg-[#F8FAFC] p-4 text-xs sm:grid-cols-2">
            <p className="text-gray-500">
              Số điện thoại:{" "}
              <span className="font-bold text-gray-700">
                {registrationPhone || "—"}
              </span>
            </p>

            <p className="text-gray-500">
              Mã người bán:{" "}
              <span className="font-bold text-gray-700">
                {referralCode || "—"}
              </span>
            </p>
          </div>
        </section>

        <div className="mt-5">
          <PaymentQR combo={combo} phone={registrationPhone} />
        </div>

        <div className="mt-5">
          <PaymentGuide />
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

        <p className="mx-auto mt-5 max-w-[650px] text-center text-[11px] leading-5 text-gray-400">
          Ưu đãi áp dụng theo thể lệ chương trình.
        </p>
      </div>
    </main>
  );
}

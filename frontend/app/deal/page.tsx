"use client";

import { useState } from "react";
import OfferCard from "./components/OfferCard";
import ComboBill from "./components/ComboBill";
import ReferralVerification from "./components/ReferralVerification";
import { OFFERS } from "./data/offerData";
import type { OfferType } from "./types/offer";

export default function SuccessPage() {
  const [selected, setSelected] = useState<OfferType>("small");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [verifiedReferralCode, setVerifiedReferralCode] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  const selectedOffer = OFFERS.find((offer) => offer.type === selected);

  const handleSelectOffer = (type: OfferType) => {
    if (creatingOrder) {
      return;
    }

    setSelected(type);
    setOrderError("");
  };

  const handleVerified = (phone: string, referralCode: string) => {
    setVerifiedPhone(phone);
    setVerifiedReferralCode(referralCode);
    setDiscountApplied(true);
    setOrderError("");
  };

  const handleAction = async () => {
    if (!selectedOffer) {
      return;
    }

    if (!discountApplied || !verifiedPhone || !verifiedReferralCode) {
      document.getElementById("referral-code")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return;
    }

    if (creatingOrder) {
      return;
    }

    setCreatingOrder(true);
    setOrderError("");

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: verifiedPhone,
          referralCode: verifiedReferralCode,
          combo: selected,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setOrderError(
          data?.message || "Không thể tạo đơn hàng. Vui lòng thử lại.",
        );
        return;
      }

      if (!data.orderCode) {
        setOrderError("Đã tạo đơn hàng nhưng không nhận được mã đơn hàng.");
        return;
      }

      if (!data.payment) {
        setOrderError(
          "Đã tạo đơn hàng nhưng chưa lấy được thông tin thanh toán. Vui lòng thử lại.",
        );
        return;
      }

      sessionStorage.setItem(
        "zmoms_payment_info",
        JSON.stringify(data.payment),
      );

      const params = new URLSearchParams({
        orderCode: data.orderCode,
        phone: verifiedPhone,
        referralCode: verifiedReferralCode,
        combo: selected,
      });

      window.location.href = `/payment?${params.toString()}`;
    } catch {
      setOrderError("Không thể kết nối hệ thống. Vui lòng thử lại.");
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFAF5] px-4 py-6 font-sans sm:py-10">
      <div className="mx-auto w-full max-w-[1100px]">
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

          <h1 className="mt-5 px-3 text-[27px] font-extrabold leading-[1.2] text-[#12335B] sm:text-[34px]">
            🎉 CHÚC MỪNG MẸ ĐÃ TRỞ
            <br />
            THÀNH HỘI VIÊN ZMOMS!
          </h1>

          <p className="mx-auto mt-5 max-w-[650px] px-4 text-[15px] font-medium leading-7 text-gray-600 sm:text-[17px]">
            Đặc quyền hội viên mới đã được mở — mẹ sẵn sàng
            <br />
            săn deal chưa?
          </p>

          <div className="mx-auto mt-6 w-full max-w-[720px] overflow-hidden rounded-2xl bg-[#4F83C1] px-6 py-5 shadow-[0_8px_24px_rgba(79,131,193,0.2)] sm:px-10 sm:py-6">
            <p className="text-center text-[20px] font-extrabold leading-[1.3] tracking-[-0.01em] text-white sm:text-[26px]">
              Combo: “Em Bé Thông Minh”
              <br />
              <span className="mt-1 inline-block">độc quyền</span>
              <br />
              <span className="mt-1 inline-block text-[#FFE6A7]">
                chỉ có tại Z-moms
              </span>
            </p>
          </div>
        </section>

        <section className="mx-auto mt-6 max-w-[850px] overflow-hidden rounded-2xl bg-white shadow-sm">
          <img
            src="/combo-em-be-thong-minh.png"
            alt="Combo Em Bé Thông Minh"
            className="h-auto w-full object-cover"
          />
        </section>

        <section className="mt-7">
          <div className="text-center">
            <h2 className="text-lg font-extrabold text-[#12335B] sm:text-xl">
              MẸ CHỌN COMBO
            </h2>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Chọn combo phù hợp và nhập mã giới thiệu để nhận ưu đãi 300.000đ.
            </p>
          </div>

          <div className="mx-auto mt-4 grid max-w-[850px] gap-3 md:grid-cols-2">
            {OFFERS.map((offer) => (
              <OfferCard
                key={offer.type}
                offer={offer}
                active={selected === offer.type}
                onClick={() => handleSelectOffer(offer.type)}
              />
            ))}
          </div>
        </section>

        <div className="mx-auto max-w-[850px]">
          <section className="mt-5">
            <ComboBill selected={selected} discountApplied={discountApplied} />
          </section>

          <ReferralVerification onVerified={handleVerified} />
        </div>

        {orderError && (
          <div className="mx-auto mt-5 max-w-[650px] rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
            {orderError}
          </div>
        )}

        <section className="mx-auto mt-5 max-w-[650px]">
          <button
            type="button"
            onClick={handleAction}
            disabled={!discountApplied || creatingOrder}
            className={`flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-sm transition active:scale-[0.99] ${
              discountApplied && !creatingOrder
                ? "bg-[#12335B] hover:bg-[#0D2949]"
                : "cursor-not-allowed bg-gray-300"
            }`}
          >
            {creatingOrder
              ? "ĐANG TẠO ĐƠN..."
              : discountApplied
                ? selectedOffer?.type === "small"
                  ? "MUA COMBO NHỎ"
                  : "MUA COMBO LỚN"
                : "KIỂM TRA ƯU ĐÃI ĐỂ TIẾP TỤC"}
          </button>
        </section>

        <p className="mx-auto mt-5 max-w-[650px] text-center text-[11px] leading-5 text-gray-400">
          Ưu đãi áp dụng theo thể lệ chương trình.
        </p>
      </div>
    </main>
  );
}

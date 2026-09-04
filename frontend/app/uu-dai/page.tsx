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

  const selectedOffer = OFFERS.find((offer) => offer.type === selected);

  const handleSelectOffer = (type: OfferType) => {
    setSelected(type);
  };

  const handleVerified = (phone: string, referralCode: string) => {
    setVerifiedPhone(phone);
    setVerifiedReferralCode(referralCode);
    setDiscountApplied(true);
  };

  const handleAction = () => {
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

    const params = new URLSearchParams({
      phone: verifiedPhone,
      referralCode: verifiedReferralCode,
      combo: selected,
    });

    window.location.href = `/payment?${params.toString()}`;
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

          <h1 className="mt-4 text-2xl font-extrabold text-[#12335B] sm:text-3xl">
            🎉 CHÚC MỪNG MẸ ĐÃ TRỞ THÀNH HỘI VIÊN ZMOMS!
          </h1>

          <p className="mx-auto mt-2 max-w-[680px] text-sm font-medium leading-6 text-gray-600 sm:text-base">
            Đặc quyền hội viên mới đã được mở — mẹ sẵn sàng săn deal chưa?
          </p>

          <div className="mx-auto mt-4 max-w-[560px] rounded-2xl border border-[#F5D28D] bg-[#FFF5E3] px-5 py-4">
            <p className="text-sm font-bold text-[#12335B]">
              🔥 DEAL HỘI VIÊN MỚI
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[#EC008C] sm:text-3xl">
              GIẢM 300.000đ
            </p>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              Chọn Combo “Em Bé Thông Minh” mẹ yêu thích và kích hoạt ưu đãi
              dành riêng cho hội viên.
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
              Chọn combo phù hợp và nhập thông tin để kích hoạt ưu đãi 300.000đ.
            </p>
          </div>

          <div className="mx-auto mt-4 grid max-w-[850px] gap-3 md:grid-cols-2">
            {OFFERS.map((offer) => (
              <OfferCard
                key={offer.type}
                offer={offer}
                active={selected === offer.type}
                discountApplied={discountApplied}
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

        <section className="mx-auto mt-5 max-w-[650px]">
          <button
            type="button"
            onClick={handleAction}
            disabled={!discountApplied}
            className={`flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-sm transition active:scale-[0.99] ${
              discountApplied
                ? "bg-[#12335B] hover:bg-[#0D2949]"
                : "cursor-not-allowed bg-gray-300"
            }`}
          >
            {discountApplied
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

"use client";

import { useState } from "react";
import OfferCard from "../deal/components/OfferCard";
import ComboBill from "../deal/components/ComboBill";
import { OFFERS, DISCOUNT_VALUE } from "../deal/data/offerData";
import type { OfferType } from "../deal/types/offer";

const SHARED_DISCOUNT_CODE = "HDBSAV";

export default function DealDemoPage() {
  const [selected, setSelected] = useState<OfferType>("small");
  const [code, setCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);

  const selectedOffer = OFFERS.find((offer) => offer.type === selected);

  const handleApply = () => {
    setError("");
    setApplied(false);
    setDiscountAmount(0);

    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setError("Mẹ vui lòng nhập mã giảm giá.");
      return;
    }

    if (normalizedCode !== SHARED_DISCOUNT_CODE) {
      setError("Mã giảm giá không hợp lệ. Vui lòng thử lại.");
      return;
    }

    setDiscountAmount(DISCOUNT_VALUE);
    setApplied(true);
  };

  const handleCodeChange = (value: string) => {
    setCode(value.toUpperCase());
    setDiscountAmount(0);
    setApplied(false);
    setError("");
  };

  const handleSelectOffer = (type: OfferType) => {
    setSelected(type);
  };

  const formatPrice = (value: number) => {
    return `${value.toLocaleString("vi-VN")}đ`;
  };

  const totalPayment = selectedOffer
    ? Math.max(selectedOffer.originalPrice - discountAmount, 0)
    : 0;

  return (
    <main className="min-h-screen bg-[#FFFAF5] px-4 py-8 font-sans sm:py-12">
      <div className="mx-auto w-full max-w-[900px]">
        <section className="text-center">
          <h1 className="text-2xl font-extrabold text-[#12335B] sm:text-3xl">
            ƯU ĐÃI ĐẶC QUYỀN ZMOMS
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Chọn combo và nhập mã giảm giá để xem ưu đãi dành cho mẹ.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-center text-lg font-extrabold text-[#12335B]">
            MẸ CHỌN COMBO
          </h2>

          <div className="mx-auto mt-5 grid max-w-[850px] gap-3 md:grid-cols-2">
            {OFFERS.map((offer) => (
              <OfferCard
                key={offer.type}
                offer={offer}
                active={selected === offer.type}
                discountAmount={discountAmount}
                onClick={() => handleSelectOffer(offer.type)}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto mt-6 max-w-[850px] rounded-2xl border border-[#D8E1EB] bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-base font-extrabold text-[#12335B]">
              MÃ GIẢM GIÁ
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Nhập mã ưu đãi để nhận giảm giá 300.000đ.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              autoComplete="off"
              maxLength={50}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleApply();
                }
              }}
              placeholder="Nhập mã giảm giá"
              className="h-12 min-w-0 flex-1 rounded-xl border border-[#D8E1EB] px-4 text-center text-lg font-bold tracking-[0.15em] text-[#12335B] outline-none transition placeholder:tracking-normal placeholder:font-normal focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10"
            />

            <button
              type="button"
              onClick={handleApply}
              className="h-12 rounded-xl bg-[#12335B] px-8 text-sm font-bold text-white transition hover:bg-[#0D2949] active:scale-[0.98]"
            >
              ÁP DỤNG
            </button>
          </div>

          {error && (
            <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {applied && (
            <div className="mt-3 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-bold text-green-700">
              ✓ Áp dụng mã thành công! Mẹ được giảm{" "}
              {formatPrice(discountAmount)}.
            </div>
          )}
        </section>

        <section className="mx-auto mt-6 max-w-[850px]">
          <ComboBill selected={selected} discountApplied={discountAmount > 0} />
        </section>

        <section className="mx-auto mt-5 max-w-[850px] overflow-hidden rounded-2xl bg-[#12335B] px-5 py-5 text-center">
          <p className="text-xs font-medium text-white/70">TỔNG MẸ PHẢI TRẢ</p>

          <p className="mt-2 text-3xl font-extrabold text-[#FFD36A]">
            {formatPrice(totalPayment)}
          </p>

          {discountAmount > 0 && selectedOffer && (
            <div className="mt-2 flex items-center justify-center gap-2 text-sm">
              <span className="text-white/50 line-through">
                {formatPrice(selectedOffer.originalPrice)}
              </span>

              <span className="font-bold text-green-300">
                Tiết kiệm {formatPrice(discountAmount)}
              </span>
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-[11px] text-gray-400">
          Ưu đãi áp dụng theo thể lệ chương trình ZMOMS.
        </p>
      </div>
    </main>
  );
}

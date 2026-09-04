"use client";

import type { ComboOffer } from "../types/offer";
import { COMBO_TOTAL_VALUES } from "../data/offerData";

type Props = {
  offer: ComboOffer;
  active: boolean;
  discountApplied: boolean;
  onClick: () => void;
};

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export default function OfferCard({
  offer,
  active,
  discountApplied,
  onClick,
}: Props) {
  const totalValue = COMBO_TOTAL_VALUES[offer.type as "small" | "large"];

  const payment = discountApplied ? offer.discountedPrice : offer.originalPrice;

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full overflow-hidden rounded-2xl border-2 bg-white text-left transition-all duration-200"
      style={{
        borderColor: active ? offer.color : "#E2E8F0",
        boxShadow: active
          ? `0 4px 16px ${offer.color}25`
          : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: offer.color }} />

      <div className="p-4 sm:p-5">
        {active && (
          <div
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: offer.color }}
          >
            ✓
          </div>
        )}

        <p
          className="pr-8 text-sm font-extrabold"
          style={{ color: offer.color }}
        >
          {offer.title}
        </p>

        <div className="mt-4 rounded-xl bg-[#F8FAFC] p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Tổng giá trị mẹ nhận được
          </p>

          <p className="mt-1 text-xl font-extrabold text-[#12335B] sm:text-2xl">
            {formatPrice(totalValue)}
          </p>
        </div>

        <div className="mt-3 rounded-xl bg-[#FFF5E3] p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Số tiền mẹ phải chi trả
          </p>

          <p
            className="mt-1 text-2xl font-extrabold sm:text-[28px]"
            style={{ color: offer.color }}
          >
            {formatPrice(payment)}
          </p>
        </div>

        {discountApplied ? (
          <div
            className="mt-3 inline-flex rounded-full px-3 py-1 text-[11px] font-bold"
            style={{
              backgroundColor: offer.bgColor,
              color: offer.color,
            }}
          >
            ĐÃ GIẢM 300.000đ
          </div>
        ) : (
          <p className="mt-3 text-xs leading-5 text-gray-500">
            Nhập mã giới thiệu để được giảm 300.000đ
          </p>
        )}
      </div>
    </button>
  );
}

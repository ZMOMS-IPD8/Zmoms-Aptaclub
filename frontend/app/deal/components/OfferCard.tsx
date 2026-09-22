"use client";

import type { ComboOffer } from "../types/offer";
import { ORDER_TOTAL_VALUES } from "../data/offerData";

type Props = {
  offer: ComboOffer;
  active: boolean;
  discountAmount: number;
  onClick: () => void;
};

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export default function OfferCard({
  offer,
  active,
  discountAmount,
  onClick,
}: Props) {
  const orderTotalValue = ORDER_TOTAL_VALUES[offer.type];

  const discountApplied = discountAmount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full overflow-hidden rounded-2xl border-2 bg-white text-left transition-all duration-200 active:scale-[0.99]"
      style={{
        borderColor: active ? offer.color : "#E2E8F0",
        boxShadow: active
          ? `0 8px 24px ${offer.color}20`
          : "0 3px 12px rgba(18,51,91,0.05)",
      }}
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: offer.color }} />

      <div className="p-4 sm:p-5">
        {active && (
          <div
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-sm font-extrabold text-white shadow-sm"
            style={{ backgroundColor: offer.color }}
          >
            ✓
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div>
            <p
              className="text-base font-extrabold sm:text-lg"
              style={{ color: offer.color }}
            >
              {offer.title}
            </p>

            <p className="mt-0.5 text-[11px] font-medium text-gray-400">
              Ưu đãi dành riêng cho hội viên ZMOMS
            </p>
          </div>

          {!active && (
            <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[10px] font-bold text-[#64748B]">
              CHỌN COMBO
            </span>
          )}
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Tổng giá trị đơn hàng
            </p>

            <p className="mt-1 text-lg font-extrabold text-[#12335B] sm:text-xl">
              {formatPrice(orderTotalValue)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Giá bán combo
            </p>

            <p
              className="mt-1 text-[25px] font-extrabold leading-none sm:text-[30px]"
              style={{ color: offer.color }}
            >
              {formatPrice(offer.originalPrice)}
            </p>
          </div>
        </div>

        <div className="my-4 h-px bg-[#E8EDF3]" />

        {discountApplied && (
          <div
            className="relative overflow-hidden rounded-xl px-4 py-3.5"
            style={{
              backgroundColor: offer.bgColor,
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Sau voucher 300.000đ
                </p>

                <p className="mt-0.5 text-sm font-extrabold text-[#12335B] sm:text-base">
                  Mẹ chỉ trả
                </p>
              </div>

              <p
                className="shrink-0 text-[27px] font-extrabold leading-none sm:text-[32px]"
                style={{ color: offer.color }}
              >
                {formatPrice(offer.discountedPrice)}
              </p>
            </div>
          </div>
        )}

        <div
          className={`flex items-center justify-between gap-3 ${
            discountApplied ? "mt-3" : "mt-4"
          }`}
        >
          {discountApplied ? (
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold"
              style={{
                backgroundColor: offer.bgColor,
                color: offer.color,
              }}
            >
              TIẾT KIỆM 300.000đ
            </span>
          ) : (
            <span />
          )}

          <span className="text-[10px] font-medium text-gray-400">
            Nhập mã giới thiệu để nhận ưu đãi
          </span>
        </div>
      </div>
    </button>
  );
}

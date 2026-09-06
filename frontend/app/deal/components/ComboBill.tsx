import type { OfferType } from "../types/offer";
import {
  DISCOUNT_VALUE,
  FIXED_GIFTS,
  LARGE_COMBO_GIFT,
  OFFERS,
} from "../data/offerData";

type Props = {
  selected: OfferType;
  discountApplied: boolean;
};

function formatPrice(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export default function ComboBill({ selected, discountApplied }: Props) {
  const offer = OFFERS.find((item) => item.type === selected);

  if (!offer) return null;

  const order2Value = offer.originalMilkValue;
  const order1Value = offer.originalPrice - order2Value;

  const order1Payment = discountApplied
    ? Math.max(order1Value - DISCOUNT_VALUE, 0)
    : order1Value;

  const totalPayment = order1Payment + order2Value;

  const gifts =
    selected === "large" ? [...FIXED_GIFTS, LARGE_COMBO_GIFT] : FIXED_GIFTS;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#D8E1EB] bg-white shadow-sm">
      <div className="bg-[#12335B] px-4 py-3 sm:px-5">
        <p className="text-sm font-extrabold text-white">
          CHỨNG TỪ COMBO CO-SELL – 2 HÓA ĐƠN
        </p>

        <p className="mt-0.5 text-[11px] text-white/70">{offer.title}</p>
      </div>

      <div className="border-b border-[#D8E1EB]">
        <div className="bg-[#EAF0F7] px-4 py-3 sm:px-5">
          <p className="text-xs font-extrabold text-[#12335B]">HÓA ĐƠN ① ·</p>

          <p className="mt-0.5 text-[11px] font-bold leading-5 text-[#12335B]">
            COMBO IPD8 CHO CON PHÁT TRIỂN TOÀN DIỆN VỀ TRÍ NÃO
          </p>
        </div>

        {gifts.map((gift) => (
          <BillRow
            key={gift.name}
            name={gift.name}
            value={formatPrice(gift.value)}
          />
        ))}

        <BillRow name="Tạm tính nhóm" value={formatPrice(order1Value)} strong />

        <div className="flex items-center justify-between gap-4 bg-[#FCE3F1] px-4 py-3 sm:px-5">
          <p className="text-sm font-bold text-[#EC008C]">
            (-) Cash voucher redemption
          </p>

          <p className="shrink-0 text-sm font-extrabold text-[#EC008C]">
            {discountApplied ? `− ${formatPrice(DISCOUNT_VALUE)}` : "− 0đ"}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 bg-[#F1F5F9] px-4 py-3 sm:px-5">
          <p className="text-sm font-bold text-[#12335B]">
            Còn lại nhóm sau voucher
          </p>

          <p className="shrink-0 text-sm font-extrabold text-[#12335B]">
            {formatPrice(order1Payment)}
          </p>
        </div>
      </div>

      <div className="border-b border-[#D8E1EB]">
        <div className="bg-[#FFF7E4] px-4 py-3 sm:px-5">
          <p className="text-xs font-extrabold text-[#A36B00]">HÓA ĐƠN ② ·</p>

          <p className="mt-0.5 text-[11px] font-bold leading-5 text-[#A36B00]">
            CHO CON PHÁT TRIỂN TOÀN DIỆN VỀ THỂ CHẤT
          </p>
        </div>

        <BillRow name="Lon sữa Aptamil" value={formatPrice(order2Value)} />
      </div>

      <div className="flex items-center justify-between gap-4 bg-[#12335B] px-4 py-4 sm:px-5">
        <p className="text-sm font-extrabold text-white">
          TỔNG MẸ CHI TRẢ (2 HĐ)
        </p>

        <p className="text-lg font-extrabold text-[#FFD36A] sm:text-xl">
          {formatPrice(totalPayment)}
        </p>
      </div>

      <div className="bg-white px-4 py-3 sm:px-5">
        <p className="text-[10px] leading-4 text-gray-400">
          * Voucher 300.000đ chỉ được áp dụng vào Hóa đơn ① ZMOMS. Hóa đơn ② BBS
          + Mẹ không áp dụng voucher.
        </p>
      </div>
    </div>
  );
}

function BillRow({
  name,
  value,
  strong = false,
}: {
  name: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#EDF1F5] px-4 py-3 sm:px-5">
      <p
        className={`min-w-0 text-sm leading-5 ${
          strong ? "font-bold text-[#12335B]" : "text-[#12335B]"
        }`}
      >
        {name}
      </p>

      <p
        className={`shrink-0 text-sm ${
          strong ? "font-extrabold text-[#12335B]" : "font-bold text-[#12335B]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

import type { OfferType } from "../types/offer";
import {
  DISCOUNT_VALUE,
  FIXED_GIFTS,
  LARGE_COMBO_DIAPER_GIFT,
  LARGE_COMBO_GIFT,
  OFFERS,
  SMALL_COMBO_GIFT,
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

  const gifts =
    selected === "large"
      ? [...FIXED_GIFTS, LARGE_COMBO_GIFT, LARGE_COMBO_DIAPER_GIFT]
      : [
          ...FIXED_GIFTS.filter(
            (gift) => gift.name !== "Kem đánh răng Denti Whoo Hàn Quốc",
          ).map((gift) =>
            gift.name === "Sách 100 kỹ năng đầu đời trong 1.000 ngày"
              ? {
                  ...gift,
                  value: gift.value + 50000,
                }
              : gift,
          ),
          SMALL_COMBO_GIFT,
        ];

  const giftValue = gifts.reduce((total, gift) => total + gift.value, 0);

  const milkValue = offer.originalMilkValue;

  const totalProductValue = giftValue + milkValue;

  const invoiceOnePrice = offer.originalPrice - milkValue;

  const invoiceOnePayment = discountApplied
    ? Math.max(invoiceOnePrice - DISCOUNT_VALUE, 0)
    : invoiceOnePrice;

  const invoiceTwoPayment = milkValue;

  const totalPayment = invoiceOnePayment + invoiceTwoPayment;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#D8E1EB] bg-white shadow-sm">
      <div className="bg-[#12335B] px-4 py-3 sm:px-5">
        <p className="text-sm font-extrabold text-white">
          CHỨNG TỪ COMBO – 2 HÓA ĐƠN
        </p>

        <p className="mt-0.5 text-[11px] text-white/70">{offer.title}</p>
      </div>

      <div className="border-b border-[#D8E1EB]">
        <div className="bg-[#EAF0F7] px-4 py-3 sm:px-5">
          <p className="text-xs font-extrabold text-[#12335B]">HÓA ĐƠN ①</p>

          <p className="mt-0.5 text-[11px] font-bold leading-5 text-[#12335B]">
            COMBO IPD8 – QUÀ TẶNG VÀ SẢN PHẨM CHO CON
          </p>
        </div>

        <div>
          {gifts.map((gift, index) => (
            <BillRow
              key={`${gift.name}-${index}`}
              name={gift.name}
              value={formatPrice(gift.value)}
              striped={index % 2 === 1}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 bg-[#FFF7E4] px-4 py-3 sm:px-5">
          <p className="text-xs font-extrabold text-[#12335B] sm:text-sm">
            GIÁ BÁN HÓA ĐƠN ①
          </p>

          <p className="shrink-0 text-base font-extrabold text-[#12335B] sm:text-lg">
            {formatPrice(invoiceOnePrice)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 bg-[#FCE3F1] px-4 py-3 sm:px-5">
          <p className="text-sm font-bold text-[#EC008C]">
            (-) Voucher combo IPD8
          </p>

          <p className="shrink-0 text-sm font-extrabold text-[#EC008C]">
            {discountApplied ? `− ${formatPrice(DISCOUNT_VALUE)}` : "− 0đ"}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 bg-[#F1F5F9] px-4 py-3 sm:px-5">
          <p className="text-xs font-extrabold text-[#12335B] sm:text-sm">
            MẸ TRẢ HÓA ĐƠN ①
          </p>

          <p className="shrink-0 text-base font-extrabold text-[#12335B] sm:text-lg">
            {formatPrice(invoiceOnePayment)}
          </p>
        </div>
      </div>

      <div className="border-b border-[#D8E1EB]">
        <div className="bg-[#FFF7E4] px-4 py-3 sm:px-5">
          <p className="text-xs font-extrabold text-[#A36B00]">HÓA ĐƠN ②</p>

          <p className="mt-0.5 text-[11px] font-bold leading-5 text-[#A36B00]">
            SẢN PHẨM SỮA APTAMIL
          </p>
        </div>

        <BillRow
          name={selected === "large" ? "Lon Aptamil 800g" : "Lon Aptamil 380g"}
          value={formatPrice(milkValue)}
        />

        <div className="flex items-center justify-between gap-4 bg-[#F1F5F9] px-4 py-3 sm:px-5">
          <p className="text-xs font-extrabold text-[#12335B] sm:text-sm">
            MẸ TRẢ HÓA ĐƠN ②
          </p>

          <p className="shrink-0 text-base font-extrabold text-[#12335B] sm:text-lg">
            {formatPrice(invoiceTwoPayment)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 bg-[#FFF7E4] px-4 py-3.5 sm:px-5">
        <div>
          <p className="text-xs font-extrabold text-[#12335B] sm:text-sm">
            TỔNG GIÁ TRỊ SẢN PHẨM
          </p>

          <p className="mt-0.5 text-[10px] text-gray-500">
            Bao gồm toàn bộ quà tặng và lon sữa Aptamil
          </p>
        </div>

        <p className="shrink-0 text-lg font-extrabold text-[#12335B] sm:text-xl">
          {formatPrice(totalProductValue)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 bg-[#12335B] px-4 py-4 sm:px-5">
        <div>
          <p className="text-sm font-extrabold text-white">TỔNG MẸ PHẢI TRẢ</p>

          <p className="mt-0.5 text-[10px] text-white/60">
            Hóa đơn ① + Hóa đơn ②
          </p>
        </div>

        <p className="shrink-0 text-xl font-extrabold text-[#FFD36A] sm:text-2xl">
          {formatPrice(totalPayment)}
        </p>
      </div>

      <div className="bg-white px-4 py-3 sm:px-5">
        <p className="text-[10px] leading-4 text-gray-400">
          * Voucher 300.000đ chỉ được áp dụng vào Hóa đơn ① ZMOMS. Hóa đơn ② là
          hóa đơn lon sữa Aptamil và không áp dụng voucher.
        </p>
      </div>
    </div>
  );
}

function BillRow({
  name,
  value,
  striped = false,
}: {
  name: string;
  value: string;
  striped?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-2.5 sm:px-5 ${
        striped ? "bg-[#F1F3F7]" : "bg-white"
      }`}
    >
      <p className="min-w-0 text-xs leading-5 text-[#12335B] sm:text-sm">
        {name}
      </p>

      <p className="shrink-0 text-xs font-bold text-[#12335B] sm:text-sm">
        {value}
      </p>
    </div>
  );
}

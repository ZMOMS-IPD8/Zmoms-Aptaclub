import type { ComboOffer } from "../types/offer";

export const OFFERS: ComboOffer[] = [
  {
    type: "small",
    title: "COMBO NHỎ",
    originalPrice: 649000,
    discountedPrice: 349000,
    originalMilkValue: 346000,
    description: "Nhập mã giới thiệu để được giảm 300.000đ",
    color: "#18A8DC",
    bgColor: "#EAF8FD",
    link: "#",
  },
  {
    type: "large",
    title: "COMBO LỚN",
    originalPrice: 1129000,
    discountedPrice: 829000,
    originalMilkValue: 764000,
    description: "Nhập mã giới thiệu để được giảm 300.000đ",
    color: "#EC008C",
    bgColor: "#FFF0F8",
    link: "#",
  },
];

export const FIXED_GIFTS = [
  {
    name: "Lactacyd sữa tắm",
    value: 105000,
  },
  {
    name: "Lifebuoy nước rửa tay",
    value: 35000,
  },
  {
    name: "Lifebuoy sữa tắm",
    value: 85000,
  },
  {
    name: "GreenCross rửa tay khô",
    value: 30000,
  },
  {
    name: "Kem đánh răng Denti Whoo Hàn Quốc",
    value: 50000,
  },
  {
    name: "Sách 100 kỹ năng đầu đời trong 1.000 ngày",
    value: 199000,
  },
];

export const SMALL_COMBO_GIFT = {
  name: "Quà tặng đầy tháng",
  value: 300000,
};

export const LARGE_COMBO_GIFT = {
  name: "Quà tặng đầy tháng",
  value: 500000,
};

export const LARGE_COMBO_DIAPER_GIFT = {
  name: "Hộp tã Molfix (10 miếng)",
  value: 50000,
};

export const ORDER_TOTAL_VALUES = {
  small: 1150000,
  large: 1818000,
} as const;

export const DISCOUNT_VALUE = 300000;

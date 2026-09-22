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

export const SMALL_COMBO_ITEMS = [
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
    name: "E-Book 100 kỹ năng + 8 loại hình thông minh",
    value: 249000,
  },
  {
    name: "Buổi tư vấn bởi chuyên viên",
    value: 300000,
  },
];

export const LARGE_COMBO_ITEMS = [
  {
    name: "Lactacyd sữa tắm",
    value: 205000,
  },
  {
    name: "Lifebuoy nước rửa tay",
    value: 135000,
  },
  {
    name: "Lifebuoy sữa tắm",
    value: 185000,
  },
  {
    name: "GreenCross rửa tay khô",
    value: 130000,
  },
  {
    name: "Kem đánh răng Denti Whoo Hàn Quốc",
    value: 100000,
  },
  {
    name: "E-Book 100 kỹ năng + 8 loại hình thông minh",
    value: 249000,
  },
  {
    name: "Hộp tã Molfix (10 miếng)",
    value: 50000,
  },
];

export const ORDER_TOTAL_VALUES = {
  small: 1150000,
  large: 1818000,
} as const;

export const DISCOUNT_VALUE = 300000;

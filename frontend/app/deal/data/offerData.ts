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
    name: "1 chai Lactacyd Baby 250ml",
    value: 100000,
  },
  {
    name: "1 chai Green Cross 60ml",
    value: 29000,
  },
  {
    name: "1 chai Lifebuoy 180ml",
    value: 35000,
  },
  {
    name: "Sách Làm mẹ",
    value: 65000,
  },
  {
    name: "1 hộp tã Molfix gồm 4 miếng tã và 1 miếng lót",
    value: 50000,
  },
  {
    name: "1 hộp kem đánh răng Denti-Clean của Thomastone",
    value: 50000,
  },
];

export const LARGE_COMBO_GIFT = {
  name: "1 gấu bông trái cây",
  value: 50000,
};

export const COMBO_TOTAL_VALUES = {
  small: 675000,
  large: 1143000,
} as const;

export const DISCOUNT_VALUE = 300000;

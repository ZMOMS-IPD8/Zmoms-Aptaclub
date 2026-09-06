export type OfferType = "small" | "large";

export type ComboOffer = {
  type: OfferType;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  originalMilkValue: number;
  description: string;
  color: string;
  bgColor: string;
  link: string;
};

export type ReferralCode = {
  code: string;
  active: boolean;
};

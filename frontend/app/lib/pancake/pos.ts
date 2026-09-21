export const PANCAKE_POS_CONFIG = {
  shopId: process.env.PANCAKE_SHOP_ID!,

  small: {
    productId: process.env.PANCAKE_SMALL_PRODUCT_ID!,
    variationId: process.env.PANCAKE_SMALL_VARIATION_ID!,
    displayId: "ZMOMS349",
    name: "Combo nhỏ",
    price: 649000,
    paymentCode: "COMBONHO",
  },

  large: {
    productId: process.env.PANCAKE_LARGE_PRODUCT_ID!,
    variationId: process.env.PANCAKE_LARGE_VARIATION_ID!,
    displayId: "ZMOMS829",
    name: "Combo lớn",
    price: 1129000,
    paymentCode: "COMBOLON",
  },
} as const;

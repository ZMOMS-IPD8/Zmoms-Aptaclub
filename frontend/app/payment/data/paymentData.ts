export const PAYMENT_CONFIG = {
  bank: {
    bankName: "TECHCOMBANK",
    bankCode: "TCB",
    accountNumber: "151103240704",
    accountName: "ZMOMS VIETNAM",
  },
  small: {
    amount: 349000,
    transferContent: "ZMOMS COMBO NHO",
  },
  large: {
    amount: 829000,
    transferContent: "ZMOMS COMBO LON",
  },
};

export function getPaymentConfig(combo: "small" | "large") {
  return {
    ...PAYMENT_CONFIG.bank,
    ...PAYMENT_CONFIG[combo],
  };
}

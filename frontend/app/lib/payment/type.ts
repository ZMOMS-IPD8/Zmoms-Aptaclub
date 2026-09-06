export type ComboType = "small" | "large";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "UNDERPAID"
  | "REFUNDED";

export type CreatePaymentInput = {
  orderCode: string;
  amount: number;
  description: string;
};

export type CreatePaymentResult = {
  orderCode: string;
  amount: number;
  qrUrl: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
};

export type PaymentTransaction = {
  transactionId: string;
  orderCode: string;
  amount: number;
  status: PaymentStatus;
  description?: string;
  paidAt?: string;
};

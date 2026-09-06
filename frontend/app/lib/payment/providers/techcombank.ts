import type { CreatePaymentInput, CreatePaymentResult } from "../type";

const BANK_CONFIG = {
  bankName: "TECHCOMBANK",
  bankCode: "TCB",
  accountNumber: "151103240704",
  accountName: "ZMOMS VIETNAM",
};

export async function createTechcombankPayment(
  input: CreatePaymentInput,
): Promise<CreatePaymentResult> {
  const description = input.orderCode;

  const qrUrl =
    `https://vietqr.app/img` +
    `?acc=${encodeURIComponent(BANK_CONFIG.accountNumber)}` +
    `&bank=${encodeURIComponent(BANK_CONFIG.bankCode)}` +
    `&amount=${input.amount}` +
    `&des=${encodeURIComponent(description)}`;

  return {
    orderCode: input.orderCode,
    amount: input.amount,
    qrUrl,
    ...BANK_CONFIG,
  };
}

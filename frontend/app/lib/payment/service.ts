import { createTechcombankPayment } from "./providers/techcombank";
import type { CreatePaymentInput, CreatePaymentResult } from "./type";

export async function createPayment(
  input: CreatePaymentInput,
): Promise<CreatePaymentResult> {
  return createTechcombankPayment(input);
}

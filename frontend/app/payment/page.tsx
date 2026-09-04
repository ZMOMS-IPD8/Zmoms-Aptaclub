import { Suspense } from "react";
import PaymentPageClient from "./components/PaymentPageClient";

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#FFFAF5]">
          <p className="text-sm text-gray-500">
            Đang tải thông tin thanh toán...
          </p>
        </main>
      }
    >
      <PaymentPageClient />
    </Suspense>
  );
}

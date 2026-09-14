"use client";

import { useState } from "react";
import type { PancakePaymentInfo } from "../../lib/pancake/payment";

export type PaymentInfo = PancakePaymentInfo;

type Props = {
  payment: PaymentInfo;
  combo: "small" | "large";
};

export default function PaymentQR({ payment, combo }: Props) {
  const [downloadLoading, setDownloadLoading] = useState(false);

  const qrUrl =
    `https://vietqr.app/img?acc=${encodeURIComponent(payment.accountNumber)}` +
    `&bank=${encodeURIComponent(payment.bankCode)}` +
    `&amount=${payment.amount}` +
    `&des=${encodeURIComponent(payment.transferContent)}`;

  const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

  const handleDownload = async () => {
    try {
      setDownloadLoading(true);

      const response = await fetch(qrUrl);

      if (!response.ok) {
        throw new Error("Không thể tải QR");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `QR-${combo}.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch {
      window.open(qrUrl, "_blank");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {}
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <div className="text-center">
        <p className="text-sm font-bold text-[#12335B]">
          QUÉT MÃ QR ĐỂ CHUYỂN KHOẢN
        </p>

        <div className="mx-auto mt-4 flex w-fit rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
          <img
            src={qrUrl}
            alt="QR chuyển khoản"
            className="h-[240px] w-[240px] object-contain"
          />
        </div>

        <p className="mt-4 text-xs leading-5 text-gray-500">
          Mẹ có thể lưu mã QR về điện thoại để thuận tiện chuyển khoản.
        </p>
      </div>

      <div className="mt-5 space-y-3 rounded-xl bg-[#F8FAFC] p-4">
        <div className="flex items-start justify-between gap-4">
          <span className="text-sm text-gray-500">Ngân hàng</span>

          <span className="text-right text-sm font-bold text-[#12335B]">
            {payment.bankName}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <span className="text-sm text-gray-500">Số tài khoản</span>

          <button
            type="button"
            onClick={() => handleCopy(payment.accountNumber)}
            className="text-right text-sm font-bold text-[#12335B]"
            title="Bấm để sao chép"
          >
            {payment.accountNumber}
          </button>
        </div>

        <div className="flex items-start justify-between gap-4">
          <span className="text-sm text-gray-500">Chủ tài khoản</span>

          <span className="text-right text-sm font-bold uppercase text-[#12335B]">
            {payment.accountName}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <span className="text-sm text-gray-500">Số tiền</span>

          <button
            type="button"
            onClick={() => handleCopy(String(payment.amount))}
            className="text-right text-base font-extrabold text-[#EC008C]"
            title="Bấm để sao chép"
          >
            {formatPrice(payment.amount)}
          </button>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <p className="text-sm text-gray-500">Nội dung chuyển khoản</p>

          <button
            type="button"
            onClick={() => handleCopy(payment.transferContent)}
            className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-left text-sm font-extrabold text-[#12335B]"
            title="Bấm để sao chép"
          >
            {payment.transferContent}
          </button>

          <p className="mt-1.5 text-[11px] text-gray-400">
            Bấm vào nội dung để sao chép
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={downloadLoading}
        className="mt-4 flex w-full items-center justify-center rounded-full border border-[#12335B] px-5 py-3 text-sm font-bold text-[#12335B] transition hover:bg-[#12335B] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {downloadLoading ? "ĐANG TẢI..." : "TẢI MÃ QR"}
      </button>
    </section>
  );
}

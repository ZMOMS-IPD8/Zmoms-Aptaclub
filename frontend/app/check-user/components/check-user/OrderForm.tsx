"use client";

type OrderFormProps = {
  receiverName: string;
  shippingPhone: string;
  shippingAddress: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  onReceiverNameChange: (value: string) => void;
  onShippingPhoneChange: (value: string) => void;
  onShippingAddressChange: (value: string) => void;
  onSubmit: () => void;
};

export default function OrderForm({
  receiverName,
  shippingPhone,
  shippingAddress,
  disabled = false,
  loading = false,
  error = "",
  onReceiverNameChange,
  onShippingPhoneChange,
  onShippingAddressChange,
  onSubmit,
}: OrderFormProps) {
  return (
    <div className="mt-5 rounded-2xl border border-[#D8E1EB] bg-white p-4 sm:p-5">
      <div className="mb-5">
        <h3 className="text-base font-extrabold text-[#12335B]">
          THÔNG TIN ĐẶT HÀNG
        </h3>

        <p className="mt-1 text-sm leading-5 text-gray-500">
          Vui lòng nhập thông tin nhận hàng.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="receiver-name"
            className="mb-2 block text-sm font-semibold text-[#12335B]"
          >
            Tên người nhận
          </label>

          <input
            id="receiver-name"
            type="text"
            value={receiverName}
            disabled={disabled}
            onChange={(event) => onReceiverNameChange(event.target.value)}
            placeholder="Nhập tên người nhận"
            className="h-12 w-full rounded-xl border border-[#D8E1EB] px-4 text-sm font-medium text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="shipping-phone"
            className="mb-2 block text-sm font-semibold text-[#12335B]"
          >
            Số điện thoại nhận hàng
          </label>

          <input
            id="shipping-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={shippingPhone}
            disabled={disabled}
            onChange={(event) =>
              onShippingPhoneChange(
                event.target.value.replace(/\D/g, "").slice(0, 10),
              )
            }
            placeholder="Nhập số điện thoại nhận hàng"
            className="h-12 w-full rounded-xl border border-[#D8E1EB] px-4 text-sm font-medium text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="shipping-address"
            className="mb-2 block text-sm font-semibold text-[#12335B]"
          >
            Địa chỉ nhận hàng
          </label>

          <textarea
            id="shipping-address"
            value={shippingAddress}
            disabled={disabled}
            onChange={(event) => onShippingAddressChange(event.target.value)}
            placeholder="Nhập địa chỉ nhận hàng"
            rows={3}
            className="w-full resize-none rounded-xl border border-[#D8E1EB] px-4 py-3 text-sm font-medium text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10 disabled:bg-gray-100"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3">
          <p className="text-sm font-medium leading-5 text-red-600">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || loading}
        className="mt-5 h-12 w-full rounded-xl bg-[#18A8DC] text-sm font-bold text-white transition hover:bg-[#1099CB] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "ĐANG CẬP NHẬT..." : "XÁC NHẬN ĐẶT HÀNG"}
      </button>
    </div>
  );
}

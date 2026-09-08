"use client";

type Props = {
  phone: string;
  loading: boolean;
  error: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onRegister: () => void;
};

export default function ConsultationPhoneCheck({
  phone,
  loading,
  error,
  onChange,
  onSubmit,
  onRegister,
}: Props) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-base font-bold text-[#12335B]">
        Kiểm tra thông tin hội viên
      </h2>

      <p className="mt-1 text-sm leading-6 text-gray-500">
        Mẹ nhập số điện thoại đã đăng ký để nhận quyền lợi hội viên
      </p>

      <label
        htmlFor="phone"
        className="mt-5 mb-2 block text-sm font-semibold text-[#12335B]"
      >
        Số điện thoại
      </label>

      <input
        id="phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        value={phone}
        maxLength={10}
        placeholder="Nhập số điện thoại"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit();
          }
        }}
        className="h-12 w-full rounded-xl border border-[#D8E1EB] px-4 text-sm font-medium text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10"
      />

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="mt-4 h-12 w-full rounded-xl bg-[#12335B] text-sm font-bold text-white transition hover:bg-[#0D2949] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "ĐANG KIỂM TRA..." : "Nhấn vào nếu mẹ đã là hội viên"}
      </button>

      <button
        type="button"
        onClick={onRegister}
        className="mt-3 h-12 w-full rounded-xl border border-[#12335B] bg-white text-sm font-bold text-[#12335B] transition hover:bg-[#F5F9FC]"
      >
        Nhấn vào nếu mẹ chưa là hội viên
      </button>
    </section>
  );
}

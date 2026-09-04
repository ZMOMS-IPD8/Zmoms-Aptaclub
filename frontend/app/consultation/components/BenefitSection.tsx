type Props = {
  onAccept: () => void;
  onDecline: () => void;
  loading: boolean;
  error: string;
  message: string;
  booking: {
    linkLopHoc: string;
    thoiGianThamDu: string;
  } | null;
  zaloUrl: string;
};

export default function BenefitSection({
  onAccept,
  onDecline,
  loading,
  error,
  message,
  booking,
  zaloUrl,
}: Props) {
  if (booking) {
    return (
      <section className="rounded-3xl border border-[#BFE7F5] bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
          Thông tin đăng ký
        </p>

        <h2 className="mt-1 text-xl font-extrabold text-[#12335B]">
          Mẹ đã đăng ký lớp học trước đó
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Mẹ đã đăng ký tham dự lớp học. Mẹ có thể sử dụng thông tin bên dưới để
          tham gia khi đến giờ.
        </p>

        <div className="mt-5 rounded-2xl bg-[#F5F9FC] p-4">
          <p className="text-xs text-gray-500">Thời gian tham dự</p>

          <p className="mt-1 text-sm font-bold text-[#12335B]">
            {formatBookingDateTime(booking.thoiGianThamDu)}
          </p>
        </div>

        <a
          href={booking.linkLopHoc}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#18A8DC] text-sm font-bold text-white hover:bg-[#1297C8]"
        >
          THAM GIA LỚP HỌC
        </a>

        <p className="mt-4 text-center text-xs leading-5 text-gray-500">
          Nếu mẹ muốn thay đổi buổi học hoặc cần hỗ trợ, mẹ vui lòng liên hệ
          Zalo để được hỗ trợ.
        </p>

        {zaloUrl && (
          <a
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex h-11 w-full items-center justify-center rounded-xl border border-[#18A8DC] text-sm font-bold text-[#18A8DC] hover:bg-[#F5F9FC]"
          >
            LIÊN HỆ ZALO HỖ TRỢ
          </a>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-[#BFE7F5] bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-center text-lg font-extrabold text-[#12335B]">
        QUYỀN LỢI HỘI VIÊN
      </h2>

      <p className="mt-2 text-center text-sm leading-6 text-gray-600">
        Mẹ được tham dự{" "}
        <strong className="text-[#12335B]">01 buổi học online miễn phí</strong>{" "}
        cùng Nữ hộ sinh.
      </p>

      <p className="mt-3 text-center text-sm font-semibold text-[#12335B]">
        Mẹ có muốn tham dự không?
      </p>

      <p className="mt-2 text-center text-xs leading-5 text-gray-500">
        Mẹ có thể vào đăng ký bất cứ khi nào khi muốn tham dự lớp học.
      </p>

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-xl bg-green-50 px-4 py-3 text-xs font-medium text-green-600">
          {message}
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onDecline}
          disabled={loading}
          className="h-12 rounded-full border border-[#D8E1EB] text-sm font-bold text-[#12335B] hover:bg-gray-50 disabled:opacity-60"
        >
          KHÔNG
        </button>

        <button
          type="button"
          onClick={onAccept}
          disabled={loading}
          className="h-12 rounded-full bg-[#F5A623] text-sm font-bold text-white hover:bg-[#E89512] disabled:opacity-60"
        >
          CÓ, TÔI MUỐN THAM DỰ
        </button>
      </div>
    </section>
  );
}

function formatBookingDateTime(value: string) {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) return value;

  return `${match[3]}/${match[2]}/${match[1]} · ${match[4]}:${match[5]}`;
}

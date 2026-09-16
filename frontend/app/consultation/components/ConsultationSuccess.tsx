"use client";

import type { Member } from "../types/consultation";
import { formatClassDate } from "../data/classSessions";
import { formatBookingDateTime } from "../utils/consultationDate";

type Props = {
  member: Member;
  selectedClass: {
    date: string;
    time: string;
    meetUrl: string;
  } | null;
  mode: "booking" | "review";
  onReset: () => void;
};

export default function ConsultationSuccess({
  member,
  selectedClass,
  mode,
  onReset,
}: Props) {
  const booking = member.booking;

  const meetUrl = booking?.linkLopHoc || selectedClass?.meetUrl || "";

  const displayDateTime = booking?.thoiGianThamDu
    ? formatBookingDateTime(booking.thoiGianThamDu)
    : selectedClass
      ? `${formatClassDate(selectedClass.date)} · ${selectedClass.time}`
      : "";

  return (
    <section className="rounded-3xl bg-white p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8FD] text-3xl">
        ✓
      </div>

      {mode === "booking" ? (
        <>
          <h2 className="mt-5 text-xl font-extrabold text-[#12335B] sm:text-2xl">
            ĐĂNG KÝ THÀNH CÔNG!
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Mẹ đã đăng ký thành công buổi tư vấn online.
          </p>

          {(booking || selectedClass) && (
            <>
              <div className="mt-5 rounded-2xl bg-[#F5F9FC] p-4 text-left">
                <div className="border-b border-[#E3EAF0] pb-3">
                  <p className="text-xs text-gray-500">Họ tên</p>
                  <p className="mt-1 text-sm font-bold text-[#12335B]">
                    {member.name}
                  </p>
                </div>

                <div className="border-b border-[#E3EAF0] py-3">
                  <p className="text-xs text-gray-500">Buổi tư vấn</p>
                  <p className="mt-1 text-sm font-bold leading-6 text-[#12335B]">
                    Buổi tư vấn online: &quot;CÁCH XỬ TRÍ CÁC TÌNH HUỐNG THƯỜNG
                    GẶP KHI NUÔI CON BẰNG SỮA MẸ&quot;
                  </p>
                </div>

                <div className="pt-3">
                  <p className="text-xs text-gray-500">Thời gian</p>

                  <p className="mt-1 text-base font-extrabold text-[#18A8DC]">
                    {displayDateTime}
                  </p>
                </div>
              </div>

              {meetUrl && (
                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#18A8DC] text-sm font-bold text-white hover:bg-[#1297C8]"
                >
                  THAM GIA BUỔI TƯ VẤN
                </a>
              )}
            </>
          )}

          <p className="mt-4 text-xs leading-5 text-gray-500">
            Mẹ có thể lưu lại thông tin buổi tư vấn và sử dụng nút trên để tham
            gia khi đến giờ.
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-5 text-xl font-extrabold text-[#12335B] sm:text-2xl">
            CẢM ƠN MẸ ĐÃ ĐÁNH GIÁ!
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Những chia sẻ và bình chọn của mẹ đã được ghi nhận.
          </p>

          <div className="mt-5 rounded-2xl bg-[#F5F9FC] p-4 text-left">
            <p className="text-sm font-bold text-[#12335B]">
              Cảm ơn mẹ đã đồng hành cùng buổi tư vấn.
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Ý kiến của mẹ sẽ giúp chương trình ngày càng thiết thực và hữu ích
              hơn.
            </p>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onReset}
        className="mt-5 h-11 rounded-full border border-[#D8E1EB] px-6 text-sm font-bold text-[#12335B] hover:bg-gray-50"
      >
        HOÀN TẤT
      </button>
    </section>
  );
}

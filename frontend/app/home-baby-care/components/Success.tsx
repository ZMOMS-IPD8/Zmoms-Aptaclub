"use client";

import type { BathBookingData, Member } from "../page";

type Props = {
  member: Member;
  booking: BathBookingData;
  onReview: () => void;
};

export default function Success({ member, booking, onReview }: Props) {
  return (
    <section className="rounded-3xl bg-white p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8FD] text-3xl text-[#18A8DC]">
        ✓
      </div>

      <h2 className="mt-5 text-xl font-extrabold text-[#12335B] sm:text-2xl">
        MẸ ĐÃ ĐĂNG KÝ THÀNH CÔNG
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        Thông tin buổi tư vấn và chăm sóc chuyên sâu Mẹ và Bé tại nhà của mẹ đã
        được ghi nhận.
      </p>

      <div className="mt-5 rounded-2xl bg-[#F5F9FC] p-4 text-left">
        <div className="border-b border-[#E3EAF0] pb-3">
          <p className="text-xs text-gray-500">Họ tên</p>
          <p className="mt-1 text-sm font-bold text-[#12335B]">{member.name}</p>
        </div>

        <div className="border-b border-[#E3EAF0] py-3">
          <p className="text-xs text-gray-500">Dịch vụ</p>
          <p className="mt-1 text-sm font-bold leading-6 text-[#12335B]">
            01 buổi tư vấn và chăm sóc chuyên sâu Mẹ và Bé tại nhà (45 phút)
          </p>
        </div>

        <div className="border-b border-[#E3EAF0] py-3">
          <p className="text-xs text-gray-500">Địa chỉ</p>
          <p className="mt-1 text-sm font-bold leading-6 text-[#12335B]">
            {booking.address}
          </p>
        </div>

        <div className="border-b border-[#E3EAF0] py-3">
          <p className="text-xs text-gray-500">Ngày dự kiến</p>
          <p className="mt-1 text-sm font-bold text-[#12335B]">
            {formatDate(booking.date)}
          </p>
        </div>

        <div className="pt-3">
          <p className="text-xs text-gray-500">Thời gian dự kiến</p>
          <p className="mt-1 text-sm font-bold text-[#12335B]">
            {booking.time}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-[#FFF8F2] px-4 py-4 text-left">
        <p className="text-sm font-bold text-[#12335B]">
          Nhân viên sẽ liên hệ với mẹ để xác nhận lịch tư vấn và chăm sóc tại
          nhà.
        </p>

        <p className="mt-1 text-sm leading-6 text-gray-600">
          Sau khi hoàn tất buổi chăm sóc, mẹ có thể cập nhật tên nhân viên và
          ghi chú tại đây.
        </p>
      </div>

      {booking.canReview && !booking.hasReview && (
        <button
          type="button"
          onClick={onReview}
          className="mt-5 h-12 w-full rounded-xl border border-[#12335B] text-sm font-bold text-[#12335B] transition hover:bg-[#F5F9FC]"
        >
          CẬP NHẬT SAU BUỔI CHĂM SÓC
        </button>
      )}
    </section>
  );
}

function formatDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return value;
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
}

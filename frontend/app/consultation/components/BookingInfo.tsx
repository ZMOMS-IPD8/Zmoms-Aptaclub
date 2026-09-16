"use client";

import type { Member } from "../types/consultation";
import { formatBookingDateTime } from "../utils/consultationDate";

type Props = {
  member: Member;
  classHasStarted: boolean;
  onPreSurvey: () => void;
  onPostSurvey: () => void;
  onBack: () => void;
  error: string;
};

export default function BookingInfo({
  member,
  classHasStarted,
  onPreSurvey,
  onPostSurvey,
  onBack,
  error,
}: Props) {
  const existingBooking = member.booking;

  if (!existingBooking) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-[#BFE7F5] bg-white p-5 shadow-sm sm:p-7">
      <p className="text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
        Thông tin đăng ký
      </p>

      <h2 className="mt-1 text-xl font-extrabold text-[#12335B]">
        Mẹ đã đăng ký buổi tư vấn
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        Mẹ không cần đăng ký lại. Thông tin buổi tư vấn của mẹ:
      </p>

      <div className="mt-5 rounded-2xl bg-[#F5F9FC] p-4">
        <p className="text-xs text-gray-500">Thời gian tham dự</p>

        <p className="mt-1 text-sm font-bold text-[#12335B]">
          {formatBookingDateTime(existingBooking.thoiGianThamDu)}
        </p>
      </div>

      <a
        href={existingBooking.linkLopHoc}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#18A8DC] text-sm font-bold text-white hover:bg-[#1297C8]"
      >
        THAM GIA BUỔI TƯ VẤN
      </a>

      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-[#D8E1EB] bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
                Khảo sát 1
              </p>

              <p className="mt-1 text-sm font-bold text-[#12335B]">
                Khảo sát trước buổi tư vấn
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Thông tin giúp chuyên gia hiểu hơn về tình trạng và nhu cầu của
                mẹ.
              </p>
            </div>

            {member.hasPreSurvey && (
              <span className="shrink-0 rounded-full bg-[#E8F8FD] px-3 py-1 text-[11px] font-bold text-[#18A8DC]">
                ĐÃ HOÀN THÀNH
              </span>
            )}
          </div>

          {member.hasPreSurvey ? (
            <div className="mt-3 rounded-xl bg-[#F5F9FC] px-4 py-3 text-center text-xs font-bold text-gray-500">
              Mẹ đã hoàn thành khảo sát trước buổi tư vấn
            </div>
          ) : (
            <button
              type="button"
              onClick={onPreSurvey}
              className="mt-3 h-11 w-full rounded-xl bg-[#12335B] text-sm font-bold text-white hover:bg-[#0D2949]"
            >
              TIẾP TỤC KHẢO SÁT TRƯỚC
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-[#D8E1EB] bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
                Khảo sát 2
              </p>

              <p className="mt-1 text-sm font-bold text-[#12335B]">
                Đánh giá sau buổi tư vấn
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Mẹ có thể thực hiện sau khi đã hoàn thành khảo sát trước buổi tư
                vấn và buổi tư vấn đã bắt đầu.
              </p>
            </div>

            {member.hasPostSurvey && (
              <span className="shrink-0 rounded-full bg-[#E8F8FD] px-3 py-1 text-[11px] font-bold text-[#18A8DC]">
                ĐÃ HOÀN THÀNH
              </span>
            )}
          </div>

          {member.hasPostSurvey ? (
            <div className="mt-3 rounded-xl bg-[#F5F9FC] px-4 py-3 text-center text-xs font-bold text-gray-500">
              Mẹ đã hoàn thành đánh giá sau buổi tư vấn
            </div>
          ) : !member.hasPreSurvey ? (
            <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-center text-xs font-semibold text-gray-400">
              Mẹ cần hoàn thành khảo sát trước buổi tư vấn trước
            </div>
          ) : !classHasStarted ? (
            <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-center text-xs font-semibold text-gray-400">
              Mẹ chỉ có thể đánh giá sau khi buổi tư vấn đã bắt đầu
            </div>
          ) : (
            <button
              type="button"
              onClick={onPostSurvey}
              className="mt-3 h-11 w-full rounded-xl border border-[#12335B] text-sm font-bold text-[#12335B] hover:bg-[#F5F9FC]"
            >
              ĐÁNH GIÁ SAU BUỔI TƯ VẤN
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onBack}
        className="mt-4 h-10 w-full text-sm font-bold text-gray-500 hover:text-[#12335B]"
      >
        ← Kiểm tra số điện thoại khác
      </button>
    </section>
  );
}

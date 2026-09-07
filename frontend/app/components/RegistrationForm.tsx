"use client";

import { PROVINCES } from "../data/provinces";
import ConsentSection from "./ConsentSection";
import LegalInfo from "./LegalInfo";
import RegistrationDialog from "./RegistrationDialog";
import { useRegistrationForm } from "../hooks/useRegistrationForm";

export default function RegistrationForm() {
  const {
    fullName,
    phone,
    province,
    babyDate,
    referralCode,

    setFullName,
    setPhone,
    setProvince,
    setBabyDate,
    setReferralCode,

    consentMember,
    consentAptaclub,
    consentMarketing,
    consentDanone,

    setConsentMember,
    setConsentAptaclub,
    setConsentMarketing,
    setConsentDanone,

    canSubmit,
    handleSubmit,

    dialog,
    closeDialog,
  } = useRegistrationForm();

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-[0_4px_30px_rgba(0,0,0,0.06)] sm:rounded-3xl"
      >
        <div className="px-4 pb-2 pt-6 text-center sm:px-8 sm:pt-9 lg:px-10">
          <h1 className="text-[20px] font-bold leading-[1.3] text-[#173b8f] sm:text-[26px] lg:text-[28px]">
            ĐĂNG KÝ HỘI VIÊN
            <br className="sm:hidden" />
            <span> & </span>
            PHIẾU ĐỒNG Ý CHIA SẺ DỮ LIỆU CÁ NHÂN
          </h1>

          <p className="mt-4 text-[15px] font-bold italic leading-6 text-[#ec0a7d] sm:mt-5 sm:text-[18px]">
            Cộng đồng Mẹ Nuôi Con Thông Minh
            <br />
            trong 1.000 Ngày Vàng Đầu Đời
          </p>

          <p className="mt-4 text-left text-[13px] leading-5 text-[#333] sm:mt-5 sm:text-[15px] sm:leading-6">
            Chương trình hợp tác giữa <strong>Danone Việt Nam và Zmoms</strong>.
            Vui lòng đọc kỹ thông tin và chủ động lựa chọn các nội dung đồng ý
            trước khi xác nhận.
          </p>
        </div>

        <div className="px-4 pb-6 pt-4 sm:px-8 sm:pb-8 sm:pt-5 lg:px-10">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[14px] font-medium text-[#222]">
                Họ và tên <span className="text-[#ec0a7d]">*</span>
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên của mẹ"
                autoComplete="name"
                className="h-12 w-full rounded-xl border border-[#d9dce3] bg-white px-4 text-[15px] outline-none transition placeholder:text-[#999] focus:border-[#ec0a7d] focus:ring-2 focus:ring-[#ec0a7d]/10 sm:h-14 sm:text-[16px]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[14px] font-medium text-[#222]">
                Số điện thoại zalo <span className="text-[#ec0a7d]">*</span>
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại zalo mẹ vừa nhập trong Zalo OA Zmoms"
                inputMode="tel"
                autoComplete="tel"
                className="h-12 w-full rounded-xl border border-[#d9dce3] bg-white px-4 text-[15px] outline-none transition placeholder:text-[#999] focus:border-[#ec0a7d] focus:ring-2 focus:ring-[#ec0a7d]/10 sm:h-14 sm:text-[16px]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[14px] font-medium text-[#222]">
                Mã giới thiệu
                <span className="ml-1 font-normal text-[#777]">(nếu có)</span>
              </label>

              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã giới thiệu nếu mẹ được giới thiệu"
                autoCapitalize="characters"
                className="h-12 w-full rounded-xl border border-[#d9dce3] bg-white px-4 text-[15px] uppercase outline-none transition placeholder:text-[#999] focus:border-[#ec0a7d] focus:ring-2 focus:ring-[#ec0a7d]/10 sm:h-14 sm:text-[16px]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[14px] font-medium text-[#222]">
                Tỉnh / thành <span className="text-[#ec0a7d]">*</span>
              </label>

              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-[#d9dce3] bg-white px-4 text-[15px] text-[#555] outline-none transition focus:border-[#ec0a7d] focus:ring-2 focus:ring-[#ec0a7d]/10 sm:h-14 sm:text-[16px]"
              >
                <option value="" disabled>
                  Chọn tỉnh / thành nơi mẹ đang sinh sống
                </option>

                {PROVINCES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[14px] font-medium text-[#222]">
                Ngày dự sinh / Sinh nhật bé{" "}
                <span className="text-[#ec0a7d]">*</span>
              </label>

              <p className="mb-2 text-[12px] leading-4 text-[#777]">
                Nếu đang mang thai, mẹ chọn ngày dự sinh. Nếu bé đã chào đời,
                chọn ngày sinh của bé.
              </p>

              <input
                type="date"
                value={babyDate}
                onChange={(e) => setBabyDate(e.target.value)}
                className="h-12 w-full rounded-xl border border-[#d9dce3] bg-white px-4 text-[15px] text-[#555] outline-none transition focus:border-[#ec0a7d] focus:ring-2 focus:ring-[#ec0a7d]/10 sm:h-14 sm:text-[16px]"
              />
            </div>
          </div>

          <LegalInfo />

          <ConsentSection
            consentMember={consentMember}
            consentAptaclub={consentAptaclub}
            consentMarketing={consentMarketing}
            consentDanone={consentDanone}
            setConsentMember={setConsentMember}
            setConsentAptaclub={setConsentAptaclub}
            setConsentMarketing={setConsentMarketing}
            setConsentDanone={setConsentDanone}
          />

          <button
            type="submit"
            disabled={!canSubmit}
            className={`mt-6 h-12 w-full rounded-xl text-[15px] font-bold text-white transition sm:mt-7 sm:h-14 sm:rounded-2xl sm:text-[16px] ${
              canSubmit
                ? "bg-[#ec0a7d] shadow-[0_5px_15px_rgba(236,10,125,0.2)] hover:bg-[#d90870] active:scale-[0.99]"
                : "cursor-not-allowed bg-[#d9d9d9]"
            }`}
          >
            ĐĂNG KÝ HỘI VIÊN
          </button>
        </div>
      </form>

      <RegistrationDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        status={dialog.status}
        zaloUrl={dialog.zaloUrl}
        onClose={closeDialog}
      />
    </>
  );
}

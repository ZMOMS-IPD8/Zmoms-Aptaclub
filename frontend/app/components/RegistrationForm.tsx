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
    eventCode,
    availableEventCodes,

    setFullName,
    setPhone,
    setProvince,
    setBabyDate,
    setReferralCode,
    setEventCode,

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
      <form onSubmit={handleSubmit} className="font-sans">
        <div className="px-4 pt-6 text-center sm:px-8 sm:pt-8 lg:px-10">
          <h1 className="text-[22px] font-bold leading-8 text-[#EC068D] sm:text-[28px]">
            ĐĂNG KÝ HỘI VIÊN
          </h1>

          <h2 className="mt-1 text-[18px] font-bold leading-7 text-[#EC068D] sm:text-[22px]">
            &amp; PHIẾU ĐỒNG Ý CHIA SẺ DỮ LIỆU CÁ NHÂN
          </h2>

          <p className="mt-4 text-[15px] font-bold italic leading-6 text-[#EC068D] sm:mt-5 sm:text-[18px]">
            Cộng đồng Mẹ Nuôi Con Thông Minh
            <br />
            trong 1.000 Ngày Vàng Đầu Đời
          </p>

          <p className="mt-4 text-left text-[13px] leading-5 text-[#333333] sm:mt-5 sm:text-[15px] sm:leading-6">
            Chương trình hợp tác giữa{" "}
            <strong className="font-semibold text-[#222222]">
              Danone Việt Nam và Zmoms
            </strong>
            . Vui lòng đọc kỹ thông tin và chủ động lựa chọn các nội dung đồng ý
            trước khi xác nhận.
          </p>
        </div>

        <div className="px-4 pb-6 pt-4 sm:px-8 sm:pb-8 sm:pt-5 lg:px-10">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[14px] font-medium leading-5 text-[#222222]">
                Họ và tên <span className="font-medium text-[#EC068D]">*</span>
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên của mẹ"
                autoComplete="name"
                className="h-12 w-full rounded-xl border border-[#D9DCE3] bg-white px-4 font-sans text-[15px] text-[#222222] outline-none transition placeholder:text-[#999999] focus:border-[#EC068D] focus:ring-2 focus:ring-[#EC068D]/10 sm:h-14 sm:text-[16px]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[14px] font-medium leading-5 text-[#222222]">
                Số điện thoại Zalo{" "}
                <span className="font-medium text-[#EC068D]">*</span>
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại Zalo mẹ vừa nhập trong Zalo OA Zmoms"
                inputMode="tel"
                autoComplete="tel"
                className="h-12 w-full rounded-xl border border-[#D9DCE3] bg-white px-4 font-sans text-[15px] text-[#222222] outline-none transition placeholder:text-[#999999] focus:border-[#EC068D] focus:ring-2 focus:ring-[#EC068D]/10 sm:h-14 sm:text-[16px]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[14px] font-medium leading-5 text-[#222222]">
                Mã giới thiệu
              </label>

              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Nhập mã giới thiệu nếu có"
                autoCapitalize="characters"
                className="h-12 w-full rounded-xl border border-[#D9DCE3] bg-white px-4 font-sans text-[15px] uppercase text-[#222222] outline-none transition placeholder:text-[#999999] focus:border-[#EC068D] focus:ring-2 focus:ring-[#EC068D]/10 sm:h-14 sm:text-[16px]"
              />
            </div>

            {referralCode.trim() && availableEventCodes.length > 0 && (
              <div>
                <label className="mb-1.5 block text-[14px] font-medium leading-5 text-[#222222]">
                  Mã sự kiện{" "}
                  <span className="font-medium text-[#EC068D]">*</span>
                </label>

                <select
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value)}
                  required
                  className="h-12 w-full appearance-none rounded-xl border border-[#D9DCE3] bg-white px-4 font-sans text-[15px] text-[#333333] outline-none transition focus:border-[#EC068D] focus:ring-2 focus:ring-[#EC068D]/10 sm:h-14 sm:text-[16px]"
                >
                  <option value="" className="text-[#999999]">
                    Chọn mã sự kiện
                  </option>

                  {availableEventCodes.map((item) => (
                    <option key={item} value={item} className="text-[#222222]">
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-[14px] font-medium leading-5 text-[#222222]">
                Tỉnh / thành{" "}
                <span className="font-medium text-[#EC068D]">*</span>
              </label>

              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
                className="h-12 w-full appearance-none rounded-xl border border-[#D9DCE3] bg-white px-4 font-sans text-[15px] text-[#333333] outline-none transition focus:border-[#EC068D] focus:ring-2 focus:ring-[#EC068D]/10 sm:h-14 sm:text-[16px]"
              >
                <option value="" disabled className="text-[#999999]">
                  Chọn tỉnh / thành nơi mẹ đang sinh sống
                </option>

                {PROVINCES.map((item) => (
                  <option key={item} value={item} className="text-[#222222]">
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[14px] font-medium leading-5 text-[#222222]">
                Ngày dự sinh / Sinh nhật bé{" "}
                <span className="font-medium text-[#EC068D]">*</span>
              </label>

              <p className="mb-2 text-[12px] leading-4 text-[#777777]">
                Nếu đang mang thai, mẹ chọn ngày dự sinh. Nếu bé đã chào đời,
                chọn ngày sinh của bé.
              </p>

              <input
                type="date"
                value={babyDate}
                onChange={(e) => setBabyDate(e.target.value)}
                required
                className="h-12 w-full rounded-xl border border-[#D9DCE3] bg-white px-4 font-sans text-[15px] text-[#333333] outline-none transition focus:border-[#EC068D] focus:ring-2 focus:ring-[#EC068D]/10 sm:h-14 sm:text-[16px]"
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
            className={`mt-6 h-12 w-full rounded-xl font-sans text-[15px] font-bold text-white transition sm:mt-7 sm:h-14 sm:rounded-2xl sm:text-[16px] ${
              canSubmit
                ? "bg-[#EC068D] shadow-[0_5px_15px_rgba(236,6,141,0.2)] hover:bg-[#D9057F] active:scale-[0.99]"
                : "cursor-not-allowed bg-[#D9D9D9]"
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

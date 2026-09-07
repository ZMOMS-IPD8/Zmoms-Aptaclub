type ConsentSectionProps = {
  consentMember: boolean;
  consentAptaclub: boolean;
  consentMarketing: boolean;
  consentDanone: boolean;

  setConsentMember: (value: boolean) => void;
  setConsentAptaclub: (value: boolean) => void;
  setConsentMarketing: (value: boolean) => void;
  setConsentDanone: (value: boolean) => void;
};

export default function ConsentSection({
  consentMember,
  consentAptaclub,
  consentMarketing,
  consentDanone,
  setConsentMember,
  setConsentAptaclub,
  setConsentMarketing,
  setConsentDanone,
}: ConsentSectionProps) {
  return (
    <section className="mt-6 sm:mt-7">
      <h2 className="text-[16px] font-bold text-[#ec0a7d] sm:text-[17px]">
        C. Xác nhận của mẹ <span className="font-normal">(tick từng ô)</span>
      </h2>

      <div className="mt-4 space-y-5 sm:space-y-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={consentMember}
            onChange={(e) => setConsentMember(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-[#ec0a7d]"
          />

          <span className="text-[13px] leading-5 text-[#222] sm:text-[14px] sm:leading-6">
            Tôi đồng ý đăng ký hội viên Zmoms & tham gia Cộng đồng Mẹ Nuôi Con
            Thông Minh 1.000 Ngày Vàng.
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={consentAptaclub}
            onChange={(e) => setConsentAptaclub(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-[#ec0a7d]"
          />

          <span className="text-[13px] leading-5 text-[#222] sm:text-[14px] sm:leading-6">
            Tôi đồng ý cho Zmoms chia sẻ họ tên, SĐT, tỉnh/thành & giai đoạn
            thai kỳ/tháng tuổi bé cho Danone Việt Nam để đăng ký Aptaclub.
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={consentMarketing}
            onChange={(e) => setConsentMarketing(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-[#ec0a7d]"
          />

          <span className="text-[13px] leading-5 text-[#222] sm:text-[14px] sm:leading-6">
            Tôi đồng ý nhận thông tin chương trình, lịch tư vấn & ưu đãi qua
            Zalo/ĐT.
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={consentDanone}
            onChange={(e) => setConsentDanone(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-[#ec0a7d]"
          />

          <span className="text-[13px] leading-5 text-[#222] sm:text-[14px] sm:leading-6">
            Tôi xác nhận đã đọc{" "}
            <a
              href="https://www.aptaclub.com.vn/chinh-sach-quyen-rieng-tu.html"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-[#ec0a7d] underline underline-offset-2"
            >
              Chính sách Quyền riêng tư của Danone Việt Nam
            </a>{" "}
            và đồng ý cho Danone Việt Nam thu thập, sử dụng và xử lý dữ liệu cá
            nhân của tôi để quản lý tài khoản, hỗ trợ và chăm sóc khách hàng,
            cũng như tư vấn về sản phẩm, khoa học và dinh dưỡng trong quá trình
            nuôi con.
          </span>
        </label>
      </div>
    </section>
  );
}

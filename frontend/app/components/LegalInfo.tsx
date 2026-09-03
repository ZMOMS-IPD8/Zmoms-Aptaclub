export default function LegalInfo() {
  return (
    <>
      <section className="mt-6 sm:mt-7">
        <h2 className="text-[15px] font-bold text-[#173b8f] sm:text-[16px]">
          A. Dữ liệu thu thập
        </h2>

        <p className="mt-2 text-[13px] leading-5 text-[#333] sm:text-[14px] sm:leading-6">
          Họ tên, số điện thoại, tỉnh/thành, mã giới thiệu (nếu có), ngày dự
          sinh hoặc ngày sinh của bé và thông tin tương tác trong chương trình.
        </p>
      </section>

      <section className="mt-5 sm:mt-6">
        <h2 className="text-[15px] font-bold text-[#173b8f] sm:text-[16px]">
          B. Mục đích sử dụng
        </h2>

        <p className="mt-2 text-[13px] leading-5 text-[#333] sm:text-[14px] sm:leading-6">
          Quản lý tài khoản hội viên Zmoms; cung cấp quyền lợi và dịch vụ của
          chương trình; liên hệ để xác nhận thông tin, lịch tư vấn hoặc giao
          quà; và thực hiện các hoạt động chăm sóc hội viên theo nội dung mẹ đã
          đồng ý.
        </p>
      </section>

      <section className="mt-5 sm:mt-6">
        <h2 className="text-[15px] font-bold leading-6 text-[#173b8f] sm:text-[16px]">
          C. Quyền của mẹ{" "}
          <span className="font-normal">
            (
            <a
              href="https://vanban.chinhphu.vn/?docid=214590&pageid=27160&typegroupid=3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ec0a7d] underline underline-offset-2 hover:opacity-80"
            >
              Luật 91/2025/QH15
            </a>
            {" & "}
            <a
              href="https://vanban.chinhphu.vn/?docid=216387&pageid=27160&typegroupid=4"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ec0a7d] underline underline-offset-2 hover:opacity-80"
            >
              Nghị định 356/2025/NĐ-CP
            </a>
            )
          </span>
        </h2>

        <p className="mt-2 text-[13px] leading-5 text-[#333] sm:text-[14px] sm:leading-6">
          Mẹ có quyền được biết về việc xử lý dữ liệu cá nhân; đồng ý hoặc từ
          chối đồng ý theo từng mục đích; truy cập, chỉnh sửa, yêu cầu xóa và
          rút lại sự đồng ý theo quy định pháp luật.
        </p>

        <p className="mt-2 text-[13px] leading-5 text-[#333] sm:text-[14px] sm:leading-6">
          Chi tiết quyền và quy định về bảo vệ dữ liệu cá nhân, vui lòng xem{" "}
          <a
            href="https://vanban.chinhphu.vn/?docid=214590&pageid=27160&typegroupid=3"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#ec0a7d] underline underline-offset-2 hover:opacity-80"
          >
            Luật Bảo vệ dữ liệu cá nhân
          </a>
          .
        </p>
      </section>
    </>
  );
}

export default function PricePolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-10 border-b pb-8">
          <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
            CHÍNH SÁCH GIÁ
          </h1>

          <p className="mt-3 text-sm italic leading-6 text-gray-600 sm:text-base">
            Nguyên tắc niêm yết và áp dụng giá hàng hóa, dịch vụ
          </p>

          <div className="mt-6 space-y-2 text-sm leading-6 text-gray-600">
            <p>
              <span className="font-semibold text-gray-900">
                CÔNG TY CỔ PHẦN ZMOMS
              </span>
            </p>

            <p>
              <span className="font-semibold text-gray-900">Website:</span>{" "}
              <a
                href="https://uudaihoivien.z-moms.com"
                className="break-all hover:underline"
              >
                uudaihoivien.z-moms.com
              </a>
            </p>

            <p>
              <span className="font-semibold text-gray-900">Email:</span>{" "}
              <a
                href="mailto:edu@z-moms.com"
                className="break-all hover:underline"
              >
                edu@z-moms.com
              </a>
            </p>

            <p>
              <span className="font-semibold text-gray-900">Hotline:</span>{" "}
              <a href="tel:0947701010" className="hover:underline">
                0947701010
              </a>
            </p>

            <p>
              <span className="font-semibold text-gray-900">
                Ngày hiệu lực:
              </span>{" "}
              09/09/2026
            </p>
          </div>
        </header>

        <div className="space-y-10 text-sm leading-7 text-gray-700 sm:text-base">
          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              1. Nguyên tắc niêm yết giá
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                Giá hàng hóa, sản phẩm và dịch vụ được ZMOMS niêm yết bằng Đồng
                Việt Nam (VNĐ) và công khai trên website trước khi khách hàng
                xác nhận giao dịch.
              </li>
              <li>
                Giá niêm yết là mức giá khách hàng phải thanh toán cho hàng hóa,
                sản phẩm hoặc dịch vụ theo nội dung đơn hàng, chương trình và
                điều kiện áp dụng được công bố tại thời điểm giao dịch.
              </li>
              <li>
                Giá niêm yết của các sản phẩm, combo được công bố trên website
                đã bao gồm thuế giá trị gia tăng (VAT) theo quy định áp dụng.
                ZMOMS thực hiện miễn phí vận chuyển đối với các đơn hàng thuộc
                chương trình được công bố, trừ trường hợp có thông báo khác
                trước khi khách hàng xác nhận giao dịch.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              2. Giá sản phẩm và Combo “Em Bé Thông Minh”
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                ZMOMS hiện cung cấp Combo “Em Bé Thông Minh” dành cho hội viên
                theo từng chương trình và điều kiện được công bố trên website.
              </li>
              <li>
                Combo Nhỏ: Tổng giá trị sản phẩm theo chương trình là
                1.150.000đ; giá bán combo là 649.000đ.
              </li>
              <li>
                Combo Lớn: Tổng giá trị sản phẩm theo chương trình là
                1.818.000đ; giá bán combo là 1.129.000đ.
              </li>
              <li>
                Giá trị sản phẩm trong combo có thể bao gồm sản phẩm, quà tặng
                và các quyền lợi được mô tả cụ thể trên trang bán hàng tại thời
                điểm khách hàng thực hiện giao dịch.
              </li>
              <li>
                Trong trường hợp combo được thể hiện bằng nhiều hóa đơn, số tiền
                khách hàng phải thanh toán và cơ cấu từng hóa đơn sẽ được thể
                hiện rõ trước khi khách hàng xác nhận đơn hàng.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              3. Voucher ưu đãi 300.000đ
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                Hội viên ZMOMS đáp ứng điều kiện của chương trình có thể nhận
                voucher giảm 300.000đ thông qua việc nhập số điện thoại Zalo đã
                đăng ký và mã giới thiệu theo hướng dẫn trên website.
              </li>
              <li>
                Voucher 300.000đ được áp dụng cho cả Combo Nhỏ và Combo Lớn theo
                thể lệ chương trình.
              </li>
              <li>Mỗi hội viên chỉ được sử dụng voucher 300.000đ một lần.</li>
              <li>
                Voucher chỉ được áp dụng theo đúng phạm vi và điều kiện được
                công bố trong chương trình. Voucher không được quy đổi thành
                tiền mặt, không có giá trị nhận lại phần chênh lệch bằng tiền và
                không được cộng dồn với voucher hoặc chương trình ưu đãi khác,
                trừ khi ZMOMS có thông báo khác.
              </li>
              <li>
                Thời hạn sử dụng voucher được thực hiện theo thời gian và thể lệ
                của chương trình được ZMOMS công bố tại từng thời điểm.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              4. Cơ cấu giá và hóa đơn
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                Đối với Combo “Em Bé Thông Minh”, giá trị combo có thể được thể
                hiện qua các hóa đơn riêng biệt theo cơ cấu hàng hóa thực tế.
              </li>
              <li>
                Ví dụ đối với Combo Nhỏ, chương trình có thể bao gồm Hóa đơn ①
                đối với Combo IPD8 – quà tặng và sản phẩm cho con và Hóa đơn ②
                đối với sản phẩm sữa Aptamil.
              </li>
              <li>
                Voucher 300.000đ chỉ được áp dụng vào Hóa đơn ① ZMOMS theo thể
                lệ chương trình; Hóa đơn ② đối với lon sữa Aptamil không áp dụng
                voucher.
              </li>
              <li>
                Thông tin chi tiết về giá, sản phẩm, voucher và số tiền khách
                hàng phải thanh toán được công bố trước khi khách hàng hoàn tất
                giao dịch.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              5. Chương trình ưu đãi và khuyến mại
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                ZMOMS có thể triển khai các chương trình khuyến mại, ưu đãi dành
                cho hội viên, mã giới thiệu, voucher hoặc các hình thức ưu đãi
                khác theo từng thời kỳ.
              </li>
              <li>
                Điều kiện áp dụng, mức ưu đãi, thời gian chương trình, đối tượng
                áp dụng và các giới hạn liên quan sẽ được công bố công khai trên
                website hoặc kênh thông tin chính thức của ZMOMS.
              </li>
              <li>
                Trường hợp có nhiều chương trình ưu đãi cùng thời điểm, khách
                hàng chỉ được hưởng các ưu đãi theo điều kiện và nguyên tắc cộng
                dồn được ZMOMS công bố.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              6. Giá áp dụng tại thời điểm giao dịch
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                Giá áp dụng cho giao dịch là mức giá và điều kiện ưu đãi được
                hiển thị trên website tại thời điểm khách hàng hoàn tất việc đặt
                hàng/thanh toán.
              </li>
              <li>
                Sau khi giao dịch đã được ZMOMS xác nhận thành công, việc điều
                chỉnh giá hoặc xuất hiện chương trình ưu đãi mới sau đó không
                làm thay đổi giá của giao dịch đã xác nhận, trừ trường hợp hai
                bên có thỏa thuận khác hoặc phát sinh sai sót cần xử lý theo
                chính sách của ZMOMS.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              7. Sai sót về giá hoặc thông tin khuyến mại
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                Trong trường hợp phát sinh lỗi kỹ thuật, lỗi hệ thống hoặc lỗi
                nhập liệu dẫn đến việc hiển thị sai giá, sai mức giảm giá hoặc
                sai thông tin chương trình, ZMOMS có quyền tạm dừng hoặc từ chối
                thực hiện giao dịch và thông báo cho khách hàng phương án xử lý
                phù hợp.
              </li>
              <li>
                Nếu khách hàng đã thanh toán nhưng ZMOMS không thể cung cấp hàng
                hóa hoặc dịch vụ do lỗi của hệ thống hoặc sai sót thuộc phạm vi
                trách nhiệm của ZMOMS, việc hoàn tiền sẽ được thực hiện theo
                Chính sách thanh toán, đổi trả và hoàn tiền được công bố trên
                website.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              8. Thay đổi chính sách giá
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                ZMOMS có quyền điều chỉnh giá hàng hóa, sản phẩm, dịch vụ và
                chương trình ưu đãi để phù hợp với hoạt động kinh doanh, chương
                trình khuyến mại hoặc chính sách của từng thời kỳ.
              </li>
              <li>
                Việc thay đổi giá không ảnh hưởng đến các giao dịch đã được xác
                nhận thành công trước thời điểm thay đổi, trừ trường hợp có sai
                sót hoặc trường hợp khác được pháp luật cho phép.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              9. Thông tin liên hệ
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>Tên đơn vị: CÔNG TY CỔ PHẦN ZMOMS.</li>
              <li>Mã số thuế: 0111262586.</li>
              <li>
                Địa chỉ: A3-3203, Tòa A3, Ecolife Capitol, 58 Tố Hữu, Phường Đại
                Mỗ, TP. Hà Nội.
              </li>
              <li>Người đại diện: Trương Thụy Thu Quỳnh.</li>
              <li>
                Email:{" "}
                <a
                  href="mailto:edu@z-moms.com"
                  className="break-all text-gray-900 underline"
                >
                  edu@z-moms.com
                </a>
                .
              </li>
              <li>
                Hotline:{" "}
                <a href="tel:0947701010" className="text-gray-900 underline">
                  0947701010
                </a>
                .
              </li>
            </ul>
          </section>

          <div className="border-t pt-6 text-sm leading-6 text-gray-600">
            <p>
              <span className="font-semibold text-gray-900">Lưu ý:</span> Các
              mức giá và cơ cấu sản phẩm nêu trên được xây dựng theo thông tin
              chương trình ZMOMS cung cấp tại thời điểm soạn thảo. Khi chương
              trình thay đổi, ZMOMS cần cập nhật nội dung công bố tương ứng trên
              website.
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}

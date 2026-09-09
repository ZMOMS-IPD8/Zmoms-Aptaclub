export default function PaymentPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-10 border-b pb-8">
          <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
            CHÍNH SÁCH THANH TOÁN
          </h1>

          <p className="mt-3 text-sm italic leading-6 text-gray-600 sm:text-base">
            Phương thức thanh toán và nguyên tắc hoàn tiền
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
          <p>
            Chính sách thanh toán này quy định các phương thức thanh toán và
            nguyên tắc hoàn tiền đối với hàng hóa, sản phẩm và dịch vụ được cung
            cấp bởi ZMOMS trên website. Trước khi thanh toán, khách hàng vui
            lòng kiểm tra kỹ thông tin đơn hàng, sản phẩm, giá bán, ưu đãi và
            các điều kiện liên quan.
          </p>

          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              1. Phương thức thanh toán
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                ZMOMS hiện cung cấp các phương thức thanh toán gồm chuyển khoản
                ngân hàng thông qua mã QR hoặc thông tin tài khoản được hiển thị
                trên website, và thanh toán qua ZaloPay.
              </li>
              <li>
                Khách hàng có trách nhiệm kiểm tra chính xác số tiền, thông tin
                tài khoản, mã QR, nội dung chuyển khoản và các thông tin liên
                quan trước khi thực hiện thanh toán.
              </li>
              <li>
                Đối với thanh toán qua ZaloPay, khách hàng thực hiện giao dịch
                trên hệ thống của ZaloPay theo hướng dẫn tại thời điểm thanh
                toán. ZMOMS tiếp nhận thông tin trạng thái giao dịch để xác nhận
                đơn hàng.
              </li>
              <li>
                Đơn hàng được xác nhận thanh toán khi hệ thống của ZMOMS ghi
                nhận giao dịch thành công hoặc ZMOMS nhận được xác nhận thanh
                toán hợp lệ từ đơn vị thanh toán.
              </li>
              <li>
                ZMOMS không yêu cầu và không trực tiếp lưu trữ thông tin đăng
                nhập ngân hàng, mật khẩu hoặc mã OTP của khách hàng. Khách hàng
                thực hiện các bước xác thực thanh toán trên hệ thống ngân hàng
                hoặc đơn vị thanh toán tương ứng.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              2. Thanh toán đối với Combo và nhiều hóa đơn
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                Đối với các chương trình combo được cấu thành từ nhiều hóa đơn,
                thông tin về từng hóa đơn, sản phẩm, giá trị và số tiền khách
                hàng phải thanh toán sẽ được thể hiện theo cơ cấu của chương
                trình trước khi khách hàng hoàn tất giao dịch.
              </li>
              <li>
                Đối với Combo “Em Bé Thông Minh”, voucher 300.000đ được áp dụng
                theo đúng thể lệ chương trình và chỉ áp dụng cho Hóa đơn ①
                ZMOMS; Hóa đơn ② đối với sản phẩm sữa Aptamil không áp dụng
                voucher.
              </li>
              <li>
                Việc thanh toán thành công của một hoặc nhiều hóa đơn được ghi
                nhận theo trạng thái giao dịch tương ứng. Khách hàng cần kiểm
                tra tổng số tiền phải thanh toán trước khi xác nhận.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              3. Chính sách hoàn tiền
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                Khách hàng được xem xét hoàn tiền trong các trường hợp: giao
                dịch đã thanh toán thành công nhưng ZMOMS không thể cung cấp
                hàng hóa/dịch vụ do lỗi thuộc phạm vi trách nhiệm của ZMOMS hoặc
                lỗi hệ thống; giao dịch bị thanh toán trùng; hoặc các trường hợp
                khác theo thỏa thuận giữa ZMOMS và khách hàng hoặc theo quy định
                pháp luật.
              </li>
              <li>
                Trường hợp hàng hóa bị thiếu, giao sai, hư hỏng hoặc không phù
                hợp với đơn hàng do lỗi thuộc trách nhiệm của ZMOMS, việc đổi
                hàng hoặc hoàn tiền được xem xét theo chính sách giao hàng, đổi
                trả và hoàn tiền của ZMOMS.
              </li>
              <li>
                Việc hoàn tiền được thực hiện trên cơ sở số tiền khách hàng thực
                tế đã thanh toán và điều kiện áp dụng của giao dịch/chương
                trình.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              4. Các trường hợp không áp dụng hoàn tiền
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                ZMOMS không áp dụng hoàn tiền đối với trường hợp khách hàng thay
                đổi nhu cầu sau khi hàng hóa/dịch vụ đã được cung cấp hoặc đơn
                hàng đã được xử lý đúng theo thông tin khách hàng xác nhận, trừ
                trường hợp pháp luật có quy định khác.
              </li>
              <li>
                Voucher hoặc ưu đãi đã sử dụng không được quy đổi thành tiền
                mặt. Việc hoàn tiền không làm phát sinh quyền quy đổi phần giá
                trị voucher chưa sử dụng thành tiền mặt.
              </li>
              <li>
                Trường hợp khách hàng cung cấp thông tin không chính xác dẫn đến
                việc giao hàng hoặc cung cấp dịch vụ không thực hiện được, việc
                xử lý được xem xét theo nguyên nhân thực tế, điều kiện giao dịch
                và quy định pháp luật.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              5. Phương thức và thời hạn hoàn tiền
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                Trường hợp đủ điều kiện hoàn tiền, ZMOMS ưu tiên hoàn tiền về
                chính phương thức thanh toán mà khách hàng đã sử dụng.
              </li>
              <li>
                Đối với trường hợp phương thức thanh toán ban đầu không hỗ trợ
                hoàn tiền, ZMOMS có thể yêu cầu khách hàng cung cấp thông tin
                tài khoản phù hợp để thực hiện hoàn tiền sau khi xác minh.
              </li>
              <li>
                ZMOMS dự kiến thực hiện hoàn tiền trong thời hạn không quá 07
                ngày làm việc kể từ ngày xác nhận đủ điều kiện hoàn tiền và nhận
                đủ thông tin cần thiết từ khách hàng, trừ trường hợp thời gian
                xử lý phụ thuộc vào ngân hàng hoặc đơn vị trung gian thanh toán.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              6. Xử lý giao dịch lỗi hoặc chưa xác định trạng thái
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                Trường hợp khách hàng đã thực hiện thanh toán nhưng hệ thống
                chưa ghi nhận trạng thái thành công, khách hàng không nên thực
                hiện thanh toán lặp lại ngay mà cần liên hệ ZMOMS để kiểm tra
                giao dịch.
              </li>
              <li>
                ZMOMS có thể yêu cầu khách hàng cung cấp thông tin giao dịch cần
                thiết như thời gian thanh toán, số tiền, mã giao dịch hoặc chứng
                từ thanh toán để đối soát.
              </li>
              <li>
                Nếu giao dịch được xác định đã thanh toán thành công, ZMOMS sẽ
                cập nhật trạng thái đơn hàng và tiếp tục xử lý theo quy định.
                Nếu giao dịch không thành công hoặc phát sinh thanh toán trùng,
                ZMOMS sẽ xử lý theo chính sách hoàn tiền.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold leading-7 text-gray-900 sm:text-xl">
              7. Thông tin liên hệ
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
              <span className="font-semibold text-gray-900">Lưu ý:</span> Thời
              gian tiền thực tế được ghi có vào tài khoản của khách hàng có thể
              phụ thuộc vào ngân hàng hoặc đơn vị trung gian thanh toán.
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}

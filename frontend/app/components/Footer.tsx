import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div>
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Thông tin doanh nghiệp
            </h3>

            <div className="space-y-2 text-sm leading-6 text-gray-600">
              <p className="break-words">
                <span className="font-medium text-gray-900">
                  CÔNG TY CỔ PHẦN ZMOMS
                </span>
              </p>

              <p>
                <span className="font-medium text-gray-900">Mã số thuế:</span>{" "}
                0111262586
              </p>

              <p>
                <span className="font-medium text-gray-900">Địa chỉ:</span>{" "}
                A3-3203, Tòa A3, Ecolife Capitol, 58 Tố Hữu, Phường Đại Mỗ,
                Thành phố Hà Nội
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Chăm sóc khách hàng
            </h3>

            <div className="space-y-2 text-sm leading-6 text-gray-600">
              <p>
                <span className="font-medium text-gray-900">Hotline:</span>{" "}
                <a
                  href="tel:0947701010"
                  className="break-all hover:text-gray-900 hover:underline"
                >
                  0947 701 010
                </a>
              </p>

              <p>
                <span className="font-medium text-gray-900">Email:</span>{" "}
                <a
                  href="mailto:edu@z-moms.com"
                  className="break-all hover:text-gray-900 hover:underline"
                >
                  edu@z-moms.com
                </a>
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Chính sách
            </h3>

            <nav className="flex flex-col gap-2 text-sm leading-6 text-gray-600">
              <Link
                href="/privacy-policy"
                className="hover:text-gray-900 hover:underline"
              >
                Chính sách bảo mật
              </Link>

              <Link
                href="/terms-and-conditions"
                className="hover:text-gray-900 hover:underline"
              >
                Điều kiện & hạn chế
              </Link>

              <Link
                href="/payment-policy"
                className="hover:text-gray-900 hover:underline"
              >
                Chính sách thanh toán
              </Link>

              <Link
                href="/price-policy"
                className="hover:text-gray-900 hover:underline"
              >
                Chính sách giá
              </Link>

              <Link
                href="/shipping-policy"
                className="hover:text-gray-900 hover:underline"
              >
                Giao hàng, đổi trả & hoàn tiền
              </Link>

              <Link
                href="/complaint-resolution"
                className="hover:text-gray-900 hover:underline"
              >
                Phản ánh & khiếu nại
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs leading-5 text-gray-500 sm:mt-10">
          © {new Date().getFullYear()} CÔNG TY CỔ PHẦN ZMOMS. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}

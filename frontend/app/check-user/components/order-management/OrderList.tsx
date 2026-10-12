import type { OrderPeriod } from "./OrderPeriodFilter";

type Props = {
  period: OrderPeriod;
};

const periodLabels: Record<OrderPeriod, string> = {
  today: "hôm nay",
  week: "tuần này",
  month: "tháng này",
  all: "toàn bộ thời gian",
};

export default function OrderList({ period }: Props) {
  return (
    <section
      aria-label="Danh sách đơn hàng"
      className="overflow-hidden rounded-2xl border border-[#E5EBF2] bg-white shadow-sm"
    >
      <div className="flex flex-col gap-1 border-b border-[#E8EDF3] px-5 py-4 sm:px-6">
        <h2 className="text-base font-bold text-[#12335B] sm:text-lg">
          Danh sách đơn hàng
        </h2>

        <p className="text-sm text-gray-500">
          Đơn hàng trong {periodLabels[period]}
        </p>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">
                Thông tin khách hàng
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                Số điện thoại
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                Ngày lên đơn
              </th>
              <th scope="col" className="px-6 py-4 font-semibold">
                Trạng thái
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan={4} className="px-6 py-16 text-center">
                <div className="mx-auto flex max-w-sm flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F8FD] text-[#18A8DC]">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-7 w-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M6 7h12l1 13H5L6 7Z" />
                      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
                    </svg>
                  </div>

                  <p className="mt-4 font-semibold text-[#12335B]">
                    Chưa có dữ liệu đơn hàng
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Các đơn hàng sẽ được hiển thị tại đây khi có dữ liệu.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="px-5 py-10 text-center md:hidden">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F8FD] text-[#18A8DC]">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 7h12l1 13H5L6 7Z" />
            <path d="M9 9V6a3 3 0 0 1 6 0v3" />
          </svg>
        </div>

        <p className="mt-3 font-semibold text-[#12335B]">
          Chưa có dữ liệu đơn hàng
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Các đơn hàng sẽ được hiển thị tại đây khi có dữ liệu.
        </p>
      </div>
    </section>
  );
}

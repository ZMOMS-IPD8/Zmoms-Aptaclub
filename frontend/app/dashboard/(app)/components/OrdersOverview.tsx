import { formatCurrency, formatNumber } from "../utils/format";

type OrdersOverviewProps = {
  total: number;
  paid: number;
  unpaid: number;
  delivered: number;
  revenue: number;
};

export default function OrdersOverview({
  total,
  paid,
  unpaid,
  delivered,
  revenue,
}: OrdersOverviewProps) {
  const paymentRate = total > 0 ? Number(((paid / total) * 100).toFixed(1)) : 0;

  const averageOrderValue = paid > 0 ? revenue / paid : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">
          Doanh thu đã thanh toán
        </p>

        <p className="mt-2 text-3xl font-bold tracking-tight text-[#173B8F]">
          {formatCurrency(revenue)}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Tổng giá trị các đơn đã thanh toán
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-2xl bg-gray-50 p-5">
          <p className="text-xs font-medium text-gray-500">Tổng đơn</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatNumber(total)}
          </p>
        </div>

        <div className="rounded-2xl bg-green-50 p-5">
          <p className="text-xs font-medium text-gray-500">Đã thanh toán</p>

          <p className="mt-2 text-2xl font-bold text-green-700">
            {formatNumber(paid)}
          </p>
        </div>

        <div className="rounded-2xl bg-orange-50 p-5">
          <p className="text-xs font-medium text-gray-500">Chưa thanh toán</p>

          <p className="mt-2 text-2xl font-bold text-orange-700">
            {formatNumber(unpaid)}
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-5">
          <p className="text-xs font-medium text-gray-500">Tỷ lệ thanh toán</p>

          <p className="mt-2 text-2xl font-bold text-[#173B8F]">
            {paymentRate}%
          </p>
        </div>

        <div className="rounded-2xl bg-green-50 p-5">
          <p className="text-xs font-medium text-gray-500">
            Đã giao thành công
          </p>

          <p className="mt-2 text-2xl font-bold text-green-700">
            {formatNumber(delivered)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">
            Giá trị đơn trung bình
          </p>

          <p className="mt-2 text-xl font-bold text-gray-900">
            {formatCurrency(averageOrderValue)}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">
            Doanh thu / tổng đơn
          </p>

          <p className="mt-2 text-xl font-bold text-gray-900">
            {formatCurrency(total > 0 ? revenue / total : 0)}
          </p>
        </div>
      </div>
    </div>
  );
}

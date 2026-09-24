import { formatCurrency, formatNumber } from "../utils/format";

type OrdersOverviewProps = {
  total: number;
  paid: number;
  unpaid: number;
  delivered: number;
  revenue: number;
  touchpoints: Record<string, number>;
};

function getTopTouchpoints(
  data: Record<string, number>,
  limit = 5,
): [string, number][] {
  return Object.entries(data)
    .filter(([label]) => label.trim() !== "")
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);
}

export default function OrdersOverview({
  total,
  paid,
  unpaid,
  delivered,
  revenue,
  touchpoints,
}: OrdersOverviewProps) {
  const paymentRate = total > 0 ? Number(((paid / total) * 100).toFixed(1)) : 0;

  const deliveryRate =
    total > 0 ? Number(((delivered / total) * 100).toFixed(1)) : 0;

  const averageOrderValue = paid > 0 ? revenue / paid : 0;

  const topTouchpoints = getTopTouchpoints(touchpoints);

  const touchpointTotal = topTouchpoints.reduce(
    (sum, [, count]) => sum + count,
    0,
  );

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

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Touchpoint</h3>

            <p className="mt-1 text-xs text-gray-400">
              Nguồn mua hàng của Co-Sell
            </p>
          </div>

          <span className="rounded-lg bg-[#EEF3FF] px-2.5 py-1 text-xs font-semibold text-[#173B8F]">
            {formatNumber(touchpointTotal)}
          </span>
        </div>

        <div className="space-y-3">
          {topTouchpoints.length > 0 ? (
            topTouchpoints.map(([label, count]) => {
              const percentage =
                touchpointTotal > 0 ? (count / touchpointTotal) * 100 : 0;

              return (
                <div key={label}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span
                      className="min-w-0 truncate text-sm text-gray-600"
                      title={label}
                    >
                      {label}
                    </span>

                    <span className="shrink-0 text-sm font-bold text-gray-900">
                      {formatNumber(count)}
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#173B8F]"
                      style={{
                        width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-6 text-center text-sm text-gray-400">
              Chưa có dữ liệu Touchpoint.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">
              Tỷ lệ giao hàng thành công
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Đã giao thành công / Tổng đơn
            </p>
          </div>

          <span className="text-xl font-bold text-green-700">
            {deliveryRate}%
          </span>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-600 transition-all"
            style={{
              width: `${Math.min(Math.max(deliveryRate, 0), 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

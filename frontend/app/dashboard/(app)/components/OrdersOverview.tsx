import { formatNumber } from "../utils/format";

type OrdersOverviewProps = {
  total: number;
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
  touchpoints,
}: OrdersOverviewProps) {
  const topTouchpoints = getTopTouchpoints(touchpoints);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Đơn hàng hoàn thành</p>

        <p className="mt-2 text-3xl font-bold tracking-tight text-[#173B8F]">
          {formatNumber(total)}
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Tổng số đơn hàng đã hoàn thành
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Kênh chuyển đổi</h3>

            <p className="mt-1 text-xs text-gray-400">
              Nguồn mua hàng của các đơn hàng hoàn thành
            </p>
          </div>

          <span className="rounded-lg bg-[#EEF3FF] px-2.5 py-1 text-xs font-semibold text-[#173B8F]">
            100%
          </span>
        </div>

        <div className="space-y-3">
          {topTouchpoints.length > 0 ? (
            topTouchpoints.map(([label, count]) => {
              const percentage = total > 0 ? (count / total) * 100 : 0;

              return (
                <div key={label}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span
                      className="min-w-0 truncate text-sm text-gray-600"
                      title={label}
                    >
                      {label}
                    </span>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {formatNumber(count)}
                      </span>

                      <span className="text-xs text-gray-400">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
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
              Chưa có dữ liệu kênh chuyển đổi.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

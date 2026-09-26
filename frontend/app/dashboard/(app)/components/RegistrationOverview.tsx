import { formatNumber } from "../utils/format";

type RegistrationOverviewProps = {
  date: string;
  total: number;
  byProvince: Record<string, number>;
  bySource: Record<string, number>;
};

function getTopItems(data: Record<string, number>, limit = 5) {
  return Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);
}

function formatDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return value;
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
}

function BreakdownCard({
  title,
  data,
  subtitle,
}: {
  title: string;
  data: [string, number][];
  subtitle: string;
}) {
  const total = data.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>

          <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
        </div>

        <span className="rounded-lg bg-[#EEF3FF] px-2.5 py-1 text-xs font-semibold text-[#173B8F]">
          {formatNumber(total)}
        </span>
      </div>

      <div className="space-y-3">
        {data.length > 0 ? (
          data.map(([label, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm text-gray-600">
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
            Chưa có dữ liệu.
          </p>
        )}
      </div>
    </div>
  );
}

export default function RegistrationOverview({
  date,
  total,
  byProvince,
  bySource,
}: RegistrationOverviewProps) {
  const provinces = getTopItems(byProvince, 5);
  const sources = getTopItems(bySource, 5);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Co-Data hôm nay</p>

            <p className="mt-1 text-xs text-gray-400">
              Ngày đăng ký: {formatDate(date)}
            </p>
          </div>

          <p className="text-4xl font-bold text-[#173B8F]">
            {formatNumber(total)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BreakdownCard
          title="Theo tỉnh / thành"
          data={provinces}
          subtitle={`Top ${provinces.length} nhóm trong ngày`}
        />

        <BreakdownCard
          title="Theo Event"
          data={sources}
          subtitle={`Top ${sources.length} nhóm trong ngày`}
        />
      </div>
    </div>
  );
}

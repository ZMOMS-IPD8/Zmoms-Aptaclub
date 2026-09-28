import { formatNumber } from "../utils/format";

type RegistrationData = {
  total: number;
  byProvince: Record<string, number>;
  bySource: Record<string, number>;
};

type RegistrationOverviewProps = {
  today: RegistrationData & {
    date: string;
  };
  total: RegistrationData;
};

function getAllItems(data: Record<string, number>) {
  return Object.entries(data).sort(([, a], [, b]) => b - a);
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
  total,
}: {
  title: string;
  data: [string, number][];
  subtitle: string;
  total: number;
}) {
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
                  <span
                    className="min-w-0 truncate text-sm text-gray-600"
                    title={label}
                  >
                    {label || "—"}
                  </span>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {percentage.toFixed(1)}%
                    </span>

                    <span className="text-sm font-bold text-gray-900">
                      {formatNumber(count)}
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
            Chưa có dữ liệu.
          </p>
        )}
      </div>
    </div>
  );
}

function RegistrationSection({
  title,
  date,
  total,
  byProvince,
  bySource,
}: {
  title: string;
  date?: string;
  total: number;
  byProvince: Record<string, number>;
  bySource: Record<string, number>;
}) {
  const provinces = getAllItems(byProvince);
  const sources = getAllItems(bySource);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>

          {date ? (
            <p className="mt-1 text-xs text-gray-400">
              Ngày đăng ký: {formatDate(date)}
            </p>
          ) : (
            <p className="mt-1 text-xs text-gray-400">
              Tất cả dữ liệu đã đăng ký
            </p>
          )}
        </div>

        <div className="rounded-xl bg-white px-4 py-2 shadow-sm">
          <p className="text-xs text-gray-400">Tổng Co-Data</p>

          <p className="text-2xl font-bold text-[#173B8F]">
            {formatNumber(total)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BreakdownCard
          title="Theo tỉnh / thành"
          data={provinces}
          total={total}
          subtitle={`${provinces.length} tỉnh / thành`}
        />

        <BreakdownCard
          title="Theo Event"
          data={sources}
          total={total}
          subtitle={`${sources.length} nguồn / Event`}
        />
      </div>
    </div>
  );
}

export default function RegistrationOverview({
  today,
  total,
}: RegistrationOverviewProps) {
  return (
    <div className="space-y-5">
      <RegistrationSection
        title="Hôm nay"
        date={today.date}
        total={today.total}
        byProvince={today.byProvince}
        bySource={today.bySource}
      />

      <RegistrationSection
        title="Tổng toàn bộ dữ liệu"
        total={total.total}
        byProvince={total.byProvince}
        bySource={total.bySource}
      />
    </div>
  );
}

import type { DashboardLead } from "../types/dashboard";
import { formatEmpty, formatNumber } from "../utils/format";

type LeadsTableProps = {
  entries: DashboardLead[];
  totalEntries: number;
};

function getLeadName(lead: DashboardLead): string {
  return (
    String(lead.ho_va_ten_lien_he ?? "").trim() ||
    String(lead.name ?? "").trim() ||
    "—"
  );
}

function getLeadPhone(lead: DashboardLead): string {
  return (
    String(lead.so_dien_thoai_dang_ky ?? "").trim() ||
    String(lead.phone_number ?? "").trim() ||
    "—"
  );
}

function getLeadField(lead: DashboardLead, field: string): string {
  const value = lead[field];

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && "value" in value) {
    return String((value as { value?: unknown }).value ?? "").trim();
  }

  return "";
}

export default function LeadsTable({ entries, totalEntries }: LeadsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Lead chưa đăng ký</h3>

          <p className="mt-1 text-sm text-gray-500">
            Các record chưa có thời gian đăng ký trên Pancake CRM.
          </p>
        </div>

        <div className="rounded-xl bg-orange-50 px-4 py-2 text-sm">
          <span className="text-orange-600">Tổng Lead</span>

          <strong className="ml-2 text-orange-700">
            {formatNumber(totalEntries)}
          </strong>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-gray-50">
            <tr className="text-xs uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3 font-medium">Khách hàng</th>
              <th className="px-4 py-3 font-medium">SĐT</th>
              <th className="px-4 py-3 font-medium">Tỉnh / thành</th>
              <th className="px-4 py-3 font-medium">Nguồn</th>
              <th className="px-4 py-3 font-medium">Tình trạng mẹ</th>
              <th className="px-4 py-3 font-medium">Mã giới thiệu</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {entries.length > 0 ? (
              entries.map((lead, index) => {
                const id =
                  String(lead.id ?? "").trim() ||
                  String(lead.lead_id ?? "").trim() ||
                  String(lead.record_id ?? "").trim() ||
                  `lead-${index}`;

                return (
                  <tr
                    key={id}
                    className="border-t border-gray-50 hover:bg-gray-50/70"
                  >
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {getLeadName(lead)}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {getLeadPhone(lead)}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {formatEmpty(getLeadField(lead, "thanh_pho"))}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {formatEmpty(getLeadField(lead, "nguon_dang_ky"))}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {formatEmpty(getLeadField(lead, "tinh_trang_me"))}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {formatEmpty(getLeadField(lead, "ma_gioi_thieu_dang_ky"))}
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                        Chưa đăng ký
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  Không còn Lead chưa đăng ký.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

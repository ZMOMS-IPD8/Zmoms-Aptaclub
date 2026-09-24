import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import type { Lead } from "../types";

type LeadTableProps = {
  leads: Lead[];
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

function getValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object" && value !== null && "value" in value) {
    return String((value as { value?: unknown }).value ?? "");
  }

  return String(value);
}

function getLeadName(lead: Lead): string {
  return (
    getValue(lead.ho_va_ten_lien_he) || getValue(lead.name) || "Chưa có tên"
  );
}

function getLeadPhone(lead: Lead): string {
  return (
    getValue(lead.so_dien_thoai_dang_ky) ||
    getValue(lead.phone_number) ||
    "Chưa có SĐT"
  );
}

function getLeadProvince(lead: Lead): string {
  return getValue(lead.thanh_pho) || "Chưa có";
}

function getLeadSource(lead: Lead): string {
  return getValue(lead.nguon_dang_ky) || "Chưa xác định";
}

function getReferralCode(lead: Lead): string {
  return getValue(lead.ma_gioi_thieu_dang_ky) || "—";
}

function getMotherStatus(lead: Lead): string {
  return getValue(lead.tinh_trang_me) || "Chưa xác định";
}

function getStatus(lead: Lead): string {
  return getValue(lead.status) || "Mới";
}

export default function LeadTable({
  leads,
  filteredCount,
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
}: LeadTableProps) {
  const startIndex = filteredCount === 0 ? 0 : (currentPage - 1) * 20 + 1;

  const endIndex = Math.min(currentPage * 20, filteredCount);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">Danh sách Lead</h2>

          <p className="mt-1 text-xs text-slate-500">
            {filteredCount.toLocaleString("vi-VN")} Lead
          </p>
        </div>

        <div className="rounded-lg bg-[#EEF3FF] px-3 py-1.5 text-xs font-medium text-[#173B8F]">
          Chưa có thời gian đăng ký
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="flex h-80 flex-col items-center justify-center text-center">
          <Users className="mb-3 h-10 w-10 text-slate-300" />

          <p className="font-medium text-slate-600">Không có Lead phù hợp</p>

          <p className="mt-1 text-sm text-slate-400">
            Thử thay đổi điều kiện tìm kiếm hoặc bộ lọc.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Khách hàng</th>
                  <th className="px-5 py-3">Số điện thoại</th>
                  <th className="px-5 py-3">Tỉnh / TP</th>
                  <th className="px-5 py-3">Nguồn</th>
                  <th className="px-5 py-3">Referral Code</th>
                  <th className="px-5 py-3">Tình trạng mẹ</th>
                  <th className="px-5 py-3">Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead, index) => (
                  <tr
                    key={`${getValue(lead.id) || "lead"}-${index}`}
                    className="border-b border-slate-50 transition hover:bg-[#F8FAFF]"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {getLeadName(lead)}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {getLeadPhone(lead)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {getLeadProvince(lead)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {getLeadSource(lead)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {getReferralCode(lead) === "—" ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <span className="rounded-lg bg-[#EEF3FF] px-2.5 py-1 text-xs font-semibold text-[#173B8F]">
                          {getReferralCode(lead)}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {getMotherStatus(lead)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {getStatus(lead)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <p className="text-sm text-slate-500">
              Hiển thị{" "}
              <span className="font-medium text-slate-700">{startIndex}</span>
              {" – "}
              <span className="font-medium text-slate-700">{endIndex}</span>
              {" / "}
              <span className="font-medium text-slate-700">
                {filteredCount.toLocaleString("vi-VN")}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPreviousPage}
                disabled={currentPage === 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#173B8F] hover:text-[#173B8F] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="min-w-16 text-center text-sm text-slate-600">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={onNextPage}
                disabled={currentPage === totalPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#173B8F] hover:text-[#173B8F] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

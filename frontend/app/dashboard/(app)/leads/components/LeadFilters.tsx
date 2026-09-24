import { Search } from "lucide-react";

type LeadFiltersProps = {
  search: string;
  source: string;
  province: string;
  motherStatus: string;
  referralCode: string;
  sources: string[];
  provinces: string[];
  motherStatuses: string[];
  referralCodes: string[];
  onSearchChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onMotherStatusChange: (value: string) => void;
  onReferralCodeChange: (value: string) => void;
};

export default function LeadFilters({
  search,
  source,
  province,
  motherStatus,
  referralCode,
  sources,
  provinces,
  motherStatuses,
  referralCodes,
  onSearchChange,
  onSourceChange,
  onProvinceChange,
  onMotherStatusChange,
  onReferralCodeChange,
}: LeadFiltersProps) {
  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm tên hoặc số điện thoại..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-[#173B8F] focus:bg-white"
          />
        </div>

        <FilterSelect
          value={source}
          onChange={onSourceChange}
          placeholder="Tất cả nguồn"
          options={sources}
        />

        <FilterSelect
          value={province}
          onChange={onProvinceChange}
          placeholder="Tất cả tỉnh/thành"
          options={provinces}
        />

        <FilterSelect
          value={motherStatus}
          onChange={onMotherStatusChange}
          placeholder="Tất cả tình trạng mẹ"
          options={motherStatuses}
        />

        <FilterSelect
          value={referralCode}
          onChange={onReferralCodeChange}
          placeholder="Tất cả Referral Code"
          options={referralCodes}
        />
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-[#173B8F] focus:bg-white"
    >
      <option value="all">{placeholder}</option>

      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

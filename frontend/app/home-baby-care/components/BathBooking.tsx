"use client";

import { useEffect, useState } from "react";
import type { BathBookingData, Member } from "../page";

type Props = {
  member: Member;
  loading: boolean;
  error: string;
  onComplete: (booking: BathBookingData) => void;
  onBack: () => void;
  onLoadingChange: (loading: boolean) => void;
  onError: (error: string) => void;
};

type Province = {
  code: number;
  name: string;
};

type District = {
  code: number;
  name: string;
};

type Ward = {
  code: number;
  name: string;
};

const API_URL = "https://provinces.open-api.vn/api/v1";

export default function BathBooking({
  member,
  loading,
  error,
  onComplete,
  onBack,
  onLoadingChange,
  onError,
}: Props) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [provinceCode, setProvinceCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [wardCode, setWardCode] = useState("");

  const [addressDetail, setAddressDetail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    const loadProvinces = async () => {
      setAddressLoading(true);

      try {
        const response = await fetch(`${API_URL}/p/`);

        if (!response.ok) {
          throw new Error();
        }

        const data: Province[] = await response.json();
        setProvinces(data);
      } catch {
        onError("Không thể tải danh sách tỉnh/thành phố.");
      } finally {
        setAddressLoading(false);
      }
    };

    loadProvinces();
  }, [onError]);

  const handleProvinceChange = async (value: string) => {
    onError("");

    setProvinceCode(value);
    setDistrictCode("");
    setWardCode("");
    setDistricts([]);
    setWards([]);

    if (!value) {
      return;
    }

    setAddressLoading(true);

    try {
      const response = await fetch(`${API_URL}/p/${value}?depth=2`);

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setDistricts(data.districts ?? []);
    } catch {
      onError("Không thể tải danh sách quận/huyện.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDistrictChange = async (value: string) => {
    onError("");

    setDistrictCode(value);
    setWardCode("");
    setWards([]);

    if (!value) {
      return;
    }

    setAddressLoading(true);

    try {
      const response = await fetch(`${API_URL}/d/${value}?depth=2`);

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setWards(data.wards ?? []);
    } catch {
      onError("Không thể tải danh sách phường/xã.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSubmit = async () => {
    onError("");

    if (!provinceCode) {
      onError("Mẹ vui lòng chọn tỉnh/thành phố.");
      return;
    }

    if (!districtCode) {
      onError("Mẹ vui lòng chọn quận/huyện.");
      return;
    }

    if (!wardCode) {
      onError("Mẹ vui lòng chọn phường/xã.");
      return;
    }

    if (!addressDetail.trim()) {
      onError("Mẹ vui lòng nhập số nhà, tên đường.");
      return;
    }

    if (!date) {
      onError("Mẹ vui lòng chọn ngày dự kiến chăm sóc.");
      return;
    }

    if (!time) {
      onError("Mẹ vui lòng chọn thời gian dự kiến chăm sóc.");
      return;
    }

    const province = provinces.find(
      (item) => String(item.code) === provinceCode,
    );

    const district = districts.find(
      (item) => String(item.code) === districtCode,
    );

    const ward = wards.find((item) => String(item.code) === wardCode);

    if (!province || !district || !ward) {
      onError("Thông tin địa chỉ không hợp lệ.");
      return;
    }

    const address = [
      addressDetail.trim(),
      ward.name,
      district.name,
      province.name,
    ].join(", ");

    const booking: BathBookingData = {
      address,
      date,
      time,
    };

    onLoadingChange(true);

    try {
      const response = await fetch("/api/bath-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: member.leadId,
          phone: member.phone,
          booking,
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        onError(
          data?.message ||
            "Mẹ đã đăng ký buổi tư vấn và chăm sóc tại nhà trước đó.",
        );
        return;
      }

      if (!response.ok) {
        onError(
          data?.message ||
            "Không thể đăng ký buổi tư vấn và chăm sóc. Mẹ vui lòng thử lại.",
        );
        return;
      }

      onComplete(booking);
    } catch {
      onError("Không thể gửi thông tin lúc này. Mẹ vui lòng thử lại.");
    } finally {
      onLoadingChange(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
          Thông tin hội viên
        </p>

        <h2 className="mt-1 text-xl font-extrabold text-[#12335B]">
          Xin chào mẹ {member.name}
        </h2>

        <div className="mt-5 divide-y divide-[#EDF1F5] rounded-2xl border border-[#E4EAF0]">
          <div className="flex items-start justify-between gap-5 px-4 py-3.5">
            <span className="text-sm text-gray-500">Họ tên</span>

            <span className="text-right text-sm font-semibold text-[#12335B]">
              {member.name}
            </span>
          </div>

          <div className="flex items-start justify-between gap-5 px-4 py-3.5">
            <span className="text-sm text-gray-500">Số điện thoại</span>

            <span className="text-right text-sm font-semibold text-[#12335B]">
              {member.phone}
            </span>
          </div>

          {member.province && (
            <div className="flex items-start justify-between gap-5 px-4 py-3.5">
              <span className="text-sm text-gray-500">Tỉnh thành</span>

              <span className="text-right text-sm font-semibold text-[#12335B]">
                {member.province}
              </span>
            </div>
          )}

          {member.dueDate && (
            <div className="flex items-start justify-between gap-5 px-4 py-3.5">
              <span className="text-sm text-gray-500">Ngày dự sinh</span>

              <span className="text-right text-sm font-semibold text-[#12335B]">
                {formatDisplayDate(member.dueDate)}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-bold uppercase tracking-wide text-[#18A8DC]">
          Đăng ký buổi chăm sóc
        </p>

        <h2 className="mt-1 text-xl font-extrabold text-[#12335B]">
          Thông tin buổi tư vấn và chăm sóc tại nhà
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Mẹ vui lòng chọn địa chỉ và thời gian dự kiến để nhân viên sắp xếp
          buổi tư vấn và chăm sóc chuyên sâu Mẹ và Bé tại nhà (45 phút).
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="bath-province"
              className="text-sm font-semibold leading-6 text-[#12335B]"
            >
              Tỉnh / Thành phố
            </label>

            <select
              id="bath-province"
              value={provinceCode}
              disabled={addressLoading}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="mt-3 h-12 w-full rounded-xl border border-[#D8E1EB] bg-white px-4 text-sm text-[#12335B] outline-none focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option value="">
                {addressLoading ? "Đang tải..." : "Chọn tỉnh / thành phố"}
              </option>

              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bath-district"
              className="text-sm font-semibold leading-6 text-[#12335B]"
            >
              Quận / Huyện
            </label>

            <select
              id="bath-district"
              value={districtCode}
              disabled={!provinceCode || addressLoading}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="mt-3 h-12 w-full rounded-xl border border-[#D8E1EB] bg-white px-4 text-sm text-[#12335B] outline-none focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option value="">
                {!provinceCode
                  ? "Chọn tỉnh / thành phố trước"
                  : addressLoading
                    ? "Đang tải..."
                    : "Chọn quận / huyện"}
              </option>

              {districts.map((district) => (
                <option key={district.code} value={district.code}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bath-ward"
              className="text-sm font-semibold leading-6 text-[#12335B]"
            >
              Phường / Xã
            </label>

            <select
              id="bath-ward"
              value={wardCode}
              disabled={!districtCode || addressLoading}
              onChange={(e) => {
                onError("");
                setWardCode(e.target.value);
              }}
              className="mt-3 h-12 w-full rounded-xl border border-[#D8E1EB] bg-white px-4 text-sm text-[#12335B] outline-none focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option value="">
                {!districtCode
                  ? "Chọn quận / huyện trước"
                  : addressLoading
                    ? "Đang tải..."
                    : "Chọn phường / xã"}
              </option>

              {wards.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bath-address-detail"
              className="text-sm font-semibold leading-6 text-[#12335B]"
            >
              Số nhà, tên đường
            </label>

            <input
              id="bath-address-detail"
              type="text"
              value={addressDetail}
              onChange={(e) => {
                onError("");
                setAddressDetail(e.target.value);
              }}
              placeholder="Ví dụ: 123 Nguyễn Trãi"
              className="mt-3 h-12 w-full rounded-xl border border-[#D8E1EB] px-4 text-sm text-[#12335B] outline-none placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10"
            />
          </div>

          <div>
            <label
              htmlFor="bath-date"
              className="text-sm font-semibold leading-6 text-[#12335B]"
            >
              Ngày dự kiến chăm sóc
            </label>

            <input
              id="bath-date"
              type="date"
              value={date}
              min={today}
              onChange={(e) => {
                onError("");
                setDate(e.target.value);
              }}
              className="mt-3 h-12 w-full rounded-xl border border-[#D8E1EB] px-4 text-sm text-[#12335B] outline-none focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10"
            />
          </div>

          <div>
            <label
              htmlFor="bath-time"
              className="text-sm font-semibold leading-6 text-[#12335B]"
            >
              Thời gian dự kiến chăm sóc
            </label>

            <input
              id="bath-time"
              type="time"
              value={time}
              onChange={(e) => {
                onError("");
                setTime(e.target.value);
              }}
              className="mt-3 h-12 w-full rounded-xl border border-[#D8E1EB] px-4 text-sm text-[#12335B] outline-none focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10"
            />
          </div>
        </div>

        {provinceCode && districtCode && wardCode && addressDetail.trim() && (
          <div className="mt-5 rounded-2xl bg-[#F5F9FC] p-4">
            <p className="text-xs font-semibold text-gray-500">
              Địa chỉ sẽ được ghi nhận
            </p>

            <p className="mt-1 text-sm font-semibold leading-6 text-[#12335B]">
              {addressDetail.trim()},{" "}
              {wards.find((item) => String(item.code) === wardCode)?.name},{" "}
              {
                districts.find((item) => String(item.code) === districtCode)
                  ?.name
              }
              ,{" "}
              {
                provinces.find((item) => String(item.code) === provinceCode)
                  ?.name
              }
            </p>
          </div>
        )}

        {error && (
          <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || addressLoading}
          className="mt-6 h-12 w-full rounded-xl bg-[#12335B] text-sm font-bold text-white transition hover:bg-[#0D2949] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "ĐANG GỬI..." : "XÁC NHẬN ĐĂNG KÝ"}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="mt-3 h-10 w-full text-sm font-bold text-gray-500 hover:text-[#12335B]"
        >
          ← Quay lại
        </button>
      </section>
    </div>
  );
}

function formatDisplayDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return value;
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
}

"use client";

import { useEffect, useState } from "react";

type Province = {
  code: number;
  name: string;
};

type Ward = {
  code: number;
  name: string;
};

type ShippingData = {
  fullName: string;
  phone: string;
  country: string;
  province: string;
  commune: string;
  address: string;
};

type Props = {
  initialPhone: string;
  submitting?: boolean;
  onSubmit: (data: ShippingData) => void | Promise<void>;
};

export default function ShippingForm({
  initialPhone,
  submitting = false,
  onSubmit,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState(initialPhone);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [provinceCode, setProvinceCode] = useState("");
  const [province, setProvince] = useState("");

  const [wardCode, setWardCode] = useState("");
  const [commune, setCommune] = useState("");

  const [address, setAddress] = useState("");

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true);

        const response = await fetch("https://provinces.open-api.vn/api/v2/p/");

        if (!response.ok) {
          throw new Error("Failed to fetch provinces");
        }

        const data: Province[] = await response.json();

        if (!cancelled) {
          const sortedProvinces = [...data].sort((a, b) =>
            a.name.localeCompare(b.name, "vi"),
          );

          setProvinces(sortedProvinces);
          setLoadingProvinces(false);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Không thể tải danh sách tỉnh/thành phố. Mẹ vui lòng thử lại.",
          );
          setLoadingProvinces(false);
        }
      }
    };

    fetchProvinces();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!provinceCode) {
      return;
    }

    const controller = new AbortController();

    const fetchWards = async () => {
      try {
        setLoadingWards(true);

        const response = await fetch(
          `https://provinces.open-api.vn/api/v2/w/?province=${provinceCode}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch wards");
        }

        const data: Ward[] = await response.json();

        if (!controller.signal.aborted) {
          const sortedWards = [...data].sort((a, b) =>
            a.name.localeCompare(b.name, "vi"),
          );

          setWards(sortedWards);
          setLoadingWards(false);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (!controller.signal.aborted) {
          setWards([]);
          setLoadingWards(false);
          setError("Không thể tải danh sách phường/xã. Mẹ vui lòng thử lại.");
        }
      }
    };

    fetchWards();

    return () => {
      controller.abort();
    };
  }, [provinceCode]);

  const handleProvinceChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const code = event.target.value;

    const selectedProvince = provinces.find(
      (item) => String(item.code) === code,
    );

    setProvinceCode(code);
    setProvince(selectedProvince?.name || "");

    setWardCode("");
    setCommune("");
    setWards([]);

    setError("");
  };

  const handleWardChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const code = event.target.value;

    const selectedWard = wards.find((item) => String(item.code) === code);

    setWardCode(code);
    setCommune(selectedWard?.name || "");

    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");

    if (!fullName.trim()) {
      setError("Mẹ vui lòng nhập họ và tên.");
      return;
    }

    if (!phone.trim()) {
      setError("Mẹ vui lòng nhập số điện thoại.");
      return;
    }

    if (!provinceCode || !province) {
      setError("Mẹ vui lòng chọn Tỉnh / Thành phố.");
      return;
    }

    if (!wardCode || !commune) {
      setError("Mẹ vui lòng chọn Phường / Xã.");
      return;
    }

    if (!address.trim()) {
      setError("Mẹ vui lòng nhập địa chỉ nhận hàng.");
      return;
    }

    await onSubmit({
      fullName: fullName.trim(),
      phone: phone.trim(),
      country: "Việt Nam",
      province,
      commune,
      address: address.trim(),
    });
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-base font-extrabold text-[#12335B] sm:text-lg">
          THÔNG TIN NHẬN HÀNG
        </h2>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          Mẹ vui lòng điền đầy đủ thông tin để Zmoms gửi combo đến mẹ.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="shipping-fullName"
            className="mb-1.5 block text-xs font-bold text-gray-700"
          >
            Họ và tên
          </label>

          <input
            id="shipping-fullName"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Nhập họ và tên"
            required
            autoComplete="name"
            disabled={submitting}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#12335B] disabled:bg-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="shipping-phone"
            className="mb-1.5 block text-xs font-bold text-gray-700"
          >
            Số điện thoại giao hàng
          </label>

          <input
            id="shipping-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Nhập số điện thoại nhận hàng"
            required
            autoComplete="tel"
            inputMode="tel"
            disabled={submitting}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#12335B] disabled:bg-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="shipping-province"
            className="mb-1.5 block text-xs font-bold text-gray-700"
          >
            Tỉnh / Thành phố
          </label>

          <select
            id="shipping-province"
            value={provinceCode}
            onChange={handleProvinceChange}
            required
            disabled={loadingProvinces || submitting}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#12335B] disabled:bg-gray-100"
          >
            <option value="">
              {loadingProvinces
                ? "Đang tải tỉnh/thành phố..."
                : "Chọn Tỉnh / Thành phố"}
            </option>

            {provinces.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="shipping-ward"
            className="mb-1.5 block text-xs font-bold text-gray-700"
          >
            Phường / Xã
          </label>

          <select
            id="shipping-ward"
            value={wardCode}
            onChange={handleWardChange}
            required
            disabled={!provinceCode || loadingWards || submitting}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#12335B] disabled:bg-gray-100"
          >
            <option value="">
              {loadingWards
                ? "Đang tải phường/xã..."
                : !provinceCode
                  ? "Vui lòng chọn tỉnh/thành phố trước"
                  : "Chọn Phường / Xã"}
            </option>

            {wards.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="shipping-address"
            className="mb-1.5 block text-xs font-bold text-gray-700"
          >
            Địa chỉ nhận hàng
          </label>

          <textarea
            id="shipping-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Số nhà, tên đường, tòa nhà..."
            required
            rows={3}
            autoComplete="street-address"
            disabled={submitting}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#12335B] disabled:bg-gray-100"
          />
        </div>

        {province && commune && address && (
          <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">
            <p className="text-[11px] font-bold text-gray-500">
              ĐỊA CHỈ NHẬN HÀNG
            </p>

            <p className="mt-1 text-sm leading-5 text-[#12335B]">
              {address.trim()}, {commune}, {province}, Việt Nam
            </p>
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[#12335B] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#0D2949] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "ĐANG CẬP NHẬT..." : "XÁC NHẬN THÔNG TIN NHẬN HÀNG"}
        </button>
      </form>
    </section>
  );
}

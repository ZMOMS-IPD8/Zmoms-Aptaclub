"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchProvinces,
  fetchWards,
  getUnitLabel,
  type AdministrativeUnit,
} from "./order-address";

type OrderFormProps = {
  receiverName: string;
  shippingPhone: string;
  shippingAddress: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  onReceiverNameChange: (value: string) => void;
  onShippingPhoneChange: (value: string) => void;
  onShippingAddressChange: (value: string) => void;
  onSubmit: (
    salesSource: string,
    bank: string,
    fullShippingAddress: string,
  ) => void | Promise<void>;
};

const SALES_SOURCES = ["PG", "SPA", "Tiêm Chủng", "Nữ Hộ Sinh"];
const BANKS = ["Techcombank", "Vietcombank"];

const inputClass =
  "h-12 w-full rounded-xl border border-[#D8E1EB] bg-white px-4 text-sm font-medium text-[#12335B] outline-none transition placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10 disabled:cursor-not-allowed disabled:bg-gray-100";

const labelClass = "mb-2 block text-sm font-semibold text-[#12335B]";

export default function OrderForm({
  receiverName,
  shippingPhone,
  shippingAddress,
  disabled = false,
  loading = false,
  error = "",
  onReceiverNameChange,
  onShippingPhoneChange,
  onShippingAddressChange,
  onSubmit,
}: OrderFormProps) {
  const [provinces, setProvinces] = useState<AdministrativeUnit[]>([]);
  const [wards, setWards] = useState<AdministrativeUnit[]>([]);

  const [province, setProvince] = useState("");
  const [ward, setWard] = useState("");
  const [salesSource, setSalesSource] = useState("");
  const [bank, setBank] = useState("");

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);

  const [provinceError, setProvinceError] = useState("");
  const [wardError, setWardError] = useState("");
  const [formError, setFormError] = useState("");

  const provinceRequestRef = useRef<AbortController | null>(null);
  const wardRequestRef = useRef<AbortController | null>(null);

  const isDisabled = disabled || loading;

  const loadProvinces = useCallback(async (controller: AbortController) => {
    try {
      const data = await fetchProvinces(controller.signal);

      if (controller.signal.aborted) return;

      setProvinces(data);
      setProvinceError("");

      if (data.length === 0) {
        setProvinceError(
          "Chưa có dữ liệu tỉnh/thành phố. Vui lòng thử tải lại.",
        );
      }
    } catch {
      if (!controller.signal.aborted) {
        setProvinces([]);
        setProvinceError(
          "Chưa tải được danh sách tỉnh/thành phố. Vui lòng thử lại.",
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoadingProvinces(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    provinceRequestRef.current = controller;

    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        void loadProvinces(controller);
      }
    });

    return () => {
      controller.abort();
      wardRequestRef.current?.abort();
    };
  }, [loadProvinces]);

  useEffect(() => {
    return () => {
      provinceRequestRef.current?.abort();
      wardRequestRef.current?.abort();
    };
  }, []);

  const handleRetryProvinces = async () => {
    if (isDisabled) return;

    provinceRequestRef.current?.abort();
    wardRequestRef.current?.abort();

    const controller = new AbortController();
    provinceRequestRef.current = controller;

    setLoadingProvinces(true);
    setLoadingWards(false);
    setProvinceError("");
    setWardError("");
    setProvinces([]);
    setWards([]);
    setProvince("");
    setWard("");
    setFormError("");

    await loadProvinces(controller);
  };

  const handleProvinceChange = async (value: string) => {
    wardRequestRef.current?.abort();
    wardRequestRef.current = null;

    setProvince(value);
    setWard("");
    setWards([]);
    setWardError("");
    setFormError("");
    setLoadingWards(false);

    if (!value) return;

    const selectedProvince = provinces.find(
      (item) => String(item.code) === value,
    );

    if (!selectedProvince) {
      setWardError("Tỉnh/thành phố đã chọn không hợp lệ.");
      return;
    }

    const controller = new AbortController();
    wardRequestRef.current = controller;

    setLoadingWards(true);

    try {
      const data = await fetchWards(value, controller.signal);

      if (controller.signal.aborted || wardRequestRef.current !== controller) {
        return;
      }

      setWards(data);

      if (data.length === 0) {
        setWardError("Chưa có dữ liệu phường/xã. Vui lòng thử tải lại.");
      }
    } catch {
      if (!controller.signal.aborted && wardRequestRef.current === controller) {
        setWards([]);
        setWardError("Chưa tải được danh sách phường/xã. Vui lòng thử lại.");
      }
    } finally {
      if (wardRequestRef.current === controller) {
        setLoadingWards(false);
        wardRequestRef.current = null;
      }
    }
  };

  const handleRetryWards = async () => {
    if (isDisabled || !province || loadingProvinces) return;

    const selectedProvince = provinces.find(
      (item) => String(item.code) === province,
    );

    if (!selectedProvince) {
      setWardError("Vui lòng chọn lại tỉnh/thành phố.");
      return;
    }

    wardRequestRef.current?.abort();

    const controller = new AbortController();
    wardRequestRef.current = controller;

    setLoadingWards(true);
    setWardError("");
    setWard("");
    setWards([]);
    setFormError("");

    try {
      const data = await fetchWards(province, controller.signal);

      if (controller.signal.aborted || wardRequestRef.current !== controller) {
        return;
      }

      setWards(data);

      if (data.length === 0) {
        setWardError("Chưa có dữ liệu phường/xã. Vui lòng kiểm tra lại.");
      }
    } catch {
      if (!controller.signal.aborted && wardRequestRef.current === controller) {
        setWardError("Chưa tải được danh sách phường/xã. Vui lòng thử lại.");
      }
    } finally {
      if (wardRequestRef.current === controller) {
        setLoadingWards(false);
        wardRequestRef.current = null;
      }
    }
  };

  const handleSubmit = async () => {
    setFormError("");

    if (isDisabled) return;

    if (loadingProvinces) {
      setFormError("Vui lòng chờ tải danh sách tỉnh/thành phố.");
      return;
    }

    if (provinceError) {
      setFormError("Vui lòng tải lại danh sách tỉnh/thành phố trước.");
      return;
    }

    if (!receiverName.trim()) {
      setFormError("Vui lòng nhập tên người nhận.");
      return;
    }

    const cleanShippingPhone = shippingPhone.replace(/\D/g, "");

    if (!/^0\d{9}$/.test(cleanShippingPhone)) {
      setFormError(
        "Số điện thoại nhận hàng phải gồm 10 chữ số và bắt đầu bằng 0.",
      );
      return;
    }

    if (!province) {
      setFormError("Vui lòng chọn tỉnh/thành phố.");
      return;
    }

    if (loadingWards) {
      setFormError("Vui lòng chờ tải danh sách phường/xã.");
      return;
    }

    if (wardError) {
      setFormError("Vui lòng tải lại danh sách phường/xã trước.");
      return;
    }

    if (!ward) {
      setFormError("Vui lòng chọn phường/xã.");
      return;
    }

    if (!shippingAddress.trim()) {
      setFormError("Vui lòng nhập địa chỉ chi tiết.");
      return;
    }

    if (!SALES_SOURCES.includes(salesSource)) {
      setFormError("Vui lòng chọn nguồn bán.");
      return;
    }

    if (!BANKS.includes(bank)) {
      setFormError("Vui lòng chọn ngân hàng.");
      return;
    }

    const selectedProvince = provinces.find(
      (item) => String(item.code) === province,
    );

    const selectedWard = wards.find((item) => String(item.code) === ward);

    if (!selectedProvince || !selectedWard) {
      setFormError(
        "Thông tin tỉnh/thành phố hoặc phường/xã không hợp lệ. Vui lòng chọn lại.",
      );
      return;
    }

    const fullShippingAddress = [
      shippingAddress.trim(),
      getUnitLabel(selectedWard),
      getUnitLabel(selectedProvince),
    ].join(", ");

    try {
      await onSubmit(salesSource, bank, fullShippingAddress);
    } catch {
      setFormError(
        "Chưa thể hoàn tất lên đơn hàng. Vui lòng kiểm tra thông tin và thử lại.",
      );
    }
  };

  return (
    <div className="mt-5 rounded-2xl border border-[#D8E1EB] bg-white p-4 sm:p-5">
      <div className="mb-5">
        <h3 className="text-base font-extrabold text-[#12335B]">
          THÔNG TIN LÊN ĐƠN
        </h3>

        <p className="mt-1 text-sm leading-5 text-gray-500">
          Vui lòng nhập đầy đủ thông tin nhận hàng và thông tin bán hàng.
        </p>
      </div>

      <div className="space-y-5">
        <section className="space-y-4">
          <h4 className="border-b border-[#E8EDF3] pb-2 text-sm font-bold text-[#12335B]">
            1. Thông tin người nhận
          </h4>

          <div>
            <label htmlFor="receiver-name" className={labelClass}>
              Tên người nhận
            </label>

            <input
              id="receiver-name"
              type="text"
              autoComplete="name"
              value={receiverName}
              required
              disabled={isDisabled}
              onChange={(event) => {
                onReceiverNameChange(event.target.value);
                setFormError("");
              }}
              placeholder="Nhập tên người nhận"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="shipping-phone" className={labelClass}>
              Số điện thoại nhận hàng
            </label>

            <input
              id="shipping-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              value={shippingPhone}
              required
              disabled={isDisabled}
              onChange={(event) => {
                onShippingPhoneChange(
                  event.target.value.replace(/\D/g, "").slice(0, 10),
                );
                setFormError("");
              }}
              placeholder="Nhập số điện thoại nhận hàng"
              className={inputClass}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="border-b border-[#E8EDF3] pb-2 text-sm font-bold text-[#12335B]">
            2. Địa chỉ nhận hàng
          </h4>

          <div>
            <label htmlFor="shipping-province" className={labelClass}>
              Tỉnh / Thành phố
            </label>

            <select
              id="shipping-province"
              value={province}
              required
              disabled={isDisabled || loadingProvinces}
              onChange={(event) => {
                void handleProvinceChange(event.target.value);
              }}
              className={`${inputClass} ${!province ? "text-gray-400" : ""}`}
            >
              <option value="">
                {loadingProvinces
                  ? "Đang tải tỉnh/thành..."
                  : "Chọn tỉnh / thành phố"}
              </option>

              {provinces.map((item) => (
                <option key={item.code} value={String(item.code)}>
                  {getUnitLabel(item)}
                </option>
              ))}
            </select>

            {provinceError && (
              <div className="mt-2">
                <p className="text-xs leading-5 text-red-600">
                  {provinceError}
                </p>

                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => void handleRetryProvinces()}
                  className="mt-1 text-xs font-semibold text-[#1188B4] underline disabled:opacity-50"
                >
                  Tải lại danh sách
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="shipping-ward" className={labelClass}>
              Phường / Xã
            </label>

            <select
              id="shipping-ward"
              value={ward}
              required
              disabled={
                isDisabled || !province || loadingWards || Boolean(wardError)
              }
              onChange={(event) => {
                setWard(event.target.value);
                setFormError("");
              }}
              className={`${inputClass} ${!ward ? "text-gray-400" : ""}`}
            >
              <option value="">
                {!province
                  ? "Vui lòng chọn tỉnh/thành trước"
                  : loadingWards
                    ? "Đang tải phường/xã..."
                    : "Chọn phường / xã"}
              </option>

              {wards.map((item) => (
                <option key={item.code} value={String(item.code)}>
                  {getUnitLabel(item)}
                </option>
              ))}
            </select>

            {wardError && (
              <div className="mt-2">
                <p className="text-xs leading-5 text-red-600">{wardError}</p>

                <button
                  type="button"
                  disabled={isDisabled || loadingWards || !province}
                  onClick={() => void handleRetryWards()}
                  className="mt-1 text-xs font-semibold text-[#1188B4] underline disabled:opacity-50"
                >
                  Tải lại phường/xã
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="shipping-address" className={labelClass}>
              Địa chỉ chi tiết
            </label>

            <textarea
              id="shipping-address"
              value={shippingAddress}
              required
              disabled={isDisabled}
              onChange={(event) => {
                onShippingAddressChange(event.target.value);
                setFormError("");
              }}
              placeholder="Số nhà, tên đường, tòa nhà, căn hộ..."
              rows={3}
              className="w-full resize-y rounded-xl border border-[#D8E1EB] px-4 py-3 text-sm font-medium text-[#12335B] outline-none transition placeholder:text-gray-400 focus:border-[#18A8DC] focus:ring-2 focus:ring-[#18A8DC]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="border-b border-[#E8EDF3] pb-2 text-sm font-bold text-[#12335B]">
            3. Thông tin bán hàng
          </h4>

          <div>
            <label htmlFor="sales-source" className={labelClass}>
              Nguồn bán
            </label>

            <select
              id="sales-source"
              value={salesSource}
              required
              disabled={isDisabled}
              onChange={(event) => {
                setSalesSource(event.target.value);
                setFormError("");
              }}
              className={`${inputClass} ${!salesSource ? "text-gray-400" : ""}`}
            >
              <option value="">Chọn nguồn bán</option>

              {SALES_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="order-bank" className={labelClass}>
              Ngân hàng
            </label>

            <select
              id="order-bank"
              value={bank}
              required
              disabled={isDisabled}
              onChange={(event) => {
                setBank(event.target.value);
                setFormError("");
              }}
              className={`${inputClass} ${!bank ? "text-gray-400" : ""}`}
            >
              <option value="">Chọn ngân hàng</option>

              {BANKS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </section>
      </div>

      {(formError || error) && (
        <div role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3">
          <p className="text-sm font-medium leading-5 text-red-600">
            {formError || error}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={isDisabled}
        className="mt-6 h-12 w-full rounded-xl bg-[#18A8DC] text-sm font-bold text-white transition hover:bg-[#1099CB] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "ĐANG LÊN ĐƠN..." : "XÁC NHẬN LÊN ĐƠN"}
      </button>
    </div>
  );
}

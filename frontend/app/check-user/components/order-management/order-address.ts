export type AdministrativeUnit = {
  code: string;
  name: string;
  type?: string;
  province_code?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T[];
  metadata?: {
    total: number;
    page: number;
    limit: number;
  };
};

const ADDRESS_API = "https://tinhthanhpho.com/api/v1";
const PAGE_LIMIT = 100;

export function getUnitLabel(unit: AdministrativeUnit): string {
  const name = String(unit.name || "").trim();
  const type = String(unit.type || "").trim();

  if (!type || !name) return name;

  const normalizedName = name.toLocaleLowerCase("vi");
  const normalizedType = type.toLocaleLowerCase("vi");

  if (
    normalizedName === normalizedType ||
    normalizedName.startsWith(normalizedType + " ")
  ) {
    return name;
  }

  return `${type} ${name}`;
}

export function sortAdministrativeUnits(
  units: AdministrativeUnit[],
): AdministrativeUnit[] {
  return [...units].sort((a, b) =>
    getUnitLabel(a).localeCompare(getUnitLabel(b), "vi", {
      sensitivity: "base",
      numeric: true,
    }),
  );
}

export async function fetchAllPages<T>(
  endpoint: string,
  signal: AbortSignal,
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  let total = Infinity;

  while (results.length < total) {
    if (signal.aborted) {
      throw new DOMException("Request đã bị hủy.", "AbortError");
    }

    const separator = endpoint.includes("?") ? "&" : "?";
    const url =
      `${ADDRESS_API}${endpoint}${separator}` +
      `limit=${PAGE_LIMIT}&page=${page}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Không thể tải dữ liệu địa chỉ (${response.status}).`);
    }

    const result = (await response.json()) as ApiResponse<T>;

    if (!result || result.success !== true) {
      throw new Error("API không thể trả về dữ liệu địa chỉ.");
    }

    if (!Array.isArray(result.data)) {
      throw new Error("Dữ liệu địa chỉ trả về không hợp lệ.");
    }

    results.push(...result.data);

    if (!result.metadata) {
      break;
    }

    const nextTotal = Number(result.metadata.total);

    if (!Number.isFinite(nextTotal) || nextTotal < 0) {
      throw new Error("Metadata phân trang không hợp lệ.");
    }

    total = nextTotal;

    if (result.data.length === 0 || results.length >= total) {
      break;
    }

    page += 1;
  }

  return results;
}

export async function fetchProvinces(
  signal: AbortSignal,
): Promise<AdministrativeUnit[]> {
  const data = await fetchAllPages<AdministrativeUnit>(
    "/new-provinces",
    signal,
  );

  return sortAdministrativeUnits(data);
}

export async function fetchWards(
  provinceCode: string,
  signal: AbortSignal,
): Promise<AdministrativeUnit[]> {
  const cleanProvinceCode = String(provinceCode || "").trim();

  if (!cleanProvinceCode) {
    throw new Error("Thiếu mã tỉnh/thành phố.");
  }

  const data = await fetchAllPages<AdministrativeUnit>(
    `/new-provinces/${encodeURIComponent(cleanProvinceCode)}/wards`,
    signal,
  );

  return sortAdministrativeUnits(data);
}

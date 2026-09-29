const DB_NAME = "zmoms-dashboard";
const DB_VERSION = 1;
const STORE_NAME = "dashboard";

export type DashboardDataScope = "ALL" | "ZMOMS" | "CỘNG ĐỒNG BẦU";

export type DashboardStorageData<T = unknown> = {
  sessionId: string;
  dataScope: DashboardDataScope;
  syncedAt: string;
  totalEntries: number;
  entries: T[];
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB chỉ có thể sử dụng ở trình duyệt."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error("Không thể mở IndexedDB."));
    };
  });
}

export async function getDashboardStorage<
  T = unknown,
>(): Promise<DashboardStorageData<T> | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");

    const store = transaction.objectStore(STORE_NAME);
    const request = store.get("snapshot");

    request.onsuccess = () => {
      resolve((request.result as DashboardStorageData<T> | undefined) ?? null);

      db.close();
    };

    request.onerror = () => {
      reject(request.error || new Error("Không thể đọc dữ liệu Dashboard."));

      db.close();
    };
  });
}

export async function saveDashboardStorage<T = unknown>(
  data: DashboardStorageData<T>,
): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    const store = transaction.objectStore(STORE_NAME);

    const request = store.put(data, "snapshot");

    request.onsuccess = () => {
      db.close();
      resolve();
    };

    request.onerror = () => {
      reject(request.error || new Error("Không thể lưu dữ liệu Dashboard."));

      db.close();
    };
  });
}

export async function clearDashboardStorage(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete("snapshot");

    request.onsuccess = () => {
      db.close();
      resolve();
    };

    request.onerror = () => {
      reject(request.error || new Error("Không thể xóa dữ liệu Dashboard."));

      db.close();
    };
  });
}

export async function clearDashboardDatabase(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const request = window.indexedDB.deleteDatabase(DB_NAME);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error || new Error("Không thể xóa IndexedDB Dashboard."));
    };

    request.onblocked = () => {
      reject(new Error("Không thể xóa IndexedDB vì vẫn còn kết nối đang mở."));
    };
  });
}

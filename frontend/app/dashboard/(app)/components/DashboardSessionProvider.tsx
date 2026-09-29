"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { PancakeLead } from "@/lib/dashboard/pancake";

import {
  clearDashboardStorage,
  getDashboardStorage,
  saveDashboardStorage,
  type DashboardStorageData,
} from "@/lib/dashboard/indexeddb";

type DashboardSession = {
  sessionId: string;
  username: string;
  role: "CUSTOMER" | "TEAM";
  dataScope: "ALL" | "ZMOMS" | "CỘNG ĐỒNG BẦU";
  exp: number;
};

type DashboardStorage = DashboardStorageData<PancakeLead>;

type DashboardSessionContextValue = {
  session: DashboardSession | null;
  storage: DashboardStorage | null;
  loading: boolean;
  syncing: boolean;
  sync: () => Promise<void>;
  clearStorage: () => Promise<void>;
};

const DashboardSessionContext =
  createContext<DashboardSessionContextValue | null>(null);

export function DashboardSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<DashboardSession | null>(null);

  const [storage, setStorage] = useState<DashboardStorage | null>(null);

  const [loading, setLoading] = useState(true);

  const [syncing, setSyncing] = useState(false);

  const clearStorage = useCallback(async () => {
    await clearDashboardStorage();

    setStorage(null);
  }, []);

  const loadSession = useCallback(async () => {
    const response = await fetch("/api/dashboard/session", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (response.status === 401) {
      await clearDashboardStorage();

      setSession(null);
      setStorage(null);

      window.location.replace("/dashboard/login");

      return;
    }

    if (!response.ok) {
      throw new Error("Không thể lấy thông tin phiên đăng nhập.");
    }

    const result = (await response.json()) as {
      success: boolean;
      data?: DashboardSession;
      message?: string;
    };

    if (!result.success || !result.data) {
      throw new Error(
        result.message || "Không thể lấy thông tin phiên đăng nhập.",
      );
    }

    const currentSession = result.data;

    setSession(currentSession);

    const storedData = await getDashboardStorage<PancakeLead>();

    if (!storedData) {
      setStorage(null);

      return;
    }

    if (
      storedData.sessionId !== currentSession.sessionId ||
      storedData.dataScope !== currentSession.dataScope
    ) {
      await clearDashboardStorage();

      setStorage(null);

      return;
    }

    setStorage(storedData);
  }, [clearDashboardStorage]);

  const sync = useCallback(async () => {
    setSyncing(true);

    try {
      const response = await fetch("/api/dashboard/sync", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        await clearDashboardStorage();

        setSession(null);
        setStorage(null);

        window.location.replace("/dashboard/login");

        return;
      }

      const result = (await response.json()) as {
        success: boolean;
        data?: DashboardStorage;
        message?: string;
      };

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.message || "Không thể đồng bộ dữ liệu Dashboard.",
        );
      }

      const currentData = result.data;

      if (!session || currentData.sessionId !== session.sessionId) {
        throw new Error("Phiên đăng nhập không hợp lệ.");
      }

      if (currentData.dataScope !== session.dataScope) {
        throw new Error("Phạm vi dữ liệu không hợp lệ.");
      }

      await saveDashboardStorage<PancakeLead>(currentData);

      setStorage(currentData);
    } finally {
      setSyncing(false);
    }
  }, [session, clearDashboardStorage]);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        await loadSession();
      } catch {
        if (active) {
          setSession(null);
          setStorage(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, [loadSession]);

  return (
    <DashboardSessionContext.Provider
      value={{
        session,
        storage,
        loading,
        syncing,
        sync,
        clearStorage,
      }}
    >
      {children}
    </DashboardSessionContext.Provider>
  );
}

export function useDashboardSession() {
  const context = useContext(DashboardSessionContext);

  if (!context) {
    throw new Error(
      "useDashboardSession phải được sử dụng bên trong DashboardSessionProvider.",
    );
  }

  return context;
}

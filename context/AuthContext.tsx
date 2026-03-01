"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_BASE_URL } from "./api";

export type Role = "student" | "teacher" | "admin";

export type User = {
  id: string;
  civility?: "Mr" | "Ms" | "Mrs" | null;
  firstname: string;
  lastname: string;
  email: string;
  mobilephone?: string | null;
  role: Role;
  birthday?: string | null;
  created_at?: string;
  updated_at?: string;
};

type RegisterPayload = {
  civility?: "Mr" | "Ms" | "Mrs";
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  mobilephone?: string;
  role?: Role; // если у тебя публично роль нельзя — не передавай
  birthday?: string; // YYYY-MM-DD
};

type LoginPayload = {
  email: string;
  password: string;
};

type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isReady: boolean;

  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;

  refresh: () => Promise<void>;
  apiFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  access: "auth.accessToken",
  refresh: "auth.refreshToken",
  user: "auth.user",
};

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function readErrorMessage(res: Response) {
  try {
    const data = await res.json();
    return data?.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const u = safeJsonParse<User>(localStorage.getItem(STORAGE_KEYS.user));
    const a = localStorage.getItem(STORAGE_KEYS.access);
    const r = localStorage.getItem(STORAGE_KEYS.refresh);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (u) setUser(u);
    if (a) setAccessToken(a);
    if (r) setRefreshToken(r);

    setIsReady(true);
  }, []);

  const persist = useCallback(
    (next: {
      user: User | null;
      access: string | null;
      refresh: string | null;
    }) => {
      setUser(next.user);
      setAccessToken(next.access);
      setRefreshToken(next.refresh);

      if (next.user)
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next.user));
      else localStorage.removeItem(STORAGE_KEYS.user);

      if (next.access) localStorage.setItem(STORAGE_KEYS.access, next.access);
      else localStorage.removeItem(STORAGE_KEYS.access);

      if (next.refresh)
        localStorage.setItem(STORAGE_KEYS.refresh, next.refresh);
      else localStorage.removeItem(STORAGE_KEYS.refresh);
    },
    [],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await readErrorMessage(res));

      const data = (await res.json()) as AuthResponse;
      persist({
        user: data.user,
        access: data.accessToken,
        refresh: data.refreshToken,
      });
    },
    [persist],
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await readErrorMessage(res));

      const data = (await res.json()) as AuthResponse;
      persist({
        user: data.user,
        access: data.accessToken,
        refresh: data.refreshToken,
      });
    },
    [persist],
  );

  const logout = useCallback(async () => {
    // если нет refreshToken — просто чистим
    const rt = refreshToken;

    if (rt) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      }).catch(() => {});
    }

    persist({ user: null, access: null, refresh: null });
  }, [persist, refreshToken]);

  const refresh = useCallback(async () => {
    const rt = refreshToken ?? localStorage.getItem(STORAGE_KEYS.refresh);
    if (!rt) throw new Error("No refresh token");

    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });

    if (!res.ok) {
      // refresh невалиден — вылогиним
      persist({ user: null, access: null, refresh: null });
      throw new Error(await readErrorMessage(res));
    }

    const data = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
    };
    // user не меняем
    persist({
      user:
        user ?? safeJsonParse<User>(localStorage.getItem(STORAGE_KEYS.user)),
      access: data.accessToken,
      refresh: data.refreshToken,
    });
  }, [persist, refreshToken, user]);

  /**
   * apiFetch:
   * - добавляет Authorization
   * - если 401 -> refresh -> повторяет запрос 1 раз
   */
  const apiFetch = useCallback(
    async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const url =
        typeof input === "string"
          ? input.startsWith("http")
            ? input
            : `${API_BASE_URL}${input.startsWith("/") ? "" : "/"}${input}`
          : input;

      const token = accessToken ?? localStorage.getItem(STORAGE_KEYS.access);

      const doFetch = (tok: string | null) => {
        const headers = new Headers(init.headers || {});
        if (!headers.has("Content-Type") && init.body)
          headers.set("Content-Type", "application/json");
        if (tok) headers.set("Authorization", `Bearer ${tok}`);
        return fetch(url, { ...init, headers });
      };

      let res = await doFetch(token);

      if (res.status !== 401) return res;

      // пробуем refresh один раз
      try {
        await refresh();
      } catch {
        return res; // вернём исходный 401
      }

      const newToken = localStorage.getItem(STORAGE_KEYS.access);
      res = await doFetch(newToken);
      return res;
    },
    [accessToken, refresh],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      refreshToken,
      isReady,
      login,
      register,
      logout,
      refresh,
      apiFetch,
    }),
    [
      user,
      accessToken,
      refreshToken,
      isReady,
      login,
      register,
      logout,
      refresh,
      apiFetch,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

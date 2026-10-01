"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { fetchMe } from "@/entities/user/api/fetch-me";
import { getTokenExpiration } from "@/utils/get-token-expiration";
import { $fetch } from "@/utils/fetch";
import { safeCookieStorage } from "@/utils/safe-cookie-storage";
interface UserContextType {
  user: any;
  setUser: (user: any) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
}
export const UserContext = createContext<UserContextType | undefined>(undefined);
export default function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const refresh_token = safeCookieStorage.getItem("refresh_token");
      const access_token = safeCookieStorage.getItem("access_token");
      if (!refresh_token || !access_token) {
        if (!cancelled) setIsLoading(false);
        return;
      }
      const expTime = getTokenExpiration(access_token);
      const isExpired = expTime ? Date.now() >= expTime : true;
      if (!isExpired) {
        if (!cancelled) setToken(access_token);
        return;
      }
      // Access token expired — try the refresh token.
      let refreshed: string | null = null;
      let refreshStatus: number | null = null;
      try {
        const response = await $fetch("/api/v1/refresh", {
          method: "POST",
          body: JSON.stringify({ refresh_token }),
          headers: { "Content-Type": "application/json" },
          isToast: false,
        });
        refreshStatus = response?.response?.status ?? null;
        refreshed = response?.json?.access_token || null;
      } catch {
        // Network error — backend not reachable. Do NOT clear cookies.
        // This is the guard that was missing before: without it, a
        // transient network failure threw up to the effect and crashed
        // the whole app on every page load.
        if (!cancelled) setIsLoading(false);
        return;
      }
      if (cancelled) return;
      if (refreshed) {
        safeCookieStorage.setItem("access_token", refreshed);
        setToken(refreshed);
        return;
      }
      // Only clear when the refresh endpoint explicitly rejected the token
      // (401/403). A 5xx or a null response is transient — keep the cookies
      // and let the next page load retry.
      if (refreshStatus === 401 || refreshStatus === 403) {
        safeCookieStorage.removeItem("access_token");
        safeCookieStorage.removeItem("refresh_token");
      }
      setIsLoading(false);
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);
  const getUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const user_ = await fetchMe();
      setUser(user_);
      if (!user_) setToken(null);
    } catch (err) {
      console.error("[user-context] fetchMe failed:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    if (token) {
      safeCookieStorage.setItem("access_token", token);
      getUser();
    }
  }, [token, getUser]);
  function clearAuth() {
    safeCookieStorage.removeItem("access_token");
    safeCookieStorage.removeItem("refresh_token");
    setToken(null);
    setUser(null);
    setIsLoading(false);
  }
  async function logout() {
    const refresh_token = safeCookieStorage.getItem("refresh_token");
    try {
      await $fetch("/api/v1/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token }),
        headers: { "Content-Type": "application/json" },
        isToast: false,
      });
    } catch {
      /* best-effort */
    }
    clearAuth();
    router.push("/login");
  }
  return (
    <UserContext.Provider
      value={{ user, setUser, token, setToken, isLoading, setIsLoading, logout }}
    >
      {children}
    </UserContext.Provider>
  );
}
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

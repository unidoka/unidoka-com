"use client";
import { $fetch } from "@/utils/fetch";
import { safeCookieStorage } from "@/utils/safe-cookie-storage";
/**
 * Fetch the current user, or null.
 *
 * Important:
 *  - A network error (backend not up yet during deploy, Traefik restarting)
 *    returns null WITHOUT wiping cookies — the session is almost certainly
 *    still valid, the API just isn't reachable right now.
 *  - A 401 from /api/v1/me means the access token is dead AND the refresh
 *    attempt inside $fetch already failed. Only then do we clear cookies.
 */
export const fetchMe = async () => {
  const access_token = safeCookieStorage.getItem("access_token");
  if (!access_token) return null;
  let response: Response | undefined;
  let json: any;
  try {
    const res = await $fetch("/api/v1/me", { isToast: false });
    response = res.response;
    json = res.json;
  } catch {
    // $fetch shouldn't throw now, but belt-and-braces: a thrown error here
    // must not crash the provider tree.
    return null;
  }
  // Network failure — $fetch returns { response: undefined }.
  if (!response) return null;
  // Terminal auth failure — clear the session.
  if (response.status === 401) {
    safeCookieStorage.removeItem("access_token");
    safeCookieStorage.removeItem("refresh_token");
    return null;
  }
  if (!response.ok) return null;
  return json || null;
};

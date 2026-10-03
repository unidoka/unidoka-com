"use client";

import { $fetch } from "@/utils/fetch";
import { safeCookieStorage } from "@/utils/safe-cookie-storage";

/**
 * Fetch the current user, or null.
 *
 * Only a 401/403 from `/api/v1/me` (after $fetch has already tried the
 * refresh endpoint) clears the session. Network errors, 5xx, and
 * container restarts leave cookies in place — otherwise `docker compose
 * up -d --force-recreate main-service` would log out every user during
 * a rolling deploy.
 */
export const fetchMe = async () => {
  const access_token = safeCookieStorage.getItem("access_token");
  const refresh_token = safeCookieStorage.getItem("refresh_token");
  if (!access_token && !refresh_token) return null;

  let response: Response | undefined;
  let json: any;
  try {
    const res = await $fetch("/api/v1/me", { isToast: false });
    response = res.response;
    json = res.json;
  } catch {
    return null;
  }

  // Network failure — cookies stay.
  if (!response) return null;
  if (response.ok) return json || null;

  // Terminal auth failure — the refresh attempt inside $fetch failed
  // with 401/403 too. Clear the session.
  if (response.status === 401 || response.status === 403) {
    safeCookieStorage.removeItem("access_token");
    safeCookieStorage.removeItem("refresh_token");
    return null;
  }

  // 5xx / other — leave cookies alone; user state becomes null for this
  // render, the next page load retries.
  return null;
};

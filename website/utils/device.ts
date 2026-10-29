"use client";
import Cookies from "js-cookie";

export function getDeviceId(): string {
  let id = Cookies.get("device_id");
  if (!id) {
    id = crypto.randomUUID();
    Cookies.set("device_id", id, { expires: 365, sameSite: "lax" });
  }
  return id;
}

export function extractErrorMessage(payload: any, fallback = "Что-то пошло не так"): string {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  if (typeof payload !== "object") return String(payload);
  const raw = payload.detail ?? payload.message;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        if (typeof item.msg === "string") return item.msg;
        if (typeof item.message === "string") return item.message;
      }
    }
    return fallback;
  }
  if (raw && typeof raw === "object") {
    if (typeof raw.msg === "string") return raw.msg;
    if (typeof raw.message === "string") return raw.message;
  }
  return fallback;
}

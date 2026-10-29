/**
 * Admin permission model — frontend mirror.
 *
 * The authoritative list lives in
 * `backend/services/main-service/app/shared/permissions.py`. These
 * two sets describe the same product surface and must be kept in
 * sync when a page is added or renamed. The backend rejects unknown
 * permissions at write time, so drift shows up as "the checkbox
 * exists but the server refuses to save it" rather than a silent
 * mismatch.
 *
 * Frontend enforcement is UX, not security. Hiding a sidebar entry
 * or a page block is a courtesy — every admin endpoint independently
 * verifies the same permission on the DB-loaded user. If someone
 * bookmarks a hidden page or calls the API directly, they get a 403.
 */

export const ADMIN_PERMISSIONS = [
  { key: "admin.dashboard", label: "Дашборд" },
  { key: "admin.users", label: "Пользователи" },
  { key: "admin.orders", label: "Заявки" },
  { key: "admin.solutions", label: "Решения" },
  { key: "admin.articles", label: "Статьи" },
  { key: "admin.events", label: "События" },
  { key: "admin.catalog", label: "Каталоги" },
  { key: "admin.vershiny", label: "Вершины" },
  { key: "admin.marketing", label: "Маркетинг" },
  { key: "admin.apikeys", label: "API-ключи" },
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number]["key"];

export const ADMIN_PERMISSION_KEYS: readonly AdminPermission[] =
  ADMIN_PERMISSIONS.map((p) => p.key);

interface UserLike {
  role?: string | null;
  permissions?: string[] | null;
}

/**
 * Resolve whether a user can access a permission-gated surface.
 *
 * Mirrors the backend's `has_permission` exactly:
 *   • Root always passes — they bypass the model entirely.
 *   • Non-admin roles never pass, even if the DB row contains grants.
 *   • Admin passes only when the grant is present.
 *
 * The user argument is optional so call sites in components that
 * render before the session resolves don't have to branch — an
 * undefined user is treated as "no access".
 */
export function hasPermission(
  user: UserLike | null | undefined,
  permission: AdminPermission,
): boolean {
  if (!user) return false;
  if (user.role === "root") return true;
  if (user.role !== "admin") return false;
  if (!Array.isArray(user.permissions)) return false;
  return user.permissions.includes(permission);
}

import { $fetch } from "@/utils/fetch";
export type CatalogName =
  | "project-categories"
  | "project-roles"
  | "stack"
  | "article-categories"
  | "tags";
export interface CatalogItem {
  id: string;
  code: string;
  labels: Record<string, string>;
  kind?: string | null;
}
export async function fetchCatalog(name: CatalogName): Promise<CatalogItem[]> {
  const res = await $fetch(`/api/v1/admin/catalog/${name}`, { isToast: false });
  return Array.isArray(res?.json) ? (res.json as CatalogItem[]) : [];
}
export async function createCatalogItem(
  name: CatalogName,
  payload: { code?: string; label?: string; labels?: Record<string, string>; kind?: string },
): Promise<CatalogItem> {
  const res = await $fetch(`/api/v1/admin/catalog/${name}`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to create");
  return res.json as CatalogItem;
}
export async function updateCatalogItem(
  name: CatalogName,
  id: string,
  payload: { code?: string; labels?: Record<string, string>; kind?: string },
): Promise<CatalogItem> {
  const res = await $fetch(`/api/v1/admin/catalog/${name}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to update");
  return res.json as CatalogItem;
}
export async function deleteCatalogItem(name: CatalogName, id: string): Promise<void> {
  const res = await $fetch(`/api/v1/admin/catalog/${name}/${id}`, { method: "DELETE" });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to delete");
}

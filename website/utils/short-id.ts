/**
 * Short, stable public id derived from a UUID.
 *
 * The full UUID stays in the database/API; public URLs use this 10-char
 * hex prefix. The same helper is meant for articles when that module
 * gets public routes.
 */
export function shortId(uuid: string): string {
  return uuid.replace(/-/g, "").slice(0, 10);
}

export function matchesShortId(uuid: string, candidate: string): boolean {
  return shortId(uuid) === candidate;
}

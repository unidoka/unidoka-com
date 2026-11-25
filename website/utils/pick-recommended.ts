/** Featured items first, then the rest, excluding the current item. */
export function pickRecommended<T extends { id: string; is_featured: boolean }>(
  all: T[],
  currentId: string,
  limit = 3,
): T[] {
  return [
    ...all.filter((item) => item.is_featured),
    ...all.filter((item) => !item.is_featured),
  ]
    .filter(
      (item, index, list) =>
        item.id !== currentId &&
        list.findIndex((candidate) => candidate.id === item.id) === index,
    )
    .slice(0, limit);
}

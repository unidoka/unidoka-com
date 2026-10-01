export async function revalidateTags(tags: string[]): Promise<void> {
  if (!Array.isArray(tags) || tags.length === 0) return;
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
  } catch {
    /* silent */
  }
}

import { $fetch } from "@/utils/fetch";

/**
 * Upload an image blob/file. Returns a same-origin URL
 * (e.g. "/order_files/uploads/abc.webp").
 */
export async function uploadImage(
  file: File | Blob,
  filename = "image.jpg",
): Promise<string> {
  const fd = new FormData();
  // The third arg is mandatory when passing a Blob - without it the
  // browser sends "blob" as the filename and the backend's extension
  // sniffing falls back to .jpg regardless of actual format.
  fd.append("file", file, filename);

  const res = await $fetch("/api/v1/uploads/image", {
    method: "POST",
    body: fd,
    isToast: false,
  });

  if (!res?.response?.ok) {
    const detail = res?.json?.detail;
    throw new Error(
      typeof detail === "string"
        ? detail
        : `Upload failed (${res?.response?.status ?? "network"})`,
    );
  }
  if (!res.json?.url) throw new Error("No URL returned from upload");
  return res.json.url as string;
}

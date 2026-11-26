import { $fetch, refreshAccessToken } from "@/utils/fetch";
import { safeCookieStorage } from "@/utils/safe-cookie-storage";
import { apiBaseUrl } from "@/utils/api-base";

interface UploadResponse {
  status: number;
  json: any;
}

let activeFolder = "misc";

/**
 * Default folder for uploads that do not pass one explicitly. The Novel
 * editor sets this so its inline node views (gallery, image replace) land
 * next to the cover instead of in `misc`.
 */
export function setActiveUploadFolder(folder: string): void {
  activeFolder = folder;
}

/**
 * POST a FormData body with an upload-progress callback. `fetch` cannot
 * report upload progress, so video uploads go through XHR. A 401 is
 * retried once after refreshing the token - same behaviour as $fetch.
 */
async function uploadWithProgress(
  route: string,
  body: FormData,
  onProgress?: (percent: number) => void,
): Promise<any> {
  const attempt = (token: string | null) =>
    new Promise<UploadResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", apiBaseUrl() + route);
      xhr.setRequestHeader("Accept", "application/json");
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        let json: any;
        try {
          json = JSON.parse(xhr.responseText);
        } catch {
          /* empty or non-JSON body */
        }
        resolve({ status: xhr.status, json });
      };
      xhr.onerror = () => reject(new Error("Ошибка соединения"));
      xhr.onabort = () => reject(new Error("Загрузка отменена"));
      xhr.send(body);
    });

  let result = await attempt(safeCookieStorage.getItem("access_token"));
  if (result.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) result = await attempt(refreshed);
  }

  if (result.status >= 200 && result.status < 300) return result.json;

  const detail = result.json?.detail;
  if (typeof detail === "string") throw new Error(detail);
  if (result.status === 404) {
    throw new Error(
      "Сервер не принимает видео — пересоберите сервис main-service",
    );
  }
  throw new Error(`Не удалось загрузить видео (${result.status || "сеть"})`);
}

/**
 * Upload an image blob/file. Returns a same-origin URL
 * (e.g. "/order_files/articles/abc.webp"). `folder` groups uploads by
 * owning area on disk; the backend validates it against a whitelist.
 */
export async function uploadImage(
  file: File | Blob,
  filename = "image.jpg",
  folder = activeFolder,
): Promise<string> {
  const fd = new FormData();
  fd.append("folder", folder);
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

export interface VideoUploadOptions {
  /** Storage subfolder, e.g. "articles" or "solutions". */
  folder?: string;
  /** Trim bounds in seconds, applied by the backend with a stream copy. */
  start?: number | null;
  end?: number | null;
  onProgress?: (percent: number) => void;
}

/**
 * Upload a video file, optionally cutting it to [start, end] first.
 * `poster_url` is reserved for a generated frame and is currently null.
 */
export async function uploadVideo(
  file: File,
  options: VideoUploadOptions = {},
): Promise<{ url: string; posterUrl: string }> {
  const fd = new FormData();
  fd.append("folder", options.folder ?? activeFolder);
  fd.append("file", file, file.name);
  if (options.start != null) fd.append("start", String(options.start));
  if (options.end != null) fd.append("end", String(options.end));

  const json = await uploadWithProgress(
    "/api/v1/uploads/media",
    fd,
    options.onProgress,
  );
  if (!json?.url) throw new Error("No URL returned from upload");
  return {
    url: json.url as string,
    posterUrl: (json.poster_url ?? "") as string,
  };
}

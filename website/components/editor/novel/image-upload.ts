import { createImageUpload } from "novel";
import { toast } from "sonner";
import { $fetch } from "@/utils/fetch";

const onUpload = async (file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  const res = await $fetch("/api/v1/uploads/image", {
    method: "POST",
    body: fd,
    isToast: false,
  });
  if (!res?.response?.ok) {
    throw new Error(res?.json?.detail || "Upload failed");
  }
  return res.json.url as string;
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("Можно загружать только изображения");
      return false;
    }
    if (file.size / 1024 / 1024 > 20) {
      toast.error("Файл больше 20 МБ");
      return false;
    }
    return true;
  },
});

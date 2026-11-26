import { createImageUpload } from "novel";
import { toast } from "sonner";
import { uploadImage } from "@/utils/api/uploads";

/**
 * Build the paste/drop handler for a Novel editor. The folder is captured
 * so an article's inline images land in `order_files/articles`, solutions
 * in `order_files/solutions`, and so on.
 */
export function createUploadFn(folder = "misc") {
  const onUpload = (file: File) => uploadImage(file, file.name, folder);

  return createImageUpload({
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
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  CameraIcon,
  CircleNotchIcon,
  TrashIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/utils/api/uploads";
import { ImageCropDialog } from "./image-crop-dialog";

interface Props {
  value: string;
  onChange: (url: string) => void;
  aspect?: number;
  outputSize?: number;
  accept?: string;
  maxSizeMb?: number;
  variant?: "avatar" | "cover" | "square";
  className?: string;
  fallbackText?: string;
}

/**
 * Pick → crop → upload → onChange(url). Same UX everywhere so a user
 * avatar, a company logo, and a project cover behave identically.
 */
export function ImageUploadField({
  value,
  onChange,
  aspect = 1,
  outputSize = 512,
  accept = "image/jpeg,image/png,image/webp,image/gif,image/avif",
  maxSizeMb = 5,
  variant = "avatar",
  className,
  fallbackText,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const pick = () => inputRef.current?.click();

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Можно загружать только изображения");
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Файл больше ${maxSizeMb} МБ`);
      return;
    }
    setCropFile(file);
  };

  const onComplete = async (blob: Blob, filename: string) => {
    setCropFile(null);
    setUploading(true);
    try {
      const url = await uploadImage(new File([blob], filename, { type: blob.type }), filename);
      onChange(url);
      toast.success("Изображение загружено");
    } catch (err: any) {
      toast.error(err?.message || "Не удалось загрузить");
    } finally {
      setUploading(false);
    }
  };

  const isAvatar = variant === "avatar";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <input ref={inputRef} type="file" accept={accept} onChange={onSelect} className="hidden" />

      <div
        className={cn(
          "relative overflow-hidden border border-(--outline) bg-(--card)",
          isAvatar && "size-28 rounded-full",
          variant === "cover" && "w-full aspect-[16/9] rounded-2xl",
          variant === "square" && "w-full aspect-square rounded-2xl",
        )}
      >
        {value ? (
          <Image
            src={value}
            alt=""
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : isAvatar ? (
          <div className="absolute inset-0 flex items-center justify-center bg-(--primary-card) text-(--primary) font-medium text-2xl">
            {fallbackText?.slice(0, 2).toUpperCase() || <CameraIcon className="size-7" />}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-(--on-bg-low)">
            <CameraIcon className="size-8" />
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <CircleNotchIcon className="size-6 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outlined" size="small" onClick={pick} disabled={uploading}>
          <UploadSimpleIcon className="size-4" />
          {value ? "Заменить" : "Загрузить"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="text"
            size="small"
            onClick={() => onChange("")}
            disabled={uploading}
            className="text-(--error)"
          >
            <TrashIcon className="size-4" />
            Удалить
          </Button>
        )}
      </div>

      <ImageCropDialog
        file={cropFile}
        aspect={aspect}
        outputSize={outputSize}
        onCancel={() => setCropFile(null)}
        onComplete={onComplete}
      />
    </div>
  );
}

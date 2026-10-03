"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  CameraIcon,
  CircleNotchIcon,
  TrashIcon,
  UploadSimpleIcon,
  WarningCircleIcon,
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
 * Pick → crop → upload → onChange(url).
 *
 * Why a plain <img> and not next/image:
 *   next/image routes through the server-side optimizer, which fetches
 *   `src` on the Next.js server process. Server-side fetches DO NOT go
 *   through `next.config.ts` rewrites — so in dev, `/order_files/*`
 *   resolves to nothing and the optimizer returns 400. Uploaded images
 *   are already 512×512 WebP (produced by our own cropper), so the
 *   optimizer adds zero value anyway.
 *
 * The component also keeps an `errored` flag so a stale URL — pointing
 * at an upload that was deleted server-side, or failing to load for any
 * reason — falls back to the initials placeholder instead of the
 * browser's broken-image glyph.
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
  const [errored, setErrored] = useState(false);

  const pick = () => inputRef.current?.click();

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
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
    setErrored(false);
    try {
      const url = await uploadImage(
        new File([blob], filename, { type: blob.type }),
        filename,
      );
      onChange(url);
      toast.success("Изображение загружено");
    } catch (err: any) {
      toast.error(err?.message || "Не удалось загрузить");
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setErrored(false);
    onChange("");
  };

  const isAvatar = variant === "avatar";
  const showImage = !!value && !errored;
  const initials = fallbackText?.slice(0, 2).toUpperCase() || "";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onSelect}
        className="hidden"
      />

      {/* ── Preview ──────────────────────────────────────────────── */}
      <div
        className={cn(
          "relative overflow-hidden border border-(--outline)",
          isAvatar && "size-28 rounded-full",
          variant === "cover" && "w-full aspect-[16/9] rounded-2xl",
          variant === "square" && "w-full aspect-square rounded-2xl",
        )}
      >
        {showImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={value}
            alt=""
            onError={() => setErrored(true)}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-1.5",
              errored
                ? "bg-(--error-card) text-(--on-error-card)"
                : "bg-(--primary-card) text-(--on-primary-card)",
            )}
          >
            {errored ? (
              <>
                <WarningCircleIcon className="size-6" />
                <span className="text-[10px] font-medium leading-tight text-center px-2">
                  Не загрузилось
                </span>
              </>
            ) : isAvatar && initials ? (
              <span className="text-2xl font-semibold tracking-tight">
                {initials}
              </span>
            ) : (
              <CameraIcon className="size-7 opacity-70" />
            )}
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <CircleNotchIcon className="size-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* ── Actions ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outlined"
          size="small"
          onClick={pick}
          disabled={uploading}
        >
          <UploadSimpleIcon className="size-4" />
          {showImage || errored ? "Заменить" : "Загрузить"}
        </Button>
        {(showImage || errored) && (
          <Button
            type="button"
            variant="text"
            size="small"
            onClick={handleClear}
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

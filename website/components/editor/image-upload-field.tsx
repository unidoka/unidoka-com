"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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
  hideActions?: boolean;
}

export interface ImageUploadFieldHandle {
  openPicker: () => void;
}

export const ImageUploadField = forwardRef<ImageUploadFieldHandle, Props>(
  function ImageUploadField(
    {
      value,
      onChange,
      aspect = 1,
      outputSize = 512,
      accept = "image/jpeg,image/png,image/webp,image/gif,image/avif",
      maxSizeMb = 5,
      variant = "avatar",
      className,
      fallbackText,
      hideActions = false,
    },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [cropFile, setCropFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [errored, setErrored] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    useImperativeHandle(ref, () => ({ openPicker: () => inputRef.current?.click() }), []);

    const acceptFile = (file: File | null | undefined) => {
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

    const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      acceptFile(file);
    };

    const onComplete = async (blob: Blob, filename: string) => {
      setCropFile(null);
      setUploading(true);
      setErrored(false);
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

    const handleClear = () => {
      setErrored(false);
      onChange("");
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      acceptFile(e.dataTransfer.files?.[0]);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!dragOver) setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            acceptFile(file);
            return;
          }
        }
      }
    };

    const isAvatar = variant === "avatar";
    const showImage = !!value && !errored;
    const initials = fallbackText?.slice(0, 2).toUpperCase() || "";
    const showAspectStyle = variant === "cover" || variant === "square";

    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <input ref={inputRef} type="file" accept={accept} onChange={onSelect} className="hidden" />

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onPaste={handlePaste}
          tabIndex={0}
          className={cn(
            "relative overflow-hidden border border-(--outline) outline-none transition-colors",
            dragOver && "border-(--primary) bg-(--primary-glass)",
            isAvatar && "size-32 rounded-full",
            (variant === "cover" || variant === "square") && "w-full rounded-2xl",
          )}
          style={showAspectStyle ? { aspectRatio: String(aspect) } : undefined}
        >
          {showImage ? (
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
                <span className="text-2xl font-semibold tracking-tight">{initials}</span>
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
          {dragOver && !uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-(--primary-glass) backdrop-blur-sm pointer-events-none">
              <p className="text-body-3 font-medium text-(--primary)">Отпустите, чтобы загрузить</p>
            </div>
          )}
        </div>

        {!hideActions && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => inputRef.current?.click()}
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
                <TrashIcon className="size-4" /> Удалить
              </Button>
            )}
          </div>
        )}

        <p className="text-body-5 text-(--on-bg-low) leading-relaxed">
          Перетащите файл, вставьте из буфера или нажмите «Загрузить». До {maxSizeMb} МБ.
        </p>

        <ImageCropDialog
          file={cropFile}
          aspect={aspect}
          outputSize={outputSize}
          onCancel={() => setCropFile(null)}
          onComplete={onComplete}
        />
      </div>
    );
  },
);

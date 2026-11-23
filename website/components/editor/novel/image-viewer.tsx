"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowSquareOut,
  CaretLeft,
  CaretRight,
  X,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ViewerImage {
  src: string;
  alt?: string;
}

export function viewerStateFromImage(
  root: HTMLElement,
  image: HTMLImageElement,
): { images: ViewerImage[]; index: number } | null {
  const images = Array.from(root.querySelectorAll("img"));
  const index = images.indexOf(image);
  if (index < 0) return null;
  return {
    index,
    images: images.map((img) => ({
      src: img.getAttribute("src") || img.src,
      alt: img.getAttribute("alt") || "",
    })),
  };
}

interface Props {
  open: boolean;
  images: ViewerImage[];
  index: number;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
}

export function ImageViewer({
  open,
  images,
  index,
  onOpenChange,
  onIndexChange,
}: Props) {
  const count = images.length;
  const currentIndex = count > 0 ? ((index % count) + count) % count : 0;
  const current = images[currentIndex];
  const touchX = useRef<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      onIndexChange((currentIndex + delta + count) % count);
    },
    [count, currentIndex, onIndexChange],
  );

  useEffect(() => {
    setZoomed(false);
  }, [currentIndex, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, go, onOpenChange]);

  useEffect(() => {
    if (!open || count < 2) return;
    [images[(currentIndex + 1) % count], images[(currentIndex - 1 + count) % count]].forEach(
      (image) => {
        const preload = new Image();
        preload.src = image.src;
      },
    );
  }, [open, currentIndex, count, images]);

  if (!open || !current || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр изображений"
      className="fixed inset-0 z-[100000] flex flex-col bg-black text-white"
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 px-3 py-3 sm:px-5">
        <span className="text-body-4 text-white/60 tabular-nums">
          {currentIndex + 1} / {count}
        </span>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="text"
            size="icon-medium"
            shape="round"
            className="bg-white/10 text-white hover:bg-white/20"
          >
            <a href={current.src} target="_blank" rel="noreferrer" title="Открыть оригинал">
              <ArrowSquareOut />
              <span className="sr-only">Открыть оригинал</span>
            </a>
          </Button>
          <Button
            variant="text"
            size="icon-medium"
            shape="round"
            className="bg-white/10 text-white hover:bg-white/20"
            onClick={() => onOpenChange(false)}
            title="Закрыть"
          >
            <X />
            <span className="sr-only">Закрыть</span>
          </Button>
        </div>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col px-2 sm:px-16"
        onClick={(event) => {
          if (event.target === event.currentTarget) onOpenChange(false);
        }}
        onTouchStart={(event) => {
          touchX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchX.current === null) return;
          const delta = (event.changedTouches[0]?.clientX ?? 0) - touchX.current;
          if (Math.abs(delta) > 50) go(delta > 0 ? -1 : 1);
          touchX.current = null;
        }}
      >
        <div
          className="relative flex min-h-0 flex-1 items-center justify-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) onOpenChange(false);
          }}
        >
          {count > 1 && (
            <Button
              variant="text"
              size="icon-large"
              shape="round"
              className="absolute left-2 z-10 hidden bg-white/10 text-white hover:bg-white/20 sm:inline-flex"
              onClick={() => go(-1)}
              title="Предыдущее изображение"
            >
              <CaretLeft />
            </Button>
          )}

          <img
            src={current.src}
            alt={current.alt || ""}
            onDoubleClick={() => setZoomed((value) => !value)}
            className={cn(
              "max-h-full max-w-full cursor-zoom-in object-contain transition-transform duration-200 select-none",
              zoomed && "scale-150 cursor-zoom-out",
            )}
          />

          {count > 1 && (
            <Button
              variant="text"
              size="icon-large"
              shape="round"
              className="absolute right-2 z-10 hidden bg-white/10 text-white hover:bg-white/20 sm:inline-flex"
              onClick={() => go(1)}
              title="Следующее изображение"
            >
              <CaretRight />
            </Button>
          )}
        </div>

        {current.alt && (
          <p className="mx-auto max-w-2xl shrink-0 pb-3 text-center text-body-4 text-white/70">
            {current.alt}
          </p>
        )}
      </div>

      {count > 1 && (
        <div className="shrink-0 overflow-x-auto">
          <div className="mx-auto flex w-max gap-2 px-3 py-3">
            {images.map((image, imageIndex) => (
              <button
                key={`${image.src}-${imageIndex}`}
                type="button"
                onClick={() => onIndexChange(imageIndex)}
                title={image.alt || `Изображение ${imageIndex + 1}`}
                className={cn(
                  "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/20 transition-all sm:h-16 sm:w-16",
                  imageIndex === currentIndex
                    ? "opacity-100 ring-2 ring-white"
                    : "opacity-50 hover:opacity-90",
                )}
              >
                <img src={image.src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}

"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { XIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

let openLightbox: ((src: string, images: string[], currentIndex: number) => void) | null = null;

export function registerLightbox(fn: typeof openLightbox) {
  openLightbox = fn;
}

export function GalleryLightbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    registerLightbox((src, imgs, idx) => {
      setImages(imgs);
      setCurrentIndex(idx);
      setCurrentSrc(src);
      setIsOpen(true);
    });
    return () => {
      registerLightbox(null);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "ArrowLeft") {
        const next = (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(next);
        setCurrentSrc(images[next]);
      }
      if (e.key === "ArrowRight") {
        const next = (currentIndex + 1) % images.length;
        setCurrentIndex(next);
        setCurrentSrc(images[next]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <XIcon className="size-6" />
      </button>
      
      {images.length > 1 && (
        <button
          onClick={() => {
            const next = (currentIndex - 1 + images.length) % images.length;
            setCurrentIndex(next);
            setCurrentSrc(images[next]);
          }}
          className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <CaretLeftIcon className="size-8" />
        </button>
      )}

      <img
        src={currentSrc}
        alt="Gallery preview"
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
      />

      {images.length > 1 && (
        <button
          onClick={() => {
            const next = (currentIndex + 1) % images.length;
            setCurrentIndex(next);
            setCurrentSrc(images[next]);
          }}
          className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <CaretRightIcon className="size-8" />
        </button>
      )}
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>,
    document.body
  );
}

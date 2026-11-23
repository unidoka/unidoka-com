"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  currentIndex: number;
}

export function GalleryPreviewModal({ open, onOpenChange, images, currentIndex }: Props) {
  if (images.length === 0) return null;

  const handlePrev = () => {
    const next = (currentIndex - 1 + images.length) % images.length;
    // Note: parent should ideally manage currentIndex, but for simplicity we just trigger re-render via key or let parent handle it
    // In a real implementation, we'd lift currentIndex state up.
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-black/95 border-none text-white p-0">
        <DialogHeader className="absolute top-4 right-4 z-10">
          <DialogTitle className="sr-only">Gallery Preview</DialogTitle>
          <Button variant="text" size="icon-small" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/10">
            <XIcon className="size-5" />
          </Button>
        </DialogHeader>
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <img src={images[currentIndex]} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XIcon } from "@phosphor-icons/react";

export function MediaLightbox({ src, alt, children }: { src: string; alt: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* Force fullscreen by overriding all centering and constraints */}
      <DialogContent
        className="!fixed !inset-0 !z-50 !flex !items-center !justify-center !w-screen !h-screen !max-w-none !max-h-none !p-0 !border-0 !bg-black/95 !rounded-none !translate-none !top-0 !left-0"
        showCloseButton={false}
        style={{ transform: 'none' }}
      >
        <Button
          variant="text"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          size="icon-medium"
          onClick={() => setOpen(false)}
        >
          <XIcon className="size-6!" />
        </Button>
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            sizes="100vw"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

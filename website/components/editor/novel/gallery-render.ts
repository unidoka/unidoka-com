import { cn } from "@/lib/utils";

export function renderGallery(images: string[], captions: string[], layout: string, columns: number) {
  const colsClass = columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : "grid-cols-3";
  
  return `
    <div class="grid ${colsClass} gap-4 my-6">
      ${images.map((src, i) => `
        <div class="relative group rounded-xl overflow-hidden border border-(--outline) bg-(--bg)">
          <img src="${src}" alt="${captions[i] || ''}" class="w-full h-full object-cover aspect-[4/3]" loading="lazy" />
          ${captions[i] ? `<div class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 translate-y-full group-hover:translate-y-0 transition-transform">${captions[i]}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

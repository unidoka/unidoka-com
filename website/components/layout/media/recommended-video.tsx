"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRightIcon,
  PlayCircleIcon,
  VideoCameraIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { RecommendedVideo as RecommendedVideoData } from "@/utils/recommended-video-types";

interface Props {
  video: RecommendedVideoData | null;
  lang: "ru" | "en";
  className?: string;
}

export function RecommendedVideo({ video, lang, className }: Props) {
  const [preferVk, setPreferVk] = useState(false);
  const detectorRef = useRef<HTMLImageElement>(null);
  const detectorUrl =
    video?.provider === "youtube" ? video.thumbnailUrl : undefined;

  useEffect(() => {
    const image = detectorRef.current;
    if (!image || !detectorUrl) return;
    // Catch a thumbnail that failed before hydration attached onError.
    if (image.complete && image.naturalWidth === 0) setPreferVk(true);
  }, [detectorUrl]);

  if (!video) return null;

  const isEn = lang === "en";
  const fallback = video.provider === "youtube" ? video.fallback : undefined;
  const active = preferVk && fallback ? fallback : video;
  const providerLabel =
    active.provider === "youtube" ? "YouTube" : "VK Video";
  const providerIcon =
    active.provider === "youtube" ? (
      <YoutubeLogoIcon className="size-4" />
    ) : (
      <VideoCameraIcon className="size-4" />
    );

  return (
    <section
      className={cn("mt-20 border-t border-(--outline) pt-12", className)}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="min-w-0 text-heading-2">{active.title}</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {fallback && !preferVk && (
            <button
              type="button"
              onClick={() => setPreferVk(true)}
              className="inline-flex items-center gap-1.5 text-body-4 text-(--on-bg-low) transition-colors hover:text-(--primary)"
            >
              <VideoCameraIcon className="size-4" />
              VK Video
            </button>
          )}
          <a
            href={active.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-body-4 text-(--on-bg-low) transition-colors hover:text-(--primary)"
          >
            {providerIcon}
            {providerLabel}
            <ArrowUpRightIcon className="size-3.5" />
          </a>
        </div>
      </div>

      {active.embedUrl ? (
        <div className="relative aspect-video w-full overflow-hidden border border-(--outline) bg-(--card)">
          {/* If YouTube is blocked, its thumbnail fails too: swap to VK. */}
          {video.provider === "youtube" && fallback && video.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={detectorRef}
              src={video.thumbnailUrl}
              alt=""
              width={1}
              height={1}
              loading="eager"
              className="pointer-events-none absolute h-px w-px opacity-0"
              onError={() => setPreferVk(true)}
            />
          )}
          <iframe
            src={active.embedUrl}
            title={active.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full"
          />
        </div>
      ) : (
        <a
          href={active.url}
          target="_blank"
          rel="noreferrer"
          className="group relative flex aspect-video w-full items-center justify-center overflow-hidden border border-(--outline) bg-(--card)"
        >
          {active.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={active.thumbnailUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-[1.02]"
              onError={() => {
                if (fallback && !preferVk) setPreferVk(true);
              }}
            />
          ) : null}
          <span className="relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-body-4 text-white backdrop-blur-md">
            <PlayCircleIcon className="size-5" weight="fill" />
            {isEn ? `Watch on ${providerLabel}` : `Смотреть на ${providerLabel}`}
          </span>
        </a>
      )}
    </section>
  );
}

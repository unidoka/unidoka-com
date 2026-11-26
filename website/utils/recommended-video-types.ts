export type VideoLang = "ru" | "en";

export interface RecommendedVideo {
  provider: "youtube" | "vk";
  title: string;
  /** Public watch URL, used for the "open on ..." link. */
  url: string;
  /** Embeddable player URL. Null means render a link card instead. */
  embedUrl: string | null;
  thumbnailUrl?: string;
  /** VK video used when the YouTube player cannot be loaded. */
  fallback?: RecommendedVideo;
}

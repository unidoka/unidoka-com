import type { RecommendedVideo, VideoLang } from "./recommended-video-types";

const USER_AGENT =
  "Mozilla/5.0 (compatible; UnidokaBot/1.0; +https://unidoka.com)";
const ENV_SUFFIX: Record<VideoLang, string> = { ru: "RU", en: "EN" };

/**
 * Read a locale-specific channel setting.
 *
 * Names follow the iCal convention: `_RU` / `_EN`, with the bare name as
 * a legacy RU fallback, and the other locale as a last resort.
 */
function readChannelEnv(base: string, lang: VideoLang): string | null {
  const names = [base, base.replace(/^PUBLIC_/, "")];
  const other = lang === "ru" ? "EN" : "RU";

  for (const name of names) {
    const own = process.env[`${name}_${ENV_SUFFIX[lang]}`]?.trim();
    if (own) return own;

    if (lang === "ru") {
      const legacy = process.env[name]?.trim();
      if (legacy) return legacy;
    }

    const fallback = process.env[`${name}_${other}`]?.trim();
    if (fallback) return fallback;
  }

  return null;
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml,application/xml,application/json;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 900 },
    });
    if (!response.ok) return null;
    const text = await response.text();
    return text.length > 0 && text.length < 2_000_000 ? text : null;
  } catch {
    return null;
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) =>
      String.fromCodePoint(Number.parseInt(dec, 10)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

function xmlTag(xml: string, tag: string): string | null {
  const pattern = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`,
    "i",
  );
  const match = xml.match(pattern);
  return match ? decodeEntities(match[1]).trim() : null;
}

function channelIdFrom(value: string): string | null {
  const trimmed = value.trim();
  if (/^UC[\w-]{20,}$/.test(trimmed)) return trimmed;

  const patterns = [
    /\/channel\/(UC[\w-]+)/i,
    /[?&]channel_id=(UC[\w-]+)/i,
    /<yt:channelId>(UC[\w-]+)<\/yt:channelId>/i,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function resolveYouTubeChannelId(value: string): Promise<string | null> {
  const direct = channelIdFrom(value);
  if (direct) return direct;

  const pageUrl = /^https?:\/\//i.test(value)
    ? value
    : `https://www.youtube.com/@${value.replace(/^@/, "")}`;
  const html = await fetchText(pageUrl);
  if (!html) return null;

  const patterns = [
    /"channelId":"(UC[\w-]+)"/i,
    /"externalId":"(UC[\w-]+)"/i,
    /<meta[^>]+itemprop=["']identifier["'][^>]+content=["'](UC[\w-]+)["']/i,
    /[?&]channel_id=(UC[\w-]+)/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function fetchYouTubeVideo(channel: string): Promise<RecommendedVideo | null> {
  const isFeed = /feeds\/videos\.xml/i.test(channel);
  let feedUrl = isFeed ? channel : null;

  if (!feedUrl) {
    const channelId = await resolveYouTubeChannelId(channel);
    if (!channelId) return null;
    feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  }

  const xml = await fetchText(feedUrl);
  if (!xml) return null;

  const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/i)?.[1];
  if (!entry) return null;

  const videoId = xmlTag(entry, "yt:videoId");
  if (!videoId) return null;

  const title = xmlTag(entry, "title") || "YouTube";
  const thumbnail = entry.match(
    /<media:thumbnail[^>]+url=["']([^"']+)["']/i,
  )?.[1];

  return {
    provider: "youtube",
    title,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
    thumbnailUrl: thumbnail
      ? decodeEntities(thumbnail)
      : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}

function normalizeEscapedUrl(value: string): string {
  return decodeEntities(value)
    .replace(/\\u0026/gi, "&")
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"');
}

function metaContent(html: string, property: string): string | null {
  const tag = html.match(
    new RegExp(
      `<meta[^>]*(?:property|name)=["']${property}["'][^>]*>`,
      "i",
    ),
  )?.[0];
  const content = tag?.match(/content=["']([^"']*)["']/i)?.[1];
  return content ? decodeEntities(content) : null;
}

function findVkEmbed(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:video(?::secure_url|:url)?["'][^>]+content=["']([^"']+)["']/i,
    /"(?:player|embed_url|embedUrl|url)":"(https?:\\?\/\\?\/[^"]*video_ext\.php[^"]*)"/i,
    /(https?:\\?\/\\?\/vk(?:video)?\.(?:com|ru)\\?\/video_ext\.php\?[^"'<>\s]+)/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match?.[1]) continue;
    const url = normalizeEscapedUrl(match[1]);
    if (/video_ext\.php/i.test(url)) return url;
  }
  return null;
}

async function fetchVkVideo(channel: string): Promise<RecommendedVideo | null> {
  if (/video_ext\.php/i.test(channel)) {
    return {
      provider: "vk",
      title: "VK Video",
      url: channel,
      embedUrl: channel,
    };
  }

  const html = await fetchText(channel);
  if (!html) return null;

  const title = metaContent(html, "og:title") || "VK Video";
  const thumbnail = metaContent(html, "og:image") || undefined;
  const embedUrl = findVkEmbed(html);

  return {
    provider: "vk",
    title,
    url: channel,
    embedUrl,
    thumbnailUrl: thumbnail,
  };
}

/**
 * Latest video from the language's YouTube channel, falling back to VK
 * Video when YouTube is not configured or its feed cannot be read.
 * Returns null when neither channel is configured/available.
 */
export async function getRecommendedVideo(
  lang: VideoLang,
): Promise<RecommendedVideo | null> {
  const youtubeChannel =
    readChannelEnv("PUBLIC_YOUTUBE_CHANNEL_URL", lang) ||
    readChannelEnv("PUBLIC_YOUTUBE_CHANNEL_ID", lang);
  const vkChannel = readChannelEnv("PUBLIC_VK_VIDEO_CHANNEL_URL", lang);

  // Fetch both so the client can swap to VK when the YouTube player is
  // blocked but the server can still read the YouTube feed.
  const [youtube, vk] = await Promise.all([
    youtubeChannel ? fetchYouTubeVideo(youtubeChannel) : Promise.resolve(null),
    vkChannel ? fetchVkVideo(vkChannel) : Promise.resolve(null),
  ]);

  if (youtube) {
    return vk ? { ...youtube, fallback: vk } : youtube;
  }

  return vk;
}

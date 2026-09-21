"use client";
import { YMInitializer } from "react-yandex-metrika";

// Reads the counter id from env. If unset (local dev, previews),
// the component renders nothing so we never ship a broken counter.
const METRIKA_ID = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID ?? 0);

export function YandexMetrika() {
  if (!METRIKA_ID) return null;
  return (
    <YMInitializer
      accounts={[METRIKA_ID]}
      options={{
        webvisor: true,
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
      }}
    />
  );
}

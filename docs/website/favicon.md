# Favicon — two-theme setup

The site ships **two SVG favicons**, one for light browser chrome and one for dark. The browser picks the right one from the user's `prefers-color-scheme` setting. No JavaScript, no client-side detection.

## Files

| Path | Purpose |
|---|---|
| `website/public/icon-light.svg` | Dark mark on white tile. Emitted for `prefers-color-scheme: light`. |
| `website/public/icon-dark.svg` | Light mark on dark tile. Emitted for `prefers-color-scheme: dark`. |

Both are 64×64, `viewBox="0 0 64 64"`. Swap the `<rect>` + `<circle>` placeholders for the real mark — keep the `viewBox` so Next.js can compute `sizes="any"`.

## Why not `app/icon.svg`?

The `icon` file convention accepts `.svg` and auto-emits `<link rel="icon" sizes="any">` — but it cannot emit a **media-qualified** link. One file, one tag, no theme switch. The `metadata.icons` array in `app/layout.tsx` is the only supported place to attach `media`.

## Implementation

`app/layout.tsx`:

```ts
export const metadata: Metadata = {
  icons: {
    icon: [
      {
        rel: "icon",
        type: "image/svg+xml",
        url: "/icon-light.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        url: "/icon-dark.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};
```

Next.js emits:

```html
<link rel="icon" type="image/svg+xml" sizes="any" href="/icon-light.svg" media="(prefers-color-scheme: light)">
<link rel="icon" type="image/svg+xml" sizes="any" href="/icon-dark.svg"  media="(prefers-color-scheme: dark)">
```

`sizes="any"` is added automatically for `.svg` — without it, browsers can prefer a legacy `.ico` over the SVG, which would silently break the theme switch.

## Browser support

| Browser | Behaviour |
|---|---|
| Chrome | Works. Uses OS theme, or DevTools → Rendering → Emulate CSS `prefers-color-scheme`. |
| Safari | Works with the OS theme. |
| Firefox | OS theme works. **DevTools simulation does not** switch the icon — known regression, not a Next.js bug. Verify on a real OS theme toggle. |

## Adding a legacy `.ico`

Browsers older than SVG-favicon support (old Safari <16, old Edge) get no icon at all. To cover them, add a plain `favicon.ico` at `app/favicon.ico` — the file convention emits `<link rel="icon" sizes="any" href="/favicon.ico">` alongside the SVG pair. The browser will use the `.ico` only when it cannot render SVG.

## Adding an Apple touch icon

iOS home-screen icons **must be PNG** — iOS does not render SVG. Drop a 180×180 PNG at `app/apple-icon.png` and Next.js auto-detects it. The `apple:` key in `metadata.icons` is not needed; the file convention handles it.

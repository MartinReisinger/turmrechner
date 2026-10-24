# Development guide

[Back to README](../README.md)

## Develop and validate

Use Node.js 24 and the pnpm version in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm run dev --port 3000 --strictPort
pnpm verify
```

The preview is at http://127.0.0.1:3000. `pnpm verify` runs ESLint, Vitest, TypeScript checks, and the production build.
The development server uses hot reload. The production service worker is disabled during development.

To test installation and offline behavior against the production build:

```sh
pnpm build
pnpm preview --port 3001 --strictPort
```

Open http://127.0.0.1:3001 once while online, wait for the service worker to finish caching, then reopen offline.
iPhone installation requires HTTPS on a reachable host; a Mac's localhost is not reachable as iPhone localhost.

## Code organization

- `src/domain/`: pure arithmetic, presentation models, preferences, and validated session replay.
- `src/components/`: focused Vue views, reusable choice cards, native haptic tap targets, and icons.
- `src/composables/`: session actions, system-theme tracking, and demonstration animation lifecycle.
- `src/platform/`: browser storage, iOS detection, and vibration support.
- `src/i18n/`: typed German/English messages and device-language selection.
- `src/styles/`: shared layout, typography, and theme tokens.
- `public/`: icons served and cached with the app.

## Icons

Browser SVG/ICO favicons, the 180 px Apple touch icon, and 192/512 px manifest icons use
Lucide's `align-vertical-justify-end`. See [third-party notices](../THIRD_PARTY_NOTICES.md).
To regenerate raster assets with librsvg and ImageMagick:

```sh
rsvg-convert -b '#090a0c' -w 180 -h 180 public/favicon.svg -o public/apple-touch-icon.png
rsvg-convert -b '#090a0c' -w 192 -h 192 public/favicon.svg -o public/icon-192.png
rsvg-convert -b '#090a0c' -w 512 -h 512 public/favicon.svg -o public/icon-512.png
rsvg-convert -w 512 -h 512 public/favicon.svg -o /tmp/turmrechner-favicon.png
magick /tmp/turmrechner-favicon.png -define icon:auto-resize=48,32,16 public/favicon.ico
```

## Manual acceptance

Check the onboarding cards and animated mistake/correction, both languages, all themes, and reduced motion.
On iOS, check Home Screen installation, haptics on/off, keyboard-free keypad input, and safe-area layout.
Start a game, enter part of a column, close it, reopen, and try both resume choices.
Repeat in a production preview with the network disabled after the first load.

# Turmrechner

A configurable arithmetic practice PWA in German and English. Built with Vue 3, TypeScript, and Vite.
All calculations run on the device. No accounts, analytics, application API, or database are used.

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

## App behavior

The first launch introduces offline use, local data storage, and customization. On iOS, an animated guide explains
how to add the app to the Home Screen. The guide is skipped when launched in standalone mode or on other devices.
Users choose calculation previews, manual or mental carry handling, haptics, the optional timer,
light/dark/system mode, both color variants, and finally Easy/Normal/Hard. Easy is the default difficulty.
Preview, carry, and timer choices have no defaults and require an explicit selection to advance.
System mode, white, black, and enabled haptics are preselected.
The warm Monokai variant uses `#FDF6E3` paper colors with magenta, petrol, purple, and olive accents.
Dark variants are Black (left, default) and Monokai (right). Dark Monokai uses a `#272822` background
with pink, cyan, purple, and green accents. Saved Charcoal choices migrate to Black.
Color samples reflect the selected assistance options and show an unfinished digit with its cursor.

“Show” displays carries and remainders and requires entering them, including zero.
“In your head” asks for result digits only and computes carries/remainders internally.
A leading result digit such as the 1 in 4 × 3 = 12 always requires user input.
Switching modes during a game preserves the result already entered and resolves a pending carry if needed.
The settings icon opens every preference. Starting a new game keeps preferences.
“Reset everything” clears only this app's saved game/preferences/history and restarts onboarding after a native confirmation prompt.
Settings scroll without a visible scrollbar. The installation guide is part of onboarding only.
The app frame and keypad stay fixed while solving; long rows scroll inside the tower.
Onboarding, settings, and history scroll within the app only when their content exceeds the available height.
Language choices are Deutsch, English, and System (default). System follows the first supported device language,
with English as the fallback. Explicit language changes apply immediately to the entire interface.
All text uses `ui-rounded`, with `SF Pro Rounded` and system fallbacks. All UI icons use Lucide.

## Local storage and privacy

Three browser storage entries persist data only in this browser and origin:

- `turmrechner.preferences.v1`: version 3 preferences, including mode, timer, themes, and onboarding progress.
- `turmrechner.session.v1`: a seed draft or version 2 input/undo events, active time, and setting changes.
- `turmrechner.history.v1`: completed runs with the original seed, time, settings, and replayable answers.

Existing preferences and version 1 games migrate without deleting progress. Legacy games have no invented time.
The app replays accepted inputs to restore the exact result digit or carry/remainder input phase.
A reopened active game appears behind a blurred continue/start-fresh dialog. Briefly backgrounding the app does
not open that dialog. Finished games and seed drafts reopen directly. Invalid saved data resets only its own area.
If storage is blocked or full, the app remains usable in memory and reports the problem in settings.
Clearing website data, private browsing restrictions, or browser eviction can remove saved data.
Browsers, devices, and separately installed iOS app contexts may use separate storage; no synchronization is provided.

Inputs and preferences are never sent by the app. There are no third-party requests or remotely loaded fonts.
Fetching the app and checking for updates still make ordinary HTTP requests to the hosting server.
Those requests contain connection metadata; the privacy claim concerns application inputs and stored preferences.

## Modes, timing, and history

Easy blocks wrong inputs immediately and records failed attempts. Normal accepts all digits, checks at the end
of each row, and corrects mistakes with a right-to-left digit-wheel animation. Correct rows pulse green without
blocking the next input. Hard leaves wrong answers in place and evaluates only after the entire tower.
During a run, modes can only increase in difficulty; lower mode buttons are disabled. Starting a new game unlocks all modes.
Mode changes take effect at the next row; other preferences apply immediately and all changes are recorded.
Undo is available in Normal/Hard. It restores the previous input including any automatic carry, while retaining
mistake history. Every visible result digit, including leading digits, always requires input.

The optional timer replaces the step counter; the progress bar remains unchanged. Time is recorded even when
hidden. Only active solving counts: settings, history, background, the resume prompt, and automatic row correction
pause the clock. Finished runs are archived once; deleting a run does not cause it to reappear after reopening.
Best times are for error-free runs, grouped by Easy/Normal/Hard or mixed modes.

The history button sits beside settings. Tap a row for details; swipe left to delete, with undo available briefly.
Rows show seed/time above date/error count. Regional dates use 24-hour time; Austria uses day.month.year.
The settings summary lists each option once with all its distinct values. Detailed change timestamps remain stored.

Review colors identify correct input (green), a genuine local mistake (red), and a correctly computed consequence
of an earlier mistake (yellow). Failed and undone attempts remain visible. Native sharing generates a local PNG
of the entire reviewed tower and includes https://turmrechner.martindev.at/ in the image and share payload.
There is no upload endpoint or additional download/copy interface. Sharing images requires native file sharing
support; the user selects the destination in the device share sheet.

## Offline and updates

The manifest and generated Workbox service worker cache the app shell, bundled code, styles, and icons.
The app works offline after the first complete production load. New versions wait instead of forcing a reload.
When an update is ready, settings offers an explicit reload action. Saved game state survives that reload.

## Code organization

- `src/domain/`: pure arithmetic, presentation models, preferences, and validated session replay.
- `src/components/`: focused Vue views, reusable choice cards, native haptic tap targets, and icons.
- `src/composables/`: session actions, system-theme tracking, and demonstration animation lifecycle.
- `src/platform/`: browser storage, iOS detection, and vibration support.
- `src/i18n/`: typed German/English messages and device-language selection.
- `src/styles/`: shared layout, typography, and theme tokens.
- `public/`: icons served and cached with the app.

## Production

- URL: https://turmrechner.martindev.at
- Repository: https://git.martindev.at/MartinReisinger/turmrechner
- Flow: Forgejo Actions → Docker Compose → host Caddy.
- Host directory: `/home/deploy/turmrechner`.
- Binding: `127.0.0.1:3016` → container port `8080`.
- Runtime: BusyBox httpd as an unprivileged user with a read-only filesystem.

The multistage Docker build installs pinned dependencies, runs validation, and copies only `dist/` to the runtime.
After push approval, pushes to `main` deploy automatically; Markdown-only changes skip deployment.
The workflow uses `vps-runner`, `local/runner-env`, and the existing `REGISTRY_TOKEN` user secret.
Images carry the Git revision label and commit tag. Compose deploys that exact tag.
The host `.env` records `DEPLOY_COMMIT` after a successful deploy.
No server-side user data or SQLite backup registration is needed.

Connect with `ssh vps-codex`, then run:

```sh
cd /home/deploy/turmrechner
sudo docker compose ps
sudo docker compose logs --tail=50
curl --fail http://127.0.0.1:3016/ --output /dev/null
```

To roll back, set `DEPLOY_COMMIT` in the host `.env` to an available image commit, then run
`sudo docker compose up -d --wait`. Caddy configuration lives in `/etc/caddy/Caddyfile`.
Clients with a service worker may retain cached code until they close every app tab or accept an available update.

## Icons

Browser SVG/ICO favicons, the 180 px Apple touch icon, and 192/512 px manifest icons use
Lucide's `align-vertical-justify-end`. See [third-party notices](THIRD_PARTY_NOTICES.md).
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

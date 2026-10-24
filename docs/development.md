# Development and deployment guide

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


## Production deployment

- URL: https://turmrechner.com
- Previous domain: `turmrechner.martindev.at` permanently redirects to the new domain, preserving paths and queries.
- Repository: https://github.com/MartinReisinger/turmrechner
- Source: GitHub is the primary repository; `forgejo` retains the previous repository.
- Flow: GitHub Actions → GHCR → restricted SSH → Docker Compose → host Caddy.
- Host directory: `/home/deploy/turmrechner`.
- Binding: `127.0.0.1:3016` → container port `8080`.
- Runtime: BusyBox httpd as an unprivileged user with a read-only filesystem.

The multistage Docker build installs pinned dependencies, runs validation, and copies only `dist/` to the runtime.
After push approval, pushes to GitHub `main` deploy automatically; Markdown-only changes skip deployment.
The workflow uses GitHub-hosted runners and its temporary `GITHUB_TOKEN` for GHCR.
Repository secrets `SSH_PRIVATE_KEY`, `SSH_HOST`, and `SSH_KNOWN_HOSTS` configure deployment.
The dedicated SSH key is restricted to `/usr/local/sbin/deploy-turmrechner`, installed from
`deploy/vps/deploy-github.sh`. It accepts only a full commit SHA and reads the temporary registry token over stdin.
It downloads that revision's Compose file, pulls its image, and waits for health before recording the revision.
If startup fails, it restores the previous Compose service. Registry credentials are removed after each attempt.
Images carry the Git revision label and commit tag. Compose deploys that exact tag.
The host `.env` records `DEPLOY_COMMIT` after a successful deploy and preserves existing settings.
Set `CONTACT_EMAIL` in that ignored file. The container generates `/runtime/config.js` on a small tmpfs at startup;
the service worker excludes this file from its cache. The Impressum reveals the address only after a click.
The privacy page links to the Impressum without displaying an address.
For local development, set `VITE_CONTACT_EMAIL` in an ignored `.env` file. Keep personal addresses out of Git.
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

Browser storage and installed web apps belong to their origin. Saved runs, achievements, and preferences
do not transfer from the previous domain. Install the app again from the new domain if needed.

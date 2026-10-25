# Turmrechner

Practice written multiplication and division in an arithmetic tower. Choose when answers are checked,
review mistakes, and track your times. Turmrechner is an installable web app in German and English.
It stores games locally and works offline after its first complete load.

The visual design is heavily inspired by Trade Republic's clean monochrome aesthetic.

[Open Turmrechner](https://turmrechner.com/?ref=github)

<p align="center">
  <img src="docs/onboarding-infos.png" alt="Turmrechner onboarding and app features" height="420" />
  <img src="docs/tower-arithmetic-task.png" alt="A tower arithmetic task in Turmrechner" height="420" />
</p>

## Get started

Open the app, choose your preferences, and enter a starting number or generate one at random.
Use the on-screen keypad or your keyboard to solve the tower.

- Easy blocks incorrect inputs. Normal corrects mistakes after each row and locks checked rows.
  Hard checks the completed tower and allows deleting back into earlier rows.
- Calculation previews, carries and remainders, and the visible timer are optional.
- Run history stores your starting number, time, mistakes, and settings on your device.
- Nine achievements celebrate your progress. Open the trophy to see your collection and share unlocked achievements.
- Native sharing creates an image of your results with a link to the app.

The app works offline after its first complete load. On iPhone, use Safari's **Add to Home Screen**
to install it. On iPhone and iPad, onboarding includes an installation guide directly after the introduction.

On mobile, the app stays in a playable portrait frame even when the device is held horizontally.
The installed app requests a portrait lock; browsers that ignore it use a counter-rotated portrait frame.

No account is needed. Game data stays in your browser, with no sync between devices.
Clearing website data also deletes saved runs and achievements. See [app behavior and privacy](docs/app.md) for details.

## Stack

### App

[![Vue 3](https://img.shields.io/badge/Vue%203-35495E?style=flat&logo=vuedotjs&logoColor=4FC08D)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-35495E?style=flat&logo=typescript&logoColor=3178C6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-35495E?style=flat&logo=vite&logoColor=646CFF)](https://vite.dev/)
[![Vite PWA](https://img.shields.io/badge/Vite%20PWA-35495E?style=flat&logo=pwa&logoColor=5A0FC8)](https://vite-pwa-org.netlify.app/)
[![Workbox](https://img.shields.io/badge/Workbox-35495E?style=flat)](https://developer.chrome.com/docs/workbox/)
[![Lucide](https://img.shields.io/badge/Lucide-35495E?style=flat&logo=lucide&logoColor=F56565)](https://lucide.dev/)

### Development

[![Node.js 24](https://img.shields.io/badge/Node.js%2024-35495E?style=flat&logo=nodedotjs&logoColor=5FA04E)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-35495E?style=flat&logo=pnpm&logoColor=F69220)](https://pnpm.io/)
[![Vitest](https://img.shields.io/badge/Vitest-35495E?style=flat&logo=vitest&logoColor=6E9F18)](https://vitest.dev/)
[![Vue Test Utils](https://img.shields.io/badge/Vue%20Test%20Utils-35495E?style=flat&logo=vuedotjs&logoColor=4FC08D)](https://test-utils.vuejs.org/)
[![Happy DOM](https://img.shields.io/badge/Happy%20DOM-35495E?style=flat)](https://github.com/capricorn86/happy-dom)
[![ESLint](https://img.shields.io/badge/ESLint-35495E?style=flat&logo=eslint&logoColor=A78BFA)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-35495E?style=flat&logo=prettier&logoColor=F7B93E)](https://prettier.io/)

### Deployment

[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-35495E?style=flat&logo=githubactions&logoColor=2088FF)](https://github.com/MartinReisinger/turmrechner/actions)
[![Docker](https://img.shields.io/badge/Docker-35495E?style=flat&logo=docker&logoColor=2496ED)](https://www.docker.com/)
[![BusyBox](https://img.shields.io/badge/BusyBox-35495E?style=flat)](https://busybox.net/)
[![Caddy](https://img.shields.io/badge/Caddy-35495E?style=flat&logo=caddy&logoColor=1F88C0)](https://caddyserver.com/)

## Develop locally

Use Node.js 24 and pnpm 11.6.0, as recorded in [package.json](package.json).

```bash
pnpm install --frozen-lockfile
pnpm run dev --port 3000 --strictPort
```

Open http://127.0.0.1:3000. To run lint, tests, TypeScript checks, and the production build:

```bash
pnpm verify
```

See the [development guide](docs/development.md) for code organization, offline previews, icon generation,
and GitHub Actions deployment.

## Help and contributions

Report bugs and suggest improvements in the [issue tracker](https://github.com/MartinReisinger/turmrechner/issues).
For bugs, include reproduction steps, your device and browser, and the selected game mode.

Martin Reisinger maintains this project. For contributions, keep changes focused, run `pnpm verify`,
and describe the resulting behavior in your pull request.

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-97CA00?style=flat)](LICENSE)

Copyright 2026 Martin Reisinger.
[Third-party notices](THIRD_PARTY_NOTICES.md) cover the Lucide icons.

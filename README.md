# Turmrechner

Practice written multiplication and division in an arithmetic tower. Choose when answers are checked,
review mistakes, and track your times. Turmrechner is an installable web app in German and English,
built with Vue 3, TypeScript, and Vite.

[Open Turmrechner](https://turmrechner.martindev.at/)

## Get started

Open the app, choose your preferences, and enter a starting number or generate one at random.
Use the on-screen keypad or your keyboard to solve the tower.

- Easy blocks incorrect inputs. Normal corrects mistakes after each row. Hard checks the completed tower.
- Calculation previews, carries and remainders, and the visible timer are optional.
- Run history stores your starting number, time, mistakes, and settings on your device.
- Native sharing creates an image of your results with a link to the app.

The app works offline after its first complete load. On iPhone, use Safari's **Add to Home Screen**
to install it. An installation guide is included in onboarding.

No account is needed. Game data stays in your browser, with no sync between devices.
Clearing website data also deletes saved runs. See [app behavior and privacy](docs/app.md) for details.

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

See the [development guide](docs/development.md) for code organization, offline previews, and icon generation.
The [deployment guide](docs/deployment.md) describes the Forgejo Actions and Docker setup.

## Help and contributions

Report bugs and suggest improvements in the [issue tracker](https://git.martindev.at/MartinReisinger/turmrechner/issues).
For bugs, include reproduction steps, your device and browser, and the selected game mode.

Martin Reisinger maintains this project. For contributions, keep changes focused, run `pnpm verify`,
and describe the resulting behavior in your pull request.

## License

[MIT](LICENSE), copyright 2026 Martin Reisinger.
[Third-party notices](THIRD_PARTY_NOTICES.md) cover the Lucide icons.

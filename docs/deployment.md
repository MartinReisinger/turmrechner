# Deployment guide

[Back to README](../README.md)

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

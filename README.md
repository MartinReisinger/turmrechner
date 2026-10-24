# Turmrechner

Standalone German arithmetic practice app. All HTML, CSS, and JavaScript live in `index.html`.
No dependencies, build step, database, or application secrets are required.

## Local preview

Run `python3 -m http.server 3000 --bind 127.0.0.1`, then open http://localhost:3000.

## Production

- URL: https://turmrechner.martindev.at
- Repository: https://git.martindev.at/MartinReisinger/turmrechner
- Deployment: Forgejo Actions → Docker Compose → host Caddy.
- Host directory: `/home/deploy/turmrechner`.
- Binding: `127.0.0.1:3016` → container port `8080`.
- Runtime: BusyBox httpd as an unprivileged user with a read-only filesystem.

Pushes to `main` deploy automatically. Markdown-only changes skip deployment.
The workflow uses `vps-runner`, `local/runner-env`, and the existing `REGISTRY_TOKEN` user secret.
Images carry the Git revision label and commit tag. Compose deploys that exact tag.
The host `.env` records `DEPLOY_COMMIT` after a successful deploy.
No persistent application data or database backup registration is needed.

## Operations

Connect with `ssh vps-codex`, then run:

```sh
cd /home/deploy/turmrechner
sudo docker compose ps
sudo docker compose logs --tail=50
curl --fail http://127.0.0.1:3016/ --output /dev/null
```

To roll back, set `DEPLOY_COMMIT` in the host `.env` to a previous available image commit,
then run `sudo docker compose up -d --wait`. Caddy configuration lives in `/etc/caddy/Caddyfile`.

# Deployment guide

[Back to README](../README.md)

## Production

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

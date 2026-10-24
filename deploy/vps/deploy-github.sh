#!/bin/sh
# Installed on VPS-M; a dedicated SSH key can invoke only this command.
set -eu
revision=${SSH_ORIGINAL_COMMAND:-}
case "$revision" in
  ''|*[!0-9a-f]*) echo 'Expected a Git commit SHA' >&2; exit 1 ;;
esac
test "${#revision}" -eq 40
cd /home/deploy/turmrechner
exec 9>.deploy.lock
flock -x 9
umask 077
auth_dir=$(mktemp -d)
trap 'rm -rf "$auth_dir"; rm -f compose.next.yml .env.next' EXIT
IFS= read -r registry_token
printf '%s\n' "$registry_token" | docker --config "$auth_dir" login \
  ghcr.io -u martinreisinger --password-stdin
unset registry_token
curl --fail --silent --show-error --location \
  "https://raw.githubusercontent.com/MartinReisinger/turmrechner/$revision/deploy/vps/compose.yml" \
  --output compose.next.yml
test -s .env
sed '/^DEPLOY_COMMIT=/d' .env > .env.next
printf '\nDEPLOY_COMMIT=%s\n' "$revision" >> .env.next
docker --config "$auth_dir" compose -p turmrechner -f compose.next.yml --env-file .env.next config -q
docker --config "$auth_dir" compose -p turmrechner -f compose.next.yml --env-file .env.next pull
if ! docker --config "$auth_dir" compose -p turmrechner -f compose.next.yml --env-file .env.next \
  up -d --wait --wait-timeout 120; then
  docker compose -p turmrechner -f compose.yml --env-file .env up -d --wait --wait-timeout 120
  exit 1
fi
mv compose.next.yml compose.yml
mv .env.next .env
docker compose -p turmrechner ps
curl --fail --silent --show-error --output /dev/null http://127.0.0.1:3016/

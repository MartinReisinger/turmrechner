#!/bin/sh
set -eu
: "${CONTACT_EMAIL:?CONTACT_EMAIL is required}"
case "$CONTACT_EMAIL" in
  *[!a-zA-Z0-9@._+-]*|*@*@*|@*|*@) echo "Invalid contact email" >&2; exit 1 ;;
  *@*.*) ;;
  *) echo "Invalid contact email" >&2; exit 1 ;;
esac
printf 'window.appConfig = { contactEmail: "%s" };\n' "$CONTACT_EMAIL" > /www/runtime/config.js
exec httpd -f -p 8080 -h /www

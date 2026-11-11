#!/bin/sh
# Tells IndexNow (Bing, and through it ChatGPT's search) that the site's pages
# changed. Run after a push, once Pages has deployed it:
#   tools/indexnow.sh            every URL of sitemap.xml
#   tools/indexnow.sh URL...     only these
# The key is the 32-hex .txt file in the site's root. It lies under /getboop/,
# not at the host's root, so keyLocation is sent and only URLs under /getboop/
# may be submitted. Prints the response code: 200 or 202 is a success.
set -eu
cd "$(dirname "$0")/.."
BASE="https://alobanov.github.io/getboop"
KEY=$(ls | grep -E '^[0-9a-f]{32}\.txt$' | head -1 | sed 's/\.txt$//')
[ -n "$KEY" ] || { echo "no key file in the site's root" >&2; exit 1; }
if [ $# -gt 0 ]; then
  URLS=$(printf '%s\n' "$@")
else
  URLS=$(sed -n 's:.*<loc>\(.*\)</loc>.*:\1:p' sitemap.xml)
fi
for u in $URLS; do
  case "$u" in "$BASE"/*) ;; *) echo "not under $BASE/: $u" >&2; exit 1;; esac
done
LIST=$(printf '%s\n' $URLS | sed 's/.*/"&"/' | paste -sd, -)
BODY="{\"host\":\"alobanov.github.io\",\"key\":\"$KEY\",\"keyLocation\":\"$BASE/$KEY.txt\",\"urlList\":[$LIST]}"
CODE=$(curl -sS -o /dev/stderr -w '%{http_code}' -X POST https://api.indexnow.org/indexnow \
  -H 'Content-Type: application/json; charset=utf-8' -d "$BODY")
echo "IndexNow: $CODE"
case "$CODE" in 200|202) ;; *) exit 1;; esac

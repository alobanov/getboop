#!/bin/sh
# Writes sitemap.xml: every page of the site, its lastmod the day of the last
# commit that touched it. Run after committing the pages, then commit the sitemap.
set -eu
cd "$(dirname "$0")/.."
BASE="https://alobanov.github.io/getboop"
{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  for page in "" privacy/ support/ changelog/ faq/ ja/faq/ zh-hant/faq/ ko/faq/ ru/faq/ \
      private-diary-no-account/ photo-to-sketch-diary/; do
    day=$(git log -1 --format=%cs -- "${page}index.html")
    echo "  <url><loc>$BASE/$page</loc><lastmod>$day</lastmod></url>"
  done
  echo '</urlset>'
} > sitemap.xml
cat sitemap.xml

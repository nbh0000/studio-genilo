#!/bin/sh
# git 추적 파일 + 새 파일(무시 목록 제외)만 .dist 에 복사해 Cloudflare 정적 자산으로 올린다.
set -e
cd "$(dirname "$0")"
rm -rf .dist && mkdir .dist
git ls-files -co --exclude-standard | grep -vE '^(wrangler\.jsonc|deploy-dist\.sh|build\.py|_landing_backup\.html|\.gitignore)$' | while read -r f; do
  mkdir -p ".dist/$(dirname "$f")" && cp "$f" ".dist/$f"
done
echo "files: $(find .dist -type f | wc -l)"

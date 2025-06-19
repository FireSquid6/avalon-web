#!/usr/bin/env bash

cd "$(dirname "$0")" || exit
cd ../packages/server || exit

echo "GENREATION FOR LOCAL:"
bunx drizzle-kit generate --config ./configs/drizzle-dev.config.ts
echo ""

echo "GENREATION FOR REMOTE:"
bunx drizzle-kit generate --config ./configs/drizzle-prod.config.ts
echo ""

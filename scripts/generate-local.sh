#!/usr/bin/env bash

cd "$(dirname "$0")" || exit
cd ../src/backend || exit

echo "GENREATION FOR LOCAL:"
bunx drizzle-kit generate --config ./configs/drizzle-dev.config.ts
echo ""


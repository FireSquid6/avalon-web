#!/usr/bin/env bash

cd "$(dirname "$0")" || exit
set -a
source ./.remote-config || exit
set +a

cd ../src/backend || exit
echo "GENREATION FOR REMOTE:"
bunx drizzle-kit generate --config ./configs/drizzle-prod.config.ts
echo ""

#!/usr/bin/env bash

cd "$(dirname "$0")" || exit

./remote-env.sh

cd ./src/backend || exit
echo "MIGRATING FOR REMOTE:"
bunx drizzle-kit migrate --config ./configs/drizzle-prod.config.ts
echo ""

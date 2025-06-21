#!/usr/bin/env bash

cd "$(dirname "$0")" || exit
cd ../src/backend || exit

bunx drizzle-kit studio --config ./configs/drizzle-prod.config.ts

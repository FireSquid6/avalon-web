#!/usr/bin/env bash

cd "$(dirname "$0")" || exit

set -a
source ./.remote-config || exit
set +a

echo $AVALON_PORT
echo $AVALON_DB_PATH
echo $AVALON_DB_TYPE
echo $AVALON_DB_TOKEN

cd ../src/backend || exit
echo "MIGRATING FOR REMOTE:"
bunx drizzle-kit migrate --config ./configs/drizzle-prod.config.ts
echo ""

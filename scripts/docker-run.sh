#!/usr/bin/env bash

# always start in root directory
cd "$(dirname "$0")" || exit
cd .. || exit

if [ ! -f packages/server/.env.local ]; then
  echo "no .env.local file in server"
  exit 1
fi

source "packages/server/.env.local"

docker run \
     -p 4320:4320 \
     -e AVALON_PORT="$AVALON_PORT" \
     -e AVALON_DB_PATH="$AVALON_DB_PATH" \
     -e AVALON_DB_TOKEN="$AVALON_DB_TOKEN" \
     -e AVALON_DB_TYPE="$AVALON_DB_TYPE" \
     firesquid/avalon:latest

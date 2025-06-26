#!/usr/bin/env bash

# always start in root directory
cd "$(dirname "$0")" || exit

set -a
source ./.remote-config || exit
set +a

cd .. || exit


docker run \
     -p 4320:4320 \
     -e AVALON_PORT="$AVALON_PORT" \
     -e AVALON_DB_PATH="$AVALON_DB_PATH" \
     -e AVALON_DB_TOKEN="$AVALON_DB_TOKEN" \
     -e AVALON_DB_TYPE="$AVALON_DB_TYPE" \
     firesquid/avalon:latest

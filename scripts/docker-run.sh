#!/usr/bin/env bash

cd "$(dirname "$0")" || exit
cd .. || exit

docker run \
     -p 4320:4320 \
     -v "$(pwd)"/app_data:/data \
     -e CONFIG_FILE_PATH=/data/avalon-config.yaml \
     firesquid/avalon:latest

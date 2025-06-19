#!/usr/bin/env bash

cd "$(dirname "$0")" || exit
cd .. || exit

docker run \
     -p 4320:4320 \
     -e CONFIG_FILE_PATH=./app_data/avalon-config.yaml \
     firesquid/avalon:latest

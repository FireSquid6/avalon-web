#!/usr/bin/env bash


cd "$(dirname "$0")" || exit
cd ..


CONFIG_FILE_PATH="$(realpath "app_data/avalon-config.yaml")"
export CONFIG_FILE_PATH

bun run ./packages/server/main.ts

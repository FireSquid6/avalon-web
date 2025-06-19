#!/usr/bin/env bash


cd "$(dirname "$0")" || exit
cd ../packages/client || exit

bun run build

cp -r ./dist ../../dist

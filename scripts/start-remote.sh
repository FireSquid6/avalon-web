#!/usr/bin/env bash

cd "$(dirname "$0")" || exit
set -a
source ./.remote-config || exit
set +a

cd .. || exit
bun run start

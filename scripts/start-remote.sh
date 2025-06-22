#!/usr/bin/env bash

cd "$(dirname "$0")" || exit

./remote-env.sh

cd .. || exit
bun run start

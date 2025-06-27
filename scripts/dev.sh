#!/usr/bin/env bash
cd "$(dirname "$0")" || exit
cd .. || exit

AVALON_PORT=4320
AVALON_DB_PATH=./store/db.sqlite
AVALON_DB_TYPE=local

export AVALON_PORT
export AVALON_DB_PATH
export AVALON_DB_TYPE
export AVALON_DB_TOKEN

bun run dev

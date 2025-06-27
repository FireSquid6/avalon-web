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

SCRIPTNAME=$1

if [ -z "$SCRIPTNAME" ]; then
  echo "No script name provided"
  exit 1
fi

FILENAME="./src/one-off/$SCRIPTNAME.ts"

if [ ! -f "$FILENAME" ]; then
  echo "File $FILENAME does not exist"
  exit 1
fi


bun run "$FILENAME"

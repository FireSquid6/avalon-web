#!/usr/bin/env bash

cd "$(dirname "$0")" || exit
set -a
source ./.remote-config || exit
set +a

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

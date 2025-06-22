#!/usr/bin/env bash

cd "$(dirname "$0")" || exit


if [ ! -f ./.remote-config ]; then
  echo "No .remoteconfig in scripts. Please add it if you'd like to start the app using a remote databaes"
  exit 1
fi

source ./.remote-config || exit

export AVALON_PORT
export AVALON_DB_PATH
export AVALON_DB_TYPE
export AVALON_DB_TOKEN

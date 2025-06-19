# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base

# setup essential packages
RUN apt-get update && apt-get install -y python3 python-is-python3 build-essential

# setup app
RUN mkdir -p /codebase
COPY . /codebase
WORKDIR /codebase
RUN bun install --frozen-lockfile

EXPOSE 3120/tcp
ENTRYPOINT ["bun", "run", "packages/server/main.ts"]

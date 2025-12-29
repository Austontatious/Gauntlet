#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="gauntlet-postgres"
POSTGRES_USER="gauntlet"
POSTGRES_PASSWORD="gauntlet"
POSTGRES_DB="gauntlet"
PORT="${PORT:-5432}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required to run the dev database." >&2
  exit 1
fi

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker start "${CONTAINER_NAME}" >/dev/null
  echo "Started existing container ${CONTAINER_NAME}."
  exit 0
fi

set -x

docker run -d \
  --name "${CONTAINER_NAME}" \
  -e POSTGRES_USER="${POSTGRES_USER}" \
  -e POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
  -e POSTGRES_DB="${POSTGRES_DB}" \
  -p "${PORT}:5432" \
  postgres:16

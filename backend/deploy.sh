#!/usr/bin/env bash
set -e

echo "Starting [BACKEND] deployment..."

cd "$APP_DIR/backend"

bun run types
pm2 reload ecosystem.config.cjs --env production
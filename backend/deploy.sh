#!/usr/bin/env bash
set -e

cd "$APP_DIR/backend"

bun run types
pm2 reload ecosystem.config.cjs --env production
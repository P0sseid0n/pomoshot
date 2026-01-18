#!/usr/bin/env bash
set -e

echo "Starting [BACKEND] deployment..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

bun run types
pm2 reload ecosystem.config.cjs --env production
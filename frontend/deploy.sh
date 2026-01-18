#!/usr/bin/env bash
set -e

echo "Starting [FRONTEND] deployment..."

cd "$APP_DIR/frontend"

bun run build
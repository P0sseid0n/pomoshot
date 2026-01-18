#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export APP_DIR="$SCRIPT_DIR/"

git pull
bun install

"$SCRIPT_DIR/backend/deploy.sh"
"$SCRIPT_DIR/frontend/deploy.sh"
#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export APP_DIR="$SCRIPT_DIR/"

export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

cd "$SCRIPT_DIR"
git pull
bun install

"backend/deploy.sh"
"frontend/deploy.sh"
#!/usr/bin/env bash
set -e

echo "Starting [FRONTEND] deployment..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

bun run build
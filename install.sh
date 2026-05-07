#!/usr/bin/env bash
# MarkdownOps — install + build every MCP server.
# Usage:
#   ./install.sh              install all servers
#   ./install.sh github jira  install only the listed servers

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALL_SERVERS=(github gitlab jira linear notion asana)

if [ "$#" -gt 0 ]; then
  SERVERS=("$@")
else
  SERVERS=("${ALL_SERVERS[@]}")
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required but not installed." >&2
  echo "Install Node.js (>=18): https://nodejs.org/" >&2
  exit 1
fi

for s in "${SERVERS[@]}"; do
  dir="$ROOT/mcp-servers/$s"
  if [ ! -d "$dir" ]; then
    echo "Warning: skipping unknown server '$s' (no $dir)" >&2
    continue
  fi
  echo
  echo "==> install mcp-servers/$s"
  ( cd "$dir" && npm install --no-audit --no-fund && npm run build )
done

echo
echo "Done."
echo "Each MCP server binary is at: mcp-servers/<name>/dist/index.js"
echo "Wire into your runtime — see runners/<your-runtime>.md."

#!/bin/bash
SCRIPT_DIR="$(dirname "$0")"
if [[ -f "$SCRIPT_DIR/dist/index.js" ]]; then
    # Development mode
    cd "$SCRIPT_DIR"
    exec node dist/index.js "$@"
else
    # Nix build mode - the script is in lib/node_modules/mcp-macos/
    exec node "$SCRIPT_DIR/dist/index.js" "$@"
fi
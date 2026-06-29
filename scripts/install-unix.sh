#!/bin/sh

INSTALL_DIR=${AISH_INSTALL_DIR:-$HOME/.local/aish}
BIN_DIR=$INSTALL_DIR/bin
mkdir -p "$BIN_DIR"

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR" || exit 1

cargo build --release -p aish-provider-shell || exit 1
cp "$ROOT_DIR/target/release/aish" "$BIN_DIR/aish" || exit 1

if [ "$AISH_SKIP_MODEL" != "1" ]; then
  "$BIN_DIR/aish" --setup
fi

echo "AiSH provider shell installed at $BIN_DIR/aish"
echo "Add $BIN_DIR to PATH if your shell cannot find aish."

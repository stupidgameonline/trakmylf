#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node is not installed. Install Node.js 18+ first." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed. Install npm first." >&2
  exit 1
fi

echo "Installing dependencies..."
if [ -f "package-lock.json" ]; then
  npm ci
else
  npm install
fi

echo "Building production bundle..."
npm run build

if [ ! -d "dist" ]; then
  echo "Error: dist folder was not generated." >&2
  exit 1
fi

ZIP_NAME="this-life-netlify-drop.zip"
rm -f "$ZIP_NAME"

echo "Packaging dist into $ZIP_NAME..."
(
  cd dist
  zip -r "../$ZIP_NAME" . >/dev/null
)

echo "Done: $ROOT_DIR/$ZIP_NAME"
echo "Upload this ZIP (or the dist folder) in Netlify Drop."

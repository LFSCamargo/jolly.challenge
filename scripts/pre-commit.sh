#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/.." && pwd)"
if [[ -d "${root_dir}/node_modules/.pnpm" ]]; then
  package_manager="pnpm"
else
  package_manager="npm"
fi

"${package_manager}" run check:spaghetti
"${package_manager}" run check:security
"${package_manager}" run knip
"${package_manager}" run lint
"${package_manager}" run typecheck

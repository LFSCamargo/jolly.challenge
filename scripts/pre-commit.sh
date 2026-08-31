#!/usr/bin/env bash
set -euo pipefail

npm run check:spaghetti
npm run check:security
npm run knip
npm run lint
npm run typecheck

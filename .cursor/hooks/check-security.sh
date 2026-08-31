#!/usr/bin/env bash
# Runs static security checks after security-sensitive file edits or when an agent turn completes.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

input=$(cat)
file_path=""

if [[ -n "$input" ]]; then
  file_path=$(printf '%s' "$input" | node -e "
    let d = '';
    process.stdin.on('data', (c) => { d += c; });
    process.stdin.on('end', () => {
      try {
        const i = JSON.parse(d);
        process.stdout.write(i.file_path || i.path || '');
      } catch {
        process.stdout.write('');
      }
    });
  " 2>/dev/null || true)
fi

if [[ -n "$file_path" ]] && [[ ! "$file_path" =~ src/(modules|common)/ ]]; then
  exit 0
fi

if [[ -n "$file_path" ]]; then
  node scripts/check-security.mjs --changed "$file_path" || exit 2
else
  node scripts/check-security.mjs || exit 2
fi

exit 0

#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Security checker — frontend static rules for the Jolly challenge app.
 * Run: node scripts/check-security.mjs [--changed <file>]
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')

const SCAN_ROOTS = [join(ROOT, 'src/modules'), join(ROOT, 'src/common')]

const violations = []

const read = (filePath) => {
  try {
    return readFileSync(filePath, 'utf8')
  } catch {
    return ''
  }
}

const rel = (filePath) => relative(ROOT, filePath)

const add = (filePath, ruleId, message) => {
  violations.push({ file: rel(filePath), ruleId, message })
}

const isTestPath = (filePath) =>
  filePath.includes('/__tests__/') ||
  filePath.includes('/e2e/') ||
  /\.(?:test|spec)\.[tj]sx?$/.test(filePath)

const listFiles = (dir, acc = []) => {
  if (!existsSync(dir)) return acc

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stats = statSync(full)
    if (stats.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '__tests__') continue
      listFiles(full, acc)
      continue
    }
    if (/\.(?:ts|tsx)$/.test(entry)) acc.push(full)
  }

  return acc
}

const RULES = {
  'CRYPTO-NO-MATH-RANDOM': {
    scope: (filePath) =>
      filePath.includes('/services/') || filePath.includes('-crypto.service.ts'),
    test: (source) => /\bMath\.random\s*\(/.test(source),
    message: 'Use crypto.getRandomValues — never Math.random() for secrets or tokens',
  },
  'PERSIST-NO-SECRETS': {
    scope: (filePath) => filePath.endsWith('.store.ts') || filePath.includes('/stores/'),
    test: (source) => {
      if (!/\bpersist\s*\(/.test(source) || !/\bpartialize\s*:/.test(source)) return false
      const partializeBlock = source.match(/partialize\s*:\s*\([^)]*\)\s*=>\s*\(\{[\s\S]*?\}\)/)?.[0]
      if (!partializeBlock) return false
      return /\b(?:password|token|apiKey|secret)\b/.test(partializeBlock)
    },
    message: 'Never persist secrets in localStorage — keep sensitive values in memory only',
  },
  'HTML-NO-DANGEROUS': {
    scope: (filePath) => filePath.includes('/src/modules/'),
    test: (source) => /\bdangerouslySetInnerHTML\b/.test(source),
    message: 'Avoid dangerouslySetInnerHTML — escape user content or use a sanitizer',
  },
  'LOG-NO-SECRETS': {
    scope: (filePath) => filePath.includes('/src/modules/') || filePath.includes('/src/common/'),
    test: (source) =>
      /\bconsole\.(?:log|info|debug|warn|error)\s*\([^)]*\b(?:password|apiKey|token|secret)\b/.test(
        source,
      ),
    message: 'Do not log passwords, tokens, API keys, or other secrets',
  },
}

const checkFile = (filePath) => {
  if (isTestPath(filePath)) return
  if (!/\.(?:ts|tsx)$/.test(filePath)) return

  const source = read(filePath)
  if (!source) return

  for (const [ruleId, rule] of Object.entries(RULES)) {
    if (!rule.scope(filePath)) continue
    if (rule.test(source)) {
      add(filePath, ruleId, rule.message)
    }
  }
}

const changedArg = process.argv.indexOf('--changed')
if (changedArg !== -1 && process.argv[changedArg + 1]) {
  checkFile(process.argv[changedArg + 1])
} else {
  for (const root of SCAN_ROOTS) {
    for (const filePath of listFiles(root)) {
      checkFile(filePath)
    }
  }
}

if (violations.length > 0) {
  console.error('\nSecurity checker failed:\n')
  for (const { file, ruleId, message } of violations) {
    console.error(`  [${ruleId}] ${file}\n    → ${message}\n`)
  }
  console.error(`${violations.length} violation(s). See .cursor/rules/security-first.mdc\n`)
  process.exit(1)
}

console.log('Security checker passed.')

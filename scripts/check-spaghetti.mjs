#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Spaghetti checker — enforces one-context-per-file module layout for the frontend.
 * Run: node scripts/check-spaghetti.mjs [--changed <file>]
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const MODULES = join(ROOT, 'src/modules')
const COMMON_COMPONENTS = join(ROOT, 'src/common/components')

const violations = []
const warnings = []

const read = (filePath) => {
  try {
    return readFileSync(filePath, 'utf8')
  } catch {
    return ''
  }
}

const rel = (filePath) => relative(ROOT, filePath)

const add = (filePath, message) => {
  violations.push({ file: rel(filePath), message })
}

const warn = (filePath, message) => {
  warnings.push({ file: rel(filePath), message })
}

const listModuleDirs = (base) => {
  if (!existsSync(base)) return []
  return readdirSync(base)
    .map((name) => join(base, name))
    .filter((path) => statSync(path).isDirectory())
}

const walkFiles = (base, predicate) => {
  if (!existsSync(base)) return []

  const entries = readdirSync(base).flatMap((entry) => {
    const full = join(base, entry)
    if (statSync(full).isDirectory()) return walkFiles(full, predicate)
    return predicate(full) ? [full] : []
  })

  return entries
}

const isTestFile = (name) => name.endsWith('.test.ts') || name.endsWith('.test.tsx')

const checkFrontendModule = (moduleDir) => {
  const moduleName = moduleDir.split('/').pop()

  const testsDir = join(moduleDir, '__tests__')
  if (existsSync(testsDir)) {
    for (const testFile of readdirSync(testsDir)) {
      if (testFile.endsWith('.test.ts')) {
        add(
          join(testsDir, testFile),
          'Web tests must use Testing Library — rename to *.test.tsx and render components',
        )
      }
    }
  }

  for (const entry of readdirSync(moduleDir)) {
    const full = join(moduleDir, entry)
    if (statSync(full).isDirectory()) continue

    if (isTestFile(entry)) {
      add(full, `Test file must live in __tests__/ (e.g. ${moduleName}/__tests__/${entry})`)
    }

    if (entry === 'routes.ts' || entry === 'routes.tsx') {
      const source = read(full)
      if (/export\s+function\s+\w+/.test(source)) {
        add(full, 'Page components belong in pages/ — routes.ts should re-export only')
      }
    }
  }

  for (const subdir of ['components', 'pages']) {
    const dir = join(moduleDir, subdir)
    if (!existsSync(dir)) continue

    for (const filePath of walkFiles(dir, (file) => file.endsWith('.tsx'))) {
      const source = read(filePath)
      const fnExports = (source.match(/^export\s+function\s+\w+/gm) ?? []).length
      const constExports = (source.match(/^export\s+const\s+\w+\s*=/gm) ?? []).length
      if (fnExports + constExports > 1) {
        add(filePath, 'One React component (or hook) per file — split into separate files')
      }

      const fnDeclarations = (source.match(/^function\s+[A-Z]\w+/gm) ?? []).length
      const componentCount = fnExports + constExports + fnDeclarations
      if (componentCount > 1) {
        warn(
          filePath,
          `${componentCount} React components in one file — split into separate component files`,
        )
      }
    }
  }

  const hooksDir = join(moduleDir, 'hooks')
  if (existsSync(hooksDir)) {
    for (const hookFile of readdirSync(hooksDir)) {
      if (!hookFile.endsWith('.ts') && !hookFile.endsWith('.tsx')) continue
      const full = join(hooksDir, hookFile)
      const source = read(full)
      const hookExports = (source.match(/^export\s+(function|const)\s+/gm) ?? []).length
      if (hookExports > 1) {
        add(full, 'One custom hook per file — split into separate hook files')
      }
    }
  }
}

const checkReactComponentFile = (filePath) => {
  const source = read(filePath)
  const fnExports = (source.match(/^export\s+function\s+\w+/gm) ?? []).length
  const constExports = (source.match(/^export\s+const\s+\w+\s*=/gm) ?? []).length
  const fnDeclarations = (source.match(/^function\s+[A-Z]\w+/gm) ?? []).length
  const componentCount = fnExports + constExports + fnDeclarations

  if (fnExports + constExports > 1) {
    add(filePath, 'One React component (or hook) per file — split into separate files')
  }

  if (componentCount > 1) {
    warn(
      filePath,
      `${componentCount} React components in one file — split into separate component files`,
    )
  }
}

const isShadcnPrimitive = (filePath) => filePath.includes('/src/components/ui/')

const checkUiComponents = () => {
  for (const filePath of walkFiles(COMMON_COMPONENTS, (file) => file.endsWith('.tsx'))) {
    checkReactComponentFile(filePath)
  }
}

const SPAGHETTI_IGNORE_PREFIXES = ['test-fixtures/']

const isSpaghettiIgnored = (filePath) =>
  SPAGHETTI_IGNORE_PREFIXES.some((prefix) => rel(filePath).startsWith(prefix))

const checkFile = (filePath) => {
  const normalized = filePath.startsWith('/') ? filePath : join(ROOT, filePath)

  if (isSpaghettiIgnored(normalized)) {
    return
  }

  if (normalized.includes('/src/modules/')) {
    const moduleDir = normalized.split('/modules/')[1]?.split('/')[0]
    if (moduleDir) checkFrontendModule(join(MODULES, moduleDir))
    return
  }

  if (isShadcnPrimitive(normalized)) {
    return
  }

  if (normalized.includes('/src/common/components/')) {
    checkReactComponentFile(normalized)
  }
}

const runAll = () => {
  for (const moduleDir of listModuleDirs(MODULES)) checkFrontendModule(moduleDir)
  checkUiComponents()
}

const changedArg = process.argv.indexOf('--changed')
if (changedArg !== -1 && process.argv[changedArg + 1]) {
  checkFile(process.argv[changedArg + 1])
} else {
  runAll()
}

if (violations.length > 0) {
  console.error('\nSpaghetti checker failed:\n')
  for (const { file, message } of violations) {
    console.error(`  ${file}\n    → ${message}\n`)
  }
  console.error(`${violations.length} violation(s). See .cursor/rules/spaghetti-checker.mdc\n`)
  process.exit(1)
}

if (warnings.length > 0) {
  console.warn('\nSpaghetti checker passed with warnings:\n')
  for (const { file, message } of warnings) {
    console.warn(`  ${file}\n    → ${message}\n`)
  }
  console.warn(`${warnings.length} warning(s). Consider splitting these files.\n`)
}

console.log('Spaghetti checker passed.')

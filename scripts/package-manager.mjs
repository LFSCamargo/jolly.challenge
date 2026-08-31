#!/usr/bin/env node
/* eslint-disable no-undef */
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = join(dirname(fileURLToPath(import.meta.url)), '..')

export function detectPackageManager({
  userAgent = process.env.npm_config_user_agent ?? '',
  hasPnpmStore = existsSync(join(rootDirectory, 'node_modules/.pnpm')),
} = {}) {
  if (userAgent.includes('pnpm')) {
    return 'pnpm'
  }

  if (userAgent.includes('npm')) {
    return 'npm'
  }

  return hasPnpmStore ? 'pnpm' : 'npm'
}

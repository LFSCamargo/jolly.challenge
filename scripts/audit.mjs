#!/usr/bin/env node
/* eslint-disable no-undef */
import { spawnSync } from 'node:child_process'
import { detectPackageManager } from './package-manager.mjs'

const packageManager = detectPackageManager()
const result = spawnSync(packageManager, ['audit', '--audit-level=moderate'], {
  stdio: 'inherit',
})

process.exit(result.status ?? 1)

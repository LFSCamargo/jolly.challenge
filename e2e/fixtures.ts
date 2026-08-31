import { test as base } from '@playwright/test'
import { mockTvmazeApi } from './mock-tvmaze'

export const test = base.extend({
  page: async ({ page }, use) => {
    await mockTvmazeApi(page)
    await use(page)
  },
})

export { expect } from '@playwright/test'

export async function clearAppStorage(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
  })
  await page.reload()
}

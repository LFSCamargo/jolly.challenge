import type { Page } from '@playwright/test'
import { fulfillTvmazeMockRoute } from '../test-fixtures/tvmaze-mock-handler'

export { tvmazeTestLabels } from '../test-fixtures/tvmaze.mock-data'

export async function mockTvmazeApi(page: Page) {
  await page.route('**/api.tvmaze.com/**', async (route) => {
    const fulfillment = await fulfillTvmazeMockRoute(route.request().url())

    if (!fulfillment) {
      await route.continue()
      return
    }

    await route.fulfill(fulfillment)
  })
}

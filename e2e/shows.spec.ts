import { clearAppStorage, expect, test } from './fixtures'
import { tvmazeTestLabels } from './mock-tvmaze'

test.beforeEach(async ({ page }) => {
  await clearAppStorage(page)
})

test.describe('Shows browse', () => {
  test('loads the home browse experience', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: tvmazeTestLabels.featuredShowName, level: 1 }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Your Next Watch' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'All Shows' })).toBeVisible()
    await expect(page.getByText(tvmazeTestLabels.endedShowName).first()).toBeVisible()
  })

  test('searches shows and syncs the query string', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: tvmazeTestLabels.featuredShowName, level: 1 }),
    ).toBeVisible()

    await page.getByLabel('Search shows').fill(tvmazeTestLabels.searchQuery)

    await expect(page).toHaveURL(`/?q=${tvmazeTestLabels.searchQuery}`)
    await expect(page.getByRole('heading', { name: 'Search Results' })).toBeVisible()
    await expect(page.getByText(tvmazeTestLabels.searchTopResultName)).toBeVisible()
  })

  test('filters by status and syncs the query string', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: tvmazeTestLabels.featuredShowName, level: 1 }),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Running', exact: true }).click()

    await expect(page).toHaveURL('/?status=Running')
    await expect(
      page.getByRole('heading', { name: tvmazeTestLabels.runningShowName, level: 1 }),
    ).toBeVisible()
  })

  test('restores search and filter from query string params', async ({ page }) => {
    await page.goto(`/?q=${tvmazeTestLabels.searchQuery}&status=Ended`)

    await expect(page.getByLabel('Search shows')).toHaveValue(
      tvmazeTestLabels.searchQuery,
    )
    await expect(
      page.getByRole('button', { name: 'Ended', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('heading', { name: 'Search Results' })).toBeVisible()
    await expect(page.getByText(tvmazeTestLabels.searchTopResultName)).toBeVisible()
  })

  test('keeps the scroll position when the next page is rate limited', async ({
    page,
  }) => {
    await page.route('**/api.tvmaze.com/shows?page=1', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Rate limited' }),
      })
    })

    await page.goto('/')
    await expect(
      page.getByRole('heading', {
        name: tvmazeTestLabels.featuredShowName,
        level: 1,
      }),
    ).toBeVisible()

    const page1Response = page.waitForResponse((response) =>
      response.url().includes('/shows?page=1'),
    )
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight)
    })
    const scrollBeforeRetry = await page.evaluate(() => window.scrollY)
    await page1Response

    await expect(page.getByRole('heading', { name: 'Your Next Watch' })).toBeVisible()
    await expect(page.getByText(/Could not load more shows/)).toHaveCount(0)
    await expect(page.getByText('Loading more shows')).toHaveCount(0)
    await expect(page.getByLabel('Loading shows')).toHaveCount(0)

    const scrollAfterRetry = await page.evaluate(() => window.scrollY)
    expect(scrollAfterRetry).toBeGreaterThan(0)
    expect(Math.abs(scrollAfterRetry - scrollBeforeRetry)).toBeLessThan(100)
  })

  test('does not fetch again after the catalog ends with a 404', async ({ page }) => {
    let page2Hits = 0

    await page.route('**/api.tvmaze.com/shows?page=1', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Not Found' }),
      })
    })
    await page.route('**/api.tvmaze.com/shows?page=2', async (route) => {
      page2Hits += 1
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Not Found' }),
      })
    })

    await page.goto('/')
    await expect(
      page.getByRole('heading', {
        name: tvmazeTestLabels.featuredShowName,
        level: 1,
      }),
    ).toBeVisible()

    const page1Response = page.waitForResponse((response) =>
      response.url().includes('/shows?page=1'),
    )
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight)
    })
    await page1Response

    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight)
    })

    await expect(page.getByRole('heading', { name: 'Your Next Watch' })).toBeVisible()
    await expect(page.getByText('Loading more shows')).toHaveCount(0)
    await expect(page.getByLabel('Loading shows')).toHaveCount(0)
    expect(page2Hits).toBe(0)
  })
})

test.describe('Show detail', () => {
  test('opens a show and renders grouped episodes', async ({ page }) => {
    await page.goto('/')

    await page
      .locator(`a[href="/shows/${tvmazeTestLabels.featuredShowId}"]`)
      .first()
      .click()

    await expect(page).toHaveURL(`/shows/${tvmazeTestLabels.featuredShowId}`)
    await expect(
      page.getByRole('heading', { name: tvmazeTestLabels.featuredShowName, level: 1 }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Episodes' })).toBeVisible()
  })
})

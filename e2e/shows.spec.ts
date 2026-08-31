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

    await expect(page.getByLabel('Search shows')).toHaveValue(tvmazeTestLabels.searchQuery)
    await expect(page.getByRole('button', { name: 'Ended', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByRole('heading', { name: 'Search Results' })).toBeVisible()
    await expect(page.getByText(tvmazeTestLabels.searchTopResultName)).toBeVisible()
  })
})

test.describe('Show detail', () => {
  test('opens a show and renders grouped episodes', async ({ page }) => {
    await page.goto('/')

    await page.locator(`a[href="/shows/${tvmazeTestLabels.featuredShowId}"]`).first().click()

    await expect(page).toHaveURL(`/shows/${tvmazeTestLabels.featuredShowId}`)
    await expect(
      page.getByRole('heading', { name: tvmazeTestLabels.featuredShowName, level: 1 }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Episodes' })).toBeVisible()
  })
})

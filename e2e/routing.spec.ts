import { clearAppStorage, expect, test } from './fixtures'
import { tvmazeTestLabels } from './mock-tvmaze'

test.beforeEach(async ({ page }) => {
  await clearAppStorage(page)
})

test.describe('App routing', () => {
  test('navigates between Home and My List from primary navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: tvmazeTestLabels.featuredShowName, level: 1 }),
    ).toBeVisible()

    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'My List' }).click()

    await expect(page).toHaveURL('/favorites')
    await expect(page.getByRole('heading', { name: 'My List', level: 1 })).toBeVisible()

    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Home' }).click()

    await expect(page).toHaveURL('/')
    await expect(
      page.getByRole('heading', { name: tvmazeTestLabels.featuredShowName, level: 1 }),
    ).toBeVisible()
  })

  test('navigates from mobile bottom navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: tvmazeTestLabels.featuredShowName, level: 1 }),
    ).toBeVisible()

    await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'My List' }).click()

    await expect(page).toHaveURL('/favorites')
    await expect(page.getByRole('heading', { name: 'My List', level: 1 })).toBeVisible()
  })

  test('renders the not found page', async ({ page }) => {
    await page.goto('/not-a-page')

    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })
})

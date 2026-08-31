import { clearAppStorage, expect, test } from './fixtures'
import { tvmazeTestLabels } from './mock-tvmaze'

test.describe('Favorites', () => {
  test('shows an empty My List state', async ({ page }) => {
    await clearAppStorage(page)
    await page.goto('/favorites')

    await expect(page.getByRole('heading', { name: 'My List', level: 1 })).toBeVisible()
    await expect(page.getByText('Your list is empty')).toBeVisible()
  })

  test('adds a show to My List and persists after reload', async ({ page }) => {
    await clearAppStorage(page)
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: tvmazeTestLabels.featuredShowName, level: 1 }),
    ).toBeVisible()

    await page
      .getByRole('button', {
        name: `Add ${tvmazeTestLabels.featuredShowName} to favorites`,
      })
      .first()
      .click()

    await page.getByRole('link', { name: 'My List' }).click()

    await expect(page).toHaveURL('/favorites')
    await expect(page.getByRole('heading', { name: 'Saved Shows' })).toBeVisible()
    await expect(page.getByText(tvmazeTestLabels.featuredShowName)).toBeVisible()

    await page.reload()

    await expect(page.getByText(tvmazeTestLabels.featuredShowName)).toBeVisible()
  })
})

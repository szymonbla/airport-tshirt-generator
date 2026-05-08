import { test, expect } from '@playwright/test'
import { mockSizeNotFound } from '../helpers/api'

test('happy path: draw → assignment links → reveal view', async ({ page }) => {
  await mockSizeNotFound(page)

  await page.goto('/#/')

  // Enter two participants
  await page.getByPlaceholder('Uczestnik 1').fill('Alice')
  await page.getByRole('button', { name: '+ Dodaj uczestnika' }).click()
  await page.getByPlaceholder('Uczestnik 2').fill('Bob')

  // Draw
  await page.getByRole('button', { name: 'Losuj' }).click()

  // Assignment links table should appear
  await expect(page.getByRole('heading', { name: 'Linki z przydziałami' })).toBeVisible()

  // Get Alice's assignment link
  const aliceRow = page.getByRole('row', { name: /Alice/ })
  const link = await aliceRow.locator('td span').textContent()
  expect(link).toBeTruthy()

  // Navigate to Alice's assignment link
  await page.goto(link!)

  // RevealView gate: Alice is greeted by name — confirms link decoded correctly
  await expect(page.getByText('Hej, Alice!')).toBeVisible()
  await expect(page.getByRole('button', { name: 'UJAWNIJ PRZYDZIAŁ' })).toBeVisible()
})

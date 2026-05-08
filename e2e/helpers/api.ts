import type { Page } from '@playwright/test'

export async function mockSizeNotFound(page: Page) {
  await page.route('/api/size/*', route => route.fulfill({ status: 404 }))
}

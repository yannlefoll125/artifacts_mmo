import { test, expect } from '@playwright/test'

// E2E runs the Vue app alone: /api/* is stubbed with page.route fixtures, so
// no Fastify server (or game-API token) is needed.

test('shows server health from the stubbed API', async ({ page }) => {
  await page.route('**/api/health', (route) => route.fulfill({ json: { status: 'ok' } }))
  await page.goto('/')
  await expect(page.getByTestId('server-health')).toHaveAttribute('data-status', 'ok')
})

test('reports the server unreachable when the API is down', async ({ page }) => {
  await page.route('**/api/health', (route) => route.abort())
  await page.goto('/')
  await expect(page.getByTestId('server-health')).toHaveAttribute('data-status', 'unreachable')
})

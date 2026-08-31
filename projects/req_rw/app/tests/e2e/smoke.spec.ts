import { test, expect } from 'playwright/test';

test('cold load renders the table view with no console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  await page.goto('/');

  await expect(page.locator('table.req-table')).toBeVisible();
  await expect(page.locator('table.req-table tbody tr').first()).toBeVisible();

  expect(consoleErrors, `console errors: ${consoleErrors.join('\n')}`).toEqual([]);
  expect(pageErrors, `page errors: ${pageErrors.join('\n')}`).toEqual([]);
});

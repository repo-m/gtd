import { test, expect } from 'playwright/test';

test('search narrows results; filter panel changes row count', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('table.req-table')).toBeVisible();

  const rows = page.locator('table.req-table tbody tr.table-data-row');
  const rowCountBefore = await rows.count();

  // --- Search: reveal the search bar (it's not in the DOM until toggled), then type a term
  // that matches only some of the demo document's requirements ("Mode" appears only in the
  // "Desktop Mode" and "Browser Mode" headings, not the others). Every demo req has a heading,
  // so the table's content column renders headings via MarkableText (not body text via the
  // rich-text editor) -- match against heading text so the highlight is actually visible.
  const searchToggle = page.locator('button.menu-btn[title="Search (Ctrl+F)"]');
  await searchToggle.click();

  const searchInput = page.locator('.menu-search-input');
  await expect(searchInput).toBeVisible();

  const searchCount = page.locator('.menu-search-count');
  await expect(searchCount).toHaveText('0/0');

  await searchInput.fill('Mode');

  // The match count narrows to a nonzero subset (not "0/0"), and the matched text is
  // highlighted inline as <mark class="search-mark"> spans.
  await expect(searchCount).toHaveText('1/2');
  await expect(page.locator('mark.search-mark')).toHaveCount(2);

  // Clear the search term: matches drop back to zero and the highlights disappear.
  await searchInput.fill('');
  await expect(searchCount).toHaveText('0/0');
  await expect(page.locator('mark.search-mark')).toHaveCount(0);

  // --- Filter: open the "Requirements" (content) column's filter panel and apply a
  // contains-text filter that narrows the visible row count.
  const filterBtn = page.locator('button.filter-icon-btn[title="Filter by Requirements"]');
  await filterBtn.click();

  const filterInput = page.locator('.filter-panel__text-input');
  await expect(filterInput).toBeVisible();
  await filterInput.fill('Python');

  // Row count actually decreases, and the StatusBar surfaces a "Showing X of Y" indicator
  // while a filter is active. The filter icon also picks up the "is-filtered" styling.
  await expect(rows).toHaveCount(2);
  await expect(filterBtn).toHaveClass(/is-filtered/);
  const showingBtn = page.locator('button.status-btn', { hasText: 'Showing' });
  await expect(showingBtn).toBeVisible();
  await expect(showingBtn).toHaveText(`Showing 2 of ${rowCountBefore}`);

  // Clear the filter: row count returns to the original, and the indicator disappears.
  await filterInput.fill('');
  await expect(rows).toHaveCount(rowCountBefore);
  await expect(showingBtn).toHaveCount(0);
  await expect(filterBtn).not.toHaveClass(/is-filtered/);
});

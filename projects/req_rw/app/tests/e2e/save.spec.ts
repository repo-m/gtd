import { test, expect } from 'playwright/test';
import * as YAML from 'yaml';

test('save journey: edit a requirement, save the file, and confirm the download contains the edit', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('table.req-table')).toBeVisible();

  const rows = page.locator('table.req-table tbody tr.table-data-row');
  const rowCountBefore = await rows.count();

  // Open the command palette (the always-visible formula-bar input) and run "Add Requirement".
  const cmdInput = page.locator('.cmd-input');
  await cmdInput.click();
  await cmdInput.fill('Add Requirement');

  const addReqOption = page.getByRole('option', { name: 'Add Requirement', exact: true });
  await expect(addReqOption).toHaveCount(1);
  await addReqOption.click();

  // A new row appears, and it's the focused row (the app auto-focuses the just-created req).
  await expect(rows).toHaveCount(rowCountBefore + 1);
  const newRow = page.locator('tr.is-focused-row');
  await expect(newRow).toHaveCount(1);

  // Resolve the new row's content cell by column position (it's the field the app auto-focuses
  // on creation), so the locator keeps working after focus/classes move off it later.
  const focusedCell = newRow.locator('td.is-focused-cell');
  const contentCellIndex = await focusedCell.evaluate((el) =>
    Array.from(el.parentElement!.children).indexOf(el),
  );
  const contentCell = newRow.locator('td').nth(contentCellIndex);

  // Turn on Edit Mode via the MenuBar toggle.
  const editToggle = page.locator('button.menu-btn[title="Toggle Edit Mode"]');
  await editToggle.click();
  await expect(editToggle).toHaveClass(/is-active/);

  // Double-click into the new requirement's content cell to enter its rich-text editor.
  await contentCell.dblclick();
  const editor = contentCell.locator('.editor-input');
  await editor.click();

  const distinctiveText = 'E2E save journey text';
  await editor.pressSequentially(distinctiveText);

  // Commit the edit: clicking a different cell in the same row moves focus off the content
  // field, which is what flips the editor from editable back to read-only and persists the value.
  await newRow.locator('td').first().click();
  await expect(contentCell.locator('.editor-input')).toContainText(distinctiveText);

  // The Save button lives under the MenuBar's "File" tab (default active tab is "Home").
  await page.locator('.menu-tab', { hasText: 'File' }).click();

  // Click the MenuBar's Save button while listening for the resulting browser download, then
  // read the downloaded file's content back off disk and confirm the edit made it into the YAML.
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('button.menu-btn[title="Save"]').click(),
  ]);

  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const fs = await import('fs');
  const savedYaml = fs.readFileSync(downloadPath!, 'utf-8');

  // YAML folds long scalar lines, so the distinctive text may be broken across lines in the raw
  // file; parse it back and search the resulting document instead of doing a raw substring match.
  const parsed = YAML.parse(savedYaml) as Record<string, unknown>;
  expect(JSON.stringify(parsed)).toContain(distinctiveText);
});

import { test, expect } from 'playwright/test';

test('create + edit journey: add a requirement via the command palette, edit its rich-text content, and confirm both changes stick', async ({ page }) => {
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

  const distinctiveText = 'E2E create-edit journey text';
  await editor.pressSequentially(distinctiveText);

  // Commit the edit: clicking a different cell in the same row moves focus off the content
  // field, which is what flips the editor from editable back to read-only and persists the value.
  await newRow.locator('td').first().click();

  // Assert the typed text now renders in the cell — re-queried after the edit has committed,
  // not asserted on the still-focused editor's transient state.
  await expect(contentCell.locator('.editor-input')).toContainText(distinctiveText);

  // Confirm it "sticks": re-query again after an unrelated interaction elsewhere on the page,
  // proving the value isn't just an artifact of the editor still being focused.
  await page.locator('button.menu-btn[title="Toggle Sidebar"]').click();
  await page.locator('button.menu-btn[title="Toggle Sidebar"]').click();
  await expect(rows).toHaveCount(rowCountBefore + 1);
  await expect(contentCell.locator('.editor-input')).toContainText(distinctiveText);
});

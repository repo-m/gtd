import { test, expect } from 'playwright/test';

test('undo/redo round-trip: create a requirement, undo it away, then redo it back', async ({ page }) => {
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

  // The mutation lands: a new row appears.
  await expect(rows).toHaveCount(rowCountBefore + 1);

  // Move focus off the command palette's <input> before sending Ctrl+Z/Ctrl+Y: useGlobalHotkeys
  // skips the shortcut entirely while an input/textarea/Lexical editor is focused
  // (isInputFocused), and the palette input is still focused after execute(). Toggling the
  // sidebar (twice, to leave layout unchanged) is a plain button click that blurs it cleanly,
  // same pattern as create-edit.spec.ts's "confirm it sticks" step. (A click straight into a
  // table cell also blurs the input, but it dispatches its own appSlice focus/selection action
  // immediately beforehand, which can eat the very next undo dispatch -- so we avoid that here.)
  const sidebarToggle = page.locator('button.menu-btn[title="Toggle Sidebar"]');
  await sidebarToggle.click();
  await sidebarToggle.click();

  // Undo the creation via the keyboard shortcut (Ctrl+Z -> fileUndo, per useGlobalHotkeys.ts).
  await page.keyboard.press('Control+z');
  await expect(rows).toHaveCount(rowCountBefore);

  // Redo re-applies the creation (Ctrl+Y -> fileRedo, per useGlobalHotkeys.ts).
  await page.keyboard.press('Control+y');
  await expect(rows).toHaveCount(rowCountBefore + 1);
});

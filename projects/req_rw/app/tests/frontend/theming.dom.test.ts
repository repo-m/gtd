/**
 * @jest-environment jsdom
 *
 * DOM wiring tests: verifies that dispatching theme actions causes
 * document.documentElement[data-theme] to be updated, as required by specs/50-theming.md.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

// Mock the heavy Content component so we only test AppContent's useEffect wiring
jest.mock('../../src/frontend/Content', () => ({
  Content: () => null,
}));

jest.mock('../../src/frontend/api/api', () => ({
  api: { init: () => Promise.resolve({ ok: true }) },
}));

const makeMatchMedia = (dark: boolean) => (_: string) => ({
  matches: dark,
  media: _,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
  onchange: null,
});

beforeEach(() => {
  document.documentElement.removeAttribute('data-theme');
  localStorage.clear();
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: makeMatchMedia(false),
  });
});

async function renderApp() {
  const { default: App } = await import('../../src/frontend/App');
  const container = document.createElement('div');
  document.body.appendChild(container);
  await act(async () => {
    createRoot(container).render(React.createElement(App));
  });
  return () => document.body.removeChild(container);
}

describe('theme DOM wiring — criterion 3', () => {
  test('applies light theme to data-theme on mount (system, no OS dark)', async () => {
    const cleanup = await renderApp();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    cleanup();
  });

  test('applies dark theme when localStorage has dark', async () => {
    localStorage.setItem('req.theme', 'dark');
    const cleanup = await renderApp();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    cleanup();
  });

  test('applies dark theme when OS prefers dark and setting is system', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: makeMatchMedia(true),
    });
    const cleanup = await renderApp();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    cleanup();
  });
});

import * as fs from 'fs';
import * as path from 'path';
import {
  fileToState,
  stateToFile,
  storeToYaml,
} from '../../src/frontend/store/file';

const fixturesDir = path.join(__dirname, '../fixtures');

function readFixture(name: string): string {
  return fs.readFileSync(path.join(fixturesDir, name), 'utf-8');
}

const FIXTURES = ['minimal.rq', 'full.rq'] as const;

describe('serialisation round-trip', () => {
  test.each(FIXTURES)('%s: round-trip preserves id, children, and field values', (name) => {
    const yaml = readFixture(name);
    const state1 = fileToState(yaml);
    const state2 = fileToState(storeToYaml(state1));

    const ids = Object.keys(state1.requirements).map(Number).sort((a, b) => a - b);
    expect(Object.keys(state2.requirements).map(Number).sort((a, b) => a - b)).toEqual(ids);

    for (const id of ids) {
      const r1 = state1.requirements[id];
      const r2 = state2.requirements[id];
      for (const key of Object.keys(r1)) {
        expect(r2[key]).toEqual(r1[key]);
      }
    }
  });

  test('missing identifier is replaced with a valid UUID', () => {
    const yaml = [
      'title: No Identifier',
      'max: 1',
      'next: 2',
      'root: 1',
      'requirements:',
      '- id: 1',
      '  children: []',
    ].join('\n');
    const state = fileToState(yaml);
    expect(state.identifier).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  test.each(FIXTURES)('%s: serialised requirements have no level or num keys', (name) => {
    const yaml = readFixture(name);
    const state = fileToState(yaml);
    const file = stateToFile(state) as { requirements: Record<string, unknown>[] };
    for (const req of file.requirements) {
      expect(req).not.toHaveProperty('level');
      expect(req).not.toHaveProperty('num');
    }
  });

  test.each(FIXTURES)('%s: serialised requirements are sorted ascending by id', (name) => {
    const yaml = readFixture(name);
    const state = fileToState(yaml);
    const file = stateToFile(state) as { requirements: { id: number }[] };
    const ids = file.requirements.map((r) => r.id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  test.each(FIXTURES)('%s: state.next equals state.max + 1', (name) => {
    const yaml = readFixture(name);
    const state = fileToState(yaml);
    expect(state.next).toBe(state.max + 1);
  });
});

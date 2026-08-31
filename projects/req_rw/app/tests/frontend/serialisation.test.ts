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

describe('fileToState validation contract', () => {
  test('missing title defaults to empty string', () => {
    const yaml = 'max: 0\nrequirements: []\nfields: []';
    const state = fileToState(yaml);
    expect(state.title).toBe('');
  });

  test('missing identifier is assigned a valid UUID', () => {
    const yaml = 'title: No Id\nmax: 0\nrequirements: []\nfields: []';
    const state = fileToState(yaml);
    expect(state.identifier).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  test('unknown top-level keys are silently dropped', () => {
    const yaml = [
      'title: T',
      'unknownKey: someValue',
      'anotherUnknown: 42',
      'max: 0',
      'requirements: []',
      'fields: []',
    ].join('\n');
    const state = fileToState(yaml);
    expect(Object.keys(state as object)).not.toContain('unknownKey');
    expect(Object.keys(state as object)).not.toContain('anotherUnknown');
  });

  test('FieldDef with unrecognised type is dropped; valid entries are kept', () => {
    const yaml = [
      'title: T',
      'max: 1',
      'root: 1',
      'requirements:',
      '- id: 1',
      '  children: []',
      'fields:',
      '- name: GoodField',
      '  type: String',
      '  editable: true',
      '- name: BadField',
      '  type: Banana',
      '  editable: true',
      '- name: AlsoGood',
      '  type: Enumeration',
      '  editable: false',
      '  values: [A, B]',
    ].join('\n');
    const state = fileToState(yaml);
    expect(state.fields).toHaveLength(2);
    expect(state.fields.map((f) => f.name)).toEqual(['GoodField', 'AlsoGood']);
  });

  test('stale root falls back to first requirement id; null when requirements empty', () => {
    const staleYaml = [
      'title: T',
      'root: 999',
      'max: 2',
      'requirements:',
      '- id: 1',
      '  children: []',
      '- id: 2',
      '  children: []',
      'fields: []',
    ].join('\n');
    const stateWithReqs = fileToState(staleYaml);
    expect(stateWithReqs.root).toBe(1);

    const emptyYaml = 'title: T\nroot: 999\nmax: 0\nrequirements: []\nfields: []';
    const stateEmpty = fileToState(emptyYaml);
    expect(stateEmpty.root).toBeNull();
  });
});

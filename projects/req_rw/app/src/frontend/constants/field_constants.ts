export const FIELD_LIST_DEFAULT = {
  children: [] as number[],
  links: [] as unknown[],
};

export const FIELD_LIST_INTERNAL = new Set(['level', 'num']);
export { FIELD_LIST_INTERNAL as INTERNAL_FIELDS };

export const FIELD_TYPES = [
  'String',
  'RichText',
  'Integer',
  'Real',
  'Boolean',
  'Date',
  'Enumeration',
  'Links',
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export const FIELD_TYPE_LINKS = 'Links' as const;

export const BUILTIN_FIELDS = ['id', 'num', 'heading', 'text', 'links'] as const;

import { Validator } from '@cfworker/json-schema';

import schema from './schema.json' with { type: 'json' };

const validator = new Validator(schema, '2020-12', true);

const STRUCTURAL_KEYWORDS = new Set(['$ref', 'oneOf', 'anyOf', 'allOf', 'properties', 'items']);

export function validateShare(data) {
  const result = validator.validate(data);
  if (result.valid) return null;
  const specific =
    result.errors.filter((entry) => !STRUCTURAL_KEYWORDS.has(entry.keyword)).at(-1) ?? result.errors.at(-1);
  const where = specific.instanceLocation.replace(/^#/, '') || '/';
  return `share data does not match schema: ${where} ${specific.error}`;
}

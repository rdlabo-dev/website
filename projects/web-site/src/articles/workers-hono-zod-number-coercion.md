---
title: "Migrating NestJS DTOs to Hono + Zod — Reproducing Value Coercion in Schemas and Helpers"
description: "Copying types into Zod is not enough when moving from NestJS. class-transformer @Transform behavior for numbers, defaults, and empty strings needs field-by-field Zod helpers."
zennSlug: workers-hono-zod-number-coercion
emoji: "🔢"
---

When I ported routes from NestJS to Hono + Zod, rewriting DTO types into Zod schemas alone did not preserve input meaning.

In the source stack, class-transformer's `@Transform()` handled string-to-number conversion, defaults, empty-string normalization — and also boolean coercion, string trim, and wrapping single values into arrays. None of that appears in TypeScript types or class-validator constraints.

So I checked value conversion written in NestJS DTOs field by field and ported them into Zod schemas. Among those, I extracted numeric conversion repeated across projects into Zod helpers in `@rdlabo/workers-hono-kit`.

This article focuses on what values become after passing through Zod schemas.

# Port value conversion, not types

TypeScript types, validation, and value conversion are separate roles.

## TypeScript types do not change values at runtime

```ts
type Query = {
  page: number;
};
```

This `number` is compile-time information. If the URL is `?page=2`, path and query parameters arrive as the string `"2"`.

Hono's official examples also coerce string query values to number in validators when needed.

https://hono.dev/docs/guides/rpc#path-parameters

## NestJS used `@Transform()` for shaping

In my project, fields I wanted as numbers had explicit `@Transform()`:

```ts
export class ListQuery {
  @Transform(toNumber)
  @IsInt()
  @Min(1)
  page!: number;
}
```

Each piece has a separate role:

| Annotation | Role |
|---|---|
| `page!: number` | TypeScript type |
| `@Transform(toNumber)` | Shape input at runtime |
| `@IsInt()` / `@Min(1)` | Validate after shaping |

Mechanically migrating to Hono + Zod like this rejects the string `"1"`:

```ts
const listQuery = z.object({
  page: z.number().int().min(1),
});
```

What I needed was not only Zod numeric constraints but porting the preprocessing `@Transform(toNumber)` did.

# First ask whether standard Zod is enough

Hono path and query parameters arrive as strings. For new APIs, `z.coerce.number()` is often enough:

```ts
const listQuery = z.object({
  page: z.coerce.number().int().min(1),
});
```

But `z.coerce.number()` uses JavaScript `Number()`, so empty string and whitespace-only strings become `0`:

```ts
Number('');    // 0
Number('   '); // 0
```

In schemas that allow `0`, values I wanted as missing or mistaken input pass through.

## For required string input, `pipe()` is enough

Standard Zod escape: validate as string first, then pass to `z.coerce.number()`.

```ts
const queryNumber = z
  .string()
  .trim()
  .min(1)
  .pipe(z.coerce.number().int().min(0));

queryNumber.parse('42');                   // 42
queryNumber.safeParse('').success;         // false
queryNumber.safeParse('   ').success;      // false
queryNumber.safeParse(null).success;       // false
```

`z.string()` limits the source; `trim().min(1)` drops empty and whitespace before numeric conversion. For new required query or path parameters, this is enough.

https://zod.dev/api#pipes

## Existing contracts needed preprocessing for empty values

Source DTOs mixed fields like:

- Required numbers treating empty string as invalid
- Numbers defaulting when the parameter is absent
- Optional numbers treating empty string as unspecified
- Nullable numbers keeping JSON `null` as a value

`.default()` and `.optional()` handle `undefined` but do not turn empty string into default or `undefined`. Rather than reimplementing each route with `z.preprocess()`, I split into four helpers.

# Introducing the shared library

Four numeric helpers used across projects with the same contract import from `@rdlabo/workers-hono-kit` package root:

```bash
npm install @rdlabo/workers-hono-kit
```

```ts
import {
  zNum,
  zNumNullable,
  zNumOptional,
  zNumWithDefault,
} from '@rdlabo/workers-hono-kit';
```

https://github.com/rdlabo-dev/workers-hono-kit/blob/main/src/middleware/zod-coerce.ts

https://www.npmjs.com/package/@rdlabo/workers-hono-kit

These are not helpers to replace every numeric field uniformly. For new required query/path, first consider `z.string().trim().min(1).pipe(z.coerce.number())`. When migrating from NestJS, check the source DTO's `@Transform()` and use only the helper matching actual empty-value handling for that field.

# Decide coercion per field, not uniformly

I cannot migrate by coercing every field that looks numeric.

## Fields that had `@Transform()`

Fields that converted strings to numbers in the source get the same conversion on Hono + Zod:

```ts
const listQuery = z.object({
  page: zNum(z.number().int().min(1)),
});
```

`"1"` becomes `1`, then `int()` and `min(1)` validate.

## Fields without `@Transform()`

Conversely, do not add coercion to fields that had only `@IsInt()` without `@Transform()`:

```ts
export class Body {
  @IsInt()
  quantity!: number;
}
```

If this field required a number in JSON body, Zod also uses plain `z.number()`:

```ts
const body = z.object({
  quantity: z.number().int(),
});
```

Using `zNum()` here might accept string `"1"` or `null` as numbers when they were rejected before. Migration unit is per-DTO-field conversion rules, not TypeScript `number`.

| NestJS DTO | Hono + Zod |
|---|---|
| `@Transform(toNumber)` + `@IsInt()` | `zNum(z.number().int())` |
| `@Transform(toNumberWithDefault(20))` | `zNumWithDefault(20, ...)` |
| `@Transform(toOptionalNumber)` | `zNumOptional(...)` |
| `@IsInt()` without `@Transform` | `z.number().int()` |

# Four numeric helpers

## required: `zNum()`

```ts
const isBlankString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() === '';

const rawToNumber = (value: unknown): unknown =>
  isBlankString(value) ? Number.NaN : Number(value);

export const zNum = (inner: z.ZodNumber = z.number()) =>
  z.preprocess(rawToNumber, inner);
```

Converts numeric strings to number. Empty and whitespace-only strings become `NaN` and fail at `z.number()`.

```ts
zNum().parse('42');                  // 42
zNum().safeParse('').success;        // false
zNum().safeParse('   ').success;     // false
zNum().safeParse('abc').success;     // false
```

## with default: `zNumWithDefault()`

Applies default to missing `undefined` and empty URL string `""`. Whitespace-only strings reject as bad input.

```ts
const schema = zNumWithDefault(20, z.number().int().min(1));

schema.parse(undefined);             // 20
schema.parse('');                    // 20
schema.parse('3');                   // 3
schema.safeParse('   ').success;     // false
```

## optional: `zNumOptional()`

Normalizes `undefined`, `null`, and empty string to `undefined`. Converts present values to number.

```ts
const schema = zNumOptional(z.number().int());

schema.parse(undefined);             // undefined
schema.parse(null);                  // undefined
schema.parse('');                    // undefined
schema.parse('7');                   // 7
schema.safeParse('   ').success;     // false
```

## nullable: `zNumNullable()`

For JSON body fields where `null` itself has meaning. Keeps `null`; maps `undefined` and empty string to `undefined`.

```ts
const schema = zNumNullable(z.number().int());

schema.parse(null);                  // null
schema.parse(undefined);             // undefined
schema.parse('');                    // undefined
schema.parse('9');                   // 9
```

Side by side:

| input | `zNum()` | `zNumWithDefault(1)` | `zNumOptional()` | `zNumNullable()` |
|---|---:|---:|---:|---:|
| `"42"` | 42 | 42 | 42 | 42 |
| `undefined` | reject | 1 | undefined | undefined |
| `""` | reject | 1 | undefined | undefined |
| `"   "` | reject | reject | reject | reject |
| `null` | 0 | 0 | undefined | null |
| `"abc"` | reject | reject | reject | reject |

`null` becoming `0` in `zNum()` and `zNumWithDefault()` is from `Number(null)` inside — same as source `toNumber`. Use `zNumNullable()` when `null` must remain.

# Integrate into schemas

Helpers return Zod schemas and combine with ordinary fields:

```ts
import {
  zNum,
  zNumNullable,
  zNumOptional,
  zNumWithDefault,
} from '@rdlabo/workers-hono-kit';
import { z } from 'zod';

const listQuery = z.object({
  groupId: zNum(z.number().int().positive()),
  page: zNumWithDefault(1, z.number().int().min(1)),
  year: zNumOptional(z.number().int().min(1900)),
  parentId: zNumNullable(z.number().int().positive()),
});

listQuery.parse({ groupId: '42' });
// {
//   groupId: 42,
//   page: 1,
//   year: undefined,
//   parentId: undefined,
// }
```

After shaping, field-specific constraints like `int()`, `positive()`, and `min()` apply.

# Non-numeric `@Transform()` also moves into schemas

Migration shaping was not numbers only. Conversions below are domain-specific; I kept them near schemas, not generic helpers.

## Map unexpected values to a default

```ts
const validity = z.preprocess(
  (value) =>
    value === 'expired' ? 'expired' : value === 'valid' ? 'valid' : 'all',
  z.enum(['valid', 'expired', 'all']),
);
```

Not plain enum validation — it maps anything other than `expired` and `valid` to `all`, reproducing source `@Transform()`.

## Limit boolean expressions in query

```ts
const excludeDuplicates = z.preprocess(
  (value) =>
    value === true || value === 'true' || value === '1' || value === 1,
  z.boolean(),
);
```

`z.coerce.boolean()` uses JavaScript `Boolean()`, so string `"false"` is truthy and becomes `true`. When I want a fixed set of accepted forms, the API contract goes into preprocessing.

## Trim strings before validation

```ts
const searchQuery = z.object({
  q: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : value),
    z.string().min(1),
  ),
});
```

If only strings arrive, `z.string().trim().min(1)` alone works. In migration I check existing input types and processing order, and prefer standard Zod API where it fits.

## Normalize single values to arrays

Where one query parameter is a string and several become an array, I normalize to array before validation:

```ts
const sha256Query = z.object({
  sha256: z.preprocess(
    (value) =>
      Array.isArray(value) ? value : value === undefined ? undefined : [value],
    z.array(z.string().regex(/^[a-f0-9]{64}$/)).nonempty(),
  ),
});
```

Elsewhere, fields accepting `null` but aligning downstream to `undefined` use `.nullish().transform((value) => value ?? undefined)`.

So it is less "I made more Zod helpers" and more: four numeric variants as shared helpers; other shaping stays as domain Zod schemas in each app.

# Pin conversion results with table tests

Value conversion cannot be verified by types alone. Pin success, failure, and shaped values per boundary in tests.

```ts
describe('zNumOptional', () => {
  it('normalizes values equivalent to omitted input to undefined', () => {
    expect(zNumOptional().parse(undefined)).toBeUndefined();
    expect(zNumOptional().parse(null)).toBeUndefined();
    expect(zNumOptional().parse('')).toBeUndefined();
  });

  it('converts numeric strings to numbers and rejects whitespace', () => {
    expect(zNumOptional().parse('7')).toBe(7);
    expect(zNumOptional().safeParse('   ').success).toBe(false);
  });
});
```

At minimum I verify:

- numeric strings
- `undefined`
- empty string
- whitespace-only string
- `null`
- non-numeric strings
- decimals passed to `int()`
- whether default satisfies downstream constraints

What I pin is not universally correct conversion but the per-field contract from input to shaped value that existing clients depend on.

# Summary

Moving NestJS to Hono + Zod, TypeScript types and validation constraints alone did not reproduce class-transformer shaping. Besides numeric conversion: boolean coercion, normalization to defaults, trim, and single-value-to-array also needed porting.

What I needed was not blind coercion from types but reading per-DTO-field conversion rules. I express them near schemas with standard Zod `pipe()`, `transform()`, and `preprocess()`, and split four numeric variants shared across projects into helpers.

Port not types but what input becomes after shaping. On Hono + Zod migration, pinning that boundary in tests mattered.

See you next time.

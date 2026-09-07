---
title: "Dates Shifted by 9 Hours After Moving to Cloudflare Workers—Aligning DB Connections and Business Time to JST"
description: "Fix implicit local timezone drift with mysql2 timezone '+09:00', @rdlabo/workers-timezone, ESLint guards, and real MySQL wire tests."
zennSlug: workers-hono-mysql-jst-timezone
emoji: "🕘"
updatedAt: "2026-09-07"
---

When I migrated from NestJS to Hono + Cloudflare Workers, two datetime bugs showed up.

- Datetimes saved to MySQL appeared shifted by 9 hours when read back in the app
- Sales and payments registered before 9:00 JST were aggregated as the previous day's data

MySQL session timezone was `Asia/Tokyo`, and datetimes looked correct in SQL. Still, the boundary with the app was wrong.

The cause was that implicit `local`, which pointed at JST on EC2, now pointed at UTC on Workers. But the fix was not a single place.

1. The boundary between MySQL and JavaScript `Date`
2. The boundary where JavaScript decides business "today" and business time

I fixed the first with mysql2 connection settings and the second with a shared JST "wall clock" library.

# Two clocks hidden in `local`

Cloudflare Workers' `Date` and `Intl` use UTC as the local timezone. If pre-migration code did the following, the same `Date` flips calendar day at a different time.

```ts
const now = new Date();

now.getDate(); // WorkersではUTCの日付
now.toISOString(); // 常にUTCの文字列
```

[Cloudflare's Local development documentation](https://developers.cloudflare.com/workers/local-development/) also states that `workerd` runs with `TZ=UTC` to match production.

When mysql2's `timezone` is omitted, it also uses `local`. The implicit JST on EC2 became UTC on Workers, changing how `Date` values are read and written.

I needed to make three boundaries explicit. I fixed the first two and confirmed the existing MySQL session setting was already correct.

| Boundary | What decides the time | Setting in this project |
| --- | --- | --- |
| App reads/writes `Date` to MySQL | mysql2 | `timezone: '+09:00'` |
| App decides business date / business time | `business-time` | `Asia/Tokyo` |
| MySQL generates `NOW()` etc. | MySQL session | `Asia/Tokyo` |

mysql2 settings alone do not fix business date logic with `getDate()`. Conversely, JST conversion helpers alone do not fix wire conversion with the DB. Separating those two boundaries was the main point.

# Fix 1: Pin the MySQL boundary to `+09:00`

First I set `timezone: '+09:00'` on mysql2 connection options.

```ts
const connection = await createConnection({
  host: env.HYPERDRIVE.host,
  user: env.HYPERDRIVE.user,
  password: env.HYPERDRIVE.password,
  database: env.HYPERDRIVE.database,
  port: env.HYPERDRIVE.port,
  disableEval: true,
  timezone: '+09:00',
});
```

To use the same settings across services, I moved the implementation into `@rdlabo/workers-hono-kit/db`.

```ts
import { hyperdriveConnectionOptions } from '@rdlabo/workers-hono-kit/db';
import { createConnection } from 'mysql2/promise';

const connection = await createConnection(
  hyperdriveConnectionOptions(env.HYPERDRIVE),
);
```

`hyperdriveConnectionOptions()` returns Workers-oriented settings with `timezone: '+09:00'` as the default.

This value is the conversion basis when mysql2 reads and writes JavaScript `Date`. It does not run `SET time_zone` and does not change MySQL session timezone.

## Do not mix timezone behavior across MySQL types

Even with `timezone: '+09:00'` on mysql2, `TIMESTAMP`, `DATETIME`, and `DATE` do not behave the same. Some types are converted on the MySQL side and some are not.

They look similar but mean different things:

- `TIMESTAMP`: MySQL converts between session timezone and UTC
- `DATETIME`: A wall-clock datetime with no timezone
- `DATE`: A calendar date, not an instant

[MySQL's official documentation](https://dev.mysql.com/doc/refman/8.4/en/datetime.html) explains that only `TIMESTAMP` is converted between session timezone and UTC; `DATETIME` is not.

To make that difference explicit in code, I consolidated Drizzle column helpers in the kit.

```ts
import { mysqlTable } from 'drizzle-orm/mysql-core';
import {
  jstDate,
  jstDatetime,
  jstTimestamp,
} from '@rdlabo/workers-hono-kit/db';

const sales = mysqlTable('sales', {
  createdAt: jstTimestamp('created_at').notNull(),
  closedAt: jstDatetime('closed_at'),
  salesDate: jstDate('sales_date'),
});
```

`jstTimestamp` and `jstDatetime` do not transform values themselves—they pass through to mysql2. Connection `timezone: '+09:00'` converts between JavaScript `Date` and wire datetimes. MySQL then converts only `TIMESTAMP` between session timezone and UTC. Only `jstDate` normalizes values to a JST calendar date on write.

Carelessly converting `DATE` to `Date` can land on the previous day after timezone conversion. `jstDate` treats values as `YYYY-MM-DD` strings and normalizes to a JST calendar date only when the input is an ISO instant.

Note that `CURRENT_TIMESTAMP` and `NOW()` are generated on the MySQL side. That is a separate path from mysql2's `timezone: '+09:00'`, so I also checked the session with:

```sql
SELECT @@global.time_zone, @@session.time_zone;
```

The session was `Asia/Tokyo`. So the "wall clock" visible in SQL was correct; the problem was also at the app conversion boundary.

# Fix 2: Build a JST wall clock

Even after fixing the 9-hour DB skew, this code returns UTC calendar components on Workers:

```ts
new Date().getFullYear();
new Date().getMonth();
new Date().getDate();
```

That is why sales and payments registered before 9:00 JST were treated as the previous day.

I consolidated implementation in `src/business-time/index.ts` and exposed JST wall-clock APIs as `@rdlabo/workers-hono-kit/business-time`.

The design references WP Kyoto's ["Controlling Day.js timezone on Cloudflare Workers"](https://wp-kyoto.net/handle-timezone-on-cloudflare-with-dayjs/). That article recommends not relying only on global settings like `dayjs.tz.setDefault('Asia/Tokyo')` and instead passing every conversion through a helper such as `toJST()` with an explicit timezone.

I did not adopt Day.js. I took these three points as requirements:

- Do not rely on the runtime's local timezone
- Do not assume a global default timezone applies
- Always convert instants to business datetime / business date through explicit functions

```ts
import {
  toBusinessDate,
  toBusinessDateTime,
  today,
} from '@rdlabo/workers-hono-kit/business-time';

const instant = new Date('2026-07-05T15:00:00.000Z');

toBusinessDate(instant);     // '2026-07-06'
toBusinessDateTime(instant); // '2026-07-06 00:00:00'
today(instant);              // '2026-07-06'
```

This does not avoid creating `Date` itself. `new Date('2026-07-05T15:00:00.000Z')` is unambiguously a UTC instant because of the trailing `Z`. The problem is reading business date or business time from that `Date` using the runtime's local timezone.

Internally I add JST's fixed offset `+09:00` to the UTC instant and read wall-clock fields with `getUTC*`. That assumes Japan has no daylight saving time. I keep `Date` as an instant and convert explicitly only where "what date and time is it in JST?" matters.

What matters here is that I did not unify everything as UTC strings.

| Meaning | Example in the app |
| --- | --- |
| An instant on the timeline | `Date` |
| JST business datetime | `BusinessDateTime` |
| Calendar dates such as birthdays or business days | `BusinessDate` |

For a true instant to an external API, a timezone-aware ISO string is appropriate. This service, however, had a contract from the NestJS era to return JST wall-clock values. I did not convert that contract wholesale to UTC; I separated instant, wall clock, and calendar date into different types and conversion paths.

# Block escape hatches with lint

Helpers alone are not enough—someone can write `getDate()` directly again.

Consumers import shared conversion from `@rdlabo/workers-timezone`, and the `workers-timezone/recommended` preset from `@rdlabo/eslint-plugin-rules` detects operations that implicitly depend on the runtime timezone:

- Local getters such as `getFullYear()`, `getMonth()`, `getDate()`
- Local setters such as `setHours()`, `setDate()`, `setMonth()`
- `Intl` formatting without an explicit `timeZone`
- Calling `initializeTimezone()` while handling a request

The earlier `new Date('2026-07-05T15:00:00.000Z')` and `toISOString()` do not violate those rules. I separate creating an instant from a timezone-aware value and converting that instant to a business wall clock.

This is not a general rule that every Cloudflare Worker should ban `toISOString()`. For this service, where JST wall clock is a business contract, the rule pins conversion through the shared library.

# Test both boundaries, not mocks alone

Timezone issues were not enough to catch with function unit tests alone. I used mysql2 and real MySQL to verify stored wall clock and read-back instant together.

```ts
const instant = new Date('2026-01-01T00:00:00.000Z');
await db.insert(sales).values({ id: 1, createdAt: instant });

const [result] = await pool.query(`
  SELECT
    created_at,
    DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS wall_clock
  FROM sales
  WHERE id = 1
`);
const row = (result as { created_at: Date; wall_clock: string }[])[0];

expect(row.wall_clock).toBe('2026-01-01 09:00:00');
expect(row.created_at.getTime()).toBe(instant.getTime());
```

For the wall clock I added tests that cross JST date boundaries.

```ts
expect(toBusinessDate(new Date('2026-07-05T14:59:59Z')))
  .toBe('2026-07-05');

expect(toBusinessDate(new Date('2026-07-05T15:00:00Z')))
  .toBe('2026-07-06');
```

I migrated about 80 schema files to shared helpers and kept real DB wire tests and business-date boundary tests. That verifies both configured facts and that the two boundaries stay stable.

# Using this implementation

The JST business datetime conversion is published as `@rdlabo/workers-timezone`, which does not depend on Hono or MySQL. The previous `@rdlabo/workers-hono-kit/business-time` entry point is now a deprecated compatibility re-export, so new integrations should use the timezone package directly.

- [npm: @rdlabo/workers-timezone](https://www.npmjs.com/package/@rdlabo/workers-timezone)
- [GitHub: @rdlabo/workers-timezone](https://github.com/rdlabo-dev/workers-hono-kit/tree/main/packages/timezone)

```bash
npm install @rdlabo/workers-timezone
```

Existing function names such as `toBusinessDate()` and `toBusinessDateTime()` remain available; only the import path needs to change. The default timezone remains `Asia/Tokyo`. New code can also call `initializeTimezone()` once at module scope to configure the timezone for the entire application and use timezone-neutral names such as `toLocalDate()` and `toLocalDateTime()`.

```ts
import {
  TIME_ZONES,
  initializeTimezone,
  toBusinessDate,
  toBusinessDateTime,
} from '@rdlabo/workers-timezone';

initializeTimezone({ timeZone: TIME_ZONES.TOKYO });
```

Use the shared lint preset as well. Add typed linting and `workers-timezone/recommended` to your existing flat config.

```bash
npm install --save-dev eslint @eslint/js typescript typescript-eslint @rdlabo/eslint-plugin-rules
```

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
      },
    },
    plugins: { '@rdlabo/rules': rdlabo },
  },
  ...rdlabo.configs['workers-timezone/recommended'],
);
```

If a config already exists, merge the preset and typed linting into it instead of replacing it. The separate `workers/recommended` preset does not enable the timezone checks.

In addition to host-local `Date` and `Intl` operations, this preset detects calls to `initializeTimezone()` in request scope. UTC getters and `toISOString()` remain available for code that works with instants.

The timezone package does not include the Hyperdrive + mysql2 connection settings or Drizzle column helpers. If you need those too, continue to install `mysql2` and `drizzle-orm` and import from `@rdlabo/workers-hono-kit/db`.

# Summary

The 9-hour skew was not because MySQL session timezone was wrong. Implicit `local` that behaved as JST on EC2 became UTC on Cloudflare Workers, surfacing two boundaries at once.

- Pin the DB boundary with mysql2 `timezone: '+09:00'` and shared column helpers
- Route business time through the `@rdlabo/workers-timezone` wall clock
- Consolidate in a shared library and block escape hatches with ESLint
- Test real MySQL wire and JST date boundaries

The fix was not "add 9 hours at display time" but deciding where instant, wall clock, and calendar date live and removing implicit `local` from code.

See you next time.

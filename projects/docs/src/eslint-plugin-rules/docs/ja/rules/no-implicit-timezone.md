---
title: no-implicit-timezone
---

Dateのparse・生成・参照とIntlによる表示で、host timezoneへ暗黙に依存する処理を防ぎます。

Cloudflare Workersのhost local timezoneはUTCです。サーバーのlocal timezoneを使っていたコードは、移行後にカレンダー日付やローカル時刻が変わる場合があります。このルールにより、UTCまたはIANA timezoneを明示した境界へ処理を集約します。

## 検出対象

| 検出する操作 | 代わりに使うもの |
| --- | --- |
| `new Date(year, month, ...)` | `Date.UTC(...)` またはtimezoneを明示したローカル時刻変換 |
| 関数としての `Date()` | 時刻を生成してから明示的にformatする |
| Dateのlocal getter・setter・文字列表示 | timezone変換または明示的なUTC・時刻API |
| 明示的な `timeZone` がない `Intl.DateTimeFormat`・`Date#toLocale*` | `{ timeZone: '...' }` を追加する |
| `Z`・`±HH:mm` がないISO-like datetime literal | offsetを追加するかtimezone-localの時刻としてparseする |

`toISOString()`、`toJSON()`、`getTime()`、`valueOf()`、UTC method、epoch constructor、日付だけの `YYYY-MM-DD` は許可します。

typed lintingが必要です。組み込みの `Date` receiverだけを検査するため、`getDate()` など同名のmethodを持つ無関係なobjectは報告しません。

`any`、`unknown`、動的なIntl option（動的な `timeZone` 値を含む）、動的な日付文字列、destructureしたmethod、spreadを使うDate constructorは解析対象外です。`Intl.DateTimeFormat`・`Date#toLocale*` の先頭2引数にspreadがありoptionの位置が不確定な場合も推測しません。固定option引数より後ろのspreadは検査を妨げません。静的で空でない `timeZone` 文字列を許可し、optionの省略、`null`、シャドーイングされていないグローバルの `undefined` をoptionや `timeZone` に指定した場合は報告します。

文字列の検査は構造上ISO形式に見える `YYYY-MM-DD[T ]HH:mm[:ss[.fraction]]` のoffset欠落を対象とします。カレンダーの妥当性や一般的な日付文字列のvalidatorではありません。

```ts
const local = new Date(2026, 0, 2, 9, 0);
const day = instant.getDate();
const label = instant.toLocaleString('ja-JP');
const parsed = new Date('2026-01-02T09:00:00');
```

```ts
const instant = new Date('2026-01-02T00:00:00Z');
const epoch = instant.getTime();
const iso = instant.toISOString();
const utcDay = instant.getUTCDate();
const label = instant.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
```

`@rdlabo/workers-timezone` では、業務カレンダーとの境界に `toLocalDate`、`toLocalDateTime`、`localDateTimeToInstant` を使います。

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/no-implicit-timezone.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/no-implicit-timezone.ts)

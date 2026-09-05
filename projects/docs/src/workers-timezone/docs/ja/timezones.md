---
title: タイムゾーンと日付
---

JavaScriptの `Date` は時刻を表します。`BusinessDate` は `2026-07-01` のようなカレンダー日付、`BusinessDateTime` は `2026-07-01 09:00:00` のようなローカル時刻の文字列です。どちらの文字列にもタイムゾーンは含まれません。時刻へ戻す際はIANAタイムゾーンを明示してください。

## 設定

`initializeTimezone({ timeZone })` はモジュールインスタンスの既定値を設定します。同じ正規化済みタイムゾーンでの再初期化は安全ですが、別の値への変更は例外になります。デプロイ単位の固定設定を使い、モジュール評価時に初期化します。未初期化時の既定値は `Asia/Tokyo` です。

リクエスト、テナント、ユーザーごとの設定では、既定値を変更せず変換時に指定します。

```ts
import { toLocalDateTime, localDateTimeToInstant } from '@rdlabo/workers-timezone';

const wallClock = toLocalDateTime(new Date('2026-07-01T13:00:00Z'), 'America/New_York');
// '2026-07-01 09:00:00'
const instant = localDateTimeToInstant('2026-07-01', '09:00:00', 'America/New_York');
// 2026-07-01T13:00:00.000Z
```

`TIME_ZONES` は補完用の代表値で、完全な許可リストではありません。Workersの `Intl` が対応する他のIANA IDも使用でき、実行時に検証されます。

## 夏時間の切り替え

- ローカル時刻が重複する場合は、早い方の時刻を選びます。
- 存在しないローカル時刻は `RangeError` になります。
- `startOfDay` と `endOfDay` は、その日の最初と最後の表現可能な秒を返します。午前0時が欠落する日や最終時刻が重複する日にも対応します。日付全体が存在しない場合は例外になります。
- `addDays` は固定ミリ秒数ではなくカレンダー日付を加算します。1日は必ずしも24時間ではありません。`endOfDay` はミリ秒精度の包含上限ではありません。

不正な日付の構築はJavaScriptの日付繰り上がりを許さず例外になります。`normalizeBusinessDate` は不正な日付のみの入力に `null` を返します。

## データベースとの境界

このパッケージはMySQLを設定しません。`@rdlabo/workers-mysql` の固定 `+09:00` 通信ヘルパーは独立しています。業務タイムゾーンを変更しても、そのヘルパー、mysql2の設定、MySQLセッションのタイムゾーンは変わりません。時刻の保存とユーザー向けのカレンダー変換を分離してください。

[API](/docs/api)と[移行](/docs/migration)も参照してください。


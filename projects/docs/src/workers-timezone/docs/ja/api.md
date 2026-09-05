---
title: API
---

以下はすべて `@rdlabo/workers-timezone` からのexportです。`timeZone?` の既定値は初期化済みの値、未初期化なら `Asia/Tokyo` です。例外と夏時間の扱いは[タイムゾーンと日付](/docs/timezones)を参照してください。

## 設定

#### `function` initializeTimezone

`initializeTimezone(config: TimezoneConfig): Readonly<TimezoneConfig>` は既定値を一度だけ設定します。

#### `function` getTimezoneConfig

`getTimezoneConfig(): Readonly<TimezoneConfig>` は現在の設定を返します。

## 変換

#### `function` toLocalDate

`toLocalDate(instant: Date, timeZone?: TimeZone): BusinessDate` は `YYYY-MM-DD` を返します。

#### `function` toLocalDateTime

`toLocalDateTime(instant: Date, timeZone?: TimeZone): BusinessDateTime` は `YYYY-MM-DD HH:mm:ss` を返します。

#### `function` localDateTimeToInstant

`localDateTimeToInstant(date: BusinessDate, time: string, timeZone?: TimeZone): Date` はローカル日時を時刻へ変換します。時刻は `H:mm` または `HH:mm` で、秒も指定できます。

#### `function` startOfDay

`startOfDay(date: BusinessDate, timeZone?: TimeZone): Date` はその日の最初の時刻を返します。

#### `function` endOfDay

`endOfDay(date: BusinessDate, timeZone?: TimeZone): Date` はその日の最後の秒を返します。

#### `function` addDays

`addDays(date: BusinessDate, days: number): BusinessDate` は整数のカレンダー日数を加算します。

## その他のカレンダーヘルパー

`today(reference?: Date, timeZone?: TimeZone)` はカレンダー日付を返します。`normalizeBusinessDate(value: string | Date | null | undefined, timeZone?: TimeZone)` は日付または `null` を返します。時刻として扱う文字列には明示的なオフセット付きISO形式を推奨します。

`formatBusinessDateTime(instant, pattern?, timeZone?)` は `YYYY`、`MM`、`DD`、`hh`、`mm`、`ss`、`S` に対応します。`DEFAULT_BUSINESS_DATETIME_PATTERN` は `YYYY-MM-DDThh:mm:ss` です。

`parseBusinessDateTime(value: BusinessDateTime, timeZone?: TimeZone): Date` はローカルの `YYYY-MM-DD HH:mm:ss` を解析します。区切り文字 `T` も使えます。

`ageOnBusinessDate(birthDate: BusinessDate, asOfDate?: BusinessDate): number` は満年齢を返し、基準日は既定で `today()` です。

## 型と定数

`TIME_ZONES` は代表的なIANA IDを含み、`TimeZone` は他の対応IANA文字列も受け付けます。`TimezoneConfig` は `timeZone` を持ちます。`BusinessDate` と `BusinessDateTime` は文字列の型エイリアスで、実行時バリデーターではありません。`BusinessTimeZone` と `BusinessTimeConfig` は互換型エイリアスです。`BUSINESS_TIMEZONE` は旧Tokyo記述子で、現在の設定値ではありません。

`toBusinessDate`、`toBusinessDateTime`、`businessDateTimeInstant`、`startOfBusinessDay`、`endOfBusinessDay`、`addBusinessDays` は対応する上記関数の互換名です。`BUSINESS_TIME_ZONES`、`initializeBusinessTime`、`getBusinessTimeConfig` はタイムゾーン定数・設定関数の互換名です。


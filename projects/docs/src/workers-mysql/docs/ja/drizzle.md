---
title: Drizzleと日付
---

`/drizzle` または `/testing` をimportする場合は `drizzle-orm` を追加します。アプリとスキーマで同じ型を共有するため任意peerになっています。特にローカルリンクでは、単一のDrizzleへ解決されるようにしてください。ルートimportはDrizzleを読み込みません。

アプリがスキーマ定義を所有し、ORMを作成します。`DRIZZLE_ORM_OPTIONS` は `casing: 'snake_case'` を提供し、`workersDrizzleConfig` はDrizzle Kitにも同じ設定を適用します。既存スキーマのcasingを変える前に生成SQLを確認してください。

## 接続の既定値

`hyperdriveConnectionOptions` は `disableEval: true`、`decimalNumbers: true`、`timezone: '+09:00'` を設定します。`createHyperdriveDatabase` の `connectionOptions` で上書きできます。Workersではevalを無効のままにしてください。DECIMALを数値へ変換すると精度を失う場合があります。厳密な小数値には `decimalNumbers: false` と文字列処理を使います。

## 固定JSTは保存の契約

`MYSQL_TIMEZONE` は固定 `+09:00` で、`@rdlabo/workers-timezone` の設定やIANAの過去のオフセットとは独立しています。mysql2のJavaScript `Date` 変換を制御し、MySQLセッションの `time_zone` は変えません。サーバーが生成する `CURRENT_TIMESTAMP` はセッションのタイムゾーンに従うため、保存規約との整合を別途確認してください。

`jstTimestamp` と `jstDatetime` はDateをそのまま渡すカラム型です。`jstDate` は `toJstDate` でDATE入力を正規化します。サーバー設定を変更したり任意のタイムゾーン保存を自動化したりはしません。JST以外の環境では業務タイムゾーンに追随すると考えず、接続とカラムの動作を揃えてください。

`toJstDate` は `YYYY-MM-DD` 形式の文字列を日付の妥当性検証なしで通します。ユーザー入力は別途検証してください。timezoneの厳密な `normalizeBusinessDate` と同等ではありません。

更新日時には `jstOnUpdateNow(fsp?)` がSQL式を提供し、`.$onUpdateFn(() => jstOnUpdateNow(6))` と組み合わせます。生成migrationとサーバーのタイムゾーンを確認してください。

[ランタイム](/docs/runtime)、[移行とテスト](/docs/tooling)、[API](/docs/api)も参照してください。


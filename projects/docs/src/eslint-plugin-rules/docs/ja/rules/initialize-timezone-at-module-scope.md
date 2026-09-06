---
title: initialize-timezone-at-module-scope
---

`@rdlabo/workers-timezone` の初期化を、明確なモジュール直下の1箇所に限定します。

`initializeTimezone()` はモジュールインスタンスを設定するため、リクエスト、テナント、callback、classのライフサイクル内へ移動してはいけません。named import、alias、namespace importを追跡します。

モジュール直下の式、変数初期化、exportする変数初期化を許可します。関数、request handler、IIFE、制御ブロック、class static block、ネストした式、default export、同一ファイルの複数初期化箇所を検出します。

初期化のないファイルも許可します。初期化がある場合に、許可した位置がファイル内で最大1箇所であることを検査します。有効な位置でも複数ある場合はすべてを報告します。ESLintはファイル単位で解析するため、アプリケーション全体での一意性や、すべてのモジュールでの初期化を要求するものではありません。

```ts
import { initializeTimezone } from '@rdlabo/workers-timezone';

export default {
  fetch() {
    initializeTimezone({ timeZone: 'Asia/Tokyo' });
  },
};
```

```ts
import { initializeTimezone } from '@rdlabo/workers-timezone';

export const timezone = initializeTimezone({ timeZone: 'Asia/Tokyo' });
```

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/initialize-timezone-at-module-scope.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/initialize-timezone-at-module-scope.ts)

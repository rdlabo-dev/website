---
title: restrict-try-block
---

# @rdlabo/rules/restrict-try-block

> tryブロック内のPromise、RxJS、Angular Signal context、`Promise.resolve()` による逃げ道、物理コード行数を制限する。
>
> - ⭐️ このルールは `plugin:@rdlabo/rules/recommended` プリセットに含まれます。

`try/catch` は、実際にthrowする可能性がある小さな同期処理を保護するために使用してください。非同期処理、長いblock、reactive callbackを `try` 内に置くとerror boundaryが不明瞭になり、errorを握りつぶしたり誤った経路へ送ったりする可能性があります。このルールは、それらを制限します。

## ルール詳細

すべての `try` blockを検査し、デフォルトでは次を報告します。

- `try` 内の `await` またはその他のPromise/thenable使用
- 逃げ道としての、`try` の外も含むすべての `Promise.resolve()`
- `try` 内のRxJS型または操作
- `computed()` または `effect()` callback内の `try` block
- 物理コード行が3行を超える `try` block

`try` に限定した検査では `try` 本体だけを調べ、`catch` と `finally` clauseは除外します。ネストした関数、class、`try` 文はそれぞれ別の実行境界であり、外側のblockには帰属しません。`Promise.resolve()` の検査はファイル全体に適用されます。

Promise-likeとRxJSの検出には、利用可能な場合TypeScript型情報を使用します。typed lintingがない場合、それらの検査はESLintを停止せずskipされますが、構文ベースの `await`、`Promise.resolve()`、Angular Signal context、行数検査は引き続き実行されます。完全に強制するには `parserOptions.projectService` を設定してください。

## オプション

```json
{
  "rules": {
    "@rdlabo/rules/restrict-try-block": [
      "error",
      {
        "allowPromise": false,
        "allowPromiseResolve": false,
        "allowRxjs": false,
        "allowInSignal": false,
        "maxLines": 3
      }
    ]
  }
}
```

### `allowPromise`

- 型: `boolean`
- デフォルト: `false`

`try` 内でPromise/thenableを使用できるようにします。

### `allowPromiseResolve`

- 型: `boolean`
- デフォルト: `false`

ファイル全体の `Promise.resolve()` 検査を無効にします。`try` 本体内では、その呼び出しが独立してPromise-like処理でもあるため、`allowPromise: true` も必要です。

### `allowRxjs`

- 型: `boolean`
- デフォルト: `false`

`try` 内でRxJSを使用できるようにします。

### `allowInSignal`

- 型: `boolean`
- デフォルト: `false`

`computed()` または `effect()` callback内で `try` blockを使用できるようにします。

### `maxLines`

- 型: `number | false`
- デフォルト: `3`

`try` block内の物理コード行数の上限です。サイズ検査を無効にするには `false` を指定します。外側の波括弧、comment、空行は除外され、それ以外のtokenを含む一意の行を1回数えます。

## 例

### 誤り

```ts
async function run() {
  try {
    await work();
  } catch {}
}
```

```ts
try {
  Promise.resolve(1).catch(() => 0);
} catch {}
```

```ts
import { of } from 'rxjs';

try {
  of(1).pipe().subscribe();
} catch {}
```

```ts
import { computed } from '@angular/core';

const value = computed(() => {
  try {
    return JSON.parse('1');
  } catch {
    return 0;
  }
});
```

```ts
try {
  first();
  second();
  third();
  fourth();
} catch {}
```

### 正しい

```ts
function parse(source: string) {
  try {
    return JSON.parse(source);
  } catch {
    return null;
  }
}
```

```ts
async function run() {
  try {
    doWork();
  } catch {
    await recover();
  } finally {
    cleanup();
  }
}
```

```ts
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

of(1)
  .pipe(catchError(() => of(0)))
  .subscribe();
```

### 検査を緩和する

```json
{
  "rules": {
    "@rdlabo/rules/restrict-try-block": [
      "error",
      {
        "allowPromise": true,
        "allowPromiseResolve": true,
        "allowRxjs": true,
        "allowInSignal": true,
        "maxLines": false
      }
    ]
  }
}
```

## 有効にする場合

`try/catch` を小さく明示的なerror boundaryとして維持したいすべてのプロジェクトで有効にしてください。Angular Signal codeや、Promise/RxJS中心のerror handlingから移行するときに特に有効です。

`Promise.resolve()` の検査は、shadowされていないglobal `Promise` と、静的bracket notationを含む明示的な `globalThis.Promise` を認識します。aliasは意図的に追跡しません。ローカルで宣言またはimportされた `Promise` や、shadowされた `globalThis` は組み込みAPIとして扱いません。

## 実装

- [Rule source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/restrict-try-block.ts)
- [Test source](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/restrict-try-block.ts)

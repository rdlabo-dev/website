---
title: '初期化'
code: []
scrollActiveLine: []
---

[インストール](/docs/readme#インストール) のあとで `addIcons` を配線します。[使い方](/docs/usage) も見てください。

ビルド環境では開発依存関係もインストールしてください。生成されたコードはこのパッケージのランタイムをインポートし、そのランタイムはアプリケーションにバンドルされます。

### 自動設定

```bash
npx @rdlabo/ionic-angular-collect-icons --initialize true
```

`src/use-icons.ts` と、`main.ts` / `app.config.ts` への `addIcons` 登録を確認してください。

### 手動設定

#### 1. CLI を実行する

```bash
npx @rdlabo/ionic-angular-collect-icons
```

これで `src/use-icons.ts` が生成されます。

#### 2. 生成されたファイルを `main.ts`（または `app.config.ts`）でインポートする:

```diff
+ import { initializeIonicons } from '@rdlabo/ionic-angular-collect-icons/runtime';
+ import * as useIcons from './use-icons';

  if (environment.production) {
    enableProdMode();
  }

+  void initializeIonicons(useIcons);
```

`initializeIonicons` は収集済みのアイコンを同期的に登録します。その後、開発時には Angular の `isDevMode()` により、分離された遅延読み込みバンドルから全アイコンを読み込みます。本番環境では、そのバンドルをダウンロードせずに起動します。

対話形式でコレクターを実行し、旧バージョンが生成した三項演算子による初期化処理を検出すると、移行するか確認されます。既定の選択肢は **Yes** です。**No** を選ぶと初期化処理は変更されません。既存の独自の `addIcons(...)` 呼び出しも変更されません。差分のプレビュー、非対話環境、移行対象の判定については、[移行](/docs/migration#アイコンの初期化処理を更新する)を参照してください。

#### 3. クラスコンストラクタ内の他の `addIcons` 呼び出しを削除する

```diff
  @Component(/* ... */)
  export class ExampleComponent {
    constructor() {
-     addIcons(useIcons);
    }
  }
```

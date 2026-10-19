---
title: 'CLI オプション'
code: []
scrollActiveLine: []
---

`npx @rdlabo/ionic-angular-collect-icons` のフラグです。一覧表は [CLI API](/docs/api) にあります。

### --dry-run [boolean]

ファイルに実際に書き込まず、どのような変更が行われるか確認したい場合は `true` を設定します。デフォルトは `false` です。

```bash
npx @rdlabo/ionic-angular-collect-icons --dry-run true
```

### --interactive [boolean]

すべての CLI オプションをプロンプトで設定したい場合は `true` を設定します。Dry run で結果だけを確認する場合にも使えます。
デフォルトは `false` です。

```bash
npx @rdlabo/ionic-angular-collect-icons --interactive true
```

### --initialize [boolean]

アイコン登録を自動で初期化したい場合は、`--initialize` フラグを使えます。デフォルトは `false` です。CLI は次の行を追加します:

```diff
+ import { initializeIonicons } from '@rdlabo/ionic-angular-collect-icons/runtime';
+ import * as useIcons from './use-icons';

  if (environment.production) {
    enableProdMode();
  }

+  void initializeIonicons(useIcons);
```

CLI は `enableProdMode()` があるファイルに行を追加します。もちろん、手動で設定することもできます。

`--initialize` が必要なのは、初期化処理がまだないプロジェクトに追加する場合だけです。既存の初期化処理を移行するには、別途確認が必要です。

あわせて、クラスコンストラクタ内の他の `addIcons` 呼び出しも削除します。

```diff
  @Component(/* ... */)
  export class ExampleComponent {
    constructor() {
-     addIcons(useIcons);
    }
  }
```

```bash
npx @rdlabo/ionic-angular-collect-icons --initialize true
```

### --migrate [boolean]

対話形式のターミナルでは、コレクターが認識したソースの移行を適用する前に、それぞれ確認を求めます。既定の選択肢は **Yes** です。**No** を選ぶと、その移行の対象は変更されません。

CI などの非対話環境では、このオプションで明示的に回答できます。

```bash
npx @rdlabo/ionic-angular-collect-icons --migrate true
```

ファイルを書き換えずに生成される差分を確認するには、次を実行します。

```bash
npx @rdlabo/ionic-angular-collect-icons --migrate true --dry-run true
```

対話形式の実行時に確認できるよう、このオプションは既定では未設定です。

### --project-path [string]

プロジェクトへのパスを指定したい場合は、`--project-path` フラグを使えます。デフォルトはカレントディレクトリです。

```bash
npx @rdlabo/ionic-angular-collect-icons --project-path /path/to/project
```

対象ファイルは、指定パスからの `src` ディレクトリ配下です。

- path/to/project + `src/**/*.ts`
- path/to/project + `src/**/*.html`

### --icon-path [string]

デフォルトの生成ファイルは（path/to/project +）`src/use-icons.ts` です。ファイル名を指定したい場合は、`--icon-path` フラグを使えます。

```bash
npx @rdlabo/ionic-angular-collect-icons  --icon-path src/other-use-icons.ts
```

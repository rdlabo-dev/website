---
title: 移行
---

## アイコンの初期化処理を更新する

この節は、3.0.1 以前から `initializeIonicons` を提供するリリースへ更新する場合に適用されます。

旧バージョンは、Ionicons の全アイコンに対する名前空間インポートを生成していました。

```ts
import { addIcons } from "ionicons";
import * as allIcons from "ionicons/icons";
import * as useIcons from "./use-icons";

addIcons(environment.production ? useIcons : allIcons);
```

実行時には本番用の分岐で `useIcons` が選ばれていましたが、名前空間インポートにより、最適化したアプリケーションのバンドルにも全アイコンが残る可能性がありました。このパッケージは、本番環境の依存関係に対してツリーシェイキングが効くブラウザー用ランタイムを提供するようになりました。

まずパッケージを更新してから、対話形式のターミナルでコレクターを実行します。

```bash
npm install --save-dev @rdlabo/ionic-angular-collect-icons@latest
npx @rdlabo/ionic-angular-collect-icons
```

生成されたアプリケーションコードはコンパイル時にブラウザー用ランタイムをインポートするため、ビルド環境では開発依存関係もインストールしてください。そのランタイムはアプリケーションの出力にバンドルされます。

生成された初期化処理を検出すると、CLI は移行するか確認します。既定の選択肢は **Yes** です。**No** を選ぶと初期化処理を変更せず、通常のアイコン収集を続けます。

先にソースの差分を確認するには、**No** を選び、次を実行します。

```bash
npx @rdlabo/ionic-angular-collect-icons --migrate true --dry-run true
```

CI などの非対話環境では、`--migrate true` で移行を明示的に許可してください。このフラグがなければ、初期化処理は変更されません。許可した場合は次のコードになります。

```ts
import { initializeIonicons } from "@rdlabo/ionic-angular-collect-icons/runtime";
import * as useIcons from "./use-icons";

void initializeIonicons(useIcons);
```

`initializeIonicons` は収集済みのアイコンを同期的に登録します。その後、開発時には Angular の `isDevMode()` により、分離された遅延読み込みバンドルから全アイコンを読み込みます。本番環境では、そのバンドルをダウンロードせずに起動します。

確認を経た移行では、旧バージョンが生成した次の三項演算子による初期化処理だけを書き換えます。

```ts
addIcons(environment.production ? useIcons : allIcons);
```

インポートのバインディングも、既知の生成構造と一致する必要があります。その他の `addIcons(...)` 呼び出しと、独自のアプリケーションコードが使うインポートは保持されます。移行処理は、生成ファイルの旧来のパス `"use-icons"` と、正規の相対パス `"./use-icons"` の両方を認識し、移行後は正規の形式で出力します。
`--migrate true` を明示的に指定した場合は、従来の `addIcons(useIcons)` 形式も更新対象になります。ただし、`useIcons` が設定されたアイコン生成ファイルの名前空間インポートである場合に限ります。初期化処理を独自に変更している場合は、インポートと呼び出しを手動で置き換え、独自の登録処理を別に保持してください。

本番バンドルのツリーシェイキングを維持したままランタイムとの統合を取り消すには、インポートと呼び出しを次のように置き換えます。

```ts
import { addIcons } from "ionicons";
import * as useIcons from "./use-icons";

addIcons(useIcons);
```

この切り戻しでは、開発時も全アイコンは登録されません。本番バンドルが肥大化する原因となるため、旧来の `allIcons` の名前空間インポートには戻さないでください。

移行後は、利用側のアプリケーションのテストと、最適化した本番ビルドを実行してください。バンドル統計では、初期読み込みの依存関係に含まれるアイコンが `use-icons.ts` からエクスポートされたものだけであることを確認します。Ionicons の全アイコンが別の遅延読み込みチャンクとして存在することはありますが、本番環境の起動時にダウンロードされてはいけません。

## Ionic Angular 9への移行

このversionはIonic Angular 9を対象とし、[Ionic Framework 9の破壊的変更](https://github.com/ionic-team/ionic-framework/blob/main/BREAKING.md#version-9x)に従います。

### 要件

- Ionic Angular 9以降
- Angular 18以降
- nativeアプリケーションではCapacitor 7以降
- TypeScript 5.4以降
- Ionicons 8以降
- Node.js 22以降

### 公式migratorを実行する

Ionicは公式migration toolの利用を推奨しています。最初にアプリケーションの現在の変更をcommitしてください。migratorはfileを直接編集するため、差分の確認や取り消しにcommitを使えるcleanなGit worktreeが必要です。

Ionicアプリケーションのrootで実行します。

```bash
npx @ionic/migrate
```

migratorはインストール済みのIonic major versionを検出し、依存関係を更新します。安全な自動修正とformat、依存関係の再installを実行し、手動確認が必要な変更をchecklistで表示します。

fileを書き換えず移行内容をpreviewするには次を実行します。

```bash
npx @ionic/migrate --dry-run
```

公式migration完了後にcollectorを更新し、依存packageのversionが上記要件を満たすことを確認します。

```bash
npm install --save-dev @rdlabo/ionic-angular-collect-icons@latest
```

以降では、生成された差分とmigratorの手動確認checklistで検証すべきIonic Angular 9の重要な変更を説明します。

### standalone migrationを完了する

Ionic 9はstandalone Angular componentを `@ionic/angular` からexportします。Ionic 8のstandalone entry pointを置き換えます。

```diff
- import { IonApp, IonIcon, provideIonicAngular } from '@ionic/angular/standalone';
+ import { IonApp, IonIcon, provideIonicAngular } from '@ionic/angular';
```

公式migratorはframework更新中にアプリケーションのarchitectureを維持するため、NgModule importを `@ionic/angular/lazy` へ移す場合があります。これは移行途中の状態であり、standalone migrationの完了形ではありません。Angular standalone migrationを完了してから、各Ionic componentを `@ionic/angular` からimportしてください。NgModule consumerを変換する前に `/lazy` importを機械的に書き換えてはいけません。

### standalone migration後に `IonicModule` を置き換える

`IonicModule` はIonic 9でdeprecatedですが、削除にはアプリケーション単位のarchitecture変更が必要です。アプリケーションをstandalone bootstrapへ変換し、Ionic設定を `provideIonicAngular()` へ移し、各consumerが使うstandalone Ionic componentをimportします。

```diff
- platformBrowserDynamic().bootstrapModule(AppModule);
+ bootstrapApplication(AppComponent, {
+   providers: [provideIonicAngular(config)],
+ });
```

`provideIonicAngular` は `@ionic/angular` からimportします。同じNgModule内で `IonicModule.forRoot()` を1行のprovider変更へ置き換えてはいけません。最初にNgModuleからstandaloneへの移行を完了してください。

### exportsを考慮するmodule resolutionを使う

Ionic 9はpackage subpathを `exports` で公開します。アプリケーションではAngular標準のbundler resolutionを使ってください。

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022"
  }
}
```

`~` を使うwebpack形式のCSS importを置き換えます。

```diff
- @import '~@ionic/angular/css/core.css';
+ @import '@ionic/angular/css/core.css';
```

### icon collectorを実行する

まだ初期化していない場合は、生成されるicon登録を初期化します。

```bash
npx @rdlabo/ionic-angular-collect-icons --initialize true
```

[使い方](/docs/usage)の説明に従い、本番build前にcollectorを引き続き実行します。

### Ionic 9のほかの変更を確認する

collectorはAngular templateから `ion-icon` の利用箇所を探し、専用のicon登録fileを更新します。Ionic componentの挙動や内部DOMには依存しないため、それらにcollector固有の変更はありません。ただし、アプリケーション側では公式migration note、特に新しいbrowser・mobile platformのminimum versionと次の変更を確認してください。

- nativeアプリケーションはCapacitor 7以降とiOS 16以降が必要です。
- 対応desktop browserはChrome 89以降、Safari 16以降、Edge 89以降、Firefox 75以降です。
- `ion-input` と `ion-searchbar` の `autocorrect` propertyはbooleanになりました。
- legacy picker componentと `PickerController` は削除されました。
- sheet modal handleのdefaultは `handleBehavior="cycle"` になりました。
- `ion-nav` は `ion-router` と連携しなくなりました。
- `ion-select` はvalueが変わった場合だけ `ionChange` をemitします。
- input、select、textareaの内部DOMとstyling hookが変わりました。
- Angular 21アプリケーションはzoneless change detectionをdefaultで使います。

移行後はアプリケーションのlint、test、本番buildを実行し、customizeしたIonic componentのstyleを目視確認してください。

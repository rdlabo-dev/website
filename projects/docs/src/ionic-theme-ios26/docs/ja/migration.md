---
title: '移行'
code: []
scrollActiveLine: []
---

アップグレード対象のversionに対応するsectionを参照してください。各sectionには、アプリケーションのコードまたは設定の変更が必要な項目のみを記載しています。

## 9.2.0への移行

### バージョンに依存しないテーマ名

テーマの適用を除外するクラスとCSS変数を、OSのバージョンに依存しない名前に変更しました。iOS 27版と共通の名前を使い、今後の移行に備えられます。旧名はdeprecatedです。新しいコードでは新名を使い、既存のカスタマイズは都合のよいタイミングで移行してください。

| 非推奨の名前 | 新しい名前 |
| --- | --- |
| `ios26-disabled` | `ios-theme-disabled` |
| `--ios26-content-box-shadow-rgb` | `--ios-theme-content-box-shadow-rgb` |
| `--ios26-*`（その他のテーマ変数） | `--ios-theme-*`（同じ接尾辞） |

```diff
- <ion-button class="ios26-disabled">Standard Ionic button</ion-button>
+ <ion-button class="ios-theme-disabled">Standard Ionic button</ion-button>
```

```diff
ion-content {
-  --ios26-content-box-shadow-rgb: 255, 255, 255;
+  --ios-theme-content-box-shadow-rgb: 255, 255, 255;
}
```

`ios26-disabled` は互換名として引き続き利用できます。旧CSS変数もフォールバックとして利用でき、両方を指定した場合は新名が優先されます。パッケージ名とスタイルシートのパスは変わりません。

## 9.0.0への移行

テーマのメジャーバージョンをIonic Framework 9に合わせました。以前の移行項目以外に、新たな破壊的変更はありません。

Ionic 8とIonic 9の両方を引き続きサポートします。必要なバージョンは `@ionic/core >=8.8.1 <10` です。

## 3.0.0への移行

### `.header-item-group` を `.item-group-header` に変更する

section headerとして使う `ion-item-group` のclass名を、対象elementとの一貫性を保つため変更しました。アプリケーションのtemplateとstyleにある `.header-item-group` をすべて置き換えてください。

```diff
- <ion-item-group class="header-item-group">
+ <ion-item-group class="item-group-header">
    ...
  </ion-item-group>
```

旧classはthemeでstyleされなくなりました。この変更は、`@rdlabo/ionic-theme-md3` と共有するmarkupにも適用されます。

## 2.0.0への移行

### `iosTransitionAnimation` を設定する

version 2ではpackageのnavigation transitionが必要です。このtransitionは、Large Titleをback buttonのlabelへ動かしていた古い `animateBackButton()` の挙動を除き、Ionicのdefault iOS transitionに従います。

```ts
import { isPlatform } from '@ionic/core'; // or @ionic/angular/standalone, @ionic/react, @ionic/vue
import { iosTransitionAnimation } from '@rdlabo/ionic-theme-ios26';

// Angular
provideIonicAngular({
  // ...
  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
});

// React
setupIonicReact({
  // ...
  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
});

// Vue
createApp(App).use(IonicVue, {
  // ...
  navAnimation: isPlatform('ios') ? iosTransitionAnimation : undefined,
});
```

このtransitionを設定すると、旧animationによる不要なtransitionの副作用なしに `<ion-buttons><ion-back-button></ion-back-button></ion-buttons>` を利用できます。

## 1.0.0への移行

### SCSSのimport pathを更新する

JavaScript fileがpackageに追加された際、source fileは `src/styles` 以下へ移動しました。

```diff
- @import '@rdlabo/ionic-theme-ios26/src/default-variables.scss';
+ @import '@rdlabo/ionic-theme-ios26/src/styles/default-variables.scss';
```

`dist` 以下の生成済みCSS pathは変更されていません。

### `--ios26-color-background-rgb` の名前を変更する

```diff
  :root {
-   --ios26-color-background-rgb: 255, 255, 255;
+   --ios26-content-box-shadow-rgb: 255, 255, 255;
  }
```

### brightness変数の名前を変更する

各 `--ion-color-*-brightness-rgb` 変数を `--ion-color-*-brightness` に置き換え、RGB channel listではなくcolor valueを指定してください。

```diff
  :root {
-   --ion-color-primary-brightness-rgb: 130, 255, 255;
+   --ion-color-primary-brightness: #96feff;
  }
```

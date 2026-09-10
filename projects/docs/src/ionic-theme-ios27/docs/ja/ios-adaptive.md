---
title: iOSテーマの切り替え
---

CSSの機能クエリでテーマを選択し、古いブラウザではIonic標準のiOSスタイルを維持します。Safari 27で `:heading` が追加されました。[WebKitの発表](https://webkit.org/blog/17967/news-from-wwdc26-webkit-in-safari-27-beta/)を参照してください。

この判定はOSのバージョンではなくブラウザの機能を検出します。他のブラウザが同じ機能に対応する場合もあります。Ionicのmodeとプラットフォーム別のアニメーション設定も、アプリに合わせて揃えてください。

## iOS 27テーマだけを読み込む

グローバルSassで、機能クエリの内側から `meta.load-css` を使います。`@use` と異なり、`@supports` の内側にテーマを出力できます。

```scss
@use 'sass:meta';

@supports selector(:heading) {
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect');
}
```

## iOS 26とiOS 27のテーマを併用する

両方のパッケージをインストールします。

```bash
npm install @rdlabo/ionic-theme-ios26 @rdlabo/ionic-theme-ios27
```

無条件のテーマimportの代わりに、次のグローバルSass設定を使います。

```scss
@use 'sass:meta';

@supports selector(:heading) {
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect');
}

@supports (text-wrap: pretty) and (not selector(:heading)) {
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/default-variables');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/ionic-theme-ios26-dark-class');
  @include meta.load-css('@rdlabo/ionic-theme-ios26/src/styles/md-remove-ios-class-effect');
}
```

2つの条件は排他的です。どちらの機能にも対応しないブラウザはIonic標準のスタイルを維持します。`text-wrap: pretty` の判定は、旧テーマで使っていた古いSafari向けの機能判定を引き継いでいます。

どちらの例もclassベースのダークモードを使います。アプリでIonic側の対応するダークパレットも読み込んでください。system／alwaysの場合は `-dark-class` を対応するvariantに置換します。`md-ion-list-inset` も使う場合は、各条件の内側で対応するパッケージのスタイルシートを読み込んでください。

## 対応するJavaScriptアニメーションを選ぶ

Ionic初期化前の動的importにも同じ機能判定を使います。このローダーはiOSプラットフォームで呼び出し、他のプラットフォームでは既存のアニメーション設定を維持します。

```ts
async function loadIOSAnimations() {
  if (typeof CSS === 'undefined') {
    return {};
  }

  const theme = CSS.supports('selector(:heading)')
    ? await import('@rdlabo/ionic-theme-ios27')
    : CSS.supports('text-wrap: pretty')
      ? await import('@rdlabo/ionic-theme-ios26')
      : undefined;

  if (!theme) {
    return {};
  }

  return {
    navAnimation: theme.iosTransitionAnimation,
    popoverEnter: theme.popoverEnterAnimation,
    popoverLeave: theme.popoverLeaveAnimation,
  };
}

// ブラウザのbootstrapで、Ionicの初期化前に実行します:
const animations = isPlatform('ios') ? await loadIOSAnimations() : {};
provideIonicAngular({ ...animations });
```

READMEの例と同様に、`isPlatform` と `provideIonicAngular` はIonic Angularのエントリポイントからimportします。React／Vueでは同じオプションを `setupIonicReact`／`IonicVue` に渡します。importは実行時に選択されますが、bundlerは両方のパッケージのchunkを出力する場合があります。SSRアプリではブラウザ初期化時に判定してください。

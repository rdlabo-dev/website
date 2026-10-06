---
title: 'Native Ads（プレビュー）'
---

**Native Ads はプレビュー機能です。** テストにも本番環境にも利用できます。プレビュー期間中は、マイナーリリースで API が変更される場合があります。

ネイティブ広告は、このプラグインが管理する Google Mobile Ads SDK のビューで描画されます。アプリ側では HTML のスロットを確保し、安定したキーを指定します。Kotlin や Swift で `NativeAdView` を実装したり、JavaScript で広告アセットを描画したりする必要はありません。

Native Ads は iOS と Android で利用できます。仮想スクロールにはまだ対応していません。ネイティブ広告は WebView の上に配置されるため、広告上から始めたパン操作が WebView のスクロールコンテナに届かないことがあります。WebView のスクロールに合わせてオーバーレイの座標を更新しますが、操作開始時のジェスチャーの振り分けの問題は、それだけでは解決できません。

ブラウザと PWA には対応していません。`NativeAdFeed.create()` は空の広告スロットを残す代わりに拒否されます。

## フィードの作成

AdMob の初期化と同意の取得を済ませてから、表示するフィード画面ごとに1つのマネージャーを作成します。

```ts
import { NativeAdFeed, NativeAdPluginEvents, NativeAdTemplate } from '@capacitor-community/admob';

const nativeAds = await NativeAdFeed.create({
  feedId: 'home-feed',
  template: NativeAdTemplate.Medium,
  isTesting: true,
  style: {
    backgroundColor: '#ffffff',
    cornerRadius: 12,
    headlineColor: '#111827',
    callToActionBackgroundColor: '#2563eb',
  },
});

const paidHandle = await nativeAds.addListener(NativeAdPluginEvents.AdPaid, (event) => {
  console.log(event.slotKey, event.valueMicros, event.currencyCode);
});
```

通常のマークアップでも仮想化されたマークアップでも、フレームワークに依存しない要素を使えます。`slot-key` には、配列のインデックスや再利用された DOM ノードではなく、論理的な広告項目を識別する値を指定してください。

```html
<capacitor-admob-native feed-id="home-feed" slot-key="sponsored-after-article-42"></capacitor-admob-native>
```

この要素は、アプリ側の CSS で高さが指定されていない場合に限り、`Medium` では `320px`、`Small` では `120px` を確保します。アプリ側の `display: none` や明示的な高さ指定は尊重されます。`Small` のスロットは最低 `120×120px`、`Medium` は最低 `144×300px` が必要です。それより小さいスロットでは広告をロードしません。これらは下限値であり、すべての広告クリエイティブやフォントサイズが収まることを保証するものではありません。Android では、計測したメディア領域が `120×120dp` より小さい場合、`Medium` は非表示のままになります。テキスト、端末の文字サイズ設定、ピクセルの丸めを考慮してスロットを大きくしてください。スロットの高さをアニメーションさせたり、動的に計測したりしないでください。

`Small` には動画領域がありません。このテンプレートに対して SDK が動画広告を返した場合、ロードは `NativeAdPluginEvents.FailedToLoad`（コード `-1`）で失敗します。広告の表示や自動再試行は行いません。動画広告を配信する広告ユニットには `Medium` を使ってください。

フレームワークがカスタム要素を受け付けない場合は、通常の要素を関連付けます。

```ts
nativeAds.attach('sponsored-after-article-42', element);

// 要素を破棄する前、または別の論理項目に再利用する前に解除します。
nativeAds.detach(element);
```

画面の破棄に合わせてマネージャーも破棄します。

```ts
await paidHandle.remove();
await nativeAds.destroy();
```

## 仮想スクロール連携の実験

安定したキーを使うライフサイクルは、Angular CDK virtual scroll、React Virtuoso、Vue Virtual Scroller との今後の検証を想定して設計されています。以下は実験用の連携例であり、対応を保証するものではありません。

- 論理的な広告 ID を `slot-key` に指定します（Angular のバインディング、React の prop/ref、Vue の `:slot-key`）。描画時のインデックスは使わないでください。
- 広告行の高さを固定し、その高さを仮想スクローラーの項目サイズ計算に含めます。
- ライブラリが行を再利用する場合は、キーを更新するか、`detach` を呼んでから新しいキーで `attach` を呼びます。プラグインは新しい世代をロードまたは表示する前に、古い世代を非表示にします。
- 縦方向のスクロールルートを1つだけ使ってください。入れ子のスクロールコンテナ、横方向の仮想リスト、sticky または transform を適用した祖先要素、行の高さのアニメーションは、初期の対応範囲に含まれません。

Angular では、フィードを持つ standalone コンポーネントまたは NgModule に `CUSTOM_ELEMENTS_SCHEMA` を追加し、仮想行の中でプロパティではなく属性をバインドします。

```html
<capacitor-admob-native feed-id="home-feed" [attr.slot-key]="item.stableAdKey"></capacitor-admob-native>
```

React では、`createElement` を使うと、プラグインにフレームワークへの依存を追加せず、ハイフン区切りのカスタム属性を型安全に扱えます。

```tsx
import { createElement } from 'react';

const NativeAdRow = ({ slotKey }: { slotKey: string }) =>
  createElement('capacitor-admob-native', {
    'feed-id': 'home-feed',
    'slot-key': slotKey,
  });
```

Vue では、Vue コンパイラでこのタグをカスタム要素として指定し、安定したキーをバインドします。

```ts
// vite.config.ts
vue({
  template: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'capacitor-admob-native',
    },
  },
});
```

```html
<capacitor-admob-native feed-id="home-feed" :slot-key="item.stableAdKey" />
```

通常の HTML の `overflow: auto` コンテナ、または Ionic の `ion-content` を使ってください。Android ではスクロール専用のオプションは不要です。広告はスロットとそのクリッピング境界に追従しますが、高速スクロールでは遅れることがあります。新しい広告はスクロールが落ち着いてからロードされます。

1つのフィードで保持できるネイティブ広告は、画面外の関連付け済みスロットも含めて最大3つです。それを超える可視スロットは空きができるまで待機します。同時に有効にできるフィードマネージャーは最大2つです。広告は自動更新されず、ロード失敗時の暗黙的な再試行もありません。`reload(slotKey)` は、プロダクト側で明示的に定めた再試行または更新のタイミングでのみ呼び出してください。

## レイアウトとオーバーレイのライフサイクル

アコーディオンの展開など、スクロールせずにスロットの位置が変わりうるアプリ側のレイアウト変更後は、`invalidateLayout()` を呼び出します。スロットのサイズ変更と、捕捉された画像ロードイベントは自動で検知されます。

ネイティブ広告は WebView のコンテンツの上に配置されるため、Ionic のモーダル、ポップオーバー、メニュー、ローディング表示、ルート遷移がスロットを覆っているかどうかは判断できません。オーバーレイを表示する前にフィードを非表示にし、閉じたあとで再開してください。

```ts
await nativeAds.pause();
await modal.present();
await modal.onDidDismiss();
nativeAds.resume();
```

画面を離れるときは `destroy()` を呼び出します。オーバーレイの表示前に `pause()` の完了を待ってください。ネイティブ側の非表示更新に失敗すると拒否されます。`resume()` はビューポートが落ち着くのを待ってから、条件を満たす広告を再び表示します。`invalidateLayout()` も、古い配置の広告が非表示になってから解決します。

## API

| メンバー | 役割 |
| ---------------------------------------------- | -------------------------------------------------------------- |
| `NativeAdFeed.create(options)` | ネイティブフィードのセッションを開始します。iOS と Android 以外では拒否されます。 |
| `feedId` | カスタム要素が使う、正規化されたフィード識別子です。 |
| `addListener(event, listener)` | このフィードセッションだけを対象とするリスナーを追加します。 |
| `attach(slotKey, element)` / `detach(element)` | 通常の要素を使う場合の高度なライフサイクル操作です。 |
| `reload(slotKey)` | 登録済みスロットを1つ、明示的に削除して再ロードします。 |
| `pause(): Promise<void>` / `resume(): void` | Web オーバーレイの表示中やページが非アクティブな間、広告を非表示にします。 |
| `invalidateLayout(): Promise<void>` | アプリ側のリフロー後に広告を非表示にし、再計測します。 |
| `destroy()` | セッションのリスナーとすべてのネイティブリソースを解放します。 |

`NativeAdFeedOptions` には `feedId`、`adId`、`template`、`style`、`isTesting`、`npa`、および iOS 用の任意の `scrollElement` が含まれます。Google のプラットフォーム別テスト広告ユニットを使うには `isTesting: true` を指定します。本番広告では、プラットフォームごとのネイティブ広告ユニット ID を `adId` に指定し、`isTesting` を省略するか `false` にします。`isTesting` が `true` でない限り、`adId` は必須です。`feedId` とすべての `slotKey` は空でない安定した値にしてください。古いネイティブセッションを安全に置き換えられるよう、WebView のリロード前後で同じフィード ID を再利用します。

## 描画とポリシーの責任範囲

`Small` と `Medium` のテンプレート、広告であることの表示、AdChoices、メディア、クリック可能なアセットの登録は、プラグインが管理します。公開スタイル API は、任意のネイティブレイアウトや HTML によるアセット描画の代わりに、プラットフォーム共通の限定的なトークンだけを意図的に公開しています。これにより、Google SDK のインプレッションとクリックの処理をネイティブ SDK 内で完結させます。

スタイルの色は、両プラットフォームで CSS 形式の `#RRGGBB` または `#RRGGBBAA` を使います。寸法は論理ピクセル、フォントサイズは iOS ではポイント、Android では `sp` です。不正な色はテンプレートの既定値に戻ります。負の寸法はゼロに補正されます。見出し、本文、行動喚起のフォントサイズは、それぞれ `12–24`、`10–18`、`12–18` の範囲に制限されます。

Google のネイティブ広告ポリシーと、[Android](https://developers.google.com/admob/android/native/advanced) および [iOS](https://developers.google.com/admob/ios/native/advanced) の実装ガイドに従ってください。

## iOS のスクロールコンテナ

Ionic のスクロールコンテナを1つ使う場合は、フィードの作成時に実際のスクロール要素を渡します。

```ts
const feed = await NativeAdFeed.create({
  feedId: 'articles',
  isTesting: true,
  scrollElement: await ionContent.getScrollElement(),
});
```

iOS では、`scrollElement` を指定すると、そのコンテナの実験的なネイティブスクロール追従が有効になります。レイアウト変更時は引き続き再計測が必要です。アプリ側で変更したあとに `invalidateLayout()` を呼び出してください。スクロールコンテナ内と、その可視境界でのクリッピングは維持されます。`pause()` と `destroy()` は追従を停止します。他のプラットフォームはこのオプションを無視し、JavaScript による座標更新を続けます。

指定したコンテナを一意に特定できない場合、更新は失敗し、広告は非表示のままになります。transform やズームを適用していない overflow スクロールコンテナを1つ使ってください。入れ子のスクロール、このオプションによるドキュメントのスクロール、仮想スクロールとの連携には対応していません。広告上から始まるスワイプのジェスチャーの振り分けも変わりません。

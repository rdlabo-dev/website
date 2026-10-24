---
title: Ionic アプリで Native UI をセットアップする
---

# Ionic アプリで Native UI をセットアップする

既存の Web 外観を維持し、対応する Ionic コントロールを iOS でネイティブ描画します。このガイドに iOS テーマのスタイルシートは不要です。

iOS 27 テーマを使用中なら[テーマに Native UI を追加する](/ionic-theme-ios27/docs/add-native-ui)を参照してください。Ionic がなければ [HTML 設定](framework-independent.md)を使用します。

Native UI が初めてなら[投影の仕組み](../README.md#how-projection-works)から読んでください。このガイドは既存の Ionic コントロールをその表示へ接続します。

## 始める前に

| 要件 | 通常のネイティブコントロール |
| ------------------------- | -------------------------------------------------------------------------- |
| Ionic                     | `>=8.8.1 <10`                                                              |
| ネイティブプロジェクト | iOS プロジェクトを持つ Capacitor 8 |
| ビルドツール | Xcode 26 以降 |
| デバイス・シミュレーター | iOS 26 以降 |
| ネイティブ依存管理 | 既存の SPM または CocoaPods 連携を維持。 |
| Vertical Bars | 別の[デバイス要件](vertical-bars.md#native-rendering)を参照。 |

まだ Capacitor を使っていない場合は、以下の手順の前に Capacitor iOS プロジェクトを作成・設定してください。ブラウザープレビューは Web コントロールを維持し、UIKit・SwiftUI 描画の確認にはなりません。

## 1. プラグインをインストールする

デバイス状態の標準連携には [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) を使います。配置と折りたたみ状態の API でレイアウトの適応をアプリが制御できます。導入後は初期値と変更イベントを接続します。

Capacitor パッケージはバージョン 8 を維持します。次をアプリの直接依存に追加します。

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Ionic アダプターはアプリに既存の `@ionic/core` を使います。ページ内容とフォールバックの装飾に必要な既存 Web スタイルを削除しないでください。

## 2. Shell を有効にする

`ion-app` のマウント後、アプリの起動時に一度呼びます。

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const shell = await enableNativeUI();
```

機能無効化や投影停止に備えてハンドルを保持します。アプリの所有元を破棄するとき `await shell.destroy()` を呼びます。ページごとに Shell を起動しないでください。

既存の Ionic マークアップがラベル、アイコン、無効状態、操作を提供します。たとえば固定ページヘッダーに次を置けます。

```html
<ion-header>
  <ion-toolbar>
    <ion-title>My app</ion-title>
    <ion-buttons slot="end">
      <ion-button aria-label="Add">
        <ion-icon slot="icon-only" name="add"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
```

フレームワークのハンドラーは元のボタンに維持し、通常どおりアイコンを登録します。[対応マークアップ](native-ui.md#supported-markup)を確認してください。非対応コントロールは Web に残ります。

### フレームワークのアプリルートに起動処理を置く

ルーティングされるページより上に、アプリ全体で 1 つの Shell を維持します。以下のアプリ所有ヘルパーは React 開発時の再マウントを含め非同期起動・終了を直列化します。共通の起動オプションをここに置き、他の `enableNativeUI()` 呼び出しは削除します。

```ts
// native-ui.ts — ルートコンポーネントの隣に配置します
import { enableNativeUI, type NativeUIHandle } from '@rdlabo/capacitor-native-ui';
// Ionic がなければ @rdlabo/capacitor-native-ui/core を使います。

let lifecycle = Promise.resolve();
const report = (error: unknown) => console.error('Native UI lifecycle failed', error);

export function mountNativeUI(): () => void {
  let disposed = false;
  let shell: NativeUIHandle | undefined;
  lifecycle = lifecycle
    .then(async () => {
      if (disposed) return;
      shell = await enableNativeUI(); // ここにオプションを指定します。
      if (disposed) await shell.destroy();
    })
    .catch(report);
  return () => {
    disposed = true;
    lifecycle = lifecycle
      .then(async () => {
        await shell?.destroy();
        shell = undefined;
      })
      .catch(report);
  };
}
```

以下からフレームワークを **1 つ**選びます。ヘルパーはアプリのコードで、追加インストールするパッケージではありません。

**Angular:** ルートコンポーネントの最初の DOM 描画後に呼び、`DestroyRef` にクリーンアップを登録します。

```ts
import { afterNextRender, DestroyRef, inject } from '@angular/core';
import { mountNativeUI } from './native-ui';

// ルートの AppComponent のコンストラクター内:
const destroyRef = inject(DestroyRef);
afterNextRender(() => {
  const stop = mountNativeUI();
  destroyRef.onDestroy(stop);
});
```

**React:** `IonApp` を描画するルートコンポーネントで effect を 1 つ使います。

```tsx
import { useEffect } from 'react';
import { mountNativeUI } from './native-ui';

// ルートの App コンポーネント内:
useEffect(() => mountNativeUI(), []);
```

**Vue:** ルートコンポーネントの `<script setup>` にライフサイクルフックを登録します。

```ts
import { onMounted, onBeforeUnmount } from 'vue';
import { mountNativeUI } from './native-ui';

let stop: (() => void) | undefined;
onMounted(() => {
  stop = mountNativeUI();
});
onBeforeUnmount(() => {
  stop?.();
});
```

これらのフックはページごとの遷移ではなくアプリの寿命を管理します。以下のナビゲーションも設定してください。

## 3. ナビゲーションを調整する

任意の Ionic アニメーション連携には `@rdlabo/ionic-theme-ios27` を導入し、Native UI と同時更新して版を揃えます。Ionic の初期化前にナビゲーションを設定します。アダプターはテーマ CSS を読み込まず Ionic 標準の遷移を維持できます。

```sh
npm install @rdlabo/ionic-theme-ios27 @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

```ts
import { iosTransitionAnimation, mdTransitionAnimation, type AnimationBuilder } from '@ionic/core';
import { withNativeUITransition } from '@rdlabo/ionic-theme-ios27';

const defaultTransition: AnimationBuilder = (baseEl, opts) =>
  (opts.mode === 'ios' ? iosTransitionAnimation : mdTransitionAnimation)(baseEl, opts);

const ionicConfig = {
  navAnimation: withNativeUITransition(defaultTransition),
};
```

Angular の `provideIonicAngular`、React の `setupIonicReact`、Vue の `IonicVue` に渡します。独自アニメーションは[遷移アダプターの手順](migration.md#native-ui-transition-adapter)を参照してください。この任意のアダプターにはテーマパッケージが必要ですが、スタイルシートは不要でアニメーションも置き換えません。

プラグインのみのアプリは後述の[テーマなしのナビゲーション](#navigation-without-the-theme)を使います。遷移をテストする前にいずれか 1 方式を設定してください。

## 4. ビルド・同期して実行する

アプリの Web ビルド後に同期します。

```sh
npx cap sync ios
```

Xcode から iOS 26 以降のデバイス・シミュレーターで起動します。対応する固定コントロールがネイティブ表示され元のハンドラーを呼ぶこと、前後の遷移と戻るスワイプのキャンセルを確認します。ブラウザー・Android ビルドでは Web コントロールが動作することを確認してください。

| 症状 | 確認事項 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| iOS ですべて Web のまま | ネイティブパッケージが直接依存で、同期・再ビルド済み、対応 OS で起動処理が実行されていること。 |
| 1 つだけ Web のまま | マークアップとスタイルを[対応コントロール](native-ui.md#supported-markup)と比較。 |
| 遷移中にコントロールが重なる | 遷移前にアダプターまたは suspend/resume のライフサイクルを設定。 |
| スタイルや余白がない | アプリの Web CSS を維持。プラグインはページ配置を提供しない。 |

## 次のステップ

- [Vertical Bars のみ](ionic-vertical-bars.md): 既存テーマでのレール導入手順。
- [設定](configuration.md): コントロールの選択と実行中のレール設定変更。
- [独自の SwiftUI・Compose 内容](native-ui-extensions.md): アプリ内拡張を作成。
- [移行](migration.md): 旧パッケージ名、インポート、ネイティブプロジェクトを更新。

## テーマなしのナビゲーション

Native UI はテーマや Ionic アニメーションビルダーに依存しません。ルーターでページ変更前に投影を中断し、完了・キャンセル後に再開できます。

```ts
const suspension = await shell.suspend();
try {
  await navigate();
} finally {
  await suspension.resume();
}
```

Promise は URL 変更だけでなく、DOM とページアニメーションが落ち着いてから完了する必要があります。ブラウザーの戻る、ジェスチャーキャンセル、プログラムによる遷移も同じライフサイクルへ接続します。Ionic は前述のアダプターでアニメーションと対話的な遷移に対応します。

ルーターなしの HTML アプリでは、次が完全なアニメーション付きページ切り替えです。キャンセルされたアニメーションは投影再開前に旧ページを復元します。

```ts
async function showPage(current: HTMLElement, next: HTMLElement) {
  const lease = await shell.suspend();
  try {
    current.hidden = true;
    next.hidden = false;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const animation = next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
      try {
        await animation.finished;
      } catch {
        next.hidden = true;
        current.hidden = false;
      }
    }
  } finally {
    await lease.resume();
  }
}
```

Promise 確定前に次の遷移を許すアプリではページ切り替えを直列化します。ルーター・履歴の処理はソースのクリックハンドラーに維持してください。プラグインは代わりに遷移しません。

---
title: 'initialize'
code: []
scrollActiveLine: []
---

同意を取得して `canRequestAds` を確認したあと、広告をリクエストする前にプラグインの `initialize` を一度呼び出します。ネイティブ SDK を自分で起動する必要はありません。

ネイティブのアプリ ID は AndroidManifest / Info.plist に置きます。[インストール](/docs/readme#インストール) を見てください。

```ts
import { AdMob } from '@capacitor-community/admob';

try {
  await AdMob.initialize();
} catch (error) {
  console.error('AdMob initialization failed', error);
  // 広告リクエストは見送ります。アプリのネイティブビューが利用可能になってから再試行してください。
}
```

Android では、フルスクリーン広告しか使わないアプリでも、初期化時にネイティブバナーの親ビューを待ちます。Activity／コンテンツビューが利用できない場合、または親ビューが5秒以内に現れない場合は拒否されます。広告の初期化失敗でアプリ全体の起動が止まらないよう、この拒否を処理してください。ネイティブビューが利用可能になれば再試行できます。

`initialize()` が正常に完了しても、広告のロードが完了したとは限りません。各形式のロードメソッドとイベントで準備状態を確認してください。

!::initialize::

!::AdMobInitializationOptions::

開発中は Google の [デモ広告ユニット](https://developers.google.com/admob/android/test-ads#demo_ad_units) を優先してください。実機で本番に近い広告を試す場合は、[テスト](/docs/testing) の手順でデバイスを登録します。本番に `initializeForTesting: true` を入れないでください。

`isTesting`、`npa`（非パーソナライズ広告）、`immersiveMode`（フルスクリーン広告中に Android のシステムバーを隠す）などの広告単位のオプションは `initialize` ではなく各リクエストに付けます。各形式のガイドを見てください。

初期化と広告のロードより前に、プライバシーに関する同意を取得します。[同意管理](/docs/consent) を参照してください。

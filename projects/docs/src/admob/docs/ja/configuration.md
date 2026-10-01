---
title: 'initialize'
code: []
scrollActiveLine: []
---

広告をリクエストする前に、プラグインの `initialize` を一度呼び出します。ネイティブ SDK を自分で起動する必要はありません。

ネイティブのアプリ ID は AndroidManifest / Info.plist に置きます。[インストール](/docs/readme#インストール) を見てください。

```ts
import { AdMob } from '@capacitor-community/admob';

await AdMob.initialize();
```

!::initialize::

!::AdMobInitializationOptions::

開発中は Google の [デモ広告ユニット](https://developers.google.com/admob/android/test-ads#demo_ad_units) を優先してください。実機で本番に近い広告を試す場合は、[テスト](/docs/testing) の手順でデバイスを登録します。本番に `initializeForTesting: true` を入れないでください。

`isTesting`、`npa`（非パーソナライズ広告）、`immersiveMode`（フルスクリーン広告中に Android のシステムバーを隠す）などの広告単位のオプションは `initialize` ではなく各リクエストに付けます。各形式のガイドを見てください。

初期化のあと、広告をロードする前にプライバシー同意を取ります。[同意管理](/docs/consent) を見てください。

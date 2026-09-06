---
title: '設定'
code: []
scrollActiveLine: []
---

Stripe Terminal をインストールし、Capacitor のネイティブプロジェクトを同期します。

```bash
npm install @capacitor-community/stripe-terminal
npx cap sync
```

対象プラグインは `@capacitor-community/stripe-terminal` **v8.2.1** です。公式デモ:

- [Tap to Pay / Internet / Bluetooth](https://github.com/capacitor-community/stripe/tree/main/demo/angular)
- [Apps on Devices](https://github.com/capacitor-community/stripe/tree/main/demo/app-on-devices)

| 要件                    | 最小バージョン |
| ----------------------- | -------------- |
| Capacitor               | 8              |
| iOS                     | 15.0           |
| Android `minSdkVersion` | 26             |

## プラットフォームと接続方式を選ぶ

`discoverReaders` は `TerminalConnectTypes` の値を受け取ります。プラットフォームが対応する接続方式を選び、その必須設定だけを下で行います。

| `TerminalConnectTypes` | Web                    | iOS                      | Android                 |
| ---------------------- | ---------------------- | ------------------------ | ----------------------- |
| `Internet`             | 対応（唯一の対応方式） | 対応                     | 対応                    |
| `Bluetooth`            | 非対応                 | 対応                     | 対応                    |
| `TapToPay`             | 非対応                 | 対応                     | 対応                    |
| `Usb`                  | 非対応                 | 未実装                   | 対応                    |
| `HandOff`              | 非対応                 | 未実装                   | 対応（Apps on Devices） |
| `Simulated`            | 非対応                 | discover方式として未実装 | Bluetooth探索として扱う |

対応する接続方式でシミュレーションリーダーを使う場合は、すべてのプラットフォームで `initialize` に `isTest: true` を渡します。iOS や Web で `TerminalConnectTypes.Simulated` に依存せず、`Internet`、`Bluetooth`、`TapToPay` と `isTest: true` を組み合わせてください。

Web の `discoverReaders` は `Internet` 以外を指定すると unavailable エラーで拒否されます。

## Web の設定

追加設定は不要です。利用できるのは Internet リーダーだけです。

## iOS の設定

プラグインの追加設定は不要です。iOS では USB、HandOff、`setTapToPayUxConfiguration` は未実装です。

## Android の設定

`android/app/src/main/AndroidManifest.xml` に権限を追加します。

```diff
+ <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
+ <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
+ <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
+ <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
+ <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
+ <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

実行時に `ACCESS_FINE_LOCATION` が許可されていない場合、`discoverReaders` は拒否されます。

さらに `android/variables.gradle` の `minSdkVersion` を `26` に更新します。

```diff
  ext {
-    minSdkVersion = 24
+    minSdkVersion = 26
```

Stripe Reader S700 などの Stripe Android 端末向けアプリを開発し、`TerminalConnectTypes.HandOff` を使う場合は、[Stripe のクライアント側セットアップガイド](https://docs.stripe.com/terminal/features/apps-on-devices/build?terminal-sdk-platform=android&lang-android=java#setup-app)に従ってください。

## 次のステップ

上の必須プラットフォーム設定のあと、[支払いを受け付ける](/docs/collect-a-payment)へ進みます。

## プラットフォーム参照

### プラットフォーム限定 API

| API                          | Web               | iOS                                 | Android                                         |
| ---------------------------- | ----------------- | ----------------------------------- | ----------------------------------------------- |
| `setTapToPayUxConfiguration` | no-op（ログのみ） | 未実装                              | 対応。`initialize` 後、`connectReader` 前に呼ぶ |
| `isTapToPayAccountLinked`    | 利用不可（例外）  | iOS 16.4以降、`initialize` 後に対応 | 未実装                                          |

設定手順と制限は [Tap to Pay](/docs/tap-to-pay)を参照してください。

### Web の no-op と未対応ライフサイクルメソッド

次のメソッドはプラグインインターフェースに存在しますが、Web の Stripe Terminal JS SDK は操作しません。

- `cancelDiscoverReaders` — no-op
- `setSimulatorConfiguration` — no-op
- `installAvailableUpdate` — no-op
- `cancelInstallUpdate` — no-op
- `rebootReader` — no-op
- `cancelReaderReconnection` — no-op
- `setTapToPayUxConfiguration` — no-op

Web の `isTapToPayAccountLinked` は `unavailable` をスローします。

Web の Internet リーダーでは、`initialize`、`discoverReaders`、`connectReader`、`getConnectedReader`、`disconnectReader`、`collectPaymentMethod`、`cancelCollectPaymentMethod`、`confirmPaymentIntent`、`setReaderDisplay`、`clearReaderDisplay`、`setConnectionToken` と、接続・支払い状態のリスナーを利用できます。

---
title: 'Tap to Pay'
code: ['tap-to-pay/tap-to-pay.ts.md']
scrollActiveLine:
  [
    { id: '', activeLine: { ['tap-to-pay.ts']: [1, 1] } },
    { id: 'プラットフォーム要件', activeLine: { ['tap-to-pay.ts']: [1, 1] } },
    { id: 'セットアップ手順', activeLine: { ['tap-to-pay.ts']: [8, 11] } },
    { id: 'アカウント連携を確認する', activeLine: { ['tap-to-pay.ts']: [11, 16] } },
    { id: 'ux設定', activeLine: { ['tap-to-pay.ts']: [16, 23] } },
    { id: '探索して接続する', activeLine: { ['tap-to-pay.ts']: [23, 36] } },
    { id: '制限事項', activeLine: { ['tap-to-pay.ts']: [1, 1] } },
  ]
---

Tap to Pay は、対応するスマートフォンやタブレットだけで非接触決済を受け付けます。別のカードリーダーは不要です。[設定](/docs/configuration)と[接続トークン](/docs/collect-a-payment)を準備し、`TerminalConnectTypes.TapToPay` を使用します。

## プラットフォーム要件

| プラットフォーム | 対応   | 補足                                                            |
| ---------------- | ------ | --------------------------------------------------------------- |
| Android          | 対応   | NFC対応端末、位置情報権限、Stripeの利用資格。`minSdkVersion` 26 |
| iOS              | 対応   | Tap to Pay on iPhone。アカウント確認は iOS 16.4以降             |
| Web              | 非対応 | TapToPay の探索は利用不可                                       |

Stripe Dashboard で Terminal を設定し、[Location](https://docs.stripe.com/terminal/fleet/locations) を作成します。その `locationId` を `discoverReaders` に渡してください。

Android の `initialize` は[設定](/docs/configuration)に記載された位置情報権限を要求します。Bluetooth 権限を要求するのは `Bluetooth` または `Simulated` リーダーを探索するときだけです。Tap to Pay の探索自体では Bluetooth 権限を要求しません。

## セットアップ手順

1. アプリケーションレベルのリスナーを登録する。
2. `RequestedConnectionToken` と `setConnectionToken` で認証付きトークンプロバイダーを登録し、`initialize` を呼ぶ。
3. iOS では `isTapToPayAccountLinked` を呼ぶ（結果はキャッシュしない）。
4. Android では任意で `setTapToPayUxConfiguration` を呼ぶ。
5. `TapToPay` と `locationId` で `discoverReaders` を実行する。
6. 見つかったリーダーを `connectReader` へ渡す。
7. [支払いを受け付ける](/docs/collect-a-payment)と同様に `card_present` PaymentIntent を収集・確定する。

!::initialize::

## アカウント連携を確認する

`isTapToPayAccountLinked` は iOS 16.4以降専用です。事前に `initialize()` が完了している必要がありますが、リーダー接続やNFCの起動は不要です。結果は呼び出すたび Apple から取得されるため、`isLinked` をキャッシュしないでください。Stripe Connect では `onBehalfOf` に連結アカウントIDを渡します。省略すると、その API キーを所有するアカウントを確認します。

Android と Web では拒否されるため、プラットフォーム判定または `.catch()` で保護します。

!::isTapToPayAccountLinked::
!::IsTapToPayAccountLinkedOptions::

## UX設定

`setTapToPayUxConfiguration` は Android 専用です。`initialize()` 後、`connectReader()` 前に呼びます。iOS は未実装、Web はログを出して終了します。

Android では `colors`（`primary`、`success`、`error`。値は `'default'` または `'#FF5733'` のような16進カラー文字列）と `darkMode`（`SYSTEM`、`DARK`、`LIGHT`）を反映します。TypeScript の `tapZone` は宣言されていますが、v8.2.1 の Android Terminal SDK には渡されません。

!::setTapToPayUxConfiguration::
!::TapToPayUxConfiguration::
!::TapToPayColorScheme::
!::TapToPayColor::
!::TapToPayTapZone::
!::TapToPayDarkMode::

## 探索して接続する

`TerminalConnectTypes.TapToPay` と `locationId` で探索します。シミュレーションでは `TerminalConnectTypes.Simulated` ではなく、`initialize` の `isTest: true` を使用します。

探索結果のリーダーを接続します。`autoReconnectOnUnexpectedDisconnect` は既定で `false` です。iOS の `merchantDisplayName` と `onBehalfOf` は接続設定へ渡され、Android では PaymentIntent 側に設定します。

!::discoverReaders::
!::connectReader::

接続後、サーバーで作成した `card_present` PaymentIntent を `collectPaymentMethod` と `confirmPaymentIntent` で処理します。

## 制限事項

- Web は Tap to Pay を探索・接続できません。
- UXの色とダークモードは Android 専用です。
- アカウント連携状態は iOS 専用で、毎回 Apple から再取得します。
- `tapZone` は現在の Android SDK に接続されていません。
- 任意のリーダー更新を決済中にインストールしないでください。
- シークレットキーと接続トークン作成はバックエンドに保持してください。

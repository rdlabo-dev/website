---
title: '支払いを受け付ける'
code: ['collect-a-payment/collect-payment.ts.md', 'collect-a-payment/connection-token.ts.md']
scrollActiveLine:
  [
    { id: '', activeLine: { ['collect-payment.ts']: [1, 1] } },
    {
      id: 'アプリケーションレベルのリスナーを登録する',
      activeLine: { ['collect-payment.ts']: [6, 19] },
    },
    { id: '初期化', activeLine: { ['connection-token.ts']: [0, 34] } },
    { id: '接続トークンを安全に渡す', activeLine: { ['connection-token.ts']: [0, 34] } },
    {
      id: 'バックエンドでpaymentintentを作成する',
      activeLine: { ['collect-payment.ts']: [34, 42] },
    },
    { id: 'リーダーを探索する', activeLine: { ['collect-payment.ts']: [22, 30] } },
    { id: 'リーダーへ接続する', activeLine: { ['collect-payment.ts']: [27, 34] } },
    { id: '支払い方法を収集する', activeLine: { ['collect-payment.ts']: [42, 44] } },
    { id: 'paymentintentを確定する', activeLine: { ['collect-payment.ts']: [43, 45] } },
    { id: 'キャンセルとエラーを処理する', activeLine: { ['collect-payment.ts']: [14, 19] } },
    { id: 'リーダーを切断する', activeLine: { ['collect-payment.ts']: [44, 48] } },
  ]
---

リスナーの早期登録、プラグイン初期化、リーダー接続、PaymentIntent の確定という順で Stripe Terminal の対面決済を処理します。

## 初回テストに必要なもの

最初の収集の前に次を用意します。

- [設定](/docs/configuration) のプラットフォーム設定（必要な場合は Android 権限を含む）
- アプリから呼べる認証付き接続トークンエンドポイント
- サーバーで作成した `card_present` 付きのテスト PaymentIntent
- 探索する接続方式に対応する Stripe Terminal の `locationId`

最初の到達状態は、リーダー接続 → 支払い方法の収集 → PaymentIntent 確定と `ConfirmedPaymentIntent` の確認です。履行は Stripe Webhook を待ってから行います。シミュレーションリーダーは [設定](/docs/configuration) のとおり、**対応する**接続方式と `isTest: true` を組み合わせてください。`TerminalConnectTypes.Simulated` を全プラットフォーム共通とは見なさないでください。

## アプリケーションレベルのリスナーを登録する

Terminal のイベントリスナーは JavaScript アプリケーションの起動ごとに一度だけ、初期化や操作開始より前に登録し、所有者が存続する間は保持します。

!::TerminalEventsEnum::

型付き `addListener` は大半のメンバーを扱います。ネイティブ探索の `DiscoveringReaders` と `CancelDiscoveredReaders` には専用オーバーロードがありません。

## 初期化

`RequestedConnectionToken` と `setConnectionToken` を使ったアプリ側の認証付きリクエストを推奨します。通常の認証情報を付与し、失敗を検証できます。SDK は必要になるたび新しい一回限りの接続トークンを要求するため、リスナーを `initialize` より前に登録します。開発中は `isTest` を設定します。

!::initialize::

Web の `initialize` は新しいプラグインインスタンスを必要とし、成功後の再呼び出しは例外になります。

## 接続トークンを安全に渡す

`tokenProviderEndpoint` を省略し、`initialize` より前に `RequestedConnectionToken` を登録します。通常の認証方式で取得し、成功レスポンスと `secret` を検証して `setConnectionToken({ token })` へ渡します。取得要求中だけ呼び出し、レスポンスやトークンをログへ出さないでください。

!::setConnectionToken::

### `tokenProviderEndpoint` 互換モード

単純な構成では利用できますが、v8.2.1 のネイティブクライアントは認証ヘッダーも本文も付けられない空の HTTP **POST** を送信します。別の方法で認証・保護できる場合だけ使用し、無制限に公開されたトークン作成エンドポイントを用意しないでください。

レスポンスは `secret` 文字列を持つ JSON でなければなりません。

```json
{ "secret": "pst_..." }
```

接続トークンはサーバーで Stripe の**シークレット** API キーを使って作成します。シークレットキー、トークン作成可能な制限付きキー、生の接続トークンをアプリ、ログ、公開設定へ含めてはいけません。

:::message
v8.2.1 では Android が `tokenProviderEndpoint` の `secret` を、Web が `setConnectionToken` のオプションをログへ出力します。修正版へ更新できるまで Android の endpoint モードと本番 Web のコンソール保持を避けてください。
:::

## バックエンドでPaymentIntentを作成する

サーバーで PaymentIntent を作成し、**クライアントシークレット**だけをアプリへ返します。

- `payment_method_types` に `card_present` を含める
- Stripe のシークレットキーをサーバーに保持する
- クライアントシークレットだけを `collectPaymentMethod` へ渡す
- 公開可能キーで card-present PaymentIntent を作成・確定しない

```ts
await stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
  payment_method_types: ['card_present'],
  capture_method: 'automatic',
});
```

## リーダーを探索する

`TerminalConnectTypes` と、接続方式が必要とする Stripe Terminal の `locationId` を指定して、近くのリーダーまたはシミュレーションリーダーを探索します。

- Web は `Internet` だけに対応します。
- iOS Bluetooth はスキャン更新ごとに `DiscoveredReaders` を複数回通知します。`bluetoothScanWaitTime` で Promise が現在の一覧を返すまでの待ち時間を指定できます。
- Android は実行時の `ACCESS_FINE_LOCATION` 権限が必要です。
- 利用者が探索画面を離れたら `cancelDiscoverReaders` を呼び、長い探索を止められるUIを用意します。

Promise に加えて `DiscoveredReaders` も監視してください。

!::discoverReaders::
!::DiscoverReadersOptions::
!::TerminalConnectTypes::

## リーダーへ接続する

支払い情報の収集前に、現在の探索結果から得た `reader` を接続します。`autoReconnectOnUnexpectedDisconnect` の既定値は `false` です。iOS Tap to Pay の `merchantDisplayName` と `onBehalfOf` は接続設定へ適用され、Android では PaymentIntent 側に設定します。

!::connectReader::

## 支払い方法を収集する

バックエンドから受け取った PaymentIntent の**クライアントシークレット**を `collectPaymentMethod` へ渡します。

!::collectPaymentMethod::

## PaymentIntentを確定する

収集済み PaymentIntent を処理・確定します。収集成功前に呼ぶと拒否されます。

!::confirmPaymentIntent::

`ConfirmedPaymentIntent` はクライアント UI 用の信号です。注文はバックエンドが `payment_intent.succeeded` などの Stripe Webhook を検証した後だけ確定してください。

## キャンセルとエラーを処理する

- `cancelCollectPaymentMethod` は進行中の収集をキャンセルし、成功時に `Canceled` を通知します。
- 収集または確定の失敗時には `Failed` が通知され、Promise も拒否されます。
- 予期しない切断には `ConnectionStatusChange` ではなく `UnexpectedReaderDisconnect` を使用します。

!::cancelCollectPaymentMethod::

## リーダーを切断する

支払いフロー完了後、またはリーダーが不要になったときに切断します。

!::disconnectReader::

## 最初の成功のあと

切断・再接続・更新は [リーダーのライフサイクル](/docs/reader-lifecycle) を参照してください。端末だけで受け付ける場合は [Tap to Pay](/docs/tap-to-pay) です。正式なシグネチャは [API](/docs/api) にあります。

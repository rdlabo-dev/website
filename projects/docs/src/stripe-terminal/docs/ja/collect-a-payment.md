---
title: '支払いを受け付ける'
headingAliases: { '%E5%88%9D%E6%9C%9F%E5%8C%96': initialize }
code: ['collect-a-payment/collect-payment.ts.md', 'collect-a-payment/connection-token.ts.md']
scrollActiveLine:
  [
    { id: '', activeLine: { ['collect-payment.ts']: [1, 1] } },
    {
      id: 'アプリケーションレベルのリスナーを登録する',
      activeLine: { ['collect-payment.ts']: [6, 19] },
    },
    { id: 'initialize', activeLine: { ['connection-token.ts']: [0, 34] } },
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

## アプリケーションレベルのリスナーを登録する

Terminal のイベントリスナーは JavaScript アプリケーションの起動ごとに一度だけ、初期化や操作開始より前に登録し、所有者が存続する間は保持します。`main.ts`、アプリケーション初期化処理、起動時に初期化するシングルトンサービスなどで、できるだけ早く登録してください。

!::TerminalEventsEnum::

型付き `addListener` は大半のメンバーを扱います。ネイティブ探索の `DiscoveringReaders` と `CancelDiscoveredReaders` には専用オーバーロードがありません。[API](/docs/api) を参照してください。

## initialize

`RequestedConnectionToken` と `setConnectionToken` を使ったアプリ側の認証付きリクエストを推奨します。通常の認証情報を付与し、失敗を検証できます。SDK は必要になるたび新しい一回限りの接続トークンを要求するため、リスナーを `initialize` より前に登録します。開発中は `isTest` を設定します。

!::initialize::

### `tokenProviderEndpoint` 互換モード

単純な構成では利用できますが、v8.3.0 のネイティブクライアントは認証ヘッダーも本文も付けられない空の HTTP **POST** を送信します。別の方法で認証・保護できる場合だけ使用し、無制限に公開されたトークン作成エンドポイントを用意しないでください。

レスポンスは `secret` 文字列を持つ JSON でなければなりません。

```json
{ "secret": "pst_..." }
```

この値は Stripe Terminal の[接続トークン](https://docs.stripe.com/terminal/fleet/connect-reader?terminal-sdk-platform=js#connection-token)です。接続トークンはサーバーで `stripe.terminal.connectionTokens.create()` と Stripe の**シークレット** API キーを使って作成します。シークレットキー、トークン作成可能な制限付きキー、生の接続トークンをアプリ、ログ、公開設定へ含めてはいけません。

公式デモは `POST /connection/token` で `{ secret }` を返します。認証と認可はアプリケーションに合わせて調整してください。

:::message
v8.3.0 では Android が `tokenProviderEndpoint` の `secret` を、Web が `setConnectionToken` のオプションをログへ出力します。修正版へ更新できるまで Android の endpoint モードと本番 Web のコンソール保持を避けてください。
:::


Web の `initialize` は新しいプラグインインスタンスを必要とし、成功後の再呼び出しは `Stripe Terminal has already been initialized` という例外になります。

## 接続トークンを安全に渡す

`tokenProviderEndpoint` を省略し、`initialize` より前に `RequestedConnectionToken` を登録します。通常の認証方式で取得し、成功レスポンスと `secret` を検証して `setConnectionToken({ token })` へ渡します。SDK がトークンを要求するとイベントが通知され、プラグインは `setConnectionToken({ token })` を待ちます。取得要求中だけ呼び出してください。Android と iOS は余分な呼び出しを `Stripe Terminal do not pending fetchConnectionToken` で拒否します。レスポンスやトークンをログへ出さないでください。

!::setConnectionToken::

## バックエンドでPaymentIntentを作成する

サーバーで PaymentIntent を作成します。公式デモは `POST /connection/intent` を使い、`{ paymentIntent }` を**クライアントシークレット**として返します。

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

`locationId` は Internet リーダーの探索で使用され、Tap to Pay、Bluetooth、Android USB リーダーの接続では必須です。Internet の探索では場所で絞り込めます。Tap to Pay と Bluetooth では接続設定にこの場所が渡されます。

- Web は `Internet` だけに対応します。
- iOS Bluetooth はスキャン更新ごとに `DiscoveredReaders` を複数回通知します。`bluetoothScanWaitTime` をミリ秒で指定すると、`discoverReaders` はその時間待ってから、その時点の一覧を返します。`0` または省略時は最初のスキャン結果を返します。[StripeのiOS Bluetooth接続ガイド](https://docs.stripe.com/terminal/payments/connect-reader?terminal-sdk-platform=ios&reader-type=bluetooth)も参照してください。
- iOS は探索開始時に `DiscoveringReaders` も通知します。USB、HandOff、`type` としての `Simulated` は未実装です。
- Android は実行時の `ACCESS_FINE_LOCATION` 権限が必要です。未許可の場合、`discoverReaders` は拒否されます。`Simulated` は Bluetooth 探索として扱われ、`HandOff` は Apps on Devices です。
- 利用者が探索画面を離れたら `cancelDiscoverReaders` を呼び、長い探索を止められるUIを用意します。Web のキャンセルは何も行いません。

Promise を await するだけでなく、`DiscoveredReaders` も監視してください。iOS Bluetooth ではリスナーが最新の一覧を通知し、Promise は最後のイベントより先に解決する場合があります。

!::discoverReaders::
!::DiscoverReadersOptions::
!::TerminalConnectTypes::

## リーダーへ接続する

支払い情報の収集前に、現在の探索結果から得た `reader` を接続します。プラグインは `serialNumber` を主要な識別子として使用します。`autoReconnectOnUnexpectedDisconnect` の既定値は `false` で、Tap to Pay と Bluetooth に適用されます。現在の Android USB 実装はネイティブの接続設定で自動再接続を有効にしています。Internet 接続にはこのフラグを指定しません。iOS Tap to Pay の `merchantDisplayName` と `onBehalfOf` は接続設定へ適用され、Android では PaymentIntent 側に設定します。

!::connectReader::

## 支払い方法を収集する

バックエンドから受け取った PaymentIntent の**クライアントシークレット**を `collectPaymentMethod` へ渡します。プラグインはその PaymentIntent を取得し、接続済みリーダーで支払い方法を収集します。

!::collectPaymentMethod::

## PaymentIntentを確定する

収集済み PaymentIntent を処理・確定します。収集成功前に `confirmPaymentIntent` を呼ぶと、`PaymentIntent not found for confirmPaymentIntent` で拒否されます。

!::confirmPaymentIntent::

`ConfirmedPaymentIntent` はクライアント UI 用の信号です。商品の発送やサービスの提供は、バックエンドが `payment_intent.succeeded` などの Stripe Webhook を検証した後だけ行ってください。

## キャンセルとエラーを処理する

- `cancelCollectPaymentMethod` は進行中の収集をキャンセルし、成功時に Promise が解決し、`Canceled` を通知します。
- `collectPaymentMethod` または `confirmPaymentIntent` が失敗すると `Failed` が通知され、同じ呼び出しの Promise も拒否されます。ペイロードには `message`、`code`、`declineCode` が含まれる場合があります。
- 予期しない切断の検出に `ConnectionStatusChange` を使わず、`UnexpectedReaderDisconnect` を使用してください。Bluetooth と USB では `DisconnectedReader` も確認します。[リーダーのライフサイクル](/docs/reader-lifecycle)を参照してください。

!::cancelCollectPaymentMethod::

## リーダーを切断する

支払いフロー完了後、またはリーダーが不要になったときに切断します。

!::disconnectReader::

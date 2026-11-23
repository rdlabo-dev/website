---
title: はじめに
---

# @capacitor-community/stripe-billing

**iOS 15 以降 / Capacitor 8** 向けに、Stripe BillingSDK を任意で追加できる実験的なプラグインです。サブスクリプションの購入ボタン、Customer Sessions、有効な利用権限（entitlements）、Customer Portal に対応します。Payment、Identity、Terminal の各パッケージに BillingSDK が追加されることはありません。

## インストール

```sh
npm install @capacitor-community/stripe-billing
npx cap sync ios
```

**Swift Package Manager** を使用してください。上流の SDK は CocoaPods 用の仕様ファイルを配布しておらず、このパッケージも CocoaPods、Android、Web には対応していません。呼び出す前に `Capacitor.getPlatform() === 'ios'` でプラットフォームを確認してください。未対応のプラットフォームで呼び出すと、未実装として Promise が拒否されます。

上流の [BillingSDK](https://github.com/stripe-samples/billing-ios-sdk) は実験段階にあり、利用には Stripe のプライベートプレビュー API へのアクセス権が必要です。上流にリリースタグがないため、SDK のリビジョンを `02416cf6bb57fa9ede1786ea8ac127ea05fa9b87` に固定しています。プレビューの進行に伴い API が変わる可能性があります。[統合手順とバックエンドの実装例](/docs/integration)を参照してください。

バックエンドでは利用者を認証し、対応する Customer の特定、Customer Session の発行、商品カタログの設定、機能へのアクセス制御を行います。アプリではリスナーとネイティブ UI の操作、利用権限の表示を管理し、アカウント切り替え時に `reset` を呼びます。購入画面が表示された段階では、決済はまだ確定していません。

ワンタップで動作を試すには [Angular Billing デモ](https://github.com/capacitor-community/stripe/blob/v8.4.0/demo/angular/README.md#billing-demo-on-ios)を使えます。デモで使う匿名のテスト認証情報は、本番アプリの利用者認証とは別のものです。

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`setCustomerSession(...)`](#setcustomersession)
* [`getBuyButton(...)`](#getbuybutton)
* [`presentBuyButton(...)`](#presentbuybutton)
* [`getActiveEntitlements(...)`](#getactiveentitlements)
* [`hasEntitlement(...)`](#hasentitlement)
* [`presentCustomerPortal(...)`](#presentcustomerportal)
* [`reset()`](#reset)
* [`addListener('customerSessionRequested', ...)`](#addlistenercustomersessionrequested-)
* [`addListener('entitlementsChanged', ...)`](#addlistenerentitlementschanged-)
* [`addListener('billingError', ...)`](#addlistenerbillingerror-)
* [`removeAllListeners()`](#removealllisteners)
* [インターフェース](#interfaces)

</docgen-index>

<docgen-api>
<!-- 以下の API 文書を更新するには、ソースの JSDoc コメントを編集して docgen を再実行してください。 -->

実験的な API です。Swift Package Manager を使用する iOS 15 以降のアプリに対応します。Android と Web では使用できません。

### initialize(...)

```typescript
initialize(options: InitializeOptions) => Promise<void>
```

初期化前に customerSessionRequested のリスナーを登録してください。利用者を切り替える前に reset を呼びます。

| 引数         | 型                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#initializeoptions">InitializeOptions</a></code> |

--------------------


### setCustomerSession(...)

```typescript
setCustomerSession(options: CustomerSessionResponse) => Promise<void>
```

各セッション要求には30秒以内に一度だけ応答してください。有効期限を過ぎた要求や応答済みの要求への応答は拒否されます。

| 引数         | 型                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **`options`** | <code><a href="#customersessionresponse">CustomerSessionResponse</a></code> |

--------------------


### getBuyButton(...)

```typescript
getBuyButton(options: { id: string; }) => Promise<BuyButton>
```

| 引数         | 型                         |
| ------------- | ---------------------------- |
| **`options`** | <code>{ id: string; }</code> |

**戻り値** <code>Promise&lt;<a href="#buybutton">BuyButton</a>&gt;</code>

--------------------


### presentBuyButton(...)

```typescript
presentBuyButton(options: { id: string; }) => Promise<void>
```

SDK のネイティブ購入ボタンを表示します。Promise はボタンを表示した時点で解決します。決済の完了は別途確認してください。

| 引数         | 型                         |
| ------------- | ---------------------------- |
| **`options`** | <code>{ id: string; }</code> |

--------------------


### getActiveEntitlements(...)

```typescript
getActiveEntitlements(options?: { forceRefresh?: boolean | undefined; } | undefined) => Promise<{ entitlements: Entitlement[]; }>
```

| 引数         | 型                                     |
| ------------- | ---------------------------------------- |
| **`options`** | <code>{ forceRefresh?: boolean; }</code> |

**戻り値** <code>Promise&lt;{ entitlements: Entitlement[]; }&gt;</code>

--------------------


### hasEntitlement(...)

```typescript
hasEntitlement(options: { lookupKey: string; forceRefresh?: boolean; }) => Promise<{ active: boolean; }>
```

| 引数         | 型                                                        |
| ------------- | ----------------------------------------------------------- |
| **`options`** | <code>{ lookupKey: string; forceRefresh?: boolean; }</code> |

**戻り値** <code>Promise&lt;{ active: boolean; }&gt;</code>

--------------------


### presentCustomerPortal(...)

```typescript
presentCustomerPortal(options?: { external?: boolean | undefined; } | undefined) => Promise<void>
```

既定ではアプリ内でポータルを開きます。Promise はポータルの表示またはブラウザーの起動時に解決します。サブスクリプションの変更完了を示すものではありません。

| 引数         | 型                                 |
| ------------- | ------------------------------------ |
| **`options`** | <code>{ external?: boolean; }</code> |

--------------------


### reset()

```typescript
reset() => Promise<void>
```

保留中の処理を取り消し、プラグインの UI を閉じて、セッションとキャッシュを消去します。再度使う前に initialize を呼んでください。

--------------------


### addListener('customerSessionRequested', ...)

```typescript
addListener(eventName: 'customerSessionRequested', listenerFunc: (event: { requestId: string; }) => void) => Promise<PluginListenerHandle>
```

要求のたびにバックエンドから新しい Customer Session を取得してください。シークレットをキャッシュしてはいけません。

| 引数              | 型                                                    |
| ------------------ | ------------------------------------------------------- |
| **`eventName`**    | <code>'customerSessionRequested'</code>                 |
| **`listenerFunc`** | <code>(event: { requestId: string; }) =&gt; void</code> |

**戻り値** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener('entitlementsChanged', ...)

```typescript
addListener(eventName: 'entitlementsChanged', listenerFunc: (event: { entitlements: Entitlement[]; }) => void) => Promise<PluginListenerHandle>
```

SDK が利用権限を更新したときの通知です。サーバーからのプッシュ通知を購読する機能はありません。

| 引数              | 型                                                              |
| ------------------ | ----------------------------------------------------------------- |
| **`eventName`**    | <code>'entitlementsChanged'</code>                                |
| **`listenerFunc`** | <code>(event: { entitlements: Entitlement[]; }) =&gt; void</code> |

**戻り値** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener('billingError', ...)

```typescript
addListener(eventName: 'billingError', listenerFunc: (event: { message: string; }) => void) => Promise<PluginListenerHandle>
```

表示されたネイティブ購入ボタンをタップしたときに発生したエラーを通知します。

| 引数              | 型                                                  |
| ------------------ | ----------------------------------------------------- |
| **`eventName`**    | <code>'billingError'</code>                           |
| **`listenerFunc`** | <code>(event: { message: string; }) =&gt; void</code> |

**戻り値** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### removeAllListeners()

```typescript
removeAllListeners() => Promise<void>
```

--------------------


### インターフェース


#### InitializeOptions

| プロパティ                                   | 型                | 説明                                                          |
| -------------------------------------- | ------------------- | -------------------------------------------------------------------- |
| **`publishableKey`**                   | <code>string</code> |                                                                      |
| **`maximumStaleEntitlementsDuration`** | <code>number</code> | 利用権限を再取得するまでキャッシュを使える時間の上限（秒）。既定値は300秒です。 |


#### CustomerSessionResponse

| プロパティ            | 型                                                                | 説明                                                                           |
| --------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **`requestId`** | <code>string</code>                                                 |                                                                                       |
| **`session`**   | <code><a href="#customersession">CustomerSession</a> \| null</code> | 新しく発行したセッション。利用者がサインアウトしている場合に限り null を指定できます。                            |
| **`failed`**    | <code>boolean</code>                                                | バックエンドやネットワークでエラーが発生した場合は true を指定し、匿名購入へ自動的に切り替わることを防ぎます。 |


#### CustomerSession

| プロパティ               | 型                | 説明                                                           |
| ------------------ | ------------------- | --------------------------------------------------------------------- |
| **`customer`**     | <code>string</code> |                                                                       |
| **`clientSecret`** | <code>string</code> |                                                                       |
| **`expiresAt`**    | <code>number</code> | 認証済みのリクエストに対してバックエンドが返す Unix タイムスタンプ（秒）。 |


#### BuyButton

| プロパティ               | 型                 | 説明                                                     |
| ------------------ | -------------------- | --------------------------------------------------------------- |
| **`id`**           | <code>string</code>  |                                                                 |
| **`active`**       | <code>boolean</code> |                                                                 |
| **`callToAction`** | <code>string</code>  |                                                                 |
| **`amount`**       | <code>string</code>  | 通貨の最小単位で表した金額。Stripe から文字列として返されます。 |
| **`currency`**     | <code>string</code>  |                                                                 |


#### Entitlement

| プロパティ            | 型                |
| --------------- | ------------------- |
| **`id`**        | <code>string</code> |
| **`feature`**   | <code>string</code> |
| **`lookupKey`** | <code>string</code> |


#### PluginListenerHandle

| プロパティ         | 型                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |

</docgen-api>

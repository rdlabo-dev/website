---
title: 'はじめに'
code: []
scrollActiveLine: []
---

Capacitor Brother Print は、iOS と Android 向けのネイティブ Brother Print SDK をバインドし、対応する Brother ラベルプリンターの探索と画像印刷を Capacitor アプリから行います。

**このプラグインはまだ RC（リリース候補）段階です。** iOS は **Swift Package Manager** と最低 **iOS 15** が必要です。このプラグインでは Brother Print SDK を CocoaPods では使えません。

## インストール

```
npm install @rdlabo/capacitor-brotherprint
```

SDK の配置、SPM レイアウト、権限の詳細は [インストール](/docs/installation) です。

## ラベルを印刷してみる

1. [インストール](/docs/installation) — npm install、Brother SDK の配置、権限、`npx cap sync`
2. [Search](/docs/search) — `onPrinterAvailable` を登録し、見つかったチャネルを保持して Wi-Fi 等で探索
3. [Print](/docs/print) — そのチャネル、対応モデル / ラベル、用意した実画像の base64 で印刷
4. [Events](/docs/events) — 印刷成功・エラーの詳細

## 対応モデル

各製品リンクは Amazon アソシエイトです。これらのリンクから購入いただけると開発費の支援になります。

| Product                               | Model        | iOS/WiFi | iOS/BT | iOS/BLE | Android/USB | Android/WiFi | Android/BT | Android/BLE |
| ------------------------------------- | ------------ | -------- | ------ | ------- | ----------- | ------------ | ---------- | ----------- |
| QL-810W                               | QL_810W      | ✗        | ✗      | ✗       | ◯           | ✗            | ✗          | ✗           |
| [QL-820NWB](https://amzn.to/3BXQ1aj)  | QL_820NWB    | ◯        | ※1     | ✗       | △           | ◯            | △          | ✗           |
| [QL-820NWBc](https://amzn.to/4fjhUIe)  | QL_820NWB    | ◯        | ◯      | ✗       | ✗           | ◯            | ◯          | ✗           |
| [TD-2320D](https://amzn.to/48EFCN3)   | TD_2320D_203 | ✗        | ✗      | ✗       | △           | ✗            | ✗          | ✗           |
| [TD-2350D](https://amzn.to/48ma6TK)   | TD_2350D_300 | ◯        | △      | △       | ◯           | ◯            | ◯          | △           |

Amazon アソシエイト: **https://amzn.to/3AiiOFT**

**補足**

|     | description                |
| --- | -------------------------- |
| ◯   | Supported and tested       |
| △   | Implemented but not tested |
| -   | Plugin is not supported    |
| ✗   | Device is not supported    |
| BT  | Bluetooth                  |
| BLE | Bluetooth Low Energy       |

※1 Bluetooth の版が古く、iOS では接続できません。参照: https://okbizcs.okwave.jp/brother/qa/q9932082.html


## JavaScriptヘルパー

`BrotherPrinterSession`は、印刷画面の探索結果、印刷リスナー、終了処理を管理します。純粋関数でモデルや接続方法を選択でき、ステートレスな接続ヘルパーも利用できます。AngularやIonicには依存しません。[接続管理](/docs/connection-management)を参照してください。

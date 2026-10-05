---
title: 'API'
code: []
scrollActiveLine: []
---

`@capacitor/docgen` が `@capacitor-community/stripe-identity` v8.3.0 から解決した公開メソッド、結果型、エラー型、イベントの一覧です。

`addListener` は、対応する3つのイベント名 `Loaded`、`FailedToLoad`、`VerificationResult` に対して生成されます。`Completed`、`Canceled`、`Failed` は `IdentityVerificationResult.result`（`IdentityVerificationSheetResultInterface`）の値であり、個別の `addListener` オーバーロードではありません。

## メソッド

!::initialize::

!::create::

!::present::

!::addListener::

## インターフェース

!::InitializeIdentityVerificationSheetOption::

!::CreateIdentityVerificationSheetOption::

!::IdentityVerificationResult::

!::StripeIdentityError::

!::PluginListenerHandle::

## 型エイリアス

!::IdentityVerificationSheetResultInterface::

## 列挙型

!::IdentityVerificationSheetEventsEnum::

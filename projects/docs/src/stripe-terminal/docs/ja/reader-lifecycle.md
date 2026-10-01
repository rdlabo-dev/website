---
title: 'リーダーのライフサイクル'
code: ['reader-lifecycle/reader-lifecycle.ts.md']
scrollActiveLine:
  [
    { id: '', activeLine: { ['reader-lifecycle.ts']: [1, 1] } },
    { id: 'ソフトウェア更新を監視する', activeLine: { ['reader-lifecycle.ts']: [2, 35] } },
    { id: '状態と入力を監視する', activeLine: { ['reader-lifecycle.ts']: [35, 63] } },
    { id: 'リーダーの画面を設定する', activeLine: { ['reader-lifecycle.ts']: [63, 78] } },
    { id: '探索をキャンセルする', activeLine: { ['reader-lifecycle.ts']: [78, 80] } },
    { id: '切断と再接続', activeLine: { ['reader-lifecycle.ts']: [80, 112] } },
    { id: 'エラー処理', activeLine: { ['reader-lifecycle.ts']: [112, 119] } },
  ]
---

Terminal の操作が会計を妨げないよう、リーダーのソフトウェア更新、状態、画面表示を管理します。

## ソフトウェア更新を監視する

必要に応じてリーダーが更新を開始します。利用可能な更新、インストール、キャンセル、進捗をイベントで監視してください。

- 更新をシミュレーションする場合は、`discoverReaders` より前に `setSimulatorConfiguration` を呼び、`SimulateReaderUpdate.UpdateAvailable` または `Required` を設定します。Web では何も行いません。
- `StartInstallingUpdate`、`ReaderSoftwareUpdateProgress`、`FinishInstallingUpdate` は Bluetooth と USB リーダーに適用されます。初回接続時の**必須**更新は `ConnectedReader` より前に自動インストールされます。順序は `StartInstallingUpdate` → `ReaderSoftwareUpdateProgress`（複数回）→ `FinishInstallingUpdate` → `ConnectedReader` → `connectReader()` の解決です。接続が長引いても停止と誤認されないUIを表示してください。
- `ReportAvailableUpdate` は任意更新です。会計中に開始せず、加盟店が待てるときに `installAvailableUpdate` を呼びます。
- `progress` は `0` から `1` の値です。
- `cancelInstallUpdate` はSDKが許可する場合に進行中の更新を止めます。Web の更新メソッドは no-op です。
- iOS Tap to Pay も `StartInstallingUpdate`、`ReaderSoftwareUpdateProgress`、`FinishInstallingUpdate` を通知します。Android Tap to Pay の UX 設定は別の機能です。[Tap to Pay](/docs/tap-to-pay)を参照してください。

!::installAvailableUpdate::
!::cancelInstallUpdate::
!::setSimulatorConfiguration::

## 状態と入力を監視する

画面を持たないリーダーでは、`BatteryLevel`（バッテリー残量）、`ReaderEvent`（リーダーのイベント）、`RequestDisplayMessage`（表示するメッセージ）、`RequestReaderInput`（要求される入力）を購読し、モバイル端末に表示します。Bluetooth と USB で利用でき、バッテリーは接続時と約10分ごとに通知されます。

## リーダーの画面を設定する

画面を持つ端末では `collectPaymentMethod` より前にカート内容を表示し、完了後に消去します。Web の Internet リーダーも対応します。

!::setReaderDisplay::
!::clearReaderDisplay::
!::Cart::
!::CartLineItem::

## 探索をキャンセルする

利用者がスキャン画面を離れたとき、またはタイムアウト時に `cancelDiscoverReaders` を呼びます。ネイティブは成功時に `CancelDiscoveredReaders` を通知し、処理中でなくても Promise は解決します。

iOS の Bluetooth 探索は長時間続き、`DiscoveredReaders` を繰り返し通知する場合があります。キャンセルを `bluetoothScanWaitTime` または独自のタイムアウトと組み合わせてください。Web の `cancelDiscoverReaders` は何も行いません。

!::cancelDiscoverReaders::

## 切断と再接続

`disconnectReader` は現在のリーダーを切断し、未接続ならそのまま解決します。`DisconnectedReader` は、すべてのリーダー方式で `disconnectReader()` の呼び出しに応じて理由なしで通知されます。Bluetooth と USB では、切断完了時に `reason` を伴うイベントも通知されます。そのため、利用者の操作による切断では、受付通知の後に理由付き切断通知が届きます。

予期しない切断の検出に `ConnectionStatusChange` を使わず、`UnexpectedReaderDisconnect` を使用します。再探索には必ずタイムアウトまたはキャンセル手段を用意してください。

Tap to Pay と Bluetooth で自動再接続するには、`connectReader` に `autoReconnectOnUnexpectedDisconnect: true` を設定し、`ReaderReconnectStarted`（`reader` と `reason` を含む）、`ReaderReconnectSucceeded`、`ReaderReconnectFailed` を監視します。`cancelReaderReconnection` で進行中の再接続を止められます。Web の `rebootReader` と `cancelReaderReconnection` は何も行いません。

!::getConnectedReader::
!::rebootReader::
!::cancelReaderReconnection::

## エラー処理

収集または確定が失敗すると `Failed` が通知されます。対応する Promise も拒否され、ネイティブSDKがこれらのフィールドを提供する場合は、同じ `message`、`code`、`declineCode` が含まれます。`UnexpectedReaderDisconnect` は明示的な切断以外でリーダーを失ったことを示します。Bluetooth と USB では `DisconnectedReader` の `DisconnectReason`（`POWERED_OFF`、`BLUETOOTH_DISABLED`、`CRITICALLY_LOW_BATTERY` など）も確認してください。

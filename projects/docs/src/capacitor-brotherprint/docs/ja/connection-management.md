---
title: JavaScriptプリンターヘルパー
---

既存のプラグインAPIを包み、ネイティブの動作を変えずに利用できる関数です。AngularやIonicへの依存はありません。セッションは、アプリが提供するストレージのコールバックを通じて接続を保存できます。すべてのヘルパーは共通のキューを使い、探索と接続確認の重複実行を防ぎます。

## 使い方を選ぶ

先に[インストール](/docs/installation)でSDKと権限を設定してください。ヘルパーは同じパッケージからimportできます。

| やりたいこと | 使うもの |
| --- | --- |
| 印刷画面の探索結果・通知・終了処理をまとめて管理する | `BrotherPrinterSession` |
| 画面に紐付かず一度だけ探索する | `searchBrotherPrinters` |
| 以前の接続先を確認し、利用できなければ探し直す | `prepareBrotherPrinters` |
| 手入力した印刷先だけを確認する | `checkBrotherPrinterChannel` |

プラグインAPIを直接使う場合は[Search](/docs/search)、[Print](/docs/print)、[Events](/docs/events)を参照してください。

## セッションを使わずに探索する

- `searchBrotherPrinters(options, model?)` は探索イベントを配列へ収集します。探索前にリスナーを登録し、成功・失敗のいずれでも削除します。結果がなければ空配列を返し、ネイティブエラーは呼び出し元へ伝えます。
- `prepareBrotherPrinters(options, model, previous?)` はモデルとポートが一致する保存済みチャネルを先に確認します。利用可能なら`[previous]`を返し、そうでなければ再探索します。USBは常にネイティブの権限フローを通じて探索します。利用可否の確認自体が失敗した場合は、黙って探索に切り替えずエラーを伝えます。
- `checkBrotherPrinterChannel({ port, channelInfo })` は明示選択または手入力したアドレスを、探索メタデータなしで確認します。booleanを返し、探索や別のプリンターへの切り替えはしません。ネイティブエラーは伝播します。成功は接続可能であることを示し、モデルや装着用紙を確認するものではありません。

```ts
import {
  searchBrotherPrinters,
  BRLMPrinterPort, BRLMPrinterModelName,
} from '@rdlabo/capacitor-brotherprint';

const printers = await searchBrotherPrinters(
  { port: BRLMPrinterPort.wifi, searchDuration: 10 },
  BRLMPrinterModelName.QL_820NWB,
);
```


## 印刷画面で使う

1. 画面を開くときにセッションを作り、印刷通知を登録します。
2. `prepare`で接続候補を取得します。0件なら未検出を表示し、複数件なら利用者に選択してもらいます。
3. 選んだチャネルの`port`・`channelInfo`と、モデル・用紙・画像を`session.printImage`へ渡します。[Print](/docs/print)で印刷オプションを確認できます。
4. 画面を離れる処理で`dispose()`を呼びます。印刷処理を待ってから破棄する必要はありません。

以下はセッションの作成と終了の例です。実際の選択・印刷を含む例は[TypeScriptサンプル](https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.2.1/examples/plain-typescript.ts)を参照してください。


印刷画面ごとに1つの`BrotherPrinterSession`を使います。接続ヘルパーはCapacitorのプラットフォームを直接使い、セッションは探索結果、印刷通知、破棄を管理します。破棄済みのセッションは再利用しません。画面の寿命に紐付かない処理にはステートレスなヘルパーも利用できます。

```ts
import { BrotherPrinterSession, BRLMPrinterModelName, BRLMPrinterPort } from '@rdlabo/capacitor-brotherprint';

const session = new BrotherPrinterSession();
await session.listen({ onPrint: () => console.log('Printed') });
const printers = await session.prepare(
  { port: BRLMPrinterPort.wifi, searchDuration: 10 },
  BRLMPrinterModelName.QL_820NWB,
);
// Select a printer, then call session.printImage with the existing native options.
// In the screen's exit handler:
await session.dispose();
```

### 画面を閉じた後の処理

破棄するとすぐに`closed`がtrueになり、`printers`は空になります。待機中の探索はスキップし、遅れて届いた結果は無視します。印刷コールバックは即座に停止し、登録中のものも含めて、このセッションの印刷リスナーの削除を待ちます。実行中のネイティブ探索は完了してから次の接続処理が始まります。開始済みのネイティブ印刷は中断しません。

画像生成、ストレージ、ダイアログなどの非同期処理後は、UIを表示する前に`closed`を確認してください。閉じたセッションの`search`、`prepare`、`printImage`はネイティブ処理を開始しません。自動印刷リトライも追加しません。


## 接続を記憶する

localStorage、sessionStorage、Ionic Storageなどの文字列ストレージを使うには、3つのコールバックを提供します。プラグインはストレージの実装を検出せず、依存もしません。

```ts
const session = new BrotherPrinterSession({
  storage: {
    get: (key) => localStorage.getItem(key),
    set: (key, value) => localStorage.setItem(key, value),
    remove: (key) => localStorage.removeItem(key),
  },
  storagePrefix: 'labels:',
});
```

非同期ストレージでは、同じコールバックからPromiseを返します。

```ts
const session = new BrotherPrinterSession({
  storage: {
    get: (key) => storage.get(key),
    set: (key, value) => storage.set(key, value),
    remove: (key) => storage.remove(key),
  },
});
```

### 保存する内容と再利用

`get`は文字列またはnull/undefinedを返し、コールバックは同期・非同期のどちらでも完了できます。セッションは接続メタデータをJSONにして`${storagePrefix}last-printer`へ保存します。既定キーは`brotherprint:last-printer`です。画像やフォント・用紙設定は保存しません。画面をまたいで接続を再利用する場合は同じprefixを使います。

`printImage`は印刷前に選択したポート、アドレス、設定したモデルを記憶します。これは接続の試行先を記録するもので、印刷成功の証明ではありません。`prepare`は第3引数を省略すると保存先から読み込み、モデル・ポートの一致と利用可否を確認し、それ以外では探索します。USBは常に再探索します。チャネルの明示指定は保存内容より優先され、`null`なら保存済み接続をスキップします。読み書きの失敗や不正な保存JSONは無視しますが、ネイティブエラーは伝播します。ストレージ操作中に破棄された場合は、その後のネイティブ処理を行いません。

### 保存を解除する

`await session.clearSavedPrinter()`で記憶した接続を削除します。削除エラーはアプリが失敗を表示できるよう伝播します。ストレージのコールバックがなければ、セッションは画面内の状態だけを保持します。ステートレスなヘルパーには引き続きアプリ管理の以前のチャネルを渡せます。

## 手入力の印刷先を確認する

手入力の端末では、アドレスと一緒に選択したポートを保持します。記号からBluetoothと推測しないでください。iOSのBluetoothはシリアル番号、BLEはSDKのローカル名を使います。`checkBrotherPrinterChannel`を呼び、利用可能な場合だけ同じチャネルへ印刷します。USBの探索・権限取得には`prepareBrotherPrinters`を使います。モデルとラベル設定はアプリが別途指定します。


## 接続方法とモデルのユーティリティ

- `brotherPrinterPorts(model, isAndroid?)` は、既存のモデルenumに対応する接続方法を返します。上書き指定を省略すると`Capacitor.getPlatform()`を使います。USBはAndroidのみで、`wifi`には有線Ethernetも含みます。未知のモデルは空配列を返します。
- `resolveBrotherPrinterPort(model, saved?)` は対応する保存済み接続を維持します。それ以外ではAndroidのQL-800/QL-810WはUSBを優先し、その後は最初の対応接続を選びます。対応する接続がなければ`undefined`です。
- `brotherPrinterPortLabel(port)` はWi-Fi、Bluetooth、Bluetooth LE、USBの表示名を返します。未指定または未知のポートは空文字列です。
- `brotherPrinterModel(name)` は探索名を既存のモデルenumに対応付けます。QL-820NWBcなどの別名も扱い、未知の名前は`undefined`です。

## 探索の実行順とエラー

探索、接続準備、明示的な接続確認は同じキューを共有します。前のネイティブ処理とリスナーの片付けが完了してから次の呼び出しが始まり、前の処理が失敗しても継続します。JavaScriptの探索タイムアウトでキューを早期解放しません。直接の`BrotherPrint.search()`や接続確認をヘルパーと並行実行しないでください。直接呼び出しはキューを通らず、ネイティブイベントにはリクエストIDがありません。印刷もこのキューの対象外なので、接続準備をawaitしてから`printImage`を呼びます。

任意のモデル指定はUSB以外の結果を絞り込みます。USBではSDKが空のモデル名やアドレスを返しても結果を保持します。接続方法の選択肢がネイティブの対応範囲を拡張するわけではありません。既存のREADMEとSDKのインストール手順も確認してください。

ステートレスな関数を使う場合、読み込み表示、選択UI、キャッシュはアプリが管理します。保存済みチャネルを`prepareBrotherPrinters`へ渡し、返されたチャネルを選んで、ポートとアドレスを既存の`BrotherPrint.printImage()`へ渡します。ヘルパーは印刷をリトライしません。選んだチャネルを次回の接続準備のためにアプリで保存します。

短い事前探索なら`searchDuration: 3`、通常の探索なら`10`を指定できます。これは呼び出し元の選択で、自動リトライではありません。既存のネイティブメソッドによるキャンセルは実行中の探索に作用し、待機中のヘルパー呼び出しを削除しません。コントローラーのインスタンスや別のリスナー削除呼び出しは不要です。

[素のTypeScriptによる印刷例](https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.2.1/examples/plain-typescript.ts)も参照してください。ソースのチェックアウトで`npm test`を実行すると、ヘルパーのテストとこの例の型検査を行います。

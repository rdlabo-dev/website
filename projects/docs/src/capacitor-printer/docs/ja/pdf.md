---
title: PDF・ファイルを印刷
code: []
scrollActiveLine: []
---

PDF などのファイルのシステム印刷 UI を出します。Android と iOS のみです。[インストール](/docs/readme#インストール) のあとで呼び出します。現在の WebView を印刷する場合は [WebViewを印刷](/docs/web) です。

アプリがすでに書き出した実在するローカルファイルのパスを渡します（プレースホルダー文字列ではありません）。Android はファイルパス、`file://` URL、`content://` URL に対応します。iOS はファイルパスとローカル `file://` URL です。`mimeType` は Android のみです。

```ts
import { Printer } from '@rdlabo/capacitor-printer';

// filePathは端末上に存在するファイルを指す必要があります。
await Printer.printFile({ path: filePath });
// awaitが完了するとOSは元ファイルを使用しません。アプリでも不要なら、この時点で削除します。
```

!::printFile::

!::PrintFileOptions::

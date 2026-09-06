---
title: WebViewを印刷
code: []
scrollActiveLine: []
---

現在の WebView 内容のシステム印刷 UI を出します。Android と iOS のみです。[インストール](/docs/readme#インストール) のあとで呼び出します。ボタンからなら、外部ファイルなしでシステム印刷 UI を確認できます。PDF などのファイルを印刷する場合は [PDF・ファイルを印刷](/docs/pdf) です。

```ts
import { Printer } from '@rdlabo/capacitor-printer';

await Printer.printWebView({ name: 'Document' });
```

`name` は印刷ジョブ名で、既定値は `'Document'` です。

!::printWebView::

!::PrintWebViewOptions::

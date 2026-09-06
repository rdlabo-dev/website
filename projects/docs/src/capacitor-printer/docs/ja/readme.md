---
title: 'はじめに'
code: []
scrollActiveLine: []
---

Capacitor アプリからファイルまたは現在の WebView を印刷します。

このプラグインは iOS と Android のネイティブ印刷 UI をラップします。外部ファイルなしで現在の WebView から始めるか、アプリ内で生成した PDF などのローカルファイルを印刷できます。

## インストール

```bash
npm install @rdlabo/capacitor-printer
npx cap sync
```

## 使い方

ボタンから現在の WebView を印刷してシステム印刷 UI を開くには [WebViewを印刷](/docs/web) です。実在するローカル PDF などのファイルは [PDF・ファイルを印刷](/docs/pdf) です。

## いつ使うか

アプリがシステムの印刷ダイアログを出す必要があるときに使います。例:

- レシートや請求書を PDF として印刷する
- アプリ内で生成したレポートを印刷する
- 現在のページ内容を印刷する

## プラットフォーム

- **iOS と Android**: `printFile` と `printWebView` の両方に対応します。
- **Web**: ブラウザがすでに `window.print()` を提供するため非対応です。

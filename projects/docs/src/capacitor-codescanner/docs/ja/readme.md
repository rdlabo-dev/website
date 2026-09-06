---
title: 'はじめに'
code: []
scrollActiveLine: []
---

ネイティブモーダルで QR コードとバーコードを読み取ります。

カメラはモーダル内で動作するため、Web アセット側でカメラビューを管理する必要はありません。単発スキャンまたは連続マルチスキャンに対応し、検出ごとに `event.code` を届けます。

## インストール

```bash
npm install @rdlabo/capacitor-codescanner
npx cap sync
```

### カメラ権限（初回スキャン前に必須）

プラグインは端末のカメラを使います。iOS ではアプリの `Info.plist`（例: `ios/App/App/Info.plist`）に用途説明を追加します。

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to scan QR codes and barcodes.</string>
```

Android はプラグインのマニフェストで `android.permission.CAMERA` を宣言します。スキャナー表示時に OS が実行時許可を求める場合があります。ネイティブ設定を変えたあとは `npx cap sync` し、Xcode / Android Studio など通常の Capacitor ネイティブビルドでアプリを再構築してください。

## 使い方

モーダルを出してスキャン結果を受け取るには [CodeScanner](/docs/code-scanner) です。インストールとカメラ設定のあと、ボタンなどユーザー操作から開始します。

## いつ使うか

独自のカメラ UI を組まず、すぐ使えるスキャンモーダルが欲しいときに使います。向いている用途:

- レシート、商品、チケットの QR / バーコードを読む
- `isMulti: true` で 1 セッションに複数コードを集める

## 機能

- **自動ライト制御**: 暗い環境では既定でフラッシュを点灯します。
- **バイブレーション**: コード検出時に振動します。
- **検出エリアのオーバーレイ**: スキャン範囲を赤枠で示します。
- **検出コードのハイライト**: 検出したコードを赤枠で囲みます。
- **閉じるボタン**: 右上に既定の閉じるボタンがあります。
- **マルチスキャン**: `isMulti: true` のとき、ユーザーが閉じるまでスキャンを続けます。

## プラットフォーム

- **iOS と Android**: 完全対応です。
- **Web**: ネイティブのカメラアクセスが必要なため非対応です。

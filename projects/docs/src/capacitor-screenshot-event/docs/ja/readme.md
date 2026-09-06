---
title: 'はじめに'
code: []
scrollActiveLine: []
---

ユーザーがスクリーンショットを撮ったあと、Capacitor アプリへ通知します。

撮影後の案内やアプリ内 UI の更新（トーストや分析ログなど）に使います。通知は撮影後に届くため、撮影前のコンテンツ保護やぼかしにはなりません。

## インストール

```bash
npm install @rdlabo/capacitor-screenshot-event
npx cap sync
```

## 使い方

リスナー登録、監視開始、実機での物理スクリーンショット確認、停止とハンドル削除は [ScreenshotEvent](/docs/screenshot-event) です。

## プラットフォーム

- **iOS**: `UIApplication.userDidTakeScreenshotNotification` を使います。
- **Android**（8.0.0）: 外部ストレージ配下の固定パス `Pictures/Screenshots/` に対する `FileObserver.CREATE` を監視します。そのディレクトリへ保存される場合に検知します。MediaStore の変更監視ではなく、すべての Android 端末や OEM のギャラリー保存先で確実とは限りません。
- **Web**: ブラウザがスクリーンショットイベントを公開しないため非対応です。

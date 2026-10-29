---
title: "高度なAPIの選択"
sourceRevision: "36b669fe0fe5d7f321ae97def344d07b379feb38f23ffd5579bce18341b4d4ed"
---
# 高度なAPI

基本の登録が、計測、キャプチャ、ハンドオフの確認をすでに管理します。同じホストに2つ目の投影マネージャーを追加しないでください。レンダラーが該当する処理をすでに所有し、その連携が必要な場合に、以下のAPIを使います。

| 要件 | API / ガイド |
| --- | --- |
| 不透明なAndroidビューを再表示する直前に、保留したネイティブ配置を適用する | `beforeNativeReveal`、`updatePlacement`、`isProjecting`、`bindProjectionPlacement`。[Android配置のハンドオフ](android-placement.md#final-placement-when-returning-from-an-opaque-image-android)を参照してください。両コールバックとも、デフォルトでは独自の配置処理を行いません。 |
| 複数のネイティブコントロールを含む、独立したページやモーダルを管理する | `createWebProjectionSurface` / `createWebProjectionSurfaces`。[レンダラーガイド](renderer.md)を参照してください。 |
| 複数のフォールバックコンテナを1回のネイティブトランザクションで連携させる | `createWebProjectionBatch`。[バッチのハンドオフ](web-projection.md#multiple-fallbacks-in-one-native-transaction)を参照してください。 |
| サーフェスのヘルパーでは表現できない既存の所有権モデルに合わせる | `createWebProjectionScope` / `createWebProjection`。[低レベルの投影](web-projection.md)を参照してください。 |
| 置き換え可能な状態更新を直列化し、確認応答の消失から復旧する | `createNativeUpdateQueue`。[更新のスケジュールと復旧](update-queue.md)を参照してください。 |
| カスタムレンダラーのネイティブブリッジを実装する | スナップショットマネージャーの`handle`メソッド。[ネイティブのハンドオフ](native-handoff.md)を参照してください。 |

これらは組み込み方式の選択肢であり、通常の`NativeUIProjection`のセットアップを完成させるための追加手順ではありません。業務上の操作、SDKとのやり取り、アプリケーションへの通知は、利用側のプラグインに残します。

[ドキュメント概要](../README.md)

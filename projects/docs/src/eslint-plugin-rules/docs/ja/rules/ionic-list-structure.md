---
title: ionic-list-structure
---

# @rdlabo/rules/ionic-list-structure

> 注記だけのIonic行と、リスト項目の後に置かれたリストヘッダーを防ぎます。
>
> - ⭐️ このルールは次のFlat Configプリセットに含まれます： [`rdlabo.configs.recommended`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration)。

## ルール詳細

このルールはAngularテンプレート内の2種類の構造上の誤りを報告します。

- 子要素が1つの `ion-note` だけの `ion-item`（空白とコメントは無視）。説明文は項目とそのグループの外に配置し、行の背景や余白を付けないようにします。
- 同じ `ion-list` 内で `ion-item` または `ion-item-group` の後にある `ion-list-header`。前のリストを閉じ、次のセクションには新しいリストを作成します。

ヘッダーの検査はラッパー要素とAngularの制御フローブロックを走査します。入れ子のリストでは項目を独立して追跡します。条件付きの項目も含めてソース上の順序を検査し、実行時の条件は評価しません。注記の検査は意図的に直接の子だけを対象とします。ラベル、値、コントロールと並ぶ注記は有効です。

診断ではレイアウト上の問題と意図した構造を説明します。リストの区切りや投影されたコンテンツの移動にはアプリケーションの文脈が必要なため、自動修正や修正候補は提供しません。

### 誤った例

```html
<ion-list>
  <ion-item-group>
    <ion-item><ion-note>Request bookings require approval.</ion-note></ion-item>
  </ion-item-group>
  <ion-list-header>Another section</ion-list-header>
</ion-list>
```

### 正しい例

```html
<ion-list>
  <ion-item-group>
    <ion-item><ion-label>Booking method</ion-label><ion-note slot="end">Request</ion-note></ion-item>
  </ion-item-group>
  <ion-note>Request bookings require approval.</ion-note>
</ion-list>
<ion-list>
  <ion-list-header>Another section</ion-list-header>
  <ion-item-group>
    <ion-item>Another setting</ion-item>
  </ion-item-group>
</ion-list>
```

## 実装

- [ルールのソース](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.2/src/rules/ionic-list-structure.ts)
- [テストのソース](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.2/tests/rules/ionic-list-structure.ts)

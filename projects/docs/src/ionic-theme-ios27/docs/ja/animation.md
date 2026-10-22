---
title: アニメーション
---

# アニメーション

これらのジェスチャーとアニメーションのヘルパーは本番利用可能な任意機能です。テーマは使用しなくても動作します。

## `ion-tab-button` / `ion-segment-button` の Sheet of Glass

`ion-tab-bar` または `ion-segment` 要素を登録すると、ボタンに移動する選択エフェクトを追加できます。

`registerTabBarEffect` は、ページ表示中の変更も含めて `prefers-reduced-motion` を尊重します。視差効果を減らす設定では、移動するレンズとタブの拡大縮小を無効にし、Ionic 標準の選択動作を維持します。設定を解除すると、登録を破棄するまで任意のエフェクトが復元されます。

`registerSegmentEffect` は視覚レイヤーだけを追加します。選択、ドラッグ、キーボード操作、イベントは引き続き Ionic が管理します。未選択のセグメントは指を離すとレンズが移動し、選択済みのセグメントは短いタップでもその場で拡大します。動きは iOS 27 のプレゼンテーションレイヤーの計測値に従います。視差効果を減らす設定では省略されます。ネイティブのガラスの屈折は CSS で近似します。

[![ion-tab-button と ion-segment-button の Sheet of Glass アニメーション](https://i.gyazo.com/fafd726b520827f042c76b6c73abd81c.gif)](https://gyazo.com/fafd726b520827f042c76b6c73abd81c)

```ts
import { registerTabBarEffect, registerSegmentEffect } from '@rdlabo/ionic-theme-ios27';

/**
 * 初期化済みの Ionic DOM 要素を登録します。
 */
const tabBar = document.querySelector<HTMLElement>('ion-tab-bar');
const segment = document.querySelector<HTMLElement>('ion-segment');
const registeredTabBarEffect = tabBar ? registerTabBarEffect(tabBar) : undefined;
const registeredSegmentEffect = segment ? registerSegmentEffect(segment) : undefined;

const destroy = () => {
  /**
   * 登録した DOM 要素が削除された場合（画面遷移など）は、
   * ジェスチャーとアニメーションを必ず破棄します。イベントリスナーも削除されます。
   * 必要に応じて再登録できます。
   */
  registeredTabBarEffect?.destroy();
  registeredSegmentEffect?.destroy();
};
```

## 検索バーのキャンセルアイコン

Ionic 8 と 9 は Material Design モードでのみ `cancelButtonIcon` を描画します。検索バーを登録すると iOS モードでも同じプロパティを使えます。この任意のヘルパーを使用しない場合、テーマは Ionic のキャンセル用テキストボタンを維持します。

この描画補助は一時的なもので、対応する Ionic のバージョンが iOS DOM 内で `cancelButtonIcon` を描画するようになれば削除する予定です。アイコンがすでに存在する場合は挿入しません。キーボード操作、フォーカス、ボタンのアクセシビリティー属性、キャンセル・クリアの動作は変更せず、Ionic が引き続き管理します。CSS のデザインとアニメーションはヘルパーから独立しており、Ionic 自身が描画するアイコンにも適用されます。

```ts
import { supportSeachbarCancelButtonIcon } from '@rdlabo/ionic-theme-ios27';
import { closeOutline } from 'ionicons/icons';

const searchbar = document.querySelector<HTMLIonSearchbarElement>('ion-searchbar')!;
searchbar.animated = true;
searchbar.showCancelButton = 'focus'; // 'always' と 'never' も使用できます
searchbar.cancelButtonIcon = closeOutline;
searchbar.clearIcon = closeOutline;
searchbar.cancelButtonText = 'Close search'; // アイコンボタンのアクセシブルな名前
const effect = supportSeachbarCancelButtonIcon(searchbar);

// JavaScript プロパティで cancelButtonIcon を変更したら effect.refresh() を呼びます。
// コンポーネント・ページの破棄時:
// effect.destroy();
```

### 登録と対象外の条件

Ionic 要素の初期化後（例: Angular の `ngAfterViewInit`）に登録してください。

| 条件 | 動作 |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 対応する iOS モードの検索バー | Ionic のボタンとイベントハンドラーを維持します。`destroy()` はテキストを復元します。 |
| MD モード、`searchbar-classic`、`ios-theme-disabled`、`ios26-disabled` | ヘルパーを適用しません。 |
| `animated` / `prefers-reduced-motion` | CSS アニメーションが設定を尊重します。 |
| CSS のカスタマイズ | `--background`、`--box-shadow`、`--border-radius`、`--cancel-button-color` を引き続き使用できます。 |

### クリアボタンとキャンセルボタン

| ボタン | Ionic の外観設定 | 操作 |
| ------ | ------------------------------------------------------ | ----------------------------------- |
| クリア | `clearIcon`、`showClearButton`、`--clear-button-color` | 入力フォーカスを維持してクリアします。 |
| キャンセル | `cancelButtonIcon`、`--cancel-button-color` | 検索を終了します。 |

両方のボタンを入力欄の横に同時に表示できます。外観を揃えるには `clearIcon` と `cancelButtonIcon` に同じアイコンを指定します。

外側のガラスボタンはいずれも通常時 44px で、押すと拡大します。視差効果を減らす設定では拡大縮小を無効にします。クリアボタンは入力欄の外に表示され、アイコンは Ionic が提供します。

押している間はガラスの背景が不透明になり、アイコンの色を維持したまま不透明度が 0.55 になります。押下時の背景は `--background` と独立して `--background-activated` で変更できます。

## TabBarSearchable: `ion-tab-bar` と `ion-fab-button` による検索

`ion-tabs` 内で次の構造を使用すると、検索ボタンが検索ツールバーへ変化するアニメーションを適用できます。

[![ion-fab-button からタブバーへ検索欄を展開する TabBarSearchable アニメーション](https://i.gyazo.com/06bc63f4a474f9f19f5b1d865f5c2a85.gif)](https://gyazo.com/06bc63f4a474f9f19f5b1d865f5c2a85)

```html
<ion-content>...</ion-content>
<ion-fab vertical="bottom" horizontal="end" slot="fixed">
  <ion-fab-button aria-label="Search" (click)="present($event)">
    <ion-icon name="search"></ion-icon>
  </ion-fab-button>
</ion-fab>
<ion-footer [translucent]="true">
  <ion-toolbar>
    <ion-buttons slot="start">
      <!-- ion-icon の name はアニメーションが動的に設定します -->
      <ion-button fill="default"><ion-icon slot="icon-only"></ion-icon> </ion-button>
    </ion-buttons>
    <!-- 利用側で `ionChange` などのイベントを設定します。 -->
    <ion-searchbar aria-label="Search" (ionChange)="example($event)"></ion-searchbar>
  </ion-toolbar>
</ion-footer>
```

```ts
import { attachTabBarSearchable, TabBarSearchableType } from '@rdlabo/ionic-theme-ios27';
import type { TabBarSearchableFunction } from '@rdlabo/ionic-theme-ios27';

let searchableFun: TabBarSearchableFunction | undefined;
const initialize = () => {
  // attachTabBarSearchable は状態を持つため、ページごとに初期化します。
  const tabBar = document.querySelector<HTMLElement>('ion-tab-bar');
  const fabButton = document.querySelector<HTMLElement>('ion-fab-button');
  const footer = document.querySelector<HTMLElement>('ion-footer');
  if (!tabBar || !fabButton || !footer) {
    return;
  }
  searchableFun = attachTabBarSearchable(tabBar, fabButton, footer);
};

const present = (event: Event) => {
  searchableFun!(event, TabBarSearchableType.Enter);
};

const dismiss = (event: Event) => {
  searchableFun!(event, TabBarSearchableType.Leave);
};
```

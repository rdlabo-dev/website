---
title: Ionic Frameworkへの機能要望
---

## feat(): `--knob-handle-size` を `--knob-handle-width` / `--knob-handle-height` へ変更する

現在は正方形のサイズだけを想定しています。`knob` 自体の上書きは可能ですが、`--knob-handle-size` は `div.range-knob-handle` の `top` と `margin-inline-start` を決める重要な値なので、無視できません。

## feat(): `collapse` 用のion-configプロパティを追加する

現在、iOS modeでは `collapse` が自動的に有効になりますが、より細かく制御できるように `ion-config` で設定可能にするべきです。

例:

```typescript
export interface IonicConfig {
    ...,
    collapseLargeTitle: {
        ios: boolean;
        md: boolean;
        ionic: boolean;
    },
    collapseBackButtonAnimation: {
        ios: boolean;
        md: boolean;
        ionic: boolean;
    },
}
```

## feat(): デザイン用のnative shadow-partを追加する

### ion-itemにnative-inner（またはitem-inner）partを追加する

`ion-item[lines=inset]` のスタイルは直接変更できない `.item-inner` に適用されています。この制約により、iOS 27のスタイルでは `::part(native)` とpadding-rightで下枠線を変更するしかなく、`ion-item` の右側全体を使えません。`::part(native-inner)` を追加すると、スタイルの自由度が高まります。

```diff
  <ion-item>
    <button type="button" class="item-native" part="native">
-     <div class="item-inner">
+     <div class="item-inner" part="native-inner">
      ...
      </div>
    </button>
  </ion-item>
```

### ion-toastにnative partを追加する

解決済み: https://github.com/ionic-team/ionic-framework/pull/30992#event-23306774962

## docs(): Ionicテーマのクラス命名規則

解決済み。

### ion-back-buttonのアニメーションを無効にする

解決済み: [transitionの実装](https://github.com/rdlabo-dev/ionic-theme-ios27/tree/ios27-v1.2.1/src/transition)を作成しました。

## feat(): ion-content[fullscreen=true]に.content-fullscreenクラスを付ける

解決済み: https://github.com/ionic-team/ionic-framework/pull/30926

## feat(): ion-rangeへ.range-knob-minと.range-knob-maxを直接追加する

解決済み: https://github.com/ionic-team/ionic-framework/pull/30932

---
title: 'Safe Area'
code: []
scrollActiveLine: []
---

Safe Area 用の非表示 Header と常時表示 Native Header です。

まず[IonContentガイド](/docs/ion-content)のScroll連動Headerを設定し、このページのHeader構成を用途に応じて選択してください。

## セーフエリア用に hidden な Header を設定する必要があるのはなぜですか？

もちろん、次のように ion-content にセーフエリアを設定することもできます。

```css
ion-content {
  padding-top: var(--ion-safe-area-top, 0);
}
```

ただし、セーフエリアのために ion-header と ion-toolbar を明示的に置く方が望ましいと考えました。

## Scroll に追従して隠れる Header とは別に、常に表示される Header も必要です

可能です。クラス名に `native-header` を追加すると、2 つの Header をよりスムーズに扱えます。

```diff
- <ion-header class="hidden"><ion-toolbar></ion-toolbar></ion-header>
+ <ion-header class="native-header">
+   <ion-toolbar><ion-title>Native Header</ion-title></ion-toolbar>
+ </ion-header>
```

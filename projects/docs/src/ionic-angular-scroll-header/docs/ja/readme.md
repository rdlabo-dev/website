---
title: 'はじめに'
code: []
scrollActiveLine: []
---

Header と連動してスクロールするためのディレクティブです。

## インストール

```bash
npm install @rdlabo/ionic-angular-scroll-header
```

ディレクティブ用の CSS をグローバルにインポートします（例: `styles.css`）。

```css
@import '@rdlabo/ionic-angular-scroll-header/css/scroll-header.directive.css';
```

CDK Virtual Scroll を使う場合は、高さの決まった viewport も設定します。

```css
cdk-virtual-scroll-viewport {
  width: 100%;
  height: 100%;
  .cdk-virtual-scroll-content-wrapper {
    padding-top: inherit;
  }
}
```

## 最初の成功: IonContent

スクロール可能な行と、viewportから外れるHeaderを持つページを組み立てます。完成例は [IonContent](/docs/ion-content) です。

下へスクロールするとContent Headerが隠れ、上へスクロールすると戻ります。Safe Areaと常時表示Native Headerは [Safe Area](/docs/safe-area)、CDK Viewportは [Virtual Scroll](/docs/virtual-scroll) です。

## 目的から選ぶ

| 目的 | ガイド |
| --- | --- |
| IonContent で Header を隠す・出す | [IonContent](/docs/ion-content) |
| CDK Virtual Scroll と Header を連携する | [Virtual Scroll](/docs/virtual-scroll) |
| Native Header を常時表示する | [Safe Area](/docs/safe-area) |

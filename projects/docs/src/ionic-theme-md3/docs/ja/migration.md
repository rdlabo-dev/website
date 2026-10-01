---
title: '移行'
code: []
scrollActiveLine: []
---

現在インストールしているバージョンより新しい節を、バージョンの昇順にすべて確認してください。例えば、1.x から 9.0.0 に更新する場合は、2.0.0 の移行手順を終えてから 9.0.0 の節を確認します。

各節には、アプリケーションのコードまたは設定の変更が必要な項目のみを記載しています。

## 9.0.0への移行

バージョン 9 では、テーマのメジャーバージョンを Ionic Framework 9 に揃えています。それ以前の移行手順に記載されたもの以外に、新たな破壊的変更はありません。

Ionic 8 と Ionic 9 の両方を引き続きサポートします。バージョン 9 には `@ionic/core >=8.8.0 <10` が必要です。

## 2.0.0への移行

### `.header-item-group` を `.item-group-header` に変更する

section headerとして使う `ion-item-group` のclass名を、対象elementとの一貫性を保つため変更しました。アプリケーションのtemplateとstyleにある `.header-item-group` をすべて置き換えてください。

```diff
- <ion-item-group class="header-item-group">
+ <ion-item-group class="item-group-header">
    ...
  </ion-item-group>
```

旧classはthemeでstyleされなくなりました。この変更は、`@rdlabo/ionic-theme-ios26` と共有するmarkupにも適用されます。

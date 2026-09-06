---
title: 'FAQ'
code: []
scrollActiveLine: []
---

- main.ts で addIcons を実行できますか？

はい。この Issue を確認してください: https://github.com/ionic-team/ionic-framework/issues/28445#issuecomment-1789028722

> You're more than welcome to register them in main.ts or app.component.ts. You can then use them anywhere in your application. However, the initial bundle size may increase because the icons need to be loaded up front.

- ユニットテストはサポートしていますか？

テストランナーが `main.ts` を実行しない場合は、テストのsetupファイル、または各テストで `addIcons` を呼び出してください。Karma系でまだ `src/test.ts` を使う場合はそこに登録し、Vitestなどではそのランナーのsetupファイルを使います。

- アイコン名のバインディングはサポートしていますか？

いいえ。このプログラムでのサポート予定もありません。例えば、次のようなコードは、表示されるまで追うのが困難です。

```ts
@Component({
  selector: "app-example",
  template: ` <ion-icon [name]="iconName"></ion-icon> `,
})
export class ExampleComponent {
  iconName = "add";

  ionViewWillEnter() {
    setTimeout(() => {
      this.iconName = "remove";
    }, 1000);
  }
}
```

このような複雑な処理をしている場合は、手動でインポートしてください。

あるいは、バインドするアイコン数が限られている場合は、テンプレートに「ヒント」用のブロックを追加できます。

```html
<!-- This is a trick to get ionic-angular-collect-icons
     to include the icons, but it will never render. -->
@if(false) {
<ion-icon name="home"></ion-icon>
<ion-icon name="people"></ion-icon>
}
```

理想的ではありませんが、自動化の維持には役立ちます。

- なぜ各コンポーネントで addIcons しないのですか？

ライブラリによる差分を最小限にするためです。実行のたびにすべてのコンポーネントが変わるのは好ましくありませんでした。差分はできるだけ小さく保ちたかったのです。

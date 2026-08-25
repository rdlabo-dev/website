---
title: 'Photo Editor'
code: []
scrollActiveLine: []
---

Ionic モーダルで `PhotoEditorPage` を表示します。[インストール](/docs/readme#インストール) のあとで呼び出します。

```typescript
import { PhotoEditorPage, IPhotoEditorDismiss, PhotoEditorProps } from '@rdlabo/ionic-angular-photo-editor';

(async () => {
  const componentProps = {
    requireSquare: false,
    value: 'https://picsum.photos/200/300',
    headerButtonColorScheme: 'dark',
    labels: {
      save: '送信', // change '保存' to '送信'
    },
  } satisfies PhotoEditorProps;
  const modal = await this.modalCtrl.create({
    component: PhotoEditorPage,
    componentProps,
  });
  await modal.present();
  const { data } = await modal.onWillDismiss<IPhotoEditorDismiss>();
  if (data?.value) {
    console.log(data.value);
  }
})();
```

### オプション

#### requireSquare: boolean

true の場合、最初に画像を正方形に切り抜く必要があります。

#### value: string

画像の URL または base64 文字列です。

#### labels: IDictionaryForEditor

設定すると、ラベルが上書きされます。

一覧は[こちら](https://github.com/rdlabo-dev/ionic-angular-library/blob/v21.7.0/projects/photo-editor/src/lib/dictionaries.ts)です。

#### headerButtonColorScheme: 'light' | 'dark'

必須です。`ion-toolbar` が暗色または黒色の場合は `dark`、明色または白色の場合は `light` を選択してください。ツールバーの外観はCSS、半透明コンテンツ、実行時のテーマ上書きによって変わるため、ライブラリ側では判定できません。

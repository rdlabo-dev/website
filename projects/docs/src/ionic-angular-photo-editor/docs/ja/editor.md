---
title: Photo Editor
---

Ionic Modalで `PhotoEditorPage` を表示します。[Installation](/docs/readme#installation)の後に呼び出してください。

```typescript
import { PhotoEditorProps, PhotoEditorResult, providePhotoEditor } from '@rdlabo/ionic-angular-photo-editor';
import { PhotoEditorPage } from '@rdlabo/ionic-angular-photo-editor/editor';
import { createTuiImageEditor } from '@rdlabo/ionic-angular-photo-editor/editor/tui';

// app.config.ts
export const appConfig = {
  providers: [providePhotoEditor({ createImageEditor: createTuiImageEditor })],
};

(async () => {
  const componentProps = {
    requireSquare: false,
    value: 'https://picsum.photos/200/300',
    toolbarColorScheme: 'dark',
    labels: {
      save: '送信', // override default '保存'
    },
  } satisfies PhotoEditorProps;
  const modal = await this.modalCtrl.create({
    component: PhotoEditorPage,
    componentProps,
  });
  await modal.present();
  const { data } = await modal.onWillDismiss<PhotoEditorResult>();
  if (data?.action === 'save') {
    console.log(data.value);
  }
})();
```

## Modal result

SaveするとModalは次のdataでdismissします。

```typescript
interface PhotoEditorResult {
  action: 'save';
  value: string; // data URL of the edited image
}
```

Saveせずにcloseした場合はdataなしでdismissします。

## Option

### requireSquare: boolean

`true` の場合、編集を続ける前に画像を正方形へcropする必要があります。

### value: string

編集するImage URLまたはData URLです。

### toolbarColorScheme: 'light' | 'dark'

**必須。** 暗色・黒色の `ion-toolbar` には `dark`、明色・白色のToolbarには `light` を使います。LibraryはCSS、translucency、runtime theme overrideからToolbarの外観を推論できません。[Theme](./theme.md)も参照してください。

### labels: Partial&lt;PhotoEditorLabels&gt;

Default UI stringを上書きします。指定しないkeyはbuilt-inの日本語defaultを維持します。

| Key        | Default（ja）   |
| ---------- | --------------- |
| save       | 保存            |
| close      | 閉じる          |
| back       | 戻る            |
| apply      | 適用            |
| crop       | 切り抜き・回転  |
| rotate     | 回転            |
| cropCover  | 画像に合わせる  |
| crop16x9   | 16対9           |
| cropSquare | 正方形          |
| cropFree   | 自由            |
| filter     | フィルター      |
| brightness | 明るさ          |
| original   | オリジナル      |
| invert     | 反転            |
| sepia      | セピア          |
| vintage    | ヴィンテージ    |
| blur       | ぼかし          |
| grayscale  | グレースケール  |
| sharpen    | 輪郭            |
| emboss     | エンボス        |

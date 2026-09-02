---
title: Photo Viewer
---

Ionic Modalで `PhotoViewerPage` を表示します。[Installation](/docs/readme#installation)の後に呼び出してください。

```typescript
import { PhotoViewerProps, PhotoViewerResult } from '@rdlabo/ionic-angular-photo-editor';
import { PhotoViewerPage } from '@rdlabo/ionic-angular-photo-editor/viewer';

(async () => {
  const componentProps = {
    imageUrls: ['https://picsum.photos/200/300', 'https://picsum.photos/200/301'],
    index: 0,
    isCircle: false,
    enableDelete: true,
    toolbarColorScheme: 'dark',
    imageAlt: (url, index) => `Photo ${index + 1}`,
    labels: {
      delete: 'Delete',
    },
  } satisfies PhotoViewerProps;
  const modal = await this.modalCtrl.create({
    component: PhotoViewerPage,
    componentProps,
  });
  await modal.present();
  const { data } = await modal.onWillDismiss<PhotoViewerResult>();
  if (data?.action === 'delete') {
    console.log(data.index, data.value);
  }
})();
```

## Modal result

UserがDeleteをtapすると、Modalは次のdataでdismissします。

```typescript
interface PhotoViewerResult {
  action: 'delete';
  index: number;
  value: string; // URL of the image at index
}
```

Closeまたはswipe downではdataなしでdismissします。

## Option

### imageUrls: string[]

**必須。** 表示するImage URLまたはData URLです。

### index: number

最初に表示するslide indexです。Defaultは `0` です。

### isCircle: boolean

`true` の場合、画像を円形でrenderします。

### enableDelete: boolean

`true` の場合、Delete Buttonを表示します。

### enableFooterSafeArea: boolean

`true` の場合、iOSでFooterのSafe Area paddingを追加します。

### toolbarColorScheme: 'light' | 'dark'

**必須。** 暗色・黒色の `ion-toolbar` には `dark`、明色・白色のToolbarには `light` を使います。[Theme](./theme.md)も参照してください。

### imageAlt: string | ((url: string, index: number) => string)

各slide画像のaccessibleな `alt` textです。Defaultは空文字列です。Alt textがURLまたはindexに依存する場合はfunctionを渡します。

### labels: Partial&lt;PhotoViewerLabels&gt;

Default UI stringを上書きします。指定しないkeyはbuilt-inの日本語defaultを維持します。

| Key    | Default（ja） |
| ------ | ------------- |
| close  | 閉じる        |
| delete | 削除          |

Close Buttonの `aria-label` にも `close` labelを使います。

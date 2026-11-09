---
title: API
sourceRevision: "51faa9c97da38365c846c28f1bdb410d0615b95328c9f352e726f3d5c2bfd24d"
---

`@rdlabo/ionic-theme-md3` v9.2.0 が公開するJavaScript APIのリファレンスです。CSSエントリーポイントはREADMEで説明します。

## アニメーション

#### `function` mdTransitionAnimation

`(_: HTMLElement, opts: TransitionOptions) => Animation`

Ionic向けのMaterial Design 3ナビゲーショントランジションを生成します。

## 動的な配色

#### `function` enableDynamicColors

`(options: DynamicColorThemeOptions) => Promise<DynamicColorTheme>`

選択した配色をドキュメントのルートに適用します。終了処理まで、生成したインラインプロパティとダーククラスを管理します。設定、ライフサイクル、フォールバックの動作は[Androidの動的な配色](/docs/dynamic-colors)を参照してください。

#### `function` materialToIonicColors

`(scheme: MaterialColorScheme) => IonicColorVariables`

MaterialのカラーロールをIonicのCSS変数へ変換します。

#### `function` materialToMd3Colors

`(scheme: Partial<Record<MaterialColorRole, string>>) => IonicColorVariables`

指定されたMaterialのカラーロールをMD3のCSS変数へ変換します。

### 公開された色の型定義

公開配列 `materialColorRoles` は対応するロールを列挙します。`MaterialColorRole` はその要素の型です。`MaterialColorScheme` では以下の6ロールが必須で、ほかのロールは任意です。

```ts
type MaterialColorRole = (typeof materialColorRoles)[number];
interface MaterialColorScheme extends Partial<Record<MaterialColorRole, string>> {
  primary: string;
  secondary: string;
  tertiary: string;
  error: string;
  surface: string;
  onSurface: string;
}
type DynamicColorScheme = {
  available: false;
  systemDark: boolean;
} | {
  available: true;
  systemDark: boolean;
  light: MaterialColorScheme;
  dark: MaterialColorScheme;
};
type ColorMode = 'system' | 'light' | 'dark';
type IonicColorVariables = Record<string, string>;
```

コントローラーはカラーモードの変更、配色の再取得、リスナーと管理中のスタイルの解放を行います。

```ts
interface DynamicColorThemeOptions {
  getScheme: () => Promise<DynamicColorScheme>;
  listen?: (listener: () => void) => Promise<{
    remove(): Promise<void>;
  }>;
  mode?: ColorMode;
  document?: Document;
  onError?: (error: unknown) => void;
}
interface DynamicColorTheme {
  setMode(mode: ColorMode): void;
  refresh(): Promise<void>;
  destroy(): Promise<void>;
}
```

## トグルの状態アイコン

#### `function` applyToggleStateIcons

`(toggle: HTMLElement) => Promise<() => void>`

描画済みのIonicトグル1つにAndroid Settingsの状態アイコンを追加します。Ionicのオン／オフラベルが優先されます。戻り値の関数で追加した表示を解除します。[Android Settingsの外観](/docs/android-settings)を参照してください。

---
title: はじめに
---

`@rdlabo/ionic-angular-kit` は、型付きStorage、型付きOverlay、Ionic Signal Forms adapterを提供するIonic Angular向けの共有アプリケーション基盤です。製品固有の画面、ドメインポリシー、翻訳は利用側アプリに残します。

```sh
npm install @rdlabo/ionic-angular-kit
```

## まず設定を保存してみる

既存のIonic Angularアプリで、Ionic Storageのproviderを既存のapp configへmergeしてください。他のproviderを置き換えないでください。

```ts
import { importProvidersFrom, type ApplicationConfig } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage-angular';

export const appConfig: ApplicationConfig = {
  providers: [importProvidersFrom(IonicStorageModule.forRoot({ name: '__mydb' }))],
};
```

次に、このstandalone componentを追加します。

```ts
import { Component, inject, signal } from '@angular/core';
import { IonButton } from '@ionic/angular';
import { disableHandler, KitStorageService } from '@rdlabo/ionic-angular-kit';

@Component({
  selector: 'app-preferences-demo',
  imports: [IonButton],
  template: `<ion-button type="button" (click)="disableHandler($event, save())">Save preference</ion-button>
    <p>{{ result() }}</p>`,
})
export class PreferencesDemo {
  private readonly storage = inject(KitStorageService);
  readonly result = signal('');
  readonly disableHandler = disableHandler;

  async save(): Promise<void> {
    await this.storage.set('theme', 'dark');
    this.result.set((await this.storage.get<string>('theme')) ?? '');
  }
}
```

既存ページに `<app-preferences-demo>` を描画します（そのstandalone pageの `imports` に `PreferencesDemo` を追加）。Save preference をクリックすると `dark` が表示されます。`KitStorageService` がStorageを自動初期化するため、手動の初期化は不要です。

## 要件

| Package                                         | 対応version |
| ----------------------------------------------- | ----------- |
| Angular                                         | 21.x〜22.x  |
| Ionic Angular                                   | 9.x         |
| RxJS                                            | 7.8.x       |
| Capacitor Core, App, Haptics, Keyboard, Network | 7.x〜8.x    |
| iOS/iPadOS deployment target                    | 16.4以降    |

Core packageは `@ionic/storage-angular` とCapacitor Core、App、Haptics、Keyboard、Networkを必須peerとして宣言しています。アプリがcore entry pointの一部しか使わない場合も、互換versionをinstallしたままにしてください。`/offline` を使うNativeアプリでは、Capacitor majorに合う `@capacitor-community/sqlite` もinstallして設定する必要があります。これはアプリが所有し、Kitからはinstallされません。

Firebase、Social Login、Live Update、Preferences、Status Bar、In-App Review、Printer/PDFの依存は任意機能のpeerです。選択したsecondary entry pointが使う依存だけをinstallし、各plugin固有の互換範囲に従ってください。一部の任意pluginはCapacitor 8だけをサポートします。

`/auth-firebase/google` entry pointは `@capawesome/capacitor-google-sign-in` 0.1.xを使用するため、Capacitor 8が必要です。Capacitor 7を使い続けるアプリはKitのcoreと互換性のある他のentry pointを使えますが、このGoogle entry pointは使えません。

importするプロバイダーのentry pointに対応するNative pluginだけをinstallしてください。`/auth-firebase/social` は非推奨ですが後方互換性のため維持されます。AppleとFacebookを再exportするため、両方のpluginが必要です。適切な時期にimportを `/auth-firebase/apple` と `/auth-firebase/facebook` へ移行してください。今回の変更では削除しません。`/auth-firebase/internal` は各entry pointが使うプロバイダー非依存の共有実装で、サポート対象のアプリ用APIではありません。

Social Loginのcallbackは成功payloadの認証済み `user` でリクエストのidentityを固定します。`before` / `success`（Googleでは `exchange` も）の失敗は `error` に通知され、`{ status: false }` を返し、必ず `finally` を実行します。`error` / `finally` 自体の失敗は呼び出しをrejectします。Native AppleはiOSのみで動作し、WebではFirebase popupを使います。キャンセル扱いになるのはNative adapterがキャンセルコードを保持する場合だけです。不明なNativeエラーは `other` です（翻訳済みメッセージからキャンセルを推測しないでください）。

## Entry point

| Import                                    | 役割                                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| `@rdlabo/ionic-angular-kit`               | Storage、Overlay、Guard、HTTP、Realtime、Directive、Keyboard、Utility         |
| `@rdlabo/ionic-angular-kit/offline`       | **Experimental.** Scoped Local Replica、Outbox、Pull、Replay、Request Policy |
| `@rdlabo/ionic-angular-kit/theme`         | Light/Dark Theme永続化とNative Status Bar同期                                |
| `@rdlabo/ionic-angular-kit/forms`         | Angular Signal Forms向けのIonic error textとstate class                      |
| `@rdlabo/ionic-angular-kit/review`        | 頻度制御付きNative In-App Review                                             |
| `@rdlabo/ionic-angular-kit/printer`       | DOM-to-PNG、Brother Label、PDF helper                                        |
| `@rdlabo/ionic-angular-kit/auth-firebase` | Firebase依存配線と認証Flow                                                   |
| `@rdlabo/ionic-angular-kit/auth-firebase/apple` | Appleのsign-in/link（Apple pluginのみ） |
| `@rdlabo/ionic-angular-kit/auth-firebase/facebook` | Facebookのlogin/link/logout（Facebook pluginのみ） |
| `@rdlabo/ionic-angular-kit/auth-firebase/google` | Google popup/Native sign-in、Firebase session linking、logout |
| `@rdlabo/ionic-angular-kit/auth-firebase/social` | **非推奨。互換性のため維持。** Apple/Facebook helper |
| `@rdlabo/ionic-angular-kit/app-update`    | Angular Service Workerのatomicなupdate transition                            |
| `@rdlabo/ionic-angular-kit/live-update`   | Capawesome Live Update readiness provider                                    |

Secondary entry pointにより、任意のNative依存・SDKをcore bundleから分離します。

`/offline` entry point全体はExperimentalで、KitのSemVer互換性保証の対象外です。安定化するまでは、public API、永続化schema、同期動作がminorまたはpatch releaseで互換性なく変更される可能性があります。採用時はKitをexact versionに固定し、upgradeのたびにmigration guideを確認してください。

## 必要な機能だけを設定する

多くの機能はproviderのcallbackを通じ、route、文言、credential、アプリ固有の副作用をKit外に保ちます。まず[Storage・Overlay](/ionic-angular-kit/docs/storage-overlays)と[フォーム](/ionic-angular-kit/docs/forms)から始めてください。

## ドキュメント

- [Storage・Overlay](/ionic-angular-kit/docs/storage-overlays)
- [フォーム](/ionic-angular-kit/docs/forms)
- [ESLintでKitの使い方をチェック](/docs/eslint)
- [認証・HTTP](/ionic-angular-kit/docs/auth-http)
- [Offline・Realtime](/ionic-angular-kit/docs/offline-realtime)
- [任意機能](/ionic-angular-kit/docs/optional-features)

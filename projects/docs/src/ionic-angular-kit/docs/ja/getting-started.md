---
title: はじめに
---

`@rdlabo/ionic-angular-kit` はIonic Angularアプリ向けの共有アプリケーション基盤です。製品固有の画面、ドメインポリシー、翻訳は利用側アプリに残します。

```sh
npm install @rdlabo/ionic-angular-kit
```

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
| `@rdlabo/ionic-angular-kit/app-update`    | Angular Service Workerのatomicなupdate transition                            |
| `@rdlabo/ionic-angular-kit/live-update`   | Capawesome Live Update readiness provider                                    |

Secondary entry pointにより、任意のNative依存・SDKをcore bundleから分離します。

`/offline` entry point全体はExperimentalで、KitのSemVer互換性保証の対象外です。安定化するまでは、public API、永続化schema、同期動作がminorまたはpatch releaseで互換性なく変更される可能性があります。採用時はKitをexact versionに固定し、upgradeのたびにmigration guideを確認してください。

## 必要な機能だけを設定する

多くの機能はproviderのcallbackを通じ、route、文言、credential、アプリ固有の副作用をKit外に保ちます。まず[Storage・Overlay](/ionic-angular-kit/docs/storage-overlays)を設定し、必要に応じて認証、Offline、Native機能を追加してください。[Offline・Realtime](/ionic-angular-kit/docs/offline-realtime)では、必須のSQLite接続、provider/interceptorの順序、read strategy、Durable Outbox flow、repository concurrency ruleを説明しています。

## ドキュメント

- [Storage・Overlay](/ionic-angular-kit/docs/storage-overlays)
- [認証・HTTP](/ionic-angular-kit/docs/auth-http)
- [Offline・Realtime](/ionic-angular-kit/docs/offline-realtime)
- [任意機能](/ionic-angular-kit/docs/optional-features)

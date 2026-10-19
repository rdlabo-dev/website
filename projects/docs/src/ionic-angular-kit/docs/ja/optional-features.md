---
title: 任意機能
---

任意機能はsecondary entry pointを使い、利用しないNative plugin・SDKがアプリへ入らないようにします。

## WebアプリケーションのUpdate

`/app-update` の `provideKitAppUpdate()` は、bootstrap前に完全なAngular Service Worker versionがあるか確認します。このblocking strategyは、update確認の遅延よりも入力中の内容をすべて保持することが重要なアプリで引き続きdefaultです。

実行可能なapplication chunkをすべてprefetchするアプリは、non-blockingなstartup checkを選択できます。

```ts
provideKitAppUpdate({ strategy: 'background' });
```

既存のbackground strategyは、Angularが初回renderを完了する前だけリロードします。それ以降の更新は次の自然なページロードまで保留し、入力内容を失わないようにします。

アプリは別の `confirm` strategyを選び、ユーザーの操作で即座に更新する選択肢を提示できます。Promptは初回render後にAngularのinjection contextで実行されます。非同期境界を越える前に依存を同期的に解決してください。`true` を返すとダウンロード済みの完全なversionへリロードし、`false` なら次の自然なページロードまで保留します。`undefined` は、他のalertが表示中などでpromptを提示できなかったため後で再試行することを示します。

```ts
provideKitAppUpdate({
  strategy: 'confirm',
  promptForUpdate: () =>
    inject(KitOverlayController).tryAlertConfirm({
      header: 'The latest version is ready',
      message: 'Reload now to update?',
      okText: 'Reload and update',
    }),
});
```

どちらのnon-blocking strategyも `activateUpdate()` を呼びません。実行中のshellと別versionのlazy chunkが混在する可能性があるためです。復旧不能な起動時generationは `ngsw-bypass` で一度だけ再試行し、現在のhistory stateとoffline対応のloop guardを保持します。

## Theme・Review

`provideKitTheme()` と `KitThemeController` はuser設定を永続化し、overrideされるまでは `prefers-color-scheme` に追従し、アプリ指定のpalette classを切り替え、Android Status Barを同期します。

```ts
provideKitTheme({
  storageKey: 'theme',
  darkClasses: ['ion-palette-dark'],
  lightClasses: ['ion-palette-light'],
});
```

`/review` から `kitRequestReview()` をimportすると、アプリが指定した期間に一度だけNative Review Dialogを要求します。Webでは何もしません。

## Printer

`/printer` entry pointにはDOM-to-PNG、画像回転、Brother Print設定、複数pageのlabel layout、PDF生成のpure helperがあります。Paper選択UI、Loading Overlay、Storage、Transport、copy policyは利用側アプリが所有します。

## Firebase認証

`/auth-firebase` entry pointは `provideKitFirebase()` で `firebase/auth` を初期化し、`KIT_FIREBASE_AUTH` と `kitSignIn`、`kitSignUp`、`kitSignOut`、`kitResolveAuthStatus`、`kitReauthWithRetry` などのflow helperを公開します。

KitはUIを実装しません。Hookを通じてloading、navigation、エラー表示をアプリへ委譲します。Social providerは `/auth-firebase/apple`、`/auth-firebase/facebook`、`/auth-firebase/google` に分かれ、各providerに必要なのは対応する任意pluginのみです。統合された `/auth-firebase/social` は**非推奨ですが後方互換性のため維持**されます。Appleのimportは `/apple` へ、Facebookは `/facebook` へ移行してください。

互換entry pointは引き続きAppleとFacebookの両pluginをロードします。関数は実行時に同一の参照を保ち、既存のApple response objectもソース互換性を維持します。

Social helperは `before` の実行前に現在のFirebaseユーザーを捕捉し、非同期処理の前後でidentityを確認します。成功hookは実際に認証された `user` を受け取ります。バックエンドリクエストを同じsessionへ結び付けるために使ってください。同じ `Auth` でApple、Facebook、Googleのflowが重なる場合、後発のflowは自身の `before` hookやSDK呼び出しを始める前に `error('other', error)` で拒否され、`status: false` となります。Guardはクリーンアップ中も有効です。異なる `Auth` インスタンスは独立しています。

アプリ側でも、メール／パスワード認証、サインアウト、Firebaseの直接呼び出しをこれらのflowと調整する必要があります。Guardの対象はこのJavaScript contextのKit social helperです。開始済みFirebaseリクエストのキャンセル、完了済みprovider linkのrollback、別タブからの変更の直列化はできません。

`before`、exchange、`success` の失敗はerror hookを実行して `status: false` を返します。呼び出しが重なった場合を含め `finally` は必ず実行します。`error` または `finally` のエラーはPromiseをrejectします。UIのクリーンアップはhookが担当します。

Apple利用側は `@capawesome/capacitor-apple-sign-in`（`>=0.1.4 <1`）をinstallし、`@capacitor-community/apple-sign-in` を置き換えた後に `npx cap sync` を実行してください。このNative依存の移行は非推奨の `/social` 利用時にも必要です。importとresponseの型は互換性を維持します。Native pluginの変更には新しいNative binaryが必要です。

Apple helperはiOSでNative sign-in、WebでFirebase popupを使います。Android Service IDとredirect設定はこのhelperでは公開していません。Capawesomeの型付き `SIGN_IN_CANCELED` エラーはキャンセルとして通知し、他のNativeエラーは処理上の失敗として扱います。Nativeの `idToken` は既存responseの `identityToken` fieldへ対応します。Webでは `authorizationCode` は `null` で、popupのaccess tokenを別の `accessToken` として返します。

## Live Update

`/live-update` の `provideLiveUpdateReadiness()` はAngularのstable、最初のroute完了、1 animation frameを待ってからCapawesome `LiveUpdate.ready()` を呼びます。Webでは何もしません。

Live Updateが置き換えるのは既存Native BinaryのWeb層だけです。Native code、Capacitor設定、plugin versionの変更にはStore Buildと新しいbuild-number固有channelが必要です。

---
title: Offline・Realtime
---

## スコープ付きOffline Runtime

> **Experimental:** `@rdlabo/ionic-angular-kit/offline` entry point全体はExperimentalで、KitのSemVer互換性保証の対象外です。安定化するまでは、public API、永続化schema、同期動作がminorまたはpatch releaseで互換性なく変更される可能性があります。採用時はKitをexact versionに固定し、upgradeのたびにmigration guideを確認してください。

`/offline` entry pointはuser・partition単位のLocal Replica、Durable Outbox、cursor-based delta pull、aggregate順のreplay、optimistic mutation policy、request-policy interceptorを提供します。

外部sourceやHTTP cacheには `mode: 'readCacheOnly'` を使います。Synchronized modeはiOS・Androidで暗号化された `@capacitor-community/sqlite` を使います。現在のruntimeにはcross-tab同期lockがないため、Webではfail fastします。

### Runtimeをinstallしてprovideする

KitのStorage基盤としてIonic Storageを一度provideします。Webのread-cache構成では、Offline Repositoryとしても使います。Nativeのsynchronized applicationは、Kitへ渡すCommunity SQLite接続もアプリ側で所有します。次のSQLite installとNative syncが必要なのは、synchronized iOS・Androidアプリだけです。

```sh
npm install @ionic/storage-angular @capacitor-community/sqlite@^8
npx cap sync
```

SQLite pluginのmajorはCapacitorに合わせます。Capacitor 7アプリでは `@capacitor-community/sqlite@^7`、Capacitor 8アプリでは `@^8` を使ってください。

```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { IonicStorageModule } from '@ionic/storage-angular';
import { kitAuthInterceptor } from '@rdlabo/ionic-angular-kit';
import { offlineInterceptor, provideOffline } from '@rdlabo/ionic-angular-kit/offline';

const sqliteConnection = new SQLiteConnection(CapacitorSQLite);

export const appConfig = {
  providers: [
    importProvidersFrom(IonicStorageModule.forRoot({ name: '__kit_storage' })),
    provideHttpClient(withInterceptors([offlineInterceptor, kitAuthInterceptor])),
    provideOffline({
      databaseName: 'product_offline',
      replicaSchema,
      sqliteConnection,
      createEncryptionKey: () => secureKeyStore.getOrCreateOfflineKey(),
      requestPolicies: [ProductReadPolicy],
      mutationPolicies: [ProductMutationPolicy],
      commandExecutor: ProductCommandExecutor,
      replicaPuller: ProductReplicaPuller,
      aggregateIntentProjector: ProductAggregateIntentProjector,
    }),
  ],
};
```

`offlineInterceptor` は `kitAuthInterceptor` より前に登録します。Product adapterはURL・DTO mapping、Replica schema、encryption key storage、server pull/command protocol、optimistic projectionを所有します。Kitは永続化、session分離、FIFO順序、retry、reconciliationを所有します。`databaseEncryption: false` を設定するのは、意図的にplaintextのNative Databaseを使う場合だけです。それ以外では暗号化がdefaultで、初回open時に `createEncryptionKey` が必要です。

`mode: 'readCacheOnly'` では、mutation policy、command executor、replica puller、aggregate intent projectorを省略します。WebはIonic Storageを通じてこのread-cache modeをサポートします。Repositoryがcross-context lockを提供できるまでは、Web synchronized modeは拒否されます。

```ts
provideOffline({
  mode: 'readCacheOnly',
  databaseName: 'product_cache',
  databaseEncryption: false,
  replicaSchema,
  requestPolicies: [ProductReadPolicy],
});
```

Web read-cache構成ではCommunity SQLiteをimportも指定もしません。SQLCipherはNative Repositoryだけに適用されるため、`databaseEncryption: false` を明示します。

Cold start時のOffline Accessは、nullでない認証provider subjectに紐づくmanifestだけを復元します。Remote処理は次の順で開始します。

1. 検証済みRemote Sessionを準備する。
2. `remote` accessを公開する。
3. Pull、Outbox Replay、Realtime処理を再開する。

`createOfflineAuthBridge()` はこの順序を `provideKitAuth()` へ接続し、consent、error UI、credential交換をアプリ側に残します。

```ts
import { provideKitAuth } from '@rdlabo/ionic-angular-kit';
import { createOfflineAuthBridge, isOfflineFallbackError } from '@rdlabo/ionic-angular-kit/offline';

provideKitAuth(() => ({
  authState: () => auth.state$,
  ...createOfflineAuthBridge({
    exchange: async (context) => exchangeCredential(context),
    currentAuthSubject: () => auth.currentSubject(),
    isUnavailableError: isOfflineFallbackError,
    availability: () => auth.authorityAvailable$,
  }),
  redirects,
}));
```

明示的なsign-outでは、先に `KitAuthAccessService` をclearし、その後Offline Session cleanupをawaitします。これにより永続user dataを削除する前に処理中のleaseを無効化します。

### Read request strategy

`OfflineRequestPolicy` は一致するGETを `kind: 'read'`、`readLocal()` function、任意の共有 `projectResponse()` functionへ解決します。`readStrategy` がsettlementを制御します。

| Strategy        | 動作                                                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `network-first` | Default。最初にtransportを使い、Offlineまたは利用不能なtransport errorではLocal responseへfallbackします。                                            |
| `local-first`   | LocalとRemote処理を同時に開始し、利用可能なLocal responseを先にemitしてからRemote revalidationをemitします。                                           |
| `fastest-first` | 利用可能なresponseのうち先にsettleした方をemitします。Localが勝てばRemote revalidationが続き、Remoteが勝てば遅いLocal readをcancelします。              |
| `local-only`    | HTTP transportを開始しません。Remoteに存在できないprovisional identityで使います。                                                                    |

`local-first` とLocalが勝った `fastest-first` は2回emitすることがあります。Revalidationが終わるまでHTTP Observableをsubscribeしたままにしてください。`firstValueFrom()` と `take(1)` は最初のemit後にtransportをcancelします。UI stateで完全なRemote collectionと不完全で空のLocal snapshotを区別する必要がある場合は、`offlineReadEmission()` と `shouldCommitOfflineCollection()` を使います。

`projectResponse(response, source)` はRemote・Local両方のresponseで実行されます。永続化するのは `source === 'remote'` の場合だけにしてください。ProjectorがReplica mutationの後ろで待つ必要があるread-only derivationを行う場合は、`serializeResponseProjection: true` を設定します。Projector自体がReplica mutationを開始する場合は有効にせず、read/derive/write sequenceには `OfflineSyncService.runSerializedReplicaMutation()` を使います。

### Durable mutationとgenerated createの即時送信

Mutation policyはoptimisticな `HttpResponse` を準備します。Product実装はresponseを返す前に、対応するDurable Intentをenqueueしてください。`enqueue()` はdefaultでUUIDを生成します。Product codeがDurable Intentを周辺処理と関連付ける場合や、新しく作成したgenerated identityをすぐ送信する場合は、安定した `commandId` を指定します。Kitはtransport retryをまたいでそのIDを保持します。

```ts
import type { OfflineGeneratedCommandLocator } from '@rdlabo/ionic-angular-kit/offline';

const commandId = crypto.randomUUID();
const localId = crypto.randomUUID();

await offlineSync.enqueue(
  {
    commandId,
    scopeId,
    aggregateType: 'photo',
    identity: { kind: 'generated', localId },
    operation: 'create',
    payload: createPayload,
  },
  { flush: false },
);

const locator = {
  scopeId,
  sourceKey: 'photo',
  localId,
} satisfies OfflineGeneratedCommandLocator;

const remoteId = await offlineSync.sendGeneratedCommandNow(commandId, locator);
```

第2引数の型は `OfflineGeneratedCommandLocator` です。`sendGeneratedCommandNow()` は、confirmed baselineもRemote IDもない新しいgenerated aggregateの最初のpending intentだけに意図的に制限されています。通常のpre-send pullをskipしてLocal acknowledgementをcommitします。Confirmed Remote IDを取得すると、authoritative pull reconciliationをbackgroundでscheduleします。Transportが利用できない場合やConfirmed IDが生成されない場合は `null` を返します。Terminalな `blocked_auth`、`rejected`、`conflict` の結果では `OfflineImmediateCommandRejectedError` をthrowします。既存aggregateと後続intentは、pre-pull conflict barrierを維持するため `flush()` を使う必要があります。

Command payloadはlosslessにJSON serializeできなければなりません。Caller所有のCommand IDは1〜255文字で、アプリ・serverのidempotency retention期間中に再利用してはいけません。Kitが拒否できるのはLocalに残っているCommandとのcollisionだけです。Local Commandがreconcileされて削除された後でも、serverは再利用されたIDをdeduplicateする可能性があります。

### Repository consistency boundary

`OfflineSyncService` をProduct mutationのownerとして扱ってください。Productのread/derive/write操作には `runSerializedReplicaMutation()` を使います。Callback内では指定されたRepositoryだけを使い、そのRepositoryの `transactReplica()` でwriteを完了します。Nestedした `OfflineSyncService` mutationや別のcoordinator laneを開始しないでください。Replica row、Outbox command、cursor、pull-attentionの変更を同じtransactionでcommitします。

Read-onlyのmulti-query snapshotには `repository.runReadSnapshot()` を使い、すべてのreadを指定されたreaderから行います。そのcallback内でRepositoryをmutationしたり、別の `runReadSnapshot()` をnestedしたりしないでください。Repositoryの `replaceCommand()`、`removeCommand()`、`putPullAttention()`、`removePullAttention()` methodはdeprecatedです。`transactReplica()` の対応する `putCommands`、`removeCommandIds`、`putPullAttentions`、`removePullAttentions` fieldを使ってください。

### 認証済みRouteのLazy化

Offline RuntimeとProduct schemaを未認証のapplication graphへ入れたくない場合は、`provideRouteScopedOffline()` を使います。Rootの `provideOffline()` APIと異なり、route-scoped providerは分離されたKit service instanceを作成し、自動では開始しません。そのため、SQLiteまたはIndexedDBをopenする前に、Product側のNative reset recoveryを完了できます。

```ts
import { inject } from '@angular/core';
import type { CanActivateFn, Routes } from '@angular/router';
import { OfflineRouteInitializerService, provideRouteScopedOffline } from '@rdlabo/ionic-angular-kit/offline';

const offlineReadyGuard: CanActivateFn = async () => {
  await recoverProductOwnedLocalReset();
  await inject(OfflineRouteInitializerService).initialize();
  return true;
};

export const routes: Routes = [
  {
    path: '',
    providers: [provideRouteScopedOffline(options)],
    canActivate: [offlineReadyGuard],
    children: [
      {
        path: '',
        canActivate: [authorizedGuard],
        loadComponent: () => import('./authenticated.page').then((module) => module.AuthenticatedPage),
      },
    ],
  },
];
```

Authorizationが初期化済みOffline Bridgeに依存する場合は、parent/child route boundaryを使います。同じ `canActivate` arrayに宣言したGuard間の順序には依存しないでください。

既存のroot構成には `provideOffline()` を使い続けます。Providerの移動はアプリ設計上の選択であり、新しいAPIを採用するための必須migrationではありません。

### 認証済みContentが表示されるまでRemote処理を遅延する

Route-scoped applicationはactivation pathでLocal substrateだけをopenし、最初の有用なcontentをrenderした後にPull・Outbox transportを再開できます。既存アプリは、次の2つの設定を両方opt-inしない限り、blocking動作を維持します。

```ts
const offlineReadyGuard: CanActivateFn = async () => {
  await inject(OfflineRouteInitializerService).initialize({ remote: 'deferred' });
  return true;
};

createOfflineAuthBridge({
  exchange,
  currentAuthSubject,
  isUnavailableError,
  resumeMode: 'background',
  beforeRemoteResume: () => authenticatedContentReady.wait(),
});
```

`activate` は、Guardがaccessを許可する前にRemote検証済みidentityをinstallしてlease checkします。遅延されるのは `resumeRemoteSession()` だけです。Routeが安全にrenderする前に最初のPullまたはOutbox Replayを必要とする場合は、`resumeMode: 'blocking'` を維持してください。Deep LinkでPrimary Contentがrenderされなくてもtransportを無期限に停止しないよう、readiness promiseには時間制限付きfallbackを含めます。同じboundaryの後では、credential exchangeがLocal Accessへfallbackした場合も含め、必ず `startRemoteRuntime()` を呼びます。これによりNetwork Discoveryがinstallされ、Offline start後も接続回復時にすぐ復帰できます。Fallback timerはLocal Accessが許可された後にだけ開始してください。Local initializerで開始すると、遅いcredential exchangeの途中でRemote Runtimeが起動する可能性があります。

## Realtime接続

`KitRealtimeConnection` を継承し、接続意図と `{ url, protocols }` targetを指定します。Kitがforeground・network suspension、target単位のreconnect、exponential backoff、ping/pong検出、self-echo annotation、`reconnected$` による再同期通知を所有します。

認証情報と安定した `KIT_REALTIME_CLIENT_ID` はURL parameterでなく `kitRealtimeProtocols()` によるWebSocket subprotocolで渡します。Offline対応の認証clientは `requireRemoteAccess: true` を指定し、`none`・`local` modeではsocketを閉じたままにします。

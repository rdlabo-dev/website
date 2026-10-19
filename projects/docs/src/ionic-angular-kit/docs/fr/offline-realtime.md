---
title: "Hors ligne et temps réel"
sourceRevision: "5e84a48a22fa4c38f507893039a06f294e477df21d9fcd00ddec1537901d9115"
---
## Environnement hors ligne à portée limitée

> **Expérimental :** l’ensemble du point d’entrée `@rdlabo/ionic-angular-kit/offline` est expérimental et n’est pas couvert par la garantie de compatibilité SemVer du kit. Ses API publiques, son schéma de persistance et son comportement de synchronisation peuvent subir des changements incompatibles dans une version mineure ou corrective avant leur stabilisation. Si vous l’adoptez, épinglez une version exacte du kit et consultez le guide de migration avant chaque mise à niveau.

Le point d’entrée `/offline` fournit une réplique locale limitée à l’utilisateur et à la partition, une outbox persistante, une récupération de deltas par curseur, un rejeu ordonné par agrégat, des règles de mutation optimiste et une interception selon les règles des requêtes.

Utilisez `mode: 'readCacheOnly'` pour les caches de sources externes ou HTTP. Le mode synchronisé utilise `@capacitor-community/sqlite` chiffré sur iOS et Android ; il échoue immédiatement sur le Web, car l’environnement actuel ne dispose pas de verrou de synchronisation entre onglets.

### Installer et fournir l’environnement d’exécution

Fournissez Ionic Storage une fois pour l’infrastructure de stockage du kit. Les installations Web avec cache de lecture l’utilisent également comme dépôt hors ligne. Les applications natives synchronisées gèrent en outre la connexion Community SQLite transmise au kit. L’installation de SQLite et la synchronisation native ci-dessous ne sont requises que pour les applications synchronisées iOS et Android :

```sh
npm install @ionic/storage-angular @capacitor-community/sqlite@^8
npx cap sync
```

La version majeure du plugin SQLite doit correspondre à celle de Capacitor : utilisez `@capacitor-community/sqlite@^7` dans une application Capacitor 7 et `@^8` dans une application Capacitor 8.

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

Enregistrez `offlineInterceptor` avant `kitAuthInterceptor`. Les adaptateurs du produit gèrent les correspondances URL/DTO, les schémas de réplique, le stockage de la clé de chiffrement, les protocoles serveur de récupération et de commande, ainsi que la projection optimiste. Le kit gère la persistance, l’isolation des sessions, l’ordre FIFO, les nouvelles tentatives et la réconciliation. Définissez `databaseEncryption: false` uniquement pour une base native volontairement en clair ; le chiffrement est sinon activé par défaut et nécessite `createEncryptionKey` à la première ouverture.

Pour `mode: 'readCacheOnly'`, omettez les règles de mutation, l’exécuteur de commandes, le récupérateur de réplique et le projecteur d’intentions d’agrégat. Le Web prend en charge ce mode de cache de lecture via Ionic Storage. Le mode Web synchronisé est rejeté jusqu’à ce que son dépôt puisse fournir un verrouillage entre contextes.

```ts
provideOffline({
  mode: 'readCacheOnly',
  databaseName: 'product_cache',
  databaseEncryption: false,
  replicaSchema,
  requestPolicies: [ProductReadPolicy],
});
```

La configuration Web du cache de lecture n’importe ni ne transmet Community SQLite. `databaseEncryption: false` est explicite, car SQLCipher s’applique uniquement au dépôt natif.

L’accès hors ligne au démarrage à froid restaure uniquement un manifeste lié à un sujet non nul du fournisseur d’authentification. Le travail distant suit cet ordre :

1. Préparer la session distante vérifiée.
2. Publier l’accès `remote`.
3. Reprendre la récupération, le rejeu de l’outbox et les tâches en temps réel.

`createOfflineAuthBridge()` relie cet ordre à `provideKitAuth()` tout en laissant le consentement, l’interface d’erreur et l’échange d’identifiants dans l’application.

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

Lors d’une déconnexion explicite, effacez d’abord `KitAuthAccessService`, puis attendez le nettoyage de la session hors ligne : les baux en cours sont ainsi invalidés avant la suppression des données utilisateur persistantes.

### Stratégies de requêtes de lecture

Un `OfflineRequestPolicy` résout une requête GET correspondante en `kind: 'read'`, une fonction `readLocal()` et une fonction partagée facultative `projectResponse()`. `readStrategy` détermine comment le résultat est fourni :

| Stratégie        | Comportement                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `network-first` | Par défaut. Utilise d’abord le transport, puis se replie sur la réponse locale en cas d’erreur de transport hors ligne ou indisponible.                                   |
| `local-first`   | Lance les tâches locales et distantes ensemble, émet d’abord une réponse locale utilisable, puis la revalidation distante.                                      |
| `fastest-first` | Émet la première réponse utilisable disponible. Si la réponse locale arrive en premier, elle est suivie d’une revalidation distante ; si la réponse distante arrive en premier, elle annule la lecture locale plus lente. |
| `local-only`    | Ne lance jamais le transport HTTP. Utilisez cette stratégie pour les identités provisoires qui ne peuvent pas exister à distance.                                                       |

`local-first` et un `fastest-first` remporté par la lecture locale peuvent émettre deux fois. Gardez l’observable HTTP abonné pendant la revalidation ; `firstValueFrom()` et `take(1)` annulent le transport après la première émission. Utilisez `offlineReadEmission()` et `shouldCommitOfflineCollection()` lorsque l’état de l’interface doit distinguer une collection distante complète d’un instantané local vide et incomplet.

`projectResponse(response, source)` s’exécute pour les réponses distantes comme locales. Ne persistez les données que lorsque `source === 'remote'`. Définissez `serializeResponseProjection: true` lorsque le projecteur effectue une dérivation en lecture seule qui doit attendre les mutations de la réplique. Ne l’activez pas si le projecteur lance lui-même une mutation de réplique ; utilisez plutôt `OfflineSyncService.runSerializedReplicaMutation()` pour une séquence lecture/dérivation/écriture.

### Mutations persistantes et créations immédiates avec identifiant généré

Les règles de mutation préparent le `HttpResponse` optimiste ; l’implémentation du produit doit mettre l’intention persistante correspondante en file avant de le renvoyer. `enqueue()` génère un UUID par défaut. Fournissez un `commandId` stable lorsque le code du produit doit associer l’intention persistante aux tâches environnantes ou envoyer immédiatement une nouvelle identité générée. Le kit conserve cet identifiant lors des nouvelles tentatives de transport.

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

Le deuxième argument est de type `OfflineGeneratedCommandLocator`. `sendGeneratedCommandNow()` est volontairement limité à la première intention en attente d’un nouvel agrégat généré, sans état de référence confirmé ni identifiant distant. Il omet la récupération normale avant envoi et valide l’accusé de réception local. Lorsqu’il obtient un identifiant distant confirmé, il programme en arrière-plan une réconciliation par récupération faisant autorité. Il renvoie `null` si le transport est indisponible ou si aucun identifiant confirmé n’est produit. Un résultat terminal `blocked_auth`, `rejected` ou `conflict` déclenche `OfflineImmediateCommandRejectedError`. Les agrégats existants et les intentions suivantes doivent utiliser `flush()` afin de conserver la barrière de conflit avant récupération.

Les charges utiles des commandes doivent être sérialisables en JSON sans perte. Les identifiants de commande gérés par l’appelant doivent contenir de 1 à 255 caractères et ne doivent pas être réutilisés pendant la période de conservation de l’idempotence de l’application et du serveur. Le kit ne peut rejeter que les collisions avec les commandes encore conservées localement ; le serveur peut continuer à dédupliquer un identifiant réutilisé après la réconciliation et la suppression de sa commande locale.

### Périmètre de cohérence du dépôt

Considérez `OfflineSyncService` comme le responsable des mutations du produit. Pour une opération lecture/dérivation/écriture du produit, utilisez `runSerializedReplicaMutation()`. Dans son callback, utilisez uniquement le dépôt fourni et terminez l’écriture avec son `transactReplica()` ; ne lancez pas de mutation `OfflineSyncService` imbriquée ni un autre axe de coordination. Validez ensemble les lignes de réplique, les commandes Outbox, les curseurs et les changements de points d’attention de récupération dans cette transaction.

Pour un instantané en lecture seule à plusieurs requêtes, utilisez `repository.runReadSnapshot()` et effectuez toutes les lectures avec le lecteur fourni. Ne modifiez pas le dépôt et n’imbriquez pas un autre `runReadSnapshot()` dans ce callback. Les méthodes directes du dépôt `replaceCommand()`, `removeCommand()`, `putPullAttention()` et `removePullAttention()` sont obsolètes ; utilisez les champs correspondants `putCommands`, `removeCommandIds`, `putPullAttentions` et `removePullAttentions` de `transactReplica()`.

### Routes authentifiées à chargement différé

Utilisez `provideRouteScopedOffline()` lorsque l’environnement hors ligne et le schéma du produit doivent rester hors du
graphe de l’application non authentifiée. Contrairement à l’API racine `provideOffline()`, le fournisseur limité à la route
crée des instances isolées des services du kit sans les démarrer automatiquement. Le produit peut ainsi
terminer la récupération après une réinitialisation native avant d’ouvrir SQLite ou IndexedDB.

```ts
import { inject } from '@angular/core';
import type { CanActivateFn, Routes } from '@angular/router';
import { OfflineRouteInitializerService, provideRouteScopedOffline } from '@rdlabo/ionic-angular-kit/offline';

const offlineReadyGuard: CanActivateFn = async () => {
  const offlineRouteInitializer = inject(OfflineRouteInitializerService);
  await recoverProductOwnedLocalReset();
  await offlineRouteInitializer.initialize();
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

Utilisez une séparation entre routes parent et enfant si l’autorisation dépend du pont hors ligne initialisé. Ne
comptez pas sur l’ordre des gardes déclarés dans un même tableau `canActivate`.

Conservez `provideOffline()` pour les installations racines existantes. Déplacer un fournisseur relève de la conception de l’application ;
l’adoption de la nouvelle API n’est pas une migration obligatoire.

### Différer les tâches distantes jusqu’à l’affichage du contenu authentifié

Les applications limitées à la route peuvent ouvrir uniquement le socle local pendant l’activation, puis reprendre
la récupération et le transport Outbox après l’affichage de leur premier contenu utile. Les applications existantes conservent
le comportement bloquant sauf si elles choisissent explicitement les deux paramètres ci-dessous.

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

`activate` installe toujours l’identité vérifiée à distance et contrôle son bail avant que le garde n’accorde
l’accès. Seul `resumeRemoteSession()` est différé. Conservez `resumeMode: 'blocking'` si la route nécessite
la première récupération ou le rejeu Outbox avant de pouvoir s’afficher en toute sécurité. Une promise de disponibilité doit prévoir
un repli borné afin qu’un lien direct ne présentant pas le contenu principal ne suspende pas le transport
indéfiniment. Appelez toujours `startRemoteRuntime()` après cette même étape, y compris lorsque
l’échange d’identifiants se replie sur l’accès local. Cela active la détection du réseau afin qu’un démarrage hors ligne
puisse récupérer immédiatement au retour de la connexion. Ne démarrez le temporisateur de repli qu’une fois l’accès local
accordé ; le démarrer dans l’initialiseur local peut lancer l’environnement distant alors qu’un échange d’identifiants lent
est encore en cours.

## Connexion en temps réel

Étendez `KitRealtimeConnection` pour fournir l’intention de connexion et les cibles `{ url, protocols }`. Le kit gère la suspension liée au premier plan et au réseau, la reconnexion par cible, le délai exponentiel, la détection ping/pong, l’annotation des échos de ses propres messages et le signal de resynchronisation `reconnected$`.

Utilisez `kitRealtimeProtocols()` pour transporter l’authentification et le `KIT_REALTIME_CLIENT_ID` stable dans les sous-protocoles WebSocket plutôt que dans les paramètres d’URL. Les clients authentifiés compatibles hors ligne définissent `requireRemoteAccess: true` ; les sockets restent alors fermés dans les modes `none` et `local`.

## Générations de stockage jetables

`OfflineStorageLifecycle` est une alternative explicite au maintien de migrations incrémentales des données locales. Il ne modifie pas le protocole réseau et ne réinitialise jamais le stockage en réaction à une erreur générique. Les produits doivent l’activer avec `discardPendingCommands: true` : toute la réplique configurée, les curseurs, les instantanés locaux et l’Outbox non envoyée sont jetables. L’authentification et les préférences sans rapport restent hors des cibles de nettoyage. Le repeuplement nécessite une connexion.

Créez une instance de cycle de vie pour le démarrage et transmettez cette même instance comme `storageLifecycle` à `provideOffline` / `provideRouteScopedOffline`. Attendez `prepare()` avant de construire les services du produit qui ouvrent la base. Kit conditionne également l’initialisation du dépôt à cette instance. `reload-required` n’autorise pas l’ouverture du dépôt : affichez l’interface de réinitialisation/mise à jour du produit, appelez `requestRebuildAfterBootstrap(waitUntilReady, location)` et ne reprenez qu’après un redémarrage à froid. Le hook `beforeCleanup` peut signaler la disponibilité de Live Update avant une suppression lente des fichiers natifs. Kit ne dépend pas du plugin Live Update et ne fournit ni messages ni navigation du produit.

Le point d’entrée léger `@rdlabo/ionic-angular-kit/offline/storage-generation` exporte `inspectOfflineStorageGeneration` pour les gardes de démarrage, sans charger immédiatement le runtime hors ligne. Les valeurs de génération et les clés des marqueurs appartiennent au produit. SeatKeep conserve son identité `OFFLINE_SCHEMA_VERSION:schemaHash` ; Winecode conserve la génération `4` et ses clés existantes. Des marqueurs correspondants sont acceptés sans suppression de données ni réinitialisation imposée uniquement pour une migration. Une modification du schéma local doit changer la génération configurée ; elle ne doit pas changer `wireProtocol` sauf si le contrat serveur lui-même est incompatible. Conserver une génération numérique explicite impose au produit de l’incrémenter lorsque la structure de son stockage local change.

Les cibles natives ne répertorient que les bases compatibles avec le cycle de vie existant des connexions de réinitialisation ; `additionalCleanup` prend en charge les autres bases et fichiers multimédias. Une réinitialisation en attente survit à l’échec de suppression, à l’échec du marqueur de fin et à l’interruption du nettoyage. L’achèvement n’est enregistré qu’après la réussite de tout le nettoyage. Le mode différé peut adopter une nouvelle installation sans rechargement lorsqu’aucune base cible n’existe. Les API existantes de réinitialisation manuelle et de migration du chiffrement restent disponibles et conservent leur comportement.

Les cibles Web nécessitent Web Locks (contexte sécurisé). Tous les runtimes coopérants utilisent un verrou commun à l’origine pour l’espace de noms `offline:` existant : préparation et écritures exclusives, lectures partagées. Le dépôt valide la génération et une révision de réinitialisation sous le verrou. Un runtime obsolète lève `OfflineStorageGenerationChangedError` avant de toucher les données reconstruites, y compris après une réinitialisation manuelle de la même génération. Le produit doit recharger ce runtime. L’absence de Web Locks provoque un échec avant toute suppression ; il n’existe pas de repli non sûr par onglet. Les clients déjà distribués sans ce protocole ne peuvent pas être isolés par la nouvelle bibliothèque ; leurs anciens onglets doivent être remplacés ou rechargés lors du déploiement.

Commandes de validation :

- `npm test -- --project kit --include='../offline/src/lib/offline-storage-lifecycle.spec.ts'`
- `npm run test:storage-lifecycle:browser` (Chromium sans interface, deux pages de la même origine)

Le test navigateur exécute le cycle de vie réel avec Web Locks et un petit adaptateur localStorage. Les tests d’intégration du dépôt couvrent séparément la frontière KitStorageService et les lectures/écritures des dépôts obsolètes.

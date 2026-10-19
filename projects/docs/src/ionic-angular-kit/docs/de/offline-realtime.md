---
title: "Offline und Echtzeit"
sourceRevision: "5e84a48a22fa4c38f507893039a06f294e477df21d9fcd00ddec1537901d9115"
---
## Bereichsgebundene Offline-Laufzeit

> **Experimentell:** Der gesamte Einstiegspunkt `@rdlabo/ionic-angular-kit/offline` ist experimentell und fällt nicht unter die SemVer-Kompatibilitätsgarantie des Kits. Seine öffentlichen APIs, das Persistenzschema und das Synchronisierungsverhalten können sich vor der Stabilisierung auch in einem Minor- oder Patch-Release inkompatibel ändern. Verwenden Sie bei der Einführung eine exakt festgelegte Kit-Version und prüfen Sie vor jedem Upgrade die Migrationsanleitung.

Der Einstiegspunkt `/offline` stellt ein benutzer- und partitionsgebundenes lokales Replikat, eine dauerhafte Outbox, cursorbasierten Delta-Abruf, nach Aggregaten geordnete Wiederholung, Richtlinien für optimistische Änderungen und einen Anfragerichtlinien-Interceptor bereit.

Verwenden Sie `mode: 'readCacheOnly'` für Caches externer Quellen oder HTTP-Caches. Der synchronisierte Modus verwendet unter iOS und Android verschlüsseltes `@capacitor-community/sqlite`. Im Web bricht er frühzeitig ab, da die aktuelle Laufzeit keine tabübergreifende Synchronisierungssperre besitzt.

### Die Laufzeit installieren und bereitstellen

Stellen Sie Ionic Storage einmal für die Speicherinfrastruktur des Kits bereit. Webinstallationen für den Lesecache verwenden es auch als Offline-Repository. Native synchronisierte Anwendungen verwalten zusätzlich die an das Kit übergebene Community-SQLite-Verbindung. Die folgende SQLite-Installation und native Synchronisierung sind nur für synchronisierte iOS- und Android-Anwendungen erforderlich:

```sh
npm install @ionic/storage-angular @capacitor-community/sqlite@^8
npx cap sync
```

Die SQLite-Plugin-Hauptversion muss zu Capacitor passen: Verwenden Sie `@capacitor-community/sqlite@^7` in einer Capacitor-7-Anwendung und `@^8` in einer Capacitor-8-Anwendung.

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

Registrieren Sie `offlineInterceptor` vor `kitAuthInterceptor`. Produktadapter sind für URL- und DTO-Zuordnung, Replikatschemas, Speicherung der Verschlüsselungsschlüssel, serverseitige Pull-/Befehlsprotokolle und optimistische Projektion zuständig. Das Kit übernimmt Persistenz, Sitzungsisolierung, FIFO-Reihenfolge, Wiederholungsversuche und Abgleich. Setzen Sie `databaseEncryption: false` nur für eine bewusst unverschlüsselte native Datenbank; andernfalls ist Verschlüsselung der Standard und erfordert beim ersten Öffnen `createEncryptionKey`.

Bei `mode: 'readCacheOnly'` lassen Sie Änderungsrichtlinien, Befehlsausführung, Replikatsabruf und den Projektor für Aggregatabsichten weg. Das Web unterstützt diesen Lesecachemodus über Ionic Storage. Der synchronisierte Webmodus wird abgelehnt, bis das Repository eine kontextübergreifende Sperrung bereitstellen kann.

```ts
provideOffline({
  mode: 'readCacheOnly',
  databaseName: 'product_cache',
  databaseEncryption: false,
  replicaSchema,
  requestPolicies: [ProductReadPolicy],
});
```

Die Web-Lesecache-Konfiguration importiert oder übergibt Community SQLite nicht. `databaseEncryption: false` wird ausdrücklich gesetzt, da SQLCipher nur für das native Repository gilt.

Offline-Zugriff nach einem Kaltstart stellt nur ein Manifest wieder her, das an eine nicht-null Subjektkennung des Authentifizierungsproviders gebunden ist. Remote-Vorgänge folgen dieser Reihenfolge:

1. Die verifizierte Remote-Sitzung vorbereiten.
2. Den Zugriff `remote` veröffentlichen.
3. Pull, Outbox-Wiederholung und Echtzeitvorgänge fortsetzen.

`createOfflineAuthBridge()` verbindet diese Reihenfolge mit `provideKitAuth()`, während Einwilligung, Fehleroberfläche und Austausch von Zugangsdaten in der App verbleiben.

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

Bei expliziter Abmeldung leeren Sie zuerst `KitAuthAccessService` und warten anschließend auf die Bereinigung der Offline-Sitzung, damit laufende Freigaben ungültig werden, bevor gespeicherte Nutzerdaten entfernt werden.

### Strategien für Leseanfragen

Eine `OfflineRequestPolicy` löst eine passende GET-Anfrage in `kind: 'read'`, eine Funktion `readLocal()` und eine optionale gemeinsam genutzte Funktion `projectResponse()` auf. `readStrategy` steuert den Abschluss:

| Strategie        | Verhalten                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `network-first` | Standard. Versucht zuerst den Transport und fällt bei einem Offline- oder Nichtverfügbarkeitsfehler des Transports auf die lokale Antwort zurück.                                   |
| `local-first`   | Startet lokale und Remote-Vorgänge gemeinsam, liefert zuerst eine nutzbare lokale Antwort und anschließend die Remote-Neuvalidierung.                                      |
| `fastest-first` | Liefert die nutzbare Antwort, die zuerst abgeschlossen wird. Gewinnt die lokale Antwort, folgt eine Remote-Neuvalidierung; gewinnt die Remote-Antwort, wird der langsamere lokale Lesevorgang abgebrochen. |
| `local-only`    | Startet niemals den HTTP-Transport. Für vorläufige Identitäten verwenden, die remote nicht existieren können.                                                       |

`local-first` und ein lokal gewinnendes `fastest-first` können zweimal Werte liefern. Lassen Sie das HTTP-Observable bis zum Ende der Neuvalidierung abonniert; `firstValueFrom()` und `take(1)` brechen den Transport nach der ersten Ausgabe ab. Verwenden Sie `offlineReadEmission()` und `shouldCommitOfflineCollection()`, wenn der UI-Zustand zwischen einer vollständigen Remote-Sammlung und einer unvollständigen leeren lokalen Momentaufnahme unterscheiden muss.

`projectResponse(response, source)` wird für Remote- und lokale Antworten ausgeführt. Persistieren Sie nur bei `source === 'remote'`. Setzen Sie `serializeResponseProjection: true`, wenn der Projektor ausschließlich lesend Daten ableitet und hinter Replikatsänderungen warten muss. Aktivieren Sie diese Option nicht, wenn der Projektor selbst eine Replikatsänderung startet; verwenden Sie für eine Lesen-/Ableiten-/Schreiben-Folge stattdessen `OfflineSyncService.runSerializedReplicaMutation()`.

### Dauerhafte Änderungen und sofortiges Erstellen generierter Aggregate

Änderungsrichtlinien bereiten die optimistische `HttpResponse` vor. Die Produktimplementierung sollte die zugehörige dauerhafte Änderungsabsicht vor der Rückgabe in die Queue stellen. `enqueue()` erzeugt standardmäßig eine UUID. Geben Sie eine stabile `commandId` an, wenn der Produktcode die dauerhafte Absicht mit umliegenden Vorgängen verknüpfen oder eine neu erstellte generierte Identität sofort senden muss. Das Kit behält diese Kennung bei Wiederholungsversuchen des Transports bei.

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

Das zweite Argument hat den Typ `OfflineGeneratedCommandLocator`. `sendGeneratedCommandNow()` ist bewusst auf die erste ausstehende Absicht eines neuen generierten Aggregats ohne bestätigten Ausgangszustand oder Remote-ID begrenzt. Die Methode überspringt den gewöhnlichen Pull vor dem Senden und bestätigt die lokale Quittierung. Sobald eine bestätigte Remote-ID vorliegt, wird im Hintergrund ein maßgeblicher Pull-Abgleich eingeplant. Sie gibt `null` zurück, wenn der Transport nicht verfügbar ist oder keine bestätigte Kennung entsteht. Ein endgültiges Ergebnis `blocked_auth`, `rejected` oder `conflict` löst `OfflineImmediateCommandRejectedError` aus. Bestehende Aggregate und spätere Absichten müssen `flush()` verwenden, damit die Konfliktsperre vor dem Pull erhalten bleibt.

Befehlspayloads müssen verlustfrei als JSON serialisierbar sein. Vom Aufrufer verwaltete Befehlskennungen müssen 1–255 Zeichen enthalten und dürfen innerhalb des Idempotenz-Aufbewahrungszeitraums der Anwendung bzw. des Servers nicht erneut verwendet werden. Das Kit kann nur Kollisionen mit noch lokal gespeicherten Befehlen ablehnen. Der Server kann eine wiederverwendete Kennung weiterhin deduplizieren, nachdem ihr lokaler Befehl bereits abgeglichen und entfernt wurde.

### Konsistenzgrenze des Repositorys

Betrachten Sie `OfflineSyncService` als zuständige Instanz für Produktänderungen. Verwenden Sie für einen produktbezogenen Lesen-/Ableiten-/Schreiben-Vorgang `runSerializedReplicaMutation()`. Nutzen Sie im Callback ausschließlich das übergebene Repository und schließen Sie den Schreibvorgang mit dessen `transactReplica()` ab. Starten Sie weder eine verschachtelte `OfflineSyncService`-Änderung noch eine weitere Koordinator-Spur. Bestätigen Sie Replikatszeilen, Outbox-Befehle, Cursor und Änderungen an Pull-Aufmerksamkeitsmarkierungen gemeinsam in dieser Transaktion.

Für eine nur lesende Momentaufnahme über mehrere Abfragen verwenden Sie `repository.runReadSnapshot()` und führen alle Lesezugriffe über den übergebenen Reader aus. Verändern Sie das Repository in diesem Callback nicht und verschachteln Sie darin kein weiteres `runReadSnapshot()`. Die direkten Repository-Methoden `replaceCommand()`, `removeCommand()`, `putPullAttention()` und `removePullAttention()` sind veraltet. Verwenden Sie stattdessen die entsprechenden Felder `putCommands`, `removeCommandIds`, `putPullAttentions` und `removePullAttentions` von `transactReplica()`.

### Verzögert geladene authentifizierte Routen

Verwenden Sie `provideRouteScopedOffline()`, wenn die Offline-Laufzeit und das Produktschema nicht in den
Graphen der unauthentifizierten Anwendung gelangen dürfen. Anders als die Root-API `provideOffline()` erzeugt der routengebundene Provider
isolierte Kit-Serviceinstanzen und startet sie nicht automatisch. So kann das Produkt
die Wiederherstellung nach einem nativen Reset abschließen, bevor SQLite oder IndexedDB geöffnet wird.

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

Verwenden Sie eine Grenze zwischen Eltern- und Kindroute, wenn die Autorisierung von der initialisierten Offline-Bridge abhängt.
Verlassen Sie sich nicht auf die Reihenfolge von Guards im selben `canActivate`-Array.

Behalten Sie `provideOffline()` für bestehende Root-Installationen bei. Das Verschieben eines Providers ist eine
Entwurfsentscheidung der Anwendung; die Einführung der neuen API ist keine verpflichtende Migration.

### Remote-Vorgänge verschieben, bis authentifizierte Inhalte sichtbar sind

Routengebundene Anwendungen können auf dem Aktivierungspfad ausschließlich die lokale Grundlage öffnen und
Pull sowie Outbox-Transport erst fortsetzen, nachdem ihre ersten nutzbaren Inhalte gerendert wurden. Bestehende Anwendungen behalten
das blockierende Verhalten bei, solange sie nicht beide folgenden Einstellungen ausdrücklich aktivieren.

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

`activate` installiert und prüft weiterhin die Freigabe der remote verifizierten Identität, bevor der Guard
Zugriff gewährt. Nur `resumeRemoteSession()` wird verschoben. Behalten Sie `resumeMode: 'blocking'` bei, wenn die Route
den ersten Pull oder die erste Outbox-Wiederholung benötigt, bevor sie sicher gerendert werden kann. Ein Bereitschafts-Promise sollte eine
zeitlich begrenzte Ausweichlösung enthalten, damit ein Deep Link, der den primären Inhalt nicht rendert, den Transport nicht
unbegrenzt aussetzt. Rufen Sie `startRemoteRuntime()` immer nach derselben Grenze auf, auch wenn der
Austausch der Zugangsdaten auf lokalen Zugriff zurückfällt. Dadurch wird die Netzwerkerkennung eingerichtet, sodass ein Offline-Start
sich sofort erholen kann, wenn die Verbindung zurückkehrt. Starten Sie den Fallback-Timer erst, nachdem lokaler Zugriff
gewährt wurde. Wird er im lokalen Initialisierer gestartet, kann die Remote-Laufzeit beginnen, während ein langsamer
Austausch der Zugangsdaten noch aussteht.

## Echtzeitverbindung

Leiten Sie eine Klasse von `KitRealtimeConnection` ab, um Verbindungsabsicht und Ziele in Form von `{ url, protocols }` bereitzustellen. Das Kit übernimmt Aussetzungen aufgrund von Vordergrund- und Netzwerkzuständen, zielgebundene Wiederverbindungen, exponentielle Wartezeiten, Ping-/Pong-Erkennung, Kennzeichnung eigener Echos und die Neusynchronisierungssignale von `reconnected$`.

Verwenden Sie `kitRealtimeProtocols()`, um Authentifizierung und die stabile `KIT_REALTIME_CLIENT_ID` in WebSocket-Subprotokollen statt in URL-Parametern zu übertragen. Offline-fähige authentifizierte Clients setzen `requireRemoteAccess: true`; Sockets bleiben dann in den Modi `none` und `local` geschlossen.

## Verwerfbare Speichergenerationen

`OfflineStorageLifecycle` ist eine ausdrückliche Alternative zum Beibehalten inkrementeller lokaler Datenmigrationen. Es ändert das Übertragungsprotokoll nicht und setzt Speicher niemals als Reaktion auf einen allgemeinen Fehler zurück. Produkte müssen dies mit `discardPendingCommands: true` aktivieren: Die gesamte konfigurierte Replik, Cursor, lokale Snapshots und die ungesendete Outbox sind verwerfbar. Authentifizierung und unabhängige Einstellungen bleiben außerhalb der Bereinigungsziele. Die erneute Befüllung benötigt eine Verbindung.

Erstellen Sie eine Lebenszyklusinstanz für den Start und übergeben Sie dieselbe Instanz als `storageLifecycle` an `provideOffline` / `provideRouteScopedOffline`. Warten Sie auf `prepare()`, bevor Sie Produktdienste erstellen, die die Datenbank öffnen. Kit steuert auch die Repository-Initialisierung über diese Instanz. `reload-required` erlaubt nicht das Öffnen des Repositorys: Zeigen Sie die Rücksetz-/Update-Oberfläche des Produkts, rufen Sie `requestRebuildAfterBootstrap(waitUntilReady, location)` auf und setzen Sie erst nach einem Kaltstart fort. Der Hook `beforeCleanup` kann die Bereitschaft von Live Update vor langsamer nativer Dateilöschung bestätigen. Kit hängt nicht vom Plugin Live Update ab und liefert keine Produktmeldungen oder Navigation.

Der schlanke Einstiegspunkt `@rdlabo/ionic-angular-kit/offline/storage-generation` exportiert `inspectOfflineStorageGeneration` für Start-Guards, ohne die Offline-Laufzeit frühzeitig zu laden. Generationswerte und Markerschlüssel gehören dem Produkt. SeatKeep behält seine Identität `OFFLINE_SCHEMA_VERSION:schemaHash`; Winecode behält Generation `4` und seine bisherigen Schlüssel. Übereinstimmende Marker werden akzeptiert, ohne Daten zu löschen oder allein für eine Migration ein Zurücksetzen zu erzwingen. Lokale Schemaänderungen müssen die konfigurierte Generation ändern; sie dürfen `wireProtocol` nur ändern, wenn der Serververtrag selbst inkompatibel ist. Bei einer expliziten numerischen Generation muss das Produkt diese erhöhen, sobald sich seine lokale Speicherstruktur ändert.

Native Ziele listen nur Datenbanken auf, die mit dem bestehenden Verbindungslebenszyklus beim Zurücksetzen kompatibel sind; `additionalCleanup` übernimmt andere Datenbanken und Mediendateien. Ein ausstehendes Zurücksetzen überlebt Löschfehler, Fehler beim Abschlussmarker und unterbrochene Bereinigung. Der Abschluss wird erst nach vollständig erfolgreicher Bereinigung vermerkt. Der verzögerte Modus kann eine Neuinstallation ohne Neuladen übernehmen, wenn keine Zieldatenbank existiert. Bestehende APIs zum manuellen Zurücksetzen und zur Verschlüsselungsmigration bleiben verfügbar und behalten ihr Verhalten.

Web-Ziele benötigen Web Locks (sicherer Kontext). Alle kooperierenden Laufzeiten verwenden eine ursprungsweite Sperre für den bestehenden Namensraum `offline:`: Vorbereitung und Schreiben exklusiv, Lesen gemeinsam. Das Repository prüft Generation und Rücksetzrevision unter dieser Sperre. Eine veraltete Laufzeit löst `OfflineStorageGenerationChangedError` aus, bevor sie neu aufgebaute Daten berührt, auch nach einem manuellen Zurücksetzen derselben Generation. Das Produkt sollte diese Laufzeit neu laden. Ohne Web Locks schlägt der Vorgang vor jeder Löschung fehl; es gibt keinen unsicheren tabweisen Rückfall. Bereits ausgelieferte Clients ohne dieses Protokoll können durch die neue Bibliothek nicht abgeschirmt werden; alte Tabs müssen beim Rollout ersetzt oder neu geladen werden.

Validierungsbefehle:

- `npm test -- --project kit --include='../offline/src/lib/offline-storage-lifecycle.spec.ts'`
- `npm run test:storage-lifecycle:browser` (Headless-Chromium, zwei Seiten desselben Ursprungs)

Der Browsertest führt den tatsächlichen Lebenszyklus mit Web Locks und einem kleinen localStorage-Adapter aus. Repository-Integrationstests prüfen separat die KitStorageService-Grenze sowie Lese- und Schreibzugriffe veralteter Repositorys.

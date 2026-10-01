---
title: "Erste Schritte"
sourceRevision: "b94cfb0b0be588f8e56e5070052f1dd0662314ba1086778ba79f5a3a15216d15"
---
<p align="center"><br><img src="https://user-images.githubusercontent.com/236501/85893648-1c92e880-b7a8-11ea-926d-95355b8175c7.png" width="128" height="128" /></p>
<h3 align="center">Facebook Login</h3>
<p align="center"><strong><code>@capacitor-community/facebook-login</code></strong></p>
<p align="center">
  Capacitor-Community-Plugin für natives Facebook Login.
</p>

<!-- rdlabo-docs-omit -->
<p align="center">
  <strong><a href="https://docs.rdlabo.dev/projects/capacitor-facebook-login">Read the full documentation</a></strong>
</p>
<!-- /rdlabo-docs-omit -->

<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2026?style=flat-square" />
  <a href="https://www.npmjs.com/package/@capacitor-community/facebook-login"><img src="https://img.shields.io/npm/l/@capacitor-community/facebook-login?style=flat-square" /></a>
<br>
  <a href="https://www.npmjs.com/package/@capacitor-community/facebook-login"><img src="https://img.shields.io/npm/dw/@capacitor-community/facebook-login?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor-community/facebook-login"><img src="https://img.shields.io/npm/v/@capacitor-community/facebook-login?style=flat-square" /></a>
</p>

## Maintainer

| Maintainer          | GitHub                              | Soziale Netzwerke                                | Website                               |
| ------------------- | ----------------------------------- | ------------------------------------- | ------------------------------------- |
| Masahiko Sakakibara | [rdlabo](https://github.com/rdlabo) | [@rdlabo](https://twitter.com/rdlabo) | [rdlabo.dev](https://rdlabo.dev/) |

Wartungsstatus: Wird aktiv gepflegt

## Mitwirkende ✨

<a href="https://github.com/capacitor-community/facebook-login/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=capacitor-community/facebook-login" />
</a>

Erstellt mit [contributors-img](https://contrib.rocks).

## Demo

[Den Demo-Quellcode finden Sie hier.](./demo/angular)

## Überblick

Capacitor-Community-Plugin für Facebook Login und Facebook App Events unter Android, iOS und im Web. Es kapselt die nativen Meta-SDKs unter Android und iOS sowie das Facebook JavaScript SDK im Web.

## Installation

Dieses Plugin richtet sich an Capacitor 8, iOS ab 15 und Android API ab 24. Es deklariert die nativen Facebook-SDK-Abhängigkeiten sowohl für CocoaPods als auch für Swift Package Manager.

```bash
npm install @capacitor-community/facebook-login
npx cap sync
```

Installieren Sie die Plugin-Hauptversion, die zu Ihrer Capacitor-Hauptversion passt.

| Capacitor | Plugin |
| --------- | ------ |
| 8         | 8.x    |
| 7         | 7.x    |
| 6         | 6.x    |

Schließen Sie vor dem Aufruf des Plugins die erforderliche native und Web-Einrichtung unter [Konfiguration](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/configuration) ab.

## Die erste Anmeldung mit E-Mail-Berechtigung

Rufen Sie nach [Installation](/docs/readme#installation) und [Konfiguration](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/configuration) login aus einer Nutzeraktion wie einem Schaltflächenklick auf. Fordern Sie für die erste Prüfung ausschließlich `email` an:

```ts
import { FacebookLogin } from '@capacitor-community/facebook-login';

async function onLoginClick() {
  const result = await FacebookLogin.login({ permissions: ['email'] });

  if (result.accessToken) {
    console.log('Facebook login succeeded.');
  } else {
    console.log('Facebook login canceled or returned no token.');
  }
}
```

Erwartetes Ergebnis: Bei Erfolg wird mit einem Objekt `accessToken` aufgelöst. Protokollieren Sie die rohe Token-Zeichenfolge nicht. Ein Abbruch unter Android und iOS wird ohne Token aufgelöst. Im Web wird eine fehlgeschlagene Anmeldung stattdessen zurückgewiesen.

iOS Limited Login gibt ein OIDC-Authentifizierungstoken (JWT) zurück, kein Graph-API-Zugriffstoken. Ein Profilabruf über Graph benötigt andere Token-Voraussetzungen. Siehe [Authentifizierung](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/authentication).

## Dokumentation

Beginnen Sie mit [Konfiguration](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/configuration) und verwenden Sie anschließend die Anleitung für die implementierte Funktion. Methodensignaturen und generierte Typinformationen stehen weiterhin im folgenden [API](/docs/api)-Abschnitt.

- [Konfiguration](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/configuration) — Meta-App-Einstellungen und Android-, iOS-
  sowie Web-SDK-Einrichtung.
- [Authentifizierung](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/authentication) — Anmeldung, Abmeldung, aktuelle Tokens,
  Profilfelder, erneute Autorisierung und Plattformunterschiede.
- [App Events](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/app-events) — eigene Ereignisse, Parameter, automatische Ereignis-
  protokollierung und Einstellungen für Werbetreibende.

<!-- rdlabo-docs-omit -->

## Kanäle für Vorabversionen

Ein offener Pull Request, der kein Entwurf ist, kann unter dem npm-Dist-Tag `beta` veröffentlicht werden, nachdem seine Workflows `Validation` und `Package Candidate` erfolgreich abgeschlossen wurden. Ein Repository-Eigentümer oder Maintainer muss einen Kommentar hinzufügen, dessen vollständiger Inhalt lautet:

```text
/beta
```

Die Anforderung autorisiert ausschließlich den Head-SHA des Pull Requests zum Zeitpunkt des Kommentars. Der Workflow prüft Eigentümer- oder Maintainer-Berechtigung und Head-SHA unmittelbar vor der Veröffentlichung erneut. Jeder neue Commit benötigt erneut erfolgreiche CI und einen neuen `/beta`-Kommentar eines Eigentümers oder Maintainers. Fork-Pull-Requests werden unterstützt. Pull Requests, die einen Workflow zur Freigabe von Veröffentlichungen ändern, können erst als Beta veröffentlicht werden, nachdem diese Änderungen in `main` angekommen sind.

Beta-Versionen verwenden `<base>-beta.pr<PR number>.sha<12-character SHA>`. Der Kandidat wird in einem schreibgeschützten Workflow ohne npm-Veröffentlichungszugangsdaten gebaut. Der privilegierte Release-Workflow veröffentlicht nur das validierte unveränderliche Paketartefakt mit deaktivierten Lebenszyklusskripten. Ein Benachrichtigungsfehler kann eine erfolgreiche npm-Veröffentlichung nicht ungültig machen.

Wird ein Pull Request in `main` gemergt, wird er erst dann automatisch unter `beta` veröffentlicht, wenn die erforderliche CI und `Package Candidate` für genau diesen Merge-Commit erfolgreich sind. Direkte Pushes auf `main` veröffentlichen keinen Kandidaten.

Nur `npm run release` erstellt ein Release-Tag. Stabile Tags `vX.Y.Z` werden unter npm `latest` veröffentlicht; Revisions-/Vorabversions-Tags unter `next`. Weder die Veröffentlichung unter `beta` noch unter `next` verändert den npm-Dist-Tag `latest`.

<!-- /rdlabo-docs-omit -->

## API

<docgen-index>

* [`initialize(...)`](/docs/readme#initialize)
* [`login(...)`](/docs/readme#login)
* [`logout()`](/docs/readme#logout)
* [`reauthorize()`](/docs/readme#reauthorize)
* [`getCurrentAccessToken()`](/docs/readme#getcurrentaccesstoken)
* [`getProfile(...)`](/docs/readme#getprofile)
* [`logEvent(...)`](/docs/readme#logevent)
* [`setAutoLogAppEventsEnabled(...)`](/docs/readme#setautologappeventsenabled)
* [`setAdvertiserTrackingEnabled(...)`](/docs/readme#setadvertisertrackingenabled)
* [`setAdvertiserIDCollectionEnabled(...)`](/docs/readme#setadvertiseridcollectionenabled)
* [Interfaces](/docs/readme#interfaces)
* [Typaliase](/docs/readme#type-aliases)

</docgen-index>

<docgen-api>
<!--Die JSDoc-Kommentare in der Quelldatei aktualisieren und docgen erneut ausführen, um die folgende Dokumentation zu aktualisieren-->

### initialize(...)

```typescript
initialize(options: Partial<FacebookConfiguration>) => Promise<void>
```

Initialisiert das Facebook JavaScript SDK im Web.
Unter Android und iOS, wo das SDK nativ konfiguriert wird, hat dieser Aufruf keine Wirkung.

| Parameter         | Typ                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#partial">Partial</a>&lt;<a href="#facebookconfiguration">FacebookConfiguration</a>&gt;</code> |

--------------------


### login(...)

```typescript
login(options: { permissions: string[]; tracking?: 'limited' | 'enabled'; nonce?: string; }) => Promise<FacebookLoginResponse>
```

Startet den Facebook-Anmeldeablauf mit den angeforderten Berechtigungen.
Eine abgebrochene native Anmeldung wird ohne Token aufgelöst.

| Parameter         | Typ                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------ |
| **`options`** | <code>{ permissions: string[]; tracking?: 'limited' \| 'enabled'; nonce?: string; }</code> |

**Rückgabe:** <code>Promise&lt;<a href="#facebookloginresponse">FacebookLoginResponse</a>&gt;</code>

--------------------


### logout()

```typescript
logout() => Promise<void>
```

Meldet die aktuelle Facebook-Sitzung ab.

--------------------


### reauthorize()

```typescript
reauthorize() => Promise<FacebookLoginResponse>
```

Fordert erneuten Datenzugriff für die aktuelle Facebook-Sitzung an.

**Rückgabe:** <code>Promise&lt;<a href="#facebookloginresponse">FacebookLoginResponse</a>&gt;</code>

--------------------


### getCurrentAccessToken()

```typescript
getCurrentAccessToken() => Promise<FacebookCurrentAccessTokenResponse>
```

Liefert den aktuellen Token. iOS gibt für
Limited Login einen OIDC-Authentifizierungstoken zurück. Native Plattformen lösen den Aufruf bei abgemeldeten Nutzern ohne Token auf;
im Web wird der Aufruf zurückgewiesen, wenn keine verbundene Facebook-Sitzung besteht.

**Rückgabe:** <code>Promise&lt;<a href="#facebookcurrentaccesstokenresponse">FacebookCurrentAccessTokenResponse</a>&gt;</code>

--------------------


### getProfile(...)

```typescript
getProfile<T extends Record<string, unknown>>(options: { fields: readonly string[]; }) => Promise<T>
```

Fragt die ausgewählten Felder vom `/me`-Endpunkt der Facebook Graph API ab.

| Parameter         | Typ                                        |
| ------------- | ------------------------------------------- |
| **`options`** | <code>{ fields: readonly string[]; }</code> |

**Rückgabe:** <code>Promise&lt;T&gt;</code>

--------------------


### logEvent(...)

```typescript
logEvent(options: { eventName: string; parameters?: Record<string, string | number>; }) => Promise<void>
```

Protokolliert ein Facebook App Event mit optionalen String- oder Zahlenparametern.

| Parameter         | Typ                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ eventName: string; parameters?: <a href="#record">Record</a>&lt;string, string \| number&gt;; }</code> |

--------------------


### setAutoLogAppEventsEnabled(...)

```typescript
setAutoLogAppEventsEnabled(options: { enabled: boolean; }) => Promise<void>
```

Aktiviert oder deaktiviert die automatische Protokollierung von App Events auf nativen Plattformen.

| Parameter         | Typ                               |
| ------------- | ---------------------------------- |
| **`options`** | <code>{ enabled: boolean; }</code> |

--------------------


### setAdvertiserTrackingEnabled(...)

```typescript
setAdvertiserTrackingEnabled(options: { enabled: boolean; }) => Promise<void>
```

Aktiviert oder deaktiviert Werbetracking unter iOS.

| Parameter         | Typ                               |
| ------------- | ---------------------------------- |
| **`options`** | <code>{ enabled: boolean; }</code> |

--------------------


### setAdvertiserIDCollectionEnabled(...)

```typescript
setAdvertiserIDCollectionEnabled(options: { enabled: boolean; }) => Promise<void>
```

Aktiviert oder deaktiviert die Erfassung der Werbe-ID auf nativen Plattformen.

| Parameter         | Typ                               |
| ------------- | ---------------------------------- |
| **`options`** | <code>{ enabled: boolean; }</code> |

--------------------


### Interfaces


#### FacebookConfiguration

| Eigenschaft                   | Typ                 | Beschreibung                                                          |
| ---------------------- | -------------------- | -------------------------------------------------------------------- |
| **`appId`**            | <code>string</code>  | Kennung der Meta-Anwendung.                                                 |
| **`autoLogAppEvents`** | <code>boolean</code> | Ob das Web SDK App Events automatisch protokolliert.                   |
| **`xfbml`**            | <code>boolean</code> | Ob das Web SDK XFBML-Social-Plugins verarbeitet.                     |
| **`version`**          | <code>string</code>  | Vom Web SDK verwendete Version der Facebook Graph API. Standardwert: `v26.0`. |
| **`locale`**           | <code>string</code>  | Gebietsschema für das Laden des Web SDK. Standardwert: `en_US`.                |


#### FacebookLoginResponse

| Eigenschaft                             | Typ                                                        | Beschreibung                                          |
| -------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| **`accessToken`**                | <code><a href="#accesstoken">AccessToken</a> \| null</code> | Tokenantwort, sofern die Plattform eine zurückgibt. |
| **`recentlyGrantedPermissions`** | <code>string[]</code>                                       | Bei dieser Anmeldung erteilte Berechtigungen.               |
| **`recentlyDeniedPermissions`**  | <code>string[]</code>                                       | Bei dieser Anmeldung verweigerte Berechtigungen.                |


#### AccessToken

| Eigenschaft                      | Typ                  | Beschreibung                                                                                                                              |
| ------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **`applicationId`**       | <code>string</code>   | Kennung der Meta-Anwendung, die den Token ausgestellt hat.                                                                                               |
| **`declinedPermissions`** | <code>string[]</code> | Vom Nutzer abgelehnte Berechtigungen.                                                                                                        |
| **`expires`**             | <code>string</code>   | ISO-8601-Ablaufdatum des Tokens.                                                                                                          |
| **`isExpired`**           | <code>boolean</code>  | Ob der Token abgelaufen ist.                                                                                                            |
| **`lastRefresh`**         | <code>string</code>   | ISO-8601-Datum der letzten Tokenaktualisierung.                                                                                         |
| **`permissions`**         | <code>string[]</code> | Dem Token erteilte Berechtigungen.                                                                                                        |
| **`token`**               | <code>string</code>   | Von der Plattform zurückgegebene Tokenzeichenfolge. Bei iOS Limited Login ist dies ein OIDC-Authentifizierungstoken (JWT), kein Graph-API-Zugriffstoken. |
| **`userId`**              | <code>string</code>   | Dem Token zugeordnete Facebook-Nutzer-ID.                                                                                              |


#### FacebookCurrentAccessTokenResponse

| Eigenschaft              | Typ                                                        | Beschreibung                                                  |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| **`accessToken`** | <code><a href="#accesstoken">AccessToken</a> \| null</code> | Aktuelle Tokenantwort, sofern die Plattform eine zurückgibt. |


### Typaliase


#### Partial

Macht alle Properties in T optional

<code>{
 [P in keyof T]?: T[P];
 }</code>


#### Record

Erstellt einen Typ mit einer Menge von Properties K vom Typ T

<code>{
 [P in K]: T;
 }</code>

</docgen-api>

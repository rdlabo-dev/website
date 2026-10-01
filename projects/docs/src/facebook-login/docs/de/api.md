---
title: "API"
sourceRevision: "7286515899c0ee98f4b38a8dbe9c1061cb5773025827d2e2d2deca5c36dee034"
---
* [`initialize(...)`](#initialize)
* [`login(...)`](#login)
* [`logout()`](#logout)
* [`reauthorize()`](#reauthorize)
* [`getCurrentAccessToken()`](#getcurrentaccesstoken)
* [`getProfile(...)`](#getprofile)
* [`logEvent(...)`](#logevent)
* [`setAutoLogAppEventsEnabled(...)`](#setautologappeventsenabled)
* [`setAdvertiserTrackingEnabled(...)`](#setadvertisertrackingenabled)
* [`setAdvertiserIDCollectionEnabled(...)`](#setadvertiseridcollectionenabled)
* [Interfaces](#interfaces)
* [Typaliase](#type-aliases)

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

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
* [Alias de types](#type-aliases)

<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### initialize(...)

```typescript
initialize(options: Partial<FacebookConfiguration>) => Promise<void>
```

Initialise le SDK JavaScript Facebook sur le Web.
Sans effet sur Android et iOS, où le SDK est configuré nativement.

| Paramètre         | Type                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#partial">Partial</a>&lt;<a href="#facebookconfiguration">FacebookConfiguration</a>&gt;</code> |

--------------------

### login(...)

```typescript
login(options: { permissions: string[]; tracking?: 'limited' | 'enabled'; nonce?: string; }) => Promise<FacebookLoginResponse>
```

Lance le parcours de connexion Facebook avec les autorisations demandées.
Une connexion native annulée se résout sans jeton.

| Paramètre         | Type                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------ |
| **`options`** | <code>{ permissions: string[]; tracking?: 'limited' \| 'enabled'; nonce?: string; }</code> |

**Renvoie :** <code>Promise&lt;<a href="#facebookloginresponse">FacebookLoginResponse</a>&gt;</code>

--------------------

### logout()

```typescript
logout() => Promise<void>
```

Déconnecte la session Facebook courante.

--------------------

### reauthorize()

```typescript
reauthorize() => Promise<FacebookLoginResponse>
```

Demande le renouvellement de l’accès aux données pour la session Facebook courante.

**Renvoie :** <code>Promise&lt;<a href="#facebookloginresponse">FacebookLoginResponse</a>&gt;</code>

--------------------

### getCurrentAccessToken()

```typescript
getCurrentAccessToken() => Promise<FacebookCurrentAccessTokenResponse>
```

Renvoie le jeton courant. Sur iOS, renvoie un jeton d’authentification OIDC pour Limited Login. Les plateformes natives se résolvent sans jeton lorsque l’utilisateur est déconnecté ; le Web rejette l’appel en l’absence de session Facebook connectée.

**Renvoie :** <code>Promise&lt;<a href="#facebookcurrentaccesstokenresponse">FacebookCurrentAccessTokenResponse</a>&gt;</code>

--------------------

### getProfile(...)

```typescript
getProfile<T extends Record<string, unknown>>(options: { fields: readonly string[]; }) => Promise<T>
```

Demande les champs sélectionnés à l’endpoint `/me` de l’API Facebook Graph.

| Paramètre         | Type                                        |
| ------------- | ------------------------------------------- |
| **`options`** | <code>{ fields: readonly string[]; }</code> |

**Renvoie :** <code>Promise&lt;T&gt;</code>

--------------------

### logEvent(...)

```typescript
logEvent(options: { eventName: string; parameters?: Record<string, string | number>; }) => Promise<void>
```

Enregistre un Facebook App Event avec des paramètres facultatifs de type chaîne ou nombre.

| Paramètre         | Type                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ eventName: string; parameters?: <a href="#record">Record</a>&lt;string, string \| number&gt;; }</code> |

--------------------

### setAutoLogAppEventsEnabled(...)

```typescript
setAutoLogAppEventsEnabled(options: { enabled: boolean; }) => Promise<void>
```

Active ou désactive l’enregistrement automatique des App Events sur les plateformes natives.

| Paramètre         | Type                               |
| ------------- | ---------------------------------- |
| **`options`** | <code>{ enabled: boolean; }</code> |

--------------------

### setAdvertiserTrackingEnabled(...)

```typescript
setAdvertiserTrackingEnabled(options: { enabled: boolean; }) => Promise<void>
```

Active ou désactive le suivi publicitaire sur iOS.

| Paramètre         | Type                               |
| ------------- | ---------------------------------- |
| **`options`** | <code>{ enabled: boolean; }</code> |

--------------------

### setAdvertiserIDCollectionEnabled(...)

```typescript
setAdvertiserIDCollectionEnabled(options: { enabled: boolean; }) => Promise<void>
```

Active ou désactive la collecte de l’identifiant publicitaire sur les plateformes natives.

| Paramètre         | Type                               |
| ------------- | ---------------------------------- |
| **`options`** | <code>{ enabled: boolean; }</code> |

--------------------

### Interfaces

#### FacebookConfiguration

| Propriété                   | Type                 | Description                                                          |
| ---------------------- | -------------------- | -------------------------------------------------------------------- |
| **`appId`**            | <code>string</code>  | Identifiant de l’application Meta.                                                 |
| **`autoLogAppEvents`** | <code>boolean</code> | Indique si le SDK Web enregistre automatiquement les App Events.                   |
| **`xfbml`**            | <code>boolean</code> | Indique si le SDK Web analyse les plugins sociaux XFBML.                     |
| **`version`**          | <code>string</code>  | Version de l’API Facebook Graph utilisée par le SDK Web. Valeur par défaut : `v26.0`. |
| **`locale`**           | <code>string</code>  | Locale utilisée pour charger le SDK Web. Valeur par défaut : `en_US`.                |

#### FacebookLoginResponse

| Propriété                             | Type                                                        | Description                                          |
| -------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| **`accessToken`**                | <code><a href="#accesstoken">AccessToken</a> \| null</code> | Réponse contenant le jeton, lorsque la plateforme en renvoie une. |
| **`recentlyGrantedPermissions`** | <code>string[]</code>                                       | Autorisations accordées pendant cette connexion.               |
| **`recentlyDeniedPermissions`**  | <code>string[]</code>                                       | Autorisations refusées pendant cette connexion.                |

#### AccessToken

| Propriété                      | Type                  | Description                                                                                                                              |
| ------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **`applicationId`**       | <code>string</code>   | Identifiant de l’application Meta qui a émis le jeton.                                                                                               |
| **`declinedPermissions`** | <code>string[]</code> | Autorisations refusées par l’utilisateur.                                                                                                        |
| **`expires`**             | <code>string</code>   | Date d’expiration du jeton au format ISO 8601.                                                                                                          |
| **`isExpired`**           | <code>boolean</code>  | Indique si le jeton a expiré.                                                                                                            |
| **`lastRefresh`**         | <code>string</code>   | Date ISO 8601 de la dernière actualisation du jeton.                                                                                         |
| **`permissions`**         | <code>string[]</code> | Autorisations accordées au jeton.                                                                                                        |
| **`token`**               | <code>string</code>   | Chaîne du jeton renvoyée par la plateforme. Avec iOS Limited Login, il s’agit d’un jeton d’authentification OIDC (JWT), et non d’un jeton d’accès à l’API Graph. |
| **`userId`**              | <code>string</code>   | Identifiant de l’utilisateur Facebook associé au jeton.                                                                                              |

#### FacebookCurrentAccessTokenResponse

| Propriété              | Type                                                        | Description                                                  |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| **`accessToken`** | <code><a href="#accesstoken">AccessToken</a> \| null</code> | Réponse contenant le jeton courant, lorsque la plateforme en renvoie une. |

### Alias de types

#### Partial

Rend toutes les propriétés de T facultatives

<code>{
 [P in keyof T]?: T[P];
 }</code>

#### Record

Construit un type avec un ensemble de propriétés K de type T

<code>{
 [P in K]: T;
 }</code>

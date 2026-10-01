---
title: "Premiers pas"
sourceRevision: "b94cfb0b0be588f8e56e5070052f1dd0662314ba1086778ba79f5a3a15216d15"
---
<p align="center"><br><img src="https://user-images.githubusercontent.com/236501/85893648-1c92e880-b7a8-11ea-926d-95355b8175c7.png" width="128" height="128" /></p>
<h3 align="center">Facebook Login</h3>
<p align="center"><strong><code>@capacitor-community/facebook-login</code></strong></p>
<p align="center">
  Plugin communautaire Capacitor pour Facebook Login natif.
</p>

<!-- rdlabo-docs-omit -->
<p align="center">
  <strong><a href="https://docs.rdlabo.dev/projects/capacitor-facebook-login">Lire la documentation complète</a></strong>
</p>
<!-- /rdlabo-docs-omit -->

<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2026?style=flat-square" />
  <a href="https://www.npmjs.com/package/@capacitor-community/facebook-login"><img src="https://img.shields.io/npm/l/@capacitor-community/facebook-login?style=flat-square" /></a>
<br>
  <a href="https://www.npmjs.com/package/@capacitor-community/facebook-login"><img src="https://img.shields.io/npm/dw/@capacitor-community/facebook-login?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor-community/facebook-login"><img src="https://img.shields.io/npm/v/@capacitor-community/facebook-login?style=flat-square" /></a>
</p>

## Mainteneurs

| Mainteneur          | GitHub                              | Réseaux sociaux                                | Site Web                               |
| ------------------- | ----------------------------------- | ------------------------------------- | ------------------------------------- |
| Masahiko Sakakibara | [rdlabo](https://github.com/rdlabo) | [@rdlabo](https://twitter.com/rdlabo) | [rdlabo.dev](https://rdlabo.dev/) |

État de maintenance : maintenu activement

## Contributeurs ✨

<a href="https://github.com/capacitor-community/facebook-login/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=capacitor-community/facebook-login" />
</a>

Créé avec [contributors-img](https://contrib.rocks).

## Démonstration

[Le code de démonstration est ici.](./demo/angular)

## Vue d’ensemble

Plugin communautaire Capacitor pour Facebook Login et Facebook App Events sur
Android, iOS et le Web. Il encapsule les SDK Meta natifs sur Android et iOS, ainsi que
le SDK JavaScript Facebook sur le Web.

## Installation

Ce plugin cible Capacitor 8, iOS 15 ou une version ultérieure, et Android API 24 ou une version ultérieure.
Il déclare les dépendances du SDK Facebook natif pour CocoaPods et Swift
Package Manager.

```bash
npm install @capacitor-community/facebook-login
npx cap sync
```

Installez la version majeure du plugin correspondant à celle de Capacitor.

| Capacitor | Plugin |
| --------- | ------ |
| 8         | 8.x    |
| 7         | 7.x    |
| 6         | 6.x    |

Effectuez la configuration native et Web requise décrite dans
[Configuration](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/configuration) avant d’appeler le plugin.

## Première connexion avec l’e-mail

Après l’[installation](/docs/readme#installation) et la [configuration](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/configuration),
appelez login depuis une action utilisateur, comme un clic sur un bouton. Demandez uniquement `email` pour
ce premier essai :

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

Résultat attendu : en cas de réussite, l’appel se résout avec un objet `accessToken` ; ne journalisez pas
la chaîne brute du jeton. Une annulation sur Android ou iOS se résout sans jeton. Sur
le Web, une connexion échouée rejette l’appel.

Limited Login sur iOS renvoie un jeton d’authentification OIDC (JWT), et non un jeton d’accès à
l’API Graph. L’accès au profil via Graph nécessite d’autres conditions de jeton ; consultez
[Authentification](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/authentication).

## Documentation

Commencez par [Configuration](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/configuration), puis utilisez le guide de la
fonctionnalité que vous mettez en œuvre. Les signatures des méthodes et les informations de types générées
restent dans la section [API](/docs/api) ci-dessous.

- [Configuration](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/configuration) — paramètres de l’application Meta et configuration des SDK Android, iOS
  et Web.
- [Authentification](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/authentication) — connexion, déconnexion, jetons courants,
  champs du profil, réautorisation et différences entre plateformes.
- [Événements de l’application](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/app-events) — événements personnalisés, paramètres, enregistrement automatique
  des événements et paramètres publicitaires.

<!-- rdlabo-docs-omit -->

## Canaux de préversion

Une pull request ouverte, non marquée comme brouillon, peut être publiée sous le dist-tag npm `beta` après la réussite de ses workflows `Validation` et `Package Candidate`. Un propriétaire ou mainteneur du dépôt doit ajouter un commentaire dont le corps complet est :

```text
/beta
```

La demande autorise uniquement le SHA de tête de la pull request présent au moment de l’ajout du commentaire. Le workflow vérifie de nouveau l’autorisation du propriétaire ou mainteneur et le SHA de tête juste avant la publication. Chaque nouveau commit exige une nouvelle réussite de la CI et un nouveau commentaire `/beta` d’un propriétaire ou mainteneur. Les pull requests issues de forks sont prises en charge. Celles qui modifient un workflow conditionnant les versions ne peuvent pas être publiées en bêta avant l’intégration de ces changements dans `main`.

Les versions bêta utilisent `<base>-beta.pr<PR number>.sha<12-character SHA>`. Le candidat est construit dans un workflow en lecture seule sans identifiants de publication npm. Le workflow de publication privilégié publie uniquement l’artefact de package immuable validé, avec les scripts de cycle de vie désactivés. Un échec de notification ne peut pas invalider une publication npm réussie.

Lorsqu’une pull request est fusionnée dans `main`, elle est automatiquement publiée sous `beta` uniquement après la réussite de la CI requise et de `Package Candidate` pour ce commit de fusion exact. Les pushes directs vers `main` ne publient pas de candidat.

Seul `npm run release` crée un tag de version. Les tags stables `vX.Y.Z` sont publiés sous npm `latest` ; les tags de révision ou de préversion sont publiés sous `next`. Ni les publications `beta` ni les publications `next` ne modifient le dist-tag npm `latest`.

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
* [Alias de types](/docs/readme#type-aliases)

</docgen-index>

<docgen-api>
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

</docgen-api>

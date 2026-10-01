---
title: "Authentification"
sourceRevision: "876a29c09664c032c29acad5e4b1750831ef35bc8859978d94134a10822c3b50"
---
# Authentification

Effectuez la [configuration](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/configuration) avant d’utiliser les méthodes d’authentification.

## Comportement selon la plateforme

| Méthode                  | Android   | iOS                      | Web             |
| ----------------------- | --------- | ------------------------ | --------------- |
| `login`                 | Pris en charge | Limited Login par défaut | Pris en charge       |
| `logout`                | Pris en charge | Pris en charge                | Pris en charge       |
| `reauthorize`           | Pris en charge | Pris en charge                | Non implémenté |
| `getCurrentAccessToken` | Pris en charge | Jeton Limited Login      | Pris en charge       |
| `getProfile`            | Pris en charge | Nécessite un jeton Graph   | Pris en charge       |

L’option de connexion `tracking` est propre à iOS et vaut `limited` par défaut. Avec Limited Login, iOS renvoie un jeton d’authentification OIDC (JWT), et non un jeton d’accès à l’API Graph. Le plugin ne renvoie actuellement pas le jeton d’accès Graph obtenu avec `tracking: 'enabled'`.

L’option `nonce` est utilisée sur Android et iOS, et ignorée sur le Web. Transmettez le nonce brut ; les implémentations natives le hachent avant de le fournir au SDK Facebook.

## Connexion

Demandez uniquement les autorisations utilisées par votre application. Appelez `login` depuis une action utilisateur, comme un clic sur un bouton :

```ts
import { FacebookLogin } from '@capacitor-community/facebook-login';

const result = await FacebookLogin.login({
  permissions: ['email'],
});

if (result.accessToken) {
  console.log('Facebook login succeeded.');
} else {
  // Annulation ou absence de jeton renvoyé par la plateforme native.
  console.log('Facebook login canceled or returned no token.');
}
```

Ne journalisez pas `accessToken.token`. Sur le Web, login rejette l’appel si Facebook ne renvoie pas de jeton utilisable. Sur Android et iOS, une connexion annulée se résout sans jeton.

### Mode de suivi iOS et nonce

```ts
const result = await FacebookLogin.login({
  permissions: ['email'],
  tracking: 'limited',
  nonce: crypto.randomUUID(),
});
```

Votre backend doit valider les jetons Limited Login comme des jetons OIDC. Ne les traitez pas comme des jetons d’accès à l’API Graph.

## Jeton courant

```ts
const result = await FacebookLogin.getCurrentAccessToken();

if (result.accessToken) {
  console.log('Current Facebook token is available.', {
    isExpired: result.accessToken.isExpired,
    permissions: result.accessToken.permissions,
  });
}
```

Les plateformes natives se résolvent sans jeton lorsque l’utilisateur est déconnecté. Le Web rejette l’appel en l’absence de session Facebook connectée.

## Champs du profil

```ts
const profile = await FacebookLogin.getProfile<{
  id: string;
  email?: string;
}>({ fields: ['id', 'email'] });
```

Les champs doivent être autorisés pour votre application Meta et accordés par l’utilisateur. L’objet obtenu contient uniquement les champs renvoyés par l’API Graph. Sur iOS, cela nécessite un jeton d’accès Graph et ne fonctionne pas avec le jeton Limited Login par défaut.

## Réautoriser l’accès aux données

La réautorisation est disponible uniquement sur Android et iOS.

```ts
const result = await FacebookLogin.reauthorize();

if (result.accessToken) {
  console.log('Data access was renewed.');
}
```

## Déconnexion

```ts
await FacebookLogin.logout();
```

La déconnexion efface la session Facebook gérée par le SDK de la plateforme.

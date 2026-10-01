---
title: "Feuille de vérification d’identité"
code: ["identity-verification-sheet/example.ts.md"]
scrollActiveLine: [{"id":"","activeLine":{"example.ts":[1,1]}},{"id":"écouter-le-résultat","activeLine":{"example.ts":[5,18]}},{"id":"obtenir-les-identifiants-de-session","activeLine":{"example.ts":[31,34]}},{"id":"initialiser-la-plateforme-web","activeLine":{"example.ts":[27,31]}},{"id":"créer-et-présenter-la-feuille","activeLine":{"example.ts":[34,42]}},{"id":"gérer-failedtoload","activeLine":{"example.ts":[18,27]}},{"id":"gérer-verificationresult","activeLine":{"example.ts":[5,18]}},{"id":"erreurs-et-annulation","activeLine":{"example.ts":[5,18]}}]
sourceRevision: "f1ef38cf6f85e81d0ab969d17174fe4680e030d4c66aa998cb09fc22cfaec596"
---
Stripe Identity vérifie les documents d’identité dans une feuille native sur iOS et Android, et via Stripe.js sur le Web, tout en conservant le code applicatif dans Capacitor.

Le plugin prend en charge iOS, Android et le Web. Les plateformes natives présentent Identity Verification Sheet de Stripe avec `verificationId` et `ephemeralKeySecret`. Le Web appelle `verifyIdentity` avec `clientSecret` après `initialize`.

## Premier parcours de vérification

Suivez cet ordre pour le premier envoi réussi :

1. Créez une VerificationSession sur votre backend et renvoyez les champs ci-dessous qui peuvent être exposés au client.
2. Enregistrez l’écouteur `VerificationResult` une seule fois au démarrage de l’application, avant `present()`.
3. Sur le Web, appelez `initialize` avec la clé publique.
4. Appelez `create`, puis `present()`.

Premier résultat sur appareil : la feuille s’ouvre et vous recevez `Completed` après l’envoi du document de test par l’utilisateur. `Completed` signifie que l’envoi est terminé, pas que l’examen est terminé ; confirmez le résultat officiel avec les webhooks Identity sur votre serveur. Le panneau de code suit le même parcours.

## Écouter le résultat

Enregistrez l’écouteur de résultat une seule fois au démarrage de l’application, avant d’appeler `present()`. Android peut recréer l’Activity et l’environnement JavaScript pendant l’ouverture de la feuille native ; un enregistrement précoce évite donc de manquer un résultat transmis.

Conservez l’écouteur pendant la durée de vie de son responsable au niveau de l’application, par exemple `main.ts`, un initialiseur applicatif ou un service singleton initialisé au démarrage. Ne le supprimez pas immédiatement après le retour de `present()`. Sur Android, `present()` se résout dès l’affichage de la feuille ; le résultat arrive ensuite via `VerificationResult`.

`Completed`, `Canceled` et `Failed` sont des valeurs de résultat fournies dans `IdentityVerificationResult.result`. Ce ne sont pas des surcharges `addListener` prises en charge séparément. Enregistrez `IdentityVerificationSheetEventsEnum.VerificationResult` et examinez `result`.

!::IdentityVerificationSheetEventsEnum::

Le transfert du résultat natif est conservé en mémoire. Il ne garantit pas de récupération après l’arrêt du processus par le système d’exploitation.

## Obtenir les identifiants de session

Créez une VerificationSession sur votre backend avec la clé secrète Stripe. Créez ensuite une clé éphémère pour cette session et renvoyez uniquement les champs qui peuvent être exposés au client.

Le serveur de démonstration officiel (`POST /identify`) crée une VerificationSession `document`, crée une clé éphémère avec `{ verification_session: session.id }` et la version d’API Stripe `2022-11-15`, puis renvoie :

| Champ de réponse         | Code source                              | Option `create` du plugin |
| ---------------------- | ----------------------------------- | ---------------------- |
| `verificationId`      | `VerificationSession.id`            | `verificationId`       |
| `ephemeralKeySecret`   | `EphemeralKey.secret`               | `ephemeralKeySecret`   |
| `clientSecret`         | `VerificationSession.client_secret` | `clientSecret`         |

```ts
const session = await stripe.identity.verificationSessions.create({
  type: 'document',
});
const ephemeralKey = await stripe.ephemeralKeys.create(
  { verification_session: session.id },
  { apiVersion: '2022-11-15' },
);

return {
  verificationId: session.id,
  ephemeralKeySecret: ephemeralKey.secret,
  clientSecret: session.client_secret,
};
```

Gardez la clé secrète Stripe sur le serveur. L’application Capacitor doit recevoir uniquement la clé publique, pour `initialize` sur le Web, ainsi que `verificationId`, `ephemeralKeySecret` et `clientSecret`. N’intégrez jamais `STRIPE_SECRET_KEY` au client, au binaire natif ou au bundle frontend.

`Completed` sur l’appareil signifie que l’utilisateur a terminé l’envoi des documents. La VerificationSession passe ensuite au traitement. Confirmez le résultat officiel sur le serveur avec les webhooks Identity, comme `identity.verification_session.verified`, `identity.verification_session.requires_input`, `identity.verification_session.processing`, `identity.verification_session.canceled` et `identity.verification_session.redacted`. Consultez [Gérer les résultats de vérification](https://docs.stripe.com/identity/handle-verification-outcomes).

## Initialiser la plateforme Web

`initialize` est requis uniquement sur le Web. Il charge Stripe.js avec la clé publique. Sur les plateformes natives, `initialize` se résout sans utiliser cette clé.

!::initialize::

## Créer et présenter la feuille

Transmettez les champs du backend à `create`, puis appelez `present()`.

- **iOS et Android** nécessitent `verificationId` et `ephemeralKeySecret`. L’absence de l’une de ces valeurs rejette `create` et émet `FailedToLoad`.
- **Web** utilise uniquement `clientSecret`. Les plateformes natives ignorent `clientSecret`. Vous pouvez l’omettre dans les builds natifs, ou l’inclure si le même code s’exécute sur le Web.
- N’importez pas `CreateIdentityVerificationSheetOption` ni `InitializeIdentityVerificationSheetOption` depuis `@capacitor-community/stripe-identity`. Ces types d’options ne sont pas réexportés depuis l’index du package.

!::create::

!::CreateIdentityVerificationSheetOption::

!::present::

`present()` renvoie `Promise<void>`. Il ne renvoie pas `IdentityVerificationResult`. Lisez le résultat depuis l’écouteur `VerificationResult`.

## Gérer FailedToLoad

`FailedToLoad` se déclenche lorsque `create` ne peut pas construire la feuille. La promise de `create` est également rejetée avec le même texte.

Les plateformes natives l’émettent lorsque `verificationId` ou `ephemeralKeySecret` est absent, avec `Invalid Params. This method require verificationId or ephemeralKeySecret.` sur Android ; iOS utilise la même phrase avec `this` en minuscule. iOS l’émet également si les clés de l’icône principale de l’application sont absentes d’`Info.plist`.

Le type de l’écouteur est `StripeIdentityError`. iOS fournit `{ message }`. Android place actuellement le texte dans `error` sous forme de chaîne. Gérez l’écouteur et la promise rejetée de `create`.

Sur le Web, `create` émet toujours `Loaded` sans valider `clientSecret`. Web `present` déclenche `Stripe is not initialized.` ou `clientSecret is not set.` plutôt que `FailedToLoad`.

!::StripeIdentityError::

## Gérer VerificationResult

`IdentityVerificationResult.result` est un `IdentityVerificationSheetResultInterface` : `Completed`, `Canceled` ou `Failed`.

| `result`    | Signification                                                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `Completed` | L’utilisateur a envoyé ses documents. La vérification est encore en cours ; attendez les webhooks.                                                     |
| `Canceled`  | L’utilisateur a fermé la feuille. Permettez-lui de réessayer. Sur le Web, cela correspond à `session_cancelled` de Stripe.js.                                   |
| `Failed`    | Le parcours a échoué. Lisez `error.message` et affichez-le. Les plateformes natives envoient le texte d’erreur localisé ; le Web transmet l’erreur Stripe.js. |

`error` est présent pour `Failed`. N’enregistrez pas `addListener(IdentityVerificationSheetEventsEnum.Completed)`, `Canceled` ni `Failed`. Ces membres de l’énumération sont des valeurs de résultat, pas des noms d’écouteur pris en charge.

!::IdentityVerificationResult::

!::IdentityVerificationSheetResultInterface::

## Erreurs et annulation

Traitez l’annulation comme une action utilisateur, pas comme un plantage : conservez l’écouteur enregistré et permettez un nouveau cycle `create` / `present`.

Le comportement de `present()` varie selon la plateforme :

- **Android** se résout lorsque la feuille est présentée. Un `VerificationResult` ultérieur, conservé en mémoire jusqu’à sa consommation, signale `Completed`, `Canceled` ou `Failed`. Une erreur lors de la présentation rejette la promise.
- **iOS** attend la fermeture de la feuille, notifie `VerificationResult`, puis résout `present()`.
- **Web** attend `verifyIdentity`. L’annulation et l’échec notifient `VerificationResult` et résolvent l’appel. L’absence d’`initialize` ou de `clientSecret` rejette l’appel.

Ne déduisez pas la réussite de la résolution de `present()`. Examinez toujours `verification.result` pour choisir le traitement.

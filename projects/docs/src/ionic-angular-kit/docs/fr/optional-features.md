---
title: "Fonctionnalités facultatives"
sourceRevision: "2523f6f570b57cfdeb738b3da67afb5b275eb11e9efb4e408385bd4547106083"
---
Les fonctions facultatives utilisent des points d’entrée secondaires afin que leurs plugins natifs et SDK n’entrent pas dans les applications qui ne les utilisent pas.

## Mises à jour de l’application Web

`provideKitAppUpdate()` de `/app-update` vérifie la présence d’une version complète du service worker Angular avant le démarrage. Cette stratégie
bloquante reste celle par défaut pour les applications où préserver toutes les saisies en cours est plus important qu’une vérification lente des mises à jour.

Les applications qui préchargent tous leurs chunks exécutables peuvent choisir une vérification au démarrage non bloquante :

```ts
provideKitAppUpdate({ strategy: 'background' });
```

La stratégie d’arrière-plan existante recharge uniquement avant qu’Angular ait terminé son premier rendu. Une mise à jour ultérieure est laissée au prochain chargement naturel de la page pour ne pas perdre les saisies.

Les applications peuvent choisir la stratégie distincte `confirm` pour proposer une mise à jour immédiate contrôlée par l’utilisateur. L’invite s’exécute après le premier rendu, dans un contexte d’injection Angular. Résolvez les dépendances de manière synchrone avant de franchir une frontière asynchrone. Une résolution à `true` recharge la version complète téléchargée ; `false` la laisse pour le prochain chargement naturel ; `undefined` entraîne une nouvelle tentative ultérieure, car l’invite n’a pas pu être affichée (par exemple si une autre alerte est active).

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

Aucune des deux stratégies non bloquantes n’appelle `activateUpdate()`, qui pourrait mélanger le shell en cours et des chunks différés d’une autre version. Une génération irrécupérable au démarrage est retentée une fois avec `ngsw-bypass` ; l’état courant de l’historique et une protection contre les boucles compatible hors ligne sont conservés.

## Thème et demandes d’avis

`provideKitTheme()` et `KitThemeController` persistent la préférence de l’utilisateur, suivent `prefers-color-scheme` jusqu’à sa modification, activent les classes de palette fournies par l’application et synchronisent la barre d’état Android.

```ts
provideKitTheme({
  storageKey: 'theme',
  darkClasses: ['ion-palette-dark'],
  lightClasses: ['ion-palette-light'],
});
```

Importez `kitRequestReview()` depuis `/review` pour demander la fenêtre native d’avis au plus une fois par intervalle défini par l’application. Cette fonction est sans effet sur le Web.

## Imprimante

Le point d’entrée `/printer` contient des utilitaires purs pour le rendu DOM-vers-PNG, la rotation d’images, les réglages d’impression Brother, la mise en page d’étiquettes multipages et la génération de PDF. L’application qui utilise le kit gère l’interface de choix du papier, les overlays de chargement, le stockage, le transport et les règles relatives aux textes.

## Authentification Firebase

Le point d’entrée `/auth-firebase` initialise `firebase/auth` via `provideKitFirebase()` et expose `KIT_FIREBASE_AUTH` ainsi que des utilitaires de parcours comme `kitSignIn`, `kitSignUp`, `kitSignOut`, `kitResolveAuthStatus` et `kitReauthWithRetry`.

Kit ne fournit aucune interface utilisateur. Les hooks délèguent le chargement, la navigation et la présentation des erreurs à l’application. Les fournisseurs sociaux disposent de points d’entrée distincts `/auth-firebase/apple`, `/auth-firebase/facebook` et `/auth-firebase/google` ; chacun nécessite uniquement son propre plugin facultatif. Le point d’entrée combiné `/auth-firebase/social` est **obsolète et conservé pour la rétrocompatibilité** ; migrez ses imports Apple vers `/apple` et ses imports Facebook vers `/facebook`.

Le point d’entrée de compatibilité charge toujours les deux plugins Apple et Facebook. Ses fonctions conservent la même identité à l’exécution et les objets de réponse Apple existants restent compatibles au niveau du code source.

Les utilitaires sociaux capturent l’utilisateur Firebase courant avant l’exécution de `before` et vérifient cette identité autour des opérations asynchrones. Les hooks de succès reçoivent le `user` exact qui a été authentifié ; utilisez-le pour rattacher les requêtes backend à la même session. Un parcours Apple, Facebook ou Google qui chevauche un autre parcours pour le même `Auth` est rejeté via `error('other', error)` avec `status: false`, avant le début de son hook `before` ou de son appel SDK. La garde reste active pendant le nettoyage. Les instances `Auth` différentes sont indépendantes.

Les applications doivent aussi coordonner l’authentification par e-mail/mot de passe, la déconnexion et les appels Firebase directs avec ces parcours. La garde couvre les utilitaires sociaux de Kit dans ce contexte JavaScript ; elle ne peut ni annuler une requête Firebase déjà démarrée, ni annuler une liaison de fournisseur achevée, ni sérialiser les modifications d’un autre onglet.

Les échecs dans `before`, l’échange ou `success` exécutent le hook d’erreur et renvoient `status: false`. `finally` s’exécute toujours, y compris pour les appels qui se chevauchent ; les erreurs de `error` ou `finally` rejettent la promesse. Les hooks sont responsables du nettoyage de leur interface.

Les utilisateurs d’Apple doivent installer `@capawesome/capacitor-apple-sign-in` (`>=0.1.4 <1`) et exécuter `npx cap sync` après avoir remplacé `@capacitor-community/apple-sign-in`. Cette migration de dépendance native concerne aussi le point d’entrée obsolète `/social` ; ses imports et types de réponse restent compatibles. Les changements de plugins natifs exigent un nouveau binaire natif.

L’utilitaire Apple utilise la connexion native sur iOS et la popup Firebase sur le Web. Il n’expose pas la configuration Android Service ID et de redirection. L’erreur typée `SIGN_IN_CANCELED` de Capawesome est signalée comme une annulation ; les autres erreurs natives restent des échecs opérationnels. Le `idToken` natif correspond au champ de réponse existant `identityToken`. Sur le Web, `authorizationCode` vaut `null` et le jeton d’accès de la popup est renvoyé séparément dans `accessToken`.

## Live Update

`provideLiveUpdateReadiness()` de `/live-update` attend la stabilité d’Angular, la première route terminée et une frame d’animation avant d’appeler `LiveUpdate.ready()` de Capawesome. Cette fonction est sans effet sur le Web.

Une Live Update remplace uniquement la couche Web d’un binaire natif existant. Les modifications du code natif, de la configuration Capacitor ou des versions de plugins nécessitent un build pour la boutique et un nouveau canal propre au numéro de build.

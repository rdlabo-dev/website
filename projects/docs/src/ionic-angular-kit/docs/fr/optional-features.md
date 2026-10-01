---
title: "Fonctionnalités facultatives"
sourceRevision: "d48e5bc25073e0e022fd62122dabadb9f97a49ed46e6e461cd2c38402ef091f9"
---
Les fonctions facultatives utilisent des points d’entrée secondaires afin que leurs plugins natifs et SDK n’entrent pas dans les applications qui ne les utilisent pas.

## Mises à jour de l’application Web

`provideKitAppUpdate()` de `/app-update` vérifie la présence d’une version complète du service worker Angular avant le démarrage. Cette stratégie
bloquante reste celle par défaut pour les applications où préserver toutes les saisies en cours est plus important qu’une vérification lente des mises à jour.

Les applications qui préchargent tous leurs chunks exécutables peuvent choisir une vérification au démarrage non bloquante :

```ts
provideKitAppUpdate({ strategy: 'background' });
```

La stratégie d’arrière-plan recharge uniquement avant qu’Angular ait terminé son premier rendu. Une mise à jour plus tardive est reportée au prochain chargement
naturel de la page pour ne pas perdre les saisies de l’utilisateur. Elle n’appelle jamais `activateUpdate()`, qui pourrait mélanger le shell en cours avec des chunks différés
d’une autre version. Une version irrécupérable au démarrage fait l’objet d’une nouvelle tentative unique avec `ngsw-bypass` ; l’état de l’historique courant et un
garde contre les boucles, compatible hors ligne, sont conservés.

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

Le kit ne fournit aucune interface utilisateur. Les hooks délèguent le chargement, la navigation et la présentation des erreurs à l’application. Les fournisseurs sociaux sont isolés davantage dans `/auth-firebase/social`.

## Live Update

`provideLiveUpdateReadiness()` de `/live-update` attend la stabilité d’Angular, la première route terminée et une frame d’animation avant d’appeler `LiveUpdate.ready()` de Capawesome. Cette fonction est sans effet sur le Web.

Une Live Update remplace uniquement la couche Web d’un binaire natif existant. Les modifications du code natif, de la configuration Capacitor ou des versions de plugins nécessitent un build pour la boutique et un nouveau canal propre au numéro de build.

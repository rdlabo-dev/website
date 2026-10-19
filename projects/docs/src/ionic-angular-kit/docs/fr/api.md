---
title: "API"
sourceRevision: "d12e7c4b43f75e518017c960d8b0f01d27802ddb6c78853d057e2559b03d8992"
---
Cartographie des points d’entrée publics de `@rdlabo/ionic-angular-kit` v22.0.6. Les guides ciblés décrivent les exigences de cycle de vie et d’intégration ; cette page précise quel chemin de package contient chaque famille d’API.

## Principal

#### `module` @rdlabo/ionic-angular-kit

| Famille d’API     | Principaux exports                                                   | Guide                                          |
| -------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| Stockage        | `KitStorageService`, `kitClearStoragePreservingKeys`                | [Stockage et overlays](/docs/storage-overlays) |
| Overlay        | `provideKitOverlay`, `KitOverlayController`, `KitLoadingController` | [Stockage et overlays](/docs/storage-overlays) |
| Authentification | `provideKitAuth`, fonctions de garde, `KitAuthAccessService`           | [Authentification et HTTP](/docs/auth-http)     |
| HTTP           | `provideKitHttp`, `kitAuthInterceptor`                              | [Authentification et HTTP](/docs/auth-http)     |
| Temps réel       | `KitRealtimeConnection`, `KitRealtimeLivenessWatchdog`              | [Hors ligne et temps réel](/docs/offline-realtime) |

`KitAuthLoginExchange` et `kitPreloadAuthLoginForNavigation` partagent les requêtes de connexion au démarrage. Consultez [Authentification et HTTP](/docs/auth-http).

## Points d’entrée facultatifs

#### `module` @rdlabo/ionic-angular-kit/offline

API de dépôt hors ligne, de réplique synchronisée, d’outbox, de règles de requête, de schéma, d’identité et de récupération. Utilisez `provideOffline` ou ses variantes ciblées comme point de composition principal.

`OfflineStorageLifecycle` et `OfflineStorageGenerationChangedError` gèrent les générations de stockage explicitement jetables. Consultez [Hors ligne et temps réel](/docs/offline-realtime).

#### `module` @rdlabo/ionic-angular-kit/offline/storage-generation

`inspectOfflineStorageGeneration` vérifie les marqueurs de stockage au démarrage sans charger immédiatement le runtime hors ligne.

#### `module` @rdlabo/ionic-angular-kit/forms

`KitIonicFormField`, `provideKitIonicSignalForms`, `kitDefaultSignalFormErrorMessage`, `KIT_SIGNAL_FORM_ERROR_MESSAGE_RESOLVER` et `KitSignalFormErrorMessageResolver` pour adapter Angular 22 Signal Forms aux contrôles Ionic. Consultez [Formulaires](/docs/forms).

#### `module` @rdlabo/ionic-angular-kit/auth-firebase

Fournisseurs d’authentification Firebase et fonctions typées de connexion, d’inscription, de liaison, de réauthentification, de vérification, de mot de passe et de mise à jour de compte.

#### `module` @rdlabo/ionic-angular-kit/auth-firebase/apple

Utilitaires de connexion et de liaison Apple, avec leurs types de réponse et d’options.

#### `module` @rdlabo/ionic-angular-kit/auth-firebase/facebook

Utilitaires de connexion, de liaison et de déconnexion Facebook, avec leurs types de réponse et d’options.

#### `module` @rdlabo/ionic-angular-kit/auth-firebase/google

Utilitaires de connexion Google popup/native, de liaison de session Firebase et de déconnexion, avec leurs types de réponse et d’options.

#### `module` @rdlabo/ionic-angular-kit/auth-firebase/social

**Obsolète, conservé pour la compatibilité.** Utilitaires d’authentification sociale Apple et Facebook et leurs types de réponse et d’options. Préférez les points d’entrée propres à chaque fournisseur ; ce point d’entrée combiné nécessite les deux plugins.

#### `module` @rdlabo/ionic-angular-kit/app-update

`provideKitAppUpdate` et `KitAppUpdateService` pour les mises à jour coordonnées du service worker Angular.

#### `module` @rdlabo/ionic-angular-kit/live-update

`provideLiveUpdateReadiness` pour coordonner le signalement de disponibilité au démarrage de Live Update.

#### `module` @rdlabo/ionic-angular-kit/printer

Utilitaires de mise en page PDF, de DOM-vers-PNG, de prévisualisation, de téléchargement, de rotation, de taille de papier et de réglages Brother Print.

#### `module` @rdlabo/ionic-angular-kit/review

`kitRequestReview` et `KitRequestReviewOptions` pour les demandes d’avis natives.

#### `module` @rdlabo/ionic-angular-kit/theme

`provideKitTheme`, `KitThemeController`, `KitThemeConfig` et `KitThemeMode` pour la sélection persistante du thème.

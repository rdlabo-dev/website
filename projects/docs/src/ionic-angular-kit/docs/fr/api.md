---
title: "API"
sourceRevision: "0911987f4d59aa74b6cc1742220cef6f22d6ab16076d0b86e553ae9d09e7476f"
---
Cartographie des points d’entrée publics de `@rdlabo/ionic-angular-kit` v22.0.3. Les guides ciblés décrivent les exigences de cycle de vie et d’intégration ; cette page précise quel chemin de package contient chaque famille d’API.

## Principal

#### `module` @rdlabo/ionic-angular-kit

| Famille d’API     | Principaux exports                                                   | Guide                                          |
| -------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| Stockage        | `KitStorageService`, `kitClearStoragePreservingKeys`                | [Stockage et overlays](/docs/storage-overlays) |
| Overlay        | `provideKitOverlay`, `KitOverlayController`, `KitLoadingController` | [Stockage et overlays](/docs/storage-overlays) |
| Authentification | `provideKitAuth`, fonctions de garde, `KitAuthAccessService`           | [Authentification et HTTP](/docs/auth-http)     |
| HTTP           | `provideKitHttp`, `kitAuthInterceptor`                              | [Authentification et HTTP](/docs/auth-http)     |
| Temps réel       | `KitRealtimeConnection`, `KitRealtimeLivenessWatchdog`              | [Hors ligne et temps réel](/docs/offline-realtime) |

## Points d’entrée facultatifs

#### `module` @rdlabo/ionic-angular-kit/offline

API de dépôt hors ligne, de réplique synchronisée, d’outbox, de règles de requête, de schéma, d’identité et de récupération. Utilisez `provideOffline` ou ses variantes ciblées comme point de composition principal.

#### `module` @rdlabo/ionic-angular-kit/forms

`KitIonicFormField`, `provideKitIonicSignalForms`, `kitDefaultSignalFormErrorMessage`, `KIT_SIGNAL_FORM_ERROR_MESSAGE_RESOLVER` et `KitSignalFormErrorMessageResolver` pour adapter Angular 22 Signal Forms aux contrôles Ionic. Consultez [Formulaires](/docs/forms).

#### `module` @rdlabo/ionic-angular-kit/auth-firebase

Fournisseurs d’authentification Firebase et fonctions typées de connexion, d’inscription, de liaison, de réauthentification, de vérification, de mot de passe et de mise à jour de compte.

#### `module` @rdlabo/ionic-angular-kit/auth-firebase/social

Utilitaires d’authentification sociale Apple et Facebook et leurs types de réponse et d’options.

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

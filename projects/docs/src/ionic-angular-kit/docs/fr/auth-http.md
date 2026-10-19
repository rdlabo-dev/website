---
title: "Authentification et HTTP"
sourceRevision: "1851fbaaf3fc89785e9d73f853569dbfa63ae0ecfa57e95fa3401f831d8ca85f"
---
## Capacité d’accès

`provideKitAuth()` configure des gardes de route fonctionnels pour les états d’authentification `user`, `confirm`, `required`, `anonymous` et `unavailable`. Les routes de redirection et les effets de bord applicatifs restent dans l’application. L’`AuthService` des exemples ci-dessous relève de l’application ; fournissez votre propre observable `authState` et, si nécessaire, des callbacks de cycle de vie.

`KitAuthAccessService` publie les opérations autorisées pour la session courante :

| Mode     | Réplique locale et outbox | HTTP authentifié, temps réel et synchronisation |
| -------- | ------------------------ | -------------------------------------- |
| `none`   | Bloqué                  | Bloqué                                |
| `local`  | Autorisé                  | Bloqué                                |
| `remote` | Autorisé                  | Autorisé                                |

Un résultat `required` faisant autorité indique une déconnexion et ne doit pas donner accès hors ligne. Seul un résultat de transport `unavailable` peut activer une session locale précédemment vérifiée.

```ts
import { inject } from '@angular/core';
import type { Routes } from '@angular/router';
import {
  kitRequireAuthorizedGuard,
  kitRequireConfirmingGuard,
  kitRequiredUnauthorizedGuard,
  provideKitAuth,
} from '@rdlabo/ionic-angular-kit';
import { AuthService } from './auth.service';

provideKitAuth(() => {
  const auth = inject(AuthService);
  return {
    authState: () => auth.state$,
    redirects: {
      whenAuthorized: '/home',
      whenConfirming: '/auth/confirm',
      whenNotConfirming: '/auth/signin',
      whenUnauthorized: '/auth',
    },
  };
});

export const routes: Routes = [
  { path: 'auth/signin', canActivate: [kitRequiredUnauthorizedGuard], loadComponent: () => import('./signin.page').then((m) => m.SigninPage) },
  { path: 'auth/confirm', canActivate: [kitRequireConfirmingGuard], loadComponent: () => import('./confirm.page').then((m) => m.ConfirmPage) },
  { path: 'home', canActivate: [kitRequireAuthorizedGuard], loadComponent: () => import('./home.page').then((m) => m.HomePage) },
];
```

Utilisez `kitRequiredUnauthorizedGuard`, `kitRequireConfirmingGuard` et `kitRequireAuthorizedGuard` dans les définitions de routes. Une décision asynchrone protégée suspend la capacité distante précédemment publiée jusqu’à la réussite du bail d’autorisation courant.

## Partager les requêtes de connexion au démarrage

`KitAuthLoginExchange<Identity, Result>` partage une requête de connexion au backend en cours. Un résultat préchargé (y compris un échec) peut être consommé une seule fois par l’autorisation tant que la navigation d’origine est courante, jusqu’à 30 secondes après son achèvement. Les appels d’autorisation suivants effectuent une nouvelle requête ; ce n’est pas un cache de permissions.

Conservez une seule instance dans le service d’authentification de l’application. Capturez l’utilisateur Firebase lors de la construction de la requête, rejetez les réponses destinées à un utilisateur remplacé et appelez `clear()` à la déconnexion. L’éligibilité des fournisseurs, la récupération après suppression, l’acceptation des conditions et le traitement des réponses restent à la charge de l’application.

Pour les applications qui initialisent un runtime local avant l’autorisation, appelez `kitPreloadAuthLoginForNavigation(router, isCurrent => auth.preloadTokenLogin(isCurrent))` après la disponibilité de Firebase et la récupération de compte requise, avant d’attendre l’initialisation du runtime. Exécutez la fonction de nettoyage renvoyée si l’initialisation échoue. Elle abandonne le travail non consommé lorsque cette navigation se termine ou est annulée. Les applications sans travail de démarrage utile à exécuter en parallèle peuvent utiliser uniquement `run(identity, request)`.

## Règles HTTP

`provideKitHttp()` configure `kitAuthInterceptor` pour l’injection des identifiants, les règles de contournement, le traitement des échecs transitoires et les hooks d’erreur de l’application. Enregistrez séparément l’intercepteur avec `provideHttpClient`. Seul `getAuthHeaders` est obligatoire ; tous les autres hooks sont facultatifs et relèvent de l’application.

```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inject } from '@angular/core';
import type { ApplicationConfig } from '@angular/core';
import { kitAuthInterceptor, provideKitAuth, provideKitHttp } from '@rdlabo/ionic-angular-kit';
import { AuthService } from './auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([kitAuthInterceptor])),
    provideKitAuth(() => {
      const auth = inject(AuthService);
      return {
        authState: () => auth.state$,
        redirects: {
          whenAuthorized: '/home',
          whenConfirming: '/auth/confirm',
          whenNotConfirming: '/auth/signin',
          whenUnauthorized: '/auth',
        },
      };
    }),
    provideKitHttp(() => {
      const auth = inject(AuthService);
      return {
        getAuthHeaders: async () => ({ Authorization: `Bearer ${await auth.token()}` }),
        onUnauthorized: () => auth.signOut(),
      };
    }),
  ],
};
```

Les nouvelles tentatives automatiques sont limitées à `GET`, `HEAD`, `OPTIONS` ou aux requêtes portant un `Idempotency-Key`. Les écritures ordinaires ne sont jamais retentées automatiquement. Les nouvelles tentatives couvrent les états transitoires `0`, `408`, `429`, `502`, `503` et `504`, et respectent `Retry-After`.

Lorsque la prise en charge hors ligne est activée, enregistrez `offlineInterceptor` avant `kitAuthInterceptor`. Le mode local empêche alors la génération d’identifiants et le transport réseau tout en permettant à une règle de lecture correspondante de servir la réplique à portée limitée.

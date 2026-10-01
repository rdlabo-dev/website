---
title: "Authentifizierung und HTTP"
sourceRevision: "66614e310f548bc9ec22af4ea4243fc2dd6a517d01f272f224c7d62fd11ac55b"
---
## Zugriffsberechtigungen

`provideKitAuth()` konfiguriert funktionale Route Guards für die Authentifizierungszustände `user`, `confirm`, `required`, `anonymous` und `unavailable`. Weiterleitungsrouten und anwendungsspezifische Nebenwirkungen verbleiben in der App. `AuthService` in den folgenden Beispielen gehört zur Anwendung; stellen Sie Ihr eigenes Observable `authState` und optionale Lebenszyklus-Callbacks bereit.

`KitAuthAccessService` veröffentlicht, was die aktuelle Sitzung tun darf:

| Modus     | Lokales Replikat und Outbox | Authentifiziertes HTTP, Echtzeitfunktionen und Synchronisierung |
| -------- | ------------------------ | -------------------------------------- |
| `none`   | Gesperrt                  | Gesperrt                                |
| `local`  | Erlaubt                  | Gesperrt                                |
| `remote` | Erlaubt                  | Erlaubt                                |

Ein maßgebliches Ergebnis `required` bedeutet Abmeldung und darf keinen Offline-Zugriff ermöglichen. Nur ein Transportergebnis `unavailable` darf eine zuvor verifizierte lokale Sitzung aktivieren.

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

Verwenden Sie `kitRequiredUnauthorizedGuard`, `kitRequireConfirmingGuard` und `kitRequireAuthorizedGuard` in den Routendefinitionen. Eine geschützte asynchrone Entscheidung setzt zuvor veröffentlichte Remote-Berechtigungen aus, bis die aktuelle Autorisierungsfreigabe erfolgreich ist.

## HTTP-Richtlinie

`provideKitHttp()` konfiguriert `kitAuthInterceptor` für das Einfügen von Zugangsdaten, Ausnahmeregeln, die Behandlung vorübergehender Fehler und anwendungseigene Fehler-Hooks. Registrieren Sie den Interceptor separat mit `provideHttpClient`. Nur `getAuthHeaders` ist erforderlich; alle anderen Hooks sind optional und liegen in der Verantwortung der Anwendung.

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

Automatische Wiederholungsversuche sind auf `GET`, `HEAD`, `OPTIONS` oder Anfragen mit einem `Idempotency-Key` beschränkt. Gewöhnliche Schreibanfragen werden niemals automatisch wiederholt. Wiederholungsversuche betreffen die vorübergehenden Statuswerte `0`, `408`, `429`, `502`, `503` und `504` und berücksichtigen `Retry-After`.

Wenn Offline-Unterstützung aktiviert ist, registrieren Sie `offlineInterceptor` vor `kitAuthInterceptor`. Der lokale Modus verhindert dann die Erzeugung von Zugangsdaten und den Netzwerktransport, während eine passende Leserichtlinie das bereichsgebundene Replikat bereitstellen darf.

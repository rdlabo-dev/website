---
title: "Démarrage rapide avec Angular"
code: []
scrollActiveLine: []
sourceRevision: "a37044f2e08051cbf34bbb3d463daf12e54e1a59446e0fa7f75157ad306a79ae"
---
Initialisez le plugin une seule fois au démarrage. Dans une application Angular standalone, vous pouvez utiliser `provideAppInitializer` pour terminer l’initialisation avant d’afficher l’interface Stripe.

```ts:src/app/app.config.ts
import { ApplicationConfig, provideAppInitializer } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { Stripe } from '@capacitor-community/stripe';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideAppInitializer(() =>
      Stripe.initialize({
        publishableKey: 'Your Publishable Key',
      }),
    ),
  ],
};
```

Enregistrez les écouteurs de résultat dans ce même parcours de démarrage. Consultez [Écouteurs d’événements](/docs/learn/event-listeners).

## Web

Installez `@stripe/stripe-js@^9.17.0` et `stripe-pwa-elements@^4.1.0`, puis appelez `defineCustomElements()` une seule fois après le démarrage d’Angular.

```bash
npm install @stripe/stripe-js@^9.17.0 stripe-pwa-elements@^4.1.0
```

```ts:src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'stripe-pwa-elements/loader';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .then(() => defineCustomElements(window))
  .catch((err) => console.log(err));
```

Injectez `HttpClient` sous le nom `http` dans votre service ou composant. L’appel à `provideHttpClient()` ci-dessus l’enregistre. Pour récupérer les secrets clients d’un PaymentIntent ou d’un SetupIntent avec `HttpClient` d’Angular, utilisez `firstValueFrom`. Ajoutez les informations d’authentification de l’application via un intercepteur ou les options de requête. L’URL `environment.api` ci-dessous suppose le format de réponse de la démo. En production, utilisez votre propre backend avec authentification. La méthode `toPromise()` a été supprimée.

```ts
import { firstValueFrom } from 'rxjs';

const { paymentIntent, ephemeralKey, customer } = await firstValueFrom(
  this.http.post<{
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
  }>(environment.api + 'intent', {}),
);
```

---
title: "Angular-Schnellstart"
code: []
scrollActiveLine: []
sourceRevision: "a37044f2e08051cbf34bbb3d463daf12e54e1a59446e0fa7f75157ad306a79ae"
---
Initialisieren Sie das Plugin einmal beim Anwendungsstart. In einer Angular-Standalone-Anwendung können Sie mit `provideAppInitializer` die Initialisierung abschließen, bevor die Stripe-Oberfläche angezeigt wird.

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

Registrieren Sie Ergebnis-Listener im selben Startablauf. Siehe [Ereignis-Listener](/docs/learn/event-listeners).

## Web

Installieren Sie `@stripe/stripe-js@^9.17.0` und `stripe-pwa-elements@^4.1.0`. Rufen Sie nach dem Start von Angular einmal `defineCustomElements()` auf.

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

Injizieren Sie `HttpClient` als `http` in Ihren Dienst oder Ihre Komponente. Der Aufruf von `provideHttpClient()` oben registriert den Dienst. Verwenden Sie `firstValueFrom`, um mit dem Angular-Dienst `HttpClient` die Client-Secrets von PaymentIntents oder SetupIntents abzurufen. Übergeben Sie die Anmeldedaten der Anwendung über einen Interceptor oder die Anfrageoptionen. Die URL `environment.api` im Beispiel setzt das Antwortformat der Demo voraus. Verwenden Sie in Produktion Ihr eigenes Backend mit Authentifizierung. Die Methode `toPromise()` wurde entfernt.

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

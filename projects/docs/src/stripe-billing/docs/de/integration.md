---
title: "iOS-Abonnements mit Stripe Billing"
sourceRevision: "6a78acb1cdfdbdabfb15ca12160f8b089f40ee1787ca6ce3a177739f5097eec2"
---
# iOS-Abonnements mit Stripe Billing

Dieses Paket bindet das [experimentelle BillingSDK von Stripe](https://docs.stripe.com/billing/subscriptions/manage-ios) ein. Verwenden Sie ein Konto mit Freigabe für die Preview. Prüfen Sie vor der Aktivierung des Checkouts, ob Ihre App diese Käufe in der jeweiligen Storefront anbieten darf und welche App-Store-Vorgaben dort gelten.

## Aufgaben des Backends

Authentifizieren Sie den Nutzer der App und ermitteln Sie auf dem Server den zugehörigen Stripe Customer. Erstellen Sie bei jedem Ereignis `customerSessionRequested` eine **neue Customer Session**. Übernehmen Sie keine Customer-ID von einem nicht vertrauenswürdigen Client und betten Sie keine geheimen Stripe-API-Schlüssel in die App ein. Das zurückgegebene Secret darf weder protokolliert noch für eine weitere Anfrage verwendet werden.

Aktivieren Sie `buy_button`, `active_entitlements` und `customer_portal` in der Customer Session. Die Antwort hat folgendes Format.

```json
{
  "customer": "cus_...",
  "clientSecret": "cuss_...",
  "expiresAt": 1800000000
}
```

`expiresAt` enthält einen Unix-Zeitstempel in **Sekunden**. Weisen Sie nicht authentifizierte Anfragen mit HTTP 401 zurück. Wird die Anmeldung eines bereits angemeldeten Nutzers abgelehnt oder ist sie abgelaufen, muss die App dies als Fehler behandeln und zur erneuten Anmeldung auffordern. Der Kaufvorgang darf in diesem Fall nicht unbemerkt anonym fortgesetzt werden.

Das eingebundene native SDK sendet die Stripe-API-Version `2025-07-30.basil` und nutzt private Preview-Endpunkte. Die aktuelle Online-Anleitung von Stripe verwendet für das Backend `2026-08-26.dahlia` oder neuer. Prüfen Sie, ob Ihre Preview-Freigabe sowohl das eingebundene SDK als auch die API-Version Ihres Backends abdeckt. Eine neuere API-Version auf dem Server gewährt allein keinen Zugang zur Preview.

Das folgende Beispiel verwendet das Stripe-Server-SDK in einem Server-Handler mit bestehender Authentifizierung.

```ts
// user stammt aus der Middleware, die die Anmeldung auf dem Server geprüft hat.
// stripe ist der serverseitige Stripe-Client für die freigeschaltete Preview.
const session = await stripe.customerSessions.create({
  customer: user.stripeCustomerId,
  components: {
    buy_button: { enabled: true },
    active_entitlements: { enabled: true },
    customer_portal: { enabled: true },
  },
});
return Response.json({
  customer: session.customer,
  clientSecret: session.client_secret,
  expiresAt: session.expires_at,
});
```

Falls die stabile SDK-Version diese Komponenten noch nicht enthält, verwenden Sie das Stripe-Server-SDK und die Typdefinitionen für Ihre Preview. Konfigurieren Sie in Stripe die Kaufschaltflächen, Abonnementpreise, Produktberechtigungen und das Customer Portal. Prüfen Sie Webhooks im Backend und setzen Sie Zugriffsrechte auf Funktionen serverseitig durch. Die Berechtigungsdaten auf dem Client bestimmen lediglich, welche Funktionen die Oberfläche anzeigt.

## Beispiel für die App

Registrieren Sie den Sitzungs-Listener **vor** `initialize` und behalten Sie ihn bei, bis `reset` abgeschlossen ist. Jede Anfrage muss innerhalb von 30 Sekunden genau eine gültige Antwort erhalten. Das Plugin weist veraltete und doppelte Antworten zurück. Solange dieselbe Anfrage noch aussteht, können Sie eine ungültige Antwort korrigieren.

```ts
import { Capacitor } from '@capacitor/core';
import { StripeBilling, type CustomerSession } from '@capacitor-community/stripe-billing';

if (Capacitor.getPlatform() !== 'ios') {
  throw new Error('This subscription integration requires iOS');
}

const sessionListener = await StripeBilling.addListener('customerSessionRequested', async ({ requestId }) => {
  let session: CustomerSession | null = null;
  let failed = false;
  try {
    const response = await fetch('https://your-backend.example.com/customer-session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${await getAuthToken()}` },
    });
    if (!response.ok) throw new Error('Customer Session request failed');
    session = (await response.json()) as CustomerSession;
  } catch {
    failed = true;
  }
  try {
    await StripeBilling.setCustomerSession({ requestId, session, failed });
  } catch {
    // Die Antwort kann nach reset oder nach Ablauf der Anfragefrist ungültig sein.
    // Zeigen Sie bei weiter bestehender Anmeldung einen Authentifizierungsfehler an. Protokollieren Sie keine Secrets.
  }
});

const entitlementListener = await StripeBilling.addListener('entitlementsChanged', ({ entitlements }) => {
  updatePremiumUI(entitlements.some((item) => item.lookupKey === 'premium'));
});
const errorListener = await StripeBilling.addListener('billingError', ({ message }) => {
  showError(message);
});

await StripeBilling.initialize({
  publishableKey: 'pk_test_...',
  maximumStaleEntitlementsDuration: 300,
});

// Aktivieren Sie die Abonnementaktionen erst nach Abschluss der Initialisierung.
```

`getAuthToken`, `updatePremiumUI` und `showError` sind anwendungsspezifische Funktionen. Das Beispiel setzt einen angemeldeten Nutzer voraus. Unterstützt Ihre App anonyme Käufe, geben Sie `session: null, failed: false` nur zurück, wenn die App den anonymen Status ausdrücklich festgestellt hat. Netzwerkfehler und HTTP-401-Antworten gelten als Fehler.

### Getrennte Aktionen in der Oberfläche

Verbinden Sie jede der folgenden Funktionen mit einer eigenen Aktion in der App. Rufen Sie sie nicht als aufeinanderfolgende Schritte eines einzelnen Kaufvorgangs auf. Führen Sie SDK-Operationen nacheinander aus. Das SDK weist gleichzeitig gestartete Operationen zurück, um konkurrierende Zugriffe auf seine Caches zu vermeiden. Sitzungsanfragen können auch während einer laufenden Operation beantwortet werden. Ebenso lässt sich `reset` währenddessen aufrufen.

```ts
async function purchaseSubscription(): Promise<void> {
  await StripeBilling.presentBuyButton({ id: 'buy_btn_...' });
}

async function manageSubscription(): Promise<void> {
  await StripeBilling.presentCustomerPortal();
  // Mit { external: true } öffnet sich das Portal im Standardbrowser.
}

async function refreshAccess(): Promise<void> {
  const { active } = await StripeBilling.hasEntitlement({ lookupKey: 'premium', forceRefresh: true });
  updatePremiumUI(active);
}

async function signOutBilling(): Promise<void> {
  // Deaktivieren Sie zuerst die Abonnementaktionen in der Oberfläche Ihrer App.
  await StripeBilling.reset();
  await sessionListener.remove();
  await entitlementListener.remove();
  await errorListener.remove();
  // Registrieren Sie die Listener bei der nächsten Anmeldung und initialisieren Sie das Plugin erneut.
}
```

Rufen Sie `refreshAccess` auf, wenn der Nutzer vom externen Checkout oder Portal zur App zurückkehrt. Lassen Sie die Abonnementaktionen während der Initialisierung, laufender SDK-Operationen und eines Kontowechsels deaktiviert.

`getBuyButton({ id })` lädt die Metadaten der Kaufschaltfläche. `presentBuyButton` lädt die native Schaltfläche des SDK und zeigt sie in einem schließbaren Sheet an. Beim Antippen öffnet sich Stripe Checkout im Standardbrowser. Die Auflösung des Promise bestätigt nur die **Anzeige** der Schaltfläche. Eine Sitzung mit dem Wert `null` ermöglicht einen ausdrücklich vorgesehenen anonymen Kauf. Bei Backend-Fehlern muss `failed: true` gesetzt werden, damit daraus nicht unbemerkt ein anonymer Kauf wird.

`getActiveEntitlements({ forceRefresh: true })` gibt `{ entitlements }` zurück, `hasEntitlement` liefert `{ active }`. Scheitert eine Aktualisierung über das Netzwerk, kann das SDK zwischengespeicherte Berechtigungen verwenden. Auch `forceRefresh` liefert daher keinen Zahlungsnachweis. `entitlementsChanged` meldet, dass das SDK die Berechtigungen aktualisiert hat. Der Listener empfängt keine Live-Webhooks. Das in der App angezeigte Portal aktualisiert die Berechtigungen beim Schließen. Nach der Rückkehr vom externen Checkout oder Portal müssen Sie diese Aktualisierung selbst auslösen.

Warten Sie vor jedem Benutzerwechsel auf den Abschluss von `reset`. Der Aufruf bricht ausstehende Sitzungsanfragen und Operationen ab, schließt die Plugin-Oberfläche, leert die SDK-Caches und meldet eine leere Liste von Berechtigungen. Anschließend ist eine erneute Initialisierung erforderlich. Auch die Initialisierung leert den Cache des zugrunde liegenden SDK, da die eingebundene Version die gespeicherten Berechtigungen nicht nach Kunden trennt. Das Entfernen der Ereignis-Listener allein meldet den Nutzer nicht ab.

## Demo aus dem Repository ausprobieren

Die [Angular-Demo für Billing](https://github.com/capacitor-community/stripe/blob/v8.4.0/demo/angular/README.md#billing-demo-on-ios) erstellt automatisch temporäre Testkunden und Zugangsdaten. Das [Demo-Backend](https://github.com/capacitor-community/stripe/blob/v8.4.0/demo/server/README.md#billing-demo-private-preview-test-mode-only) dient ausschließlich anonymen Tests. Produktive Apps müssen den angemeldeten Nutzer wie oben beschrieben einem Stripe Customer zuordnen. Die öffentlich verfügbaren Zugangsdaten der Demo eignen sich nicht für die Anmeldung in einer produktiven App.

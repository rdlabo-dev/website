---
title: "Erste Schritte"
sourceRevision: "42c29e164e0fdf08f342929d6ca447a93dbf9b292a7c2a55a97698f87a3e3e46"
---
# @capacitor-community/stripe-billing

Optionale, experimentelle Integration des Stripe BillingSDK für **iOS ab Version 15 mit Capacitor 8**. Sie unterstützt Kaufschaltflächen für Abonnements, Customer Sessions, aktive Berechtigungen und das Customer Portal. Die Pakete für Payment, Identity und Terminal lassen sich weiterhin ohne das BillingSDK verwenden.

## Installation

```sh
npm install @capacitor-community/stripe-billing
npx cap sync ios
```

Verwenden Sie den **Swift Package Manager**. Für das zugrunde liegende SDK gibt es keine CocoaPods-Spezifikation. Das Plugin unterstützt CocoaPods, Android und Web nicht. Prüfen Sie vor jedem Aufruf mit `Capacitor.getPlatform() === 'ios'`, ob die App unter iOS läuft. Auf anderen Plattformen werden die Aufrufe als nicht implementiert zurückgewiesen.

Das [BillingSDK](https://github.com/stripe-samples/billing-ios-sdk) ist experimentell und setzt Zugang zu den privaten Preview-APIs von Stripe voraus. Da das SDK keine Release-Tags veröffentlicht, verwendet das Plugin die feste Revision `02416cf6bb57fa9ede1786ea8ac127ea05fa9b87`. Die API kann sich im Laufe der Preview ändern. Ein vollständiges Beispiel finden Sie in der [Anleitung zur Integration von App und Backend](/docs/integration).

Das Backend authentifiziert die Nutzer, ordnet ihnen den jeweiligen Stripe Customer zu, erstellt für jede Anfrage eine neue Customer Session, verwaltet den Katalog und prüft die Zugriffsberechtigungen. Die App verwaltet die Listener, zeigt die native Oberfläche und die Berechtigungen an und ruft bei einem Kontowechsel `reset` auf. Das Anzeigen der Kaufoberfläche bestätigt noch keine Zahlung.

Mit der [Angular-Demo für Billing](https://github.com/capacitor-community/stripe/blob/v8.4.0/demo/angular/README.md#billing-demo-on-ios) können Sie die Integration mit einem Fingertipp testen. Die anonymen Testzugangsdaten sind ausschließlich für die Demo vorgesehen. In der Produktion benötigt die App eine eigene Authentifizierung.

## API

<docgen-index>

* [`initialize(...)`](/docs/readme#initialize)
* [`setCustomerSession(...)`](/docs/readme#setcustomersession)
* [`getBuyButton(...)`](/docs/readme#getbuybutton)
* [`presentBuyButton(...)`](/docs/readme#presentbuybutton)
* [`getActiveEntitlements(...)`](/docs/readme#getactiveentitlements)
* [`hasEntitlement(...)`](/docs/readme#hasentitlement)
* [`presentCustomerPortal(...)`](/docs/readme#presentcustomerportal)
* [`reset()`](/docs/readme#reset)
* [`addListener('customerSessionRequested', ...)`](/docs/readme#addlistenercustomersessionrequested-)
* [`addListener('entitlementsChanged', ...)`](/docs/readme#addlistenerentitlementschanged-)
* [`addListener('billingError', ...)`](/docs/readme#addlistenerbillingerror-)
* [`removeAllListeners()`](/docs/readme#removealllisteners)
* [Interfaces](/docs/readme#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

Experimentelle API für iOS ab Version 15 mit Swift Package Manager. Android und Web werden nicht unterstützt.

### initialize(...)

```typescript
initialize(options: InitializeOptions) => Promise<void>
```

Registrieren Sie den Listener für customerSessionRequested vor der Initialisierung. Rufen Sie vor einem Benutzerwechsel reset auf.

| Parameter         | Typ                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#initializeoptions">InitializeOptions</a></code> |

--------------------


### setCustomerSession(...)

```typescript
setCustomerSession(options: CustomerSessionResponse) => Promise<void>
```

Beantworten Sie jede Sitzungsanfrage innerhalb von 30 Sekunden. Das Plugin weist veraltete und doppelte Antworten zurück.

| Parameter         | Typ                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **`options`** | <code><a href="#customersessionresponse">CustomerSessionResponse</a></code> |

--------------------


### getBuyButton(...)

```typescript
getBuyButton(options: { id: string; }) => Promise<BuyButton>
```

| Parameter         | Typ                         |
| ------------- | ---------------------------- |
| **`options`** | <code>{ id: string; }</code> |

**Rückgabe:** <code>Promise&lt;<a href="#buybutton">BuyButton</a>&gt;</code>

--------------------


### presentBuyButton(...)

```typescript
presentBuyButton(options: { id: string; }) => Promise<void>
```

Zeigt die native Kaufschaltfläche des SDK an. Das Promise wird aufgelöst, sobald die Schaltfläche angezeigt wird. Ob die Zahlung abgeschlossen wurde, geht daraus nicht hervor.

| Parameter         | Typ                         |
| ------------- | ---------------------------- |
| **`options`** | <code>{ id: string; }</code> |

--------------------


### getActiveEntitlements(...)

```typescript
getActiveEntitlements(options?: { forceRefresh?: boolean | undefined; } | undefined) => Promise<{ entitlements: Entitlement[]; }>
```

| Parameter         | Typ                                     |
| ------------- | ---------------------------------------- |
| **`options`** | <code>{ forceRefresh?: boolean; }</code> |

**Rückgabe:** <code>Promise&lt;{ entitlements: Entitlement[]; }&gt;</code>

--------------------


### hasEntitlement(...)

```typescript
hasEntitlement(options: { lookupKey: string; forceRefresh?: boolean; }) => Promise<{ active: boolean; }>
```

| Parameter         | Typ                                                        |
| ------------- | ----------------------------------------------------------- |
| **`options`** | <code>{ lookupKey: string; forceRefresh?: boolean; }</code> |

**Rückgabe:** <code>Promise&lt;{ active: boolean; }&gt;</code>

--------------------


### presentCustomerPortal(...)

```typescript
presentCustomerPortal(options?: { external?: boolean | undefined; } | undefined) => Promise<void>
```

Öffnet das Portal standardmäßig in der App. Das Promise wird beim Anzeigen oder Öffnen des Portals aufgelöst. Änderungen am Abonnement werden dadurch nicht bestätigt.

| Parameter         | Typ                                 |
| ------------- | ------------------------------------ |
| **`options`** | <code>{ external?: boolean; }</code> |

--------------------


### reset()

```typescript
reset() => Promise<void>
```

Bricht ausstehende Vorgänge ab, schließt die Plugin-Oberfläche und löscht die Sitzung und die Caches. Rufen Sie vor der nächsten Verwendung erneut initialize auf.

--------------------


### addListener('customerSessionRequested', ...)

```typescript
addListener(eventName: 'customerSessionRequested', listenerFunc: (event: { requestId: string; }) => void) => Promise<PluginListenerHandle>
```

Rufen Sie für jede Anfrage eine neue Customer Session von Ihrem Backend ab. Speichern Sie deren Secret niemals im Cache.

| Parameter              | Typ                                                    |
| ------------------ | ------------------------------------------------------- |
| **`eventName`**    | <code>'customerSessionRequested'</code>                 |
| **`listenerFunc`** | <code>(event: { requestId: string; }) =&gt; void</code> |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener('entitlementsChanged', ...)

```typescript
addListener(eventName: 'entitlementsChanged', listenerFunc: (event: { entitlements: Entitlement[]; }) => void) => Promise<PluginListenerHandle>
```

Das SDK löst dieses Ereignis aus, wenn es die Berechtigungen aktualisiert. Der Listener empfängt keine Push-Nachrichten des Servers.

| Parameter              | Typ                                                              |
| ------------------ | ----------------------------------------------------------------- |
| **`eventName`**    | <code>'entitlementsChanged'</code>                                |
| **`listenerFunc`** | <code>(event: { entitlements: Entitlement[]; }) =&gt; void</code> |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener('billingError', ...)

```typescript
addListener(eventName: 'billingError', listenerFunc: (event: { message: string; }) => void) => Promise<PluginListenerHandle>
```

Meldet Fehler, die beim Antippen der angezeigten nativen Kaufschaltfläche auftreten.

| Parameter              | Typ                                                  |
| ------------------ | ----------------------------------------------------- |
| **`eventName`**    | <code>'billingError'</code>                           |
| **`listenerFunc`** | <code>(event: { message: string; }) =&gt; void</code> |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### removeAllListeners()

```typescript
removeAllListeners() => Promise<void>
```

--------------------


### Interfaces


#### InitializeOptions

| Eigenschaft                                   | Typ                | Beschreibung                                                          |
| -------------------------------------- | ------------------- | -------------------------------------------------------------------- |
| **`publishableKey`**                   | <code>string</code> |                                                                      |
| **`maximumStaleEntitlementsDuration`** | <code>number</code> | Höchstalter der Berechtigungsdaten in Sekunden bis zur nächsten Aktualisierung. Der Standardwert beträgt 300. |


#### CustomerSessionResponse

| Eigenschaft            | Typ                                                                | Beschreibung                                                                           |
| --------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **`requestId`** | <code>string</code>                                                 |                                                                                       |
| **`session`**   | <code><a href="#customersession">CustomerSession</a> \| null</code> | Eine neue Sitzung. Der Wert null ist nur zulässig, wenn der Nutzer abgemeldet ist.                            |
| **`failed`**    | <code>boolean</code>                                                | Setzen Sie den Wert bei Backend- oder Netzwerkfehlern auf true, damit der Kaufvorgang nicht unbemerkt anonym fortgesetzt wird. |


#### CustomerSession

| Eigenschaft               | Typ                | Beschreibung                                                           |
| ------------------ | ------------------- | --------------------------------------------------------------------- |
| **`customer`**     | <code>string</code> |                                                                       |
| **`clientSecret`** | <code>string</code> |                                                                       |
| **`expiresAt`**    | <code>number</code> | Unix-Zeitstempel in Sekunden aus der Antwort Ihres Backends nach erfolgreicher Authentifizierung. |


#### BuyButton

| Eigenschaft               | Typ                 | Beschreibung                                                     |
| ------------------ | -------------------- | --------------------------------------------------------------- |
| **`id`**           | <code>string</code>  |                                                                 |
| **`active`**       | <code>boolean</code> |                                                                 |
| **`callToAction`** | <code>string</code>  |                                                                 |
| **`amount`**       | <code>string</code>  | Betrag in der kleinsten Einheit der Währung. Stripe liefert ihn als Zeichenfolge. |
| **`currency`**     | <code>string</code>  |                                                                 |


#### Entitlement

| Eigenschaft            | Typ                |
| --------------- | ------------------- |
| **`id`**        | <code>string</code> |
| **`feature`**   | <code>string</code> |
| **`lookupKey`** | <code>string</code> |


#### PluginListenerHandle

| Eigenschaft         | Typ                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |

</docgen-api>

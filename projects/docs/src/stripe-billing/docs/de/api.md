---
title: "API"
sourceRevision: "a9313d4df07823513328d6a473e1c199d2cbea41774f94a39433b187a38c871e"
---
* [`initialize(...)`](#initialize)
* [`setCustomerSession(...)`](#setcustomersession)
* [`getBuyButton(...)`](#getbuybutton)
* [`presentBuyButton(...)`](#presentbuybutton)
* [`getActiveEntitlements(...)`](#getactiveentitlements)
* [`hasEntitlement(...)`](#hasentitlement)
* [`presentCustomerPortal(...)`](#presentcustomerportal)
* [`reset()`](#reset)
* [`addListener('customerSessionRequested', ...)`](#addlistenercustomersessionrequested-)
* [`addListener('entitlementsChanged', ...)`](#addlistenerentitlementschanged-)
* [`addListener('billingError', ...)`](#addlistenerbillingerror-)
* [`removeAllListeners()`](#removealllisteners)
* [Interfaces](#interfaces)

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

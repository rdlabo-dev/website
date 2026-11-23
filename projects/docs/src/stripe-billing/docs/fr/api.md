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

<!-- Pour actualiser cette référence, modifiez les commentaires JSDoc du fichier source puis relancez docgen. -->

Intégration expérimentale réservée à iOS 15 ou ultérieur avec Swift Package Manager. Android et le Web ne sont pas pris en charge.

### initialize(...)

```typescript
initialize(options: InitializeOptions) => Promise<void>
```

Enregistrez l’écouteur customerSessionRequested avant l’initialisation. Appelez reset avant de changer d’utilisateur.

| Paramètre         | Type                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#initializeoptions">InitializeOptions</a></code> |

--------------------

### setCustomerSession(...)

```typescript
setCustomerSession(options: CustomerSessionResponse) => Promise<void>
```

Répondez une seule fois à chaque demande de session, dans un délai de 30 secondes. Les réponses périmées ou en double sont rejetées.

| Paramètre         | Type                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **`options`** | <code><a href="#customersessionresponse">CustomerSessionResponse</a></code> |

--------------------

### getBuyButton(...)

```typescript
getBuyButton(options: { id: string; }) => Promise<BuyButton>
```

| Paramètre         | Type                         |
| ------------- | ---------------------------- |
| **`options`** | <code>{ id: string; }</code> |

**Renvoie :** <code>Promise&lt;<a href="#buybutton">BuyButton</a>&gt;</code>

--------------------

### presentBuyButton(...)

```typescript
presentBuyButton(options: { id: string; }) => Promise<void>
```

Affiche le bouton d’achat natif du SDK. La promesse se résout dès son affichage, avant toute confirmation de paiement.

| Paramètre         | Type                         |
| ------------- | ---------------------------- |
| **`options`** | <code>{ id: string; }</code> |

--------------------

### getActiveEntitlements(...)

```typescript
getActiveEntitlements(options?: { forceRefresh?: boolean | undefined; } | undefined) => Promise<{ entitlements: Entitlement[]; }>
```

| Paramètre         | Type                                     |
| ------------- | ---------------------------------------- |
| **`options`** | <code>{ forceRefresh?: boolean; }</code> |

**Renvoie :** <code>Promise&lt;{ entitlements: Entitlement[]; }&gt;</code>

--------------------

### hasEntitlement(...)

```typescript
hasEntitlement(options: { lookupKey: string; forceRefresh?: boolean; }) => Promise<{ active: boolean; }>
```

| Paramètre         | Type                                                        |
| ------------- | ----------------------------------------------------------- |
| **`options`** | <code>{ lookupKey: string; forceRefresh?: boolean; }</code> |

**Renvoie :** <code>Promise&lt;{ active: boolean; }&gt;</code>

--------------------

### presentCustomerPortal(...)

```typescript
presentCustomerPortal(options?: { external?: boolean | undefined; } | undefined) => Promise<void>
```

Ouvre par défaut le portail dans l’application. La promesse se résout dès l’affichage du portail ou l’ouverture du navigateur, indépendamment de toute modification de l’abonnement.

| Paramètre         | Type                                 |
| ------------- | ------------------------------------ |
| **`options`** | <code>{ external?: boolean; }</code> |

--------------------

### reset()

```typescript
reset() => Promise<void>
```

Annule les opérations en cours, ferme l’interface du plugin et efface la session et les caches. Rappelez initialize avant de réutiliser le plugin.

--------------------

### addListener('customerSessionRequested', ...)

```typescript
addListener(eventName: 'customerSessionRequested', listenerFunc: (event: { requestId: string; }) => void) => Promise<PluginListenerHandle>
```

Demandez une nouvelle Customer Session à votre serveur pour chaque requête. Ne mettez jamais son secret en cache.

| Paramètre              | Type                                                    |
| ------------------ | ------------------------------------------------------- |
| **`eventName`**    | <code>'customerSessionRequested'</code>                 |
| **`listenerFunc`** | <code>(event: { requestId: string; }) =&gt; void</code> |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------

### addListener('entitlementsChanged', ...)

```typescript
addListener(eventName: 'entitlementsChanged', listenerFunc: (event: { entitlements: Entitlement[]; }) => void) => Promise<PluginListenerHandle>
```

Signale que le SDK a actualisé les droits d’accès. Cet événement ne constitue pas un abonnement aux notifications du serveur.

| Paramètre              | Type                                                              |
| ------------------ | ----------------------------------------------------------------- |
| **`eventName`**    | <code>'entitlementsChanged'</code>                                |
| **`listenerFunc`** | <code>(event: { entitlements: Entitlement[]; }) =&gt; void</code> |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------

### addListener('billingError', ...)

```typescript
addListener(eventName: 'billingError', listenerFunc: (event: { message: string; }) => void) => Promise<PluginListenerHandle>
```

Signale une erreur survenue lorsque l’utilisateur appuie sur le bouton d’achat natif affiché.

| Paramètre              | Type                                                  |
| ------------------ | ----------------------------------------------------- |
| **`eventName`**    | <code>'billingError'</code>                           |
| **`listenerFunc`** | <code>(event: { message: string; }) =&gt; void</code> |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------

### removeAllListeners()

```typescript
removeAllListeners() => Promise<void>
```

--------------------

### Interfaces

#### InitializeOptions

| Propriété                                   | Type                | Description                                                          |
| -------------------------------------- | ------------------- | -------------------------------------------------------------------- |
| **`publishableKey`**                   | <code>string</code> |                                                                      |
| **`maximumStaleEntitlementsDuration`** | <code>number</code> | Âge maximal des droits d’accès en cache, en secondes, avant leur actualisation. La valeur par défaut est de 300 secondes. |

#### CustomerSessionResponse

| Propriété            | Type                                                                | Description                                                                           |
| --------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **`requestId`** | <code>string</code>                                                 |                                                                                       |
| **`session`**   | <code><a href="#customersession">CustomerSession</a> \| null</code> | Une nouvelle session, ou null uniquement si l’utilisateur est déconnecté.                            |
| **`failed`**    | <code>boolean</code>                                                | Passez la valeur true en cas d’échec du serveur ou du réseau pour éviter de basculer silencieusement vers un achat anonyme. |

#### CustomerSession

| Propriété               | Type                | Description                                                           |
| ------------------ | ------------------- | --------------------------------------------------------------------- |
| **`customer`**     | <code>string</code> |                                                                       |
| **`clientSecret`** | <code>string</code> |                                                                       |
| **`expiresAt`**    | <code>number</code> | Horodatage Unix en secondes, tel que le renvoie votre serveur après authentification. |

#### BuyButton

| Propriété               | Type                 | Description                                                     |
| ------------------ | -------------------- | --------------------------------------------------------------- |
| **`id`**           | <code>string</code>  |                                                                 |
| **`active`**       | <code>boolean</code> |                                                                 |
| **`callToAction`** | <code>string</code>  |                                                                 |
| **`amount`**       | <code>string</code>  | Montant exprimé dans la plus petite unité de la devise et fourni par Stripe sous forme de chaîne de caractères. |
| **`currency`**     | <code>string</code>  |                                                                 |

#### Entitlement

| Propriété            | Type                |
| --------------- | ------------------- |
| **`id`**        | <code>string</code> |
| **`feature`**   | <code>string</code> |
| **`lookupKey`** | <code>string</code> |

#### PluginListenerHandle

| Propriété         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |

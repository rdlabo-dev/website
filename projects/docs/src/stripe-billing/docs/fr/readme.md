---
title: "Prise en main"
sourceRevision: "42c29e164e0fdf08f342929d6ca447a93dbf9b292a7c2a55a97698f87a3e3e46"
---
# @capacitor-community/stripe-billing

Ce plugin propose une intégration facultative et expérimentale du BillingSDK de Stripe pour **iOS 15 ou ultérieur avec Capacitor 8**. Il prend en charge les boutons d’achat d’abonnements, les Customer Sessions, les droits d’accès actifs et le Customer Portal. Les packages Payment, Identity et Terminal restent indépendants de BillingSDK.

## Installation

```sh
npm install @capacitor-community/stripe-billing
npx cap sync ios
```

Pour intégrer le SDK natif, utilisez **Swift Package Manager**. Le SDK ne fournit pas de spécification CocoaPods. Ce package ne prend en charge ni CocoaPods, ni Android, ni le Web. Avant tout appel, vérifiez que `Capacitor.getPlatform() === 'ios'`. Sur les plateformes non prises en charge, les appels sont rejetés comme non implémentés.

Le [BillingSDK](https://github.com/stripe-samples/billing-ios-sdk) est expérimental et nécessite un accès aux API en préversion privée de Stripe. La dépendance est fixée à la révision `02416cf6bb57fa9ede1786ea8ac127ea05fa9b87`, car le dépôt du SDK ne publie pas de tags de version. L’API peut évoluer au fil de la préversion. Consultez le [guide d’intégration et son exemple côté serveur](/docs/integration).

Le serveur authentifie l’utilisateur, l’associe à son Customer Stripe, crée une Customer Session pour chaque demande, configure le catalogue et contrôle les droits d’accès. L’application gère les écouteurs, les actions dans l’interface native et l’affichage des droits d’accès. Elle appelle `reset` à chaque changement de compte. L’affichage de l’interface d’achat ne confirme pas le paiement.

Pour essayer cette intégration d’un seul geste, utilisez la [démo Angular de Billing](/docs/demo/angular/README#billing-demo-on-ios). Les identifiants de test anonymes de la démo sont distincts des identifiants utilisés pour l’authentification en production.

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

</docgen-api>

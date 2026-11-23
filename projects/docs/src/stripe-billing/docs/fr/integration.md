---
title: "Abonnements iOS avec Stripe Billing"
sourceRevision: "6a78acb1cdfdbdabfb15ca12160f8b089f40ee1787ca6ce3a177739f5097eec2"
---
# Abonnements iOS avec Stripe Billing

Ce package donne accès au [BillingSDK expérimental de Stripe](https://docs.stripe.com/billing/subscriptions/manage-ios). Utilisez un compte autorisé à participer à la préversion. Avant d’activer les achats, vérifiez leur éligibilité et les exigences de l’App Store applicables à votre application et à la boutique où elle est distribuée.

## Responsabilités du serveur

Authentifiez l’utilisateur de l’application, retrouvez son Customer Stripe sur le serveur et créez une **nouvelle Customer Session** à chaque événement `customerSessionRequested`. N’acceptez jamais d’identifiant Customer fourni par un client qui n’est pas digne de confiance. Ne placez aucune clé API secrète Stripe dans l’application, ne consignez pas le secret renvoyé dans les journaux et ne réutilisez pas le secret d’une Customer Session pour une autre demande.

Activez `buy_button`, `active_entitlements` et `customer_portal` sur la Customer Session. Renvoyez les champs suivants.

```json
{
  "customer": "cus_...",
  "clientSecret": "cuss_...",
  "expiresAt": 1800000000
}
```

`expiresAt` est un horodatage Unix exprimé en **secondes**, et non en millisecondes. Renvoyez une réponse HTTP 401 pour les requêtes non authentifiées. Si l’authentification d’un utilisateur connecté est refusée ou a expiré, l’application doit traiter cet échec et lui demander de se reconnecter. Elle ne doit pas le faire basculer silencieusement vers un achat anonyme.

La version du SDK natif utilisée ici envoie ses requêtes avec la version `2025-07-30.basil` de l’API Stripe et utilise les points de terminaison de la préversion privée. Le guide en ligne de Stripe utilise la version `2026-08-26.dahlia` ou ultérieure côté serveur. Vérifiez que votre préversion accepte à la fois la version du SDK intégrée et la version d’API utilisée par votre serveur. Adopter une version d’API plus récente côté serveur ne donne pas, à lui seul, accès à la préversion.

Voici un exemple à intégrer dans un gestionnaire de requêtes existant qui authentifie l’utilisateur et utilise le SDK serveur de Stripe.

```ts
// user provient du middleware du serveur qui a vérifié l’identité de l’utilisateur.
// stripe est le client Stripe du serveur configuré pour votre préversion.
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

Si ces composants sont encore absents du SDK stable, utilisez le SDK serveur de Stripe et les types fournis pour votre préversion. Configurez dans Stripe les boutons d’achat, les tarifs des abonnements, les droits associés aux produits et le Customer Portal. Vérifiez les webhooks sur le serveur et faites-y appliquer les règles d’accès aux fonctionnalités. Les droits dont dispose le client servent uniquement à déterminer les éléments à afficher dans l’interface.

## Exemple côté application

Enregistrez l’écouteur de session **avant** `initialize` et conservez-le jusqu’à la fin de `reset`. Chaque demande doit recevoir une seule réponse dans un délai de 30 secondes. Les réponses périmées ou en double sont rejetées. Vous pouvez corriger une réponse invalide tant que la demande correspondante est en attente.

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
    // reset ou l’expiration du délai de la requête a pu invalider cette réponse.
    // Si l’utilisateur est toujours connecté, affichez une erreur d’authentification. Ne consignez aucun secret.
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

// Activez les actions liées aux abonnements une fois l’initialisation terminée.
```

Les fonctions `getAuthToken`, `updatePremiumUI` et `showError` sont propres à votre application. L’exemple suppose que l’utilisateur est connecté. Si votre application autorise les achats anonymes, renvoyez `session: null, failed: false` uniquement après avoir établi que l’utilisateur n’est pas connecté. Traitez les erreurs réseau et les réponses HTTP 401 comme des échecs.

### Actions distinctes dans l’interface

Associez chacune de ces fonctions à une action distincte dans l’application. Elles ne forment pas une séquence à exécuter lors d’un achat. Exécutez les opérations du SDK une par une. Si vous lancez une opération pendant qu’une autre est en cours, elle est rejetée pour éviter des accès concurrents aux caches du SDK. Vous pouvez toutefois répondre à une demande de session ou appeler `reset` pendant une opération.

```ts
async function purchaseSubscription(): Promise<void> {
  await StripeBilling.presentBuyButton({ id: 'buy_btn_...' });
}

async function manageSubscription(): Promise<void> {
  await StripeBilling.presentCustomerPortal();
  // Utilisez { external: true } pour ouvrir le portail dans le navigateur par défaut.
}

async function refreshAccess(): Promise<void> {
  const { active } = await StripeBilling.hasEntitlement({ lookupKey: 'premium', forceRefresh: true });
  updatePremiumUI(active);
}

async function signOutBilling(): Promise<void> {
  // Désactivez d’abord les actions liées aux abonnements dans l’interface.
  await StripeBilling.reset();
  await sessionListener.remove();
  await entitlementListener.remove();
  await errorListener.remove();
  // À la prochaine connexion, enregistrez les écouteurs et relancez l’initialisation.
}
```

Appelez `refreshAccess` lorsque l’utilisateur revient dans l’application depuis la page de paiement externe ou le portail externe. Désactivez les actions liées aux abonnements pendant l’initialisation, pendant toute autre opération du SDK et lors d’un changement de compte.

`getBuyButton({ id })` charge les métadonnées du bouton. `presentBuyButton` charge le bouton natif du SDK et l’affiche dans un panneau que l’utilisateur peut fermer. Un appui sur le bouton ouvre la page de paiement Stripe dans le navigateur par défaut. La résolution de la promesse confirme **l’affichage du bouton** et ne garantit pas le paiement. Une session `null` permet de proposer délibérément un achat anonyme. Si le serveur échoue, indiquez `failed: true` pour empêcher tout achat anonyme involontaire.

`getActiveEntitlements({ forceRefresh: true })` renvoie `{ entitlements }` et `hasEntitlement` renvoie `{ active }`. Si l’actualisation sur le réseau échoue, le SDK peut utiliser les droits d’accès en cache. Même avec `forceRefresh`, le résultat ne prouve pas qu’un paiement a abouti. L’événement `entitlementsChanged` signale une actualisation par le SDK. Il ne s’agit pas d’un abonnement en temps réel aux webhooks. La fermeture du portail intégré déclenche l’actualisation des droits. Après un retour depuis la page de paiement ou le portail externe, déclenchez explicitement cette actualisation.

Attendez toujours la fin de `reset` avant de changer d’utilisateur. Cet appel annule les demandes de session et les opérations en attente, ferme l’interface du plugin, efface les caches du SDK et émet une liste vide de droits d’accès. Il faut ensuite réinitialiser le plugin. L’initialisation efface aussi le cache du SDK, car la version utilisée conserve les droits d’accès sans les isoler par Customer. Supprimer uniquement les écouteurs ne déconnecte pas l’utilisateur.

## Essayer la démo du dépôt

La [démo Angular de Billing](../../../demo/angular/README.md#billing-demo-on-ios) crée automatiquement des clients et des identifiants temporaires de test. Son [serveur de démonstration](../../../demo/server/README.md#billing-demo-private-preview-test-mode-only) autorise l’accès anonyme pour les tests uniquement. En production, votre application doit authentifier l’utilisateur et l’associer au Customer correspondant, comme indiqué plus haut. L’identifiant public de la démo ne permet pas d’authentifier un utilisateur en production.

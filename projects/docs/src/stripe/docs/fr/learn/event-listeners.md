---
title: "Écouteurs d’événements"
code: []
scrollActiveLine: []
sourceRevision: "d090def7f677a3530555dd6b1f91d7f656a6beaadae60b432e0a4897d0bc4203"
---
Utilisez les événements de résultat comme parcours de résultat par défaut. Enregistrez les écouteurs de résultat au niveau de l’application une seule fois par démarrage de l’application JavaScript, aussi tôt que possible — par exemple dans `main.ts`, un initialiseur d’application ou un service singleton initialisé au démarrage — et avant de présenter l’interface Stripe.

```ts
import {
  ApplePayEventsEnum,
  GooglePayEventsEnum,
  PaymentFlowEventsEnum,
  PaymentSheetEventsEnum,
  Stripe,
} from '@capacitor-community/stripe';

await Promise.all([
  Stripe.addListener(PaymentSheetEventsEnum.Completed, () => handleCompleted()),
  Stripe.addListener(PaymentSheetEventsEnum.Canceled, () => handleCanceled()),
  Stripe.addListener(PaymentSheetEventsEnum.Failed, (error) => handleFailed(error)),
]);
```

!::PluginListenerHandle::

## Recréation de l’Activity Android

C’est particulièrement important sur Android, où l’Activity et l’environnement JavaScript peuvent être recréés alors que l’interface Stripe est ouverte. Le nouvel environnement JavaScript doit enregistrer ses écouteurs au démarrage.

La Promise JavaScript d’origine et le `PluginCall` Capacitor ne peuvent pas être restaurés. Si Stripe fournit le résultat natif après la recréation, le plugin conserve l’événement de résultat correspondant jusqu’à ce qu’un écouteur soit disponible. Cela concerne les événements `Completed`, `Canceled` et `Failed` de PaymentSheet, PaymentFlow et Google Pay, ainsi que l’événement `Created` de PaymentFlow.

Si l’appel d’origine existe encore, le comportement reste identique : la Promise se termine normalement et l’événement est transmis sans être conservé. Ce mécanisme de secours transmet un résultat natif en mémoire ; il ne constitue pas un stockage persistant et ne garantit pas la récupération après l’arrêt du processus par le système.

Gardez les écouteurs de résultat au niveau de l’application enregistrés pendant toute la durée de vie de l’environnement JavaScript. Ne les ajoutez pas dans le gestionnaire d’un bouton pour les supprimer au démontage d’une page si vous avez encore besoin du résultat du paiement après une recréation Android.

## Événements PaymentSheet

!::addListener.PaymentSheetEventsEnum::

!::PaymentSheetEventsEnum::

Déroulement habituel de PaymentSheet :

1. Enregistrez les écouteurs de résultat au démarrage.
2. Appelez `createPaymentSheet()`.
3. Attendez `Loaded`, ou traitez `FailedToLoad`.
4. Appelez `presentPaymentSheet()`.
5. Recevez `Completed`, `Canceled` ou `Failed`.

`Canceled` signifie que le client a fermé la feuille. Traitez-le comme une annulation, pas comme une erreur levée. `Failed` et `FailedToLoad` contiennent une chaîne d’erreur. N’exécutez pas une commande sur la seule base de l’événement client ; confirmez le PaymentIntent ou SetupIntent avec un [webhook](/docs/server-integration).

## Événements PaymentFlow

!::addListener.PaymentFlowEventsEnum::

!::PaymentFlowEventsEnum::

Déroulement habituel de PaymentFlow :

1. Enregistrez les écouteurs de résultat au démarrage.
2. Appelez `createPaymentFlow()`.
3. Attendez `Loaded`, ou traitez `FailedToLoad`.
4. Appelez `presentPaymentFlow()`.
5. Recevez `Opened`, puis `Created` avec `{ cardNumber }`, ou `Canceled`.
6. Appelez `confirmPaymentFlow()`.
7. Recevez `Completed`, `Canceled` ou `Failed`.

## Événements Apple Pay

!::addListener.ApplePayEventsEnum::

!::ApplePayEventsEnum::

`DidSelectShippingContact` contient `contact` et `updateId`. Sur iOS, appelez `updateApplePaySheet` avec cet `updateId` et les `paymentSummaryItems` mis à jour. Si JavaScript ne répond pas, la feuille native revient aux éléments initiaux au bout de 25 secondes. `updateApplePaySheet` n’est pas implémenté sur Android ni sur le Web.

`DidCreatePaymentMethod` contient le `contact` de livraison. Apple ne renvoie l’adresse complète qu’après un paiement réussi.

## Événements Google Pay

!::addListener.GooglePayEventsEnum::

!::GooglePayEventsEnum::

Google Pay est disponible sur Android et sur le Web. Il n’est pas implémenté sur iOS.

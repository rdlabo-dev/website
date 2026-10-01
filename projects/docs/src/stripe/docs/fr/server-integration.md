---
title: "Intégration serveur"
code: []
scrollActiveLine: []
sourceRevision: "9932153511793954d3be0e000f71f10a62aaf70d0285041ed7be7b936c3960e4"
---
`@capacitor-community/stripe` accepte uniquement des valeurs pouvant être utilisées côté client. Votre backend crée les PaymentIntents, SetupIntents, Customers et clés éphémères avec la clé secrète Stripe. Le plugin n’appelle jamais l’API secrète.

## Garder la clé secrète côté serveur

Conservez `sk_live_...` et `sk_test_...` sur le serveur. Ne transmettez à l’application que la clé publique, via `Stripe.initialize` ou les métadonnées Google Pay d’Android. N’intégrez pas la clé secrète dans la configuration Capacitor, le contrôle de version ou les journaux client.

## Secrets clients

Créez un [PaymentIntent](https://stripe.com/docs/payments/payment-intents) pour débiter immédiatement, ou un [SetupIntent](https://stripe.com/docs/payments/save-and-reuse) pour enregistrer un moyen de paiement pour plus tard. Renvoyez à l’application le **secret client** de l’Intent, pas la clé secrète ni une opération de débit brute.

Les clés éphémères de Customer sont facultatives. Utilisez-les avec un identifiant Customer lorsque PaymentSheet ou PaymentFlow doit afficher les moyens de paiement enregistrés. Si vous passez `customerId` au plugin, vous devez également passer `customerEphemeralKeySecret`. Un PaymentIntent sans Customer est valide.

Correspondance entre les champs serveur et les options du plugin :

| Champ serveur | Option du plugin |
| --- | --- |
| `paymentIntent` | `paymentIntentClientSecret` |
| `setupIntent` | `setupIntentClientSecret` |
| `ephemeralKey` | `customerEphemeralKeySecret` |
| `customer` | `customerId` |

## Structures de réponse

PaymentIntent avec un Customer :

```json
{
  "paymentIntent": "pi_..._secret_...",
  "ephemeralKey": "ek_...",
  "customer": "cus_..."
}
```

SetupIntent avec un Customer :

```json
{
  "setupIntent": "seti_..._secret_...",
  "ephemeralKey": "ek_...",
  "customer": "cus_..."
}
```

PaymentIntent sans Customer :

```json
{
  "paymentIntent": "pi_..._secret_..."
}
```

Apple Pay utilise un secret client de PaymentIntent. Sur le Web, Google Pay utilise un secret client de PaymentIntent ; Android accepte également un secret client de SetupIntent via l’option historiquement nommée `paymentIntentClientSecret`. En natif, PaymentSheet et PaymentFlow acceptent le secret de l’un ou l’autre Intent, avec ou sans champs Customer. L’implémentation Web actuelle de PaymentSheet n’accepte que les PaymentIntents ; celle de PaymentFlow accepte les deux types d’Intent.

## Les webhooks font autorité

`Completed` sur l’appareil est un signal d’interface. Il ne prouve pas que Stripe a capturé les fonds. Exécutez les commandes à partir de [webhooks Stripe](https://docs.stripe.com/webhooks) vérifiés, comme `payment_intent.succeeded` ou `setup_intent.succeeded`.

Traitez `Canceled` comme la fermeture de la feuille par le client. Traitez `Failed` et `FailedToLoad` comme des erreurs. Lorsque l’Intent précédent ne peut plus être confirmé, ne réessayez qu’après avoir créé un nouvel Intent.

Le serveur de démonstration officiel qui renvoie les structures ci-dessus se trouve dans [capacitor-community/stripe/demo/server](https://github.com/capacitor-community/stripe/tree/main/demo/server).

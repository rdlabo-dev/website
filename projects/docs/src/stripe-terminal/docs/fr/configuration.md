---
title: "Configuration"
code: []
scrollActiveLine: []
sourceRevision: "4e4f3fb18a84133e8c1585ec8c36516d6bce1c6e9eb1861923a10f82246054b5"
---
Installez Stripe Terminal et synchronisez les projets Capacitor natifs.

```bash
npm install @capacitor-community/stripe-terminal
npx cap sync
```

Le plugin est `@capacitor-community/stripe-terminal` **v8.2.1**. Démos officielles :

- [Tap to Pay / Internet / Bluetooth](https://github.com/capacitor-community/stripe/tree/main/demo/angular)
- [Apps on Devices](https://github.com/capacitor-community/stripe/tree/main/demo/app-on-devices)

| Prérequis             | Minimum |
| ----------------------- | ------- |
| Capacitor               | 8       |
| iOS                     | 15.0    |
| Android `minSdkVersion` | 26      |

## Choisir une plateforme et un type de connexion

`discoverReaders` reçoit une valeur `TerminalConnectTypes`. Choisissez un type de connexion pris en charge par votre plateforme, puis appliquez uniquement les réglages requis pour cette plateforme ci-dessous.

| `TerminalConnectTypes` | Web                               | iOS                              | Android                        |
| ---------------------- | --------------------------------- | -------------------------------- | ------------------------------ |
| `Internet`             | Oui — **seul type pris en charge** | Oui                              | Oui                            |
| `Bluetooth`            | Non                                | Oui                              | Oui                            |
| `TapToPay`             | Non                                | Oui                              | Oui                            |
| `Usb`                  | Non                                | Non implémenté                    | Oui                            |
| `HandOff`              | Non                                | Non implémenté                    | Oui (Apps on Devices)          |
| `Simulated`            | Non                                | Non implémenté comme type de recherche | Traité comme une recherche Bluetooth |

Sur chaque plateforme, transmettez `isTest: true` à `initialize` pour utiliser des lecteurs simulés avec un type de connexion **pris en charge**. Ne vous appuyez pas sur `TerminalConnectTypes.Simulated` sur iOS ou le Web ; utilisez plutôt `Internet`, `Bluetooth` ou `TapToPay` avec `isTest: true`.

Sur le Web, `discoverReaders` rejette tout type autre que `Internet` avec une erreur indiquant son indisponibilité.

## Configuration Web

Aucune étape supplémentaire n’est nécessaire. Seuls les lecteurs Internet sont disponibles.

## Configuration iOS

Le plugin ne nécessite aucune étape supplémentaire. USB, HandOff et `setTapToPayUxConfiguration` ne sont pas implémentés sur iOS.

## Configuration Android

Ajoutez les autorisations à votre fichier `android/app/src/main/AndroidManifest.xml` :

```diff
+ <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
+ <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
+ <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
+ <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
+ <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
+ <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

`discoverReaders` est rejeté si `ACCESS_FINE_LOCATION` n’a pas été accordée à l’exécution.

Mettez également `minSdkVersion` à `26` dans votre fichier `android/variables.gradle` :

```diff
  ext {
-    minSdkVersion = 24
+    minSdkVersion = 26
```

Si vous développez des applications pour des appareils Android Stripe (par exemple Stripe Reader S700) avec `TerminalConnectTypes.HandOff`, suivez le [guide de configuration côté client de Stripe](https://docs.stripe.com/terminal/features/apps-on-devices/build?terminal-sdk-platform=android&lang-android=java#setup-app).

## Étape suivante

Après les réglages de plateforme requis ci-dessus, poursuivez avec [Encaisser un paiement](/docs/collect-a-payment).

## Référence des plateformes

### API propres à une plateforme

| API                          | Web                  | iOS                                 | Android                                               |
| ---------------------------- | -------------------- | ----------------------------------- | ----------------------------------------------------- |
| `setTapToPayUxConfiguration` | Sans effet (journalisation uniquement)    | Non implémenté                       | Oui — après `initialize`, avant `connectReader` |
| `isTapToPayAccountLinked`    | Indisponible (lève une erreur) | Oui — iOS 16.4+, après `initialize` | Non implémenté                                         |

Consultez [Tap to Pay](/docs/tap-to-pay) pour l’ordre de configuration et les limitations.

### Méthodes de cycle de vie sans effet ou non prises en charge sur le Web

Ces méthodes existent dans l’interface du plugin, mais ne pilotent pas le SDK JavaScript Stripe Terminal sur le Web :

- `cancelDiscoverReaders` — sans effet
- `setSimulatorConfiguration` — sans effet
- `installAvailableUpdate` — sans effet
- `cancelInstallUpdate` — sans effet
- `rebootReader` — sans effet
- `cancelReaderReconnection` — sans effet
- `setTapToPayUxConfiguration` — sans effet

`isTapToPayAccountLinked` lève `unavailable` sur le Web.

Les lecteurs Internet sur le Web prennent toujours en charge `initialize`, `discoverReaders`, `connectReader`, `getConnectedReader`, `disconnectReader`, `collectPaymentMethod`, `cancelCollectPaymentMethod`, `confirmPaymentIntent`, `setReaderDisplay`, `clearReaderDisplay`, `setConnectionToken` ainsi que les écouteurs d’état de connexion et de paiement.

---
title: "Konfiguration"
code: []
scrollActiveLine: []
sourceRevision: "4e4f3fb18a84133e8c1585ec8c36516d6bce1c6e9eb1861923a10f82246054b5"
---
Installieren Sie Stripe Terminal und synchronisieren Sie die nativen Capacitor-Projekte.

```bash
npm install @capacitor-community/stripe-terminal
npx cap sync
```

Das Plugin ist `@capacitor-community/stripe-terminal` **v8.2.1**. Offizielle Demos:

- [Tap to Pay / Internet / Bluetooth](https://github.com/capacitor-community/stripe/tree/main/demo/angular)
- [Apps on Devices](https://github.com/capacitor-community/stripe/tree/main/demo/app-on-devices)

| Voraussetzung             | Minimum |
| ----------------------- | ------- |
| Capacitor               | 8       |
| iOS                     | 15.0    |
| Android `minSdkVersion` | 26      |

## Plattform und Verbindungstyp wählen

`discoverReaders` erhält einen Wert aus `TerminalConnectTypes`. Wählen Sie einen von Ihrer Plattform unterstützten Verbindungstyp und nehmen Sie anschließend nur die unten für diese Plattform erforderlichen Einstellungen vor.

| `TerminalConnectTypes` | Web                               | iOS                              | Android                        |
| ---------------------- | --------------------------------- | -------------------------------- | ------------------------------ |
| `Internet`             | Ja — **der einzige unterstützte Typ** | Ja                              | Ja                            |
| `Bluetooth`            | Nein                                | Ja                              | Ja                            |
| `TapToPay`             | Nein                                | Ja                              | Ja                            |
| `Usb`                  | Nein                                | Nicht implementiert                    | Ja                            |
| `HandOff`              | Nein                                | Nicht implementiert                    | Ja (Apps on Devices)          |
| `Simulated`            | Nein                                | Als Suchtyp nicht implementiert | Wird als Bluetooth-Suche behandelt |

Übergeben Sie auf jeder Plattform `isTest: true` an `initialize`, wenn Sie simulierte Lesegeräte für einen **unterstützten** Verbindungstyp verwenden möchten. Verlassen Sie sich unter iOS oder im Web nicht auf `TerminalConnectTypes.Simulated`; verwenden Sie stattdessen `Internet`, `Bluetooth` oder `TapToPay` mit `isTest: true`.

Im Web weist `discoverReaders` alle Typen außer `Internet` mit einem Fehler wegen Nichtverfügbarkeit zurück.

## Webkonfiguration

Es sind keine weiteren Schritte erforderlich. Nur Internet-Lesegeräte sind verfügbar.

## iOS-Konfiguration

Für das Plugin sind keine weiteren Schritte erforderlich. USB, HandOff und `setTapToPayUxConfiguration` sind unter iOS nicht implementiert.

## Android-Konfiguration

Fügen Sie Ihrem Dokument `android/app/src/main/AndroidManifest.xml` die Berechtigungen hinzu:

```diff
+ <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
+ <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
+ <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
+ <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
+ <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
+ <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

`discoverReaders` wird abgewiesen, wenn `ACCESS_FINE_LOCATION` nicht zur Laufzeit erteilt wurde.

Setzen Sie außerdem `minSdkVersion` in Ihrer Datei `android/variables.gradle` auf `26`:

```diff
  ext {
-    minSdkVersion = 24
+    minSdkVersion = 26
```

Wenn Sie Apps für Stripe-Android-Geräte (etwa Stripe Reader S700) entwickeln und `TerminalConnectTypes.HandOff` verwenden, folgen Sie der [Anleitung von Stripe zur clientseitigen Einrichtung](https://docs.stripe.com/terminal/features/apps-on-devices/build?terminal-sdk-platform=android&lang-android=java#setup-app).

## Nächster Schritt

Nach den oben beschriebenen erforderlichen Plattformeinstellungen fahren Sie mit [Eine Zahlung abwickeln](/docs/collect-a-payment) fort.

## Plattformreferenz

### Plattformspezifische APIs

| API                          | Web                  | iOS                                 | Android                                               |
| ---------------------------- | -------------------- | ----------------------------------- | ----------------------------------------------------- |
| `setTapToPayUxConfiguration` | Ohne Wirkung (nur Protokollierung)    | Nicht implementiert                       | Ja — nach `initialize`, vor `connectReader` aufrufen |
| `isTapToPayAccountLinked`    | Nicht verfügbar (löst einen Fehler aus) | Ja — iOS 16.4+, nach `initialize` | Nicht implementiert                                         |

Die Einrichtungsreihenfolge und Einschränkungen finden Sie unter [Tap to Pay](/docs/tap-to-pay).

### Wirkungslose und nicht unterstützte Lebenszyklusmethoden im Web

Diese Methoden sind in der Plugin-Schnittstelle vorhanden, steuern im Web jedoch nicht das Stripe Terminal JS SDK:

- `cancelDiscoverReaders` — ohne Wirkung
- `setSimulatorConfiguration` — ohne Wirkung
- `installAvailableUpdate` — ohne Wirkung
- `cancelInstallUpdate` — ohne Wirkung
- `rebootReader` — ohne Wirkung
- `cancelReaderReconnection` — ohne Wirkung
- `setTapToPayUxConfiguration` — ohne Wirkung

`isTapToPayAccountLinked` löst im Web `unavailable` aus.

Internet-Lesegeräte im Web unterstützen weiterhin `initialize`, `discoverReaders`, `connectReader`, `getConnectedReader`, `disconnectReader`, `collectPaymentMethod`, `cancelCollectPaymentMethod`, `confirmPaymentIntent`, `setReaderDisplay`, `clearReaderDisplay`, `setConnectionToken` sowie die Listener für Verbindungs- und Zahlungsstatus.

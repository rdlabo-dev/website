---
title: "Installation"
sourceRevision: "63fea17549a0e04d66abf569879ba2582e0b0b4eaccdc4fe19fba114157d7748"
---
# Installation

## Installation

```
npm install @rdlabo/capacitor-brotherprint
```

Das veröffentlichte Plugin-Paket deklariert eine SPM-Abhängigkeit von einem **lokalen** Brother-Kit im Stammverzeichnis Ihrer App:

`ios/LocalPackages/BRLMPrinterKit`

Dieser Pfad ist relativ zu `node_modules/@rdlabo/capacitor-brotherprint` (`../../../ios/LocalPackages/BRLMPrinterKit`). Legen Sie das Brother iOS SDK wie unten gezeigt im `ios`-Verzeichnis Ihrer Capacitor-App ab und führen Sie anschließend `npx cap sync` aus. Dieses Plugin erfordert **iOS 15** und ausschließlich **Swift Package Manager**; Schritte für CocoaPods oder eine Podfile sind nicht erforderlich.

Dieses Plugin verteilt das Brother SDK nicht mit. Laden Sie es von den offiziellen Brother-Seiten für Ihre Plattform herunter.

## Das Brother SDK initialisieren

### Android-Konfiguration

1. Legen Sie die folgenden Dateien im Android-Ordner Ihres Capacitor-Projekts ab:

- `android/BrotherPrintLibrary/BrotherPrintLibrary.aar`
- `android/BrotherPrintLibrary/build.gradle`

Laden Sie das Android SDK von Brother herunter: https://support.brother.co.jp/j/s/es/dev/ja/mobilesdk/android/index.html?c=jp&lang=ja&navi=offall&comple=on&redirect=on#ver4

2. Ergänzen Sie in `android/BrotherPrintLibrary/build.gradle` Folgendes:

```
configurations.maybeCreate("default")
artifacts.add("default", file('BrotherPrintLibrary.aar'))
```

3. Öffnen Sie `android/settings.gradle` und ergänzen Sie:

```
include ':BrotherPrintLibrary'
project(':BrotherPrintLibrary').projectDir = new File('./BrotherPrintLibrary/')
```

### iOS-Konfiguration

1. Legen Sie im Verzeichnis Ihrer Capacitor-App, außerhalb von `node_modules`, Folgendes ab:

- `ios/LocalPackages/BRLMPrinterKit/Sources/BRLMPrinterKit.xcframework`
- `ios/LocalPackages/BRLMPrinterKit/Package.swift`

Laden Sie das iOS SDK von Brother herunter: https://support.brother.com/g/s/es/dev/en/mobilesdk/ios/index.html

2. Erstellen Sie für dieses lokale Binärpaket `ios/LocalPackages/BRLMPrinterKit/Package.swift`, mit mindestens iOS 15 entsprechend den Anforderungen des Plugins:

```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "BRLMPrinterKit",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(name: "BRLMPrinterKit", targets: ["BRLMPrinterKit"])
    ],
    targets: [
        .binaryTarget(
            name: "BRLMPrinterKit",
            path: "Sources/BRLMPrinterKit.xcframework"
        )
    ]
)
```

3. Führen Sie nach dem Ablegen der SDK-Dateien `npx cap sync` aus, damit das iOS-Projekt der App das Plugin und den lokalen Paketpfad übernimmt.

## Berechtigungen konfigurieren

### Android-Konfiguration

Ergänzen Sie in `AndroidManifest.xml` die folgenden Berechtigungen:

```diff
- <manifest xmlns:android="http://schemas.android.com/apk/res/android">
+ <manifest xmlns:android="http://schemas.android.com/apk/res/android"
+    xmlns:tools="http://schemas.android.com/tools">
...
+     <!-- Für Bluetooth -->
+     <uses-permission android:name="android.permission.BLUETOOTH" />
+     <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
+     <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

+     <!-- Für Bluetooth Low Energy, Android 11 und älter-->
+     <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
+     <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

+     <!-- Für Bluetooth Low Energy, Android 12 und neuer -->
+     <uses-permission android:name="android.permission.BLUETOOTH_SCAN"
+         android:usesPermissionFlags="neverForLocation"
+         tools:targetApi="s" />
```

Weitere Informationen: https://support.brother.co.jp/j/s/support/html/mobilesdk/guide/getting-started/getting-started-android.html

### iOS-Konfiguration

Ergänzen Sie in `Info.plist` die folgenden Schlüssel. `UISupportedExternalAccessoryProtocols` muss ein **Array von Strings** sein.

```diff
+ <key>NSBluetoothAlwaysUsageDescription</key>
+ <string>【Why use Bluetooth for your app.】</string>
+ <key>NSBluetoothPeripheralUsageDescription</key>
+ <string>【Why use Bluetooth for your app.】</string>
+ <key>NSBonjourServices</key>
+ <array>
+ 	<string>_pdl-datastream._tcp</string>
+ 	<string>_printer._tcp</string>
+ 	<string>_ipp._tcp</string>
+ </array>
+ <key>NSLocalNetworkUsageDescription</key>
+ <string>【Why use WiFi for your app.】</string>
+ <key>UISupportedExternalAccessoryProtocols</key>
+ <array>
+ 	<string>com.brother.ptcbp</string>
+ </array>
```

#### Bluetooth-plist-Typen (geprüft am 9. September 2026)

`UISupportedExternalAccessoryProtocols` muss ein **Array von Strings** sein, auch wenn `com.brother.ptcbp` das einzige Protokoll ist. Frühere Versionen des Beispiels in diesem Repository verwendeten fälschlich einen einzelnen `<string>`, wodurch die Bluetooth-Suche mit `-[__NSCFString count]: unrecognized selector` abstürzte. Verwenden Sie das oben gezeigte `<array>`. Siehe [Apples Typdefinition](https://developer.apple.com/documentation/bundleresources/information-property-list/uisupportedexternalaccessoryprotocols).

Die Werte von `NSBluetoothAlwaysUsageDescription` und `NSBluetoothPeripheralUsageDescription` sind **Strings**, keine Arrays. Die Beispiele für diese Schlüssel in [Brothers offizieller iOS-Einrichtungsanleitung](https://support.brother.com/g/s/es/htmldoc/mobilesdk/guide/getting-started/getting-started-ios.html) waren am 9. September 2026 korrekt und nicht die Ursache dieses Absturzes. Brothers Anleitung weist separat darauf hin, `com.brother.ptcbp` als Eintrag unter `UISupportedExternalAccessoryProtocols` hinzuzufügen. `NSBluetoothPeripheralUsageDescription` wird zusätzlich nur für Deployment-Ziele vor iOS 13 benötigt.

Weitere Informationen: https://support.brother.co.jp/j/s/support/html/mobilesdk/guide/getting-started/getting-started-ios.html

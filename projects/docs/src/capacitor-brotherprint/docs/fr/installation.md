---
title: "Installation"
sourceRevision: "63fea17549a0e04d66abf569879ba2582e0b0b4eaccdc4fe19fba114157d7748"
---
# Installation

## Installer

```
npm install @rdlabo/capacitor-brotherprint
```

Le package publié du plugin déclare une dépendance SPM vers un kit Brother **local**, à la racine de votre application :

`ios/LocalPackages/BRLMPrinterKit`

Ce chemin est relatif à `node_modules/@rdlabo/capacitor-brotherprint` (`../../../ios/LocalPackages/BRLMPrinterKit`). Placez le SDK Brother iOS dans l’arborescence `ios` de votre application Capacitor comme ci-dessous, puis exécutez `npx cap sync`. Ce plugin nécessite **iOS 15** et uniquement **Swift Package Manager**, sans étapes CocoaPods ni Podfile.

Ce plugin ne redistribue pas le SDK Brother. Téléchargez-le depuis les pages officielles Brother correspondant à votre plateforme.

## Initialiser le SDK Brother

### Configuration Android

1. Placez les fichiers suivants dans le dossier android de votre projet Capacitor :

- `android/BrotherPrintLibrary/BrotherPrintLibrary.aar`
- `android/BrotherPrintLibrary/build.gradle`

Téléchargez le SDK Android auprès de Brother : https://support.brother.co.jp/j/s/es/dev/ja/mobilesdk/android/index.html?c=jp&lang=ja&navi=offall&comple=on&redirect=on#ver4

2. Dans `android/BrotherPrintLibrary/build.gradle`, ajoutez :

```
configurations.maybeCreate("default")
artifacts.add("default", file('BrotherPrintLibrary.aar'))
```

3. Ouvrez `android/settings.gradle` et ajoutez :

```
include ':BrotherPrintLibrary'
project(':BrotherPrintLibrary').projectDir = new File('./BrotherPrintLibrary/')
```

### Configuration iOS

1. Dans votre application Capacitor (en dehors de `node_modules`), placez :

- `ios/LocalPackages/BRLMPrinterKit/Sources/BRLMPrinterKit.xcframework`
- `ios/LocalPackages/BRLMPrinterKit/Package.swift`

Téléchargez le SDK iOS auprès de Brother : https://support.brother.com/g/s/es/dev/en/mobilesdk/ios/index.html

2. Créez `ios/LocalPackages/BRLMPrinterKit/Package.swift` pour ce package binaire local, avec iOS 15 minimum comme pour le plugin :

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

3. Une fois les fichiers du SDK en place, exécutez `npx cap sync` pour que le projet iOS de l’application récupère le plugin et le chemin du package local.

## Configurer les autorisations

### Configuration Android

Ajoutez les autorisations suivantes à `AndroidManifest.xml` :

```diff
- <manifest xmlns:android="http://schemas.android.com/apk/res/android">
+ <manifest xmlns:android="http://schemas.android.com/apk/res/android"
+    xmlns:tools="http://schemas.android.com/tools">
...
+     <!-- Pour Bluetooth -->
+     <uses-permission android:name="android.permission.BLUETOOTH" />
+     <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
+     <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

+     <!-- Pour Bluetooth Low Energy, Android 11 et versions antérieures-->
+     <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
+     <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

+     <!-- Pour Bluetooth Low Energy, Android 12 et versions ultérieures -->
+     <uses-permission android:name="android.permission.BLUETOOTH_SCAN"
+         android:usesPermissionFlags="neverForLocation"
+         tools:targetApi="s" />
```

Informations complémentaires : https://support.brother.co.jp/j/s/support/html/mobilesdk/guide/getting-started/getting-started-android.html

### Configuration iOS

Ajoutez les clés suivantes à `Info.plist`. `UISupportedExternalAccessoryProtocols` doit être un **tableau de chaînes**.

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

#### Types des clés Bluetooth du plist (vérifiés le 9 septembre 2026)

`UISupportedExternalAccessoryProtocols` doit être un **tableau de chaînes**, même si `com.brother.ptcbp` est le seul protocole. Des versions antérieures de l’exemple de ce dépôt utilisaient à tort un unique `<string>`, ce qui faisait planter la recherche Bluetooth avec `-[__NSCFString count]: unrecognized selector`. Utilisez le `<array>` présenté ci-dessus. Consultez la [définition du type par Apple](https://developer.apple.com/documentation/bundleresources/information-property-list/uisupportedexternalaccessoryprotocols).

Les valeurs de `NSBluetoothAlwaysUsageDescription` et `NSBluetoothPeripheralUsageDescription` sont des **chaînes**, pas des tableaux. Les exemples de ces clés dans le [guide officiel de configuration iOS de Brother](https://support.brother.com/g/s/es/htmldoc/mobilesdk/guide/getting-started/getting-started-ios.html) sont corrects au 9 septembre 2026 ; ils n’étaient pas à l’origine de ce plantage. Le guide Brother indique séparément d’ajouter `com.brother.ptcbp` comme élément de `UISupportedExternalAccessoryProtocols`. Il n’exige en plus `NSBluetoothPeripheralUsageDescription` que pour les cibles de déploiement antérieures à iOS 13.

Informations complémentaires : https://support.brother.co.jp/j/s/support/html/mobilesdk/guide/getting-started/getting-started-ios.html

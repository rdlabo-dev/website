---
title: インストール
code: []
scrollActiveLine: []
---

## インストール

```
npm install @rdlabo/capacitor-brotherprint
```

公開プラグインパッケージは、アプリルート配下の **ローカル** Brother キットへの SPM 依存を宣言します。

`ios/LocalPackages/BRLMPrinterKit`

パスは `node_modules/@rdlabo/capacitor-brotherprint` から見て `../../../ios/LocalPackages/BRLMPrinterKit` です。下記のとおり Capacitor アプリの `ios` ツリーへ Brother iOS SDK を置き、`npx cap sync` を実行してください。このプラグインは **iOS 15** と **Swift Package Manager** のみです（CocoaPods / Podfile 手順はありません）。

このプラグインは Brother SDK を再配布しません。各プラットフォーム向けの公式ページから取得してください。

## Brother SDK の初期化

### Android 設定

1. Capacitor プロジェクトの android フォルダに次を置きます。

- `android/BrotherPrintLibrary/BrotherPrintLibrary.aar`
- `android/BrotherPrintLibrary/build.gradle`

Android SDK の入手先: https://support.brother.co.jp/j/s/es/dev/ja/mobilesdk/android/index.html?c=jp&lang=ja&navi=offall&comple=on&redirect=on#ver4

2. `android/BrotherPrintLibrary/build.gradle` に次を含めます。

```
configurations.maybeCreate("default")
artifacts.add("default", file('BrotherPrintLibrary.aar'))
```

3. `android/settings.gradle` を開き、次を追加します。

```
include ':BrotherPrintLibrary'
project(':BrotherPrintLibrary').projectDir = new File('./BrotherPrintLibrary/')
```

### iOS 設定

1. Capacitor アプリ配下（`node_modules` 内ではない）に次を置きます。

- `ios/LocalPackages/BRLMPrinterKit/Sources/BRLMPrinterKit.xcframework`
- `ios/LocalPackages/BRLMPrinterKit/Package.swift`

iOS SDK の入手先: https://support.brother.com/g/s/es/dev/en/mobilesdk/ios/index.html

2. ローカルバイナリ用の `ios/LocalPackages/BRLMPrinterKit/Package.swift` を作成します（プラグインに合わせて最低 iOS 15）。

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

3. SDK ファイルを配置したら `npx cap sync` を実行し、アプリの iOS プロジェクトがプラグインとローカルパッケージパスを拾うようにします。

## 権限設定

### Android 設定

`AndroidManifest.xml` に次の権限を追加します。

```diff
- <manifest xmlns:android="http://schemas.android.com/apk/res/android">
+ <manifest xmlns:android="http://schemas.android.com/apk/res/android"
+    xmlns:tools="http://schemas.android.com/tools">
...
+     <!-- For Bluetooth -->
+     <uses-permission android:name="android.permission.BLUETOOTH" />
+     <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
+     <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

+     <!-- For Bluetooth Low Energy, Android 11 and earlier-->
+     <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
+     <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

+     <!-- For Bluetooth Low Energy, Android 12 and later -->
+     <uses-permission android:name="android.permission.BLUETOOTH_SCAN"
+         android:usesPermissionFlags="neverForLocation"
+         tools:targetApi="s" />
```

詳細: https://support.brother.co.jp/j/s/support/html/mobilesdk/guide/getting-started/getting-started-android.html

### iOS 設定

`Info.plist` に次のキーを追加します。`UISupportedExternalAccessoryProtocols` は **文字列の配列** である必要があります。

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

詳細: https://support.brother.co.jp/j/s/support/html/mobilesdk/guide/getting-started/getting-started-ios.html

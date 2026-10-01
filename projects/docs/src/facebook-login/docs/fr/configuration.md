---
title: "Configuration"
sourceRevision: "f91020c0aecbbf4326f438baff28443ae1ea811fc61cc8f7c04d2359cbe81603"
---
# Configuration

Créez ou sélectionnez une application dans le [tableau de bord Meta](https://developers.facebook.com/apps/), activez Facebook Login et configurez chaque plateforme prise en charge par votre application Capacitor.

Le plugin cible Capacitor 8, iOS 15 ou une version ultérieure, et Android API 24 ou une version ultérieure. Il déclare les dépendances du SDK Facebook natif ; n’ajoutez donc pas une deuxième dépendance à ce SDK.

## Android

Dans `android/app/src/main/AndroidManifest.xml`, ajoutez ce qui suit à l’intérieur de `<application>` :

```xml
<meta-data android:name="com.facebook.sdk.ApplicationId" android:value="@string/facebook_app_id" />
<meta-data android:name="com.facebook.sdk.ClientToken" android:value="@string/facebook_client_token" />
```

Dans `android/app/src/main/res/values/strings.xml` :

```xml
<string name="facebook_app_id">[APP_ID]</string>
<string name="facebook_client_token">[CLIENT_TOKEN]</string>
```

Remplacez `[APP_ID]` et `[CLIENT_TOKEN]` par les valeurs de votre application Meta. Ajoutez le nom du package Android, la classe d’activité et les empreintes de clés de production et de débogage dans le tableau de bord Meta. Consultez le [guide de démarrage Android](https://developers.facebook.com/docs/android/getting-started) de Meta.

### Variables Android

Remplacez les valeurs suivantes dans le `variables.gradle` de votre application uniquement si vous avez besoin d’une version particulière du SDK :

| Variable             | Artefact                              | Valeur par défaut  |
| -------------------- | ------------------------------------- | -------- |
| `facebookSDKVersion` | `com.facebook.android:facebook-login` | `18.3.0` |

## iOS

Le plugin déclare `FBSDKCoreKit` et `FBSDKLoginKit` comme dépendances pour CocoaPods et Swift Package Manager. N’ajoutez pas séparément le SDK Facebook iOS.

Les dépendances CocoaPods utilisent `~> 18.1`, et Swift Package Manager résout les versions
de `18.1.0` jusqu’à la prochaine version majeure exclue.

Dans `ios/App/App/AppDelegate.swift`, initialisez le SDK et transmettez l’URL de callback de connexion :

```swift
import UIKit
import Capacitor
import FBSDKCoreKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        ApplicationDelegate.shared.application(
            application,
            didFinishLaunchingWithOptions: launchOptions
        )
        return true
    }

    func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    ) -> Bool {
        if ApplicationDelegate.shared.application(
            app,
            open: url,
            sourceApplication: options[.sourceApplication] as? String,
            annotation: options[.annotation]
        ) {
            return true
        }
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
}
```

Ajoutez ce qui suit dans le `<dict>` le plus externe de `ios/App/App/Info.plist` :

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>fb[APP_ID]</string>
    </array>
  </dict>
</array>
<key>FacebookAppID</key>
<string>[APP_ID]</string>
<key>FacebookClientToken</key>
<string>[CLIENT_TOKEN]</string>
<key>FacebookDisplayName</key>
<string>[APP_NAME]</string>
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>fbapi</string>
  <string>fbapi20130214</string>
  <string>fbapi20130410</string>
  <string>fbapi20130702</string>
  <string>fbapi20131010</string>
  <string>fbapi20131219</string>
  <string>fbapi20140410</string>
  <string>fbapi20140116</string>
  <string>fbapi20150313</string>
  <string>fbapi20150629</string>
  <string>fbapi20160328</string>
  <string>fbauth</string>
  <string>fb-messenger-share-api</string>
  <string>fbauth2</string>
  <string>fbshareextension</string>
</array>
```

Remplacez tous les placeholders par les valeurs de votre application Meta. Ajoutez le bundle ID à la plateforme iOS dans le tableau de bord Meta. Consultez le [guide de connexion iOS](https://developers.facebook.com/docs/facebook-login/ios) de Meta.

## Web

Initialisez le SDK JavaScript Facebook après la disponibilité du DOM et avant l’appel des autres méthodes du plugin :

```ts
import { FacebookLogin } from '@capacitor-community/facebook-login';

await FacebookLogin.initialize({
  appId: '[APP_ID]',
  locale: 'en_US',
});
```

`initialize` est sans effet sur Android et iOS, car leurs SDK sont configurés nativement. Sur le Web, les valeurs par défaut sont Graph API `v26.0` et la locale `en_US` lorsque ces options sont omises. Consultez le [guide de connexion Web](https://developers.facebook.com/docs/facebook-login/web) de Meta.

## Étapes suivantes

- [Authentification](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/authentication)
- [Événements de l’application](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/app-events)

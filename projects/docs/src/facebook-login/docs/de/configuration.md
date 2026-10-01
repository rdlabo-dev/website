---
title: "Konfiguration"
sourceRevision: "f91020c0aecbbf4326f438baff28443ae1ea811fc61cc8f7c04d2359cbe81603"
---
# Konfiguration

Erstellen oder wählen Sie eine Anwendung im [Meta App Dashboard](https://developers.facebook.com/apps/), aktivieren Sie Facebook Login und konfigurieren Sie jede von Ihrer Capacitor-Anwendung unterstützte Plattform.

Das Plugin richtet sich an Capacitor 8, iOS ab 15 und Android API ab 24. Es deklariert die nativen Facebook-SDK-Abhängigkeiten. Ergänzen Sie daher keine zweite Facebook-SDK-Abhängigkeit.

## Android

Ergänzen Sie in `android/app/src/main/AndroidManifest.xml` innerhalb von `<application>` Folgendes:

```xml
<meta-data android:name="com.facebook.sdk.ApplicationId" android:value="@string/facebook_app_id" />
<meta-data android:name="com.facebook.sdk.ClientToken" android:value="@string/facebook_client_token" />
```

In `android/app/src/main/res/values/strings.xml`:

```xml
<string name="facebook_app_id">[APP_ID]</string>
<string name="facebook_client_token">[CLIENT_TOKEN]</string>
```

Ersetzen Sie `[APP_ID]` und `[CLIENT_TOKEN]` durch Werte Ihrer Meta-App. Ergänzen Sie Android-Paketnamen, Activity-Klasse und Release-/Debug-Schlüsselhashes im Meta App Dashboard. Siehe Metas [Android-Einstiegsanleitung](https://developers.facebook.com/docs/android/getting-started).

### Android-Variablen

Überschreiben Sie Folgendes in der `variables.gradle` Ihrer Anwendung nur, wenn Sie eine bestimmte SDK-Version benötigen:

| Variable             | Artefakt                              | Standard  |
| -------------------- | ------------------------------------- | -------- |
| `facebookSDKVersion` | `com.facebook.android:facebook-login` | `18.3.0` |

## iOS

Das Plugin deklariert `FBSDKCoreKit` und `FBSDKLoginKit` als Abhängigkeiten für CocoaPods und Swift Package Manager. Fügen Sie das Facebook-iOS-SDK nicht separat hinzu.

Die CocoaPods-Abhängigkeiten verwenden `~> 18.1`; Swift Package Manager löst ab `18.1.0` bis zur nächsten Hauptversion auf.

Initialisieren Sie in `ios/App/App/AppDelegate.swift` das SDK und leiten Sie die Anmelde-Callback-URL weiter:

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

Ergänzen Sie innerhalb des äußersten `<dict>` in `ios/App/App/Info.plist` Folgendes:

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

Ersetzen Sie alle Platzhalter durch Werte Ihrer Meta-App. Ergänzen Sie die Bundle-ID bei der iOS-Plattform im Meta App Dashboard. Siehe Metas [iOS-Anmeldeanleitung](https://developers.facebook.com/docs/facebook-login/ios).

## Web

Initialisieren Sie das Facebook JavaScript SDK, nachdem das DOM verfügbar ist und bevor Sie weitere Plugin-Methoden aufrufen:

```ts
import { FacebookLogin } from '@capacitor-community/facebook-login';

await FacebookLogin.initialize({
  appId: '[APP_ID]',
  locale: 'en_US',
});
```

`initialize` hat unter Android und iOS keine Wirkung, da diese SDKs nativ konfiguriert werden. Im Web sind Graph API `v26.0` und Locale `en_US` die Standardwerte, wenn die Optionen fehlen. Siehe Metas [Web-Anmeldeanleitung](https://developers.facebook.com/docs/facebook-login/web).

## Nächste Schritte

- [Authentifizierung](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/authentication)
- [App-Ereignisse](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/app-events)

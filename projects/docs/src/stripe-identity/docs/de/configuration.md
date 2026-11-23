---
title: "Konfiguration"
code: []
scrollActiveLine: []
sourceRevision: "8fac0886d3e943adf1624e14a570235fadea7c8f532dfc2023f691b844bc0b70"
---
Installieren Sie Stripe Identity und synchronisieren Sie die nativen Capacitor-Projekte.

```bash
npm install @capacitor-community/stripe-identity
npx cap sync
```

`@capacitor-community/stripe-identity` v8 zeigt das Stripe Identity Verification Sheet unter iOS, Android und im Web an.

| Anforderung | Mindestwert |
| --- | --- |
| Capacitor | 8 |
| iOS | 15.0 |
| Android-`minSdkVersion` | 24 |

## Web-Konfiguration

Zusätzliche Schritte im nativen Projekt sind nicht erforderlich. Rufen Sie im Web vor `create` und `present` `initialize` mit einem veröffentlichbaren Schlüssel auf. Native Plattformen lösen `initialize` auf, ohne diesen Schlüssel zu verwenden.

## iOS-Konfiguration

Ergänzen Sie `NSCameraUsageDescription` in `Info.plist` mit einer Erklärung, weshalb Ihre Anwendung Kamerazugriff benötigt. Siehe die [Stripe-Anleitung zur iOS-Kameraberechtigung](https://stripe.com/docs/identity/verify-identity-documents?platform=ios&type=new-integration#set-up-camera-authorization).

Die iOS-Implementierung liest das primäre Anwendungssymbol aus `Info.plist` (`CFBundleIcons` → `CFBundlePrimaryIcon` → `CFBundleIconFiles`) und übergibt den ersten Dateinamen als `brandLogo` an Stripe Identity. Fehlen diese Schlüssel, weist `create` den Aufruf zurück und erzeugt `FailedToLoad` mit der Meldung `CFBundleIcons or CFBundlePrimaryIcon or CFBundleIconFiles is not found. You should check ios image assets`.

Behalten Sie ein primäres App Icon im iOS-Asset-Katalog bei, damit Xcode `CFBundleIconFiles` schreibt. Eine Anwendung ohne diesen Symbolkatalog kann das Sheet nicht erstellen.

## Android-Konfiguration

Verwenden Sie in `android/app/src/main/res/values/styles.xml` ein Material-Components-Theme:

```xml:android/app/src/main/res/values/styles.xml
<style name="AppTheme" parent="Theme.MaterialComponents.DayNight">
  <!-- Vorhandene Einträge Ihres Designs -->
</style>
```

Jedes übergeordnete Material-Components-Theme ist zulässig. Siehe [Material-Components-Theming](https://m2.material.io/develop/android/theming/dark/) und die [Stripe-Anleitung für Android-Material-Themes](https://stripe.com/docs/identity/verify-identity-documents?platform=android&type=new-integration#set-up-material-theme).

Die Android-Implementierung verwendet das Anwendungs-Mipmap `ic_launcher` als Symbol für das Identity Verification Sheet. Über ein normales Launcher-Symbol hinaus ist keine zusätzliche Symbolkonfiguration erforderlich.

---
title: "Configuration"
code: []
scrollActiveLine: []
sourceRevision: "fd2e7bfe95b5aef53bcd0951eeb1de5f4c605a25020e1c3b9b9204c37e77b947"
---
Installez Stripe Identity et synchronisez les projets Capacitor natifs.

```bash
npm install @capacitor-community/stripe-identity
npx cap sync
```

`@capacitor-community/stripe-identity` v8.3.0 présente Stripe Identity Verification Sheet sur iOS, Android et le Web.

| Prérequis | Minimum |
| --- | --- |
| Capacitor | 8 |
| iOS | 15.0 |
| `minSdkVersion` Android | 24 |

## Configuration Web

Aucune étape supplémentaire n’est nécessaire dans les projets natifs. Sur le Web, appelez `initialize` avec une clé publique avant `create` et `present`. Les plateformes natives résolvent `initialize` sans utiliser cette clé.

## Configuration iOS

Ajoutez `NSCameraUsageDescription` à `Info.plist` avec un message expliquant pourquoi votre application a besoin d’accéder à l’appareil photo. Consultez le [guide Stripe d’autorisation de l’appareil photo sur iOS](https://stripe.com/docs/identity/verify-identity-documents?platform=ios&type=new-integration#set-up-camera-authorization).

L’implémentation iOS lit l’icône principale de l’application dans `Info.plist` (`CFBundleIcons` → `CFBundlePrimaryIcon` → `CFBundleIconFiles`) et transmet le premier nom de fichier à Stripe Identity comme `brandLogo`. `create` rejette l’appel et émet `FailedToLoad` si ces clés sont absentes, avec le message `CFBundleIcons or CFBundlePrimaryIcon or CFBundleIconFiles is not found. You should check ios image assets`.

Conservez une App Icon principale dans le catalogue de ressources iOS afin que Xcode écrive `CFBundleIconFiles`. Une application sans ce catalogue d’icônes ne peut pas créer la feuille.

## Configuration Android

Utilisez un thème Material Components dans `android/app/src/main/res/values/styles.xml` :

```diff xml:android/app/src/main/res/values/styles.xml
- <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
+ <style name="AppTheme" parent="Theme.MaterialComponents.DayNight">
```

Tout thème parent Material Components peut être utilisé. Consultez la [gestion des thèmes Material Components](https://m2.material.io/develop/android/theming/dark/) et le [guide Stripe du thème Material sur Android](https://stripe.com/docs/identity/verify-identity-documents?platform=android&type=new-integration#set-up-material-theme).

L’implémentation Android utilise le mipmap `ic_launcher` de l’application comme icône d’Identity Verification Sheet. Une icône de lancement standard suffit ; aucune configuration d’icône supplémentaire n’est requise.

---
title: "Einwilligung"
sourceRevision: "ff300883c11e011224620517ed260084ff215a404afa193135e5cb7cf94e5314"
---
# Einwilligung

Das User Messaging Platform (UMP) SDK von Google ist das Datenschutz- und Messaging-Werkzeug zum Einholen der Einwilligung vor Anzeigenanfragen. Googles UMP-Anleitungen für [Android](https://developers.google.com/admob/android/privacy) und [iOS](https://developers.google.com/admob/ios/privacy) erklären den Ablauf.

Dieses Plugin stellt UMP und iOS App Tracking Transparency über eine gemeinsame API bereit. [Erstellen Sie vor der UMP-Nutzung Ihre DSGVO-Nachrichten](https://support.google.com/admob/answer/10113207) in AdMob. Sie können außerdem [Nachrichten für Identifier for Advertisers (IDFA) einrichten](https://support.google.com/admob/answer/10115027). Sind IDFA-Nachrichten veröffentlicht, zeigt UMP sie und die App-Tracking-Transparency-Abfrage an. Rufen Sie dann nicht zusätzlich `requestTrackingAuthorization()` auf.

## Empfohlene Reihenfolge

1. Rufen Sie `AdMob.initialize()` auf. Siehe [Konfiguration](https://docs.rdlabo.dev/projects/capacitor-admob/docs/configuration).
2. Rufen Sie `AdMob.requestConsentInfo()` auf.
3. Rufen Sie bei Bedarf `AdMob.showConsentForm()` auf.
4. Laden Sie Anzeigen nur, wenn `consentInfo.canRequestAds` `true` ist.

```ts
import { AdMob, AdmobConsentStatus } from '@capacitor-community/admob';

await AdMob.initialize();

let consentInfo = await AdMob.requestConsentInfo();
if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
  consentInfo = await AdMob.showConsentForm();
}

if (consentInfo.canRequestAds) {
  // Anzeigen können jetzt angefordert werden.
}
```

<!-- !::requestConsentInfo:: -->

<!-- !::AdmobConsentRequestOptions:: -->

<!-- !::AdmobConsentInfo:: -->

<!-- !::AdmobConsentStatus:: -->

<!-- !::showConsentForm:: -->

Verwenden Sie `canRequestAds` als Entscheidungsgrundlage. Je nach Nutzer und konfigurierten Nachrichten kann ein Einwilligungsformular nicht verfügbar oder nicht erforderlich sein.

## iOS-Tracking-Berechtigung

Wenn Sie **keine** UMP-IDFA-Nachrichten verwenden, fordern Sie App Tracking Transparency bei einem Status `notDetermined` selbst an. Überspringen Sie diesen Abschnitt, wenn Identifier-for-Advertisers-Nachrichten in AdMob eingerichtet sind; UMP zeigt diese Abfrage an.

```ts
const tracking = await AdMob.trackingAuthorizationStatus();
if (tracking.status === 'notDetermined') {
  /**
   * Wenn Sie Tracking vor dem iOS-Dialog erläutern möchten,
   * zeigen Sie hier Ihre eigene UI an und fahren Sie anschließend fort.
   */
  await AdMob.requestTrackingAuthorization();
}
```

`requestTrackingAuthorization()` hat unter Android, im Web und unter iOS-Versionen vor 14 keine Wirkung.

<!-- !::trackingAuthorizationStatus:: -->

<!-- !::TrackingAuthorizationStatusInterface:: -->

<!-- !::requestTrackingAuthorization:: -->

## Datenschutzoptionen

Wenn Ihre Datenschutznachricht einen Einstiegspunkt in der Anwendung erfordert, bieten Sie eine Einstellungsaktion an, die Folgendes aufruft:

```ts
await AdMob.showPrivacyOptionsForm();
```

<!-- !::showPrivacyOptionsForm:: -->

## Einwilligung zurücksetzen

`resetConsentInfo()` ist für Tests gedacht. Verwenden Sie es nicht, um die Einwilligungsentscheidung eines Produktionsnutzers zu löschen.

<!-- !::resetConsentInfo:: -->

Debug-Regionen und Testgeräte-IDs finden Sie unter [Tests](https://docs.rdlabo.dev/projects/capacitor-admob/docs/testing).

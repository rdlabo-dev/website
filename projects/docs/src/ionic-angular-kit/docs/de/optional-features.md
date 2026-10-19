---
title: "Optionale Funktionen"
sourceRevision: "2523f6f570b57cfdeb738b3da67afb5b275eb11e9efb4e408385bd4547106083"
---
Optionale Funktionen verwenden sekundäre Einstiegspunkte, damit ihre nativen Plugins und SDKs nicht in Anwendungen gelangen, die sie nicht verwenden.

## Updates der Webanwendung

`provideKitAppUpdate()` aus `/app-update` prüft vor dem Bootstrap, ob eine vollständige Angular-Service-Worker-Version vorliegt. Diese blockierende
Strategie bleibt der Standard für Anwendungen, in denen der Erhalt aller laufenden Eingaben wichtiger ist als eine langsame Update-Prüfung.

Anwendungen, die jeden ausführbaren Anwendungschunk vorab laden, können eine nicht blockierende Prüfung beim Start aktivieren:

```ts
provideKitAppUpdate({ strategy: 'background' });
```

Die bestehende Hintergrundstrategie lädt nur neu, bevor Angular sein erstes Rendering abgeschlossen hat. Spätere Updates warten bis zum nächsten regulären Seitenladen, damit Benutzereingaben erhalten bleiben.

Anwendungen können die separate Strategie `confirm` wählen, um ein sofortiges, vom Benutzer gesteuertes Update anzubieten. Die Abfrage läuft nach dem ersten Rendering in einem Angular-Injektionskontext. Lösen Sie Abhängigkeiten synchron auf, bevor Sie eine asynchrone Grenze überschreiten. Das Ergebnis `true` lädt die vollständig heruntergeladene Version neu, `false` verschiebt sie auf das nächste reguläre Seitenladen, und `undefined` versucht es später erneut, weil die Abfrage nicht angezeigt werden konnte (etwa bei einem bereits aktiven Alert).

```ts
provideKitAppUpdate({
  strategy: 'confirm',
  promptForUpdate: () =>
    inject(KitOverlayController).tryAlertConfirm({
      header: 'The latest version is ready',
      message: 'Reload now to update?',
      okText: 'Reload and update',
    }),
});
```

Keine der beiden nicht blockierenden Strategien ruft `activateUpdate()` auf, da dies die laufende Shell mit Lazy-Chunks einer anderen Version mischen könnte. Eine nicht wiederherstellbare Startgeneration wird einmal mit `ngsw-bypass` erneut versucht; der aktuelle History-Zustand und ein offlinefähiger Schleifenschutz bleiben erhalten.

## Theme und Bewertungen

`provideKitTheme()` und `KitThemeController` speichern eine Nutzereinstellung, folgen bis zu einer Überschreibung `prefers-color-scheme`, schalten anwendungseigene Farbpalettenklassen um und synchronisieren die Android-Statusleiste.

```ts
provideKitTheme({
  storageKey: 'theme',
  darkClasses: ['ion-palette-dark'],
  lightClasses: ['ion-palette-light'],
});
```

Importieren Sie `kitRequestReview()` aus `/review`, um den nativen Bewertungsdialog höchstens einmal pro anwendungsdefiniertem Zeitfenster anzufordern. Im Web hat die Funktion keine Wirkung.

## Drucker

Der Einstiegspunkt `/printer` enthält reine Hilfsfunktionen für DOM-zu-PNG-Rendering, Bildrotation, Brother-Druckeinstellungen, mehrseitige Etikettenlayouts und PDF-Generierung. Die nutzende App ist für die Papierauswahloberfläche, Lade-Overlays, Speicher, Transport und Kopierrichtlinien zuständig.

## Firebase-Authentifizierung

Der Einstiegspunkt `/auth-firebase` initialisiert `firebase/auth` über `provideKitFirebase()` und stellt `KIT_FIREBASE_AUTH` sowie Ablaufhilfen wie `kitSignIn`, `kitSignUp`, `kitSignOut`, `kitResolveAuthStatus` und `kitReauthWithRetry` bereit.

Kit stellt keine Oberfläche bereit. Hooks delegieren Ladezustand, Navigation und Fehleranzeige an die Anwendung. Soziale Anbieter haben getrennte Einstiegspunkte `/auth-firebase/apple`, `/auth-firebase/facebook` und `/auth-firebase/google`, sodass jeder Anbieter nur sein eigenes optionales Plugin benötigt. Der kombinierte Einstiegspunkt `/auth-firebase/social` ist **veraltet und zur Abwärtskompatibilität erhalten**; migrieren Sie seine Apple-Imports zu `/apple` und seine Facebook-Imports zu `/facebook`.

Der Kompatibilitätseinstiegspunkt lädt weiterhin beide Plugins für Apple und Facebook. Seine Funktionen behalten dieselbe Laufzeitidentität, und bestehende Apple-Antwortobjekte bleiben quellcodekompatibel.

Soziale Helfer erfassen den aktuellen Firebase-Benutzer vor `before` und prüfen diese Identität vor und nach asynchroner Arbeit. Erfolgshooks erhalten genau den authentifizierten `user`; binden Sie damit Backend-Anfragen an dieselbe Sitzung. Ein überlappender Apple-, Facebook- oder Google-Ablauf für dasselbe `Auth` wird über `error('other', error)` mit `status: false` abgewiesen, bevor sein `before`-Hook oder SDK-Aufruf beginnt. Der Guard bleibt während der Bereinigung aktiv. Unterschiedliche `Auth`-Instanzen sind unabhängig.

Anwendungen müssen auch E-Mail/Passwort-Authentifizierung, Abmeldung und direkte Firebase-Aufrufe mit diesen Abläufen koordinieren. Der Guard erfasst soziale Kit-Helfer in diesem JavaScript-Kontext; er kann keine bereits gestartete Firebase-Anfrage abbrechen, keine abgeschlossene Anbieterverknüpfung zurückrollen und keine Änderungen aus einem anderen Browsertab serialisieren.

Fehler in `before`, beim Austausch oder in `success` führen den Fehlerhook aus und geben `status: false` zurück. `finally` läuft immer, auch bei überlappenden Aufrufen; Fehler in `error` oder `finally` führen zur Ablehnung des Promise. Die Hooks sind für ihre UI-Bereinigung verantwortlich.

Apple-Nutzer müssen `@capawesome/capacitor-apple-sign-in` (`>=0.1.4 <1`) installieren und nach dem Ersetzen von `@capacitor-community/apple-sign-in` den Befehl `npx cap sync` ausführen. Diese Migration der nativen Abhängigkeit gilt auch für den veralteten Einstiegspunkt `/social`; seine Imports und Antworttypen bleiben kompatibel. Änderungen an nativen Plugins erfordern eine neue native Binärdatei.

Der Apple-Helfer verwendet die native Anmeldung auf iOS und das Firebase-Popup im Web. Android Service ID und Weiterleitungskonfiguration werden von diesem Helfer nicht bereitgestellt. Capawesomes typisierter Fehler `SIGN_IN_CANCELED` wird als Abbruch gemeldet; andere native Fehler bleiben Betriebsfehler. Das native `idToken` wird dem bestehenden Antwortfeld `identityToken` zugeordnet. Im Web ist `authorizationCode` gleich `null`, und das Popup-Zugriffstoken wird separat als `accessToken` zurückgegeben.

## Live Update

`provideLiveUpdateReadiness()` aus `/live-update` wartet auf Angular-Stabilität, die erste abgeschlossene Route und einen Animationsframe, bevor Capawesome `LiveUpdate.ready()` aufgerufen wird. Im Web hat die Funktion keine Wirkung.

Ein Live Update ersetzt ausschließlich die Webschicht einer vorhandenen nativen Binärdatei. Änderungen an nativem Code, Capacitor-Konfiguration oder Plugin-Versionen erfordern einen Store-Build und einen neuen, an die Buildnummer gebundenen Kanal.

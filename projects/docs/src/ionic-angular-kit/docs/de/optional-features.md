---
title: "Optionale Funktionen"
sourceRevision: "d48e5bc25073e0e022fd62122dabadb9f97a49ed46e6e461cd2c38402ef091f9"
---
Optionale Funktionen verwenden sekundäre Einstiegspunkte, damit ihre nativen Plugins und SDKs nicht in Anwendungen gelangen, die sie nicht verwenden.

## Updates der Webanwendung

`provideKitAppUpdate()` aus `/app-update` prüft vor dem Bootstrap, ob eine vollständige Angular-Service-Worker-Version vorliegt. Diese blockierende
Strategie bleibt der Standard für Anwendungen, in denen der Erhalt aller laufenden Eingaben wichtiger ist als eine langsame Update-Prüfung.

Anwendungen, die jeden ausführbaren Anwendungschunk vorab laden, können eine nicht blockierende Prüfung beim Start aktivieren:

```ts
provideKitAppUpdate({ strategy: 'background' });
```

Die Hintergrundstrategie lädt nur neu, bevor Angular seinen ersten Renderdurchlauf beendet. Ein späteres Update bleibt dem nächsten natürlichen
Seitenaufruf überlassen, damit Nutzereingaben nicht verworfen werden. Sie ruft niemals `activateUpdate()` auf, da dies eine laufende Anwendungshülle mit Lazy Chunks
einer anderen Version vermischen könnte. Eine nicht wiederherstellbare Startgeneration wird einmal mit `ngsw-bypass` erneut versucht. Der aktuelle History-Zustand und eine
offlinesichere Schleifensperre bleiben erhalten.

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

Das Kit zeigt keine eigene Oberfläche an. Hooks geben Ladezustand, Navigation und Fehleranzeige an die Anwendung zurück. Social-Provider werden zusätzlich unter `/auth-firebase/social` getrennt gehalten.

## Live Update

`provideLiveUpdateReadiness()` aus `/live-update` wartet auf Angular-Stabilität, die erste abgeschlossene Route und einen Animationsframe, bevor Capawesome `LiveUpdate.ready()` aufgerufen wird. Im Web hat die Funktion keine Wirkung.

Ein Live Update ersetzt ausschließlich die Webschicht einer vorhandenen nativen Binärdatei. Änderungen an nativem Code, Capacitor-Konfiguration oder Plugin-Versionen erfordern einen Store-Build und einen neuen, an die Buildnummer gebundenen Kanal.

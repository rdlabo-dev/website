---
title: "Ionic-Overlays"
sourceRevision: "c64243565ccfb68c69116a187b285ca477c45de5d524d24e61f89c29008a0bb8"
---
# Native UI mit Ionic-Overlays überdecken

Verwenden Sie diesen Adapter, wenn ein Ionic-Modal oder ein anderes überdeckendes Web-Overlay über nativen Inhalten erscheinen soll, die von der Engine verwaltet werden. Die native Registrierung übernimmt Aufnahme und Wiederherstellung, kann den Darstellungslebenszyklus von Ionic jedoch nicht aus einer nativen Ansicht ableiten. Dieser gemeinsame Monitor trifft die Abdeckungsentscheidung für alle Registrierungen.

Integrieren Sie das Plugin zuerst anhand des [Capacitor](../getting-started/capacitor.md)- oder [Cordova](../getting-started/cordova.md)-Leitfadens. Anwendungen ohne Ionic verwenden eigene Lebenszyklusbenachrichtigungen und installieren diesen Adapter nicht.

Beispielsweise soll ein Ionic-Einstellungsmodal die native Tab-Leiste im Hintergrund überdecken, während die eigene native Schließen-Schaltfläche des Modals bedienbar bleibt. Eine pauschale Ausblendungsbenachrichtigung kann diese Beziehung nicht ausdrücken. Der gemeinsame Monitor bewertet jeden Host anhand des Overlay-Stapels, sodass unabhängige Plugins dieselbe Abdeckungsregel verwenden.

## Einmal aktivieren

Rufen Sie dies in einer Ionic-Anwendung einmal beim Anwendungsstart auf. Bei direktem Aufruf aus der Anwendung installieren Sie `@webview-native-ui/engine` als direkte Anwendungsabhängigkeit:

```ts
import { enableSupportIonicOverlays } from '@webview-native-ui/engine/ionic';

enableSupportIonicOverlays();
```

Plugin-Maintainer können dieses Snippet in ihre Anleitungen zur Anwendungseinrichtung aufnehmen oder es innerhalb eines bestehenden JS-Initialisierers aufrufen. `@rdlabo/capacitor-native-ui` ruft denselben Initialisierer bereits intern auf; seine Nutzer benötigen keinen zusätzlichen Aufruf. Anwendungen ohne Ionic lassen ihn weg. Eine native Registrierung allein installiert keine Ionic-Ereignislistener.

## Abdeckung und Lebensdauer

Pro Dokument wird ein Monitor gemeinsam verwendet, auch zwischen dem npm-Modul und der von Swift/Android injizierten Laufzeit. Wiederholte Initialisierung fügt keine Listener hinzu und löscht keine explizite Konfiguration. Das Zerstören einer Projektion entfernt nur ihr Abonnement; es beendet nicht den Monitor anderer Plugins. Der Monitor lebt so lange wie das Dokument.

Standardmäßig werden die Lebenszyklusereignisse von Modal, Popover, Alert, Action Sheet, Loading, Picker, Toast und Menu berücksichtigt. Der Monitor vergleicht das DOM jeder Projektion mit dem aktiven Overlay-Stapel: Inhalte im vordersten Modal bleiben nativ, während überdeckte Inhalte vorübergehend ihr vorbereitetes Bild verwenden. Toasts und inaktive Sheet-Hintergründe überdecken keine Oberfläche. Verschachtelte Overlays halten sie überdeckt, bis der verbleibende Stapel die Wiederherstellung erlaubt. Bei fehlenden Bildern bleibt der normale Web-Fallback erhalten. Diese vorübergehende Abdeckung überschreibt niemals das explizite Ziel `web` oder `none` eines Plugins. Später registrierte Projektionen lesen den aktuellen Zustand.

Ein Popover in einem nativen Fenster unterscheidet sich von einem in der WebView gerenderten Popover: Sein DOM-Platzhalter darf nicht als überdeckendes Web-Overlay behandelt werden. Das Plugin `@rdlabo/capacitor-native-ui` meldet dem Monitor diese native Darstellungszuständigkeit. Schlägt die native Darstellung fehl, gibt es diese Zuständigkeit frei, und der Monitor nimmt die gewöhnliche Web-Overlay-Abdeckung wieder auf. Diese Ausnahme hängt von einer expliziten Integration ab; sie wird nicht allein aus dem DOM des Popovers abgeleitet.

## Ungewöhnliche Layouts anpassen

Optionale Einstellungen gelten dokumentweit. Behalten Sie für gewöhnliche Ionic-Overlays die Standardwerte bei. Verwenden Sie `exclude` für ein Anwendungs-Overlay, das native Inhalte nicht überdecken soll, und `additional`, wenn dieselbe App auch einen eigenen Dialog mit eigenen Lebenszyklusereignissen verwendet. Verwenden Sie `covers` nur, wenn DOM-Zugehörigkeit und Hintergrundzustand nicht beschreiben, welche Hosts das benutzerdefinierte Layout tatsächlich überdeckt:

```ts
enableSupportIonicOverlays({
  exclude: '[data-nonblocking-overlay]',
  additional: [
    {
      selector: 'app-dialog',
      events: {
        willPresent: 'appDialogWillPresent',
        didDismiss: 'appDialogDidDismiss',
      },
    },
  ],
});
```

Verwenden Sie `covers(overlay, target)` nur, wenn eine registrierte DOM-Projektion eine eigene Abdeckungsregel benötigt; geben Sie `undefined` für das Standardverhalten oder einen booleschen Wert zum Überschreiben zurück. Ausschlüsse und explizite Zuständigkeit eines nativen Fensters haben Vorrang. Die Standardbeziehung nutzt Overlay-Reihenfolge, DOM-Zugehörigkeit und Hintergrundzustand, statt beliebige CSS-Stapelkontexte zu interpretieren. Konfigurieren Sie ungewöhnliche Layouts explizit.

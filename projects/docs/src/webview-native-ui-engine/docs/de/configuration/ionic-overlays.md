---
title: "Ionic-Overlays"
sourceRevision: "66f553b125b64f13775438f6547593ceafc32bb6d3487cc6a9647e8251db1378"
---
# Native UI mit Ionic-Overlays überdecken

Verwenden Sie diesen Adapter, wenn ein Ionic-Modal oder ein anderes überdeckendes Web-Overlay über nativen Inhalten erscheinen soll, die von der Engine verwaltet werden. Die native Registrierung übernimmt Aufnahme und Wiederherstellung, kann den Darstellungslebenszyklus von Ionic jedoch nicht aus einer nativen Ansicht ableiten. Dieser gemeinsame Monitor trifft die Abdeckungsentscheidung für alle Registrierungen.

Anwendungen verwenden diesen Adapter mit einem Engine-fähigen Plugin. Plugin-Entwickler integrieren zuerst anhand des [Capacitor](../getting-started/capacitor.md)- oder [Cordova](../getting-started/cordova.md)-Leitfadens. Anwendungen ohne Ionic verwenden eigene Lebenszyklusbenachrichtigungen und installieren diesen Adapter nicht.

Der Einstiegspunkt `/ionic` bietet eine gemeinsame Framework-Integration. Er beobachtet Ionic-Overlays und bestimmt, welche registrierten Oberflächen sie überdecken. Die explizite Darstellungssteuerung eines Plugins bleibt Teil seiner API und wird über [Projektionsbenachrichtigungen](events.md) oder seine bestehende [Renderer-API](../advanced/renderer.md) angebunden.

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

Alert bezeichnet hier Ionics `ion-alert`. Dieser Adapter fängt `window.alert()` nicht ab, erkennt HTML-`<dialog>` nicht automatisch und beobachtet keine nativen Dialoge. Eigene Web-Overlays können Lebenszyklusereignisse über das unten beschriebene `additional` bereitstellen.

Ein Popover in einem nativen Fenster unterscheidet sich von einem in der WebView gerenderten Popover: Sein DOM-Platzhalter darf nicht als überdeckendes Web-Overlay behandelt werden. Das Plugin `@rdlabo/capacitor-native-ui` meldet dem Monitor diese native Darstellungszuständigkeit. Schlägt die native Darstellung fehl, gibt es diese Zuständigkeit frei, und der Monitor nimmt die gewöhnliche Web-Overlay-Abdeckung wieder auf. Diese Ausnahme hängt von einer expliziten Integration ab; sie wird nicht allein aus dem DOM des Popovers abgeleitet.

## Ungewöhnliche Layouts anpassen

Optionale Einstellungen gelten dokumentweit. Behalten Sie für gewöhnliche Ionic-Overlays die Standardwerte bei. `IonicOverlayOptions`, aus demselben `/ionic`-Einstiegspunkt exportiert, ist der TypeScript-Typ dieser Einstellungen und keine weitere Initialisierungsfunktion. Verwenden Sie `exclude` für ein Anwendungs-Overlay, das native Inhalte nicht überdecken soll, und `additional`, wenn dieselbe App auch einen eigenen Dialog mit eigenen Lebenszyklusereignissen verwendet. Verwenden Sie `covers` nur, wenn DOM-Zugehörigkeit und Hintergrundzustand nicht beschreiben, welche Hosts das benutzerdefinierte Layout tatsächlich überdeckt:

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

## Wenn ein Plugin wissen muss, welches Modal hinter einem anderen liegt

Verwenden Sie für die gewöhnliche Anwendungseinrichtung `enableSupportIonicOverlays()` wie oben gezeigt. Die Engine übernimmt anschließend die Ionic-Overlay-Abdeckung ohne weitere Aufrufe.

Ein Plugin, das native Steuerelemente in Ionic-Modals platziert, muss möglicherweise auch wissen, welches Modal hinter dem gerade geöffneten liegt. Zwei Hilfsfunktionen aus demselben `/ionic`-Einstiegspunkt lesen die bereits von der Engine verfolgte Modal-Reihenfolge.

Öffnen Sie beispielsweise Modal A und dann Modal B darüber:

- `ionicModalStack(document)` gibt `[A, B]` von hinten nach vorne zurück.
- `coveredIonicSurface(B)` gibt A zurück, das Modal unter B.
- Öffnet sich ein Popover über B, gibt `coveredIonicSurface(popover)` B zurück.
- `coveredIonicSurface(A)` gibt `undefined` zurück: Die Seite hinter A ist kein Modal.

A und B sind hier die tatsächlichen `ion-modal`-DOM-Elemente. Diese Hilfsfunktionen lesen nur die verfolgte Modal-Reihenfolge; sie öffnen oder schließen keine Overlays, wechseln keine Projektion und starten keine Überwachung. Rufen Sie sie auf, nachdem `enableSupportIonicOverlays()` den Monitor aktiviert hat und das betreffende Overlay in seinen Darstellungslebenszyklus eingetreten ist.

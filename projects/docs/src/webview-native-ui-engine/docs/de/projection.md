---
title: "Projektionsverhalten und erweiterte Integration"
sourceRevision: "dc6b160e5b4f2a180e49f022cd11f919909c85abf2d0f01a60e50d261638bfa1"
---
# Projektionsverhalten und erweiterte Integration

Beginnen Sie mit der Anleitung für [Capacitor](capacitor-plugin.md) oder [Cordova](cordova-plugin.md). Diese Referenz erklärt gemeinsame DOM-Anforderungen, Zielregeln und untergeordnete APIs für vorhandene Renderer.

## Zuständigkeiten

| Engine | Konsumierendes Plugin |
| --- | --- |
| DOM-Messung, Bildgeometrie und unterstützte native Scrollbindung | Native Ansichten erstellen, anhängen, positionieren und dimensionieren |
| Start, Ereignisabonnements und native Zeichenbestätigungen | Fallback-DOM in der richtigen Ebene bereitstellen |
| Vorbereiteter Bildcache, Dekodierung, Anzeige und Entfernung | Erscheinungsbildänderungen und gewünschtes Projektionsziel melden |
| Native Aufnahme und temporäre Rückkehrbilder | Native Ansichten und SDK-Aufnahmeeignung bereitstellen |
| Bildinvalidierung, Tokenbereinigung und Beobachterabbau | Geschäftsaktionen und interaktiven Web-Fallback verwalten |

Ein DOM-Slot enthält nicht zwingend einen Web-Ersatz: Ein UI-Plugin kann eine Schaltfläche wiederherstellen, ein Anzeigen-Plugin seinen Slot hingegen ausblenden. Die Bildübergabe ist explizit und nicht interaktiv. Die Engine leitet niemals Klicks durch ein Bild weiter und ersetzt nicht die Klick-/Impressionsbehandlung des SDKs.

## Projektionsvertrag

Eine Benachrichtigung bestimmt, **wohin die Fläche gehört**, nicht wie sie aufgenommen wird. Die Engine wählt die plattformspezifische Übergabe, ohne vom Plugin eine weitere Kopie des Projektionszustands zu verlangen.

| Gewünschtes Ziel | Erforderliches Verhalten |
| --- | --- |
| `native` | Interaktive native Ansicht mit bestätigter Geometrie anzeigen. Bei Bewegung unterstütztes natives Tracking oder ein vorbereitetes Bild verwenden. |
| `web` | Nativen Inhalt unter der überdeckenden Web-Ebene halten, indem seine native Projektion entfernt wird; ein vorbereitetes Bild oder den Web-Fallback des Plugins verwenden. |
| `none` | Nativen Inhalt, projizierte Bilder und Fallback-Inhalt entfernen. Spätere Aktualisierungs-/Aufnahmecallbacks dürfen sie nicht wieder anzeigen. |

Overlay-Abdeckung kann `native` vorübergehend in `web` ändern; sie überschreibt niemals `none`. Ein Aufnahmefehler ändert das gewünschte Ziel nicht. `failedFallback: native` ist nur für Verbraucher gültig, die ihre native Platzierung selbst pflegen, und überschreibt niemals explizites `web`, `none` oder Overlay-Abdeckung.

Die Engine verwaltet Bildbereitschaft und Wiederherstellungsbestätigung. Sie darf native Pixel nicht ausblenden, bevor Ersatzpixel bereit sind, und Ersatzpixel nicht entfernen, bevor die native Wiederherstellung erfolgreich ist. Reine Positionsbewegungen verwenden vorbereitete Inhalte erneut; Änderungen an Erscheinungsbild, Größe und Renderer-Identität invalidieren sie. Bei fehlendem Bild greift sofort der deklarierte Fallback, statt während eines Übergangs auf eine Aufnahme zu warten.

Registrierung und Benachrichtigungsweiterleitung behalten die letzte Absicht über Start und Wiederverbindung hinweg; sie führen Geschäftsereignisse nicht erneut aus. Die Zerstörung entfernt Registrierung und Bildcache. Benachrichtigungen sind Absichtserklärungen, keine Abschlussversprechen: Eine API, die abgeschlossenes Ausblenden verspricht, muss die unter DOM- und nativen Flächenanforderungen beschriebene explizite Entfernungsbestätigung abwarten.

Ein vorhandener Renderer, der CSS-Sichtbarkeit prüft, kann `getUnprojectedVisibility(element)` aus dem npm-Paket aufrufen. Die Funktion liest die aktuelle vom Autor gesetzte/geerbte Sichtbarkeit ohne die Ausblendregeln der Engine und stellt vor der Rückgabe die Projektionszuständigkeit wieder her. Leiten Sie im konsumierenden Plugin die Projektionszuständigkeit nicht aus Engine-Markierungsattributen ab und verändern Sie diese nicht. Wie Engine-eigene DOM-Mutationen von der Renderer-Invalidierung ausgeschlossen werden, wird unten beschrieben. Dieser Helfer liest Stile und kann Attributbeobachter auslösen; Mess- und Transportkosten entfallen dadurch nicht.

## DOM- und native Flächenanforderungen

`projectionSelector` ist erforderlich und muss mit einem gültigen CSS-Selektor **beim Projektionsbeginn genau einen vorhandenen Container auflösen**. ID-, Klassen-, Attribut- und Nachfahrenselektoren werden unterstützt; bei keinem oder mehreren Treffern bleibt Native ausgeblendet. Die Engine erstellt den Fallback-Container nicht und bestimmt weder Größe, Platzierung, Ebene noch z-index. Behalten Sie das normale Containerlayout und interaktive Web-Bedienelemente; ein leerer Platzhalter ohne Größe ist kein nutzbarer Fallback. Dies ist ein fester Gültigkeitsbereich, kein Suchstamm.

Der Container muss bei der Registrierung noch nicht existieren. Bei fehlendem DOM wird gewartet, ohne nativen Inhalt anzuzeigen; sein Ersetzen erzeugt eine neue Bindung und entfernt alte Bilder. Die Engine erhält Kinder, Listener und Werte des Containers. Übergeben Sie die native Ansicht selbst über `view`; eine Gruppe von Bedienelementen kann ihren gemeinsamen nativen Container verwenden. Die Engine verwaltet die interne Kennung, daher sind weder ID-Liste noch View-Dictionary nötig. Unabhängige Flächen verwenden separate Registrierungen.

Ein Web-Component-Host kann das Ziel sein, etwa `projectionSelector: 'native-ad[placement="home"]'`. Geben Sie dem Host eine Layoutbox (`display: block` mit den gewünschten Abmessungen); die Engine beobachtet Einfügen, Entfernen und Änderungen an Selektorattributen. Der Selektor läuft im Dokument und durchsucht keine Shadow Roots. Die Engine blendet während der Projektion Fallback-Inhalte und Pseudoelemente im Light DOM und in offenen Shadow Roots aus. Inhalte geschlossener Shadow Roots können nicht untersucht werden und müssen die `visibility` des Hosts erben; stellen Sie einen Container bereit, dessen Shadow-/Slot-Struktur das eingefügte Bild anzeigen kann.

Unter [unterstützte Projektionscontainer](projection-containers.md) finden Sie die HTML-Tabelle, das vollständige Inventar der Ionic-Elemente, Größenbedingungen und ein Beispiel für einen umschließenden Container.

### Anforderungen an native Flächen

Behalten Sie bei unabhängig bewegten AdMob-Slots eine Registrierung pro geladener nativer Ansicht/Fläche, verwenden Sie einen slotspezifischen Selektor und filtern Sie Plugin-Benachrichtigungen mit `receiveListeners.match` (`match: ["slotKey": slotKey, "loadId": loadId]` / `match = mapOf("slotKey" to slotKey, "loadId" to loadId)`). Geben Sie die Registrierung beim Ersetzen einer geladenen Anzeige frei, auch wenn deren Hostansicht wiederverwendet wird. Belassen Sie SDK-Laden, Impressions- und Klickbehandlung im Anzeigen-Plugin. Stellen Sie `canCapture` mit dessen vorhandenen Eignungsprüfungen bereit (etwa Einschränkungen auf Testanzeigen, undurchsichtigen Hintergrund und keine Videos); die Engine erteilt keine Erlaubnis zur Aufnahme einer SDK-Ansicht.

Setzen Sie für SDK-Verbraucher ohne gleichwertigen Web-Fallback unter iOS `failedFallback: .native` beziehungsweise unter Android `failedFallback = NativeUIProjection.FailedFallback.NATIVE`. Der Standard `.web` / `WEB` erhält bestehende Verbraucher. Kann automatische Bewegung kein vorbereitetes Bild nutzen (nicht bereit, nicht unterstützte Aufnahme oder abgelehnte Übergabe), erhält `native` die aktive native Ansicht und hält das Fallback-DOM ausgeblendet. Der Verbraucher muss diese Ansicht weiterhin positionieren; diese Option erzeugt kein natives Scrolltracking auf Android. Explizites `web`, `none` und Overlay-Abdeckung haben Vorrang: Die Option hebt niemals eine native Ansicht über eine absichtlich überdeckende Web-Ebene.

Verwenden Sie für undurchsichtige, per Software renderbare Android-SDK-Ansichten `captureMode = NativeUIProjection.CaptureMode.VIEW` zusammen mit einer expliziten `failedFallback`-Richtlinie (`WEB`, sofern der Verbraucher die native Platzierung nicht selbst pflegt). Dies zeichnet nur die Pixel der View ohne umliegenden Abstand, sodass die Aufnahme einer teilweise sichtbaren Anzeige keine Werkzeugleiste oder angrenzenden Inhalte einbrennen kann. Video, SurfaceView, durchscheinende Ansichten und Inhalte, die Window-Komposition benötigen, müssen den Standardmodus `COMPOSITED` behalten. Der Verbraucher muss einen passenden beschnittenen DOM-Host für die gesamte undurchsichtige View bereitstellen; beliebige native Konturmasken, Transformationen und benutzerdefinierte Beschneidungen werden nicht nachgebildet.

VIEW-Pixel werden nach nativer View-Identität, Abmessungen und Inhaltsrevision gecacht. Normales Scrollen behält das dekodierte Web-Bild und aktualisiert die Platzierung ohne Aufnahme, PNG-Encoding oder Bilddekodierung. Das Bild bedeckt die Border-Box des Hosts am lokalen Ursprung (0, 0), unabhängig von der Bestätigungslatenz nativer Platzierung. Undurchsichtige Bilder bleiben zwischen Scrollbewegungen unter der aktiven nativen View gezeichnet. Vor dem Ausblenden dieser View wartet die Engine auf visuelle WebView-Bereitschaft und einen Zeichenvorgang; VIEW erzeugt keine nativen Eintritts- oder Rückkehrbildkopien. Die Rückkehrbestätigung wartet den nativen Zeichenvorgang und den folgenden Animationsframe ab. Eine Generationsprüfung verhindert, dass ein verspäteter Cover-Callback Inhalte nach Wiederherstellung oder Suspendierung ausblendet.

Die native Bitmap wird im VIEW-Modus nach dem PNG-Encoding freigegeben; PNG und dekodiertes Web-Bild bleiben gecacht. Plugin-Aktualisierungsbenachrichtigungen erhöhen die Inhaltsrevision: Melden Sie jede Inhaltsänderung ohne Austausch der View als Aktualisierung. Ersetzen der Registrierung, WebView-Navigation, Reset oder Schließen entfernt den Cache. Encoding bleibt außerhalb des UI-Threads; View-Zeichnung und Cache-Zuständigkeit bleiben darauf, mit der bestehenden Grenze von 8 Millionen Pixeln.

COMPOSITED behält native Übergabekopien für durchscheinende Inhalte. Eintrittskopien warten vor ihrer Entfernung auf visuelle WebView-Bereitschaft und einen Zeichenvorgang. Läuft die Eintrittsfrist von 500 ms ab, wird die native View vor Entfernung der Kopie wiederhergestellt und eine verspätete Zeichenbestätigung abgelehnt.

Android-VIEW-Verbraucher können nach erfolgreichem Cover `isProjecting` auf dem UI-Thread lesen, um native Platzierungsarbeit bei gleicher Größe aufzuschieben. Behalten Sie nur die letzte akzeptierte Platzierung; validieren Sie weiterhin Sequenz/Generation und behandeln Sie Ausblenden, Größenänderung und Bereinigung sofort. Stellen Sie `beforeNativeReveal` bereit, um die ausstehende Platzierung synchron anzuwenden, bevor normale Wiederherstellung, Fehlerwiederherstellung oder Freigabe des aktiven Bilds native Pixel sichtbar machen. Die Engine setzt `isProjecting` vor dem Callback zurück, daher darf die Platzierungsanwendung nicht erneut aufschieben. Der Callback kann ohne ausstehende Arbeit laufen und muss idempotent sein. Löschen Sie ausstehende Verbraucherarbeit beim Ausblenden/Zerstören und validieren Sie vor Anwendung die Identität der geladenen View. Der Callback ersetzt weder Inhalts-/Größeninvalidierung noch JavaScript-Geometrietracking.

Unter Android müssen Verbraucher, deren asynchrone Ausblendemethode das Verschwinden aller Pixel verspricht, `projection.hide { completed -> ... }` aufrufen und erst bei `completed` gleich true auflösen. Native Übergabekopien verschwinden sofort; der Abschluss wartet auf die synchrone Entfernung des Web-Proxys. Ein Timeout meldet Fehler, keinen Erfolg. Rufen Sie beim erneuten Anzeigen zusätzlich zu normalen Plugin-Ereignissen `projection.show()` auf; dies erhält auch die Darstellungsabsicht, falls das Ereignisabonnement noch startet.

Scrollbeobachtung folgt den Vorfahren im zusammengesetzten Baum einschließlich zugewiesener Slots. Nicht zusammengesetzte Scrollereignisse innerhalb eines Ionic-Shadow-Baums werden an ihrer Quelle beobachtet; Anwendungen ergänzen keinen zusätzlichen Listener und senden keine synthetischen Dokumentereignisse. Listener folgen Host-Umhängungen und Slot-Neuzuweisungen und werden bei der Bereinigung entfernt.

Scrollen wird intern behandelt: iOS verwendet eine eindeutig zugeordnete native Scrollbindung, wenn verfügbar; andernfalls, auch unter Android, nutzt Scrollen vorübergehend das vorbereitete Bild und stellt nativen Inhalt nach Ende der Bewegung wieder her. Automatische Scrollbehandlung überschreibt niemals explizites `web` oder `none`. Nicht unterstützte Aufnahme oder Geometrie erhält den normalen DOM-Fallback; auf dem Übergangspfad wird nicht auf eine neue Aufnahme gewartet. Das letzte explizite Ziel übersteht WebView-Neuladen, und Antworten alter Dokumente können keine Anfragen eines neuen Dokuments abschließen.

Standardmäßig ist der interne Kanal auf den Hauptframe der localhost-Origins von Capacitor begrenzt. Übergeben Sie bei einem anderen konfigurierten Origin die exakten `allowedOrigins` der Anwendung. Android benötigt die WebView-Funktionen `WEB_MESSAGE_LISTENER` und `DOCUMENT_START_SCRIPT`; auf nicht unterstützten WebViews scheitert die Registrierung explizit. Verwenden Sie keine Wildcard-Origins für WebViews, die zu entfernten Seiten navigieren können.

## Ionic-Overlay-Unterstützung (optional)

Rufen Sie dies in einer Ionic-Anwendung einmal beim Start auf. Installieren Sie bei direktem Aufruf aus der Anwendung `@webview-native-ui/engine` als direkte Anwendungsabhängigkeit:

```ts
import { enableSupportIonicOverlays } from '@webview-native-ui/engine/ionic';

enableSupportIonicOverlays();
```

Plugin-Maintainer können diesen Ausschnitt in ihre Einrichtungshinweise aufnehmen oder in einem vorhandenen JS-Initialisierer aufrufen. `@rdlabo/capacitor-native-ui` ruft denselben Initialisierer bereits intern auf; dessen Nutzer benötigen keinen weiteren Aufruf. Nicht-Ionic-Anwendungen lassen ihn weg. Native Registrierung allein installiert keine Ionic-Ereignislistener.

Pro Dokument wird ein Monitor geteilt, auch zwischen npm-Modul und der von Swift/Android injizierten Laufzeit. Wiederholte Initialisierung ergänzt keine Listener und löscht keine explizite Konfiguration. Das Zerstören einer Projektion entfernt nur deren Abonnement, nicht den von anderen Plugins verwendeten Monitor. Der Monitor lebt mit dem Dokument.

Der Standard berücksichtigt Lebenszyklusereignisse von Modal, Popover, Alert, Action Sheet, Loading, Picker, Toast und Menu. Er vergleicht das DOM jeder Projektion mit dem aktiven Overlay-Stapel: Inhalte innerhalb des vordersten Modals bleiben nativ, überdeckte Inhalte verwenden vorübergehend ihr vorbereitetes Bild. Toasts und inaktive Sheet-Backdrops überdecken keine Fläche. Verschachtelte Overlays halten sie überdeckt, bis der verbleibende Stapel die Wiederherstellung erlaubt. Bei fehlenden Bildern bleibt der normale Web-Fallback. Diese temporäre Abdeckung überschreibt niemals das explizite Plugin-Ziel `web` oder `none`. Später registrierte Projektionen lesen den aktuellen Zustand.

Die Zuständigkeit für native Popover liefert der Renderer von Native UI für vertical-bars. Der gemeinsame Monitor behandelt dessen Quell-DOM nicht als überdeckendes Web-Overlay. Schlägt native Darstellung fehl, gibt der Renderer die Zuständigkeit frei und normale DOM-Abdeckung setzt wieder ein.

Optionale Einstellungen gelten dokumentweit:

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

Verwenden Sie `covers(overlay, target)` nur, wenn eine registrierte DOM-Projektion eine eigene Abdeckungsregel benötigt; geben Sie für den Standard `undefined` oder zum Überschreiben einen booleschen Wert zurück. Ausschlüsse und explizite Zuständigkeit eines nativen Fensters haben Vorrang. Die Standardbeziehung nutzt Overlay-Reihenfolge, DOM-Enthaltensein und Backdrop-Zustand, statt beliebige CSS-Stapelkontexte zu interpretieren. Konfigurieren Sie ungewöhnliche Layouts explizit.

## Untergeordnete Web-Projektion

Ein Gültigkeitsbereich bindet ein vorhandenes Web-Fallback-Element über dessen Lebensdauer. Beziehen Sie das Element aus dem Plugin-DOM; die Engine erzeugt keinen Ersatzhost und wählt weder Seite, Stapelreihenfolge noch z-index. Ein anderes Fallback-Element erfordert einen neuen Gültigkeitsbereich. Sein Document ergibt sich aus `element.ownerDocument`.

```ts
import { createWebProjectionScope, createWebProjection } from '@webview-native-ui/engine';

const fallback = container.querySelector<HTMLElement>('[data-web-fallback]');
if (!fallback) throw new Error('Web fallback is missing');
const scope = createWebProjectionScope(fallback, 'my-plugin');
const projection = await createWebProjection(
  scope,
  {
    send: (request) => plugin.snapshot(request),
    listen: (listener) => plugin.addListener('snapshotInteraction', listener),
  },
  {
    wake: () => schedulePluginUpdate(),
    blocked: () => overlayIsActive(),
    revision: () => lastSentRevision,
  },
);
```

Container, Bridge und Aktualisierungscallbacks oben gehören zum konsumierenden Plugin. Dem Projektionsmanager werden weder `document`, `target`, `layer`, CSS-Selektor noch Ebenenresolver übergeben.

1. Rufen Sie nach einer akzeptierten nativen Aktualisierung `projection.consider(revision, sources)` auf. Quellen ordnen native IDs und Viewport-Rechtecke ihrem Quell-DOM zu; sie müssen nicht im Fallback-Element liegen. Bilder werden vorab aufgenommen und dekodiert.
2. Rufen Sie bei Erscheinungsbildänderungen `projection.changed()` oder zur Invalidierung der Scrollgeometrie `projection.changed(scrollElement)` auf. Layoutaktualisierungen laufen über `consider`; verwenden Sie `invalidate()` für andere Geometrieänderungen.
3. Rufen Sie vor dem Überdecken nativer Inhalte durch ein Web-Overlay `projection.begin()` auf. Es zeigt bereits vorbereitete Pixel am festen Fallback. Hier startet weder eine neue Aufnahme noch Dekodierung. Ist keine Aufnahme verfügbar, behält das Plugin seinen normalen Web-Fallback.
4. Schließen Sie `projection.owners` aus normalen nativen Aktualisierungen aus, solange das Bild diese Quellen verwaltet. `visibleOwners` hält deren Rückkehrpixel während nativer Wiederherstellung; `preparedOwners` kennzeichnet Quellen mit vorbereiteten Bildern. Diese Arrays sind schreibgeschützte Momentaufnahmen.
5. Rufen Sie `projection.end()` auf, senden Sie die normale native Aktualisierung und rufen Sie dann `projection.updated(snapshotToken, acceptedIDs, revision)` auf. Eine neuere Bestätigung mit allen erfassten IDs entfernt das Bild.
6. Rufen Sie bei Freigabe der Fläche `projection.destroy()` auf. Es gibt nur eigene Bilder und Listener frei; das Plugin verwaltet abschließenden nativen Reset und sein DOM.

Die Engine bereitet ein nicht interaktives `img` innerhalb des Fallback-Containers vor (direkt in dessen offenem ShadowRoot, sofern vorhanden), während Native sichtbar ist. Sie verwendet das dekodierte Bild und den DOM-Knoten über Übergaben hinweg wieder und gibt sie frei, wenn der Gültigkeitsbereich stillgelegt oder zerstört wird. Das Bild ist `inert`, vor Hilfstechnologien verborgen und vom Hit-Testing ausgeschlossen. Der vorhandene Fallback und seine Kinder werden niemals geklont, ersetzt, entfernt oder mit `inert`/`aria-hidden` versehen; Listener, Werte und Anwendungsänderungen bleiben über die Projektion hinweg erhalten. Sowohl `::before` als auch `::after` bleiben für die Anwendung verfügbar.

Stellen Sie einen vorhandenen Container bereit, etwa `div`, `button` oder ein eigenes Element. Ersetzte/leere Elemente wie `img`, `input` und `video` werden weiterhin nicht als Gültigkeitsbereiche unterstützt; verwenden Sie deren vorhandenen Fallback-Container. Der Renderer darf denselben Container zwischen Eltern verschieben, aber nicht das Element eines Gültigkeitsbereichs der Low-Level-API ersetzen oder zwei Manager gleichzeitig darüber verfügen lassen. Benachrichtigen Sie den Manager über `moved()`, wenn Sie während der Projektion dessen Platzierung ändern.

Das Bild ist innerhalb des Fallbacks absolut positioniert; dieser behält seine Layoutbox. Wie bei der vorherigen Darstellung durch ein Pseudoelement werden statische Hosts positioniert, während das Bild sichtbar ist. Beschneidung, Transformationen und Filter des Hosts und seiner Vorfahren gelten weiterhin. Das Einfügen in einen offenen ShadowRoot umgeht interne Slot-Wrapper, nicht die Beschneidung durch den Host selbst. Geschlossene Shadow Roots können nicht untersucht werden; stellen Sie einen Fallback-Container bereit, der das Bild rendern kann.

Engine-eigene Knoten tragen während ihrer gesamten Lebensdauer im Pool `data-native-ui-projection-node`. Renderer, die Fallback-Kinder untersuchen, müssen diese Knoten bei der Ermittlung von Anwendungsinhalten ausschließen. Ein Renderer, der einen MutationObserver zur Invalidierung von Aufnahmen verwendet, muss auch Einfügen/Entfernen und Attributänderungen dieser Knoten, Änderungen innerhalb dieser Knoten und Engine-eigene `data-native-ui-snapshot-*`-Attribute ignorieren. Beobachten Sie weiterhin Anwendungsinhalte, Abmessungen und Änderungen des Deaktivierungszustands; das Ignorieren aller Mutationen auf einem Projektionshost würde echte Aktualisierungen verbergen. Andernfalls kann sich die Bildvorbereitung selbst invalidieren und wiederholte Aufnahme-/Freigabezyklen auslösen. Die Engine entfernt bei der Freigabe nur ihre eigenen Knoten. Das Einfügen von Kindern kann strukturelle Selektoren innerhalb des Fallbacks beeinflussen, fügt aber keine Elemente neben ihm in Flex-, Grid- oder virtuellen Listen hinzu.

### Benachrichtigungen des vorhandenen Plugins

Der untergeordnete Manager kann über `options.events` Ereignisse des vorhandenen Plugins abonnieren:

```ts
events: {
  addListener: (name, listener) => plugin.addListener(name, listener),
  update: ['setColors', 'setTabs', 'tabSelected'],
  projection: {
    native: ['shown'],
    web: ['transitionStarted'],
    none: ['hidden'],
  },
}
```

Dies sind **Benachrichtigungen**, keine abgefangenen Methodennamen. Das Plugin sendet Aktualisierungsereignisse nach erfolgreichen nativen Änderungen. Ein Web-Projektionsereignis muss vor Bewegungsbeginn eintreffen; es verwendet das zuvor vorbereitete Bild. Ein natives Ereignis fordert Wiederherstellung an, aber das Bild bleibt, bis die normale Renderer-Bestätigung native Bereitschaft bestätigt. Ein Ausblendereignis folgt der nativen Ausblendeoperation des Plugins und entfernt das Bild; es ruft weder `hide()` auf noch ändert es anwendungseigenes Fallback-DOM. Erscheinungsbildaktualisierungen erhalten das angeforderte Ziel einschließlich `none`.

Stellen Sie bei Plugins mit mehreren Flächen `accepts(event)` bereit, um die stabile Flächenidentität dieses Gültigkeitsbereichs auszuwählen. Ereignisse, die `update` und ein Ziel teilen, werden einmal abonniert und gemeinsam verarbeitet. Widersprüchliche Ziele desselben Ereignisses werden vor dem Abonnement abgelehnt. Das Zerstören des Managers entfernt alle seine Abonnements, auch Registrierungen, die nach fehlgeschlagener Initialisierung verspätet aufgelöst werden. Keine öffentliche Plugin-Methode wird umhüllt oder erneut ausgeführt.

Der Manager konvertiert private native Datei-URLs intern mit Capacitor. Plugin-Autoren stellen keinen URL-Resolver bereit.

Dieser Abschnitt beschreibt den untergeordneten Manager für Renderer, die bereits Batch-Abgleich verwalten, etwa den Ionic-Adapter. Bevorzugen Sie bei neuen Integrationen die native Registrierung aus den Plugin-Anleitungen; sie verwaltet Start, Messungen und Zeichenbestätigungen.

### Mehrere Fallbacks in einer nativen Transaktion

Verwenden Sie `createWebProjectionBatch(transport, options)`, wenn mehrere Fallback-Elemente gemeinsam wechseln müssen. Es nutzt dieselbe Bild-Engine, einen Listener und ein Aufnahme-/Cover-/Restore-Token. Übergeben Sie für jeden Eintrag `{ scope, element, control, ... }` an `batch.consider(revision, sources)`. Mehrere native IDs können einen Gültigkeitsbereich teilen, etwa eine Schaltflächengruppe.

Der Batch leitet sein Document aus dem ersten nicht leeren `consider` ab; alle folgenden Gültigkeitsbereiche und Quellen müssen zu diesem Document gehören. Vor dieser ersten Aktualisierung tut `begin()` nichts und `destroy()` ist sicher. Ein geänderter Fallback benötigt einen neuen Gültigkeitsbereich. Dessen Identität ist Teil der Cache-Invalidierung; eine aktive Darstellung behält ihre erfassten Gültigkeitsbereiche bis zum Abschluss der Wiederherstellung.

`WebProjectionRequest` ist eine nach Aktion diskriminierte Union. `prepare` benötigt `revision`, `viewportWidth` und `ids`; `cover` benötigt `token`; `restore` benötigt `token`, `viewportWidth` und Ziel-`parts`; `painted`, `restored` und `release` benötigen `token`; `reset` nimmt keinen Payload. Leere Vorbereitungsergebnisse und `{ shown: false }` bedeuten, dass das Plugin seinen normalen Web-Fallback nutzen soll. Verwenden Sie die vorhandene geordnete Bridge des Plugins; die Engine wiederholt keine Benutzeraktionen.

### Native Übergabe auf beiden Plattformen

Rufen Sie alle View- und Snapshot-Lebenszyklus-APIs auf dem Haupt-/UI-Thread auf. Native Eingaberechtecke verwenden **Punkte relativ zur WebView unter iOS** und **physische Pixel relativ zur Referenzansicht unter Android**. `viewportWidth` ist die Web-Viewport-Breite in CSS-Pixeln. An JavaScript gesendete vorbereitete Teile werden in CSS-Pixel konvertiert.

Auf beiden Plattformen installiert `cover` das vorbereitete Eintrittsbild **vor dem Ausblenden der übergebenen aktiven Ansichten** innerhalb desselben UI-Durchlaufs. Der boolesche Rückgabewert meldet, ob dies möglich war; bei Fehler bleibt die Sichtbarkeit unverändert. Übergeben Sie für jede erfasste Komponente die tatsächlichen Ansichten. Blenden Sie Ansichten nicht separat aus und erzeugen Sie keine weitere Eintrittskopie.

```swift
let shown = snapshots.cover(token, in: webView, views: renderedViews, transient: movingSurface)
```

```kotlin
val shown = snapshots.cover(token, activity.window, webView, renderedViews, transient = movingSurface)
```

`transient: true` dient einer bewegten Vordergrundfläche und ersetzt nicht den `coveringToken` des Hintergrunds. Entfernen Sie die Eintrittskopie nach Web-Bildbereitschaft mit `retireCopy(token)`. Machen Sie vor einer normalen nativen Aktualisierung die Sichtbarkeitsänderungen der Engine mit iOS `restoreControls()` / Android `restoreViews()` rückgängig. Bei der Rückkehr installiert `restore` das gecachte Rückkehrbild, das Plugin rendert darunter und `retireCopy(token, entry: false)` entfernt es nach entsprechender Bestätigung/Bereitschaft. Diese plattformnativen Namen bleiben idiomatisch; der Lebenszyklus ist gleich. `cover` ist eine Eintrittsoperation, keine bei jeder normalen Aktualisierung zu wiederholende Methode.

Tokenbereinigung verwendet `release(token)`; Besitzerbereinigung verwendet `reset()` (unter Android zusätzlich `close()` beim Freigeben des Encoders). Ein Flächenmanager darf nicht die Aufnahmen einer anderen Fläche zurücksetzen. Bei fehlender Aufnahme oder nativer Platzierung bleibt der Renderer für den Web-Fallback verantwortlich.

Die optionalen Callbacks `eligible(source)` und `current(sources)` halten frameworkspezifische Flächenauswahl außerhalb der Engine. `transient: true` unterstützt eine bewegte Fläche, deren Rückkehrbild neu positioniert werden muss. Beliebige CSS-Transformationen werden von nativem Scrolltracking nicht unterstützt; solche Bewegung kann den Bildpfad nutzen.

Der Bildtransport akzeptiert `WebProjectionRequest` und liefert vorbereitete Token/Teile oder `{ shown: false }`. Teile verwenden lokale `file:`-URLs und Viewport-Koordinaten in CSS-Pixeln. Anfragen nutzen die vorhandene geordnete Bridge des Plugins:

| Aktion | Native Verantwortung |
| --- | --- |
| `prepare` | Aktuelle Revision und IDs validieren, dann `NativeUICoveredSnapshots.prepare` mit tatsächlich gerenderten Rechtecken aufrufen. |
| `cover` | Token und vollständige Zuständigkeit für native Flächen validieren; Eintrittskopie erzeugen und zugehörige native Ansichten ausblenden. Bei Fehler `shown: false` zurückgeben. |
| `painted` | Nur die Eintrittskopie dieses Tokens entfernen. |
| `restore` | Vorbereitete Rückkehrkopie auf die übergebenen Rechtecke umpositionieren. Hier niemals aufnehmen. |
| `restored` | Nur die Rückkehrkopie dieses Tokens nach nativem Update-ACK und Web-Zeichengrenze entfernen. |
| `release` | Benanntes Token, Dateien und zugehörige temporäre Ansichten freigeben. |
| `reset` | Nur Besitzerbereinigung; alle nativen Aufnahmeressourcen freigeben. |

Verwenden Sie `NativeUICoveredSnapshots.observe`, um den JS-Listener bei Beginn und Ende von Interaktionen zu benachrichtigen. Unter iOS rasterisieren Aufnahmen das sichtbare Fenster mit `drawHierarchy(in:afterScreenUpdates:)`, einschließlich des Hintergrunds unter der beschnittenen nativen Komponente. Bildschirm-Snapshot-Views sind Kopien für die Anzeige und werden nicht als Bitmap-Quellen verwendet. Bei Materialien wie Liquid Glass kann die UIKit-Rasterisierung vom Live-Compositor abweichen; prüfen Sie das Erscheinungsbild auf physischen Geräten mit den von Ihrem Plugin unterstützten Hintergründen. Cache-Gültigkeit umfasst deshalb Layout und visuelle Änderungsbenachrichtigungen des Plugins. Die Engine nimmt nicht fortlaufend auf und garantiert nicht die Aufnehmbarkeit jedes denkbaren Renderers.

### Temporärer Speicher und Anwendungsberechtigungen

Vorbereitete Bilder bleiben im privaten temporären Speicher der App. iOS verwendet `FileManager.default.temporaryDirectory`. Erstellen Sie unter Android `NativeUISnapshots` mit einem Verzeichnis innerhalb von `context.cacheDir`; verwenden Sie keinen gemeinsamen oder externen Speicher. Keine Plattform benötigt für diesen Pfad eine Foto- oder Speicherberechtigungsabfrage. Kein Capacitor-Filesystem-Plugin ist erforderlich. Siehe [Apples Sandbox-Verzeichnisse](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/FileSystemOverview/FileSystemOverview.html) und [Androids app-spezifischen Speicher](https://developer.android.com/training/data-storage/app-specific).

`Capacitor.convertFileSrc` ordnet die zurückgegebene Datei-URL dem vorhandenen lokalen WebView-Server zu. Es gewährt keine Dateisystemberechtigung und lädt das Bild nicht hoch. Setzt die Anwendung eine Content Security Policy, muss deren `img-src` den von dieser URL verwendeten lokalen App-Origin erlauben; aktivieren Sie keinen pauschalen `file:`-Zugriff oder sachfremde WebView-Dateizugriffseinstellungen.

`release(token)` und Besitzerbereinigung entfernen eigene Snapshot-Dateien. Abruptes Prozessende kann temporäre Bilder hinterlassen, bis das Betriebssystem den Cache löscht oder die App deinstalliert wird; sofortiges Löschen nach einem Absturz ist nicht garantiert. Halten Sie den Speicher privat und behandeln Sie ihn als entbehrlich, nicht als dauerhafte Anwendungsdaten.

## Natives Scrolltracking

`readScrollPlacement(element, owner, identify)` misst einen nicht transformierten Overflow-Besitzer. `createScrollBindings()` validiert Wiederverwendung und erkennt Bewegung, während die Übernahme auf ein ACK wartet. Nehmen Sie `reuse` nicht in Layout-Deduplizierungssignaturen auf; es beschreibt den Bestätigungszustand, nicht das Layout.

Unter iOS gruppiert `NativeUIScrollBindings.replace` Quellen nach Besitzer und bindet nur eine eindeutig passende `UIScrollView`. `update()` wendet Positionen und Beschneidung an, ohne Inhalte neu aufzubauen. `NativeUIClippedView` erhält die vollständigen Inhaltsabmessungen und beschränkt zugleich sichtbare Pixel und Treffertests.

Eine bestehende, nativ abgelehnte Bindung verliert ihre Zuständigkeit und kann über **denselben** Update-/ACK-Pfad neu übernommen werden. Eine fehlgeschlagene Neuübernahme bleibt bis zu einem relevanten Layout-/Scrollende-Ereignis beim Fallback. Ergänzen Sie niemals eine sofortige Wiederholungsschleife und führen Sie keine Benutzeraktionen erneut aus. Eine Frame-/Props-Änderung kalibriert einen bestehenden Koordinatenursprung nicht neu.

Dies verwendet WKWebViews interne Overflow-Hierarchie ohne private Klassennamen. Fehlende/mehrdeutige Ansichten, verschachteltes Scrollen, Dokumentscrollen, nicht unterstützte Transformationen, geformte Beschneidung oder ein bewegter unbestätigter Besitzer können nicht gebunden werden. Behaupten Sie keine Unterstützung allein aufgrund einer vorhandenen `UIScrollView`. Eine native Ansicht kann Gesten abfangen, die in ihr beginnen; deren Weiterleitung und SDK-Barrierefreiheit bleiben rendererspezifisch.

## Android-Bibliothek

Android verwendet eine Gradle-Android-Bibliothek, die über Maven als AAR statt über Capacitor-Plugin-Registrierung verteilt wird. Die Veröffentlichungskoordinaten sind `io.github.webview-native-ui:engine:<version>`. Erstellen und prüfen Sie die lokale Maven-Veröffentlichung mit:

```sh
android/gradlew -p android testDebugUnitTest assembleRelease connectedDebugAndroidTest publishReleasePublicationToVerificationRepository
```

`NativeUIClippedView` ist ein untergeordneter Helfer, der vom Aufrufer gelieferte Position und Beschneidung anwendet, ohne unveränderte Abmessungen zurückzusetzen. `NativeUIProjection` verwaltet Bildübergabe und Wiederherstellung; es verwendet diesen Helfer nicht für das Renderer-Layout. Das konsumierende Plugin verwaltet normale native Platzierung und Größenaktualisierungen. Android behauptet keine native Overflow-Bindung nach WKWebView-Art. Übergeordnete Registrierungen teilen einen nicht konsumierenden Window-Touch-Beobachter: Down verhindert die Übernahme laufender Aufnahmen, Up/Cancel/Fokusverlust erlaubt wieder Vorbereitung, und Bereinigung entfernt nur diese Registrierung. Vorhandene Callback-Zustellung und Rückgabewerte bleiben erhalten.

`NativeUISnapshots` bereitet zusammengesetzte PixelCopy-Bilder und lokale PNG-Dateien vor und führt Cover/Restore anschließend aus diesem Cache aus. Encoding läuft außerhalb des UI-Threads; pro Besitzer läuft nur eine Vorbereitung. Melden Sie visuelle Änderungen und Interaktion und geben Sie Token bei der Bereinigung frei. Alle View-/Lebenszyklusaufrufe laufen auf dem UI-Thread. Revision, Eignung und Fallback-Richtlinie bleiben beim Plugin.

Nachdem vorbereitete Web-Pixel angezeigt oder entfernt wurden, prüft `NativeUIWebReadiness.prepare` Bereitschaft für einen nachfolgenden WebView-Zeichenvorgang. Das Prädikat `current` muss besitzende Sitzung, Quellgeneration und Bildrevision validieren. Die temporäre native Kopie überdeckt diese asynchrone Übergabe; der Overlay-Start selbst wartet nicht. Weder Bridge-Bestätigung noch dieser Callback beweist die Darstellung auf dem physischen Display.

[AdMob PR #487](https://github.com/capacitor-community/admob/pull/487) demonstriert eine dauerhafte Bildunterlage für undurchsichtige Testanzeigen. Diese Richtlinie ist nicht global aktiv: Durchscheinende Oberflächen würden doppelt zusammengesetzt, und Video-/SDK-Interaktionen verlangen rendererspezifische Entscheidungen. Erzeugen Sie niemals synthetische Klicks durch ein Bild. Der Verbraucher von Native UI nutzt die Engine auf iOS und Android. Android-Abnahmetests prüfen die echte Capacitor-Bridge und durchscheinende Compose-Inhalte. Andere SDK-Verbraucher benötigen weiterhin eigene Integration und Abnahmetests.

### Durchscheinende Android-Flächen

Erfassen Sie die zusammengesetzten Fensterpixel einschließlich Hintergrund, statt die durchscheinende Ansicht auf eine leere Bitmap zu zeichnen. Behalten Sie das vorbereitete Web-Bild dekodiert, aber ausgeblendet. Bei der Übergabe installiert `cover(token, window, reference, views)` eine temporäre undurchsichtige Bildkopie vor dem Ausblenden dieser nativen Ansichten im selben UI-Durchlauf. Zeigen Sie das Web-Bild, bestätigen Sie Web-Zeichenbereitschaft und entfernen Sie dann die Eintrittskopie. Das Overlay startet sofort; Bild-Encoding liegt niemals auf diesem Pfad.

Installieren Sie bei der Rückkehr mit `restore` die vorbereitete Rückkehrkopie, stellen Sie darunter die nativen Ansichten wieder her, blenden Sie das Web-Bild aus und entfernen Sie die Rückkehrkopie nach Web-Zeichenbereitschaft. So werden aktive durchscheinende native Pixel nicht über ihrem eigenen Snapshot zusammengesetzt. Validieren Sie Token und aktuelle Flächengeneration in jedem asynchronen Callback. Die temporäre Kopie ist nicht interaktiv und begrenzt; Bereinigung gibt beide Kopien und gecachte Ressourcen frei.

Dies erhält den aufgenommenen Hintergrund, keine fortlaufend veränderte Szene hinter dem Bild. Hintergrundänderungen müssen den Cache über dieselben visuellen Änderungsbenachrichtigungen wie Inhaltsaktualisierungen invalidieren. Video und nicht unterstützte Aufnahmeflächen behalten die Fallback-Richtlinie des Verbrauchers.

Verbraucher-Integrationstests gehören in deren jeweilige Repositorys. Engine-CI prüft Browser-, Swift- und Android-Verträge, ohne einen benachbarten Renderer-Checkout vorauszusetzen.

### Abschließende Platzierung bei Rückkehr aus einem undurchsichtigen Bild (Android)

Ein Plugin, das normalerweise bei jedem Scrollen native Platzierung misst und übermittelt, kann eine abschließende Platzierungsübergabe aktivieren. Übergeben Sie `updatePlacement: (JSONObject) -> Unit` an seine Android-Registrierung `NativeUIProjection` und binden Sie seinen Web-Host mit `bindProjectionPlacement(element, measure, invalidate)`.

- `binding.projected` wird erst nach nativer Bestätigung der Bildübergabe true. Solange es true ist, kann das Plugin die letzte Platzierung dieses Hosts in vollständigen Platzierungsbatches wiederverwenden und dessen Messung überspringen. Andere Hosts setzen ihre normalen Aktualisierungen fort.
- `measure()` liefert synchron ein JSON-Objekt. Die Engine integriert es in die vorhandene Restore-Anfrage oder eine Wiederherstellungsanfrage für ein aktives Bild. Die native Seite validiert aktives Bildtoken und View-Identität, ruft `updatePlacement` auf, macht dann native Inhalte sichtbar und bestätigt deren Zeichnung. Es entsteht kein zusätzlicher Bridge-Rundlauf.
- Das Plugin muss in `updatePlacement` seine eigene Identität, Generation und hostbezogene Sequenz validieren. Werfen Sie einen Fehler, um veraltete oder ungültige Platzierung abzulehnen. Eine abschließende Aktualisierung eines Hosts darf nicht dazu führen, dass Aktualisierungen eines anderen verworfen werden.
- `invalidate()` wird nach einer fehlgeschlagenen Übergabeanfrage aufgerufen. Löschen Sie optimistische Platzierungs-/Deduplizierungscaches und planen Sie normalen Platzierungsabgleich.
- Geben Sie die Bindung beim Ablösen eines Hosts frei. Sitzungszuständigkeit verhindert, dass eine verspätete Bestätigung einer alten Registrierung den Projektionszustand einer neuen löscht. Pause, vom Autor gesetzte Sichtbarkeit und Layoutänderungen müssen weiterhin die normalen Sichtbarkeits-/Invalidierungspfade des Plugins verwenden.

Diese Option ändert keine Registrierungen ohne `updatePlacement`. Android lehnt `updatePlacement` ab, sofern nicht `captureMode = CaptureMode.VIEW` gilt; Live-Video und andere ungeeignete Aufnahmen führen unter `failedFallback = NATIVE` natives Platzierungstracking weiter.

## Aufnahmezeitpunkt

`captureDelayMs` ist eine optionale Registrierungseinstellung, die Capacitor und Cordova gemeinsam nutzen.
Der Standardwert beträgt unter iOS, Android und in den Optionen der tieferen API-Ebene von `createWebProjection` **50 Millisekunden**.
Die Werte müssen endlich und nicht negativ sein. Die Einstellung verwendet den bestehenden Debounce-Mechanismus: Eine neue Aktualisierung oder Interaktion startet die Vorbereitung erneut, sobald die Aktivität zur Ruhe gekommen ist.
Sie fügt keinen zweiten Timer hinzu und verzögert die Anzeige des Overlays nicht.

Bis die Ersatzpixel bereitstehen, bleibt das zuletzt fertiggestellte Bild verfügbar.
Wenn noch kein fertiges Bild vorliegt, greift der normale Web-Fallback.
Beim Öffnen eines Overlays während der Debounce-Verzögerung wird nicht auf eine neue Aufnahme gewartet.
Eine längere Verzögerung verlängert daher auch den Zeitraum, in dem nach einer Aktualisierung noch das vorherige Erscheinungsbild verwendet werden kann.

Für **Liquid Glass-Auswahlanimationen von UITabBar werden 600 ms als Ausgangswert empfohlen**.
Bei Vergleichen im iPhone-Simulator unter iOS 27.0 und im Duo-Simulator unter iOS 27.1 erfassten 50 ms eine vergrößerte Auswahl, bei 300 ms blieb noch eine kleine Restveränderung, und 600 ms entsprachen dem bei 1000 ms beobachteten stabilen Erscheinungsbild.
Dies ist eine Empfehlung für diese Interaktion, keine Zeitgarantie von Apple und keine allgemeingültige Dauer für Liquid Glass.
Messen Sie die Auswahl, die erneute Auswahl und aufeinanderfolgende Aktualisierungen Ihres Steuerelements, bevor Sie einen Wert festlegen.
Bei sich ständig ändernden Inhalten ist kein Snapshot eines stabilen Zustands garantiert.

## Farbpräzision von Bildern unter iOS

Vorbereitete Fenstermomentaufnahmen verwenden bei der Aufnahme eine Bitmap im erweiterten Display P3 mit Float16 und werden in einer Hintergrundwarteschlange als 16-Bit-PNGs im Farbraum Display P3 kodiert. Die Web-Projektion zeigt das vorbereitete Bild direkt an, ohne Konvertierung durch Canvas oder WebGPU. Native Kopien für Eintritt und Rückkehr verwenden ebenfalls das dekodierte PNG, sodass beide Seiten nach der Farbkonvertierung dieselben vorbereiteten Pixel nutzen. Kodierung und Dekodierung bleiben außerhalb der Overlay-Übergabe; Verbraucher benötigen weder eine neue Einstellung noch eine neue Abhängigkeit.

Dies reduziert Farbverluste bei Inhalten mit großem Farbumfang, garantiert aber keine identische Liquid Glass-Darstellung: Native Komposition und die Konvertierung in ganzzahlige PNG-Werte können Pixel weiterhin verändern. Höhere Präzision erhöht zudem den Speicherbedarf der Aufnahme und die Bildgröße. Schlägt die Vorbereitung fehl, gilt die bestehende Fallback-Richtlinie. Android behält seinen plattformeigenen Aufnahmepfad.

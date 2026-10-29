---
title: "Web-Projektion und Batches"
sourceRevision: "baa0ddcede13b0edcba2bd889f3f13d3f279f711197f63c5ef4d27b735842f0f"
---
# Untergeordnete Web-Projektion

Verwenden Sie die folgenden Grundbausteine nur, wenn die Oberflächenhelfer nicht zum bestehenden Zuständigkeitsmodell Ihres Renderers passen. `createWebProjectionSurface` verwaltet bereits Scopes und Batch-Übergaben; ein zusätzlich manuell angelegter Manager für denselben Fallback würde konkurrierende Zuständigkeiten erzeugen.

Beispielsweise besitzt ein Renderer bereits einen Fallback-Container je nativem Panel und akzeptiert native Aktualisierungen über sein eigenes Revisionsprotokoll. Ein Projektions-Scope erlaubt ihm, diese Zuständigkeitsentscheidungen beizubehalten und zugleich Bildvorbereitung und Rückkehrkoordination zu delegieren. Bevorzugen Sie die Oberflächenhelfer, wenn die Gruppierung nach Seiten oder Modals bereits passt; ein zweiter Manager auf demselben Container würde um dessen Bildpunkte konkurrieren.

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

Das Bild wird innerhalb des Fallbacks absolut positioniert; dieser behält seine Layoutbox. Statische Hosts werden positioniert, während das Bild sichtbar ist. Beschneidung, Transformationen und Filter von Host und Vorfahren gelten weiterhin. Die Einfügung in eine offene ShadowRoot umgeht interne Slot-Wrapper, nicht die eigene Beschneidung des Hosts. Geschlossene Shadow Roots können nicht untersucht werden; stellen Sie einen Fallback-Container bereit, der das Bild darstellen kann.

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

Der Manager verwendet intern die Ressourcen-URL-Konvertierung der Host-Laufzeit (Capacitor oder Cordova). Plugin-Autoren stellen keinen URL-Resolver bereit.

Dieser Abschnitt beschreibt den untergeordneten Manager für Renderer, die bereits den Batch-Abgleich übernehmen, nicht eine einzelne native Ansichtsregistrierung. Bevorzugen Sie bei einer neuen Integration die native Registrierung aus den Plugin-Leitfäden; sie übernimmt Start, Messungen und Zeichenbestätigungen.

### Mehrere Fallbacks in einer nativen Transaktion

Beispielsweise enthält eine Toolbar zwei Schaltflächengruppen mit getrennten Fallback-Hosts, aber der Renderer blendet sie in einer nativen Transaktion aus und stellt sie gemeinsam wieder her. Unabhängige Manager könnten eine Gruppe vor der anderen sichtbar machen. Ein Batch verwendet ein gemeinsames Übergabe-Token für die Gruppen, sodass sie die Darstellungsgrenze zusammen überschreiten können.

Verwenden Sie `createWebProjectionBatch(transport, options)`, wenn mehrere Fallback-Elemente gemeinsam wechseln müssen. Es nutzt dieselbe Bild-Engine, einen Listener und ein Aufnahme-/Cover-/Restore-Token. Übergeben Sie für jeden Eintrag `{ scope, element, control, ... }` an `batch.consider(revision, sources)`. Mehrere native IDs können einen Gültigkeitsbereich teilen, etwa eine Schaltflächengruppe.

Der Batch leitet sein Document aus dem ersten nicht leeren `consider` ab; alle folgenden Gültigkeitsbereiche und Quellen müssen zu diesem Document gehören. Vor dieser ersten Aktualisierung tut `begin()` nichts und `destroy()` ist sicher. Ein geänderter Fallback benötigt einen neuen Gültigkeitsbereich. Dessen Identität ist Teil der Cache-Invalidierung; eine aktive Darstellung behält ihre erfassten Gültigkeitsbereiche bis zum Abschluss der Wiederherstellung.

`WebProjectionRequest` ist eine durch die Aktion unterschiedene Union. `prepare` benötigt `revision`, `viewportWidth` und `ids`; `cover` benötigt `token` und enthält `viewportWidth` sowie Ziel-`parts` für vorübergehende Bewegung; `restore` benötigt `token`, `viewportWidth` und Ziel-`parts`; `painted`, `restored` und `release` benötigen `token`; `reset` erhält keine Payload. Leere Vorbereitungsergebnisse und `{ shown: false }` bedeuten, dass das Plugin seinen normalen Web-Fallback verwenden soll. Verwenden Sie die bestehende geordnete Bridge des Plugins; die Engine wiederholt keine Benutzeraktionen.

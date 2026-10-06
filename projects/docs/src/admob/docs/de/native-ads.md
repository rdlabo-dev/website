---
title: "Native Ads (Vorschau)"
sourceRevision: "ff974eb9b0368211c69399c59f5a8a634e9eb1750f98ced3d1cc8252543b5494"
---
# Native Ads (Vorschau)

**Native Ads ist eine Funktion in der Vorschauphase.** Sie können sie für Tests und im Produktivbetrieb verwenden. Während der Vorschauphase kann sich die API auch mit einer Nebenversion ändern.

Native Anzeigen werden mit Ansichten des Google Mobile Ads SDK dargestellt, die dieses Plugin verwaltet. Ihre App reserviert einen HTML-Platz und gibt einen stabilen Schlüssel an. Sie implementiert weder eine `NativeAdView` in Kotlin oder Swift noch stellt sie Anzeigeninhalte in JavaScript dar.

Native Ads ist unter iOS und Android verfügbar. Virtuelles Scrollen wird noch nicht unterstützt. Eine native Anzeige liegt über der WebView. Eine auf der Anzeige beginnende Wischbewegung erreicht daher möglicherweise nicht den Scrollcontainer der WebView. Die Implementierung aktualisiert die Overlay-Koordinaten beim Scrollen der WebView, kann damit aber das ursprüngliche Problem der Gestenweiterleitung nicht lösen.

Browser und PWAs werden nicht unterstützt. `NativeAdFeed.create()` wird abgewiesen, statt einen leeren Anzeigenplatz zurückzulassen.

## Einen Feed erstellen

Erstellen Sie nach der Initialisierung von AdMob und dem Einholen der Einwilligung einen Manager für jeden sichtbaren Feed-Bildschirm.

```ts
import { NativeAdFeed, NativeAdPluginEvents, NativeAdTemplate } from '@capacitor-community/admob';

const nativeAds = await NativeAdFeed.create({
  feedId: 'home-feed',
  template: NativeAdTemplate.Medium,
  isTesting: true,
  style: {
    backgroundColor: '#ffffff',
    cornerRadius: 12,
    headlineColor: '#111827',
    callToActionBackgroundColor: '#2563eb',
  },
});

const paidHandle = await nativeAds.addListener(NativeAdPluginEvents.AdPaid, (event) => {
  console.log(event.slotKey, event.valueMicros, event.currencyCode);
});
```

Verwenden Sie das frameworkunabhängige Element in normalem oder virtualisiertem Markup. `slot-key` muss den logischen Anzeigeneintrag identifizieren, nicht seinen Array-Index oder den wiederverwendeten DOM-Knoten.

```html
<capacitor-admob-native feed-id="home-feed" slot-key="sponsored-after-article-42"></capacitor-admob-native>
```

Das Element reserviert `320px` für `Medium` und `120px` für `Small`, sofern Ihr CSS keine Höhe vorgibt. Ein von Ihnen gesetztes `display: none` und ausdrückliche Höhenregeln werden berücksichtigt. Plätze für `Small` müssen mindestens `120×120px` groß sein, Plätze für `Medium` mindestens `144×300px`. Kleinere Plätze werden nicht geladen. Dies sind Untergrenzen, keine Garantie dafür, dass jedes Werbemittel und jede Schriftgröße hineinpasst. Unter Android bleibt `Medium` ausgeblendet, wenn der gemessene Medienbereich kleiner als `120×120dp` ist. Vergrößern Sie den Platz, um Text, die Schriftgrößeneinstellung des Geräts und Pixelrundungen zu berücksichtigen. Animieren Sie die Höhe des Platzes nicht und ermitteln Sie sie nicht dynamisch.

`Small` hat keinen Videobereich. Liefert das SDK eine Videoanzeige für diese Vorlage, schlägt das Laden mit `NativeAdPluginEvents.FailedToLoad` (Code `-1`) fehl. Die Anzeige wird weder dargestellt noch automatisch erneut geladen. Verwenden Sie `Medium` für Anzeigenblöcke, die Videoanzeigen ausliefern.

Wenn ein Framework keine benutzerdefinierten Elemente akzeptiert, binden Sie stattdessen ein gewöhnliches Element an:

```ts
nativeAds.attach('sponsored-after-article-42', element);

// Bevor das Element zerstört oder für einen anderen logischen Eintrag wiederverwendet wird:
nativeAds.detach(element);
```

Geben Sie den Manager zusammen mit seinem Bildschirm frei:

```ts
await paidHandle.remove();
await nativeAds.destroy();
```

## Experimente zur Integration mit virtuellem Scrollen

Der Lebenszyklus mit stabilen Schlüsseln ist für eine spätere Validierung mit Angular CDK virtual scroll, React Virtuoso und Vue Virtual Scroller ausgelegt. Diese Integrationen sind Beispiele für Experimente und stellen keine Zusage der Unterstützung dar:

- Hinterlegen Sie die logische Anzeigen-ID in `slot-key` (Angular-Bindung, React-Prop/-Ref oder Vue-`:slot-key`). Verwenden Sie niemals den Darstellungsindex.
- Halten Sie die Anzeigenzeile auf einer festen Höhe und beziehen Sie diese in die Berechnung der Elementgröße des virtuellen Scrollers ein.
- Wenn eine Bibliothek eine Zeile wiederverwendet, aktualisieren Sie den Schlüssel oder rufen Sie `detach` auf, bevor Sie `attach` mit dem neuen Schlüssel aufrufen. Das Plugin blendet die alte Generation aus, bevor es die neue lädt oder anzeigt.
- Verwenden Sie einen einzigen vertikalen Scrollcontainer als Wurzel. Verschachtelte Scrollcontainer, horizontale virtuelle Listen, haftende oder transformierte Vorfahren und animierte Zeilenhöhen gehören nicht zum anfänglich vorgesehenen Unterstützungsumfang.

Fügen Sie unter Angular `CUSTOM_ELEMENTS_SCHEMA` zur eigenständigen Komponente oder zum NgModule hinzu, das den Feed verwaltet. Binden Sie anschließend innerhalb der virtuellen Zeile Attribute statt Eigenschaften:

```html
<capacitor-admob-native feed-id="home-feed" [attr.slot-key]="item.stableAdKey"></capacitor-admob-native>
```

Unter React hält `createElement` benutzerdefinierte Attribute mit Bindestrichen typsicher, ohne dem Plugin eine Frameworkabhängigkeit hinzuzufügen:

```tsx
import { createElement } from 'react';

const NativeAdRow = ({ slotKey }: { slotKey: string }) =>
  createElement('capacitor-admob-native', {
    'feed-id': 'home-feed',
    'slot-key': slotKey,
  });
```

Markieren Sie unter Vue den Tag im Vue-Compiler als benutzerdefiniertes Element und binden Sie den stabilen Schlüssel:

```ts
// vite.config.ts
vue({
  template: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'capacitor-admob-native',
    },
  },
});
```

```html
<capacitor-admob-native feed-id="home-feed" :slot-key="item.stableAdKey" />
```

Verwenden Sie einen normalen HTML-Container mit `overflow: auto` oder Ionic `ion-content`. Android benötigt keine spezielle Scrolloption. Anzeigen folgen dem Platz und dessen Beschneidungsgrenzen, können beim schnellen Scrollen aber hinterherhinken. Neue Anzeigen werden geladen, sobald das Scrollen zur Ruhe kommt.

Ein Feed hält höchstens drei native Anzeigen vor, einschließlich angebundener Plätze außerhalb des sichtbaren Bereichs. Weitere sichtbare Plätze warten auf freie Kapazität. Höchstens zwei Feed-Manager dürfen gleichzeitig aktiv sein. Anzeigen werden nicht automatisch aktualisiert und fehlgeschlagene Ladevorgänge nicht unbemerkt wiederholt. Rufen Sie `reload(slotKey)` nur an einem ausdrücklich im Produkt vorgesehenen Punkt für einen erneuten Versuch oder eine Aktualisierung auf.

## Lebenszyklus von Layout und Overlays

Rufen Sie `invalidateLayout()` nach anwendungsgesteuerten Layoutänderungen auf, die einen Platz ohne Scrollen verschieben können, etwa nach dem Aufklappen eines Akkordeons. Größenänderungen des Platzes und in der Capture-Phase erfasste Ladeereignisse von Bildern werden automatisch erkannt.

Native Anzeigen liegen über dem Inhalt der WebView und können nicht erkennen, dass ein Ionic-Modal, Popover, Menü, Ladeindikator oder Routenübergang den Platz verdeckt. Blenden Sie den Feed vor dem Anzeigen eines Overlays aus und setzen Sie ihn nach dessen Schließen fort:

```ts
await nativeAds.pause();
await modal.present();
await modal.onDidDismiss();
nativeAds.resume();
```

Rufen Sie beim Verlassen eines Bildschirms `destroy()` auf. Warten Sie vor dem Anzeigen eines Overlays auf `pause()`. Der Aufruf wird abgewiesen, wenn die native Aktualisierung zum Ausblenden fehlschlägt. `resume()` wartet, bis sich der sichtbare Bereich stabilisiert hat, bevor zulässige Platzierungen wieder angezeigt werden. Auch `invalidateLayout()` wird erst aufgelöst, nachdem die veraltete Platzierung ausgeblendet wurde.

## API

| Mitglied | Zweck |
| --- | --- |
| `NativeAdFeed.create(options)` | Startet eine native Feed-Sitzung. Wird außerhalb von iOS und Android abgewiesen. |
| `feedId` | Normalisierte Feed-Kennung, die das benutzerdefinierte Element verwendet. |
| `addListener(event, listener)` | Fügt einen auf diese Feed-Sitzung gefilterten Listener hinzu. |
| `attach(slotKey, element)` / `detach(element)` | Erweiterte Lebenszyklussteuerung für ein gewöhnliches Element. |
| `reload(slotKey)` | Entfernt einen registrierten Platz ausdrücklich und lädt ihn erneut. |
| `pause(): Promise<void>` / `resume(): void` | Blendet Platzierungen während Web-Overlays oder inaktiver Seitenzustände aus. |
| `invalidateLayout(): Promise<void>` | Blendet nach einem anwendungsgesteuerten Reflow aus und misst erneut. |
| `destroy()` | Entfernt Listener und alle nativen Ressourcen der Sitzung. |

`NativeAdFeedOptions` enthält `feedId`, `adId`, `template`, `style`, `isTesting`, `npa` und das optionale iOS-`scrollElement`. Setzen Sie `isTesting: true`, um den plattformspezifischen Testanzeigenblock von Google zu verwenden. Geben Sie für produktive Anzeigen die plattformspezifische ID Ihres nativen Anzeigenblocks in `adId` an und lassen Sie `isTesting` weg oder setzen Sie es auf `false`. `adId` ist erforderlich, sofern `isTesting` nicht `true` ist. `feedId` und jeder `slotKey` müssen nicht leer und stabil sein. Verwenden Sie nach dem Neuladen der WebView dieselben Feed-IDs, damit veraltete native Sitzungen sicher ersetzt werden können.

## Darstellung und Richtlinien

Das Plugin verwaltet die Vorlagen `Small` und `Medium`, die Anzeigenkennzeichnung, AdChoices, Medien und die Registrierung anklickbarer Anzeigeninhalte. Die öffentliche Style-API stellt bewusst eine begrenzte Auswahl plattformübergreifender Gestaltungswerte bereit, statt beliebige native Layouts oder die Darstellung von Anzeigeninhalten in HTML zu erlauben. Dadurch bleiben Impressionserfassung und Klickverarbeitung des Google SDK im nativen SDK.

Farben verwenden auf beiden Plattformen CSS-artige Werte im Format `#RRGGBB` oder `#RRGGBBAA`. Abmessungen verwenden logische Pixel; Schriftgrößen verwenden Punkte unter iOS und `sp` unter Android. Ungültige Farben fallen auf die Standardwerte der Vorlage zurück. Negative Abmessungen werden auf null begrenzt. Schriftgrößen für Überschrift, Text und Handlungsaufforderung werden jeweils auf `12–24`, `10–18` und `12–18` begrenzt.

Befolgen Sie Googles Richtlinien und Implementierungsanleitungen für native Anzeigen unter [Android](https://developers.google.com/admob/android/native/advanced) und [iOS](https://developers.google.com/admob/ios/native/advanced).

## iOS-Scrollcontainer

Übergeben Sie für einen einzelnen Ionic-Scrollcontainer beim Erstellen des Feeds dessen tatsächliches Scrollelement:

```ts
const feed = await NativeAdFeed.create({
  feedId: 'articles',
  isTesting: true,
  scrollElement: await ionContent.getScrollElement(),
});
```

Unter iOS aktiviert `scrollElement` die experimentelle native Scrollverfolgung für diesen Container. Layoutänderungen erfordern weiterhin eine erneute Messung. Rufen Sie nach anwendungsgesteuerten Änderungen `invalidateLayout()` auf. Die Beschneidung innerhalb des Scrollcontainers und an seinen sichtbaren Grenzen bleibt erhalten. `pause()` und `destroy()` stoppen die Verfolgung. Andere Plattformen ignorieren diese Option und aktualisieren die Koordinaten weiterhin mit JavaScript.

Lässt sich der angegebene Container nicht eindeutig identifizieren, schlägt die Aktualisierung fehl und seine Anzeigen bleiben ausgeblendet. Verwenden Sie einen einzelnen Overflow-Scrollcontainer ohne Transformation oder Zoom. Verschachteltes Scrollen, Dokument-Scrollen über diese Option und Integrationen mit virtuellem Scrollen werden nicht unterstützt. Die Weiterleitung von Wischgesten, die auf einer Anzeige beginnen, ändert sich dadurch nicht.

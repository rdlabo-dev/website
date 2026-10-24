---
title: "Native UI ohne Ionic"
sourceRevision: 246f4a60f976d78a9ae9f2c649dd2b2ed103d69a691ff24f86e9777ae0375a40
---
# Native UI ohne Ionic

Fügen Sie einer bestehenden Web-App native Schaltflächen ohne Ionic oder Theme-CSS hinzu. Belassen Sie Beschriftungen, Zustand und Klickhandler auf gewöhnlichen HTML-Elementen. Standardschaltflächen erfordern keine eigene Swift-Registrierung.

Verwenden Sie eine Capacitor-8-App mit iOS-Projekt, Xcode 26+ und einem iOS-26+-Gerät oder Simulator. Browser und Android behalten Web-Bedienelemente. Für eigene native Android-Inhalte verwenden Sie [Kotlin-/Compose-Erweiterungen](native-ui-extensions.md#2b-register-compose-content-on-android).

Beginnen Sie mit der [Funktionsweise der Projektion](../README.md#how-projection-works): Das HTML-Element bleibt die Quelle, während native Bedienelemente oder Web-Proxys seine Darstellung übernehmen.

**Sie möchten nur Vertical Bars?** Folgen Sie zusätzlich zu den Schritten 1–4 der [Gerätepositionierung](#device-placement-for-vertical-bars). Verwenden Sie die Laufzeit aus Schritt 3 ohne feste Positionspräferenz. Entfernen Sie explizite Markierungen von Schaltflächen, die im Web bleiben sollen. Sie benötigen weder Ionic noch `@rdlabo/ionic-theme-ios27` oder `vertical-bars.css`.

Für Vertical Bars in einer App mit `ion-tabs`, `ion-toolbar` oder anderen Ionic-Komponenten und eigenem Theme verwenden Sie stattdessen die [Ionic-Einrichtung für Vertical Bars](ionic-vertical-bars.md#try-it-in-your-existing-ionic-app). Das Framework allein (Angular, React oder Vue) bestimmt nicht den passenden Adapter.

## 1. Plugin installieren

[Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) ist unsere Standardintegration für den Gerätezustand. Seine Positions- und Faltstellungs-APIs lassen Ihre App Layoutanpassungen steuern; nach der Installation müssen Anfangswerte und Änderungsereignisse verbunden werden.

Behalten Sie Ihre bestehende Capacitor-Installation und ergänzen Sie Native UI sowie Foldable gemeinsam:

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Der Einstiegspunkt `/core` benötigt `@capacitor/core`, aber keine Ionic-Abhängigkeiten. Falls dies derzeit eine reine Browseranwendung ist, konfigurieren Sie vor der Nutzung nativer Bedienelemente ihr Capacitor-8-iOS-Projekt.

## 2. Quellelemente markieren

```html
<main id="app">
  <button type="button" data-native-ui="button" data-native-ui-placement="element">Add</button>
  <button type="button" data-native-ui="back-button" data-native-ui-placement="rail">Back</button>
</main>
<aside id="rail" aria-label="Navigation"></aside>
```

| Attribut | Wert | Wirkung |
| --- | --- | --- |
| `data-native-ui` | `button` | Eine Standardaktionsschaltfläche projizieren. |
| `data-native-ui` | `back-button` | Eine Standard-Zurückschaltfläche projizieren. Der Quell-Klickhandler übernimmt die Navigation; das Plugin ruft niemals `history.back()` auf. |
| `data-native-ui` | `disabled` | Das Element und seinen Teilbaum von der Projektion ausschließen. |
| `data-native-ui-placement` | `element` (Standard) | Das Rechteck des Quellelements verwenden. |
| `data-native-ui-placement` | `rail` | Vertical Bars anfordern; den optionalen Web-Seitenleistenhost verwenden, wenn keine native Darstellung verfügbar ist. |

Wenden Sie `button` und `back-button` auf `<button>`, explizit markierte `ion-button` oder Elemente mit `role="button"` und Klickverhalten an. Unmarkiertes HTML wird niemals als Bedienelement interpretiert. `data-native-ui-placement` wählt die Position einer deklarierten Quelle; es aktiviert keine Projektion für ein unmarkiertes HTML-Element.

Belassen Sie Daten und Verhalten des Bedienelements an seiner Quelle:

| Quelleigenschaft | Projektionsverhalten |
| --- | --- |
| Zugänglicher Name | Wird aus `aria-labelledby`, dann `aria-label`, dann Text aufgelöst. |
| Grafik | Verwendet unterstütztes statisches SVG. |
| Deaktivierungszustand | Berücksichtigt natives `disabled`, ein deaktiviertes Fieldset und `aria-disabled="true"`. |
| Sichtbarkeit und Geltungsbereich | Versteckte, entfernte, ausgeschlossene oder außerhalb liegende Quellen werden aufgelöst; veraltete Aktionen werden abgewiesen. |
| Anwendungshandler | Bleiben am Originalelement. |

Native Aktionen und Web-Proxy-Aktionen klicken auf das Originalelement. Ein gewöhnliches `<button type="submit">` behält daher sein Formularverhalten. Verwenden Sie für Aktionen ohne Formularübermittlung `type="button"`. Die native Bridge erhält Browserrechte durch Benutzeraktivierung, etwa zum Öffnen von Popups, nicht.

## 3. Nach dem Einbinden der Bedienelemente starten

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui/core';

const shell = await enableNativeUI({
  root: document.querySelector<HTMLElement>('#app')!,
});
```

Rufen Sie die Funktion einmal auf, sobald der Quellstamm existiert. Behalten Sie das Handle und rufen Sie beim Auflösen dieses Stamms `await shell.destroy()` auf. Das Plugin ergänzt weder Seitenabstände noch Safe-Area-Regeln; behalten Sie Ihr Anwendungs-CSS. Für Angular, React oder Vue verwenden Sie die [App-Root-Lebenszyklusbeispiele](setup.md#place-startup-in-your-frameworks-app-root) mit dem `/core`-Import. Für animierte Navigation verwenden Sie [Aussetzung bis Abschluss und Abbruch](setup.md#navigation-without-the-theme).

### An das HTML-Theme anpassen

Deklarieren Sie für ein eigenes HTML-Theme `color-scheme: light` oder `color-scheme: dark` im selben CSS, das Ihre Web-Palette auswählt. Hintergrundfarben allein wählen keine native Darstellung. [Helle und dunkle Darstellung](appearance.md) zeigt einen manuellen Umschalter, die Priorität vorhandener Ionic-/Theme-Variablen und das gemeinsame Seitenleistenverhalten.

## 4. Erstellen und unter iOS ausführen

Erstellen Sie Ihre Web-App, führen Sie `npx cap sync ios` aus und starten Sie das iOS-Projekt in Xcode. Mit der Konfiguration aus Schritt 3 erscheint Add an seiner Quellposition und ruft seinen ursprünglichen Klickhandler auf. Back fordert die vom Gerät gemeldete native Seitenleiste an, sofern verfügbar; verbinden Sie die folgende Gerätepositionierung, um Web-Abstände synchron zu halten. Im Browser bleibt dieselbe Schaltfläche eine gewöhnliche Web-Schaltfläche. Unmarkiertes HTML bleibt unverändert.

Bleibt eine Schaltfläche unter unterstütztem iOS im Web, prüfen Sie ihre Sichtbarkeit innerhalb des konfigurierten Stamms, ihren zugänglichen Namen sowie Synchronisierung der direkten Plugin-Abhängigkeit und erneuten iOS-Build.

Setzen Sie in einer App, die auch Ionic verwendet, `ionic: { auto: false }`, um nur explizite Quellen und registrierte Erweiterungen zu projizieren. Siehe [selektive Ionic-Projektion](configuration.md#select-controls-explicitly-in-a-customized-ionic-app).

## Gerätepositionierung für Vertical Bars

Foldable ist bereits in der Standardinstallation aus Schritt 1 enthalten. Verbinden Sie es wie folgt mit Ihrem Anwendungslayout.

Verwenden Sie die Laufzeit aus Schritt 3 **ohne `verticalBars.placement`**. Native UI folgt dann der vom Gerät gemeldeten Kante; ein festes `edge: 'trailing'` würde sie einschränken und kann die führende Seitenleiste eines Geräts ablehnen.

Folgen Sie der [Foldable-Integration](vertical-bars.md#with-application-owned-css-or-without-ionic):

1. Abonnieren Sie `barPlacementChange` und lesen Sie anschließend mit `getBarPlacement()` die anfängliche Kante und den Abstand.
2. Wenden Sie Kante und Abstand auf das Anwendungs-CSS an. Bei null als Kante stellen Sie gewöhnliche Abstände wieder her und rufen `shell.disableVerticalControlArea()` auf; sobald eine Kante zurückkehrt, rufen Sie `shell.enableVerticalControlArea()` auf. Serialisieren Sie diese Änderungen zusammen mit Layoutaktualisierungen.
3. Entfernen Sie bei der Bereinigung den Listener und zerstören Sie die von dieser Anwendung verwaltete Laufzeit.

Behalten Sie die expliziten Quellmarkierungen aus Schritt 2; sie deklarieren Bedienelemente und ihre gewünschte Position. Entfernen Sie `data-native-ui="button"` von Add, um nur Back zu projizieren. `controls` deaktiviert keine expliziten Deklarationen. Ohne Web-Seitenleistenhost bleiben nicht verfügbare native Seitenleisten-Bedienelemente an ihren ursprünglichen Web-Positionen. Das Theme-Paket ist nicht erforderlich.

## Optionale Seitenleistenvorschau im Browser

Verwenden Sie für eine reine Browser-Layoutvorschau vorübergehend diese feste Web-Seitenleiste statt des Startaufrufs aus Schritt 3 und des Geräteabonnements. Übernehmen Sie die feste Position nicht in die Standardgeräteeinrichtung. Rufen Sie sie einmal nach dem Einbinden von Quellstamm und Host auf und bei deren Bereinigung `await shell.destroy()`:

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui/core';

const shell = await enableNativeUI({
  root: document.querySelector<HTMLElement>('#app')!,
  verticalBars: {
    placement: {
      edge: 'trailing',
      webHost: document.querySelector<HTMLElement>('#rail')!,
    },
  },
});
```

Das Plugin verwendet die vom Gerät gemeldete Seitenleistenverfügbarkeit und löst leading/trailing anhand der Dokumentrichtung auf. Eine Positionspräferenz erzwingt niemals eine nicht unterstützte Systemleiste. Native Ablehnung stellt die Web-Darstellung wieder her. Mit `webHost` erhalten ausdrücklich für die Seitenleiste markierte HTML-Bedienelemente Web-Proxys, wenn keine native Projektion verfügbar ist. Ohne ihn bleiben ihre Originale sichtbar. Die Anwendung gestaltet und positioniert den Host und reserviert Inhaltsabstände. Der Host muss außerhalb des Quellstamms liegen.

Explizites Markup wählt die Position: Back erscheint in der Vorschau-Seitenleiste, Add bleibt an seiner ursprünglichen Position. Das Deaktivieren der Seitenleistenprojektion stellt die Originalbedienelemente wieder her und entfernt Web-Proxys, ohne gewöhnliche native Projektion zu zerstören. Stellen Sie vor einem Geräte-Build die Laufzeit aus Schritt 3 und das obige Foldable-Abonnement wieder her.

Der HTML-Adapter unterstützt derzeit Schaltflächen und Zurückschaltflächen. Beliebige HTML-Tabs, Segmente, Suchleisten und FAB-Strukturen werden nicht übersetzt. Ionic-Adapter unterstützen weiterhin ihre bestehenden Bedienelemente. Eigene Elementerweiterungen funktionieren im selben begrenzten Stamm; die bestehende Erweiterungsposition `tab-accessory` benötigt weiterhin eine zuständige Ionic-Tab-Leiste.

## Beispiel

Das [reine HTML-Beispiel](https://github.com/rdlabo-dev/ionic-theme-ios27/tree/ios27-v2.0.3/examples/native-ui-html) zeigt Add, routerlose Home-/Details-/Back-Navigation, optionale Web-Seitenleistenprojektion und Bereinigung. Es verwendet weder Ionic noch Theme-CSS.
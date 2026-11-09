---
title: "Android Settings-Darstellung"
sourceRevision: "b01855a5b6b64a8aaeea578be975259eb9d608321bb81f66c7f583b8ef33a3a0"
---

# Android Settings-Darstellung

Das Theme verwendet Android Settings als visuelle Referenz und behält Ionics Komponenten-APIs, benannte Farben und Anwendungsstile bei. Es ersetzt Ionic-Komponenten nicht durch Android-Widgets. Die gemessene Referenz ist Pixel Settings unter Android 17; andere Android-Hersteller können andere Designs verwenden.

## Theme-Standards und Anwendungsanpassungen

| Funktion | Theme-Standard | Anwendungsanpassung |
| --- | --- | --- |
| Toolbar, gruppierte Listen und Steuerelemente | An Android angepasste Abmessungen | Ionic-CSS-Variablen und Anwendungs-CSS |
| Toggle-Schieber | Kein Zustandssymbol | Ionics `enableOnOffLabels` oder der folgende Symbolhelfer |
| Schrift | Lokales Google Sans Flex, dann Roboto / Helvetica Neue / sans-serif | Ionics `--ion-font-family` |
| Zurück-Pfeil | In Ionic konfiguriertes Symbol | Ionics eigene Symbolkonfiguration; kein Theme-Symbol enthalten |
| Palette | Bestehende Ionic-Farbabsicht | Gerätefarben sind eine separate Funktion für [dynamische Farben](dynamic-colors.md) |

## Standardschrift nur mit CSS

Importieren Sie das Haupttheme **nach Ionics Core-Stilen**, wie im [README](../README.md#installation) beschrieben. Die MD-Typografie ist automatisch enthalten; zusätzliche Stylesheets, JavaScript-Initialisierung, Klassen oder Aufräumarbeiten sind nicht erforderlich.

Das Theme setzt `--ion-default-font` auf `html.md`. Ionics `--ion-font-family` löst weiterhin diesen Standard auf, sofern die Anwendung keinen eigenen Wert angibt:

```css
:root {
  --ion-font-family: 'My App Font', sans-serif;
}
```

Das Theme überschreibt `--ion-font-family` nicht. Für komponentenspezifische Schriften verwenden Sie normales `font-family`-Styling; eine lokale benutzerdefinierte Eigenschaft betrifft nur Komponenten, die sie verwenden. Die iOS-Root-Standardschrift bleibt unverändert. Einzelne `md3-disabled`-Komponenten erben wie andere Ionic-Komponenten die Anwendungsschrift; die Klasse setzt die anwendungsweite Typografie nicht zurück.

Der lokale Schriftalias löst `GoogleSansFlex-Regular` nur auf, wenn Gerät oder Browser die Schrift bereitstellen. Schriftdateien werden weder gebündelt noch heruntergeladen. Andernfalls verwendet der Browser Roboto, Helvetica Neue oder seine generische Sans-Serif-Schrift. Nicht abgedeckte Schriftsysteme nutzen den üblichen Browser-/Plattform-Fallback; keine japanische Schrift wird erzwungen. Dasselbe CSS läuft in nativen WebViews und der Browser-Demo.

Das Theme überwacht weder DPR noch rundet es Text auf physische Pixel, überschreibt Schriftmetriken oder erzwingt Achsen variabler Schriften. Das Textlayout folgt daher Schrift, Browser und Benutzereinstellungen. Nativer Android-TextView- und WebView-Text können abweichen; übereinstimmende Glyphengrenzen auf einem bestimmten Pixel garantieren keine Portabilität.

## Zurück-Buttons bleiben Ionic-Komponenten

Das Theme enthält oder ersetzt das Zurück-Pfeilsymbol nicht. Ionic verwaltet Standardsymbol, `backButtonIcon`-Konfiguration, die `icon`-Eigenschaft je Button, Navigation und Barrierefreiheit. Anwendungen können diese vorhandenen Ionic-APIs direkt nutzen.

Das Theme gestaltet Button-Abstände, ein 56px großes Berührungsziel und eine 40px große kreisförmige Zeichenfläche. Der Kreis bleibt ohne optionale Farbrolle transparent; siehe [Farbsystem](color-system.md). Native Settings- und Ionic-Glyphen können abweichen; die Übereinstimmung mit dem nativen Pfeil ist keine Theme-Anforderung.

## Fokusdarstellung von Alerts

Das MD-Theme unterdrückt den Browserumriss um die Dialogfläche selbst. Ionic verschiebt beim Öffnen weiterhin den Fokus in den Alert und verwaltet Tab-Navigation, Fokusbegrenzung und Schließen. Aktionsbuttons behalten ihre Tastatur-Fokusindikatoren. `md3-disabled`- und iOS-Modus-Alerts behalten Ionics Standarddarstellung.

## Toggle-Beschriftungen und optionale Zustandssymbole

Die Standardspur misst 52×28px mit einem 20px-Schieber ohne Kreuz-/Häkchensymbole. Nutzen Sie für Ionics eigene Ein-/Aus-Beschriftungen die öffentliche Eigenschaft:

```html
<ion-toggle enable-on-off-labels="true">Notifications</ion-toggle>
```

Framework-Bindings verwenden die entsprechende Eigenschaft `enableOnOffLabels`. Größenanpassungen der Anwendung nutzen weiterhin Ionic-CSS-Variablen:

```css
ion-toggle.app-toggle {
  --handle-width: 18px;
  --handle-height: 18px;
}
```

Kreuz-/Häkchensymbole sind eine separate Variante für Anwendungen, die sie ausdrücklich benötigen:

```ts
import { applyToggleStateIcons } from '@rdlabo/ionic-theme-md3/toggle-state-icons';

const toggle = document.querySelector<HTMLElement>('ion-toggle')!;
const removeIcons = await applyToggleStateIcons(toggle);
// Beim Aufräumen:
removeIcons();
```

Rufen Sie den Helfer nach Erstellung und Verbindung des Toggles auf. Er wartet auf die Registrierung des Custom Elements und auf `componentOnReady()`, sofern verfügbar. Warten Sie in Builds ohne diese Methode zuerst auf das Shadow-DOM-Rendering. Wird die Ansicht während der Einrichtung zerstört, rufen Sie die zurückgegebene Bereinigung sofort auf.

Der Helfer fügt ein Style-Element in das Shadow DOM des öffentlichen handle-Parts ein. Er fängt keine Komponenteneigenschaften ab und beobachtet das Dokument nicht. Ionics eigene Beschriftungen haben bei aktivem `enableOnOffLabels` Vorrang, auch nach späteren Eigenschaftsänderungen. `md3-disabled` und der iOS-Modus unterdrücken diese Symbolerweiterung. Die Demo bindet den Helfer nicht automatisch an.

## Aktualisierung und Überprüfung

Lesen Sie zu Abmessungsänderungen die [Migrationshinweise](migration.md#migrating-to-9.2.0%3A-android-settings-alignment) und zu Größen das [Markup gruppierter Listen](using-ion-item-group.md). Explizites Ionic-`color`, deaktivierter Zustand, Interaktion und lokale Anpassungen behalten ihre Bedeutung. Der [Messbericht](https://github.com/webview-native-ui/ionic-theme-md3/blob/v9.2.0/docs/validation/android17-pixel-pass1-2026-11-09.md) trennt physische Gerätenachweise von Browser-Regressionstests; er behauptet weder vollständige Rastergleichheit noch native Tablet-Abnahme.

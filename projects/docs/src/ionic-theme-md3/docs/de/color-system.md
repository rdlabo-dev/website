---
title: "Farbsystem"
sourceRevision: "95393078f806a13505d7d20cae6753b00b7e6538e69cc591c91a7a4f1215553a"
---

# Farbsystem

Das Theme funktioniert allein mit Ionics Standardfarbpalette. JavaScript, ein Capacitor-Plugin oder ein vollständiges Material-Farbschema sind nicht erforderlich. Zusätzliche Material-Farbrollen verfeinern optional dasselbe Komponentendesign.

## Standardwerte nur mit Ionic

Importieren Sie die üblichen Ionic-Stile und dieses Theme. Definieren Sie wie gewohnt Ionics benannte Farben einschließlich Kontrast, Hintergrund- und Textfarben. Helle und dunkle Paletten verwenden dieselben Regeln; es gibt keine separate fest codierte MD3-Palette.

Gewöhnliche Komponenten behalten Ionics bestehende Farbabsicht bei. Inhalt und Menü nutzen `--ion-background-color`; Toolbar, Karte, Eintrag und Tab-Leiste behalten ihre eigenen Ionic-Hintergrund-/Textvariablen und üblichen Fallback-Ketten. Für normale Karten, Seiten, Listen oder Overlays wird keine neutrale Oberflächentönung erzeugt. Explizite `color`-Attribute und Komponenten-Anpassungen mit `--background` / `--color` bleiben verfügbar. Optionale Material-Rollen verfeinern ausdrücklich die zugrunde liegende Ionic-Palette. Komponenten-Anpassungen mit `--background` / `--color` bleiben die abschließende Steuerung durch die Anwendung.

Eine optionale Material-Rolle verfeinert nur ihre Verbraucher. Nicht angegebene Rollen fallen auf die Ionic-Farben der Komponente zurück; eine Rolle aktiviert keine vollständige generierte Neutralpalette. Heller und dunkler Modus verwenden denselben Mechanismus.

Explizite Varianten (`.md3-tonal`, `.md3-elevated`, `.md3-filled`, `.md3-outlined`, `.md3-selected`) fordern zusätzliche Farbbehandlungen bewusst an. Fehlende Container-/Umrissfarben können durch CSS-Farbmischung aus der Ionic-Palette abgeleitet werden. Dies betrifft diese angeforderten Varianten und verändert nicht jede ungefärbte Komponente. Akzent-Steuerelemente behalten Ionic-primary/contrast bei, wenn optionale Material-Akzent-/Containerpaare fehlen.

## Optionale Rollen

Überschreiben Sie nur die benötigten Rollen auf der Wurzel oder einem lokalen Container:

```css
.my-section {
  --md-sys-color-secondary-container: #d8e2ff;
  --md-sys-color-on-secondary-container: #001a41;
}

.ion-palette-dark .my-section {
  --md-sys-color-secondary-container: #243e68;
  --md-sys-color-on-secondary-container: #d8e2ff;
}
```

Geben Sie beim Ändern eines Vordergrund-/Hintergrundrollenpaars beide gemeinsam an. Ausgelassene Rollen folgen weiterhin Ionic. Eine separate Registrierung oder ein vollständiges Schema ist nicht nötig.

Material You ist ein optionaler Anbieter dieser Werte. [Dynamische Farben](dynamic-colors.md) beschreibt nativen Bezug und Darstellungssteuerung. Der Anbieter bewahrt Materials `on*`-Rollen für MD3-Komponenten; Ionics benannte Farben verwenden angegebene `onPrimary`, `onSecondary`, `onTertiary` und `onError` als Kontrastwerte, mit Ionics Kontrastberechnung als Fallback je Rolle. Shade und tint behalten Ionics Berechnungen bei. Die native API stellt zudem optionale fixed/inverse-Rollen für eigene Komponentendesigns bereit.

Importieren Sie für eigene Sass-Komponenten `utils/colors` aus dem exportierten Paketpfad `src/styles` und verwenden Sie `color(secondary-container)` im Namensraum des Moduls. Die Funktion erzeugt eine optionale Rolle samt gleichem Ionic-Fallback. Sie unterstützt Rollen aus `utils/_colors.scss`; unbekannte Rollen lassen den Sass-Build scheitern. Generierte Container-Fallbacks sind für ausdrücklich angeforderte Varianten gedacht; normale Komponenten behalten ihre Ionic-Fallback-Ketten. Nutzen Sie für reine CSS-Komponenten dasselbe Muster `var(--md-sys-color-..., ...)` mit Ionic-Fallback.

## Komponentenzuordnungen

Bei normalen Flächen bedeutet **Base** `surface-container-lowest` im hellen und `surface-container-low` im dunklen Modus. **Panel** bedeutet `surface-container-lowest` im hellen und `surface-container-high` im dunklen Modus. Fehlende Rollen behalten den Ionic-Hintergrundfallback der Komponente bei. Dadurch bleiben helle Standardflächen weiß; `color="light"` ist eine separate Palettenauswahl (`surface-container-low` in hell, `surface-container-highest` in dunkel), kein Alias für jeden Standardhintergrund.

Die Tabelle zeigt Verbraucher optionaler Material-Rollen. Fehlt eine Rolle, behält die Komponente den oben beschriebenen Ionic-Fallback bei.

| Komponente / Variante | Hintergrund | Vordergrund / Detail |
| --- | --- | --- |
| gefüllter Button | primary | on-primary |
| tonaler Button (`md3-tonal`, solide Füllung) | secondary-container | on-secondary-container |
| erhöhter Button (`md3-elevated`, solide Füllung) | surface-container-low | primary |
| umrandeter / Text-Button | transparent | primary; outline-Rand bei umrandeten Buttons |
| Karte (standardmäßig erhöht) | Panel | on-surface; Untertitel on-surface-variant |
| gefüllte Karte (`md3-filled`) | surface-container-highest | on-surface |
| umrandete Karte (`md3-outlined`) | surface | on-surface; outline-variant-Rand |
| FAB | primary-container | on-primary-container |
| Chip / ausgewählter Chip (`md3-selected`) | surface-container-low / secondary-container | on-surface-variant / on-secondary-container |
| Inhalt / Menü | Base | on-surface |
| Toolbar | Panel | on-surface |
| Liste / normaler Listeneintrag | Panel | on-surface |
| eingerückter Listeneintrag | Panel; surface vor Ionic-Fallback, wenn die panel-Rolle fehlt | on-surface; transparenter 2px-Abstand |
| Navigationsleiste | Panel | on-surface-variant; Auswahlindikator secondary-container / ausgewähltes Symbol on-secondary-container |
| Segment | geerbte Fläche | ausgewählt primary; nicht ausgewählt on-surface-variant |
| Suchfeld | surface-container-high; surface-container-highest in einer ungefärbten dunklen Toolbar/einem Eintrag | on-surface; Symbol on-surface-variant; Ionic-Platzhalterverhalten |
| Schalter, Checkbox, Radio, Fortschritt, Schieberegler | neutrale Fläche oder secondary-container bei aus/inaktiv; primary bei Auswahl | passendes on-primary, outline oder on-surface-variant |
| Texteingabe | Hintergrund des Ionic-Füllzustands | on-surface; Fokus primary; ungültiger Zustand error |
| Modal / Popover | Base | Ionic-Text; verschachtelte Komponenten lösen eigene Rollen auf; Select-Popover-Optionen teilen den Overlay-Hintergrund |
| Action Sheet | Base | Aktionen on-surface; Empfehlung primary; destruktiv error; Titel on-surface-variant |
| Alert | Base | on-surface; Empfehlung primary/on-primary; destruktiv error/on-error; Abbrechen umrandet |
| Laden / Datum-Zeit / Picker | surface-container-high | on-surface; Aktionen/Spinner primary |
| Snackbar/Toast | inverse-surface | inverse-on-surface; Aktionen inverse-primary |

Ionics vorhandenes `color="..."` bleibt eine explizite Palettenauswahl; diese MD3-Standards ersetzen es nicht. `md3-disabled` nimmt einzelne Komponenten vom MD3-Styling aus. Bestehende CSS-Variablen je Komponente können die gewählte Rolle weiterhin über die normale Kaskade überschreiben. Variantenklassen ändern nur das Aussehen; `md3-selected` implementiert weder Auswahlverhalten noch Barrierefreiheitszustand.

```html
<ion-button class="md3-tonal" fill="solid">Tonal action</ion-button>
<ion-card class="md3-filled">Filled card</ion-card>
<ion-button color="danger">Explicit Ionic danger palette</ion-button>
```

Die Demo-Seite Color palette vergleicht das reine Ionic-Ergebnis mit lokal ergänzten Rollen. Browsertests prüfen beide Darstellungen, lokale Ionic-Änderungen, das Entfernen optionaler Rollen, explizite Farben, Ausnahmen und ein Dokument mit deaktiviertem Anwendungs-JavaScript.

Android 17 Settings ist die visuelle Referenz; Material-Richtlinien liefern ergänzende Informationen. Die obigen base/panel-Rollen verfeinern normale Flächen, ohne Ionics Farbabsicht zu ersetzen. Ohne diese Rollen bleiben Ionic-Hintergründe unverändert. Gruppen behalten 20px-Außenecken und 2px-Abstände. Die Zuordnungen benennen optionale Rollen; sie implizieren keine generierten Oberflächenfarben für ausgelassene Rollen.

Reine Symbol-Zurück-Buttons in der Toolbar behalten ein 56px-Berührungsziel und die Geometrie eines 40px-Kreises. Dieser bleibt standardmäßig transparent; `--md-sys-color-surface-container-highest` färbt ihn. Eine explizit gefärbte Toolbar behält einen transparenten Zurück-Button-Hintergrund und Ionics Kontrastvordergrund. Setzen Sie zur Farbanpassung `--md3-back-background` auf dem Zurück-Button. Symbolfreie Schalter nutzen eine 52×28px-Spur und einen 20px-Schieber, gemessen am Internet-Panel des Pixel unter Android 17. Reine CSS-Installation behält Ionics normalen Schieber und seine `enableOnOffLabels`-API bei. Standard-Toggle und Demo nutzen symbolfreie Schieber. Komponenten-`md3-disabled` und explizite Ionic-Farben bleiben verfügbar.

Typografie, Ionics Zuständigkeiten für Zurück-Buttons und Schalter-Zustandssymbole beschreibt [Android Settings-Darstellung](android-settings.md). Sie ändern die Palette nicht und benötigen keine Gerätefarben.

Farben und Geometrie des Themes funktionieren ohne optionale JavaScript-Helfer oder Capacitor-Plugin. Setzen Sie für einen Range auf einer beliebigen HTML-Fläche `--md3-range-gap-color` auf deren Farbe; normale Ionic-Container stellen ihren Hintergrund automatisch bereit.

Gemessene Tablet-Dialoggrößen, Ecken, Tastaturverhalten und historische native Referenzaufnahmen finden Sie im [Android-17-Tablet-Review](https://github.com/webview-native-ui/ionic-theme-md3/blob/v9.2.0/docs/validation/android17-tablet-2026-11-07.md). Die anschließende Korrektur der Ionic-Standardfarben und ihre Browserprüfung beschreibt der [Review der Ionic-Farbvererbung](https://github.com/webview-native-ui/ionic-theme-md3/blob/v9.2.0/docs/validation/ionic-color-inheritance-2026-11-07.md).

## Alert-Größen auf Tablets

Breite Tablet-Alerts folgen den gemessenen Android-17-Settings-Proportionen: 85 % im Hochformat und 65 % im Querformat. Beim Tippen auf Android-Tablets bleibt diese Breite erhalten, wenn die IME den Viewport verkleinert. Fenster in Telefongröße behalten Ionics inhaltsabhängiges Layout.

Verwenden Sie öffentliche Größeneigenschaften zur Dialoganpassung. Setzen Sie bei einem per Controller erzeugten Alert `cssClass: 'app-alert'` und platzieren Sie eine mit dem Komponentennamen qualifizierte Regel im globalen Anwendungsstylesheet nach dem Theme:

```css
ion-alert.app-alert {
  --width: 400px;
  --max-width: min(400px, calc(100vw - 32px));
}
```

Inline-Style-Bindings funktionieren ebenfalls. Normale CSS-Minimal-/Maximalbeschränkungen gelten weiterhin, und `md3-disabled` stellt Ionics eigene Größenstandards wieder her.

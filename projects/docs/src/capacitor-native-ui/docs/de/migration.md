---
title: "Migration"
sourceRevision: "5e81ee4cba053730d861acf21e890711ac63f36439bbf2bd5f0847cffb1b69b4"
---

# Migration

## Upgrade von 2.1.0

Dieser Abschnitt beschreibt in der Theme- und der Native UI-Anleitung dasselbe Upgrade; eine der beiden Anleitungen genügt. Behalten Sie bestehende Theme-Importe, Stylesheets und Animationseinstellungen bei. Native UI bleibt optional. Falls aktiviert, behalten Sie den vorhandenen Aufruf von `enableNativeUI()`, die Steuerelementauswahl und die Laufzeit an der Anwendungswurzel bei. Die ältere Pakettrennungsmigration weiter unten muss nicht wiederholt werden.

### Abhängigkeiten aktualisieren

Aktualisieren Sie bei reinen Theme-Anwendungen das Theme:

```sh
npm install @rdlabo/ionic-theme-ios27@latest
```

Aktualisieren Sie bei Anwendungen mit Gerätegeometrie für die Seitenleiste oder Native UI alle drei Pakete einschließlich Foldable. Sie werden unabhängig versioniert; verwenden Sie gemäß der Peer-Abhängigkeit des Themes kompatible Versionen:

```sh
npm install @rdlabo/ionic-theme-ios27@latest @rdlabo/capacitor-native-ui@latest @erkamyaman/capacitor-foldable@latest
```

Der folgende Resolver-Import liefert Layoutwerte, ohne die native Projektion zu aktivieren. Reine Theme-Anwendungen ohne geräteseitige Leiste können den Schritt zur Gerätegeometrie überspringen.

### Gerätegeometrie aktualisieren

Wenn Ihre App `getBarPlacement()` direkt auf `setVerticalBarsLayout({ edge, inset })` abbildet, verwenden Sie den Resolver, um den Ursprung der Werkzeugleiste aus den reservierten Bereichen einzubeziehen:

```diff
- import { Foldable, type BarPlacement } from '@erkamyaman/capacitor-foldable';
+ import { Foldable } from '@erkamyaman/capacitor-foldable';
+ import { resolveVerticalBarsLayout } from '@rdlabo/capacitor-native-ui/integration';
 import { setVerticalBarsLayout } from '@rdlabo/ionic-theme-ios27';

- const applyPlacement = ({ verticalBarEdge, inset }: BarPlacement) =>
-   setVerticalBarsLayout({ edge: verticalBarEdge, inset });
- const listener = await Foldable.addListener('barPlacementChange', applyPlacement);
- applyPlacement(await Foldable.getBarPlacement());
+ const updateLayout = async () => {
+   setVerticalBarsLayout(await resolveVerticalBarsLayout(Foldable));
+ };
+ const listener = await Foldable.addListener('layoutChange', () => void updateLayout());
+ await updateLayout();
```

Ersetzen Sie den alten Platzierungslistener, statt einen zweiten Aktualisierungspfad hinzuzufügen. Behalten Sie `await listener.remove()` im bestehenden Aufräumcode der Anwendung bei. Falls bereits ein `layoutChange`-Handler vorhanden ist, rufen Sie den Resolver dort auf. Die bestehende Anbindung von `foldStateChange` / `applyFoldStateClasses` für die Faltstellung bleibt erhalten; der Resolver liefert nur die Geometrie der Leiste.

Verwenden Sie das gemeldete Leistenlayout direkt, ohne es von `isDeviceFoldable()`, einem Gerätenamen oder heuristischen Viewport-Größen abhängig zu machen. Entfernen Sie feste Toolbar-Top-Workarounds, die Gerätegeometrie nachbilden sollten. Beabsichtigte CSS-Anpassungen der Anwendung bleiben unterstützt. Standardwerte verbleiben in `setVerticalBarsLayout` des Themes, nicht im Resolver. Der Standard für das Außendisplay beträgt 174px; gemeldete Gerätegeometrie kann den Ursprung des Innendisplays von 124px liefern. Siehe [Layoutwerte und Rückfallverhalten](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars-layout#apply-device-layout-values).

### Modal-Korrekturen und Aussehen von Absendeaktionen

Schwebende Karten und Sheets verwenden jetzt gemessene Grenzen, um die Duo-Leiste nicht zu überlappen, und Native UI erkennt schwebende Dialoge, die die Leiste überlappen, korrekt. Dies korrigiert das Modal-Layout und die Behandlung nativer Steuerelemente ohne Änderungen am Anwendungscode. CSS, das allein als Workaround für diesen Fehler volle Breite erzwungen hat, können Sie entfernen. Behalten Sie explizite Vollbildgrößen bei, wenn sie eine Produktanforderung sind. Mit `ios-theme-vertical-bars` oder `ios-theme-fold-expanded` auf `ion-app` lassen schwebende Karten und Sheets auf jeder Seite mindestens 8px frei. Bei mindestens 600px hohen Viewports ist ihre Breite auf 653px begrenzt; niedrigere Viewports nutzen die verfügbare Breite minus 16px. Der obere Abstand folgt der Safe Area und beträgt mindestens 8px. Sheet-Breakpoints steuern weiterhin die sichtbare Höhe. Anwendungsspezifische Größen über `--width`, `--max-width` und `--height` bleiben unterstützt. Übliche Telefon- und Tablet-Standardwerte ändern sich nicht, wenn keine der Layoutklassen aktiv ist.

Ausgefüllte Ionic-Absende-Schaltflächen verwenden automatisch eine hervorgehobene native Glasdarstellung:

```html
<ion-button type="submit" fill="solid">Save</ion-button>
```

Dasselbe Aussehen gilt für vorhandene `.button-submit`-Aktionen mit solider Füllung. Diese Klasse gestaltet nur die Darstellung und sendet kein Formular ab. Clear- und Outline-Füllungen erhalten keine Absendehervorhebung. Bestehende explizite Deklarationen von `data-native-ui="button-submit"` bleiben unterstützt.

Native Steuerelemente behalten während Navigation, Modal-Animationen und Bildübergaben die Zuständigkeit. Ein in der WebView angezeigtes Bild ist weiterhin die Darstellung der nativen Projektion und keine Rückkehr zum ursprünglichen Web-Button. Testen und entfernen Sie transitionsspezifische Workarounds, die diese Steuerelemente ins Web zurückzwingen. Behalten Sie beabsichtigte Ausnahmen sowie die Behandlung nicht unterstützter Steuerelemente und nativer Fehler bei; zusätzliche Animationsflags oder eine zweite Laufzeit sind nicht nötig.

Prüfen Sie beide Leistenseiten, das Verschwinden der Leiste, Falten und Drehen, Karten-, Sheet- und Vollbilddarstellungen sowie solide Absendeaktionen. Prüfen Sie auch ein gewöhnliches iPhone und den Browser-Fallback. Verwenden Sie für Cordova die [gebündelte Integration](https://github.com/webview-native-ui/cordova-plugin); das festgelegte Theme und native Änderungen werden durch ein Cordova-Plugin-Release bereitgestellt, nicht über diese Capacitor-Installationsbefehle.

## Von 1.2.1 aktualisieren

Diese Anleitung richtet sich an Anwendungen mit `@rdlabo/ionic-theme-ios27` **1.2.1**, einschließlich Native UI Shell Preview und eigenständiger Vertical Control Area.

- **Nur Theme:** Theme-Paket aktualisieren. Bestehende Theme-Importe, CSS-/Sass-Pfade und Animationsimporte bleiben gültig; kein nativer Start erforderlich.
- **Native UI oder Vertical Control Area:** Natives Paket direkt installieren, Importe und Starteinstellungen wie unten ersetzen, anschließend Capacitor synchronisieren und die native App neu erstellen.

Native UI wechselt mit Version 2.0.0 von der Vorschau zur offiziellen Unterstützung. Experimentelle Erweiterungen beschreibt die [aktuelle Erweiterungsanleitung](native-ui-extensions.md); diese Anleitung behandelt die veröffentlichten Bedienelemente und die Einrichtung von 1.2.1.

## Aufteilung in ein eigenes Native UI-Paket

Für eine neue native Integration folgen Sie der [Native UI-Einrichtung](setup.md) oder bei vorhandenem iOS-Theme [Native UI zum Theme hinzufügen](/ionic-theme-ios27/docs/add-native-ui). Die folgenden Schritte behandeln bestehende Anwendungen, die Paketnamen und native Projekte migrieren.

Theme und native Bedienelemente liegen jetzt in separaten Paketen. Wählen Sie Abhängigkeiten anhand des verwendeten Verhaltens:

| Anwendungsverhalten | Direkt verwendetes Paket |
| --- | --- |
| Theme-Stile, Ionic-Web-Verhalten und Theme-Animationen | `@rdlabo/ionic-theme-ios27` |
| Native UI oder eigenständige Vertical Control Area | `@rdlabo/capacitor-native-ui` |
| Theme-Gestaltung zusammen mit nativen Bedienelementen | Beide Pakete |

Das Theme verantwortet Darstellung und Verhalten von Ionics Web-Elementen. Native UI projiziert unterstützte Bedienelemente in native iOS-Ansichten und koordiniert deren Lebenszyklus mit der Web-Navigation. Native UI lässt sich ohne iOS-27-Theme verwenden; ihre Installation wendet keine Theme-Stile an. Standardbedienelemente unter Android und in Browsern behalten ihre Web-Darstellung; Android kann [app-lokale Compose-Erweiterungen](native-ui-extensions.md#2b-register-compose-content-on-android) darstellen.

Das Theme verwendet intern die gemeinsame Übergangs-/Suchintegration des nativen Pakets. Diese Abhängigkeit aktiviert keine nativen Bedienelemente automatisch. Apps mit nativen Bedienelementen müssen das native Paket direkt deklarieren, damit Capacitor das Plugin erkennen kann.

### 1. Anwendungsabhängigkeiten aktualisieren

Das Theme und Native UI werden unabhängig versioniert. Wählen Sie bei gemeinsamer Verwendung eine Native UI-Version, die zur deklarierten Peer-Abhängigkeit des Themes passt. Die folgenden Befehle installieren zusätzlich [Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) als separate Anwendungsabhängigkeit für Positions- und Faltstellungsmeldungen. Foldable hat eigene Releaseversionen.

Aktualisieren Sie bei reinen Theme-Apps das Theme-Paket. Behalten Sie bestehende Theme-Importe und CSS-/Sass-Pfade; ausschließlich für das Theme sind weder nativer Start noch Plugin-Einrichtung nötig.

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

Installieren Sie bei Apps mit Theme und nativen Bedienelementen beide als direkte Anwendungsabhängigkeiten:

```sh
npm install @rdlabo/ionic-theme-ios27 @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Für native Bedienelemente mit Ihrer bestehenden Web-Darstellung folgen Sie [Nur Native UI](setup.md). Installieren Sie das native Paket direkt und behalten Sie Ihre Web-Stile. Das Plugin benötigt zur Auswahl unterstützter Bedienelemente keine Theme-Variablen mehr; Web-Layout bleibt Aufgabe Ihrer App oder Ihres Themes. Nativer Start benötigt Capacitor 8. Der Ionic-Adapter benötigt Ionic 8.8.1 oder neuer innerhalb von Ionic 8 oder 9; `/core` benötigt kein Ionic.

### 2. Native Importe ersetzen

| Bisheriger Import | Ersatz |
| --- | --- |
| `@rdlabo/ionic-theme-ios27/native` | `@rdlabo/capacitor-native-ui` |
| `@rdlabo/ionic-theme-ios27/vertical-bars` | `@rdlabo/capacitor-native-ui/vertical-bars` |

Aktualisieren Sie Wert- und Typimporte einschließlich dynamischer Importe, Test-Aliase und Bundler-Konfiguration. Die alten Theme-Einstiegspunkte `/native` und `/vertical-bars` wurden entfernt; es gibt keine Kompatibilitätsaliase.

```diff
- import { enableNativeUIShell } from '@rdlabo/ionic-theme-ios27/native';
+ import { enableNativeUI } from '@rdlabo/capacitor-native-ui';
```

Behalten Sie bestehendes Bedienelement-Markup; prüfen Sie die [Änderungen der Startoptionen](#startup-options), einschließlich der Standardwerte partieller `controls`. Der gewöhnliche Einstiegspunkt `@rdlabo/ionic-theme-ios27`, Theme-CSS-/Sass-Pfade und Theme-Animationsimporte bleiben unverändert. Für eigene Navigationsanimationen beachten Sie unten die [Übergangsadapter-Anweisungen](#native-ui-transition-adapter).

### 3. Natives Projekt synchronisieren

Erstellen Sie nach dem Aktualisieren von Abhängigkeiten und Importen die Web-Assets mit dem üblichen Buildbefehl Ihrer App neu und führen Sie anschließend Folgendes aus:

```sh
npx cap sync ios
```

Das Capacitor-Plugin stammt jetzt aus dem nativen Paket. Entfernen Sie manuell verknüpfte Kopien des alten Theme-Swift-Pakets, damit nur das neue Paket das Plugin liefert. Swift-Paket/-Produkt und CocoaPods-Pod heißen jetzt `RdlaboCapacitorNativeUi`; das Swift-Modul heißt `NativeUIPlugin`. Der Capacitor-Bridge-Name ist in JavaScript, iOS und Android jetzt `NativeUI`. Führen Sie Capacitor-Sync für jede verwendete native Plattform aus und erstellen Sie die native App erneut. Ein OTA-/reines Web-Update kann ein installiertes Binary mit ausschließlich altem Plugin nicht migrieren. Verwenden Sie übereinstimmende JavaScript- und native Paketversionen.

Verwenden Sie Capacitors generierte Integration für die npm-Abhängigkeit; Anwendungen benötigen weder einen Checkout dieses Repositorys noch ein manuell verknüpftes Swift-Paket.

### 4. Migration prüfen

- Prüfen Sie, dass Apps mit nativen Funktionen `@rdlabo/capacitor-native-ui` direkt deklarieren; erstellen Sie die App und stellen Sie sicher, dass keine Importe entfernter Theme-Einstiegspunkte bleiben.
- Erstellen und starten Sie die iOS-App nach der Synchronisierung. Prüfen Sie native Bedienelemente, Navigation/Zurückgesten und wiederhergestellte Web-Bedienelemente nach der Bereinigung.
- Prüfen Sie die Web-Darstellung in Browsern und unter Android, soweit Ihre App sie unterstützt, sowie die korrekte Theme-Darstellung.
- Prüfen Sie, dass zuvor deaktivierte Bedienelementtypen nach dem Erweitern partieller Preview-Einstellungen deaktiviert bleiben. Testen Sie Werkzeugleistengruppierung, einzeln ausgewählte Aktionen und Zurücknavigation in horizontalen und vertikalen Layouts.

## Namensänderungen in Native UI

Das separate Paket verwendet durchgehend Native UI-Namen. Diese Umbenennungen brechen die Kompatibilität; die alten Namen sind keine Aliase. Die folgenden früheren Namen beziehen sich auf die veröffentlichte Preview 1.2.1.

| Bisheriger Name | Neuer Name |
| --- | --- |
| `enableNativeUIShell()` | `enableNativeUI()` |
| `NativeUIShellOptions`, `NativeUIShellHandle`, `NativeUIShellStatus`, `NativeUIShellSuspension`, `NativeUIShellControls`, `NativeUIShellComponent` | `NativeUIOptions`, `NativeUIHandle`, `NativeUIStatus`, `NativeUISuspension`, `NativeUIControls`, `NativeUIComponent` |
| `IonicNativeUIShell` (Plugin-Export und Bridge-Registrierung) | `NativeUI` |
| `withNativeUIShellTransition()` | `withNativeUITransition()` (weiterhin vom Theme-Paket exportiert) |
| `IonicNativeUIShellPlugin` (Swift-Modul/native Klasse) | `NativeUIPlugin` |
| `RdlaboIonicThemeIos27` (SPM-Paket/-Produkt) | `RdlaboCapacitorNativeUi` |
| `data-shell="disabled"` | `data-native-ui="disabled"` |
| `.ios-theme-shell-disabled` | `.native-ui-disabled` |

Laufzeiteigene Attribute/Ereignisse sind intern und keine Konfiguration: `data-native-ui-shell` heißt jetzt `data-native-ui-projected`, andere `data-native-ui-shell-*`-Attribute verwenden `data-native-ui-*`, `nativeUIShell*`-Ereignisse verwenden `nativeUI*` und `.ios-theme-native-ui-shell-*`-Klassen verwenden `.native-ui-*`. Aktualisieren Sie Tests oder Diagnosen Ihrer App, die sie untersuchen. **Behalten Sie explizite Quelldeklarationen wie `data-native-ui="button"` unverändert**; die Projektionsmarkierung ist davon getrennt und wird von der Laufzeit verwaltet.

## Native UI-Übergangsadapter

Der Ionic-Übergangsadapter gehört jetzt zu `@rdlabo/ionic-theme-ios27`. Ersetzen Sie den 1.2.1-Import von `withNativeUIShellTransition` aus `@rdlabo/ionic-theme-ios27/vertical-bars` durch `withNativeUITransition` aus dem Theme-Stammeinstiegspunkt. Rein native Anwendungen können `shell.suspend()` und das zurückgegebene `resume()` direkt verwenden.

Verwenden Sie `withNativeUITransition()`, um Ihre bestehende Ionic-Navigationsanimation zu behalten und Native UI-Bedienelemente zu koordinieren.

- Importieren Sie bereits `iosTransitionAnimation` aus `@rdlabo/ionic-theme-ios27`, behalten Sie die [Paketanimationskonfiguration](ionic-vertical-bars.md#use-the-themes-ios-animation); keine Konfigurationsänderung nötig. Sie verwendet den gemeinsamen Adapter jetzt intern; ergänzen Sie keinen weiteren Wrapper.
- Verwenden Sie Ionics Standardanimation ohne `navAnimation`, folgen Sie [Ionics Standardanimation behalten](ionic-vertical-bars.md#keep-ionics-default-animation). Das Beispiel wählt Ionics standardmäßigen iOS- oder MD-Builder anhand des Übergangsmodus.
- Verwenden Sie eine eigene Navigationsanimation mit Native UI oder eigenständiger Vertical Control Area, umschließen Sie Ihren bestehenden Builder bei der Ionic-Konfiguration:

```diff
+ import { withNativeUITransition } from '@rdlabo/ionic-theme-ios27';

  const ionicConfig = {
-   navAnimation: existingTransition,
+   navAnimation: withNativeUITransition(existingTransition),
  };
```

Führen Sie diese Option vor der Initialisierung mit Ihrer bestehenden Ionic-Konfiguration zusammen. Der Adapter erhält Effekte, Dauer und Easing der Animation und koordiniert zugleich native Auflösung, Wischfortschritt und Abbruch. Behalten Sie Ihre bestehenden Theme-Stylesheet-Importe und den Start von Native UI oder Vertical Control Area.

Verwenden Sie den Adapter nur für Navigation. Lassen Sie Modal- und Popover-Animationen unverändert. Ihr Builder muss für jede Navigation eine neue `Animation` erzeugen, da Ionic sie danach zerstört. Behalten Sie Lebenszyklusereignisse für die Registrierung von Bedienelementen und Übergänge ohne Animation bei. Wenn der eigene Builder eine horizontale Zurück-Schaltfläche separat animiert, schließen Sie diesen Effekt bei aktivem `.ios-theme-vertical-bars` aus.

Einrichtung und unterstützten Umfang beschreibt [Navigationsanimation verbinden](ionic-vertical-bars.md#2-connect-your-navigation-animation).

## Startoptionen

In 1.2.1 aktivierte ein angegebenes `controls` **nur auf `true` gesetzte Felder**. In der neuen API sind ausgelassene Felder standardmäßig `true`, auch in Teilobjekten. Erweitern Sie bei der Migration Ihre bisherige Auswahl.

| 1.2.1 | Neue Konfiguration |
| --- | --- |
| Kein `controls` | Kein `controls`: Alle unterstützten Typen bleiben standardmäßig ausgewählt. |
| `controls: {}` | `controls: false` deaktiviert die Standardauswahl; `ionic: { auto: false }` deaktiviert Ionic-Erkennung vollständig. |
| `controls.toolbar` | `controls.buttonGroup`, `controls.button` und `controls.backButton` auf den alten toolbar-Wert setzen. |
| `controls.tabs`, `.segment`, `.fab` | Dieselben Namen, aber für bisher ausgelassene Felder ausdrücklich `false` verwenden. |
| `buttonProjection` | `ionic.verticalBars.buttonProjection` |
| `buttonDefaultFill: null` | `ionic.verticalBars.buttonDefaultFill: 'glass'` (auch der Standard) |
| `buttonDefaultFill: 'solid'` | `ionic.verticalBars.buttonDefaultFill: 'solid'` |
| `verticalBarsOnly: true` | `controls: 'verticalOnly'` für Standardauswahl in der Seitenleiste. Bei partieller Auswahl `'verticalOnly'` für jeden aktivierten Typ und `false` für den Rest verwenden. |
| `enabled: false` | Laufzeit nicht starten oder `destroy()` am aktiven Handle aufrufen. |

Die alten Startoptionsnamen wurden ohne Aliase entfernt. Der eigenständige Einstiegspunkt `enableVerticalControlArea()` bleibt verfügbar und setzt `controls` standardmäßig auf `'verticalOnly'`; seine Darstellungseinstellungen wandern ebenfalls nach `ionic.verticalBars`. Verwenden Sie pro App nur einen Starteinstiegspunkt.

### Eine reine Tab-Konfiguration erhalten

```diff
- import { enableNativeUIShell } from '@rdlabo/ionic-theme-ios27/native';
+ import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

- const shell = await enableNativeUIShell({
-   controls: { tabs: true },
-   buttonProjection: 'source',
-   buttonDefaultFill: null,
+ const shell = await enableNativeUI({
+   controls: {
+     buttonGroup: false,
+     button: false,
+     backButton: false,
+     tabs: true,
+     segment: false,
+     fab: false,
+   },
+   ionic: {
+     verticalBars: { buttonProjection: 'source', buttonDefaultFill: 'glass' },
+   },
  });
```

### Bedienelemente anhand ihrer Position auswählen

Alle sechs Bedienelementfelder akzeptieren `boolean | 'horizontalOnly' | 'verticalOnly'`. Ein skalarer `controls`-Wert gilt für jedes Feld. Horizontal und vertikal bedeuten gewöhnliche Position und Seitenleiste, nicht Geräteausrichtung oder Modell.

```ts
const shell = await enableNativeUI({ controls: 'verticalOnly' });
```

Dies sind Auswahlstandards, keine strikten Projektionsgrenzen. Explizite `data-native-ui`-Quellen und lokale `data-horizontal-bars="true"` / `data-vertical-bars="true"` können auch bei passendem Standardwert `false` aktivieren. Entfernen Sie die explizite Markierung oder verwenden Sie `data-native-ui="disabled"`, um eine einzelne Quelle im Web zu belassen. `ionic.auto: false` deaktiviert automatische Ionic-Erkennung einschließlich lokaler Layoutaktivierungen, lässt explizite Quelldeklarationen jedoch aktiviert.

`buttonGroup` steuert nur Gruppierung. Es wählt keine Kindelemente: `buttonGroup: true, button: false` projiziert ohne explizite Auswahl keine gewöhnliche Aktion. `backButton` steuert Zurücknavigation unabhängig, auch innerhalb eines `ion-buttons`-Containers. Die vollständige Auswahlmatrix steht unter [alle Einstellungen](configuration.md), lokale Überschreibungen unter [Werkzeugleistengruppierung](native-ui.md#toolbar-selection-and-grouping).

## Zuständigkeit für das Web-Layout

Importieren Sie `setVerticalBarsLayout` und `applyFoldStateClasses` für Theme-CSS aus `@rdlabo/ionic-theme-ios27`. Ersetzen Sie `setVerticalControlAreaPlacement({ edge, nativeEdge, inset })` durch `setVerticalBarsLayout({ edge, inset })`. Native UI liest Verfügbarkeit jetzt aus eigenen Gerätemetriken; der veraltete Kompatibilitätshelfer ignoriert `nativeEdge`. Normaler Start, deaktivierte Seitenleisten und Bereinigung entfernen weder Theme-Klassen noch ändern sie reservierte Web-Abstände. Eine nicht verfügbare native Seitenleiste erhält das Web-Seitenleistenlayout der Anwendung; Anwendungen müssen ein gewünschtes horizontales Layout selbst wählen. Rein native Anwendungen können weiterhin eigenes Layout-CSS verwenden.
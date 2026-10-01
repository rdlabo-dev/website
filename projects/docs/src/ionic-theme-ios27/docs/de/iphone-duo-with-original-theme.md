---
title: "iPhone Duo mit Ihrem vorhandenen Theme (Vorschau)"
sourceRevision: "d57e8b71bcd0719317f88e68e7e6202bedc90beb6a0ce1e374d2a4003003431f"
---
# iPhone Duo mit Ihrem vorhandenen Theme (Vorschau)

Ergänzen Sie Ihre Ionic-Anwendung um einen vertikalen Navigationsbereich und behalten Sie ihr bestehendes Theme bei. Tabs und unterstützte Werkzeugleistenaktionen wandern an die Bildschirmseite; Inhalt und horizontale Bedienelemente behalten ihr bisheriges Erscheinungsbild. Die Ionic-Modi `ios` und `md` werden beide unterstützt.

**Probieren Sie es zuerst in Chrome aus.** Sie können das Layout mit Web-Bedienelementen testen, bevor Sie ein iPhone Duo oder einen iOS-Build einrichten. Unter unterstütztem Capacitor iOS liefert dasselbe Ionic-Markup native SwiftUI-Bedienelemente in der Systemleiste.

In `1.2.0` als **Vorschaufunktion** verfügbar. APIs und unterstütztes Verhalten können sich ändern.

## In Ihrer bestehenden Ionic-Anwendung ausprobieren

### 1. Das eigenständige Stylesheet installieren und laden

Diese Anleitung setzt eine bestehende Ionic-Anwendung mit Ionic `>=8.8.1 <10` und Capacitor Core `>=8 <9` voraus. Behalten Sie Ihre vorhandene Capacitor-8-Installation bei. Verwendet Ihre Anwendung eine andere Capacitor-Hauptversion, migrieren Sie Core, CLI und Plattformpakete gemeinsam, bevor Sie dieser Anleitung folgen. Installieren Sie für eine reine Web-Anwendung ohne Capacitor zusätzlich `@capacitor/core@^8`; der JavaScript-Einstiegspunkt benötigt es auch in Chrome.

```bash
npm install @rdlabo/ionic-theme-ios27@1.2.0
```

Behalten Sie Ihre vorhandenen Theme-Imports bei. Ergänzen Sie in Ihrer globalen Sass-Datei Folgendes:

```scss
@use '@rdlabo/ionic-theme-ios27/dist/css/vertical-bars.css';
```

Der eigenständige JavaScript-Einstiegspunkt benötigt `@capacitor/core` auch in Chrome. Die Stylesheets des iOS-27-Themes sind nicht erforderlich.

### 2. Das seitliche Layout für Ihre Anwendung aktivieren

Fügen Sie die Klasse zu Ihrem vorhandenen Anwendungswurzelelement hinzu und belassen Sie den Inhalt darin:

```html
<ion-app class="ios-theme-vertical-bars">
  <!-- Vorhandene Seiten, Tabs und Toolbar-Steuerelemente hier beibehalten. -->
</ion-app>
```

Die Vorschau reserviert `80px` auf der physischen rechten Seite. Fügen Sie für eine Vorschau auf der linken Seite zusätzlich `ios-theme-vertical-bars-left` hinzu.

### 3. Ihre Navigationsanimation verbinden

Konfigurieren Sie `navAnimation`, bevor Ionic initialisiert wird. Der Start der Leistenlaufzeit registriert diese Option nicht. Der Adapter wartet auf das Entfernen nativer Bedienelemente und koordiniert Wischfortschritt und Abbruch, wobei Ihre bestehende Animation erhalten bleibt.

#### Die Standardanimation von Ionic beibehalten

Wenn Sie `navAnimation` nicht konfiguriert haben, umschließen Sie die Standard-Builder von Ionic. Wählen Sie den Builder anhand des Übergangs-`mode` von Ionic, damit `ios` und `md` ihre üblichen Animationen behalten:

```ts
import { iosTransitionAnimation, mdTransitionAnimation, type AnimationBuilder } from '@ionic/core';
import { withNativeUIShellTransition } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const defaultTransition: AnimationBuilder = (baseEl, opts) =>
  (opts.mode === 'ios' ? iosTransitionAnimation : mdTransitionAnimation)(baseEl, opts);

const ionicConfig = {
  navAnimation: withNativeUIShellTransition(defaultTransition),
};
```

Ergänzen Sie diese Option vor der Initialisierung in Ihrer bestehenden Ionic-Konfiguration: Übergeben Sie sie an `provideIonicAngular()` von Angular, `setupIonicReact()` von React oder die Plugin-Optionen von `IonicVue`. Behalten Sie Ihre vorhandenen Theme-Stylesheet-Imports bei. Ein Stylesheet des iOS-27-Themes ist nicht erforderlich.

#### Die iOS-Animation dieses Pakets verwenden

Wenn Sie den iOS-27-Übergang bereits verwenden, behalten Sie diese Konfiguration bei. Sie enthält den nativen Adapter und schließt den horizontalen Zurück-Schaltflächeneffekt in vertikalen Layouts aus. Ein zusätzlicher Wrapper ist nicht erforderlich. Der Import dieses JavaScript-Einstiegspunkts lädt die Theme-Stylesheets nicht.

```ts
import { iosTransitionAnimation } from '@rdlabo/ionic-theme-ios27';

const ionicConfig = {
  navAnimation: iosTransitionAnimation,
};
```

Wenden Sie diese Option auf Ihre bestehende iOS-Moduskonfiguration an und behalten Sie die MD-Konfiguration bei.

#### Ihre eigene Animation beibehalten

Wenn Ihre Anwendung einen anderen Builder für `navAnimation` verwendet, umschließen Sie ihn:

```ts
import type { AnimationBuilder } from '@ionic/core';
import { withNativeUIShellTransition } from '@rdlabo/ionic-theme-ios27/vertical-bars';

// Den Animation Builder übergeben, den Ihre App bereits verwendet.
const configureNavigation = (existingTransition: AnimationBuilder) => ({
  navAnimation: withNativeUIShellTransition(existingTransition),
});
```

Der Adapter gibt die ursprüngliche `Animation` zurück und erhält ihre Effekte, Dauer und Easing-Kurve. Verwenden Sie ihn nur für Navigation, nicht für Modal- oder Popover-Animationen. Der Builder muss für jede Navigation eine neue `Animation` zurückgeben; Ionic zerstört sie nach dem Übergang. Behalten Sie Lebenszyklusereignisse für die Registrierung von Bedienelementen und Übergänge ohne Animation bei.

Der Adapter behält die Animationsziele des Builders bei, einschließlich eines etwaigen horizontalen Zurück-Schaltflächeneffekts. Wenn Sie den iOS-27-Übergang benötigen und dieser Effekt in vertikalen Layouts ausgeschlossen werden soll, verwenden Sie stattdessen `iosTransitionAnimation` aus `@rdlabo/ionic-theme-ios27` als `navAnimation`. Der Adapter ist darin bereits enthalten; ein Wrapper ist daher nicht erforderlich.

### 4. Die Bedienelemente nach dem Einbinden des Anwendungswurzelelements starten

Rufen Sie dies beim Anwendungsstart einmal auf, nachdem `ion-app` im DOM vorhanden ist:

```ts
import { enableVerticalControlArea } from '@rdlabo/ionic-theme-ios27/vertical-bars';

const rail = await enableVerticalControlArea();
```

**Das sollten Sie sehen:** Ihre bestehende Tab-Leiste wandert an die Seite. Schaltflächen fest positionierter Werkzeugleisten mit einem `ion-icon` oder SVG mit `slot="icon-only"` erscheinen ebenfalls dort. Der Inhalt behält sein bestehendes Theme und lässt Platz für die Bedienelemente. Die Web-Tab-Leiste zeigt Symbole; beim Drücken und Ziehen werden die Tab-Beschriftungen sichtbar.

Verwenden Sie Ihre vorhandenen Ionic-Klickhandler, Ihr Routing und Ihre Formularzuordnungen. Alle Schaltflächenfüllungen (`default`, `clear`, `solid` und `outline`) folgen derselben `icon-only`-Regel, einschließlich Absende-Schaltflächen. Aktionen ohne diesen Slot bleiben horizontal. Fügen Sie `.ios-theme-horizontal-only` zu einer `ion-buttons`-Gruppe oder einer einzelnen `ion-button` hinzu, um eine Aktion in der horizontalen Werkzeugleiste zu belassen.

Rufen Sie beim Beenden der zuständigen Anwendungsinstanz `await rail.destroy()` auf, um die ursprünglichen Bedienelemente wiederherzustellen und die Laufzeit freizugeben. Wenn Sie bereits `enableNativeUIShell()` verwenden, behalten Sie diese Laufzeit bei und folgen Sie der [gemeinsamen Platzierungsanleitung](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo#project-controls-into-the-rail).

### Optional: Das Aussehen nativer Schaltflächen wählen

`buttonProjection` und lokale Projektionseinstellungen sind in `1.2.0` verfügbar. Verfügbarkeit und Migrationshinweise beschreibt [Das Aussehen von Schaltflächen wählen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#choose-button-appearance).

Der neue Standard ist `system`: SwiftUI gestaltet vertikale Schaltflächen und färbt ihre Symbole. Wenn Ihr bestehendes Theme ihre Füllung und Farben liefern soll, verwenden Sie:

```ts
const rail = await enableVerticalControlArea({ buttonProjection: 'source', buttonDefaultFill: 'solid' });
```

Der Standardwert `solid` eignet sich für gewöhnliche Ionic-Schaltflächen. Schaltflächen innerhalb von `ion-buttons` verwenden weiterhin standardmäßig den Füllmodus clear. Setzen Sie ausdrücklich `fill="solid"`, um ihren Hintergrund zu projizieren. Für einzelne Ausnahmen verwenden Sie die [lokalen Projektionseinstellungen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#override-individual-buttons-or-groups). Diese Einstellungen betreffen nur native vertikale Schaltflächen. Web-Klone behalten ihr bisheriges Aussehen.

### Wenn die Vorschau nicht erscheint

| Beobachtung | Was zu prüfen ist |
| --- | --- |
| Kein Platz an der Seite | Laden Sie `vertical-bars.css` und setzen Sie die Klasse auf `ion-app`. |
| Platz ist vorhanden, aber Bedienelemente bleiben horizontal | Starten Sie `enableVerticalControlArea()` nach dem Einbinden des Anwendungswurzelelements. Verwenden Sie vorhandene Tabs oder `slot="icon-only"`-Aktionen in einer fest positionierten Header-/Footer-Werkzeugleiste. |
| Eine Aktion bleibt horizontal | Prüfen Sie `slot="icon-only"` am Symbol und eine fest positionierte Werkzeugleiste außerhalb scrollenden Inhalts. Ausdrücklich ausgeschlossene Bedienelemente und Bedienelemente in zentrierten Modals bleiben horizontal. `fill` und `type="submit"` verhindern die Verschiebung nicht. Siehe [Anforderungen an Bedienelemente](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#toolbar-actions). |

## Ein iPhone Duo anbinden

Installieren Sie [`@erkamyaman/capacitor-foldable`](https://github.com/erkamyaman/capacitor-foldable) für den Gerätezustand:

```bash
npm install @erkamyaman/capacitor-foldable
npx cap sync ios
```

Verwenden Sie Capacitor ab 8.5 und erstellen Sie den Build mit Xcode ab 27.1 für die tatsächliche Leistenplatzierung und Scharnierstellung unter iOS 27.1. Die Native UI Shell verwendet Swift Package Manager. Bestehende CocoaPods-Anwendungen können der [Einrichtung der Native UI Shell](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/native-ui-shell#enable-the-shell) folgen. Behalten Sie `vertical-bars.css` dieses Pakets bei; `ionic-tabs.css` des Geräte-Plugins wird mit unserer Leistenprojektion nicht benötigt.

Ersetzen Sie den reinen Browser-Start durch die [Einrichtung der Geräteplatzierung](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo#project-controls-into-the-rail). Diese übergibt Anfangswerte und `barPlacementChange`-Ereignisse an `setVerticalControlAreaPlacement({ edge: verticalBarEdge, nativeEdge: verticalBarEdge, inset })`. Abonnements und Bereinigung verbleiben in Ihrer Anwendung.

Übergeben Sie die angeforderte und die native Kante zusammen mit dem von Foldable gemessenen Innenabstand. Die Platzierungs-API löst RTL auf. Eine null-Kante stellt das gewöhnliche Layout wieder her.

Unter unterstütztem iOS verwenden Bedienelemente in der Leiste natives SwiftUI-Rendering. Ihre eigenen Web-Styles gelten weiterhin für gewöhnlichen Inhalt und horizontale Bedienelemente. Web und Android verwenden Web-Klone.

## Die Scharnierstellung ohne Projektion von Bedienelementen verwenden

Wenn Ihr bestehendes Theme nur eine von der Scharnierstellung gesteuerte geteilte Ansicht oder einen Layoutwechsel benötigt, starten Sie keine Projektionslaufzeit und fügen Sie `.ios-theme-vertical-bars` nicht hinzu. Übergeben Sie Ergebnisse von `Foldable.getFoldState()` und Ereignisse `foldStateChange` an `applyFoldStateClasses(root, fold)` und entfernen Sie den Listener zum Abschluss. Ein separater Aufruf zum Starten oder Stoppen der Überwachung existiert nicht.

Das Abonnementbeispiel, null-Werte und die Lebensdauer der Überwachung beschreibt [Das Gerätelayout auslesen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo#read-the-device-layout). Aktivierbare Breitenregeln und die halb geöffnete Stellung finden Sie unter [Die geteilte Ansicht anpassen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo#adapt-the-split-pane).

## Gemeinsame Layoutregeln und API

Safe-Area-Behandlung, Overlays, RTL, Eignung der Bedienelemente, Web-Simulation und die Handle-API sind unter [Vertical Bars](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars) dokumentiert. Diese Regeln gelten auch für die eigenständige Einrichtung.

---
title: "API"
sourceRevision: "b5da348b569ca801dcd01ee05a731156ce02470e60ced950e4736a71d8a960c2"
---
Referenz der von `@rdlabo/ionic-theme-ios27` v1.2.1 exportierten JavaScript-API. CSS- und Sass-Einstiegspunkte sind weiterhin im README dokumentiert.

## Effekte

#### `function` registerTabBarEffect

`(targetElement: HTMLElement) => registeredEffect | undefined`

Registriert den Liquid-Glass-Auswahleffekt für eine Ionic-Tab-Leiste.

#### `function` registerSegmentEffect

`(targetElement: HTMLElement) => registeredEffect | undefined`

Registriert den Liquid-Glass-Auswahleffekt für ein Ionic-Segment.

#### `interface` registeredEffect

| Mitglied        | Typ         | Beschreibung                                                    |
| ------------- | ------------ | -------------------------------------------------------------- |
| **`destroy`** | `() => void` | Entfernt Listener und Effektelemente, die durch die Registrierung erzeugt wurden. |

#### `interface` EffectScales

| Eigenschaft         | Typ     | Beschreibung               |
| ------------ | -------- | ------------------------- |
| **`small`**  | `string` | Kleine Effektskalierung.       |
| **`medium`** | `string` | Mittlere Effektskalierung.      |
| **`large`**  | `string` | Große Effektskalierung.       |
| **`xlarge`** | `string` | Sehr große Effektskalierung. |

## Durchsuchbare Tab-Leiste

#### `function` attachTabBarSearchable

`(ionTabBar: HTMLElement, ionFabButton: HTMLElement, ionFooter: HTMLElement) => TabBarSearchableFunction`

Bindet den Übergang für eine durchsuchbare Tab-Leiste an und gibt dessen Ereignishandler zurück.

#### `enum` TabBarSearchableType

| Mitglied      | Wert     | Beschreibung             |
| ----------- | --------- | ----------------------- |
| **`Enter`** | `"enter"` | Wechselt in den Suchmodus. |
| **`Leave`** | `"leave"` | Verlässt den Suchmodus. |

#### `type alias` TabBarSearchableFunction

`(event: Event, type: TabBarSearchableType) => Promise<void>`

## Animationen

#### `function` withNativeUIShellTransition

`(builder: AnimationBuilder) => AnimationBuilder`

Umschließt einen Ionic-Builder für Navigationsanimationen, um das Entfernen nativer Bedienelemente, Wischfortschritt und Abbruch zu koordinieren und die zurückgegebene Animation zu erhalten. Aus dem Paketwurzelpfad und `/vertical-bars` exportiert. Registrieren Sie ihn als `navAnimation` und verwenden Sie für jede Navigation eine neue `Animation`. Die `iosTransitionAnimation` des Pakets enthält diesen Adapter bereits. Standard- und eigene Ionic-Builder beschreibt die [Einrichtung mit bestehendem Theme](/docs/iphone-duo-with-original-theme).

#### `function` iosTransitionAnimation

`(navEl: HTMLElement, opts: TransitionOptions) => Animation`

Erstellt den iOS-Navigationsübergang des Pakets.

#### `function` setConfig

`(config: Partial<IosTransitionConfig>) => void`

Setzt den Radius des Seitenübergangs. Standardmäßig beträgt er `0`; native Anwendungen können den gemessenen WebView-Radius übergeben.

#### `interface` IosTransitionConfig

| Eigenschaft         | Typ     | Beschreibung                      |
| ------------ | -------- | -------------------------------- |
| **`radius`** | `number` | Eckenradius des Seitenübergangs.   |

#### `function` popoverEnterAnimation

`(baseEl: HTMLElement, opts?: any) => Animation`

Erstellt die iOS-Popover-Eintrittsanimation.

#### `function` popoverLeaveAnimation

`(baseEl: HTMLElement) => Animation`

Erstellt die iOS-Popover-Austrittsanimation.

## Suchleiste

#### `function` supportSeachbarCancelButtonIcon

`(searchbar: HTMLIonSearchbarElement) => SearchbarCancelButtonIconSupport`

Vorübergehende Rendering-Unterstützung für das Ionic-`cancelButtonIcon` im iOS-Modus. Importieren Sie `Seachbar` in dieser Schreibweise, wie es das Paket exportiert. Übergeben Sie ein initialisiertes Element.

#### `interface` SearchbarCancelButtonIconSupport

| Mitglied | Typ | Beschreibung |
| --- | --- | --- |
| **`refresh`** | `() => void` | Liest `cancelButtonIcon` nach einer Änderung der JavaScript-Property erneut aus. |
| **`destroy`** | `() => void` | Entfernt den Observer und das eingefügte Symbol und stellt den Textinhalt wieder her. |

## Native UI Shell (Vorschau)

Importieren Sie diese APIs und Typen aus `@rdlabo/ionic-theme-ios27/native`. Anforderungen und Rückfallverhalten finden Sie in der [Anleitung zur Native UI Shell](/docs/native-ui-shell).

#### `function` enableNativeUIShell

`(options?: NativeUIShellOptions) => Promise<NativeUIShellHandle>`

Einmal beim Start aufrufen. Wiederholte Aufrufe mit derselben Konfiguration teilen die aktive Laufzeit; eine abweichende Konfiguration bei aktiver Laufzeit löst einen Fehler aus. Nicht unterstützte Umgebungen geben ein Handle im Web-Zustand zurück. Setzen Sie `enabled: false`, um die aktive Projektion zu stoppen und Web-Bedienelemente zu verwenden.

#### `function` configureNativeTransition

`() => Promise<WebViewMetrics>`

Liest den nativen WebView-Radius aus und wendet ihn auf Seitenübergänge an, ohne native Bedienelemente zu aktivieren. Auf anderen Plattformen beträgt der Radius `0`.

#### `interface` NativeUIShellOptions

Erweitert `VerticalControlAreaOptions`; siehe die folgenden Optionen für die Projektion vertikaler Schaltflächen.

| Eigenschaft           | Typ                    | Beschreibung                                              |
| -------------- | ----------------------- | -------------------------------------------------------- |
| **`enabled`**  | `boolean`               | Aktiviert die native Projektion global; Standard ist `true`.   |
| **`controls`** | `NativeUIShellControls` | Wenn gesetzt, sind nur ausdrücklich auf `true` gesetzte Bedienelemente geeignet. |

#### `interface` NativeUIShellControls

| Eigenschaft          | Typ      | Beschreibung                              |
| ------------- | --------- | ---------------------------------------- |
| **`tabs`**    | `boolean` | Tab-Leisten und native Suche.              |
| **`toolbar`** | `boolean` | Werkzeugleisten-, Zurück- und Menüschaltflächen.         |
| **`segment`** | `boolean` | Segmente.                                |
| **`fab`**     | `boolean` | Schwebende Aktionsschaltflächen.                |

#### `interface` NativeUIShellHandle

| Mitglied | Typ | Beschreibung |
| --- | --- | --- |
| **`getStatus`** | `() => NativeUIShellStatus` | Den aktuellen Status auslesen. |
| **`suspend`** | `() => Promise<NativeUIShellSuspension>` | Bedienelemente im Web wiederherstellen, bis die Freigabe fortgesetzt wird. |
| **`destroy`** | `() => Promise<void>` | Web-Darstellung wiederherstellen und native Bedienelemente sowie Laufzeit freigeben. |

#### `interface` NativeUIShellSuspension

| Mitglied | Typ | Beschreibung |
| --- | --- | --- |
| **`resume`** | `() => Promise<void>` | Diese Unterbrechung freigeben. Die native Projektion wird fortgesetzt, nachdem alle aktiven Unterbrechungen freigegeben wurden. |

#### `interface` WebViewMetrics

| Eigenschaft         | Typ     | Beschreibung                 |
| ------------ | -------- | --------------------------- |
| **`radius`** | `number` | Nativer Eckenradius der WebView. |

#### `interface` NativeUIShellStatus

```ts
interface NativeUIShellStatus {
  state: 'web' | 'native' | 'stopped';
  projected: number;
  updates: number;
  reason?: string;
}
```

`projected` zählt projizierte Bedienelemente, `updates` zählt Aktualisierungen und `reason` erklärt die Rückkehr ins Web oder das Stoppen. Eine Laufzeit im Zustand `stopped` verbindet sich nach einem Bridge-Fehler nicht automatisch erneut. Zerstören Sie das Handle vor dem erneuten Aktivieren.

#### `type alias` NativeUIShellComponent

`'ion-button' | 'ion-buttons' | 'ion-back-button' | 'ion-menu-button' | 'ion-tab-bar' | 'ion-segment' | 'ion-fab'`

Union der von der Laufzeit verarbeiteten Komponenten-Tags. Die jeweiligen Eignungsanforderungen finden Sie in der Anleitung.

## iPhone Duo / Vertikaler Steuerbereich (Vorschau)

Importieren Sie diese APIs aus `@rdlabo/ionic-theme-ios27/vertical-bars` oder `@rdlabo/ionic-theme-ios27/native`. Der eigenständige Einstiegspunkt funktioniert ohne iOS-27-Theme oder vollständige Native UI Shell. Einrichtung, Toolchain-Anforderungen und Web-Rückfalloption beschreibt [iPhone-Duo-Unterstützung](/docs/iphone-duo).

#### `function` enableVerticalControlArea

`(options?: VerticalControlAreaOptions) => Promise<VerticalControlAreaHandle>`

Startet die Laufzeit ausschließlich für Bedienelemente im vertikalen Bereich. Starten Sie entweder diese Laufzeit oder `enableNativeUIShell()`. Wiederholte Aufrufe mit derselben Konfiguration teilen sie; eine abweichende aktive Konfiguration löst einen Fehler aus.

#### `interface` VerticalControlAreaOptions

| Eigenschaft | Typ | Beschreibung |
| --- | --- | --- |
| **`buttonProjection`** | `'source' \| 'system'` | Aussehen nativer vertikaler Schaltflächen. Standard ist `system` (SwiftUI); `source` projiziert Ionic-Füllungen und berechnete Farben. |
| **`buttonDefaultFill`** | `'solid' \| null` | Standard für nicht gesetzte Füllungen quellengetreuer Schaltflächen außerhalb von `ion-buttons`. Standard ist `null` (Theme-Glas); die Gruppe verwendet weiterhin einen transparenten Hintergrund. |

Beeinflusst weder horizontale Bedienelemente noch Web-Klone. Lokale `data-projection`-Überschreibungen und die Füllungspriorität beschreibt [Vertical Bars](/docs/vertical-bars#choose-button-appearance). Setzen Sie `buttonProjection: 'source'`, um das Erscheinungsbild experimenteller Versionen beizubehalten.

#### `function` setVerticalControlAreaPlacement

`(placement: VerticalBarEdge | VerticalBarPlacement, rtl?: boolean) => void`

Wendet die von der Anwendung gewählte Platzierung nach dem Einbinden von `ion-app` auf CSS und Web-/native Bedienelemente an. Logische Kanten werden anhand des nächstgelegenen Attributs `dir` oder des ausdrücklich gesetzten `rtl` aufgelöst. Übergeben Sie `null`, um das gewöhnliche Layout wiederherzustellen.


#### `function` applyFoldStateClasses

`(root: HTMLElement, fold: FoldState) => void`

Aus `@rdlabo/ionic-theme-ios27/vertical-bars` importieren. Übergeben Sie den Zustand aus `Foldable.getFoldState()` / `foldStateChange`, um genau eine der Klassen `ios-theme-fold-flat`, `ios-theme-fold-half-opened` und `ios-theme-fold-closed` auf das Wurzelelement anzuwenden. Setzt zusätzlich `ios-theme-fold-expanded` bei halb geöffneter oder flacher Stellung mit Scharniergeometrie und entfernt sie andernfalls. Erhält andere Klassen. Abonniert keine Geräteereignisse und verändert Split-Pane-`when` nicht. `FoldState` ist die strukturelle Form mit `state: 'flat' | 'half-opened' | 'closed'` und optionalem `hingeBounds: { x: number; y: number; width: number; height: number }`.

#### `interface` VerticalControlAreaHandle

Erweitert `NativeUIShellHandle` um `setPlacement`, dieselbe Funktion wie `setVerticalControlAreaPlacement`.

| Mitglied | Typ | Beschreibung |
| --- | --- | --- |
| **`setPlacement`** | `(placement: VerticalBarEdge \| VerticalBarPlacement, rtl?: boolean) => void` | Platzierung auf Web- und native Bedienelemente anwenden. |

#### `type alias` VerticalBarEdge

`'leading' | 'trailing' | null`

Logische Kante in Leserichtung; `null` bedeutet keine vertikale Leiste.

#### `interface` VerticalBarPlacement

| Eigenschaft | Typ | Beschreibung |
| --- | --- | --- |
| **`edge`** | `VerticalBarEdge` | Logische Leistenkante. |
| **`inset`** | `number` | Ausdrückliche Leistenbreite in CSS-Pixeln; weglassen, um CSS-Safe-Area-Regeln zu verwenden. |
| **`nativeEdge`** | `VerticalBarEdge` | Von der Anwendung bereitgestellte native logische Kante. Null oder eine nicht registrierte Kante verwendet im Modus verticalBarsOnly eine Web-Leiste, andernfalls das gewöhnliche Native-UI-Shell-Layout. Wird der Wert weggelassen, bleibt der letzte Wert erhalten. |

#### `module` IonicNativeUIShell

Das enthaltene Capacitor-Plugin stellt WebView-Messwerte für die Darstellung bereit. Es besitzt keine Web-Implementierung. Sichern Sie Aufrufe mit `Capacitor.getPlatform() === 'ios'` ab. Verwenden Sie `@erkamyaman/capacitor-foldable` in der Anwendung für Scharnierzustand und Leistenplatzierung. Siehe [iPhone-Duo-Unterstützung](/docs/iphone-duo).

| Mitglied | Typ | Beschreibung |
| --- | --- | --- |
| **`getWebViewMetrics`** | `() => Promise<WebViewMetrics>` | Den effektiven Eckenradius der WebView auslesen. |
| **`addListener`** | `(name: 'webViewMetricsChange', listener: (event: WebViewMetrics) => void) => Promise<PluginListenerHandle>` | Änderungen der WebView-Messwerte abonnieren und den Listener zum Abschluss entfernen. |

Die Methoden der Bridge für Snapshots und Aktivierungen sind interne Implementierungsdetails. Die früheren APIs `DeviceLayout`, `HingeStatus`, `getDeviceLayout()` und die APIs zur Überwachung des Gerätelayouts wurden entfernt.

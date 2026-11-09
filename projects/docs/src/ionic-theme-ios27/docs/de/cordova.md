---
title: "Cordova einrichten"
sourceRevision: "632cc17d693c442a94e91c595e10edb6c77e6f53158df62f69dca027ee1a7e0f"
---

# Cordova einrichten

Verwenden Sie `@webview-native-ui/cordova-plugin` für eine Cordova-App mit Ionic und Native UI. Das Plugin enthält Theme-JavaScript, Typen und CSS, bereits mit seiner nativen Integration verbunden. Bundler-Aliasse oder separate Installationen von `@rdlabo/ionic-theme-ios27` oder `@rdlabo/capacitor-native-ui` sind nicht nötig.

Capacitor ist der standardmäßige native Host dieser Dokumentation. Diese optionale Anleitung beschreibt Paket- und Startunterschiede für eine gebündelte Ionic-Anwendung mit Cordova. Gemeinsames Markup, Styling und Helferverwendung bleiben in den bestehenden Funktionsanleitungen beschrieben.

## 1. Cordova-Plugin installieren

Im Stammverzeichnis der Cordova-Anwendung:

```sh
cordova plugin add @webview-native-ui/cordova-plugin@0.1.1
```

Dies installiert die vorbereiteten nativen und JavaScript-Assets und speichert die npm-Abhängigkeit. Ist Ihr Web-Bundler ein separates npm-Projekt, installieren Sie dort dieselbe Version:

```sh
npm install @webview-native-ui/cordova-plugin@0.1.1
```

Teilen Cordova und Bundler eine `package.json`, ist keine zweite Installation nötig. Behalten Sie vorhandene Ionic-Abhängigkeiten bei. Die [Plugin-Voraussetzungen](https://github.com/webview-native-ui/cordova-plugin#requirements) beschreiben Cordova, SwiftPM, Xcode und Android. Natives Rendering erfordert unterstützte iOS-Versionen; standardmäßige Android-Steuerelemente behalten die Web-Darstellung.

`@erkamyaman/capacitor-foldable` ist ein Capacitor-Plugin und wird für diese Cordova-Einrichtung nicht benötigt. Die Capacitor-spezifische Gerätelayout-Anbindung anderer Theme-Anleitungen belegt keine Cordova-Unterstützung dieser APIs.

## 2. Mitgelieferte Theme-Stile laden

Behalten Sie Ionics Basisstile bei und ergänzen Sie danach diese Importe im globalen Stylesheet. Ersetzen Sie eine vorhandene dunkle Palette, statt mehrere zu laden:

```css
@import '@ionic/core/css/palettes/dark.system.css';
@import '@webview-native-ui/cordova-plugin/theme/css/default-variables.css';
@import '@webview-native-ui/cordova-plugin/theme/css/ionic-theme-ios27.css';
@import '@webview-native-ui/cordova-plugin/theme/css/md-remove-ios-class-effect.css';
@import '@webview-native-ui/cordova-plugin/theme/css/ionic-theme-ios27-dark-system.css';
```

Verwenden Sie für manuellen Dunkelmodus stattdessen `dark.class.css` und `ionic-theme-ios27-dark-class.css` und schalten Sie `ion-palette-dark` auf `html` um. Halten Sie Ionic- und Theme-Varianten passend zueinander.

## 3. Ionic-Animationen konfigurieren

Importieren Sie die Animationen aus dem Cordova-Paket und übergeben Sie sie vor dem Rendern an Ihre vorhandene Ionic-Initialisierung:

```ts
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@webview-native-ui/cordova-plugin/theme';

const ionicConfig = {
  mode: 'ios' as const,
  navAnimation: iosTransitionAnimation,
  popoverEnter: popoverEnterAnimation,
  popoverLeave: popoverLeaveAnimation,
};
```

Verwenden Sie den vorhandenen Initialisierer Ihres Frameworks wie unter [Ionic-Animationen konfigurieren](setup.md#3-configure-ionic-animations) beschrieben; initialisieren Sie Ionic nicht zweimal. Wenden Sie diese Optionen nur in der iOS-Konfiguration an, um Androids Material-Design-Modus beizubehalten. Weitere Helfer wie `attachTabBarSearchable` sind ebenfalls über `/theme` verfügbar; ihr Import bindet das Verhalten nicht automatisch an.

## 4. Native UI nach Bereitschaft von Cordova und App starten

Behalten Sie `<script src="cordova.js"></script>` im Cordova-Einstiegs-HTML bei. Registrieren Sie den Device-Ready-Listener beim Start und warten Sie vor dem Aktivieren von Native UI, bis Ihr Framework `ion-app` eingebunden hat:

```ts
import { enableNativeUI } from '@webview-native-ui/cordova-plugin';

const deviceReady = new Promise<void>((resolve) => {
  document.addEventListener('deviceready', () => resolve(), { once: true });
});

export async function startNativeUI(appMounted: Promise<void>) {
  await Promise.all([deviceReady, appMounted]);
  return enableNativeUI();
}
```

Stellen Sie `appMounted` über den Mount-Lebenszyklus Ihrer Anwendung bereit, rufen Sie `startNativeUI()` einmal auf und behalten Sie das zurückgegebene Handle. Rufen Sie `await handle.destroy()` auf, wenn die Anwendung Native UI dauerhaft nicht mehr verwendet. Erzeugen Sie keine Laufzeit pro Seite und rufen Sie nicht zusätzlich zu diesem npm-basierten Start `window.NativeUI.enableNativeUI()` auf. Browser-Vorschauen senden Cordovas `deviceready` nicht; verwenden Sie diesen Startpfad nur im Cordova-Build und betrachten Sie das Web-Theme über Ihren normalen Browsereinstieg.

Bauen Sie Ihre Web-Assets in das `www`-Verzeichnis der Cordova-Anwendung und bereiten Sie anschließend die native App vor und bauen sie neu, zum Beispiel:

```sh
cordova prepare ios
cordova build ios
```

Verwenden Sie nach Erfüllung der Voraussetzungen `android` für einen Android-Build. Nutzen Sie für Cordova kein `npx cap sync`. Unter iOS deaktiviert der Adapter automatische Scroll-View-Einzüge; setzen Sie Safe-Area-Abstände im Seiten-CSS wie in der [Plugin-Anleitung](https://github.com/webview-native-ui/cordova-plugin#start-native-ui) beschrieben.

## Gemeinsame Theme-Anleitungen verwenden

Lesen Sie weiter zu [Markup und Klassen](special-markup.md), [eingerückten Listen](using-ion-item-group.md), [CSS-Variablen und Komponentenstilen](features.md) sowie [Animationshelfern](animation.md). Die Beispiele verwenden standardmäßig das eigenständige Theme-Paket. Nutzen Sie für die mit Ihrem Cordova-Plugin gebündelte Theme-Version diese Ersetzungen:

| Standarddokumentation | Cordova-Entsprechung |
| --- | --- |
| JavaScript-Importe aus `@rdlabo/ionic-theme-ios27` | `@webview-native-ui/cordova-plugin/theme` |
| CSS-Importe aus `@rdlabo/ionic-theme-ios27/dist/css/*` | `@webview-native-ui/cordova-plugin/theme/css/*` (mit `.css`-Erweiterung) |
| Native UI-Start aus `@rdlabo/capacitor-native-ui` | Cordova-Paketwurzel mit dem oben beschriebenen Startlebenszyklus |
| Sass-Importe aus `@rdlabo/ionic-theme-ios27/src/styles/*` | Nicht im Cordova-Paket enthalten; kompiliertes CSS und CSS-Variablen verwenden |

Die Anleitung für [adaptive Themes](adaptive-themes.md) nutzt Sass-Quellen des eigenständigen Themes und ist nicht direkt auf Cordova übertragbar. Die CSS-Layoutkonzepte von [Vertical Bars-Layout](vertical-bars-layout.md) sind gemeinsam, doch die Capacitor-Foldable-Anbindung benötigt eine hostspezifische Integration. Folgen Sie dem Unterstützungsumfang des Cordova-Plugins, statt native Capacitor-Einrichtungsbefehle zu kopieren.

## Bestehende Theme-App zu dieser Integration migrieren

Ersetzen Sie alle Theme-JavaScript-Importe aus `@rdlabo/ionic-theme-ios27` durch `@webview-native-ui/cordova-plugin/theme` und CSS-Importe aus `@rdlabo/ionic-theme-ios27/dist/css/*` durch `@webview-native-ui/cordova-plugin/theme/css/*`. Importieren Sie den Native UI-Start aus der Cordova-Paketwurzel. Entfernen Sie alte Integrationsaliase sowie ursprüngliche Theme-/Capacitor-Abhängigkeiten, sobald die App sie nicht mehr nutzt. Behalten Sie Komponenten-Markup, Bindings und Handler bei.

Verwenden Sie Helfer und CSS derselben gebündelten Theme-Version. Cordova 0.1.1 enthält Theme 2.1.0; die Installation eines neueren eigenständigen Themes aktualisiert diese Kopie nicht. Prüfen Sie Theme-Version und Core-Revision in `shared/ORIGIN.json` des installierten Cordova-Pakets und aktualisieren Sie das Cordova-Paket für neuere gebündelte Quellen.

## Unterstütztes Verhalten und Überprüfung

Capacitor bleibt der primär unterstützte Host. Cordova-Vergleiche umfassten Ionic 8.8.19 auf iOS 27.2 und Android API 35: Steuerelemente, Tabs, Overlays, Theme-Integration, Dunkelmodus und Stoppen/Neustarten. Die Suche verwendete auf beiden Hosts den Web-Fallback des Themes. Diese Prüfungen belegen weder Gleichwertigkeit nativer Suche noch vollständige Framework-Router-Übergänge oder interaktive Zurück-Gesten. Die Ionic-9-Capacitor-Demo dieses Repositorys ist kein Cordova-Abnahmetest.

Falls Theme-Helfer nicht mit nativen Steuerelementen zusammenarbeiten, prüfen Sie, dass alle Theme-Importe `/theme` verwenden, nur eine Native UI-Laufzeit gestartet wird und Web-Bundle sowie natives Plugin dieselbe Version nutzen. Melden Sie Bridge-, Installations- oder gebündelte Integrationsprobleme in [cordova-plugin](https://github.com/webview-native-ui/cordova-plugin/issues); gemeinsame Theme-Stil- und Animationskorrekturen gehören in dieses Repository.

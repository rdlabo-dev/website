---
title: "Das iOS-27-Theme einrichten"
sourceRevision: "2c661e490b0f5bdc897f6007f9ed5b35bec22f3ef2ab2ded123fb256dd635471"
---
# Das iOS-27-Theme einrichten

Geben Sie einer bestehenden Ionic-App in vier Schritten die iOS-27-Darstellung. Diese Anleitung verwendet ausschließlich das iOS-27-Theme und den systemgesteuerten Dunkelmodus. Für browserabhängige iOS-26/27-Stile oder MD3 verwenden Sie stattdessen [adaptive Themes](adaptive-themes.md).

## Vorbereitungen

Verwenden Sie eine bestehende Ionic-Angular-, React- oder Vue-Anwendung mit Ionic `>=8.8.1 <10`. Behalten Sie Ionics grundlegende CSS-Importe. Reine Browser-Apps benötigen kein natives Capacitor-Projekt.

## 1. Theme und Foldable installieren

```sh
npm install @rdlabo/ionic-theme-ios27 @erkamyaman/capacitor-foldable
```

[Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) ist unsere Standardintegration für den Gerätezustand. Seine APIs für Position und Faltstellung ermöglichen Ihrer App, Layoutanpassungen zu steuern; nach der Installation müssen Anfangswerte und Änderungsereignisse verbunden werden. Folgen Sie beim Einrichten des Gerätelayouts der [Layoutanleitung](vertical-bars-layout.md).

## 2. Stylesheets laden

Fügen Sie diese Importe in Ihrem globalen Stylesheet nach Ionics Basisstilen ein. Ersetzen Sie einen vorhandenen Import einer dunklen Ionic-Palette, statt mehrere Paletten zu laden:

```css
@import '@ionic/core/css/palettes/dark.system.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/md-remove-ios-class-effect.css';
@import '@rdlabo/ionic-theme-ios27/dist/css/ionic-theme-ios27-dark-system.css';
```

### Ein Dunkelmodus-Paar auswählen

Verwenden Sie genau eine zusammenpassende Ionic-Palette und Theme-Variante. Die folgenden Pfade sind relativ zu `@ionic/core/css/palettes/` beziehungsweise `@rdlabo/ionic-theme-ios27/dist/css/`.

| Modus | Ionic-Palette | Theme-Stylesheet | Aktivierung |
| --- | --- | --- | --- |
| System (Beispiel oben) | `dark.system.css` | `ionic-theme-ios27-dark-system.css` | Systemdarstellung. |
| Manuell | `dark.class.css` | `ionic-theme-ios27-dark-class.css` | `ion-palette-dark` am Dokumentstamm umschalten. |
| Immer dunkel | `dark.always.css` | `ionic-theme-ios27-dark-always.css` | Immer aktiv. |

Wenn Sie zusätzlich Native UI aktivieren, liefern diese Stile deren Kennzeichnung für helle/dunkle Darstellung. Kombinieren Sie die passende Ionic-Palette und Theme-Variante, damit Web- und native Bedienelemente übereinstimmen. Die Auflösungsreihenfolge und das Verhalten gemeinsam genutzter Seitenleisten beschreibt [Vererbung der nativen Darstellung](../../capacitor-native-ui/docs/appearance.md).

## 3. Ionic-Animationen konfigurieren

Setzen Sie diese Optionen vor dem Rendern der App in Ihrer bestehenden Ionic-Initialisierung:

```ts
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';

const ionicConfig = {
  mode: 'ios' as const,
  navAnimation: iosTransitionAnimation,
  popoverEnter: popoverEnterAnimation,
  popoverLeave: popoverLeaveAnimation,
};
```

Dieses Beispiel verwendet bewusst den Modus `ios`, damit auch Desktopbrowser das Theme anzeigen. Übergeben Sie `ionicConfig` an die bereits von Ihrer App verwendete Initialisierung:

| Framework | Optionen anwenden |
| --- | --- |
| Angular / Ionic 8 | `provideIonicAngular(ionicConfig)`, importiert aus `@ionic/angular/standalone` |
| Angular / Ionic 9 | `provideIonicAngular(ionicConfig)`, importiert aus `@ionic/angular` |
| React | `setupIonicReact(ionicConfig)`, importiert aus `@ionic/react` |
| Vue | `app.use(IonicVue, ionicConfig)` mit `IonicVue` aus `@ionic/vue` |

Führen Sie die Optionen mit vorhandenen Optionen zusammen; initialisieren Sie Ionic nicht zweimal. Um unter Android den Material-Design-Modus zu behalten, lassen Sie Ihre plattformabhängige Modusauswahl bestehen und wenden Sie die Animationsoptionen nur auf die iOS-Konfiguration an. Ein vollständiges plattformabhängiges Beispiel finden Sie unter [adaptive Themes](adaptive-themes.md).

## 4. Den ersten Bildschirm ansehen

Starten Sie den üblichen Entwicklungsserver Ihrer Anwendung und öffnen Sie eine vorhandene Seite. Fügen Sie dieses Markup innerhalb ihres `ion-content` ein; verwenden Sie dabei die Komponentensyntax Ihres Frameworks:

```html
<ion-list inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

Sie sollten eine eingerückte Gruppe mit abgerundeten Rändern sehen. Wechseln Sie die Systemdarstellung zwischen hell und dunkel und navigieren Sie anschließend zwischen Seiten, um den Theme-Übergang zu sehen. Die Listenstruktur beschreibt [ion-item-group verwenden](using-ion-item-group.md).

| Sichtbares Problem | Prüfen Sie Folgendes |
| --- | --- |
| Material-Design-Bedienelemente auf dem Desktop | Setzen Sie `mode: 'ios'` in der bestehenden Ionic-Initialisierung. |
| Ungestaltete Bedienelemente | Laden Sie das Theme-Stylesheet global nach Ionics Basisstilen. |
| Gemischte helle und dunkle Flächen | Verwenden Sie eine zusammenpassende Ionic-Palette und Theme-Dunkelmodusvariante. |
| Standardseitenübergänge | Übergeben Sie die Animationsoptionen vor der Ionic-Initialisierung. |

## Nächste Schritte

- [Stile und Komponenten anpassen](features.md).
- [Native UI hinzufügen](add-native-ui.md), um unterstützte Bedienelemente in einer Capacitor-iOS-App zu verwenden. Die Theme-Installation allein aktiviert keine nativen Bedienelemente.
- [Vertical Bars zu einem bestehenden Theme hinzufügen](../../capacitor-native-ui/docs/ionic-vertical-bars.md).
- [Eine bestehende App migrieren](migration.md).
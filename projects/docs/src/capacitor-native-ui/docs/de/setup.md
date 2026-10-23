---
title: "Native UI in einer Ionic-App einrichten"
sourceRevision: "5718436b22038cf72b95cc4b079b7eef68eb211adb4297fdd17cd8c67b67ad96"
---
# Native UI in einer Ionic-App einrichten

Behalten Sie Ihre bestehende Web-Darstellung und rendern Sie unterstützte Ionic-Bedienelemente unter iOS nativ. Diese Anleitung benötigt keine iOS-Theme-Stylesheets.

Sie verwenden bereits das iOS-27-Theme? Folgen Sie [Native UI zum Theme hinzufügen](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.1/packages/theme-ios27/docs/add-native-ui.md). Ohne Ionic folgen Sie stattdessen der [HTML-Einrichtung](framework-independent.md).

Lesen Sie zuerst die [Funktionsweise der Projektion](../README.md#how-projection-works), wenn Native UI neu für Sie ist. Diese Anleitung verbindet Ihre bestehenden Ionic-Bedienelemente mit dieser Darstellung.

## Vorbereitungen

| Anforderung | Gewöhnliche native Bedienelemente |
| --- | --- |
| Ionic | `>=8.8.1 <10` |
| Natives Projekt | Capacitor 8 mit iOS-Projekt |
| Buildwerkzeuge | Xcode 26 oder neuer |
| Gerät oder Simulator | iOS 26 oder neuer |
| Nativer Abhängigkeitsmanager | Bestehende SPM- oder CocoaPods-Integration beibehalten. |
| Vertical Bars | Siehe separate [Geräteanforderungen](vertical-bars.md#native-rendering). |

Verwendet die App noch kein Capacitor, erstellen und konfigurieren Sie vor den folgenden nativen Schritten ihr Capacitor-iOS-Projekt. Browservorschauen behalten Web-Bedienelemente und demonstrieren kein UIKit- oder SwiftUI-Rendering.

## 1. Plugin installieren

[Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) ist unsere Standardintegration für den Gerätezustand. Seine Positions- und Faltstellungs-APIs lassen Ihre App Layoutanpassungen steuern; nach der Installation müssen Anfangswerte und Änderungsereignisse verbunden werden.

Behalten Sie Ihre Capacitor-Pakete auf Version 8. Ergänzen Sie diese direkten Anwendungsabhängigkeiten:

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Der Ionic-Adapter verwendet `@ionic/core`, das Ihre Ionic-App bereits bereitstellt. Entfernen Sie Ihre bestehenden Web-Stile nicht: Sie gestalten Seiteninhalt und Fallback-Bedienelemente.

## 2. Shell aktivieren

Rufen Sie die Funktion einmal beim Anwendungsstart nach dem Einbinden von `ion-app` auf:

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const shell = await enableNativeUI();
```

Behalten Sie das zurückgegebene Handle, wenn Sie Funktionen deaktivieren oder Projektion stoppen müssen. Rufen Sie beim Auflösen der verantwortlichen Anwendungsinstanz `await shell.destroy()` auf. Starten Sie keine neue Shell pro Seite.

Vorhandenes Ionic-Markup liefert Beschriftungen, Symbole, Deaktivierungszustand und Aktionen. Beispielsweise kann eine bestehende feste Seitenkopfzeile Folgendes enthalten:

```html
<ion-header>
  <ion-toolbar>
    <ion-title>My app</ion-title>
    <ion-buttons slot="end">
      <ion-button aria-label="Add">
        <ion-icon slot="icon-only" name="add"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
```

Behalten Sie Ihren Framework-Handler an der Originalschaltfläche und registrieren Sie das Symbol wie gewohnt. Die Eignung beschreibt [unterstütztes Markup](native-ui.md#supported-markup); nicht unterstützte Bedienelemente bleiben im Web.

### Start im App-Stamm Ihres Frameworks platzieren

Verwalten Sie eine Shell für die ganze App oberhalb gerouteter Seiten. Der folgende anwendungseigene Helfer serialisiert asynchronen Start und Bereinigung, einschließlich erneuter Einbindungen im React-Entwicklungsmodus. Platzieren Sie Ihre gemeinsamen Startoptionen hier und entfernen Sie alle anderen `enableNativeUI()`-Aufrufe:

```ts
// native-ui.ts — neben Ihrer Stammkomponente ablegen
import { enableNativeUI, type NativeUIHandle } from '@rdlabo/capacitor-native-ui';
// Ohne Ionic stattdessen @rdlabo/capacitor-native-ui/core verwenden.

let lifecycle = Promise.resolve();
const report = (error: unknown) => console.error('Native UI lifecycle failed', error);

export function mountNativeUI(): () => void {
  let disposed = false;
  let shell: NativeUIHandle | undefined;
  lifecycle = lifecycle
    .then(async () => {
      if (disposed) return;
      shell = await enableNativeUI(); // Hier Ihre Optionen eintragen.
      if (disposed) await shell.destroy();
    })
    .catch(report);
  return () => {
    disposed = true;
    lifecycle = lifecycle
      .then(async () => {
        await shell?.destroy();
        shell = undefined;
      })
      .catch(report);
  };
}
```

Wählen Sie unten **ein** Framework. Der Helfer gehört zu Ihrer Anwendung; er ist kein weiteres zu installierendes Paket.

**Angular:** Nach dem ersten DOM-Rendern aus der Stammkomponente aufrufen und Bereinigung mit deren `DestroyRef` registrieren:

```ts
import { afterNextRender, DestroyRef, inject } from '@angular/core';
import { mountNativeUI } from './native-ui';

// Im Konstruktor Ihrer Stamm-AppComponent:
const destroyRef = inject(DestroyRef);
afterNextRender(() => {
  const stop = mountNativeUI();
  destroyRef.onDestroy(stop);
});
```

**React:** Einen Effekt in der Stammkomponente verwenden, die `IonApp` rendert:

```tsx
import { useEffect } from 'react';
import { mountNativeUI } from './native-ui';

// Innerhalb Ihrer App-Stammkomponente:
useEffect(() => mountNativeUI(), []);
```

**Vue:** Lebenszyklus-Hooks im `<script setup>` der Stammkomponente registrieren:

```ts
import { onMounted, onBeforeUnmount } from 'vue';
import { mountNativeUI } from './native-ui';

let stop: (() => void) | undefined;
onMounted(() => {
  stop = mountNativeUI();
});
onBeforeUnmount(() => {
  stop?.();
});
```

Diese Hooks verwalten die App-Lebensdauer, nicht einzelne Seitenübergänge. Konfigurieren Sie zusätzlich die Navigation unten.

## 3. Navigation koordinieren

Installieren Sie für optionale Ionic-Animationskoordination `@rdlabo/ionic-theme-ios27` und aktualisieren Sie Native UI gemeinsam auf übereinstimmende Versionen. Konfigurieren Sie Navigation vor Ionics Initialisierung. Der Adapter kann Ionics Standardübergänge ohne Theme-CSS beibehalten:

```sh
npm install @rdlabo/ionic-theme-ios27 @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

```ts
import { iosTransitionAnimation, mdTransitionAnimation, type AnimationBuilder } from '@ionic/core';
import { withNativeUITransition } from '@rdlabo/ionic-theme-ios27';

const defaultTransition: AnimationBuilder = (baseEl, opts) =>
  (opts.mode === 'ios' ? iosTransitionAnimation : mdTransitionAnimation)(baseEl, opts);

const ionicConfig = {
  navAnimation: withNativeUITransition(defaultTransition),
};
```

Übergeben Sie diese Option an Angulars `provideIonicAngular`, Reacts `setupIonicReact` oder Vues `IonicVue`-Optionen. Für eigene Animationen folgen Sie den [Übergangsadapter-Anweisungen](migration.md#native-ui-transition-adapter). Dieser optionale Adapter benötigt das Theme-Paket, aber weder dessen Stylesheets noch ersetzt er Ihre Animation.

Für eine reine Plugin-App verwenden Sie unten [Navigation ohne Theme](#navigation-without-the-theme). Konfigurieren Sie vor dem Navigationstest einen der Ansätze.

## 4. Erstellen, synchronisieren und ausführen

Führen Sie den Web-Build Ihrer Anwendung aus und synchronisieren Sie anschließend:

```sh
npx cap sync ios
```

Starten Sie die iOS-App aus Xcode auf einem iOS-26+-Gerät oder Simulator. Unterstützte feste Bedienelemente sollten nativ dargestellt werden und weiterhin ihre ursprünglichen Handler auslösen. Navigieren Sie vorwärts und zurück, einschließlich einer abgebrochenen Zurück-Wischgeste. Ein Browser- oder Android-Build sollte funktionierende Web-Bedienelemente behalten.

| Beobachtung | Prüfung |
| --- | --- |
| Alle Bedienelemente bleiben unter iOS im Web | Natives Paket als direkte Abhängigkeit, App synchronisiert und neu erstellt, Start auf unterstütztem OS ausgeführt. |
| Nur ein Bedienelement bleibt im Web | Markup und Stile mit [unterstützten Bedienelementen](native-ui.md#supported-markup) vergleichen. |
| Bedienelemente überlappen während Navigation | Übergangsadapter oder Suspend-/Resume-Lebenszyklus vor der Navigation konfigurieren. |
| Fehlende Stile oder Abstände | Web-CSS der App behalten; das Plugin liefert kein Seitenlayout. |

## Nächste Schritte

- [Nur Vertical Bars](ionic-vertical-bars.md): schrittweise Seitenleisteneinrichtung mit Ihrem bestehenden Theme.
- [Konfiguration](configuration.md): Bedienelemente wählen und Seitenleisteneinstellungen zur Laufzeit ändern.
- [Eigene SwiftUI- oder Compose-Inhalte](native-ui-extensions.md): eine app-lokale Erweiterung erstellen.
- [Migration](migration.md): ältere Paketnamen, Importe und native Projekte aktualisieren.

## Navigation ohne Theme

Native UI hängt weder von einem Theme noch von einem Ionic-Animationsbuilder ab. Ihr Router kann Projektion vor dem Seitenwechsel aussetzen und nach Abschluss oder Abbruch wieder aufnehmen:

```ts
const suspension = await shell.suspend();
try {
  await navigate();
} finally {
  await suspension.resume();
}
```

Das Promise muss erst nach Abschluss von DOM-Änderungen und Seitenanimationen enden, nicht bereits nach der URL-Änderung. Verbinden Sie Browser-Zurück, Gestenabbruch und programmatische Navigation mit demselben Lebenszyklus. Für Ionic verwenden Sie den obigen Übergangsadapter zur Abdeckung animierter und interaktiver Übergänge.

Für eine routerlose HTML-App ist dies ein vollständiger animierter Seitenwechsel. Eine abgebrochene Animation stellt vor der Wiederaufnahme der Projektion die alte Seite wieder her:

```ts
async function showPage(current: HTMLElement, next: HTMLElement) {
  const lease = await shell.suspend();
  try {
    current.hidden = true;
    next.hidden = false;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const animation = next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
      try {
        await animation.finished;
      } catch {
        next.hidden = true;
        current.hidden = false;
      }
    }
  } finally {
    await lease.resume();
  }
}
```

Serialisieren Sie Seitenwechsel, wenn Ihre App vor Abschluss dieses Promises weitere Navigation erlaubt. Die Quell-Klickhandler bleiben für Router oder History zuständig; das Plugin navigiert nicht für Sie.
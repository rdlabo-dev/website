---
title: "Erste Schritte"
sourceRevision: "ebdca7dec9b77896e2294742c1204f130ab59f9bdc7712695f2db591ca887145"
---
# @rdlabo/ionic-angular-kit

`@rdlabo/ionic-angular-kit` stellt typisierten Speicher, typisierte Overlays und Ionic-Signal-Forms-Adapter für Ionic-Angular-Anwendungen bereit. Produktspezifische Bildschirme, Fachregeln und Übersetzungen verbleiben in der nutzenden App.

```sh
npm install @rdlabo/ionic-angular-kit
```

## Erster Versuch: eine Einstellung speichern

Ergänzen Sie in einer vorhandenen Ionic-Angular-Anwendung den Ionic-Storage-Provider in Ihrer bestehenden App-Konfiguration. Ersetzen Sie dabei keine anderen Provider.

```ts
import { importProvidersFrom, type ApplicationConfig } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage-angular';

export const appConfig: ApplicationConfig = {
  providers: [importProvidersFrom(IonicStorageModule.forRoot({ name: '__mydb' }))],
};
```

Fügen Sie anschließend diese Standalone-Komponente hinzu:

```ts
import { Component, inject, signal } from '@angular/core';
import { IonButton } from '@ionic/angular';
import { disableHandler, KitStorageService } from '@rdlabo/ionic-angular-kit';

@Component({
  selector: 'app-preferences-demo',
  imports: [IonButton],
  template: `<ion-button type="button" (click)="disableHandler($event, save())">Save preference</ion-button><p>{{ result() }}</p>`,
})
export class PreferencesDemo {
  private readonly storage = inject(KitStorageService);
  readonly result = signal('');
  readonly disableHandler = disableHandler;

  async save(): Promise<void> {
    await this.storage.set('theme', 'dark');
    this.result.set((await this.storage.get<string>('theme')) ?? '');
  }
}
```

Zeigen Sie `<app-preferences-demo>` auf einer vorhandenen Seite an, indem Sie `PreferencesDemo` in die `imports` dieser Standalone-Seite aufnehmen. Klicken Sie auf Save preference: `dark` erscheint. `KitStorageService` initialisiert den Speicher automatisch; eine manuelle Initialisierung ist nicht erforderlich.

## Voraussetzungen

| Paket                                         | Unterstützte Version |
| ----------------------------------------------- | ----------------- |
| Angular                                         | 21.x–22.x         |
| Ionic Angular                                   | 9.x               |
| RxJS                                            | 7.8.x             |
| Capacitor Core, App, Haptics, Keyboard, Network | 7.x–8.x           |
| iOS-/iPadOS-Deployment-Ziel                    | 16.4 oder neuer     |

Das Kernpaket deklariert `@ionic/storage-angular` sowie Capacitor Core, App, Haptics, Keyboard und Network als erforderliche Peer-Abhängigkeiten. Lassen Sie kompatible Versionen installiert, auch wenn eine Anwendung nur einen Teil des Kerneinstiegspunkts verwendet. Native Anwendungen mit `/offline` müssen außerdem die zu ihrer Capacitor-Hauptversion passende Hauptversion von `@capacitor-community/sqlite` installieren und konfigurieren. Diese Abhängigkeit liegt in der Verantwortung der Anwendung und wird nicht vom Kit installiert.

Firebase, Social Login, Live Update, Preferences, Status Bar, In-App-Bewertungen sowie Drucker-/PDF-Abhängigkeiten sind optionale Peer-Abhängigkeiten für Zusatzfunktionen. Installieren Sie nur die von den gewählten sekundären Einstiegspunkten benötigten Abhängigkeiten und beachten Sie den jeweiligen Kompatibilitätsbereich des Plugins. Einige optionale Plugins unterstützen ausschließlich Capacitor 8.

## Einstiegspunkte

| Import                                    | Zuständigkeit                                                                     |
| ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `@rdlabo/ionic-angular-kit`               | Speicher, Overlays, Guards, HTTP, Echtzeitfunktionen, Direktiven, Tastatur und Hilfsfunktionen     |
| `@rdlabo/ionic-angular-kit/offline`       | **Experimentell.** Bereichsgebundenes lokales Replikat, Outbox, Pull, Wiederholung und Anfragerichtlinien |
| `@rdlabo/ionic-angular-kit/theme`         | Gespeichertes Hell-/Dunkel-Theme und Synchronisierung der nativen Statusleiste                              |
| `@rdlabo/ionic-angular-kit/forms`         | Ionic-Fehlertexte und Zustandsklassen für Angular Signal Forms                        |
| `@rdlabo/ionic-angular-kit/review`        | Gedrosselte native Anfragen für In-App-Bewertungen                                            |
| `@rdlabo/ionic-angular-kit/printer`       | Hilfen für DOM-zu-PNG, Brother-Etiketten und PDF                                         |
| `@rdlabo/ionic-angular-kit/auth-firebase` | Einbindung von Firebase-Abhängigkeiten und Authentifizierungsabläufe                                |
| `@rdlabo/ionic-angular-kit/app-update`    | Atomare Übergänge bei Angular-Service-Worker-Updates                                   |
| `@rdlabo/ionic-angular-kit/live-update`   | Provider zur Bereitschaftsprüfung für Capawesome Live Update                                          |

Sekundäre Einstiegspunkte trennen optionale native und SDK-Abhängigkeiten vom Kernbundle.

Der gesamte Einstiegspunkt `/offline` ist experimentell und fällt nicht unter die SemVer-Kompatibilitätsgarantie des Kits. Seine öffentlichen APIs, das Persistenzschema und das Synchronisierungsverhalten können sich vor der Stabilisierung auch in einem Minor- oder Patch-Release inkompatibel ändern. Verwenden Sie bei der Einführung eine exakt festgelegte Kit-Version und prüfen Sie vor jedem Upgrade die Migrationsanleitung.

## Nur benötigte Funktionen konfigurieren

Die meisten Funktionen stellen einen Provider bereit, dessen Callbacks Routen, Oberflächentexte, Zugangsdaten und anwendungsspezifische Nebenwirkungen außerhalb des Kits halten. Beginnen Sie mit [Speicher und Overlays](https://docs.rdlabo.dev/projects/ionic-angular-kit/docs/storage-overlays) und [Formularen](https://docs.rdlabo.dev/projects/ionic-angular-kit/docs/forms).

## Dokumentation

- [Speicher und Overlays](https://docs.rdlabo.dev/projects/ionic-angular-kit/docs/storage-overlays)
- [Formulare](https://docs.rdlabo.dev/projects/ionic-angular-kit/docs/forms)
- [Die Kit-Integration mit ESLint prüfen](./docs/eslint.md)
- [Authentifizierung und HTTP](https://docs.rdlabo.dev/projects/ionic-angular-kit/docs/auth-http)
- [Offline und Echtzeit](https://docs.rdlabo.dev/projects/ionic-angular-kit/docs/offline-realtime)
- [Optionale Funktionen](https://docs.rdlabo.dev/projects/ionic-angular-kit/docs/optional-features)

<!-- rdlabo-docs-omit -->

**Vollständige Dokumentation:** [https://docs.rdlabo.dev/projects/ionic-angular-kit](https://docs.rdlabo.dev/projects/ionic-angular-kit)

<!-- /rdlabo-docs-omit -->

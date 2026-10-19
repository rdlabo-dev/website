---
title: "API"
sourceRevision: "d12e7c4b43f75e518017c960d8b0f01d27802ddb6c78853d057e2559b03d8992"
---
Übersicht der öffentlichen Einstiegspunkte für `@rdlabo/ionic-angular-kit` v22.0.6. Die gezielten Anleitungsseiten beschreiben die Anforderungen an Lebenszyklus und Integration; diese Seite legt fest, welcher Paketpfad für welche API-Familie zuständig ist.

## Kern

#### `module` @rdlabo/ionic-angular-kit

| API-Familie     | Wesentliche Exporte                                                   | Anleitung                                          |
| -------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| Speicher        | `KitStorageService`, `kitClearStoragePreservingKeys`                | [Speicher und Overlays](/docs/storage-overlays) |
| Overlay        | `provideKitOverlay`, `KitOverlayController`, `KitLoadingController` | [Speicher und Overlays](/docs/storage-overlays) |
| Authentifizierung | `provideKitAuth`, Guard-Funktionen, `KitAuthAccessService`           | [Authentifizierung und HTTP](/docs/auth-http)     |
| HTTP           | `provideKitHttp`, `kitAuthInterceptor`                              | [Authentifizierung und HTTP](/docs/auth-http)     |
| Echtzeit       | `KitRealtimeConnection`, `KitRealtimeLivenessWatchdog`              | [Offline und Echtzeit](/docs/offline-realtime) |

`KitAuthLoginExchange` und `kitPreloadAuthLoginForNavigation` teilen Anmeldeanfragen beim Start. Siehe [Authentifizierung und HTTP](/docs/auth-http).

## Optionale Einstiegspunkte

#### `module` @rdlabo/ionic-angular-kit/offline

APIs für Offline-Repository, synchronisiertes Replikat, Outbox, Anfragerichtlinien, Schema, Identität und Wiederherstellung. Verwenden Sie `provideOffline` oder seine gezielten Provider-Varianten als zentralen Ort der Zusammenstellung.

`OfflineStorageLifecycle` und `OfflineStorageGenerationChangedError` verwalten ausdrücklich verwerfbare Speichergenerationen. Siehe [Offline und Echtzeit](/docs/offline-realtime).

#### `module` @rdlabo/ionic-angular-kit/offline/storage-generation

`inspectOfflineStorageGeneration` prüft Speichermarker beim Start, ohne die Offline-Laufzeit frühzeitig zu laden.

#### `module` @rdlabo/ionic-angular-kit/forms

`KitIonicFormField`, `provideKitIonicSignalForms`, `kitDefaultSignalFormErrorMessage`, `KIT_SIGNAL_FORM_ERROR_MESSAGE_RESOLVER` und `KitSignalFormErrorMessageResolver` zur Anbindung von Angular 22 Signal Forms an Ionic-Eingabeelemente. Siehe [Formulare](/docs/forms).

#### `module` @rdlabo/ionic-angular-kit/auth-firebase

Provider für Firebase-Authentifizierung und typisierte Funktionen für Anmeldung, Registrierung, Verknüpfung, erneute Authentifizierung, Verifizierung, Passwörter und Kontoaktualisierungen.

#### `module` @rdlabo/ionic-angular-kit/auth-firebase/apple

Helfer für Apple-Anmeldung und -Verknüpfung mit ihren Antwort- und Optionstypen.

#### `module` @rdlabo/ionic-angular-kit/auth-firebase/facebook

Helfer für Facebook-Anmeldung, -Verknüpfung und -Abmeldung mit ihren Antwort- und Optionstypen.

#### `module` @rdlabo/ionic-angular-kit/auth-firebase/google

Helfer für Google-Popup/native Anmeldung, Firebase-Sitzungsverknüpfung und Abmeldung mit ihren Antwort- und Optionstypen.

#### `module` @rdlabo/ionic-angular-kit/auth-firebase/social

**Veraltet, zur Kompatibilität erhalten.** Hilfsfunktionen für soziale Authentifizierung mit Apple und Facebook sowie deren Antwort- und Optionstypen. Bevorzugen Sie anbieterspezifische Einstiegspunkte; dieser kombinierte Einstiegspunkt benötigt beide Plugins.

#### `module` @rdlabo/ionic-angular-kit/app-update

`provideKitAppUpdate` und `KitAppUpdateService` für koordinierte Angular-Service-Worker-Updates.

#### `module` @rdlabo/ionic-angular-kit/live-update

`provideLiveUpdateReadiness` zur Abstimmung der Bereitschaft beim Start von Live Updates.

#### `module` @rdlabo/ionic-angular-kit/printer

Hilfsfunktionen für PDF-Layouts, DOM-zu-PNG, Vorschau, Download, Rotation, Papiergröße und Brother-Print-Einstellungen.

#### `module` @rdlabo/ionic-angular-kit/review

`kitRequestReview` und `KitRequestReviewOptions` für native Bewertungsanfragen.

#### `module` @rdlabo/ionic-angular-kit/theme

`provideKitTheme`, `KitThemeController`, `KitThemeConfig` und `KitThemeMode` für eine dauerhaft gespeicherte Theme-Auswahl.

---
title: "API"
sourceRevision: "0911987f4d59aa74b6cc1742220cef6f22d6ab16076d0b86e553ae9d09e7476f"
---
Übersicht der öffentlichen Einstiegspunkte für `@rdlabo/ionic-angular-kit` v22.0.3. Die gezielten Anleitungsseiten beschreiben die Anforderungen an Lebenszyklus und Integration; diese Seite legt fest, welcher Paketpfad für welche API-Familie zuständig ist.

## Kern

#### `module` @rdlabo/ionic-angular-kit

| API-Familie     | Wesentliche Exporte                                                   | Anleitung                                          |
| -------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| Speicher        | `KitStorageService`, `kitClearStoragePreservingKeys`                | [Speicher und Overlays](/docs/storage-overlays) |
| Overlay        | `provideKitOverlay`, `KitOverlayController`, `KitLoadingController` | [Speicher und Overlays](/docs/storage-overlays) |
| Authentifizierung | `provideKitAuth`, Guard-Funktionen, `KitAuthAccessService`           | [Authentifizierung und HTTP](/docs/auth-http)     |
| HTTP           | `provideKitHttp`, `kitAuthInterceptor`                              | [Authentifizierung und HTTP](/docs/auth-http)     |
| Echtzeit       | `KitRealtimeConnection`, `KitRealtimeLivenessWatchdog`              | [Offline und Echtzeit](/docs/offline-realtime) |

## Optionale Einstiegspunkte

#### `module` @rdlabo/ionic-angular-kit/offline

APIs für Offline-Repository, synchronisiertes Replikat, Outbox, Anfragerichtlinien, Schema, Identität und Wiederherstellung. Verwenden Sie `provideOffline` oder seine gezielten Provider-Varianten als zentralen Ort der Zusammenstellung.

#### `module` @rdlabo/ionic-angular-kit/forms

`KitIonicFormField`, `provideKitIonicSignalForms`, `kitDefaultSignalFormErrorMessage`, `KIT_SIGNAL_FORM_ERROR_MESSAGE_RESOLVER` und `KitSignalFormErrorMessageResolver` zur Anbindung von Angular 22 Signal Forms an Ionic-Eingabeelemente. Siehe [Formulare](/docs/forms).

#### `module` @rdlabo/ionic-angular-kit/auth-firebase

Provider für Firebase-Authentifizierung und typisierte Funktionen für Anmeldung, Registrierung, Verknüpfung, erneute Authentifizierung, Verifizierung, Passwörter und Kontoaktualisierungen.

#### `module` @rdlabo/ionic-angular-kit/auth-firebase/social

Hilfsfunktionen für soziale Authentifizierung mit Apple und Facebook sowie deren Antwort- und Optionstypen.

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

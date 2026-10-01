---
title: "CLI-API"
sourceRevision: "ac6612cb51c6aaa89ce55ae8d992a9c60f808d72720db50cfa7a6572695bf3f5"
---
Befehlsreferenz für `@rdlabo/ionic-angular-collect-icons` v3.0.0.

## Befehl

#### `command` npx @rdlabo/ionic-angular-collect-icons

Durchsucht Angular-Quellcode und Templates und schreibt die von der Anwendung verwendeten Ionicons standardmäßig nach `src/use-icons.ts`.

| Option               | Typ      | Beschreibung                                                                   | Standard            |
| -------------------- | --------- | ----------------------------------------------------------------------------- | ------------------ |
| **`--dry-run`**      | `boolean` | Meldet Änderungen, ohne Dateien zu schreiben.                                        | `false`            |
| **`--interactive`**  | `boolean` | Erfasst alle Optionen über Eingabeaufforderungen und ermöglicht die Prüfung des Ergebnisses.           | `false`            |
| **`--initialize`**   | `boolean` | Ergänzt die Initialisierung von `addIcons` und entfernt Registrierungen auf Komponentenebene. | `false`            |
| **`--project-path`** | `string`  | Projektverzeichnis, dessen `src`-Baum durchsucht wird.                                | aktuelles Verzeichnis  |
| **`--icon-path`**    | `string`  | Erzeugte Datei zur Symbolregistrierung.                                             | `src/use-icons.ts` |

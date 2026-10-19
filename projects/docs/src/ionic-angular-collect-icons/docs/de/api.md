---
title: "CLI-API"
sourceRevision: "c17cbbf13f8fa5a84be602a7bcd8bc69cbf8b31420f41a8124ba8482e0eb1d15"
---
Befehlsreferenz für `@rdlabo/ionic-angular-collect-icons` v3.0.2.

## Befehl

#### `command` npx @rdlabo/ionic-angular-collect-icons

Durchsucht Angular-Quellcode und Templates und schreibt die von der Anwendung verwendeten Ionicons standardmäßig nach `src/use-icons.ts`.

| Option               | Typ      | Beschreibung                                                                   | Standard            |
| -------------------- | --------- | ----------------------------------------------------------------------------- | ------------------ |
| **`--dry-run`**      | `boolean` | Meldet Änderungen, ohne Dateien zu schreiben.                                        | `false`            |
| **`--interactive`**  | `boolean` | Erfasst alle Optionen über Eingabeaufforderungen und ermöglicht die Prüfung des Ergebnisses.           | `false`            |
| **`--initialize`**   | `boolean` | Ergänzt die Initialisierung von `initializeIonicons` und entfernt Registrierungen auf Komponentenebene. | `false`            |
| **`--migrate`** | `boolean` | Bestätigt oder verwirft erkannte Quellcodemigrationen ausdrücklich; fragt in einem interaktiven Terminal nach, wenn die Option nicht gesetzt ist. | nicht gesetzt |
| **`--project-path`** | `string`  | Projektverzeichnis, dessen `src`-Baum durchsucht wird.                                | aktuelles Verzeichnis  |
| **`--icon-path`**    | `string`  | Erzeugte Datei zur Symbolregistrierung.                                             | `src/use-icons.ts` |

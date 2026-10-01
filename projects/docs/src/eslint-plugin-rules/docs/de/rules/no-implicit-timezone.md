---
title: "no-implicit-timezone"
sourceRevision: "b8296458523b26befe4cc2c022064f8a8bd2f400249262bfa1f89f6293ff3ba9"
---
# @rdlabo/rules/no-implicit-timezone

> Verhindert implizites Host-Zeitzonenverhalten beim Parsen, Erstellen und Zugreifen auf Date-Werte sowie bei Intl-Formatierung.

Cloudflare Workers verwenden UTC als lokale Host-Zeitzone. Code, der scheinbar die lokale Zeitzone eines Servers verwendet hat, kann nach einer Migration deshalb andere Kalenderdaten oder lokale Uhrzeiten liefern. Diese Regel hält solche Operationen hinter einer ausdrücklichen UTC- oder IANA-Zeitzonengrenze.

## Einzelheiten der Regel

Eine einzige Regel deckt die häufigen Umgehungsmöglichkeiten ab, damit Anwendungen nicht mehrere Date-Regeln finden und konfigurieren müssen.

| Gemeldete Operation                                                       | Stattdessen verwenden                                                                              |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `new Date(year, month, ...)`                                             | `Date.UTC(...)` für UTC oder eine zeitzonenbewusste Konvertierung lokaler Uhrzeiten                       |
| Als Funktion aufgerufenes `Date()`                                                        | Einen Zeitpunkt erstellen und ausdrücklich formatieren                                               |
| Lokale Getter/Setter wie `getDate()` und `setHours()`               | Eine Zeitzonenkonvertierung oder bei beabsichtigtem UTC die entsprechende API `getUTC*`/`setUTC*` |
| `toString()`, `toDateString()`, `toTimeString()`                         | Ausdrückliche Formatierung                                                                      |
| `Intl.DateTimeFormat` oder `Date#toLocale*` ohne ausdrückliches `timeZone` | `{ timeZone: '...' }` oder eine andere ausdrückliche Zeitzonenoption ergänzen                            |
| ISO-artige Datum-Zeit-Literale ohne `Z` oder `±HH:mm`                      | Einen Versatz ergänzen oder als zeitzonenlokale Uhrzeit parsen                              |

`toISOString()`, `toJSON()`, `getTime()`, `valueOf()`, UTC-Methoden, Epoch-Konstruktoren und reine Datumszeichenfolgen `YYYY-MM-DD` sind erlaubt. `toISOString()` ist für viele zeitpunktbezogene Verträge die korrekte Darstellung und wird bewusst nicht verboten.

Typgestütztes Linting ist erforderlich. Die Regel prüft, dass Methodenempfänger der eingebaute Typ `Date` sind. Andere Objekte mit Methoden wie `getDate()` werden daher nicht gemeldet. Bei `any`, `unknown`, dynamischen Intl-Optionen einschließlich eines dynamischen `timeZone`-Werts, Argument-Spreads unter den ersten beiden Positionen von `Intl.DateTimeFormat` / `Date#toLocale*` mit unklarer Optionsposition, dynamischen Datumszeichenfolgen, destrukturierten Methoden und gespreadeten Date-Konstruktorargumenten wird nicht geraten; sie bleiben außerhalb der statischen Analyse. Ein nachgestellter Spread nach einem festen Optionsargument wird weiterhin geprüft. Eine statische nicht leere `timeZone`-Zeichenfolge wird akzeptiert. Fehlende Optionen, `null`-Optionen und ein nicht überschattetes globales `undefined` als Options-/`timeZone`-Wert werden gemeldet.

Die Zeichenfolgenprüfung umfasst strukturell ISO-artige Literale `YYYY-MM-DD[T ]HH:mm[:ss[.fraction]]`. Sie erkennt einen fehlenden Versatz und ist kein Kalender- oder allgemeiner Datumszeichenfolgenvalidator.

## Beispiele

### Inkorrekt

```ts
const local = new Date(2026, 0, 2, 9, 0);
const day = instant.getDate();
const label = instant.toLocaleString('ja-JP');
const parsed = new Date('2026-01-02T09:00:00');
```

### Korrekt

```ts
const instant = new Date('2026-01-02T00:00:00Z');
const epoch = instant.getTime();
const iso = instant.toISOString();
const utcDay = instant.getUTCDate();
const label = instant.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
```

Bevorzugen Sie bei `@rdlabo/workers-timezone` an Geschäftskalendergrenzen `toLocalDate`, `toLocalDateTime` und `localDateTimeToInstant`.

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/no-implicit-timezone.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/no-implicit-timezone.ts)

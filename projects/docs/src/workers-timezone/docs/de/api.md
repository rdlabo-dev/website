---
title: "API"
sourceRevision: "1fbfc5bf4ba86f0be75644457954e1e7d6772bb6cec9fcafbc37052caf886674"
---
# API

Alle folgenden Exporte stammen aus `@rdlabo/workers-timezone`. `timeZone?` verwendet den initialisierten Standard oder vor der Initialisierung `Asia/Tokyo`. Fehler- und Sommerzeitverhalten beschreibt [Zeitzonen](./timezones.md).

## Konfiguration

#### `function` initializeTimezone

`initializeTimezone(config: TimezoneConfig): Readonly<TimezoneConfig>` setzt den Standard einmal.

#### `function` getTimezoneConfig

`getTimezoneConfig(): Readonly<TimezoneConfig>` gibt die aktive Konfiguration zurück.

## Konvertierungen

#### `function` toLocalDate

`toLocalDate(instant: Date, timeZone?: TimeZone): BusinessDate` gibt `YYYY-MM-DD` zurück.

#### `function` toLocalDateTime

`toLocalDateTime(instant: Date, timeZone?: TimeZone): BusinessDateTime` gibt `YYYY-MM-DD HH:mm:ss` zurück.

#### `function` localDateTimeToInstant

`localDateTimeToInstant(date: BusinessDate, time: string, timeZone?: TimeZone): Date` löst eine lokale Uhrzeit auf. Die Zeit akzeptiert `H:mm` oder `HH:mm`, optional mit Sekunden.

#### `function` startOfDay

`startOfDay(date: BusinessDate, timeZone?: TimeZone): Date` gibt den ersten Zeitpunkt des Tages zurück.

#### `function` endOfDay

`endOfDay(date: BusinessDate, timeZone?: TimeZone): Date` gibt dessen letzte ganze Sekunde zurück.

#### `function` addDays

`addDays(date: BusinessDate, days: number): BusinessDate` addiert eine ganzzahlige Anzahl von Kalendertagen.

## Weitere Kalenderhilfsfunktionen

`today(reference?: Date, timeZone?: TimeZone)` gibt ein Kalenderdatum zurück. `normalizeBusinessDate(value: string | Date | null | undefined, timeZone?: TimeZone)` gibt ein Kalenderdatum oder `null` zurück. Bevorzugen Sie für zeitpunktartige Eingaben ISO-Zeichenfolgen mit ausdrücklichem Versatz. `formatBusinessDateTime(instant, pattern?, timeZone?)` unterstützt die Tokens `YYYY`, `MM`, `DD`, `hh`, `mm`, `ss` und `S`; `DEFAULT_BUSINESS_DATETIME_PATTERN` ist `YYYY-MM-DDThh:mm:ss`. `parseBusinessDateTime(value: BusinessDateTime, timeZone?: TimeZone): Date` parst einen lokalen Wert `YYYY-MM-DD HH:mm:ss`; ein Trennzeichen `T` wird ebenfalls akzeptiert. `ageOnBusinessDate(birthDate: BusinessDate, asOfDate?: BusinessDate): number` berechnet das Alter in vollendeten Jahren. Der Referenzwert ist standardmäßig `today()`.

## Typen und Konstanten

`TIME_ZONES` enthält gebräuchliche IANA-IDs. `TimeZone` akzeptiert auch weitere unterstützte IANA-Zeichenfolgen. `TimezoneConfig` enthält `timeZone`. `BusinessDate` und `BusinessDateTime` sind Zeichenfolgenaliase, keine Laufzeitvalidatoren. `BusinessTimeZone` und `BusinessTimeConfig` sind Typaliase für die Kompatibilität. `BUSINESS_TIMEZONE` ist der ältere Tokio-Deskriptor, nicht die aktuell konfigurierte Zeitzone.

Kompatibilitätsexporte: `toBusinessDate`, `toBusinessDateTime`, `businessDateTimeInstant`, `startOfBusinessDay`, `endOfBusinessDay` und `addBusinessDays` sind Aliase der entsprechenden obigen Funktionen. `BUSINESS_TIME_ZONES`, `initializeBusinessTime` und `getBusinessTimeConfig` sind Aliase der Zeitzonenkonstanten und Konfigurationsfunktionen.

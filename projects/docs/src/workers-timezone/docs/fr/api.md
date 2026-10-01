---
title: "API"
sourceRevision: "1fbfc5bf4ba86f0be75644457954e1e7d6772bb6cec9fcafbc37052caf886674"
---
# API

Tous les exports ci-dessous proviennent de `@rdlabo/workers-timezone`. `timeZone?` utilise la valeur par défaut initialisée,
ou `Asia/Tokyo` avant l’initialisation. Consultez [Fuseaux horaires](./timezones.md) pour le traitement des erreurs et de l’heure d’été.

## Configuration

#### `function` initializeTimezone

`initializeTimezone(config: TimezoneConfig): Readonly<TimezoneConfig>` définit la valeur par défaut une seule fois.

#### `function` getTimezoneConfig

`getTimezoneConfig(): Readonly<TimezoneConfig>` renvoie la configuration active.

## Conversions

#### `function` toLocalDate

`toLocalDate(instant: Date, timeZone?: TimeZone): BusinessDate` renvoie `YYYY-MM-DD`.

#### `function` toLocalDateTime

`toLocalDateTime(instant: Date, timeZone?: TimeZone): BusinessDateTime` renvoie `YYYY-MM-DD HH:mm:ss`.

#### `function` localDateTimeToInstant

`localDateTimeToInstant(date: BusinessDate, time: string, timeZone?: TimeZone): Date`
résout une heure locale. L’heure accepte `H:mm` ou `HH:mm`, éventuellement avec les secondes.

#### `function` startOfDay

`startOfDay(date: BusinessDate, timeZone?: TimeZone): Date` renvoie le premier instant du jour.

#### `function` endOfDay

`endOfDay(date: BusinessDate, timeZone?: TimeZone): Date` renvoie sa dernière seconde entière.

#### `function` addDays

`addDays(date: BusinessDate, days: number): BusinessDate` ajoute un nombre entier de jours calendaires.

## Utilitaires calendaires supplémentaires

`today(reference?: Date, timeZone?: TimeZone)` renvoie une date calendaire.
`normalizeBusinessDate(value: string | Date | null | undefined, timeZone?: TimeZone)` renvoie une
date calendaire ou `null`. Préférez les chaînes ISO avec un décalage explicite pour les entrées représentant des instants.
`formatBusinessDateTime(instant, pattern?, timeZone?)` prend en charge les tokens `YYYY`, `MM`, `DD`, `hh`, `mm`,
`ss` et `S` ; `DEFAULT_BUSINESS_DATETIME_PATTERN` vaut `YYYY-MM-DDThh:mm:ss`.
`parseBusinessDateTime(value: BusinessDateTime, timeZone?: TimeZone): Date` analyse une valeur locale
`YYYY-MM-DD HH:mm:ss` ; le séparateur `T` est également accepté.
`ageOnBusinessDate(birthDate: BusinessDate, asOfDate?: BusinessDate): number` calcule l’âge en années
révolues ; la date de référence est `today()` par défaut.

## Types et constantes

`TIME_ZONES` contient des identifiants IANA courants. `TimeZone` accepte également d’autres chaînes IANA prises en charge.
`TimezoneConfig` contient `timeZone`. `BusinessDate` et `BusinessDateTime` sont des alias de chaîne,
pas des validateurs à l’exécution. `BusinessTimeZone` et `BusinessTimeConfig` sont des alias de types de compatibilité.
`BUSINESS_TIMEZONE` est l’ancien descripteur de Tokyo, pas le fuseau actuellement configuré.

Exports de compatibilité : `toBusinessDate`, `toBusinessDateTime`, `businessDateTimeInstant`,
`startOfBusinessDay`, `endOfBusinessDay` et `addBusinessDays` sont des alias des fonctions correspondantes ci-dessus.
`BUSINESS_TIME_ZONES`, `initializeBusinessTime` et `getBusinessTimeConfig` sont des alias des constantes de fuseau horaire
et des fonctions de configuration.

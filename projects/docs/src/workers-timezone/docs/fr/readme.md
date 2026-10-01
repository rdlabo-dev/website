---
title: "Premiers pas"
sourceRevision: "60d2c684422539fad0b404ef0516a5f272e37792e4c5abc13f274e8d43105fc6"
---
# @rdlabo/workers-timezone

Utilitaires de calendrier et d’heure locale tenant compte des fuseaux horaires pour Cloudflare Workers. Les Workers manipulent des instants UTC ;
ce package permet à l’application de choisir un fuseau horaire IANA une fois par isolate et gère l’heure d’été
lors des conversions entre instants et dates locales.

Essayez la [démonstration de conversion](/docs/quickstart). Nous recommandons d’associer la bibliothèque aux [contrôles ESLint](/docs/eslint) pour détecter les utilisations implicites du fuseau horaire.

## Installer

```sh
npm install @rdlabo/workers-timezone
```

## Démarrage rapide

```ts
import { TIME_ZONES, initializeTimezone, localDateTimeToInstant, toLocalDateTime } from '@rdlabo/workers-timezone';

initializeTimezone({ timeZone: TIME_ZONES.NEW_YORK });

toLocalDateTime(new Date('2026-07-01T13:00:00Z'));
// '2026-07-01 09:00:00'

localDateTimeToInstant('2026-07-01', '09:00:00');
// 2026-07-01T13:00:00.000Z
```

Initialisez une seule fois pendant l’évaluation du module, jamais par requête ni par locataire. Sans initialisation, la valeur par défaut
est `Asia/Tokyo` ; transmettez un fuseau explicite aux conversions pour un comportement propre à l’utilisateur.

## Documentation

- [Fuseaux horaires et dates calendaires](https://docs.rdlabo.dev/projects/workers-timezone/docs/timezones) — configuration, heure d’été et séparation avec la base de données.
- [API](https://docs.rdlabo.dev/projects/workers-timezone/docs/api) — conversions, opérations calendaires, types et noms de compatibilité.
- [Migration](https://docs.rdlabo.dev/projects/workers-timezone/docs/migration) — passage depuis le kit et changements de comportement.

Ces guides décrivent cette révision du code source. Utilisez le tag de version correspondant à la version installée.

<!-- rdlabo-docs-omit -->

## Développement

```sh
npm install
npm run typecheck
npm test
npm run build
```

## Licence

MIT

<!-- /rdlabo-docs-omit -->

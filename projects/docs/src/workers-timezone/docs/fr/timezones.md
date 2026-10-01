---
title: "Fuseaux horaires et dates calendaires"
sourceRevision: "ae712728312a984ab84b088a37db99564eb16864e55834d0f7c25ad44c893109"
---
# Fuseaux horaires et dates calendaires

Un `Date` JavaScript représente un instant. Un `BusinessDate` est une chaîne calendaire comme
`2026-07-01` ; un `BusinessDateTime` est une heure locale comme `2026-07-01 09:00:00`.
Aucune de ces chaînes ne contient de fuseau horaire. Utilisez un fuseau IANA explicite pour revenir à un instant.

## Configuration

`initializeTimezone({ timeZone })` définit la valeur par défaut d’une instance de module. Répéter le même
fuseau canonique est sans risque ; en choisir un autre déclenche une erreur. Configurez-le pendant l’évaluation du module avec
des paramètres statiques communs au déploiement. Sans initialisation, la valeur par défaut est `Asia/Tokyo`.

Pour des paramètres propres à une requête, un locataire ou un utilisateur, transmettez un fuseau sans modifier la valeur par défaut :

```ts
import { toLocalDateTime, localDateTimeToInstant } from '@rdlabo/workers-timezone';

const wallClock = toLocalDateTime(new Date('2026-07-01T13:00:00Z'), 'America/New_York');
// '2026-07-01 09:00:00'
const instant = localDateTimeToInstant('2026-07-01', '09:00:00', 'America/New_York');
// 2026-07-01T13:00:00.000Z
```

`TIME_ZONES` fournit des valeurs courantes pour l’autocomplétion, et non une liste exhaustive d’autorisations. Les autres identifiants IANA
pris en charge par l’environnement `Intl` des Workers sont acceptés et validés à l’exécution.

## Passages à l’heure d’été et à l’heure d’hiver

- Une heure locale répétée sélectionne le premier instant.
- Une heure locale sautée déclenche `RangeError`.
- `startOfDay` et `endOfDay` renvoient la première et la dernière seconde entière représentable, y compris
  les jours dont le minuit est sauté ou dont la dernière heure locale est répétée. Une date entièrement sautée déclenche une erreur.
- `addDays` modifie la date calendaire, et non un instant d’un nombre fixe de millisecondes. Un jour local
  ne dure pas nécessairement 24 heures. `endOfDay` n’est pas une borne supérieure inclusive à la milliseconde près.

Une construction calendaire invalide déclenche une erreur au lieu d’accepter le report de date de JavaScript.
`normalizeBusinessDate` renvoie `null` pour les entrées de date seule invalides.

## Séparation avec la base de données

Ce package ne configure pas MySQL. `@rdlabo/workers-mysql` possède des utilitaires indépendants de transmission au décalage fixe `+09:00` ;
modifier ici le fuseau métier ne change ni ces utilitaires, ni les options mysql2,
ni le fuseau horaire de la session MySQL. Séparez le stockage des instants des conversions calendaires destinées aux utilisateurs.

Consultez [API](./api.md) et [Migration](./migration.md).

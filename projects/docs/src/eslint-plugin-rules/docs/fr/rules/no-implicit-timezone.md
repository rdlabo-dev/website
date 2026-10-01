---
title: "no-implicit-timezone"
sourceRevision: "b8296458523b26befe4cc2c022064f8a8bd2f400249262bfa1f89f6293ff3ba9"
---
# @rdlabo/rules/no-implicit-timezone

> Empêcher le comportement implicite du fuseau de l’hôte dans l’analyse, la construction et l’accès à Date ainsi que dans le formatage Intl.

Cloudflare Workers utilise UTC comme fuseau local de l’hôte. Un code qui semblait utiliser le fuseau local d’un serveur peut donc produire d’autres dates calendaires ou heures locales après migration. Cette règle maintient ces opérations derrière une séparation explicite UTC ou fuseau IANA.

## Détails de la règle

Une seule règle couvre les échappatoires courantes ; les applications n’ont donc pas à découvrir et configurer un ensemble de règles Date.

| Opération signalée                                                       | Utiliser à la place                                                                              |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `new Date(year, month, ...)`                                             | `Date.UTC(...)` pour UTC, ou une conversion d’heure locale tenant compte du fuseau                       |
| Appel de `Date()` comme fonction                                                        | Créer un instant et le formater explicitement                                               |
| Getters/setters locaux comme `getDate()` et `setHours()`               | Une conversion de fuseau, ou l’API `getUTC*`/`setUTC*` correspondante lorsque UTC est voulu |
| `toString()`, `toDateString()`, `toTimeString()`                         | Formatage explicite                                                                      |
| `Intl.DateTimeFormat` ou `Date#toLocale*` sans `timeZone` explicite | Ajouter `{ timeZone: '...' }` ou une autre option de fuseau explicite                            |
| Littéraux de date-heure de type ISO sans `Z` ni `±HH:mm`                      | Ajouter un décalage, ou les analyser comme une heure locale d’un fuseau                              |

`toISOString()`, `toJSON()`, `getTime()`, `valueOf()`, les méthodes UTC, les constructeurs à partir d’une époque et les chaînes contenant seulement une date `YYYY-MM-DD` sont autorisés. `toISOString()` est la représentation correcte pour de nombreux contrats d’instants et n’est volontairement pas interdit.

Le lint avec informations de types est nécessaire. La règle vérifie que les destinataires des méthodes sont le `Date` natif ; les objets sans rapport possédant des méthodes comme `getDate()` ne sont donc pas signalés. `any`, `unknown`, les options Intl dynamiques (y compris une valeur `timeZone` dynamique), les spreads d’arguments dans les deux premières positions de `Intl.DateTimeFormat` / `Date#toLocale*` (où la position des options est incertaine), les chaînes de dates dynamiques, les méthodes déstructurées et les arguments de constructeur Date via spread ne font l’objet d’aucune supposition et restent hors de la couverture statique. Un spread final après un argument d’options fixe reste vérifié. Une chaîne `timeZone` statique non vide est acceptée ; les options absentes, les options `null` et la valeur globale `undefined` non masquée pour les options ou `timeZone` sont signalées.

La vérification des chaînes couvre les littéraux de structure ISO `YYYY-MM-DD[T ]HH:mm[:ss[.fraction]]`. Elle détecte l’absence de décalage ; ce n’est ni un validateur de calendrier ni un validateur général de chaînes de dates.

## Exemples

### Incorrect

```ts
const local = new Date(2026, 0, 2, 9, 0);
const day = instant.getDate();
const label = instant.toLocaleString('ja-JP');
const parsed = new Date('2026-01-02T09:00:00');
```

### Correct

```ts
const instant = new Date('2026-01-02T00:00:00Z');
const epoch = instant.getTime();
const iso = instant.toISOString();
const utcDay = instant.getUTCDate();
const label = instant.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
```

Pour `@rdlabo/workers-timezone`, préférez `toLocalDate`, `toLocalDateTime` et `localDateTimeToInstant` aux limites du calendrier métier.

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/no-implicit-timezone.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/no-implicit-timezone.ts)

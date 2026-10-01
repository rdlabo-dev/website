---
title: "Premiers pas"
sourceRevision: "5db1ec860d9abfb95cac70d42596928a725515dd0b1c36d183444b8b4db3fa97"
---
# @rdlabo/eslint-plugin-rules

<!-- rdlabo-docs-omit -->

[![Version npm](https://badge.fury.io/js/%40rdlabo%2Feslint-plugin-rules.svg)](https://badge.fury.io/js/%40rdlabo%2Feslint-plugin-rules)
[![Licence : MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- /rdlabo-docs-omit -->

Conventions de code partagées pour les applications Angular et Ionic, avec des presets TypeScript indépendants du framework pour Cloudflare Workers. Détectez au lint les incohérences de responsabilités des composants, d’usage des modèles et d’opérations implicites de fuseau horaire, avant la revue de code.

[Essayez la détection et la correction automatique du lint](./docs/quickstart.md) dans un petit projet TypeScript, sans installer Angular ni Ionic.

## Installer

Installez le plugin comme dépendance de développement dans un projet ESLint :

```sh
npm install --save-dev @rdlabo/eslint-plugin-rules
```

Pour les règles Angular et Ionic, installez également les dépendances pair des frameworks correspondants ci-dessous. Pour une configuration complète, suivez [Configuration](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration).

## Prérequis

| Package                           | Version prise en charge             |
| --------------------------------- | ----------------------------- |
| Node.js                           | 20 ou ultérieur                   |
| ESLint                            | 9 ou ultérieur                    |
| `@typescript-eslint/utils`        | 8.33 ou ultérieur, avant 9       |
| `@angular-eslint/template-parser` | 21.x ou 22.x                  |
| `@ionic/angular`                  | 9.x lorsque les règles Ionic sont utilisées |
| `@ionic/core`                     | 9.x lorsque les règles Ionic sont utilisées |

## Choisir un point d’entrée

| Preset                         | Point d’entrée                              | Objectif                                                |
| ------------------------------ | ---------------------------------------- | ------------------------------------------------------ |
| `recommended`                  | `@rdlabo/eslint-plugin-rules`            | Conventions Angular et Ionic pour TypeScript et HTML  |
| `workers/recommended`          | `@rdlabo/eslint-plugin-rules/typescript` | Politique Workers `try/catch` à activer explicitement                      |
| `workers-timezone/recommended` | `@rdlabo/eslint-plugin-rules/typescript` | Politique complémentaire à `@rdlabo/workers-timezone`, à activer explicitement |

Le preset Angular `recommended` est fourni à la racine du package. Les deux presets Workers s’activent séparément via `/typescript` ; aucun n’inclut l’autre. Pour les conversions et vérifications de fuseaux horaires, associez-le à [`@rdlabo/workers-timezone`](https://docs.rdlabo.dev/projects/workers-timezone/docs/readme). Les sélecteurs Flat Config et la structure des listes Ionic figurent dans [Configuration](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration).

## Documentation

- [Configuration](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration) — reprenez une configuration pour Angular/Ionic, TypeScript ou Workers.
- [Règles](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/rules) — comparez la couverture des presets, les options et les exemples.
- [Guide de migration](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/migration) — mettez à jour une installation existante.

<!-- rdlabo-docs-omit -->

**Documentation complète :** [https://docs.rdlabo.dev/projects/eslint-plugin-rules](https://docs.rdlabo.dev/projects/eslint-plugin-rules)

## Soutenir ce projet

Ce projet vous est utile ? Votre soutien contribue à sa pérennité et à son développement. Le sponsoring participe directement aux nouvelles fonctionnalités, aux améliorations et à la maintenance.

[Devenir sponsor](https://github.com/sponsors/rdlabo)

## Canaux de préversion

Une pull request ouverte et non brouillon peut être publiée sous le dist-tag npm `beta` après la réussite de ses workflows `CI` et `Package Candidate`. Un propriétaire ou mainteneur du dépôt doit ajouter un commentaire dont le contenu intégral est :

```text
/beta
```

La demande autorise uniquement le SHA de tête de la pull request présent au moment de l’ajout du commentaire. Le workflow vérifie de nouveau l’autorisation du propriétaire ou mainteneur et le SHA de tête juste avant la publication. Chaque nouveau commit exige une nouvelle réussite de la CI et un nouveau commentaire `/beta` d’un propriétaire ou mainteneur. Les pull requests issues de forks sont prises en charge. Celles qui modifient un workflow conditionnant les versions ne peuvent pas être publiées en bêta avant l’intégration de ces changements dans `main`.

Les versions bêta utilisent `<base>-beta.pr<PR number>.sha<12-character SHA>`. Le candidat est construit dans un workflow en lecture seule sans identifiants de publication npm. Le workflow de publication privilégié publie uniquement l’artefact de package immuable validé, avec les scripts de cycle de vie désactivés. Un échec de notification ne peut pas invalider une publication npm réussie.

Lorsqu’une pull request est fusionnée dans `main`, elle est automatiquement publiée sous `beta` uniquement après la réussite de la CI requise et de `Package Candidate` pour ce commit de fusion exact. Les pushes directs vers `main` ne publient pas de candidat.

Seul `npm run release` crée un tag de version. Les tags stables `vX.Y.Z` sont publiés sous npm `latest` ; les tags de révision ou de préversion sont publiés sous `next`. Ni les publications `beta` ni les publications `next` ne modifient le dist-tag npm `latest`.

## Mainteneurs

- [rdlabo](https://rdlabo.dev/)

## Licence

Ce projet est distribué sous licence MIT. Consultez le fichier [LICENSE](./LICENSE) pour les détails.
<!-- /rdlabo-docs-omit -->

---
title: "Premiers pas"
sourceRevision: "bf76807958489fc2814887796606cf9f043ec69331351cfa7d64884ea3e528cd"
---
# @rdlabo/ngx-cdk-scroll-strategies

> Défilement virtuel Angular CDK avec des éléments de hauteur variable et dynamique.

`@rdlabo/ngx-cdk-scroll-strategies` est une stratégie de défilement virtuel Angular CDK pour les listes dont les éléments ont des hauteurs variables. Elle permet de fournir la taille exacte en pixels de chaque élément au lieu d’imposer un `[itemSize]` fixe à toute la liste.

Utilisez `[itemDynamicSizes]` avec les hauteurs connues ou mesurées des éléments. Contrairement à la stratégie expérimentale `[autosize]`, cette bibliothèque n’estime pas la taille des éléments non mesurés à partir d’une moyenne. Elle fonctionne avec `@angular/cdk/scrolling` et ne dépend pas d’Ionic.

## Installation

```bash
npm install @rdlabo/ngx-cdk-scroll-strategies
```

Suivez ensuite [Utilisation simple](https://docs.rdlabo.dev/projects/ngx-cdk-scroll-strategies/docs/simple) pour créer un viewport complet avec des hauteurs connues.

Chaque élément de données doit avoir une entrée `itemDynamicSizes` correspondante, dans le même ordre. Chaque `itemSize` doit être un nombre fini strictement positif. Si Angular met à jour les signaux des données et des tailles dans des tours d’exécution différents, la stratégie conserve la dernière géométrie complète jusqu’à ce que leurs longueurs correspondent ; elle n’estime jamais les hauteurs inconnues.

## Quand utiliser cette stratégie

Utilisez cette bibliothèque lorsque :

- les éléments ou les lignes de la liste ont des hauteurs différentes ;
- les hauteurs dynamiques des éléments peuvent être calculées à partir des données ou mesurées sur les composants rendus ;
- `scrollToIndex` et les positions de défilement doivent utiliser une géométrie exacte à hauteur variable ; ou
- une interface de chat nécessite un défilement virtuel inversé.

Si la hauteur d’un élément n’est pas connue à l’avance, mesurez-la et transmettez le résultat comme indiqué dans [Utilisation avancée](https://docs.rdlabo.dev/projects/ngx-cdk-scroll-strategies/docs/advanced). Cette stratégie ne détecte pas automatiquement toutes les hauteurs DOM inconnues sans adaptation.

Cette bibliothèque repose en grande partie sur [le défilement virtuel de contenu à hauteur variable avec Angular](https://dev.to/georgii/virtual-scrolling-of-content-with-variable-height-with-angular-3a52).

## Choisir selon l’objectif de défilement

| Objectif | Guide |
| --- | --- |
| Définir la hauteur de chaque élément | [Utilisation simple](https://docs.rdlabo.dev/projects/ngx-cdk-scroll-strategies/docs/simple) |
| Mesurer les composants des éléments | [Utilisation avancée](https://docs.rdlabo.dev/projects/ngx-cdk-scroll-strategies/docs/advanced) |
| Défilement inversé de type chat | [Défilement inversé](https://docs.rdlabo.dev/projects/ngx-cdk-scroll-strategies/docs/reverse) |

<!-- rdlabo-docs-omit -->
**Documentation complète :** [https://docs.rdlabo.dev/projects/ngx-cdk-scroll-strategies](https://docs.rdlabo.dev/projects/ngx-cdk-scroll-strategies)
<!-- /rdlabo-docs-omit -->

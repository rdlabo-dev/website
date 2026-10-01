---
title: "FAQ"
sourceRevision: "4325f749560a0e1bd0048508f9fd931bdcfd01139efe772d0e2731e1629b0dba"
---
### Le défilement virtuel Angular CDK prend-il en charge les hauteurs variables ou dynamiques des éléments ?

La stratégie standard `[itemSize]` suppose que tous les éléments ont la même taille fixe. Utilisez la directive `[itemDynamicSizes]` de cette bibliothèque pour fournir une hauteur connue ou mesurée différente à chaque élément.

### Quelle est la différence avec la stratégie `autosize` ?

La stratégie `autosize` d’Angular CDK Experimental mesure les éléments rendus et estime ceux qui ne le sont pas à partir de la taille moyenne. `[itemDynamicSizes]` calcule les plages et les décalages de défilement à partir des tailles individuelles fournies par votre application.

https://github.com/angular/components/blob/main/src/cdk-experimental/scrolling/auto-size-virtual-scroll.ts#L49C3-L59

Lorsque la hauteur de chaque élément est connue ou peut être mesurée après le rendu, cette méthode évite les estimations moyennes et conserve une géométrie de défilement virtuel exacte.

### Cette bibliothèque définit-elle une hauteur dynamique sur `cdk-virtual-scroll-viewport` lui-même ?

Non. Cette bibliothèque gère les hauteurs variables des éléments à l’intérieur du viewport. Définir la hauteur ou la `max-height` du conteneur viewport en fonction de son contenu est un problème distinct.

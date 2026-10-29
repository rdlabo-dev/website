---
title: "Intention de présentation observable"
sourceRevision: "d47c8e0c2eb605531d72341cf829aff9f2b02390a6100655826e23108bb3e001"
---
# Observer l’état de projection

L’état de projection indique **où le composant doit être présenté**. Il est indépendant de sa valeur, telle que l’état coché d’un interrupteur ou l’onglet sélectionné. Consultez les [liaisons de valeurs](../configuration/values.md) pour cette connexion.

Par exemple, une barre d’onglets reste masquée de façon inattendue après la fermeture d’une modale. Inspectez cet attribut pour distinguer une demande `web` persistante d’une demande `native` dont la restauration est encore en attente. Il aide à diagnostiquer le choix de propriété ; il n’autorise pas à révéler la barre ou à supprimer son image prématurément.

Un enregistrement `NativeUIProjection` fondé sur un sélecteur écrit l’attribut en lecture seule `data-native-ui-destination` sur son conteneur DOM actuel :

| Valeur | Signification |
| --- | --- |
| `native` | Une présentation native est demandée. |
| `web` | Une présentation Web est demandée, explicitement ou parce qu’une superposition enregistrée couvre le conteneur. |
| `none` | Aucune présentation n’est demandée. |

Sans notification préalable de destination, le démarrage déduit l’intention initiale de la visibilité de la vue native ; une vue masquée ou absente commence en `none`. Les événements de projection du plugin sélectionnent ensuite `native`, `web` ou `none`. La couverture par une superposition change en Web une demande autrement native ; elle ne remplace pas un `none` explicite. L’Engine actualise l’attribut pendant la réconciliation de la présentation et le supprime lorsque le conteneur est remplacé ou l’enregistrement détruit. Réservez cet attribut à l’Engine au lieu de le définir depuis le code applicatif.

Il s’agit de l’**intention** de présentation, pas d’une confirmation qu’une frame native ou une image a terminé son dessin. La présentation Web peut utiliser une image native mise en cache ou le repli interactif existant, selon leur disponibilité et la politique de l’intégration. Ne masquez pas le repli au seul motif que cet attribut indique `native` : le transfert de l’Engine conserve la représentation précédente jusqu’à ce que la suivante soit prête.

Utilisez cet attribut pour le diagnostic et l’état applicatif qui ne prend pas le contrôle de la visibilité. Continuez d’utiliser les événements de projection documentés pour demander un changement. Consultez le [contrat de projection](projection.md#projection-contract) pour les règles de propriété, de repli et d’interaction. Les attributs internes d’instantané ne constituent pas des API publiques d’état supplémentaires.

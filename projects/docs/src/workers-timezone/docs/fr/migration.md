---
title: "Migration"
sourceRevision: "de9dd1781ec167db1c8164d0ecb74a96278ca0e25147df9959b5fcc62464ce2e"
---
# Migration

À partir du kit `0.12.0`, `@rdlabo/workers-hono-kit/business-time` est une réexportation obsolète de ce
package. Installez directement `@rdlabo/workers-timezone` et changez le chemin d’importation. Les noms de fonctions existants
restent disponibles ; le nouveau code peut utiliser `toLocalDateTime`, `localDateTimeToInstant` et les autres
noms indépendants du fuseau horaire dans l’[API](./api.md).

## Changements de comportement

La valeur par défaut reste `Asia/Tokyo`, mais la compatibilité ne garantit pas une sortie identique pour toutes les entrées :

- La conversion utilise les décalages historiques IANA plutôt qu’un `+09:00` fixe. Les dates historiques de Tokyo peuvent
  donc produire des résultats différents.
- Les valeurs de date seule invalides sont normalisées en `null` ; une construction date-heure invalide déclenche `RangeError`
  au lieu de se reporter sur un autre mois.
- Les chevauchements d’heure d’été choisissent la première occurrence ; les heures locales sautées et les dates entièrement sautées déclenchent une erreur.

Considérez ces différences comme des changements de comportement incompatibles lors d’une migration depuis l’ancienne implémentation à décalage fixe.
Testez les dates historiques et les limites de validation avant le déploiement. L’importation de compatibilité partage
le même module sous-jacent ; ce n’est pas un emplacement de configuration de fuseau distinct.

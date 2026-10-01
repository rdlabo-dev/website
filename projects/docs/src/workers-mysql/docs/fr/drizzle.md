---
title: "Drizzle et dates"
sourceRevision: "cb2864278489e406bf537d9e3209860bdf658959ef22aa45d90844ab560a8d42"
---
# Drizzle et dates

Installez `drizzle-orm` si vous importez `/drizzle` ou `/testing`. Cette dépendance homologue facultative garantit que
l’application et ses schémas utilisent la même identité de type Drizzle. Assurez-vous qu’une seule copie est résolue,
en particulier avec des liens vers des packages locaux. L’importation racine ne charge pas Drizzle.

L’application gère les définitions de schéma et crée l’ORM. `DRIZZLE_ORM_OPTIONS` fournit
`casing: 'snake_case'` ; `workersDrizzleConfig` applique le même réglage à la configuration Drizzle Kit.
Ne changez pas la casse d’un schéma existant sans examiner le SQL généré.

## Valeurs de connexion par défaut

`hyperdriveConnectionOptions` définit `disableEval: true`, `decimalNumbers: true` et
`timezone: '+09:00'`. `createHyperdriveDatabase` accepte des remplacements via `connectionOptions`.
Gardez eval désactivé dans Workers. La conversion numérique des DECIMAL peut perdre de la précision ; utilisez
`decimalNumbers: false` et traitez les valeurs comme des chaînes lorsqu’une précision décimale exacte est requise.

## Le JST fixe est un contrat de stockage

`MYSQL_TIMEZONE` est fixé à `+09:00`, indépendamment de la configuration de `@rdlabo/workers-timezone` et
des décalages historiques IANA. Il contrôle la conversion des valeurs JavaScript `Date` par mysql2, et non le
`time_zone` de la session MySQL. Les valeurs `CURRENT_TIMESTAMP` générées par le serveur suivent le fuseau horaire
de la session : vérifiez-le séparément par rapport à votre convention de stockage.

`jstTimestamp` et `jstDatetime` fournissent des types de colonnes laissant passer les Date. `jstDate` normalise
les entrées DATE via `toJstDate`. Ces utilitaires ne configurent pas le serveur et n’automatisent pas le stockage
dans un fuseau quelconque. Les déploiements hors JST doivent choisir des comportements de colonne et de connexion cohérents
plutôt que supposer que ces utilitaires suivent le fuseau métier.

`toJstDate` laisse passer une chaîne déjà au format `YYYY-MM-DD` sans valider la date
calendaire. Validez séparément les entrées utilisateur ; cette fonction n’équivaut pas au traitement plus strict des fuseaux horaires par
`normalizeBusinessDate`.

Pour les horodatages de mise à jour, `jstOnUpdateNow(fsp?)` fournit l’expression SQL utilisée avec
`.$onUpdateFn(() => jstOnUpdateNow(6))`. Examinez les migrations générées et le fuseau horaire du serveur.

Consultez [Environnement d’exécution](./runtime.md), [Outils](./tooling.md) et [API](./api.md).

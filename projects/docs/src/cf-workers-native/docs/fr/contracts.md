---
title: "API des contrats de fonctionnalités"
sourceRevision: "2abd218820f51c815c80bce214eb40a5d2aaa32afe36c5e8b4db1c673bb791be"
---

# API des contrats de fonctionnalités

L’unité de compatibilité est un **profil nommé et typé**, et non une classe de base par catégorie d’API. Un profil relie son type d’API, ses cas de comportement déclarés, ses implémentations et ses tests. Une implémentation peut être locale, déléguée ou fournie par workerd sans modifier l’exécuteur de contrats.

Le socle comporte trois parties :

| Partie | Responsabilité |
| --- | --- |
| `Feature<ID, API, Case>` | Identité immuable et noms de cas ; préserve la forme de l’API native |
| `FeatureImplementation<Feature>` | API d’implémentation requise et couverture explicite de chaque cas |
| `openFeature` / `runContract` | Annulation de la configuration en cas d’échec, nettoyage par portée, nouvelle portée par cas et résultats structurés |

`FeatureImplementation` est une classe abstraite, mais l’état du cycle de vie appartient à l’hôte, pas à la sous-classe. Les implémentations définissent `create(scope)` ; elles ne peuvent pas redéfinir les fonctions d’initialisation ou de nettoyage de l’hôte. Les classes et méthodes de l’API retournée ne sont pas restreintes. Il n’existe ni protocole générique `execute(name, args)`, ni registre global, ni exécuteur distinct pour les bindings et les capacités du moteur.

## Ajouter une fonctionnalité

```ts
import {
  defineFeature,
  FeatureImplementation,
  openFeature,
  type FeatureScope,
} from "cf-workers-native/shared/contracts";
import {
  runContract,
  assertContract,
  type ContractSuite,
} from "cf-workers-native/shared/contracts/testing";

interface TextAPI {
  read(key: string): Promise<string | null>;
}
const text = defineFeature<TextAPI>()("example.text", ["missing"]);

class MemoryText extends FeatureImplementation<typeof text> {
  constructor() {
    super(text, { missing: { status: "supported" } });
  }
  create(scope: FeatureScope): TextAPI {
    const values = new Map<string, string>();
    scope.defer(() => values.clear());
    return { read: async (key) => values.get(key) ?? null };
  }
}

const contract: ContractSuite<typeof text> = {
  feature: text,
  cases: {
    async missing(api) {
      if ((await api.read("absent")) !== null) throw new Error("Expected null");
    },
  },
};
assertContract(await runContract(new MemoryText(), contract));

// Le même hôte peut être utilisé indépendamment des tests.
const session = await openFeature(new MemoryText());
try {
  await session.api.read("key");
} finally {
  await session.dispose();
}
```

L’implémentation détermine le type d’API ; l’appelant ne peut pas choisir un type de résultat sans rapport pour `openFeature`. La suite doit porter la même définition de fonctionnalité. Les tests négatifs à la compilation dans `tests/types/features.ts` couvrent les opérations manquantes, les arguments/résultats erronés, les cas manquants/inventés et une identité de fonctionnalité différente. La commande de vérification des types les contrôle avec `@ts-expect-error` ; supprimer une erreur nécessaire fait échouer le build. Les contrôles à l’exécution rejettent aussi les objets de fonctionnalité incompatibles et les couvertures incomplètes. Comme pour les autres API TypeScript, `any` ou des conversions explicites non sûres peuvent contourner les garanties statiques.

Exportez une seule définition par profil et importez-la partout. Les identifiants doivent décrire un périmètre stable ; changez l’identifiant lorsque le contrat évolue de manière incompatible. Les noms des cas du profil représentent des garanties comportementales, pas nécessairement des noms de méthodes. Le profil doit documenter ce qu’il **ne démontre pas**. Réussir un petit sous-ensemble ne démontre jamais la compatibilité avec l’ensemble du service Workers.

## Durée de vie et prérequis

`create` peut être synchrone ou asynchrone. Enregistrez immédiatement chaque ressource possédée avec `scope.defer`, y compris avant d’attendre une configuration susceptible d’échouer. L’hôte annule une configuration partielle et libère les sessions réussies dans l’ordre inverse d’enregistrement. Il tente chaque nettoyage même si l’un échoue, et les libérations répétées partagent la même promesse. L’arrêt de la fonctionnalité annule `scope.signal` avant le nettoyage. Les erreurs d’initialisation et de nettoyage sont conservées dans un AggregateError lorsqu’elles surviennent toutes deux.

Une portée de fonctionnalité n’est ni une portée de requête ni une durée de vie des données. N’enregistrez pas pour nettoyage des connexions de base de données possédées ailleurs, sauf transfert explicite de propriété. Les fournisseurs de tests persistants doivent utiliser leur propre espace de noms isolé et enregistrer son nettoyage ; une nouvelle portée ne peut pas, à elle seule, réinitialiser un service externe. Les implémentations doivent retourner une API préparée indépendamment pour chaque appel à `create`.

Les prérequis sont des contrôles exécutables dans `create`, pas des chaînes dans un registre de capacités non vérifié. Lancez `FeatureUnavailable` si une capacité requise de l’environnement est absente. L’exemple de moteur vérifie `WebAssembly.validate`. Il détecte la disponibilité et valide un profil comportemental restreint ; il ne fournit ni n’émule V8.

`openFeature` attend l’initialisation avant d’exposer une session. Il n’ajoute ni annulation avant initialisation, ni échéance, ni annulation arbitraire d’opérations. Les implémentations sont responsables de l’aboutissement du démarrage et de leurs opérations ; les délais maximaux du framework de test restent pertinents. La libération d’une fonctionnalité ne révoque pas de manière générique les objets d’API conservés. L’annulation des requêtes et le streaming restent à la charge du transport fetch.

## Résultats et règles de CI

`runContract` prépare une nouvelle portée pour chaque cas pris en charge, exécute son assertion et effectue toujours le nettoyage. Les résultats contiennent l’identifiant de fonctionnalité, les identifiants stables des cas, le statut et le motif, ainsi que les échecs de nettoyage.

- `passed` : l’attente déclarée est satisfaite.
- `failed` : la configuration ou l’assertion a échoué ; les échecs de nettoyage font aussi échouer le rapport.
- `unsupported` : explicitement hors de la couverture déclarée de cette implémentation, avec un motif obligatoire. Le cas n’est pas exécuté et n’est jamais compté comme réussi.
- `unavailable` : une capacité requise de l’environnement est absente. Un cas déclaré pris en charge dans cet état échoue à la vérification.

`assertContract` rejette les cas failed/unavailable, les échecs de nettoyage et les rapports sans aucun cas réussi. Un profil partiel peut contenir des entrées explicitement non prises en charge ; une CI exigeant une couverture complète doit en outre vérifier que tous les statuts sont `passed`, comme dans la démo. Modifier la couverture est un changement de périmètre soumis à revue, pas un moyen de masquer un cas en échec. Vitest et Playwright restent les exécuteurs de tests ; la couche commune ne dépend d’aucun framework de test.

## FetchRuntime

`FetchRuntime` est exporté depuis `cf-workers-native/capacitor` pour les adaptateurs d’exécution personnalisés. Les sous-classes implémentent `dispatch(request, env, ctx)` et peuvent redéfinir `ready` et `close(): void | Promise<void>` pour le démarrage et le nettoyage des ressources possédées. La construction ne modifie pas le fetch global ; appelez directement la méthode `fetch` liée. Conservez les méthodes héritées `fetch`, `drain` et `dispose` pour partager limites d’URL, annulations, validation des réponses, normalisation HEAD et nettoyage. `drain` suit le travail en arrière-plan, pas la consommation des corps de réponse. La destruction directe ne peut pas arrêter de force un gestionnaire arbitraire.

Utilisez `workersCapacitor` pour configurer l’application. Les contrats Fetch et KV réutilisables sont exportés depuis `cloudflare/workers/testing` et `cloudflare/bindings/kv/testing` sous le nom du paquet. Les fournisseurs de tests KV doivent isoler et nettoyer leur propre espace de noms ; créer une nouvelle portée ne vide pas le stockage persistant.

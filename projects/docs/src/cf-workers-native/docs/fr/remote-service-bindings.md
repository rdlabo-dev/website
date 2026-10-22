---
title: "Acheminement distant des bindings de services"
sourceRevision: "de0a93fe79897195ebe6ca890158ab77d1b318b2dde7d93619ff17cc28cd532d"
---

# Acheminement distant des bindings de services

## Unité et statut

L’unité est l’envoi HTTP généré à la compilation du gestionnaire fetch d’un Worker existant lorsqu’il utilise R2, KV configuré distant, Service Bindings ou des producteurs Queue. Les requêtes utilisant seulement KV accèdent au stockage local uniquement si leur route est sélectionnée pour exécution locale et si la politique du binding est locale. Les méthodes de bindings distants s’exécutent sans modification dans le Worker déployé. Cela n’installe ni R2 local, ni synchronisation KV, ni proxy RPC client, ni consommateur de queue dans Capacitor.

La base d’intégration workerd est Miniflare `5.20261012.0-beta`, avec la date de compatibilité `2026-10-01`. L’intégration navigateur apporte des éléments de vérification, pas une certification du transport natif.

Consultez les [bindings Cloudflare supplémentaires et ASSETS distant](cloudflare-bindings.md) pour Durable Objects, AI, Workflows, les noms distants génériques et les politiques d’exécution des ressources.

## Configuration

Utilisez le point d’entrée Worker existant et sa configuration Wrangler avec le plugin Vite ou esbuild :

```ts
workersCapacitorPlugin({
  worker: "src/worker.ts",
  execution: [{ method: "*", path: "/settings/*" }],
  kvExecution: { SETTINGS: "local", SHARED: "remote" },
});
```

L’exemple suppose des enregistrements `/settings/` existants dont l’implémentation et les dépendances conservées peuvent être distribuées. Adaptez la sélection à l’application ; consultez la [configuration de l’exécution](cloudflare-bindings.md#choosing-execution).

Le compilateur découvre `r2_buckets[].binding`, `kv_namespaces[].binding`, `services[].binding` et `queues.producers[].binding`, y compris les environnements Wrangler nommés. JSON, JSONC et TOML sont pris en charge. Les bindings D1 et Hyperdrive existants restent pris en charge. Seuls les noms entrent dans l’analyse du build : les identifiants de ressources, identifiants d’accès et chaînes de connexion ne sont pas de la configuration client à l’exécution.

Pour des emplacements de configuration non standard, fournissez `workerConfig`. Les tableaux explicites `r2Bindings`, `kvBindings`, `serviceBindings` et `queueBindings` remplacent la découverte uniquement pour leur type. Avec une sélection par tableau ou l’exécution locale du Worker entier, définissez `kvExecution` sur `local` ou `remote` pour chaque nom KV découvert ou explicitement listé. Politiques absentes, noms inconnus et valeurs invalides font échouer la compilation. L’exécution réseau par défaut conserve toutes les requêtes distantes et les politiques KV distantes. `kvBindings` liste les noms, tandis que `kvExecution` choisit leur emplacement. R2, Service Bindings, producteurs Queue, D1 et Hyperdrive nécessitent le serveur. Un nom partagé entre KV et un binding serveur reste réservé au serveur.

Le lieu d’exécution détermine l’instance du binding :

- Une route explicitement sélectionnée, exécutable localement et utilisant seulement KV avec des bindings `local` utilise `env` du runtime. Les routes non sélectionnées restent distantes.
- Une route utilisant seulement KV et au moins un binding KV `remote` est envoyée au Worker existant. Toutes les opérations de cette requête utilisent l’environnement distant.
- Une route utilisant R2 et KV est envoyée comme une seule requête. Les deux bindings s’exécutent sur le Worker d’origine avec KV cloud. Aucune partie de ce gestionnaire ne s’exécute localement.
- Le repli prudent du Worker entier exécute toutes les routes à distance, y compris celles utilisant seulement KV. Consultez le rapport de compilation pour cette décision.

Fournissez le KV local via l’API de fonctionnalités existante, avec le même nom de binding que Wrangler. Le build découvre les noms, pas les instances de stockage de l’appareil. Une configuration `env` manquante ne bascule pas silencieusement vers le KV cloud. Il n’existe pas de synchronisation cloud/appareil. `localBindings` reste disponible pour les autres bindings locaux explicitement fournis ; KV utilise plutôt `kvExecution`. Déclarer un nom KV distant dans `localBindings` est une erreur de build. Une politique `local` permet l’exécution locale mais ne prévaut pas sur une autre dépendance serveur ni sur le repli du Worker entier.

```ts
import { openFeature } from "cf-workers-native/shared/contracts";
import { LocalStorageKV } from "cf-workers-native/cloudflare/bindings/kv";
const kv = await openFeature(new LocalStorageKV("my-app-settings"));
// Passer env: { SETTINGS: kv.api } à workersCapacitor ; SETTINGS doit correspondre au nom dans Wrangler.
// À l’arrêt : await runtime.dispose(); await kv.dispose();
```

Les bindings contenant des fonctions utilisent l’exécution directe même avec `prefer: "worker"`. C’est le [contrat d’exécution KV locale](kv.md) existant, pas du RPC de bindings dans un Dedicated Worker. Les requêtes distantes sont toujours sélectionnées avant l’exécution locale et utilisent les bindings propres au Worker déployé, jamais l’instance `env` locale.

```ts
const runtime = workersCapacitor({
  baseURL: "https://local.invalid/",
  prefer: "worker", // un env local contenant des fonctions sélectionne l’exécution directe
  env: { SETTINGS: kv.api }, // utiliser le nom de binding déclaré dans Wrangler
  remote: {
    origin: "https://your-existing-worker.example",
    getToken: () => existingSession.accessToken,
    maxBufferedBodyBytes: 8 * 1024 * 1024,
  },
});
```

Les requêtes sélectionnées rejoignent cette origine avec chemin, query, méthode et corps originaux avant toute exécution locale. Les routes indépendantes explicitement autorisées peuvent rester locales. Si la sûreté de la séparation ne peut pas être prouvée, tout le Worker est envoyé à distance. Consultez `workers-capacitor-server.json` pour cette décision. La configuration de consommateurs Queue dans Wrangler impose l’envoi du Worker entier, y compris les projets uniquement consommateurs ; les gestionnaires de queue doivent rester sur le serveur. La livraison des queues ne démarre jamais dans l’application.

## Envois et mémoire

Les envois navigateur et les requêtes natives avec suivi des redirections mettent en tampon au plus 8 MiB par défaut. `maxBufferedBodyBytes` accepte un entier sûr non négatif en octets ; zéro n’autorise que les corps vides. Un flux trop volumineux est annulé et rejeté avant l’envoi par le transport. Les octets mis en tampon sont copiés dans un stockage croissant borné sans retenir les tampons sous-jacents potentiellement plus grands des blocs entrants. Les modes natifs de redirection manual/error utilisent le streaming au lieu de la mise en tampon pour rejeu.

Cette limite borne le tampon de ce transport, pas la mémoire totale de l’application, les requêtes concurrentes, les blobs alloués par l’appelant ou le pont Dedicated Worker. Appliquez des limites applicatives de taille et de concurrence avant d’allouer les corps. Pour les gros objets R2, implémentez des points d’accès multipart dans le Worker existant et maintenez chaque requête dans le budget. L’adaptateur ne découpe pas automatiquement les envois, ne réessaie pas les écritures échouées, n’annule pas les sessions multipart abandonnées et n’annule pas les effets d’une requête interrompue.

## Sécurité et sémantique

Gardez l’authentification, la propriété des locataires/objets, la validation, les limites de débit et les opérations autorisées dans le Worker déployé. Le sélecteur client est un mécanisme d’optimisation et de séparation du code, pas une frontière d’autorisation. L’accès aux bindings et le RPC restent dans ce Worker ; cette fonctionnalité ne crée aucun point d’accès public générique de binding/RPC. Le RPC de service est invoqué par le gestionnaire HTTP existant avec ses droits existants.

Le comportement natif des Cookie et redirections utilise le transport partagé. Conservez les contrôles CSRF ; les valeurs Origin/Referer remappées seules ne démontrent pas une intention fiable, et HttpOnly n’empêche pas les scripts compromis de l’application d’effectuer des requêtes authentifiées. Consultez le [contrat de sécurité D1](d1-transparent-migration.md#shared-transport-security-and-upload-limits).

Le KV cloud conserve son modèle de cohérence cloud. Queues conserve une livraison au moins une fois : les consommateurs doivent traiter les messages dupliqués de manière idempotente. Une réponse HTTP réussie à une mise en file ne signifie pas que le traitement aval est terminé. Un échec réseau ou une annulation ne prouve pas qu’une écriture/mise en file n’a pas eu lieu. Le client n’ajoute ni nouvelle tentative automatique ni file d’écritures hors ligne.

## Vérification

Exécutez `npm run build`, `npm test`, puis `npm run test:service-bindings` dans `demo`. Cette dernière commande utilise un véritable bucket R2, des espaces de noms KV, un service HTTP/RPC et un consommateur de file dans workerd sous Chromium et WebKit, Vite et esbuild, en exécution directe et Dedicated Worker, avec des builds sélectifs et pour le Worker entier (16 combinaisons). Elle vérifie l’état serveur, les plages/conditions/HEAD/multipart/delete de R2, les métadonnées KV, le HTTP/RPC de service, l’envoi/la livraison par lots de files, le rejet d’autorisation, les limites d’envoi avant transmission, les routes locales hors ligne et l’exclusion des artefacts client. Les résultats sont écrits dans `demo/artifacts/service-bindings/report.json`.

Ces exécutions navigateur interceptent les requêtes HTTPS vers workerd local. Le démarrage de développement Vite vérifie en outre les routes locales et HTTP/RPC en modes direct/Worker.

Reproduisez avec le harnais natif existant :

```sh
node demo/tests/experiments/d1/native-server.mjs --services
# Dans un autre terminal, pendant que le serveur fonctionne :
node demo/tests/experiments/d1/native-prepare.mjs --services
node demo/tests/experiments/d1/native-run.mjs ios <simulator-id> --services
node demo/tests/experiments/d1/native-run.mjs android <emulator-id> --services
```

Utilisez `--refresh` avec un consommateur services-native existant pour réutiliser ses répertoires de build natif tout en installant un nouveau tarball. Le harnais réutilise l’identifiant de l’application de test D1 ; n’exécutez pas simultanément les tests natifs D1 et de services sur le même appareil.

## Références des plateformes

- [Configuration Wrangler](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [API Workers R2](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)
- [Comportement du KV cloud](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- [Service HTTP](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/http/)
- [Service RPC](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/)
- [Garanties de livraison Queue](https://developers.cloudflare.com/queues/reference/delivery-guarantees/)

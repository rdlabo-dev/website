---
title: "Binding KV local"
sourceRevision: "a913662843c0a6ceea8859d7bd89a492ae797929673df489eca15c223c4759ea"
---

# Binding KV local

`LocalStorageKV` implémente le profil `kv.local.v1` via l’hôte commun de fonctionnalités. L’API utilise les noms de méthodes et les surcharges de Workers KV. Le `localStorage` de la WebView conserve chaque valeur avec ses métadonnées et son expiration. L’application choisit un espace de noms stable ; la libération de la fonctionnalité ne supprime jamais les données applicatives.

```ts
import { workersCapacitor } from "cf-workers-native/capacitor";
import { openFeature } from "cf-workers-native/shared/contracts";
import { LocalStorageKV } from "cf-workers-native/cloudflare/bindings/kv";
import worker from "./worker";

const kv = await openFeature(new LocalStorageKV("my-app-settings"));
const runtime = workersCapacitor({
  worker,
  baseURL: "https://example.com/api",
  env: { KV: kv.api },
});
// À l’arrêt de l’application : runtime.dispose(); await kv.dispose();
```

Le Worker peut typer ce binding avec le `KVNamespace` exporté. Le même Worker peut utiliser un véritable binding Workers KV. Cette configuration utilise l’exécution directe : les bindings contenant des fonctions ne peuvent actuellement pas franchir la frontière de clonage structuré du Worker isolé. Le RPC de bindings reste un chantier de transport distinct ; cette implémentation ne modifie ni l’hôte ni l’exécuteur communs.

Avec l’envoi généré à la compilation, l’exécution réseau par défaut conserve les opérations KV sur le Worker déployé. Pour utiliser KV local, sélectionnez explicitement les routes concernées dans un tableau `execution` (ou utilisez `"local"` pour tout le Worker d’une application autonome), puis configurez chaque nom KV Wrangler avec `kvExecution: { KV: "local" }` ou `kvExecution: { KV: "remote" }` dans le plugin. Une politique absente ou invalide fait échouer la compilation. Pour `local`, fournissez l’instance via `env` comme ci-dessus ; `remote` envoie les routes utilisant seulement KV au Worker. Si R2 ou une autre dépendance serveur rend un gestionnaire distant, toute la requête utilise le Worker déployé et son KV cloud. Les données locales et cloud restent indépendantes ; consultez le [guide d’envoi](remote-service-bindings.md).

## API prise en charge

| Opération | Comportement |
| --- | --- |
| `get(key, typeOrOptions?)` | Résultats texte par défaut/explicites, JSON, ArrayBuffer et flux d’octets ; les clés absentes retournent null |
| `get(keys, typeOrOptions?)` | Jusqu’à 100 clés ; résultats Map texte ou JSON, avec null pour les clés absentes |
| `getWithMetadata` | Mêmes modes de lecture unitaire/groupée, avec métadonnées ; une lecture unitaire absente retourne `{value: null, metadata: null}`, une entrée groupée absente vaut null |
| `put(key, value, options?)` | Chaîne, ArrayBuffer, vues typées d’octets ou flux d’octets ; métadonnées JSON et expiration absolue/relative facultatives |
| `delete(key)` | Supprime ensemble la valeur, les métadonnées et l’expiration ; les clés absentes ne posent pas de problème |
| `list(options?)` | Tri des clés en UTF-8, préfixe, limite (1–1000), curseur de continuation, métadonnées et expiration |

`expirationTtl` et une `expiration` absolue future ont un minimum de 60 secondes. Si les deux sont présents, le TTL détermine l’expiration résultante. Le TTL commence après la collecte et l’encodage de l’entrée, juste avant sa publication. Une expiration absolue est validée à l’appel et rejetée si elle est dépassée avant publication, ce qui préserve toute valeur précédente. L’expiration est vérifiée lors des lectures et des listes, y compris après une nouvelle session de fonctionnalité ; un enregistrement expiré est supprimé à la demande. L’écrasement sans options supprime les métadonnées et l’expiration précédentes. Les curseurs sont des jetons locaux opaques liés à l’espace de noms et au préfixe, non portables vers Cloudflare. Ils reprennent après la dernière clé retournée, plutôt qu’à un indice de tableau ; supprimer les entrées précédentes ne saute pas la clé suivante. La liste n’est pas un instantané transactionnel en présence d’écritures concurrentes.

## Garde-fous de l’implémentation

La validation se trouve dans l’implémentation du binding, indépendamment des tests. Les clés, modes de lecture, options, limites, expirations, métadonnées et modes groupés invalides sont rejetés. Les clés doivent occuper 1–512 octets UTF-8, à l’exclusion de `.` et `..` ; les valeurs sont plafonnées à 25 MiB et les métadonnées sérialisées à 1024 octets. Le quota de stockage du navigateur peut être bien inférieur. Un `cacheTtl` valide (au moins 30 secondes) est accepté, mais aucun cache local de lecture n’est ajouté. Les champs d’options inconnus sont rejetés plutôt qu’ignorés silencieusement.

Les flux d’octets sont encodés progressivement en base64 avec contrôle incrémental de la taille avant toute publication d’enregistrement ; les blocs décodés ne sont ni conservés ni concaténés dans un second tampon d’octets complet. Une entrée en échec ou trop volumineuse laisse l’ancien enregistrement intact. La valeur, l’expiration et les métadonnées sont sérialisées en une seule écriture de stockage ; les erreurs de quota/sécurité sont propagées sans repli en mémoire. Les octets et métadonnées retournés sont des copies indépendantes. L’absence de `localStorage` lance `FeatureUnavailable` ; les erreurs d’accès à la propriété sont propagées.

Le second argument facultatif du constructeur fournit un backend `Storage` existant pour les tests déterministes. Aucun registre générique de stockage ni abstraction de cycle de vie de persistance n’est introduit. Les contrôles à l’exécution et tests d’échecs du backend restent dans `tests/unit/kv.test.ts`.

## Limites de compatibilité et de persistance

Le `kvContract` exporté depuis `cf-workers-native/cloudflare/bindings/kv/testing` teste 18 cas comportementaux partagés contre le véritable binding workerd local et l’adaptateur local. `kvTextContract` reste disponible pour son profil plus restreint `kv.text.v1`. Les fournisseurs de contrats possèdent un espace de noms de test vide et son nettoyage ; ne les exécutez jamais sur des données applicatives. Les tests de limites d’expiration et de chemins d’échec sont distincts ; la suite workerd attend aussi l’écoulement d’un véritable TTL minimum.

Ce profil n’émule ni réplication globale, ni cohérence éventuelle, ni comportement du cache régional, ni limites de débit de production, ni synchronisation cloud. Il ne revendique pas des messages d’erreur, un ordre distribué ou des performances identiques. Les contrôles de taille des réponses groupées sont des limites locales sur les résultats sérialisés, pas une reproduction du comptage interne de Cloudflare sur le réseau. L’API KV est implémentée en TypeScript ; elle n’embarque pas V8.

Le stockage appartient à l’origine de la WebView. Effacer les données de l’application/du navigateur, désinstaller, subir une éviction ou changer d’origine peut faire perdre l’accès aux données. Aucune garantie de chiffrement des secrets ni de durabilité système n’est donnée. Les appels Web Storage sont synchrones derrière une API Promise ; les valeurs binaires sont encodées en base64, ce qui ajoute une surcharge mémoire et de quota pour les grandes valeurs. Les lectures de flux décodent au plus 48 KiB par pull et libèrent leur chaîne encodée à EOF/annulation ; Web Storage retourne toujours l’enregistrement encodé entier. Les écritures de flux conservent les parties encodées jusqu’à l’écriture atomique du stockage. Le format des enregistrements utilise un préfixe de stockage versionné ; aucune migration depuis l’ancien prototype texte uniquement non publié n’est fournie.

Les tests natifs utilisent des ressources embarquées dans les WebViews de simulateur/émulateur iOS/Android. La persistance après rechargement du document est également vérifiée sous Chromium/WebKit. Cela ne démontre aucune garantie de durabilité sur appareil physique ou lors d’une mise à niveau de l’application.

Références : Cloudflare [lecture KV](https://developers.cloudflare.com/kv/api/read-key-value-pairs/), [écriture KV](https://developers.cloudflare.com/kv/api/write-key-value-pairs/) et [liste des clés](https://developers.cloudflare.com/kv/api/list-keys/). La forme des entrées absentes pour les métadonnées groupées et la conservation du U+FEFF initial des clés sont vérifiées contre workerd réel. Les lectures texte unitaires conservent un BOM initial et les lectures JSON unitaires rejettent le JSON préfixé d’un BOM. Les lectures groupées retirent le BOM, y compris avant l’analyse JSON ; cette différence unitaire/groupée est reproduite et testée pour get et getWithMetadata.

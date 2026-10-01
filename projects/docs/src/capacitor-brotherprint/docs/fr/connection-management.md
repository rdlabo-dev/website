---
title: "Utilitaires JavaScript pour imprimantes"
sourceRevision: "067159fea3da3298614f4cf7f3115015fb281490f317635e7ba4120dafc1ab8f"
---
# Utilitaires JavaScript pour imprimantes

Ces fonctions encapsulent l’API existante du plugin sans modifier le comportement natif. Elles ne dépendent ni d’Angular ni d’Ionic. Les sessions peuvent mémoriser les connexions grâce à des callbacks de stockage fournis par l’application. Tous les utilitaires partagent une file d’attente pour empêcher le chevauchement des recherches et des vérifications de connexion.

## Choisir un point d’entrée

Commencez par [Installation](/docs/installation), y compris la configuration du SDK et des autorisations. Importez les utilitaires depuis le même package que le plugin.

| Tâche | Point d’entrée |
| --- | --- |
| Gérer les résultats de recherche, les notifications et le nettoyage d’un écran d’impression | `BrotherPrinterSession` |
| Effectuer une recherche unique sans dépendre de la durée de vie d’un écran | `searchBrotherPrinters` |
| Réutiliser une destination précédente, avec recherche si elle est indisponible | `prepareBrotherPrinters` |
| Vérifier uniquement une destination saisie manuellement | `checkBrotherPrinterChannel` |

Pour les appels directs au plugin, consultez [Recherche](/docs/search), [Impression](/docs/print) et [Événements](/docs/events).

## Rechercher sans session

- `searchBrotherPrinters(options, model?)` rassemble les événements de recherche dans un
tableau. La fonction enregistre son écouteur avant la recherche et le supprime, que celle-ci réussisse ou échoue. L’absence de résultats produit un tableau vide ; les erreurs natives sont propagées.
- `prepareBrotherPrinters(options, model, previous?)` vérifie d’abord un canal enregistré
lorsque son modèle et son port correspondent. S’il est disponible, la fonction renvoie `[previous]` ; sinon, elle relance une recherche. USB passe toujours par le parcours natif de recherche et d’autorisation. Une erreur de vérification de disponibilité est propagée au lieu de déclencher silencieusement une recherche.

- `checkBrotherPrinterChannel({ port, channelInfo })` vérifie une adresse sélectionnée explicitement
ou saisie manuellement, sans exiger de métadonnées de recherche. La fonction renvoie un booléen et ne recherche jamais d’autres imprimantes ni ne change de destination. Les erreurs natives sont propagées. Une vérification réussie confirme la connectivité, pas le modèle de l’imprimante ni le papier chargé.

```ts
import {
  searchBrotherPrinters,
  BRLMPrinterPort, BRLMPrinterModelName,
} from '@rdlabo/capacitor-brotherprint';

const printers = await searchBrotherPrinters(
  { port: BRLMPrinterPort.wifi, searchDuration: 10 },
  BRLMPrinterModelName.QL_820NWB,
);
```


## Utiliser une session sur un écran d’impression

1. Créez une session à l’ouverture de l’écran et enregistrez les notifications d’impression.
2. Appelez `prepare` pour obtenir les imprimantes candidates. Affichez un résultat vide si aucune n’est trouvée ; laissez l’utilisateur choisir s’il y en a plusieurs.
3. Transmettez le `port` et le `channelInfo` du canal choisi, ainsi que le modèle, le papier et l’image, à `session.printImage`. Consultez [Impression](/docs/print) pour les options d’impression natives.
4. Appelez `dispose()` dans le gestionnaire de sortie de l’écran. Il n’est pas nécessaire d’attendre la fin de l’impression pour fermer l’écran.

L’exemple suivant montre la création et le nettoyage d’une session. Pour combiner sélection et impression, consultez l’[exemple TypeScript](https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.2.1/examples/plain-typescript.ts).


Utilisez un `BrotherPrinterSession` par écran d’impression. Les utilitaires de connexion utilisent directement la plateforme Capacitor ; la session gère les résultats de recherche, les notifications d’impression et la fermeture. Ne réutilisez pas une session fermée. Les utilitaires sans état restent disponibles pour les opérations indépendantes de la durée de vie d’un écran.

```ts
import { BrotherPrinterSession, BRLMPrinterModelName, BRLMPrinterPort } from '@rdlabo/capacitor-brotherprint';

const session = new BrotherPrinterSession();
await session.listen({ onPrint: () => console.log('Printed') });
const printers = await session.prepare(
  { port: BRLMPrinterPort.wifi, searchDuration: 10 },
  BRLMPrinterModelName.QL_820NWB,
);
// Sélectionnez une imprimante, puis appelez session.printImage avec les options natives existantes.
// Dans le gestionnaire de sortie de l’écran :
await session.dispose();
```

### Opérations qui se poursuivent après la fermeture de l’écran

Lors de la fermeture, `closed` passe immédiatement à true et `printers` devient vide. Les recherches en attente sont ignorées, de même que les résultats tardifs. Les callbacks d’impression s’arrêtent immédiatement ; la fermeture attend la suppression des écouteurs d’impression de cette session, y compris ceux dont l’enregistrement est encore en cours. Une recherche native active se termine toujours avant le démarrage d’une autre opération de connexion. Une impression native déjà lancée n’est pas annulée. Après une opération asynchrone de l’application (génération d’image, stockage ou dialogue), vérifiez `closed` avant d’afficher l’interface. Les appels à `search`, `prepare` et `printImage` sur une session fermée ne lancent aucune opération native. Aucune nouvelle tentative d’impression automatique n’est ajoutée.


## Mémoriser une connexion

Fournissez trois callbacks pour utiliser localStorage, sessionStorage, Ionic Storage ou un autre stockage de chaînes. Le plugin ne détecte pas d’implémentation de stockage et n’en dépend pas.

```ts
const session = new BrotherPrinterSession({
  storage: {
    get: (key) => localStorage.getItem(key),
    set: (key, value) => localStorage.setItem(key, value),
    remove: (key) => localStorage.removeItem(key),
  },
  storagePrefix: 'labels:',
});
```

Pour un stockage asynchrone, transmettez les mêmes callbacks en renvoyant ses promesses :

```ts
const session = new BrotherPrinterSession({
  storage: {
    get: (key) => storage.get(key),
    set: (key, value) => storage.set(key, value),
    remove: (key) => storage.remove(key),
  },
});
```

### Données enregistrées et réutilisation

`get` renvoie une chaîne ou null/undefined ; les callbacks peuvent se terminer de façon synchrone ou asynchrone. La session sérialise les métadonnées de connexion en JSON sous `${storagePrefix}last-printer` (par défaut : `brotherprint:last-printer`). Elle ne stocke jamais les images ni les réglages de police ou de papier. Utilisez le même préfixe entre les écrans pour réutiliser une connexion.

`printImage` mémorise le port, l’adresse et le modèle configuré avant l’impression. Cette mémorisation représente une tentative de connexion, pas une preuve de réussite de l’impression. `prepare` la charge si le troisième argument est omis, vérifie la correspondance du modèle et du port ainsi que la disponibilité, puis effectue une recherche si nécessaire. USB relance toujours une recherche. Un canal explicite remplace le stockage ; `null` ignore la connexion enregistrée. Les erreurs de lecture/écriture du stockage et le JSON enregistré invalide sont ignorés ; les erreurs natives sont toujours propagées. La fermeture pendant une opération de stockage empêche toute opération native ultérieure.

### Oublier une connexion enregistrée

`await session.clearSavedPrinter()` supprime la connexion mémorisée ; les erreurs de suppression sont propagées pour que l’application puisse signaler l’échec. Sans callbacks de stockage, les sessions ne conservent qu’un état local à l’écran. Les utilitaires sans état acceptent toujours des canaux précédents gérés par l’application.

## Vérifier une destination saisie manuellement

Pour un appareil saisi manuellement, conservez le port choisi avec son adresse. Ne déduisez pas Bluetooth de la ponctuation : sur iOS, Bluetooth utilise un numéro de série et BLE un nom local du SDK. Appelez `checkBrotherPrinterChannel` et imprimez sur ce même canal uniquement s’il est disponible. Utilisez `prepareBrotherPrinters` pour la recherche et les autorisations USB. L’application fournit séparément le modèle et les réglages d’étiquette.


## Utilitaires de connexion et de modèle

- `brotherPrinterPorts(model, isAndroid?)` renvoie les connexions possibles pour un
modèle de l’énumération existante, en utilisant `Capacitor.getPlatform()` si le remplacement est omis. USB est réservé à Android. `wifi` couvre aussi Ethernet filaire. Les modèles inconnus produisent un tableau vide.
- `resolveBrotherPrinterPort(model, saved?)` conserve une connexion enregistrée prise en charge.
Sinon, la fonction privilégie USB pour QL-800/QL-810W sur Android, puis la première connexion prise en charge. Elle renvoie `undefined` si aucune connexion n’est prise en charge.
- `brotherPrinterPortLabel(port)` renvoie un nom d’affichage courant : Wi-Fi, Bluetooth,
Bluetooth LE ou USB. Un port indéfini ou inconnu produit une chaîne vide.
- `brotherPrinterModel(name)` associe un nom découvert au modèle de l’énumération existante,
y compris les alias de produits comme QL-820NWBc. Les noms inconnus renvoient `undefined`.

## Ordre des recherches et erreurs

La recherche, la préparation et les vérifications explicites de connexion partagent une file d’attente. L’appel suivant commence après la fin de l’opération native précédente et du nettoyage de ses écouteurs, même si cet appel a échoué. Aucun délai d’expiration JavaScript ne libère prématurément la file. Ne combinez pas des appels directs concurrents à `BrotherPrint.search()` ou à la vérification de connexion avec ces utilitaires : les appels directs contournent la file et les événements natifs n’ont pas d’identifiant de requête. L’impression reste également en dehors de cette file ; attendez la préparation de la connexion avant d’appeler `printImage`. Le modèle facultatif filtre les résultats non USB ; les résultats USB sont conservés même si le SDK renvoie un modèle ou une adresse vide. Les choix de connexion n’étendent pas la prise en charge native ; consultez le README existant et les instructions d’installation du SDK.

Avec les fonctions sans état, l’application gère les indicateurs de chargement, l’interface de sélection et la mise en cache. Transmettez son canal enregistré à `prepareBrotherPrinters`, choisissez un canal renvoyé et appelez la méthode existante `BrotherPrint.printImage()` avec le port et l’adresse sélectionnés. L’utilitaire ne réessaie pas l’impression. Enregistrez le canal choisi dans l’application pour la préparation suivante.

Utilisez `searchDuration: 3` pour une recherche préliminaire courte ou `10` pour une recherche normale ; il s’agit de choix de l’appelant, pas de nouvelles tentatives automatiques. L’annulation par les méthodes natives existantes affecte la recherche active ; elle ne retire pas les appels aux utilitaires en attente. Aucune instance de contrôleur ni aucun appel séparé de nettoyage des écouteurs n’est requis.

Consultez l’[exemple d’impression en TypeScript simple](https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.2.1/examples/plain-typescript.ts). Dans une copie des sources, `npm test` teste les utilitaires et vérifie les types de cet exemple.

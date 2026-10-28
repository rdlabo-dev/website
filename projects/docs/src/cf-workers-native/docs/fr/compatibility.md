---
title: "Compatibilité et limites"
sourceRevision: "eabce73d3a2453218f8df88a57e0edc701428356d16b61eb18fd6b8065336747"
---

# Compatibilité et limites

La cible est Cloudflare Workers, pas un processus Node.js autonome. Le profil Node utilise workerd `1.20261012.1`, la date de compatibilité `2026-10-17`, sans indicateur supplémentaire. Les autres dates et indicateurs ne sont pas couverts par ce profil. La WebView ne contient ni workerd ni V8 ; iOS utilise son propre moteur JavaScript.

Les publications suivent le [critère de validation des applications privilégiant l’exécution distante](../CONTRIBUTING.md#remote-first-application-release-gate). La politique réseau par défaut conserve l’implémentation serveur sur le Worker déployé. La validation d’une application mobile ne démontre pas une compatibilité complète avec Workers ou Node.js. L’achèvement des API locales se poursuit indépendamment, avec les limites ci-dessous.

## Hôtes natifs

| Hôte | Périmètre |
| --- | --- |
| Intégration iOS | Produit SwiftPM `WorkersIOS` 0.1.7 pour UIKit/SwiftUI. Fermez avant de retirer un contrôleur UIKit ; le démontage SwiftUI ferme automatiquement. |
| Intégration Android | SDK Maven Central `io.github.rdlabo:cf-workers-native-android:0.1.7`. Nécessite WebView `MULTI_PROFILE` ; un écran SDK à la fois, avec des cookies SDK persistants isolés de ceux de l’hôte. |
| Capacitor | Intégration Capacitor 8 existante, vérifiée avec 8.5.3 ; utilisez cette voie pour les plugins natifs généraux. |

La préversion npm utilise le nom `cf-workers-native` ; utilisez la version exacte et les dépendances natives correspondantes dans la [matrice des dépendances](native-embedding.md#dependency-setup). Utilisez l’ensemble compatible de dépendances JS/natives documenté ; ces hôtes ne sont pas inclus dans l’ancienne version `workers-capacitor@0.1.1`. Les deux détectent un démarrage incomplet après 30 secondes. Ils réutilisent le runtime et les outils de compilation et conservent donc les limites d’API/framework ci-dessous. Consultez la [configuration et le cycle de vie de l’intégration](native-embedding.md) pour le comportement des plateformes et le [périmètre de vérification](native-embedding.md#verification) pour les preuves propres à chaque hôte.

## Node.js

La compatibilité avec l’ensemble de Node est incomplète. L’import réussi d’un module ne démontre pas l’équivalence de ses méthodes, de sa validation, de son état, de son ordonnancement ou du comportement du moteur.

Le statut des modules entiers reste **En cours**, y compris pour ceux dont les contrats existants passent. La validation de publication couvre les scénarios implémentés ; elle ne certifie pas les opérations non testées. Les API manquantes, les différences connues et les opérations non vérifiées ci-dessous restent à traiter après publication.

| Domaine | Comportement et limites |
| --- | --- |
| path, querystring, string_decoder, buffer, timers | Implémentent le profil Workers épinglé. Les stubs Workers restent des stubs ; par exemple, matchesGlob reproduit le rejet épinglé. |
| HTTP et net | Acheminement serveur en mémoire ; aucun serveur système en écoute. Le TCP/TLS sortant nécessite le transport natif. |
| fs / fs/promises | Fichiers embarqués en lecture seule et `/tmp` en mémoire propre à chaque requête, avec écritures, descripteurs et opérations FileHandle. Watch n’est pas pris en charge, comme dans Workers. La sémantique complète du système de fichiers reste en cours d’audit. |
| module | Registre limité de modules intégrés ; createRequire charge uniquement le JSON du VFS. Les modules exécutables doivent être regroupés ; la résolution dynamique arbitraire n’est pas prise en charge. |
| process, console, util / util/types / sys | Process inclut la configuration, le chargement de fichiers d’environnement et les flux standard ; abort/reallyExit/getBuiltinModule restent absents. L’introspection du moteur, les sites d’appel et la détection d’objets hôtes ne sont pas équivalents à Workers. |
| crypto et zlib | Certains profils couvrent random/Hash/HMAC/PBKDF2/HKDF/scrypt, les clés secrètes/asymétriques, les signatures, les nombres premiers et le streaming Brotli/Zstd. L’analyse, les champs et les vérifications de X509Certificate sont implémentés avec les limites de Workers épinglées ; d’autres algorithmes et la parité complète crypto/codec restent à couvrir. |
| TLS et composants internes HTTP | TLS direct et STARTTLS utilisent des transports natifs authentifiés et distinguent close_notify des connexions tronquées. STARTTLS expose la notification secureConnect anticipée de Workers, tandis que les E/S applicatives attendent toujours l’authentification du certificat. La validation complète des classes/états reste à faire. |
| WebSocket | Les implémentations propres de WebSocket et WebSocketPair prennent en charge WS/WSS natif, accept, close, la compression et les pièces jointes. Le calcul de taille des pièces jointes a une limite explicitement définie liée à la représentation interne du moteur ; la validation de l’API entière reste à faire. |
| Streams | Une implémentation propre fournit des flux d’octets et les comportements Workers testés d’annulation de tee et d’abandon de pipeTo sur chaque hôte. La validation du module entier reste à faire. |
| async_hooks | Les fonctions async transformées au build conservent des stores par portée. Les callbacks async natifs non transformés sont rejetés ; le code dynamique arbitraire et l’isolation par origine de requête ne sont pas entièrement pris en charge. |
| diagnostics_channel | Les contrats synchrones de canal/store sont implémentés ; la propagation asynchrone dépend des limites d’async-hooks. |
| worker_threads | Stubs Workers et comportement local de MessagePort, pas des threads Node. Le marquage des événements de confiance, la sérialisation des objets hôtes et l’identité globale diffèrent. |
| DNS | Implémentation DNS-over-HTTPS ; les substitutions d’adresses synthétiques Service Binding/Hyperdrive ne sont pas implémentées. |
| events | [WebView events profile](../src/compat/events/README.md) : EventEmitter, utilitaires d’abandon/itération, propagation AsyncResource transformée et transmission des avertissements process. Async natif et inspection V8 restent limités. |
| Autres modules | Des implémentations et contrats partagés existent, mais la validation de modules entiers reste à faire. L’égalité des espaces de noms ne suffit pas. |

La [limite des pièces jointes WebSocket](../src/browser/websocket/README.md) concerne uniquement les tailles sérialisées dépendant de la représentation privée du moteur. Elle ne dispense pas du respect des valeurs prises en charge, de l’isolation des instantanés, des limites de taille normales, de l’authentification TLS ou du comportement réseau.

La base exacte des exports manquants/supplémentaires est maintenue dans [surface-gaps.json](../demo/tests/experiments/node-compat/surface-gaps.json), par rapport aux [exports épinglés](../demo/tests/experiments/node-compat/exports.json). Ces fichiers font autorité ; ce guide ne recopie pas la liste des exports. Exécutez `npm run build`, puis `npm run test:node-inventory --prefix demo` pour la vérifier. Les contrats comportementaux se trouvent à côté de chaque implémentation dans `src/compat`.

### Évaluation de l’achèvement

L’audit d’import compare les noms des exports et leurs types JavaScript au profil Workers épinglé. Un audit réussi signifie qu’aucune nouvelle régression de surface n’a été introduite ; il ne démontre pas la compatibilité du module entier. En particulier, remplacer une fonction par un objet constitue désormais une régression, même si le nom de l’export est inchangé.

Après `npm run build`, exécutez `npm run test:node-completion --prefix demo` pour régénérer `demo/artifacts/node-inventory/completion.json`. Le rapport couvre chaque module épinglé dans Chromium et WebKit, distingue les lacunes de surface des modules alignés mais non certifiés et consigne la prochaine investigation avec des références aux preuves. L’absence de moteurs, de modules ou de données d’audit des types, ou un profil divergent, fait échouer la génération. L’option facultative du rapport `--require-complete` rejette les preuves limitées à la surface ; elle ne doit pas servir à transformer la génération du rapport en certificat de compatibilité.

Le travail restant a différentes causes :

- **Lacunes d’implémentation :** `crypto`, `zlib` et la sémantique restante du système de fichiers virtuel nécessitent encore une implémentation et une vérification opération par opération. Leur absence ne prouve pas une impossibilité technique.
- **Lacunes de comportement :** les comportements restants du cycle de vie des flux et du DNS synthétique nécessitent des adaptateurs et des contrats spécifiques, au-delà de l’export des bons noms.
- **Limites du moteur :** l’introspection proxy/promise, les hooks de continuation async native et le marquage de confiance de MessagePort présentent des différences observables. Les transformations à la compilation ou les ponts natifs nécessitent un périmètre explicite et une vérification distincte.
- **Stubs Workers :** conservez le comportement réel sans effet ou de rejet du runtime épinglé. N’implémentez pas les capacités de Node de bureau au seul motif que Node les expose.
- **Lacunes de vérification :** même une surface d’exports alignée nécessite une couverture des opérations/prototypes du module entier et une validation native avant d’être considérée comme complète.

Un getter d’option de codec peut modifier une entrée ou un dictionnaire avant le traitement natif ; ces modifications ordinaires sont conservées. Les ArrayBuffers redimensionnables et les vues SharedArrayBuffer extensibles sont copiés en instantanés lors de la conversion, comme dans Workers. Un ArrayBuffer fixe transféré par un getter d’option relève d’une limite plus étroite du moteur : Workers peut conserver son stockage natif après détachement, tandis que JavaScript ne peut pas récupérer les modifications effectuées juste avant le transfert. Les codecs locaux rapides rejettent ce cas avec `TypeError` au lieu de compresser silencieusement des données vides. Évitez de transférer les buffers d’entrée ou de dictionnaire depuis des getters d’options. Cette limite ne dispense pas de respecter les autres options de codec ou leur cycle de vie.

Exécutez `npm run test:node-boundaries --prefix demo` pour les contre-exemples et `npm run test:events --prefix demo` pour la référence Workers events et son implémentation. `node:events` passe par le [WebView events profile](../src/compat/events/README.md) ; la transmission des avertissements process et l’ordonnancement des microtâches sont partagés avec cet adaptateur. Les tests comparent les imports Vite/esbuild ordinaires dans la page et dans des Dedicated Workers. Les limites d’inspection du moteur et d’async natif non transformé restent explicites ; la conformité à ce profil ne certifie pas tous les modules Workers/Node.

Les [profils de compatibilité supplémentaires](../src/compat/expansion/README.md) couvrent les stubs console, les alias sys/util, certaines opérations cryptographiques, `/tmp` propre à chaque requête, les KeyObjects secrets, Brotli/Zstd/CRC32, les métadonnées du système de fichiers, l’annulation des flux, les métadonnées des modules et les utilitaires HTTP. Exécutez `npm run test:node-expansion --prefix demo` pour les tests différentiels en direct avec la version Workers épinglée. La CI exécute ces contrôles avec la suite events existante. Pour la vérification native, préparez un consommateur installé avec `npm run test:events:native:prepare --prefix demo`, puis exécutez `npm run test:node-expansion:native --prefix demo -- ios <simulator-uuid>` ou `npm run test:node-expansion:native --prefix demo -- android <emulator-serial>`. Les rapports natifs incluent le hash du candidat et l’identité de l’archive installée sous `demo/artifacts/node-inventory/native-expansion/`.

Les modules non fonctionnels de Workers n’acquièrent pas de capacités de l’appareil : les isolats VM, la création de processus, l’accès au tas V8, les sockets UDP et un terminal système ne sont pas fournis. `node:test` expose l’API de mocks Workers, pas l’exécuteur de tests complet de Node.

## API et bindings Workers

- `passThroughOnException`, WorkerEntrypoint/RPC local, Cache API et HTMLRewriter ne sont pas pris en charge. Les cycles de vie scheduled/queue/workflow ne sont pas simulés localement.
- `cloudflare:workers` est partiel. Le dispatcher isolé actualise un proxy `env` à l’échelle du contexte global ; l’exécution directe ne le renseigne pas. Il n’est pas propre à chaque requête et n’est pas renseigné avant le premier acheminement. Préférez l’argument du gestionnaire Fetch. DurableObject est un squelette de constructeur, pas un runtime Durable Objects local.
- `Request.cf` préserve les valeurs fournies ; il ne génère pas de métadonnées Cloudflare.
- [KV local](kv.md) utilise le stockage de l’appareil sans réplication cloud ni RPC de binding.
- D1, Hyperdrive, R2, Service Bindings, les producteurs Queue et les [autres services cloud](cloudflare-bindings.md) s’exécutent à distance via le gestionnaire HTTP du Worker déployé. Ce ne sont pas des implémentations locales des services. ASSETS local n’est pas pris en charge ; utilisez la politique explicite de ressources distantes.

## Réseau natif

Le cadrage HTTP/1.1, les redirections et l’analyse des réponses s’exécutent en JavaScript/Wasm. Le code natif fournit TCP/TLS et les hooks du cycle de vie WebView. Chaque requête HTTP utilise une connexion avec `Connection: close` ; aucune nouvelle tentative implicite n’a lieu après l’envoi.

- HTTPS exige un cadrage Content-Length ou chunked. HTTPS délimité par EOF est rejeté, car le pont d’octets ne peut pas distinguer une fermeture authentifiée d’une troncature. HTTP non chiffré prend en charge le cadrage EOF.
- Les trailers sont analysés mais ne sont pas exposés comme en-têtes de réponse Fetch. HTTP/2, les upgrades de protocole et CONNECT ne sont pas pris en charge par ce transport HTTP/1.1.
- Les lectures/écritures de sockets sont limitées à 64 KiB ; le texte des en-têtes est limité à 64 KiB au total pour les en-têtes informatifs/finals et les trailers. Les lectures suivent la demande du consommateur.
- L’exécution navigateur conserve les restrictions CORS/en-têtes/cookies du navigateur. Le transport natif ne promet pas une protection SameSite ou CSRF équivalente à celle d’un navigateur.
- L’arrêt par le système d’exploitation peut interrompre le travail en arrière-plan. Certains scénarios couvrent des appareils physiques ; le comportement de votre application sur appareil, la récupération après crash de WebView et la pression mémoire nécessitent une validation distincte.

## Rendu de documents

Le HTML distant est rendu à l’origine locale de l’application (`capacitor://localhost` sur iOS, `https://workers-sdk.local` dans l’hôte Android intégré et normalement `https://localhost` dans une application Capacitor Android). L’exécution distante conserve code serveur et services cloud sur le Worker ; elle ne transforme pas la WebView en origine de ce site et ne fournit pas toutes les fonctions d’authentification du navigateur. Vérifiez l’hydratation et les contrôles interactifs, pas seulement la réception d’une réponse HTML.

### Limites d’intégration des applications

| Fonctionnalité | Limite actuelle | Conseils d’intégration |
| --- | --- | --- |
| Better Auth avec URL de base client déduite | L’application flare-stack-blog épinglée échoue à initialiser le client sur iOS car Better Auth rejette `capacitor://localhost`. L’origine HTTP(S) Android ne rencontre pas ce rejet. | Un endpoint d’authentification HTTPS explicite initialise le client, mais son flux complet de connexion/cookies n’a pas été validé ici. Ne supposez pas que ce seul réglage termine la migration. Consultez la [reproduction](../demo/tests/upstream/flare-stack-blog/README.md). |
| Passkeys / WebAuthn et PRF | L’enregistrement natif des passkeys dans pknotes échoue sur les deux plateformes testées. L’acceptation avec l’authentificateur virtuel Chromium ne prouve pas la prise en charge native. | L’intégration des identifiants natifs, l’association application/domaine et la disponibilité PRF nécessitent une validation séparée. Le rendu distant ne contourne pas les vérifications d’origine du relying party. La prise en charge native est différée, pas démontrée techniquement impossible. Consultez la [limite d’authentification](../demo/tests/upstream/pknotes/README.md). |
| Void React Pages | Void / @void/react 1.1.12 couvre les flux D1 distants et l’exécution de routes GET publiques explicitement autorisées, avec SSR et hydratation, sur simulateur iOS et émulateur Android. Les autres frameworks Void et l’exécution locale du Worker entier ne sont pas vérifiés. | Utilisez 1.1.12 ou ultérieur pour la navigation iOS avec schéma personnalisé. Consultez l’[intégration Void et son périmètre de vérification](void.md). |
| OAuth par navigateur externe | L’exemple vérifie des émetteurs de test synthétiques locaux et HTTPS publics, PKCE, callbacks et échange de session, y compris sur iPhone physique. Les politiques de fournisseurs réels, le stockage des refresh tokens et la reprise à froid ne sont pas couverts. | Utilisez le SDK natif du fournisseur lorsqu’il existe. Les cookies du navigateur système ne sont pas partagés automatiquement avec la WebView. Consultez l’[exemple d’authentification](../demo/authentication/README.md). |
| Analytics Engine et autres services cloud | Analytics Engine s’exécute dans Cloudflare ; aucune implémentation locale de dataset n’existe. Le scénario réel Counterscale nécessite un compte provisionné, des événements et un jeton de lecture analytics. | Gardez les jetons privilégiés sur le backend et authentifiez les requêtes des appareils. Le scénario d’authentification CI par défaut ne teste pas l’analytics réel. Consultez la [configuration Counterscale](../demo/tests/upstream/counterscale/README.md). |
| Optimisation des images et performances de l’appareil | La fixture OpenNext couvre workerd local et Cloudflare IMAGES déployé, y compris le rendu sur iPhone physique. Les mesures de performance sont des exécutions Debug uniques ; la mémoire iOS physique n’est pas mesurée. | Vérifiez la configuration d’image de production et mesurez démarrage et mémoire en release sur plusieurs appareils physiques avant d’affirmer des performances. Consultez les [lacunes OpenNext](opennext.md#current-gaps). |

Les fixtures tierces épinglées testent des parcours précis sans modifier les sources de leur application ; elles ne certifient pas toutes les fonctionnalités ni les versions futures. La plupart utilisent workerd local derrière HTTPS comme backend distant. Analytics Engine réel et le scénario OpenNext D1/Images en HTTPS public sont des exceptions configurées explicitement. Consultez les [périmètres des scénarios](../demo/tests/README.md#application-acceptance) avant de vous appuyer sur un résultat pour une intégration de production.

Consultez le [rendu natif de documents](native-rendering-api.md#scope-and-limits) pour les restrictions de navigation, téléversement par formulaire, redirections, confiance et cycle de vie. Les comparaisons avec le Service Worker navigateur prévoient explicitement que WebKit perde les corps POST rejoués et expose `redirected: false` pour les redirections synthétiques. Toutes les autres assertions restent obligatoires ; ces attentes documentent des limites du navigateur, pas des comportements pris en charge. iOS utilise un pont de schéma natif distinct. Les résultats navigateur ne remplacent pas une validation iOS/Android.

---
title: "Compatibilité et limites"
sourceRevision: 12d713df68d891cc7da6cca41b2c0644441d8017087e7642241f9053124875f6
---

# Compatibilité et limites

La cible est Cloudflare Workers, pas un processus Node.js autonome. Le profil Node utilise workerd `1.20261012.1`, la date de compatibilité `2026-10-17`, sans indicateur supplémentaire. Les autres dates et indicateurs ne sont pas couverts par ce profil. La WebView ne contient ni workerd ni V8 ; iOS utilise son propre moteur JavaScript.

0.1.0 Preview inclut les implémentations de compatibilité existantes avec les limites ci-dessous au titre d’une [exception de publication propre à cette version](../CONTRIBUTING.md#010-preview-exception). Leur inclusion ne signifie pas une compatibilité complète avec Workers ou Node.js.

## Node.js

La compatibilité avec l’ensemble de Node est incomplète. L’import réussi d’un module ne démontre pas l’équivalence de ses méthodes, de sa validation, de son état, de son ordonnancement ou du comportement du moteur.

| Domaine | Comportement et limites |
| --- | --- |
| path, querystring, string_decoder, buffer, timers | Implémentent le profil Workers épinglé. Les stubs Workers restent des stubs ; par exemple, matchesGlob reproduit le rejet épinglé. |
| HTTP et net | Acheminement serveur en mémoire ; aucun serveur système en écoute. Le TCP/TLS sortant nécessite le transport natif. |
| fs / fs/promises | Fichiers virtuels embarqués en lecture seule. Les écritures, FileHandle, watch et la sémantique complète du système de fichiers ne sont pas pris en charge. |
| module | Registre limité de modules intégrés ; createRequire charge uniquement le JSON du VFS. Les modules exécutables doivent être regroupés ; la résolution dynamique arbitraire n’est pas prise en charge. |
| process, events, console, util / util/types / sys | Exports ou comportement incomplets. L’introspection du moteur, les sites d’appel et la détection d’objets hôtes ne sont pas équivalents à Workers. |
| crypto et zlib | Les implémentations des dépendances ne couvrent pas tous les exports, algorithmes, clés ou codecs Workers. Ne supposez pas une parité cryptographique ou de compression. |
| TLS et composants internes HTTP | node:tls est incomplet. \_http_common, \_http_outgoing, \_http_server, \_tls_wrap et \_stream_wrap échouent à l’audit d’import. Le transport TLS natif n’implique pas la compatibilité avec l’API TLS de Node. |
| Streams | Une solution de repli empaquetée fournit des flux d’octets si l’hôte n’en dispose pas. Les motifs d’annulation de tee et le moment de l’annulation de pipeTo de Workers ne sont pas intégralement reproduits. |
| async_hooks | Les fonctions async transformées au build conservent des stores par portée. Les callbacks async natifs non transformés sont rejetés ; le code dynamique arbitraire et l’isolation par origine de requête ne sont pas entièrement pris en charge. |
| diagnostics_channel | Les contrats synchrones de canal/store sont implémentés ; la propagation asynchrone dépend des limites d’async-hooks. |
| worker_threads | Stubs Workers et comportement local de MessagePort, pas des threads Node. Le marquage des événements de confiance, la sérialisation des objets hôtes et l’identité globale diffèrent. |
| DNS | Implémentation DNS-over-HTTPS ; les substitutions d’adresses synthétiques Service Binding/Hyperdrive ne sont pas implémentées. |
| Autres modules | Des implémentations et contrats partagés existent, mais la validation de modules entiers reste à faire. L’égalité des espaces de noms ne suffit pas. |

La base exacte des exports manquants/supplémentaires est maintenue dans [surface-gaps.json](../demo/tests/experiments/node-compat/surface-gaps.json), par rapport aux [exports épinglés](../demo/tests/experiments/node-compat/exports.json). Ces fichiers font autorité ; ce guide ne recopie pas la liste des exports. Exécutez `npm run build`, puis `npm run test:node-inventory --prefix demo` pour la vérifier. Les contrats comportementaux se trouvent à côté de chaque implémentation dans `src/compat`.

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

Le HTML distant est rendu à l’origine locale de l’application (`capacitor://localhost` sur iOS, normalement `https://localhost` sur Android). L’exécution distante maintient le code serveur et les services cloud sur le Worker ; elle ne donne pas à la WebView l’origine de ce site et ne fournit pas toutes les fonctions d’authentification du navigateur. Vérifiez l’hydratation et les contrôles interactifs, pas seulement la réussite d’une réponse HTML.

### Limites d’intégration des applications

| Fonctionnalité | Périmètre actuel | Conseils d’intégration |
| --- | --- | --- |
| Better Auth avec URL de base client déduite | L’application flare-stack-blog épinglée échoue à l’initialisation du client sur iOS, car Better Auth rejette `capacitor://localhost`. L’origine HTTP(S) d’Android ne rencontre pas ce rejet. | Un point d’accès d’authentification HTTPS explicite initialise le client, mais son parcours complet de connexion/cookies n’a pas été validé ici. Ne supposez pas que ce réglage suffit à terminer la migration. Consultez la [reproduction](../demo/tests/upstream/flare-stack-blog/README.md). |
| Passkeys / WebAuthn et PRF | L’enregistrement natif de passkeys dans pknotes échoue sur les deux plateformes testées. La validation de l’authentificateur virtuel de Chromium ne démontre pas la prise en charge native. | L’intégration native des identifiants, l’association application/domaine et la disponibilité de PRF nécessitent une validation distincte. Le rendu distant ne peut pas contourner les contrôles d’origine de la partie de confiance. La prise en charge native est différée, pas déclarée techniquement impossible. Consultez la [frontière d’authentification](../demo/tests/upstream/pknotes/README.md). |
| Void React Pages | L’exécution distante React Pages + D1 est couverte avec Void / @void/react 1.1.12 publié sur un simulateur iOS et un émulateur Android. Les autres frameworks Void et l’exécution locale ne sont pas vérifiés. | Utilisez 1.1.12 ou ultérieur pour la navigation iOS à schéma personnalisé. Consultez l’[intégration Void et son périmètre de vérification](void.md). |
| OAuth dans un navigateur externe | L’exemple vérifie des émetteurs de test synthétiques locaux et en HTTPS public, PKCE, la gestion du callback et l’échange de session, y compris sur un iPhone physique. Les politiques des fournisseurs réels, le stockage des refresh tokens et la reprise à démarrage à froid ne sont pas couverts. | Utilisez le SDK natif du fournisseur lorsqu’il existe. Les cookies du navigateur système ne sont pas automatiquement partagés avec la WebView. Consultez l’[exemple d’authentification](../demo/authentication/README.md). |
| Analytics Engine et autres services exclusivement cloud | Analytics Engine s’exécute dans Cloudflare ; il n’existe pas d’implémentation locale de dataset. Le scénario réel de Counterscale exige un compte provisionné, des événements et un jeton de lecture analytique. | Gardez les jetons privilégiés sur le backend et authentifiez les requêtes des appareils. Le scénario d’authentification par défaut de la CI ne teste pas l’analytique réelle. Consultez la [configuration Counterscale](../demo/tests/upstream/counterscale/README.md). |
| Optimisation d’images et performances sur appareil | La fixture OpenNext couvre workerd local et IMAGES de Cloudflare déployé, y compris le rendu sur un iPhone physique. Les échantillons de performances sont des exécutions Debug uniques ; la mémoire physique iOS n’est pas mesurée. | Vérifiez la configuration des images en production et mesurez le démarrage et la mémoire de builds release sur plusieurs appareils physiques avant d’affirmer des performances. Consultez les [lacunes d’OpenNext](opennext.md#current-gaps). |

Les fixtures tierces épinglées testent des parcours précis sans modifier les sources de leur application ; elles ne certifient pas toutes les fonctionnalités ni les versions futures. La plupart utilisent workerd local derrière HTTPS comme backend distant. Analytics Engine réel et le scénario OpenNext D1/Images en HTTPS public sont des exceptions configurées explicitement. Consultez les [périmètres des scénarios](../demo/tests/README.md#application-acceptance) avant de vous appuyer sur un résultat pour une intégration de production.

Consultez le [rendu natif de documents](native-rendering-api.md#scope-and-limits) pour les restrictions de navigation, d’envoi de formulaires, de redirections, de confiance et de cycle de vie. Les comparaisons avec le Service Worker du navigateur incluent six échecs WebKit attendus pour le rejeu POST et les métadonnées de redirection ; iOS utilise un autre pont natif de schéma. Les résultats navigateur ne remplacent pas la validation iOS/Android.

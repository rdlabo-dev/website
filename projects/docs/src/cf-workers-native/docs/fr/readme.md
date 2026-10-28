---
title: "Premiers pas"
sourceRevision: "ae63d20966a0317f4311f27fb1a17d946b93c2b341d0d31831fa8fb881ae0df8"
---

# cf-workers-native

**Portez l’application que vous avez créée avec Workers ou Void sur iOS et Android.**

Touchez aussi bien les personnes qui préfèrent le navigateur que celles qui cherchent leurs applications dans les stores. Proposez une application mobile en complément du Web pour laisser chacun choisir la plateforme qui lui convient.

## Votre application Web peut avoir une version mobile

Si votre application Web s’exécute sur Cloudflare Workers, vous pouvez lui ajouter une application iOS et Android construite autour de ses pages et de son backend existants. Par exemple, une application Void avec des formulaires utilisant D1 peut conserver ses loaders, ses actions et sa base de données sur Workers, tandis que l’application mobile affiche ses pages et embarque ses fichiers JavaScript et CSS publics.

cf-workers-native relie votre application Workers à une application mobile créée avec Capacitor. Capacitor fournit les projets iOS et Android et l’accès aux plugins natifs. Vous ajoutez une compilation mobile distincte et testez les parcours de votre application ; vous continuez à développer et à déployer votre application Web sur Cloudflare.

**Commencez ici : [Ajouter une version mobile à votre application existante](/docs/integration).** Vous n’avez pas besoin d’une application native existante. Le guide vous accompagne du choix de l’entrée Worker à l’exécution de vos pages sur un simulateur ou un émulateur.

## Voir un exemple proche de votre application

| Votre application | Exemple à essayer | Ce que l’exemple démontre |
| --- | --- | --- |
| Pages HTML servies par un Worker | [Pages Hono / Express](/docs/demo/rendering/README) | Navigation entre pages, formulaires et redirections dans une application mobile. |
| Application Void React Pages utilisant D1 | [Exemple Void + D1](/docs/demo/void/README) | Pages rendues côté serveur, interaction React et formulaire écrivant dans D1. |
| Application Next.js déployée via OpenNext | [Exemple OpenNext](/docs/demo/opennext/README) | Raccordement des pages et ressources générées à une compilation mobile ; consultez ses limites de versions et de fonctionnalités. |

Il s’agit d’exemples et de fixtures de test, pas de témoignages de déploiements clients. Chaque guide précise ce qui a été vérifié. Commencez par le parcours le plus proche du vôtre, puis essayez-le avec votre application.

## Ce que vous conservez, ce que vous ajoutez

- **Conservez vos pages et votre backend.** Réutilisez le HTML, les liens, les formulaires et les interactions client pris en charge. D1, les secrets serveur et la logique dépendant du cloud restent sur Workers.
- **Ajoutez une compilation mobile.** Reliez votre Worker et vos ressources publiques à une application Capacitor dotée de son propre nom et identifiant d’application.
- **Vérifiez l’expérience mobile.** Testez la connexion, la navigation, les modifications de données, la réouverture et le rétablissement de la connexion dans votre application.
- **Préparez la distribution.** Configurez la signature et les informations des stores selon le processus de l’application native. La soumission et l’examen par les stores restent des étapes distinctes.

Commencez par exécuter les requêtes sur votre Worker déjà déployé. Les pages dépendant du cloud nécessitent une connexion. Embarquer les ressources client n’en fait pas des applications hors ligne. L’exécution locale facultative est décrite dans le [guide d’exécution](/docs/cloudflare-bindings#choosing-execution) et les [limites de compatibilité](/docs/compatibility).

## Partir de votre framework

| Application Workers | Ce que vous pouvez porter | Guide |
| --- | --- | --- |
| **Hono** | Gestionnaires Fetch et pages HTML, liens et formulaires compris | [Configuration Hono](/docs/build-setup#hono) |
| **Workers Express** | Gestionnaires API et réponses HTML utilisant l’entrée Workers | [Configuration Express](/docs/build-setup#workers-express) |
| **Void React Pages** | Pages rendues par le Worker, hydratation et formulaires D1 | [Configuration Void](/docs/void) |
| **Next.js / OpenNext** | Pages servies par le Worker déployé, avec sélection de routes locales pour les builds compatibles | [Configuration OpenNext](/docs/opennext) |

Chaque guide décrit les versions testées et ses limites. Vous avez déjà un frontend distinct appelant les API Worker ? Conservez-le et utilisez l’[intégration Fetch-only](/docs/runtime#fetch-only-integration).

## Essayer avec votre application

Vous avez besoin du code source de l’application, de sa compilation Worker et d’une URL de Worker de test pour les parcours dépendant du cloud. iOS nécessite macOS et Xcode ; Android nécessite les outils de développement Android. Le [guide de configuration](/docs/integration#before-you-start) renvoie aux prérequis de chaque plateforme.

Installez le package dans votre projet Web, puis suivez la [configuration mobile complète](/docs/integration#workflow) :

```sh
npm install --save-exact cf-workers-native@0.1.7
```

L’installation seule ne génère pas de projet mobile. Le guide couvre l’ajout de Capacitor, la configuration de la compilation mobile et l’exécution sur iOS ou Android. Votre premier objectif est une page existante, un lien vers une autre page et un formulaire ou une action sur les données fonctionnant sur un simulateur ou un émulateur.

**Toutes les versions 0.x sont des préversions**, y compris celles du tag npm `latest`. Les API peuvent changer. Évaluez leur adéquation avec les parcours réels de votre application avant la distribution. Vous migrez depuis `workers-capacitor` ? Suivez les [étapes de migration](/docs/integration#migrating-from-the-old-npm-package).

## Développer avec votre assistant IA

Ouvrez le dépôt de votre application et donnez ce prompt à votre assistant :

```text
Read https://github.com/rdlabo-dev/cf-workers-native/blob/v0.1.8/docs/integration.md.
Add an iOS and Android version of this Workers web app using cf-workers-native@0.1.7
and Capacitor. Preserve the existing pages, backend and Cloudflare deployment configuration.
Use an existing test Worker for cloud-backed requests; ask before any cloud deployment.
Start by verifying one page, navigation and a form or data action on a simulator/emulator.
Then verify the app's authentication and main user flow, and report remaining limits.
```

Fournissez le nom de votre application, son identifiant et l’URL du Worker de test si vous les avez.

## Vous avez déjà une application native ?

Intégrez un écran basé sur Workers dans votre [application UIKit / SwiftUI](/docs/native-embedding#ios) ou votre [application Android](/docs/native-embedding#android) existante. Ces intégrations utilisent les SDK natifs et une compilation Web partagée. Suivez la [configuration des dépendances](/docs/native-embedding#dependency-setup) pour les versions npm, SwiftPM et Maven correspondantes et les exigences Android WebView.

## Préparer l’application pour vos utilisateurs

Suivez un parcours réel du lancement à la déconnexion : chargez une page, naviguez, envoyez un formulaire, rouvrez l’application et vérifiez le comportement sans réseau. Conservez les secrets sur le Worker et appliquez-y authentification et autorisation. La [liste de vérification d’intégration](/docs/integration#6-verify-the-existing-application-in-capacitor) et les [contrôles d’intégration native](/docs/native-embedding#verification) expliquent quoi vérifier.

Pour une application native existante, suivez son processus de publication. Pour Capacitor, poursuivez avec les [zones de sécurité et plugins natifs](/docs/native-rendering-api). Soumission et examen des stores restent partie intégrante de la publication de votre application.

## Explorer et contribuer

[Documentation](/docs/README) · [Exemples](/docs/demo/README) · [Compatibilité](/docs/compatibility) · [Développement](/docs/development) · [Contribuer](/docs/CONTRIBUTING)

## Licence

[MIT](LICENSE).

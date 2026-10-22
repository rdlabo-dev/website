---
title: "Premiers pas"
sourceRevision: "5ad5a6a30781a674ba7f71d3d357bc8ef98b93cf51f2c5e260b9528db462cfdc"
---

# cf-workers-native

**Portez l’application que vous avez créée avec Workers ou Void sur iOS et Android.**

Touchez aussi bien les personnes qui préfèrent le navigateur que celles qui cherchent leurs applications dans les stores. Proposez une application mobile en complément du Web pour laisser chacun choisir la plateforme qui lui convient.

## Choisir comment porter votre application sur mobile

- **Intégrer dans une application iOS existante**
  Ajoutez un écran basé sur Workers à votre application UIKit ou SwiftUI. [Guide iOS](/docs/native-embedding#ios).
- **Intégrer dans une application Android existante**
  Ajoutez un écran basé sur Workers à votre application Android existante. [Guide Android](/docs/native-embedding#android).
- **Créer une nouvelle application mobile**
  Utilisez Capacitor pour créer une application iOS et Android destinée à l’App Store et Google Play. [Guide Capacitor](/docs/integration).

[Documentation](/docs/README) · [Exemples](/docs/demo/README)

## Continuez à développer l’application que vous connaissez

- **Réutilisez vos pages et parcours.** Intégrez le HTML rendu par le Worker, les liens et les formulaires dans une WebView mobile. Conservez le modèle de rendu existant ; une réécriture en SPA n’est pas un préalable.
- **Donnez une place à votre application sur mobile.** Créez une application iOS et Android avec Capacitor, ou intégrez vos pages Workers dans une application native existante.
- **Conservez votre backend sur Workers.** D1, secrets serveur et logique dépendant du cloud restent sur le Worker déployé. La compilation mobile distincte laisse vos entrées de déploiement Cloudflare inchangées.
- **Choisissez ce qui s’exécute sur l’appareil.** Commencez par l’exécution réseau par défaut. Lorsque c’est compatible, sélectionnez explicitement les routes publiques pour une exécution locale et embarquez les ressources client.

L’exécution locale comporte des [limites de compatibilité](/docs/compatibility). Les pages dépendant du cloud nécessitent toujours une connexion ; embarquer leurs ressources client n’en fait pas des applications hors ligne.

## Partir de votre framework

| Application Workers | Ce que vous pouvez porter | Guide |
| --- | --- | --- |
| **Hono** | Gestionnaires Fetch et pages HTML, liens et formulaires compris | [Configuration Hono](/docs/build-setup#hono) |
| **Workers Express** | Gestionnaires API et réponses HTML utilisant l’entrée Workers | [Configuration Express](/docs/build-setup#workers-express) |
| **Void React Pages** | Pages rendues par le Worker, hydratation et formulaires D1 | [Configuration Void](/docs/void) |
| **Next.js / OpenNext** | Pages servies par le Worker déployé, avec sélection de routes locales pour les builds compatibles | [Configuration OpenNext](/docs/opennext) |

Chaque guide décrit les versions testées et ses limites. Vous avez déjà un frontend distinct appelant les API Worker ? Conservez-le et utilisez l’[intégration Fetch-only](/docs/runtime#fetch-only-integration).

## Installez votre application sur votre téléphone

Installez le package JavaScript partagé dans votre projet Web :

Le package renommé est en préparation pour publication. En attendant sa disponibilité sur npm, suivez les [instructions d’archive source](/docs/native-embedding#dependency-setup). Après publication :

```sh
npm install cf-workers-native@0.1.2
```

L’entrée mobile sélectionne l’hôte. Par exemple, une entrée Web iOS commence par :

```ts
import { workersIOS } from "cf-workers-native/ios";

const app = workersIOS({
  baseURL: "https://your-worker.example.com/",
  render: "/",
});
await app.ready;
```

Utilisez `workersAndroid` depuis `cf-workers-native/android` ou `workersCapacitor` depuis `cf-workers-native/capacitor` pour les autres hôtes. Les trois partagent les mêmes options du runtime et les [outils Vite/esbuild](/docs/build-setup).

Cette entrée est une partie de la configuration : raccordez le Worker existant à une **compilation mobile distincte**, puis empaquetez sa sortie avec l’hôte natif choisi. Le [guide d’intégration native](/docs/native-embedding) et le [guide Capacitor](/docs/integration) couvrent tout le parcours. Pour une application native existante, compilez les ressources Web dans le projet Web ou en CI ; le projet natif n’a besoin ni de commandes ni de configuration Capacitor CLI.

**La version 0.1.2 est une préversion.** Les API peuvent changer. L’intégration Android nécessite actuellement WebView `MULTI_PROFILE` et un artefact SDK compilé localement ; aucune publication Maven publique n’est encore disponible. Consultez les [prérequis natifs](/docs/native-embedding#dependency-setup) avant l’intégration. Vous migrez depuis `workers-capacitor` ? Suivez les [étapes de migration](/docs/integration#migrating-from-the-old-npm-package).

## Développer avec votre assistant IA

Ouvrez le dépôt de votre application et donnez ce prompt à votre assistant en remplaçant la cible par **iOS**, **Android** ou **Capacitor** :

```text
Read https://github.com/rdlabo-dev/cf-workers-native/blob/v0.1.2/README.md
and the integration guide for our target: <iOS, Android or Capacitor>.
Bring this Workers application to that target using cf-workers-native@0.1.2.
Preserve its pages, routes, authentication and Cloudflare deployment configuration.
For an existing native app, preserve its entry point and navigation.
Verify the actual user flows on the target platform and report remaining limits.
```

## Préparer l’application pour vos utilisateurs

Suivez un parcours réel du lancement à la déconnexion : chargez une page, naviguez, envoyez un formulaire, rouvrez l’application et vérifiez le comportement sans réseau. Conservez les secrets sur le Worker et appliquez-y authentification et autorisation. La [liste de vérification d’intégration](/docs/integration#6-verify-the-existing-application-in-capacitor) et les [contrôles d’intégration native](/docs/native-embedding#verification) expliquent quoi vérifier.

Pour une application native existante, suivez son processus de publication. Pour Capacitor, poursuivez avec les [zones de sécurité et plugins natifs](/docs/native-rendering-api). Soumission et examen des stores restent partie intégrante de la publication de votre application.

## Explorer et contribuer

[Documentation](/docs/README) · [Exemples](/docs/demo/README) · [Compatibilité](/docs/compatibility) · [Développement](/docs/development) · [Contribuer](/docs/CONTRIBUTING)

## Licence

[MIT](LICENSE).

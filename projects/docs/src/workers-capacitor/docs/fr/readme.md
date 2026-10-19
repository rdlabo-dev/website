---
title: "workers-capacitor"
sourceRevision: 5a65f057d592de2bdf4585abd0f47b718ed69db00f4a7d448c4394703898ee86
---

# workers-capacitor

Portez vos applications Cloudflare Workers sur iOS et Android.

workers-capacitor connecte les applications Cloudflare Workers existantes à Capacitor pour réutiliser leurs pages, leurs routes et leur logique applicative dans une application iOS ou Android avec un minimum de modifications. Votre application web reste sur Workers, avec une version mobile que vous pouvez préparer pour la distribution sur l’App Store et Google Play.

[Void 1.1.12](https://github.com/voidzero-dev/void/releases/tag/v1.1.12) ajoute la prise en charge de la navigation Capacitor sur iOS ! Cette mise à jour permet de porter votre application Void sur iOS et Android avec workers-capacitor. [Premiers pas avec Void](/docs/void).

## Installez votre application sur votre téléphone

Partez de l’application que vous avez déjà. Le [guide d’intégration](/docs/integration) vous accompagne depuis votre projet Workers existant jusqu’à son ouverture sur iOS ou Android, y compris la configuration de Capacitor s’il s’agit de votre première application mobile.

0.1.0 est une version Preview. Suivez les étapes d’installation du guide ; les API peuvent évoluer avant une version stable.

Si vous utilisez un assistant de programmation IA, ouvrez le dépôt de votre application et donnez-lui cette instruction :

```text
Follow https://github.com/rdlabo-dev/workers-capacitor/blob/v0.1.0/docs/integration.md
to bring this app to iOS and Android with workers-capacitor.
Preserve its pages, routes and authentication; verify it on the target platforms.
```

Choisissez le parcours correspondant à votre application :

- [Void React Pages + D1](/docs/void)
- [Hono et Workers Express](/docs/build-setup#frameworks)
- [Next.js / OpenNext](/docs/opennext)

## Continuez à développer l’application que vous connaissez

Continuez à travailler avec vos pages, formulaires et routes existants. [Capacitor](https://capacitorjs.com/) transforme votre interface web en application mobile installable ; workers-capacitor y connecte votre Worker existant.

Votre base de données peut rester où elle se trouve. Les requêtes qui nécessitent D1 ou d’autres services cloud s’exécutent sur votre Worker déployé existant, tandis que le code pris en charge peut s’exécuter sur l’appareil. Consultez la [configuration du build](/docs/build-setup) et les [politiques d’exécution](/docs/cloudflare-bindings) pour plus de détails.

Si vous disposez déjà d’un frontend distinct, conservez ses appels d’API existants avec l’[intégration Fetch uniquement](/docs/runtime#fetch-only-integration).

## Étapes suivantes

Votre application s’affiche ! Personnalisez-la maintenant, étape par étape :

1. Rendez votre application reconnaissable sur l’écran d’accueil et à son ouverture. Ajoutez votre icône et votre écran de démarrage avec le [guide des ressources de Capacitor](https://capacitorjs.com/docs/guides/splash-screens-and-icons), puis recompilez et relancez l’application pour voir vos modifications.
2. Rendez l’écran agréable à utiliser. Vérifiez que les boutons restent à l’écart de l’encoche et de l’indicateur d’accueil ; ajustez [iOS Safe Area](/docs/native-rendering-api#ios-safe-area) si nécessaire.
3. Permettez aux utilisateurs de prendre une photo, de partager du contenu ou de recevoir un retour haptique après une action. Choisissez une fonction adaptée à votre application et ajoutez-la avec un [plugin Capacitor](/docs/native-rendering-api#native-plugins).
4. Lorsque les builds répétés et les envois aux boutiques prennent du temps, [Capawesome Cloud](https://capawesome.io/docs/cloud/getting-started/) peut automatiser ces étapes. Son guide vous accompagne dans la configuration.

## Avant la publication

Gardez les secrets sur le serveur et authentifiez les requêtes de l’application. Suivez les [consignes de sécurité](/docs/integration#5-security-the-device-is-not-a-trusted-server), examinez les [limites connues](/docs/compatibility) et testez votre application sur ses plateformes cibles.

## Explorer et contribuer

- [Découvrez comment connecter d’autres applications](/docs/demo/README)
- [Comportement du runtime](/docs/runtime) · [API de rendu natif](/docs/native-rendering-api)
- [Développement et tests](/docs/development) · [Périmètre de vérification](/docs/demo/tests/README)
- [Contribuer](/docs/CONTRIBUTING)

## Licence

[MIT](LICENSE).

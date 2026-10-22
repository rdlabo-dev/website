---
title: "Configurer Native UI dans une application Ionic"
sourceRevision: "70b2faca3f1179b7c9c04a93d82d133cf8f1a2f13aa7505829b04554d432041a"
---
# Configurer Native UI dans une application Ionic

Conservez votre apparence Web et affichez nativement les contrôles Ionic compatibles sur iOS. Ce guide ne nécessite pas les feuilles de style du thème iOS.

Vous utilisez déjà le thème iOS 27 ? Suivez [Ajouter Native UI à votre thème](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.0/packages/theme-ios27/docs/add-native-ui.md). Sans Ionic, suivez plutôt la [configuration HTML](framework-independent.md).

Consultez d’abord le [fonctionnement de la projection](../README.md#how-projection-works) si vous découvrez Native UI. Ce guide relie vos contrôles Ionic existants à cette présentation.

## Avant de commencer

| Prérequis | Contrôles natifs ordinaires |
| ------------------------- | -------------------------------------------------------------------------- |
| Ionic | `>=8.8.1 <10` |
| Projet natif | Capacitor 8 avec un projet iOS |
| Outils de compilation | Xcode 26 ou ultérieur |
| Appareil ou simulateur | iOS 26 ou ultérieur |
| Gestionnaire de dépendances natives | Conservez votre intégration SPM ou CocoaPods. |
| Vertical Bars | Consultez les [prérequis de l’appareil](vertical-bars.md#native-rendering) distincts. |

Si l’application n’utilise pas encore Capacitor, créez et configurez son projet iOS avant les étapes natives ci-dessous. Les aperçus navigateur conservent les contrôles Web et ne montrent pas le rendu UIKit ou SwiftUI.

## 1. Installer le plugin

[Capacitor Foldable](https://github.com/erkamyaman/capacitor-foldable) est notre intégration standard pour l’état de l’appareil. Ses API de placement et de posture permettent à l’application de contrôler l’adaptation de la disposition ; l’installation est suivie du raccordement des valeurs initiales et des événements de changement.

Conservez vos packages Capacitor en version 8. Ajoutez ces dépendances directes :

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

L’adaptateur Ionic utilise `@ionic/core`, déjà fourni par votre application Ionic. Ne retirez pas vos styles Web : ils habillent le contenu et les contrôles de repli.

## 2. Activer le shell

Appelez une seule fois au démarrage après montage de `ion-app` :

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';

const shell = await enableNativeUI();
```

Conservez le handle retourné pour désactiver des fonctionnalités ou arrêter la projection. Appelez `await shell.destroy()` à la destruction de son propriétaire applicatif. Ne démarrez pas un shell par page.

Le balisage Ionic existant fournit libellés, icônes, état désactivé et actions. Par exemple, un en-tête fixe existant peut contenir :

```html
<ion-header>
  <ion-toolbar>
    <ion-title>My app</ion-title>
    <ion-buttons slot="end">
      <ion-button aria-label="Add">
        <ion-icon slot="icon-only" name="add"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
```

Conservez le gestionnaire de votre framework sur le bouton original et enregistrez l’icône comme d’habitude. Consultez le [balisage compatible](native-ui.md#supported-markup) pour l’admissibilité ; les contrôles incompatibles restent Web.

### Placer le démarrage à la racine de votre framework

Conservez un shell pour toute l’application, au-dessus des pages routées. L’utilitaire applicatif suivant sérialise démarrage et nettoyage asynchrones, y compris les remontages React en développement. Placez-y vos options partagées et retirez tout autre appel à `enableNativeUI()` :

```ts
// native-ui.ts — à placer à côté du composant racine
import { enableNativeUI, type NativeUIHandle } from '@rdlabo/capacitor-native-ui';
// Sans Ionic, utilisez plutôt @rdlabo/capacitor-native-ui/core.

let lifecycle = Promise.resolve();
const report = (error: unknown) => console.error('Native UI lifecycle failed', error);

export function mountNativeUI(): () => void {
  let disposed = false;
  let shell: NativeUIHandle | undefined;
  lifecycle = lifecycle
    .then(async () => {
      if (disposed) return;
      shell = await enableNativeUI(); // Placez vos options ici.
      if (disposed) await shell.destroy();
    })
    .catch(report);
  return () => {
    disposed = true;
    lifecycle = lifecycle
      .then(async () => {
        await shell?.destroy();
        shell = undefined;
      })
      .catch(report);
  };
}
```

Choisissez **un seul** framework ci-dessous. L’utilitaire appartient à votre application ; ce n’est pas un package à installer.

**Angular :** appelez depuis le composant racine après le premier rendu DOM et enregistrez le nettoyage avec son `DestroyRef` :

```ts
import { afterNextRender, DestroyRef, inject } from '@angular/core';
import { mountNativeUI } from './native-ui';

// Dans le constructeur du composant racine AppComponent :
const destroyRef = inject(DestroyRef);
afterNextRender(() => {
  const stop = mountNativeUI();
  destroyRef.onDestroy(stop);
});
```

**React :** utilisez un effet dans le composant racine qui rend `IonApp` :

```tsx
import { useEffect } from 'react';
import { mountNativeUI } from './native-ui';

// Dans le composant racine App :
useEffect(() => mountNativeUI(), []);
```

**Vue :** enregistrez les hooks de cycle de vie dans le `<script setup>` du composant racine :

```ts
import { onMounted, onBeforeUnmount } from 'vue';
import { mountNativeUI } from './native-ui';

let stop: (() => void) | undefined;
onMounted(() => {
  stop = mountNativeUI();
});
onBeforeUnmount(() => {
  stop?.();
});
```

Ces hooks gèrent la durée de vie de l’application, pas les transitions de pages individuelles. Configurez aussi la navigation ci-dessous.

## 3. Coordonner la navigation

Pour la coordination facultative des animations Ionic, installez `@rdlabo/ionic-theme-ios27` et mettez à jour Native UI ensemble pour aligner leurs versions. Configurez la navigation avant initialisation d’Ionic. Son adaptateur conserve les transitions Ionic par défaut sans charger le CSS du thème :

```sh
npm install @rdlabo/ionic-theme-ios27 @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

```ts
import { iosTransitionAnimation, mdTransitionAnimation, type AnimationBuilder } from '@ionic/core';
import { withNativeUITransition } from '@rdlabo/ionic-theme-ios27';

const defaultTransition: AnimationBuilder = (baseEl, opts) =>
  (opts.mode === 'ios' ? iosTransitionAnimation : mdTransitionAnimation)(baseEl, opts);

const ionicConfig = {
  navAnimation: withNativeUITransition(defaultTransition),
};
```

Passez cette option à `provideIonicAngular` d’Angular, `setupIonicReact` de React ou aux options `IonicVue` de Vue. Pour les animations personnalisées, suivez les [instructions de l’adaptateur](migration.md#native-ui-transition-adapter). Cet adaptateur facultatif nécessite le package du thème, mais ni ses styles ni le remplacement de votre animation.

Pour une application utilisant uniquement le plugin, suivez la [navigation sans thème](#navigation-without-the-theme) ci-dessous. Configurez l’une des approches avant de tester la navigation.

## 4. Compiler, synchroniser et exécuter

Compilez le Web de l’application, puis synchronisez :

```sh
npx cap sync ios
```

Exécutez depuis Xcode sur un appareil ou simulateur iOS 26+. Les contrôles fixes compatibles doivent être natifs et invoquer leurs gestionnaires originaux. Naviguez dans les deux sens, y compris en annulant un geste de retour. Une compilation navigateur ou Android doit conserver des contrôles Web fonctionnels.

| Si vous voyez… | Vérifiez… |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Tous les contrôles restent Web sur iOS | Le package natif est une dépendance directe, l’application a été synchronisée et recompilée, et le démarrage s’est exécuté sur un OS compatible. |
| Un seul contrôle reste Web | Comparez son balisage et ses styles aux [contrôles pris en charge](native-ui.md#supported-markup). |
| Chevauchement pendant la navigation | Configurez l’adaptateur ou le cycle suspension/reprise avant de naviguer. |
| Styles ou espacement manquants | Conservez le CSS Web de l’application ; le plugin ne fournit pas la disposition de page. |

## Étapes suivantes

- [Vertical Bars uniquement](ionic-vertical-bars.md) : configuration pas à pas du rail avec votre thème existant.
- [Configuration](configuration.md) : choisir les contrôles et modifier le rail à l’exécution.
- [Contenu SwiftUI ou Compose personnalisé](native-ui-extensions.md) : créer une extension locale.
- [Migration](migration.md) : actualiser anciens noms, imports et projets natifs.

## Navigation sans thème

Native UI ne dépend pas d’un thème ni d’un constructeur d’animation Ionic. Votre routeur peut suspendre la projection avant de changer de page et la reprendre après fin ou annulation :

```ts
const suspension = await shell.suspend();
try {
  await navigate();
} finally {
  await suspension.resume();
}
```

La promesse doit se terminer après stabilisation du DOM et des animations, pas simplement après changement d’URL. Reliez retour navigateur, annulation de geste et navigation programmée au même cycle. Pour Ionic, utilisez l’adaptateur ci-dessus pour couvrir les transitions animées et interactives.

Pour une application HTML sans routeur, voici un changement de page animé complet. Une animation annulée restaure l’ancienne page avant de reprendre la projection :

```ts
async function showPage(current: HTMLElement, next: HTMLElement) {
  const lease = await shell.suspend();
  try {
    current.hidden = true;
    next.hidden = false;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const animation = next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
      try {
        await animation.finished;
      } catch {
        next.hidden = true;
        current.hidden = false;
      }
    }
  } finally {
    await lease.resume();
  }
}
```

Sérialisez les changements si votre application permet une nouvelle navigation avant résolution de cette promesse. Les gestionnaires de clic source restent responsables du routeur ou de l’historique ; le plugin ne navigue pas pour vous.

---
title: "Superpositions Ionic"
sourceRevision: "c64243565ccfb68c69116a187b285ca477c45de5d524d24e61f89c29008a0bb8"
---
# Couvrir l’interface native avec les superpositions Ionic

Utilisez cet adaptateur lorsqu’une modale Ionic ou une autre superposition Web couvrante doit apparaître au-dessus du contenu natif géré par l’Engine. L’enregistrement natif gère la capture et la restauration, mais ne peut pas déduire le cycle de vie de présentation d’Ionic à partir d’une vue native. Ce moniteur partagé prend la décision de couverture pour tous les enregistrements.

Intégrez d’abord le plugin à l’aide du guide [Capacitor](../getting-started/capacitor.md) ou [Cordova](../getting-started/cordova.md). Les applications sans Ionic utilisent leurs propres notifications de cycle de vie et n’installent pas cet adaptateur.

Par exemple, ouvrir une modale de réglages Ionic doit couvrir la barre d’onglets native en arrière-plan tout en laissant utilisable le bouton natif de fermeture de la modale. Une notification de masquage globale ne peut pas exprimer cette relation. Le moniteur partagé évalue chaque hôte par rapport à la pile de superpositions afin que les plugins indépendants utilisent la même règle de couverture.

## Activer une seule fois

Dans une application Ionic, effectuez cet appel une fois au démarrage. Si vous l’appelez directement depuis l’application, installez `@webview-native-ui/engine` comme dépendance directe de l’application :

```ts
import { enableSupportIonicOverlays } from '@webview-native-ui/engine/ionic';

enableSupportIonicOverlays();
```

Les mainteneurs de plugins peuvent inclure cet extrait dans les instructions de configuration de l’application ou l’appeler dans un initialiseur JS existant. `@rdlabo/capacitor-native-ui` appelle déjà le même initialiseur en interne ; ses utilisateurs n’ont aucun appel supplémentaire à ajouter. Les applications sans Ionic l’omettent. L’enregistrement natif seul n’installe pas les écouteurs d’événements Ionic.

## Couverture et durée de vie

Un moniteur est partagé par document, y compris entre le module npm et le runtime injecté par Swift/Android. Répéter l’initialisation n’ajoute pas d’écouteurs et n’efface pas la configuration explicite. Détruire une projection supprime uniquement son abonnement ; cela n’arrête pas le moniteur utilisé par les autres plugins. Le moniteur vit aussi longtemps que le document.

Par défaut, il couvre les événements de cycle de vie de Modal, Popover, Alert, Action Sheet, Loading, Picker, Toast et Menu. Il compare le DOM de chaque projection à la pile des superpositions actives : le contenu de la modale de premier plan reste natif, tandis que le contenu couvert utilise temporairement son image préparée. Les Toasts et les arrière-plans inactifs des panneaux ne couvrent pas de surface. Les superpositions imbriquées maintiennent la couverture jusqu’à ce que la pile restante permette la restauration. En l’absence d’image, le repli Web normal est conservé. Cette couverture temporaire n’écrase jamais une destination explicite `web` ou `none` du plugin. Les projections enregistrées plus tard lisent l’état actuel.

Un popover affiché dans une fenêtre native diffère d’un popover rendu dans la WebView : son emplacement réservé dans le DOM ne doit pas être traité comme une superposition Web couvrante. Le plugin `@rdlabo/capacitor-native-ui` signale au moniteur cette prise en charge native de la présentation. Si sa présentation native échoue, il libère cette propriété et le moniteur reprend la couverture Web habituelle. Cette exception repose sur une intégration explicite ; elle n’est pas déduite du seul DOM du popover.

## Personnaliser les mises en page inhabituelles

Les paramètres facultatifs s’appliquent à l’ensemble du document. Conservez les valeurs par défaut pour les superpositions Ionic ordinaires. Utilisez `exclude` pour une superposition de l’application qui ne doit pas couvrir le contenu natif, et `additional` lorsque la même application utilise aussi une boîte de dialogue personnalisée avec ses propres événements de cycle de vie. Utilisez `covers` uniquement lorsque l’imbrication DOM et l’état de l’arrière-plan ne décrivent pas les hôtes que cette mise en page personnalisée couvre réellement :

```ts
enableSupportIonicOverlays({
  exclude: '[data-nonblocking-overlay]',
  additional: [
    {
      selector: 'app-dialog',
      events: {
        willPresent: 'appDialogWillPresent',
        didDismiss: 'appDialogDidDismiss',
      },
    },
  ],
});
```

Utilisez `covers(overlay, target)` uniquement lorsqu’une projection DOM enregistrée nécessite une règle de couverture personnalisée ; renvoyez `undefined` pour le comportement par défaut, ou un booléen pour le remplacer. Les exclusions et la propriété explicite d’une fenêtre native sont prioritaires. La relation standard utilise l’ordre des superpositions, l’imbrication DOM et l’état de l’arrière-plan, plutôt que d’essayer d’interpréter des contextes d’empilement CSS arbitraires. Configurez explicitement les mises en page inhabituelles.

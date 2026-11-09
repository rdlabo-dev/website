---
title: "Pause et reprise pour les superpositions personnalisées"
sourceRevision: "6bc991883033a91a4b656683f020629a717ca2d9bec6de1070bbe4acdef407f6"
---
# Couvrir l’interface native avec une superposition Web personnalisée

Utilisez `pause()` avant de présenter une modale personnalisée ou un `div` au-dessus de l’interface native, puis `resume()` à sa fermeture. Pour les superpositions Ionic, utilisez l’[intégration Ionic](ionic-overlays.md) automatique : elle partage cette coordination, mais ne couvre que les surfaces situées derrière la superposition.

## Auteurs de plugins : réexporter les fonctions de l’Engine

```ts
export { pause, resume } from '@webview-native-ui/engine';
```

Ces fonctions partagent un seul compteur de pauses entre les plugins et bundles compatibles avec l’Engine dans un même document. Aucun wrapper ni méthode de plugin natif n’est nécessaire.

## Auteurs d’applications : associer chaque pause à une reprise

```ts
import { pause, resume } from 'your-plugin';

pause();
try {
  await showCustomModal();
} finally {
  resume();
}
```

`showCustomModal()` doit se résoudre à la fermeture de la modale. Pour les modales pilotées par événements, appelez `resume()` lors de la fermeture, de l’annulation ou d’un échec. Utilisez une paire par superposition, même avec plusieurs plugins ; les superpositions imbriquées nécessitent chacune leur propre paire.

Une pause remplace les surfaces natives visibles par des images Web préparées ou leur repli Web habituel. Les surfaces masquées restent masquées. Le dernier `resume()` libère la demande tout en préservant l’intention de présentation de chaque plugin et la couverture Ionic restante.

Le compteur ne suit pas les appelants et n’associe pas les appels individuels. Un `resume()` supplémentaire pendant une pause peut libérer la demande d’une autre superposition ; seul un `resume()` lorsque le compteur est à zéro est sans effet. Chaque propriétaire doit libérer exactement une fois chaque pause qu’il a demandée.

Les deux fonctions retournent immédiatement, sans attendre les confirmations natives ni le rendu. Le retour de `pause()` ne signifie pas que l’interface native est déjà passée derrière la superposition Web ; elle peut rester au premier plan jusqu’à la fin du transfert. Le dernier `resume()` reporte la restauration native à la deuxième frame d’animation, laissant au retrait de la superposition une occasion d’être dessiné sans garantir la fin du travail du compositeur. Appelez-le après avoir retiré la superposition ou terminé son animation de fermeture. Un nouveau `pause()` annule une restauration en attente. Appeler `pause()` juste avant un `window.alert()` bloquant ne garantit donc pas un transfert terminé. Ces fonctions ne détectent pas automatiquement les superpositions personnalisées.

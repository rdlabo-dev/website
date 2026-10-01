---
title: "CodeScanner"
sourceRevision: "2a1e905065af178899cfb25f371b7fb81b9ea8cdf8d41794cfdad2839da37c87"
---
# CodeScanner

`CodeScanner` ouvre une fenêtre modale native de lecture et fournit les valeurs lues. Appelez-le après l’[installation](/docs/readme#installation) et la configuration de l’autorisation de l’appareil photo. Lancez-le depuis une action utilisateur, comme un bouton. Enregistrez `addListener` avant `present` pour ne pas manquer la première détection. `present` se résout à la fermeture de la fenêtre modale, après une lecture ou une annulation. Supprimez ensuite le handle de l’écouteur pour éviter leur accumulation lors des lectures suivantes.

## present

Lisez un code QR connu et vérifiez `event.code` dans l’écouteur, puis fermez la fenêtre modale ou laissez le mode de lecture unique la fermer :

```typescript
import { CodeScanner } from '@rdlabo/capacitor-codescanner';
import type { PluginListenerHandle } from '@capacitor/core';

const scanQRCode = async () => {
  let handle: PluginListenerHandle | undefined;
  try {
    handle = await CodeScanner.addListener('CodeScannerCatchEvent', (event) => {
      console.log('Scanned code:', event.code);
    });

    await CodeScanner.present({
      detectionWidth: 0.6,
      detectionHeight: 0.15,
      isMulti: false,
    });
  } finally {
    await handle?.remove();
  }
};
```

Pour les lectures multiples en continu, conservez le même parcours écoute → présentation → suppression et définissez `isMulti: true`. Ne rappelez pas `addListener` sans supprimer le handle précédent :

```typescript
await CodeScanner.present({
  detectionWidth: 0.8,
  detectionHeight: 0.2,
  isMulti: true,
});
```

`isMulti: true` garde la fenêtre modale ouverte afin de lire plusieurs codes jusqu’à sa fermeture par l’utilisateur. Les champs des options sont décrits sur la page [API](/docs/api#scanneroption).

## Filtrer les types de codes

Dans la version 8.0.3, les types TypeScript publiés exposent `metadataObjectTypes`, tandis que l’implémentation native attend `CodeTypes`. Pour cette version, utilisez les valeurs par défaut : `qr`, `code39`, `ean13`.

La charge utile de l’événement est `{ code: string }`. Consultez les signatures dans l’[API](/docs/api).

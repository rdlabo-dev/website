---
title: "Imprimer des PDF et des fichiers"
sourceRevision: "ed04f0427cf8701ea5a516aabbed9028a0e53f44648eec7996e39a89d336e7c3"
---
# Imprimer des PDF et des fichiers

Présentez l’interface d’impression du système pour un PDF ou un autre fichier. Android et iOS uniquement. Faites-le après l’[installation](/docs/readme#installation). Imprimez la WebView courante avec [Imprimer la WebView](/docs/web).

Transmettez le chemin d’un véritable fichier local déjà écrit par votre application, pas une chaîne fictive. Android prend en charge les chemins de fichier, les URL `file://` et les URL `content://`. iOS prend en charge les chemins de fichier et les URL `file://` locales. `mimeType` est propre à Android.

```ts
import { Printer } from '@rdlabo/capacitor-printer';

// filePath doit désigner un fichier existant sur l’appareil.
await Printer.printFile({ path: filePath });
// Une fois await terminé, le système n’a plus besoin du fichier source ; supprimez-le alors si vous n’en avez plus besoin.
```

Les signatures se trouvent sur la page [API](/docs/api#printfile).

---
title: "Imprimer la WebView"
sourceRevision: "145f2af17ecb0168492978f5495d7f1cdfe1647f0a4c589e5180a0730c1813aa"
---
# Imprimer la WebView

Présentez l’interface d’impression du système pour le contenu de la WebView courante. Android et iOS uniquement. Faites-le après l’[installation](/docs/readme#installation). Depuis un bouton, c’est le moyen le plus rapide de vérifier l’interface d’impression du système sans fichier externe. Imprimez un PDF ou un autre fichier avec [Imprimer des PDF et des fichiers](/docs/pdf).

```ts
import { Printer } from '@rdlabo/capacitor-printer';

await Printer.printWebView({ name: 'Document' });
```

`name` est le nom de la tâche d’impression ; sa valeur par défaut est `'Document'`.

<!-- !::printWebView:: -->

<!-- !::PrintWebViewOptions:: -->

---
title: "Premiers pas"
sourceRevision: "5b094362b76208e3af7800b47ade8e90409ba70ca0b3e772bb3e320689482d57"
---
# @rdlabo/capacitor-printer

<!-- rdlabo-docs-omit -->
[![version npm](https://badge.fury.io/js/@rdlabo%2Fcapacitor-printer.svg)](https://badge.fury.io/js/@rdlabo%2Fcapacitor-printer)
[![Licence : MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- /rdlabo-docs-omit -->

Imprimez des fichiers ou la WebView courante depuis une application Capacitor.

Ce plugin encapsule l’interface d’impression native d’iOS et d’Android. Commencez par la WebView courante, sans fichier externe, ou imprimez un fichier local comme un PDF généré dans votre application.

<!-- rdlabo-docs-omit -->
**Documentation complète :** [https://docs.rdlabo.dev/projects/capacitor-printer](https://docs.rdlabo.dev/projects/capacitor-printer)
<!-- /rdlabo-docs-omit -->

**Documentation :** [Lire la documentation complète](https://docs.rdlabo.dev/projects/capacitor-printer)

## Installer

```bash
npm install @rdlabo/capacitor-printer
npx cap sync
```

## Utilisation

Depuis le gestionnaire d’un bouton, imprimez la WebView courante pour ouvrir l’interface d’impression du système : [Imprimer la WebView](https://docs.rdlabo.dev/projects/capacitor-printer/docs/web). Imprimez un véritable PDF local ou un autre fichier avec [Imprimer des PDF et des fichiers](https://docs.rdlabo.dev/projects/capacitor-printer/docs/pdf).

<!-- rdlabo-docs-omit -->
### Imprimer la WebView courante

```ts
import { Printer } from '@rdlabo/capacitor-printer';

const printPage = async () => {
  await Printer.printWebView({ name: 'Document' });
};
```

### Imprimer un fichier

```ts
import { Printer } from '@rdlabo/capacitor-printer';

const printPdf = async (filePath: string) => {
  await Printer.printFile({
    path: filePath,
    mimeType: 'application/pdf',
  });
  // Après await, le système n’a plus besoin du fichier source ; vous pouvez alors le supprimer.
};
```

<!-- /rdlabo-docs-omit -->

## Quand l’utiliser

Utilisez ce plugin lorsque votre application doit présenter la boîte de dialogue d’impression du système, par exemple pour :

- Imprimer un reçu ou une facture au format PDF.
- Imprimer un rapport généré dans l’application.
- Imprimer le contenu de la page courante.

## Remarques sur les plateformes

- **iOS et Android** : `printFile` et `printWebView` sont tous deux pris en charge.
- **Web** : non pris en charge, car les navigateurs fournissent déjà `window.print()`.

## API

<docgen-index>

* [`printFile(...)`](/docs/readme#printfile)
* [`printWebView(...)`](/docs/readme#printwebview)
* [Interfaces](/docs/readme#interfaces)
* [Alias de types](/docs/readme#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### printFile(...)

```typescript
printFile(options: PrintFileOptions) => Promise<void>
```

Présente l’interface d’impression pour imprimer un fichier.

La promise se termine lorsque le système d’exploitation n’a plus besoin du fichier source ; celui-ci peut donc être supprimé en toute sécurité dans un bloc `finally`.

Disponible uniquement sur Android et iOS.

| Paramètre         | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code><a href="#printfileoptions">PrintFileOptions</a></code> |

--------------------


### printWebView(...)

```typescript
printWebView(options?: PrintOptions | undefined) => Promise<void>
```

Présente l’interface d’impression pour imprimer le contenu de la WebView.

| Paramètre         | Type                                                  |
| ------------- | ----------------------------------------------------- |
| **`options`** | <code><a href="#printoptions">PrintOptions</a></code> |

--------------------


### Interfaces


#### PrintFileOptions

| Propriété           | Type                | Description                                                                                                                                 |
| -------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **`path`**     | <code>string</code> | Chemin du fichier. Android prend en charge les chemins de fichier, les URL `file://` et les URL `content://`. iOS prend en charge les chemins de fichier et les URL `file://` locales. |
| **`mimeType`** | <code>string</code> | Type MIME du fichier. Utilisé uniquement sur Android.                                                                                            |


#### PrintOptions

| Propriété       | Type                | Description                | Valeur par défaut                 |
| ---------- | ------------------- | -------------------------- | ----------------------- |
| **`name`** | <code>string</code> | Nom de la tâche d’impression. | <code>'Document'</code> |


### Alias de types


#### PrintWebViewOptions

<code><a href="#printoptions">PrintOptions</a></code>

</docgen-api>

<!-- rdlabo-docs-omit -->
## Canaux de préversion

Une pull request ouverte, non marquée comme brouillon, peut être publiée sous le dist-tag npm `beta` après la réussite de ses workflows `Validation` et `Package Candidate`. Un propriétaire ou mainteneur du dépôt doit ajouter un commentaire dont le corps complet est :

```text
/beta
```

La demande autorise uniquement le SHA de tête de la pull request présent au moment de l’ajout du commentaire. Le workflow vérifie de nouveau l’autorisation du propriétaire ou mainteneur et le SHA de tête juste avant la publication. Chaque nouveau commit exige une nouvelle réussite de la CI et un nouveau commentaire `/beta` d’un propriétaire ou mainteneur. Les pull requests issues de forks sont prises en charge. Celles qui modifient un workflow conditionnant les versions ne peuvent pas être publiées en bêta avant l’intégration de ces changements dans `main`.

Les versions bêta utilisent `<base>-beta.pr<PR number>.sha<12-character SHA>`. Le candidat est construit dans un workflow en lecture seule sans identifiants de publication npm. Le workflow de publication privilégié publie uniquement l’artefact de package immuable validé, avec les scripts de cycle de vie désactivés. Un échec de notification ne peut pas invalider une publication npm réussie.

Lorsqu’une pull request est fusionnée dans `main`, elle est automatiquement publiée sous `beta` uniquement après la réussite de la CI requise et de `Package Candidate` pour ce commit de fusion exact. Les pushes directs vers `main` ne publient pas de candidat.

Seul `npm run release` crée un tag de version. Les tags stables `vX.Y.Z` sont publiés sous npm `latest` ; les tags de révision ou de préversion sont publiés sous `next`. Ni les publications `beta` ni les publications `next` ne modifient le dist-tag npm `latest`.

## Mainteneurs

- [rdlabo](https://rdlabo.dev/)
<!-- /rdlabo-docs-omit -->

<!-- rdlabo-docs-omit -->
## Licence

Ce projet est distribué sous [licence MIT](./LICENSE).
<!-- /rdlabo-docs-omit -->

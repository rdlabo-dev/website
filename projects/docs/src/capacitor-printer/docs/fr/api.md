---
title: "API"
sourceRevision: "9a87c6df063eefb814497dd3ab60440c254b124cfee47ceebb1881f6a3dd5f25"
---
* [`printFile(...)`](#printfile)
* [`printWebView(...)`](#printwebview)
* [Interfaces](#interfaces)
* [Alias de types](#type-aliases)

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

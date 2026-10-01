---
title: "API"
sourceRevision: "9a87c6df063eefb814497dd3ab60440c254b124cfee47ceebb1881f6a3dd5f25"
---
* [`printFile(...)`](#printfile)
* [`printWebView(...)`](#printwebview)
* [Interfaces](#interfaces)
* [Typaliase](#type-aliases)

<!--Die JSDoc-Kommentare in der Quelldatei aktualisieren und docgen erneut ausführen, um die folgende Dokumentation zu aktualisieren-->

### printFile(...)

```typescript
printFile(options: PrintFileOptions) => Promise<void>
```

Zeigt die Druckoberfläche zum Drucken einer Datei an.

Das Promise wird abgeschlossen, sobald das Betriebssystem die Quelldatei
nicht mehr benötigt. Die Datei kann dann sicher in einem `finally`-Block gelöscht werden.

Nur unter Android und iOS verfügbar.

| Parameter         | Typ                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code><a href="#printfileoptions">PrintFileOptions</a></code> |

--------------------

### printWebView(...)

```typescript
printWebView(options?: PrintOptions | undefined) => Promise<void>
```

Zeigt die Druckoberfläche zum Drucken des WebView-Inhalts an.

| Parameter         | Typ                                                  |
| ------------- | ----------------------------------------------------- |
| **`options`** | <code><a href="#printoptions">PrintOptions</a></code> |

--------------------

### Interfaces

#### PrintFileOptions

| Eigenschaft           | Typ                | Beschreibung                                                                                                                                 |
| -------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **`path`**     | <code>string</code> | Pfad zur Datei. Android unterstützt Dateipfade, `file://`-URLs und `content://`-URLs. iOS unterstützt Dateipfade und lokale `file://`-URLs. |
| **`mimeType`** | <code>string</code> | MIME-Typ der Datei. Wird nur unter Android verwendet.                                                                                            |

#### PrintOptions

| Eigenschaft       | Typ                | Beschreibung                | Standard                 |
| ---------- | ------------------- | -------------------------- | ----------------------- |
| **`name`** | <code>string</code> | Name des Druckauftrags. | <code>'Document'</code> |

### Typaliase

#### PrintWebViewOptions

<code><a href="#printoptions">PrintOptions</a></code>

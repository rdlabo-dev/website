---
title: "Erste Schritte"
sourceRevision: "bf76807958489fc2814887796606cf9f043ec69331351cfa7d64884ea3e528cd"
---
# @rdlabo/ngx-cdk-scroll-strategies

> Virtuelles Scrollen mit Angular CDK und variablen oder dynamischen Elementhöhen.

`@rdlabo/ngx-cdk-scroll-strategies` ist eine virtuelle Angular-CDK-Scrollstrategie für Listen mit variablen Elementhöhen. Sie erlaubt die Angabe der exakten Pixelgröße jedes Elements, statt einen einzigen festen Wert `[itemSize]` für die gesamte Liste zu verlangen.

Verwenden Sie `[itemDynamicSizes]` mit bekannten oder gemessenen Elementhöhen. Anders als die experimentelle Strategie `[autosize]` schätzt diese Bibliothek ungemessene Elemente nicht anhand einer Durchschnittsgröße. Sie arbeitet mit `@angular/cdk/scrolling` und hängt nicht von Ionic ab.

## Installation

```bash
npm install @rdlabo/ngx-cdk-scroll-strategies
```

Folgen Sie anschließend [Einfache Verwendung](https://docs.rdlabo.dev/projects/ngx-cdk-scroll-strategies/docs/simple), um einen vollständigen Viewport mit bekannten Höhen zu erstellen.

Jedes Datenelement benötigt einen entsprechenden Eintrag in `itemDynamicSizes` in derselben Reihenfolge. Jeder Wert `itemSize` muss eine endliche Zahl größer als null sein. Aktualisiert Angular Daten- und Größensignals in getrennten Durchläufen, behält die Strategie die letzte vollständige Geometrie bei, bis ihre Längen übereinstimmen. Unbekannte Höhen werden niemals geschätzt.

## Wann diese Strategie geeignet ist

Verwenden Sie diese Bibliothek, wenn:

- Listenelemente oder Zeilen unterschiedliche Höhen haben;
- dynamische Elementhöhen aus Daten berechnet oder an gerenderten Komponenten gemessen werden können;
- `scrollToIndex` und Scrollpositionen die exakte Geometrie variabler Höhen verwenden müssen; oder
- eine Chat-Oberfläche umgekehrtes virtuelles Scrollen benötigt.

Wenn eine Elementhöhe nicht im Voraus bekannt ist, messen Sie sie und übergeben Sie das Ergebnis wie unter [Erweiterte Verwendung](https://docs.rdlabo.dev/projects/ngx-cdk-scroll-strategies/docs/advanced) gezeigt. Die Strategie kann nicht einfach eingesetzt werden, um jede unbekannte DOM-Höhe automatisch zu ermitteln.

Diese Bibliothek basiert zu einem großen Teil auf [Virtuelles Scrollen von Inhalten mit variabler Höhe in Angular](https://dev.to/georgii/virtual-scrolling-of-content-with-variable-height-with-angular-3a52).

## Nach Scrollziel auswählen

| Ziel | Anleitung |
| --- | --- |
| Die Höhe jedes Elements angeben | [Einfache Verwendung](https://docs.rdlabo.dev/projects/ngx-cdk-scroll-strategies/docs/simple) |
| Elementkomponenten messen | [Erweiterte Verwendung](https://docs.rdlabo.dev/projects/ngx-cdk-scroll-strategies/docs/advanced) |
| Umgekehrtes Scrollen im Chat-Stil | [Umgekehrtes Scrollen](https://docs.rdlabo.dev/projects/ngx-cdk-scroll-strategies/docs/reverse) |

<!-- rdlabo-docs-omit -->
**Vollständige Dokumentation:** [https://docs.rdlabo.dev/projects/ngx-cdk-scroll-strategies](https://docs.rdlabo.dev/projects/ngx-cdk-scroll-strategies)
<!-- /rdlabo-docs-omit -->

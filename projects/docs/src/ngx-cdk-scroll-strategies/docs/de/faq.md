---
title: "FAQ"
sourceRevision: "4325f749560a0e1bd0048508f9fd931bdcfd01139efe772d0e2731e1629b0dba"
---
### Unterstützt Virtual Scroll im Angular CDK variable oder dynamische Elementhöhen?

Die Standardstrategie `[itemSize]` setzt voraus, dass alle Elemente dieselbe feste Größe haben. Mit der Direktive `[itemDynamicSizes]` dieser Bibliothek geben Sie für jedes Element eine eigene bekannte oder gemessene Höhe an.

### Worin unterscheidet sich dies von der Strategie `autosize`?

Die Strategie `autosize` aus Angular CDK Experimental misst gerenderte Elemente und schätzt noch nicht gemessene Elemente anhand der durchschnittlichen Elementgröße. `[itemDynamicSizes]` berechnet Scrollbereiche und Versätze anhand der einzelnen Elementgrößen, die Ihre Anwendung bereitstellt.

https://github.com/angular/components/blob/main/src/cdk-experimental/scrolling/auto-size-virtual-scroll.ts#L49C3-L59

Wenn jede Elementhöhe bekannt ist oder nach dem Rendern gemessen werden kann, entfällt die Schätzung anhand der Durchschnittsgröße. Die Geometrie des virtuellen Scrollens bleibt dadurch exakt.

### Wird damit die Höhe von `cdk-virtual-scroll-viewport` selbst dynamisch gesetzt?

Nein. Diese Bibliothek verarbeitet unterschiedliche Höhen der Elemente innerhalb des Viewports. Die Höhe oder `max-height` des Viewport-Containers abhängig von seinem Inhalt festzulegen, ist eine separate Aufgabe.

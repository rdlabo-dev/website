---
title: "require-ion-item-group"
sourceRevision: "b84fbd7d5c9b713e13571d425572bcaad0f30c76a0421a5f6f27d94a2f32984e"
---
# @rdlabo/rules/require-ion-item-group

> Verlangt, dass ion-item-Elemente in ion-list von einer unterstützten Ionic-Elementgruppe umschlossen werden.
>
> - ⭐️ Diese Regel ist in der Flat Config [`rdlabo.configs.recommended`](../configuration.md) enthalten.
> - ✒️ Die Option `--fix` auf der [Befehlszeile](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) kann einige der von dieser Regel gemeldeten Probleme automatisch korrigieren.

Die Listengestaltung von Ionic für iOS 26 und Material Design 3 erwartet eine Organisation der Listenelemente über die zu ihrem Verhalten passende Gruppenkomponente. Diese Regel verhindert, dass ein ungruppiertes `ion-item` direkt unter `ion-list` gerendert wird.

## Einzelheiten der Regel

Ein `ion-item` innerhalb einer `ion-list` muss genau eine der folgenden Strukturen verwenden:

- `ion-list > ion-item-group > ion-item`
- `ion-list > ion-reorder-group > ion-item`
- `ion-list > ion-accordion-group > ion-accordion > ion-item`
- `ion-list > ion-radio-group > ion-item`

Angular-Kontrollflussblöcke wie `@if`, `@for`, `@empty`, `@switch` und `@defer` sind für diese Strukturprüfung transparent, da sie kein Element rendern. Auch `ng-container` und `ng-template` sind transparent. Gerenderte HTML- oder Angular-Elemente sind nicht transparent. Ein `div` zwischen Liste, Gruppe oder Element wird gemeldet.

Die Regel prüft ausschließlich `ion-item`-Elemente innerhalb einer `ion-list`. Ein `ion-item` außerhalb einer Liste wird nicht gemeldet. `.spec.html`-Dateien werden ignoriert.

## Beispiele

### Inkorrekt

```html
<ion-list>
  <ion-item>Direct item</ion-item>
</ion-list>
```

<!-- prettier-ignore -->
```html
<ion-list>
  @for (item of items; track item.id) {
    <ion-item>{{ item.name }}</ion-item>
  }
</ion-list>
```

### Korrekt

<!-- prettier-ignore -->
```html
<ion-list>
  <ion-item-group>
    @for (item of items; track item.id) {
      <ion-item>{{ item.name }}</ion-item>
    }
  </ion-item-group>
</ion-list>
```

```html
<ion-list>
  <ion-radio-group>
    <ion-item>First choice</ion-item>
    <ion-item>Second choice</ion-item>
  </ion-radio-group>
</ion-list>
```

## Optionen

Diese Regel besitzt keine Optionen.

## Automatische Korrekturen

Wenn eine Liste ausschließlich ungruppierte `ion-item`-Elemente enthält, auch über transparente Angular-Kontrollflussblöcke oder `ng-container`, kann die Regel den gesamten Listeninhalt mit einer `ion-item-group` umschließen.

Die automatische Korrektur ist verfügbar, wenn dasselbe Template bereits `ion-item-group` verwendet. Dies zeigt an, dass die eigenständige Komponente `IonItemGroup` dem Template zur Verfügung steht. Andernfalls bietet die Regel einen Editor-Vorschlag, der zusätzlich daran erinnert, `IonItemGroup` bei Bedarf zu den Komponentenimports hinzuzufügen.

Weder Korrektur noch Vorschlag werden angeboten, wenn die Liste gruppierte und ungruppierte Inhalte mischt, weitere gerenderte Inhalte, eine wiederverwendbare Definition `ng-template` oder eine verschachtelte Liste enthält, ein gerendertes Element dazwischenliegt oder eine ungültige Accordion-Struktur verwendet wird. In diesen Fällen lässt sich die beabsichtigte Gruppengrenze nicht sicher bestimmen.

## Wann die Regel aktiviert werden sollte

Aktivieren Sie diese Regel in Ionic-Angular-Anwendungen mit den Listendesigns von iOS 26 und Material Design 3. Sie ist im empfohlenen Preset enthalten und hat keine Wirkung, wenn ein Template kein `ion-item` innerhalb einer `ion-list` enthält.

## Implementierung

- [Regelquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/require-ion-item-group.ts)
- [Testquellcode](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/require-ion-item-group.ts)

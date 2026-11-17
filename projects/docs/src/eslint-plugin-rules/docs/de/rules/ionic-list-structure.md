---
title: ionic-list-structure
sourceRevision: "39d275048a99df10f9e12c55c650bfd7b3bbb66b878298a3836a5074ac26066b"
---

# @rdlabo/rules/ionic-list-structure

> Ionic-Zeilen mit ausschließlich einer Notiz und Listenüberschriften nach Listenelementen verhindern.
>
> - ⭐️ Diese Regel ist im Flat-Config-Preset enthalten: [`rdlabo.configs.recommended`](https://docs.rdlabo.dev/projects/eslint-plugin-rules/docs/configuration).

## Regeldetails

Diese Regel meldet zwei Strukturfehler in Angular-Templates:

- Ein `ion-item`, dessen einziges Kind ein einzelnes `ion-note` ist (Leerraum und Kommentare werden ignoriert). Erläuternder Text sollte außerhalb des Elements und seiner Gruppe stehen, ohne den Hintergrund und die Abstände einer Zeile.
- Ein `ion-list-header`, vor dem ein `ion-item` oder `ion-item-group` in derselben `ion-list` steht. Schließen Sie die vorherige Liste und beginnen Sie für den nächsten Abschnitt eine neue Liste.

Die Überschriftenprüfung durchläuft umschließende Elemente und Angular-Kontrollflussblöcke. Verschachtelte Listen verfolgen ihre Elemente unabhängig. Geprüft wird die Reihenfolge im Quelltext einschließlich bedingter Elemente; Laufzeitbedingungen werden nicht ausgewertet. Die Notizprüfung beschränkt sich bewusst auf direkte Kinder. Notizen neben Beschriftungen, Werten oder Steuerelementen bleiben gültig.

Diagnosen erläutern das Layoutproblem und die vorgesehene Struktur. Automatische Korrekturen oder Vorschläge werden nicht angeboten, da die Wahl der Listengrenzen und das Verschieben projizierter Inhalte den Anwendungskontext erfordern.

### Falsch

```html
<ion-list>
  <ion-item-group>
    <ion-item><ion-note>Request bookings require approval.</ion-note></ion-item>
  </ion-item-group>
  <ion-list-header>Another section</ion-list-header>
</ion-list>
```

### Richtig

```html
<ion-list>
  <ion-item-group>
    <ion-item><ion-label>Booking method</ion-label><ion-note slot="end">Request</ion-note></ion-item>
  </ion-item-group>
  <ion-note>Request bookings require approval.</ion-note>
</ion-list>
<ion-list>
  <ion-list-header>Another section</ion-list-header>
  <ion-item-group>
    <ion-item>Another setting</ion-item>
  </ion-item-group>
</ion-list>
```

## Implementierung

- [Regelquelltext](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.2/src/rules/ionic-list-structure.ts)
- [Testquelltext](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.2/tests/rules/ionic-list-structure.ts)

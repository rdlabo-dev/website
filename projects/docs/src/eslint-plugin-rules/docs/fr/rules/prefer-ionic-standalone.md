---
title: "prefer-ionic-standalone"
sourceRevision: "d1e69f615b017a0bc8d157bb605f84deb283c7c52988dd1fbb83c27a42db1fa0"
---
# @rdlabo/rules/prefer-ionic-standalone

> Préférer l’API standalone Ionic 9 et interdire IonicModule ainsi que les points d’entrée obsolètes ou fondés sur NgModule.
>
> - ⭐️ Cette règle figure dans le Flat Config [`rdlabo.configs.recommended`](../configuration.md).
> - ✒️ L’option `--fix` de la [ligne de commande](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) peut corriger automatiquement certains problèmes signalés par cette règle.

Ionic 9 exporte les composants Angular standalone depuis `@ionic/angular`. Cette règle maintient les applications sur cette interface d’API en rejetant l’ancien point d’entrée `@ionic/angular/standalone`, celui fondé sur NgModule `@ionic/angular/lazy` et `IonicModule` lui-même.

## Détails de la règle

La règle vérifie les imports, réexports nommés, déclarations d’export global et accès à `IonicModule` par un import de namespace. L’accès au namespace est résolu par portée ; une variable locale portant le même nom et le masquant n’est donc pas signalée.

## Exemples

### Incorrect

```ts
import { IonButton } from '@ionic/angular/standalone';
import { IonInput } from '@ionic/angular/lazy';
import { IonicModule } from '@ionic/angular';
```

### Correct

```ts
import { IonButton, IonInput, ModalController, provideIonicAngular } from '@ionic/angular';
```

Les imports nommés et réexports nommés depuis `/standalone` et `/lazy` sont automatiquement corrigés en `@ionic/angular`, en conservant le style de guillemets. Les imports à effets de bord, imports de namespace et déclarations `export *` sont signalés sans correction, car changer leur point d’entrée peut modifier le comportement à l’exécution. `IonicModule` est également signalé sans correction, car remplacer `IonicModule.forRoot()` et les métadonnées NgModule exige des changements au niveau de l’application.

## Options

Cette règle n’a pas d’options. Configurez sa sévérité à `warn` ou `error` dans la configuration ESLint.

## Quand l’activer

Activez cette règle dans les applications Ionic 9 Angular après l’adoption d’un démarrage standalone. Les applications NgModule doivent terminer cette migration avant de l’activer, car `@ionic/angular/lazy` et `IonicModule` sont toujours rejetés.

## Implémentation

- [Source de la règle](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/src/rules/prefer-ionic-standalone.ts)
- [Source des tests](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/v22.1.0/tests/rules/prefer-ionic-standalone.ts)

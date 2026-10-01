---
title: "Premiers pas"
sourceRevision: "ebdca7dec9b77896e2294742c1204f130ab59f9bdc7712695f2db591ca887145"
---
# @rdlabo/ionic-angular-kit

`@rdlabo/ionic-angular-kit` fournit du stockage typé, des overlays typés et des adaptateurs Ionic Signal Forms pour les applications Ionic Angular. Les écrans propres au produit, les règles métier et les traductions restent dans l’application qui utilise le kit.

```sh
npm install @rdlabo/ionic-angular-kit
```

## Premier essai : enregistrer une préférence

Dans une application Ionic Angular existante, ajoutez le fournisseur Ionic Storage à la configuration actuelle de l’application. Ne remplacez pas les autres fournisseurs.

```ts
import { importProvidersFrom, type ApplicationConfig } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage-angular';

export const appConfig: ApplicationConfig = {
  providers: [importProvidersFrom(IonicStorageModule.forRoot({ name: '__mydb' }))],
};
```

Ajoutez ensuite ce composant standalone :

```ts
import { Component, inject, signal } from '@angular/core';
import { IonButton } from '@ionic/angular';
import { disableHandler, KitStorageService } from '@rdlabo/ionic-angular-kit';

@Component({
  selector: 'app-preferences-demo',
  imports: [IonButton],
  template: `<ion-button type="button" (click)="disableHandler($event, save())">Save preference</ion-button><p>{{ result() }}</p>`,
})
export class PreferencesDemo {
  private readonly storage = inject(KitStorageService);
  readonly result = signal('');
  readonly disableHandler = disableHandler;

  async save(): Promise<void> {
    await this.storage.set('theme', 'dark');
    this.result.set((await this.storage.get<string>('theme')) ?? '');
  }
}
```

Affichez `<app-preferences-demo>` sur une page existante en important `PreferencesDemo` dans les `imports` de cette page standalone. Cliquez sur Save preference : `dark` apparaît. `KitStorageService` initialise automatiquement le stockage ; aucune initialisation manuelle n’est nécessaire.

## Prérequis

| Package                                         | Version prise en charge |
| ----------------------------------------------- | ----------------- |
| Angular                                         | 21.x–22.x         |
| Ionic Angular                                   | 9.x               |
| RxJS                                            | 7.8.x             |
| Capacitor Core, App, Haptics, Keyboard, Network | 7.x–8.x           |
| Version cible de déploiement iOS/iPadOS                    | 16.4 ou ultérieure     |

Le package principal déclare `@ionic/storage-angular` ainsi que Capacitor Core, App, Haptics, Keyboard et Network comme dépendances homologues obligatoires. Conservez des versions compatibles installées, même si l’application n’utilise qu’une partie du point d’entrée principal. Les applications natives utilisant `/offline` doivent en outre installer et configurer la version majeure de `@capacitor-community/sqlite` correspondant à celle de Capacitor ; cette dépendance relève de l’application et n’est pas installée par le kit.

Firebase, la connexion sociale, Live Update, Preferences, Status Bar, les demandes d’avis et les dépendances d’impression/PDF sont des dépendances homologues facultatives. Installez uniquement celles utilisées par les points d’entrée secondaires choisis et respectez la plage de compatibilité de chaque plugin ; certains plugins facultatifs ne prennent en charge que Capacitor 8.

## Points d’entrée

| Importation                                    | Responsabilité                                                                     |
| ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `@rdlabo/ionic-angular-kit`               | Stockage, overlays, gardes, HTTP, temps réel, directives, clavier et utilitaires     |
| `@rdlabo/ionic-angular-kit/offline`       | **Expérimental.** Réplique locale à portée limitée, outbox, récupération, rejeu et règles de traitement des requêtes |
| `@rdlabo/ionic-angular-kit/theme`         | Thème clair/sombre persistant et synchronisation de la barre d’état native                              |
| `@rdlabo/ionic-angular-kit/forms`         | Texte d’erreur Ionic et classes d’état pour Angular Signal Forms                        |
| `@rdlabo/ionic-angular-kit/review`        | Demandes d’avis natives dans l’application à fréquence limitée                                            |
| `@rdlabo/ionic-angular-kit/printer`       | Utilitaires DOM-vers-PNG, étiquettes Brother et PDF                                         |
| `@rdlabo/ionic-angular-kit/auth-firebase` | Configuration des dépendances Firebase et parcours d’authentification                                |
| `@rdlabo/ionic-angular-kit/app-update`    | Transitions atomiques de mise à jour du service worker Angular                                   |
| `@rdlabo/ionic-angular-kit/live-update`   | Fournisseur de signalement de disponibilité pour Capawesome Live Update                                          |

Les points d’entrée secondaires isolent les dépendances natives et les SDK facultatifs du bundle principal.

L’ensemble du point d’entrée `/offline` est expérimental et n’est pas couvert par la garantie de compatibilité SemVer du kit. Ses API publiques, son schéma de persistance et son comportement de synchronisation peuvent subir des changements incompatibles dans une version mineure ou corrective avant leur stabilisation. Si vous l’adoptez, épinglez une version exacte du kit et consultez le guide de migration avant chaque mise à niveau.

## Configurer uniquement les fonctions utilisées

La plupart des fonctions exposent un fournisseur dont les callbacks laissent les routes, les textes, les identifiants et les effets de bord applicatifs hors du kit. Commencez par [Stockage et overlays](https://docs.rdlabo.dev/projects/ionic-angular-kit/docs/storage-overlays) et [Formulaires](https://docs.rdlabo.dev/projects/ionic-angular-kit/docs/forms).

## Documentation

- [Stockage et overlays](https://docs.rdlabo.dev/projects/ionic-angular-kit/docs/storage-overlays)
- [Formulaires](https://docs.rdlabo.dev/projects/ionic-angular-kit/docs/forms)
- [Vérifier l’intégration du kit avec ESLint](./docs/eslint.md)
- [Authentification et HTTP](https://docs.rdlabo.dev/projects/ionic-angular-kit/docs/auth-http)
- [Hors ligne et temps réel](https://docs.rdlabo.dev/projects/ionic-angular-kit/docs/offline-realtime)
- [Fonctionnalités facultatives](https://docs.rdlabo.dev/projects/ionic-angular-kit/docs/optional-features)

<!-- rdlabo-docs-omit -->

**Documentation complète :** [https://docs.rdlabo.dev/projects/ionic-angular-kit](https://docs.rdlabo.dev/projects/ionic-angular-kit)

<!-- /rdlabo-docs-omit -->

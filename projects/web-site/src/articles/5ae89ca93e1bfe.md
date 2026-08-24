---
title: "Catching Up a Neglected Ionic Angular Project After Two Years"
description: "Step-by-step upgrade from Angular 11/Ionic 5 to Angular 16/Ionic 7: ng update, Capacitor migration, Standalone, strict mode, and extracting overlay controllers."
zennSlug: 5ae89ca93e1bfe
emoji: "💨"
---

This is how I finally caught up my app Food Label Printing, untouched since its last update in 2021, to a current stack.

https://foodlabel.rdlabo.jp/

This is not a "look how hard I worked" story— just the steps I took. Here is part of `package.json` before the refresh. If you have been there, you know the feeling.

```json
{
  "dependencies": {
    "@angular/core": "~11.1.0",
    "@angular/fire": "^6.1.3",
    "@capacitor/core": "^2.4.6",
    "@ionic-native/core": "^5.29.0",
    "@ionic/angular": "^5.5.4",
    "@ionic/storage": "^2.3.1",
    ...
  },
  "devDependencies": {
    "@angular/cli": "~11.1.0",
    "@capacitor/cli": "^2.4.6",
    "@ionic/angular-toolkit": "^3.1.0",
    "typescript": "~4.0.5",
    ...
  }
}
```

# Update work

## 1. Update Angular

First I ran Angular updates on autopilot. Angular's blessed `ng update` command applies breaking core changes automatically— without it I might have given up. You must bump one major at a time, so I ran:

```bash
% ng update @angular/core@12 @angular/cli@12 --force
% ng update @angular/core@13 @angular/cli@13 --force
% ng update @angular/core@14 @angular/cli@14 --force
% ng update @angular/core@15 @angular/cli@15 --force
% ng update @angular/core @angular/cli @ngrx/store @ionic/angular-toolkit firebase-tools @ionic/angular @angular/fire --force
```

`--force` ignores dependency resolution errors. The last line also bumps packages that depend on Angular 16. Angular is now current. Done!

## 2. Update outdated libraries

The times they are a-changin'. `@ionic-native` became `@awesome-cordova-plugins`, so I replaced everything.

```bash
% npm remove @ionic-native/core
% npm install @awesome-cordova-plugins/core
```

Same for all plugins. `@ionic/storage` became `@ionic/storage-angular` with a very different API.

https://github.com/ionic-team/ionic-storage

Angular moved from tslint to eslint, so I added eslint.

```bash
% ng add @angular-eslint/schematics
% npm remove tslint
```

That one command configured everything.

## 3. Update Capacitor

Capacitor 3+ has `npx cap migrate`, but Capacitor 2 does not, so I reinstalled from scratch. I deleted the iOS/Android folders, then updated packages.

```bash
% rm -rf ios android
% npm install @capacitor/cli@4 @capacitor/core@4 @capacitor/android@4 @capacitor/ios@4
// Also update the plugins
```

## 4. Make it run

Capacitor 2→3 changed a lot— plugins moved from a `Plugins` object to direct imports, and core plugins split into packages— so I fixed those areas. With `ionic serve` running, the CLI points at errors and I fixed them one by one. `angular.json` may be stale; comparing with https://github.com/ionic-team/starters/blob/main/angular-standalone/base/angular.json helps.

Git history says this took about two hours. In my app, `rxjs` and `@angular/fire` breaking changes (dropping `compat`) took the most time. Without Firestore it would probably have been faster.

## 5. Adopt Ionic 7 syntax

I wrote about simplified form syntax here:

https://zenn.dev/rdlabo/articles/1eb9e13c8a5945

I updated to the latest patterns. Ionic 6 also changed `ion-datetime` heavily, so I migrated to the new component.

https://zenn.dev/rdlabo/articles/62f404d448df01

# Migration work

## 1. Move to Standalone Components

This command migrates to Standalone Components automatically.

```bash
% ng generate @angular/core:standalone
```

The migration has three stages, so I ran them in order: `Convert all components, directives and pipes to standalone`, `Remove unnecessary NgModule classes`, and `Bootstrap the application using standalone APIs`— three runs of the command. Not every module disappears; Router Module may remain and needs manual work. Mostly the syntax gets simpler. I extracted routes from the old Router Module like this:

https://github.com/ionic-team/starters/blob/main/angular-standalone/official/tabs/src/app/tabs/tabs.routes.ts

Then loaded them from `main.ts`:

https://github.com/ionic-team/starters/blob/main/angular-standalone/base/src/main.ts#L18

Do this sooner rather than later. It takes under 30 minutes and lowers future cost— it did for me. After this I had no `ngModule` left in the project (except a test `ngModule`).

## 2. Enable strict: true

Old Ionic Angular projects often did not use `strict: true`. I flipped `tsconfig.json` at this point. Copy-pasting the starter `tsconfig.json` is even faster.

https://github.com/ionic-team/starters/blob/main/angular-standalone/base/tsconfig.json

## 3. Switch from constructor inject to property inject

I applied https://zenn.dev/rdlabo/articles/7aa0b566f97c80 and ran lint. Easy.

# Separate Overlay Controller from Components

The biggest win of property inject, in my view, is using Angular services outside components. I have long felt Overlay Controllers— `ModalController`, `AlertController`, and friends— are verbose inside components. One alert can cost ~20 lines, and moving that to a service for every component is tedious. So every component that uses overlays gets an `overlayFunc` function in the same file and assigns it to a property. Like this.

Before:


```ts
@Component({
  selector: 'app-main',
  templateUrl: 'main.page.html',
  styleUrls: ['main.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, RouterLink, CommonModule],
})
export class MainPage {
  private readonly overlayFunc = overlayFunc();
  public readonly platform = inject(Platform);

  constructor() {}

  public async navigatePrint (event: Event) {
    event.stopPropagation();
    const modal = await this.modalCtrl.create({
      component: SimplePrintPage,
    });
    await modal.present();
  };

  async alertDeleteItem(productName: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: `Delete ${productName}?`,
        message: 'Deleted items cannot be restored, so you will need to register again.',
        buttons: [
          {
            text: 'Cancel',
            handler: () => resolve(false),
          },
          {
            text: 'Delete',
            handler: () => resolve(true),
          },
        ],
      });
      await alert.present();
    });
  }

  public async shareApp () {
    await Share.share({
      title: 'Food Label Printing',
      text: 'A mobile app for simple food-label printing',
      url: 'https://foodlabel.rdlabo.jp/',
      dialogTitle: 'Food Label Printing: a mobile app for simple food-label printing',
    });
  };
}
```


After:

```ts
@Component({
  selector: 'app-main',
  templateUrl: 'main.page.html',
  styleUrls: ['main.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, RouterLink, CommonModule],
})
export class MainPage {
  public readonly platform = inject(Platform);
  private readonly overlayFunc = overlayFunc();

  constructor() {}

  public navigatePrint = (event: Event) => {
    event.stopPropagation();
    return this.overlayFunc.navigatePrint();
  };
  public shareApp = () => this.overlayFunc.shareApp();
}

function overlayFunc() {
  const [alertCtrl, modalCtrl] = [inject(AlertController), inject(ModalController)];

  return {
    async shareApp(): Promise<void> {
      await Share.share({
        title: 'Food Label Printing',
        text: 'A mobile app for simple food-label printing',
        url: 'https://foodlabel.rdlabo.jp/',
        dialogTitle: 'Food Label Printing: a mobile app for simple food-label printing',
      });
    },
    async navigatePrint(): Promise<void> {
      const modal = await modalCtrl.create({
        component: SimplePrintPage,
      });
      await modal.present();
    },
    async alertDeleteItem(productName: string): Promise<boolean> {
      return new Promise<boolean>(async (resolve) => {
        const alert = await alertCtrl.create({
          header: `Delete ${productName}?`,
          message: 'Deleted items cannot be restored, so you will need to register again.',
          buttons: [
            {
              text: 'Cancel',
              handler: () => resolve(false),
            },
            {
              text: 'Delete',
              handler: () => resolve(true),
            },
          ],
        });
        await alert.present();
      });
    },
  };
}
```

Line count stays similar, but overlay controllers are just UI libraries returning Promises— keeping them in the component feels noisy. I split them out so overlay-using components hold a function property instead. Maybe I will move those functions to separate files later.

# Summary
In a hurry, I showed how I upgraded an Angular 11/Ionic 5 app to Angular 16/Ionic 7. These upgrades get harder the longer you wait, so I want to stay current.

See you next time.

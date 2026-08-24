---
title: "Ionic/Angular Toast Gets Easier with a Helper Method"
description: "Wrap ToastController in a service with defaults and optional Capacitor Haptics so feedback toasts stay consistent across a growing app."
zennSlug: d7e72e3eae0bd8
emoji: "🍞"
---
This article is part of the [Ionic Framework / Capacitor Advent Calendar 2020](https://adventar.org/calendars/5963).

* * *

Ionic provides Toast, a small notification UI.

[https://ionicframework.jp/docs/api/toast/](https://ionicframework.jp/docs/api/toast/)

Alert is an interrupting notification—the user must tap a button to dismiss it. Toast can close automatically when you set `duration`, so it does not block interaction. I use it for feedback such as when data was saved successfully.

In the apps I build, I use Toast for notifications like these:

-   Group created
-   Joined the talk group
-   Notification settings updated
-   Logged out
-   Sent password reset email

As an app grows, though, Toast options start to feel verbose. Here is the Toast interface:

```
export interface ToastOptions {
  header?: string;
  message?: string | IonicSafeString;
  cssClass?: string | string[];
  duration?: number;
  buttons?: (ToastButton | string)[];
  position?: 'top' | 'bottom' | 'middle';
  translucent?: boolean;
  animated?: boolean;
  color?: Color;
  mode?: Mode;
  keyboardClose?: boolean;
  id?: string;
  enterAnimation?: AnimationBuilder;
  leaveAnimation?: AnimationBuilder;
}

```

I do not specify every option each time, but as you build the app you settle on Toast conventions and end up repeating the same arguments. So move this into a service and wrap it in a helper.

```
import { ToastOptions } from '@ionic/core/dist/types/components/toast/toast-interface';

public async presentToast(options: ToastOptions): Promise<void> {
  options = Object.assign(
    {
      position: 'top',
      color: 'dark',
      duration: 2000,
      buttons: ['Close'],
    },
    options,
  );
  const toast = await this.toastCtrl.create(options);
  await toast.present();
}

```

This does not come up often, but when you add `@ionic/angular`, `@ionic/core` is pulled in as a dependency and lives in `node_modules`. The method argument interface is defined there, so you can `import` and use it. With the helper above, you can write like this:

```
// before 
const toast = await this.toastCtrl.create({
  message: 'Group created',
  position: 'top',
  color: 'dark',
  duration: 2000,
  buttons: ['Close'],
});
await toast.present();

// after
await this.helper.presentToast({
  message: 'Group created',
});

```

While we are at it, Toast is user feedback, so you can pair it with a light vibration. With Capacitor, the `Haptics` plugin is available—let us wire it into the Toast helper.

```
  import { ToastOptions } from '@ionic/core/dist/types/components/toast/toast-interface';
+ import { HapticsImpactStyle, Plugins } from '@capacitor/core';
+ const { Haptics } = Plugins;

  public async presentToast(options: ToastOptions): Promise<void> {
    options = Object.assign(
      {
        position: 'top',
        color: 'dark',
        duration: 2000,
        buttons: ['Close'],
      },
      options,
    );
    const toast = await this.toastCtrl.create(options);
    await toast.present();
+   if (this.platform.is('hybrid')) {
+     Haptics.impact({ style: HapticsImpactStyle.Light });
+   }
  }

```

Now Toast notifications can trigger haptic feedback at the same time. Ionic APIs are simple, so it is easy to copy-paste the same calls everywhere—but creating helpers where you can keeps things readable, and I recommend it.

See you next time.

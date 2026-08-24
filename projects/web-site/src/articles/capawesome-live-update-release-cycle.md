---
title: "Capacitor App Release Best Practices: Split Live Update and Store Submission in CI"
description: "Wire Capawesome Live Update, Cloud Build, Cloud Deploy, and GitHub Actions so a version tag alone routes bug fixes over-the-air and feature or native changes through store submission."
zennSlug: capawesome-live-update-release-cycle
emoji: "📲"
---

This article is the implementation companion to ["Mobile App Live Update: Getting Past the Next Bottleneck After AI Sped Up Development"](https://note.com/rdlabo/n/na69e5aad6840).

In that note, I wrote that even when generative AI speeds up implementation, delivery still stalls at store review if that is the only path for changes.

For example, the day after a store release, you find a layout bug on a list screen. The fix is a few lines. Tests pass. Still, shipping it to users means starting store submission again—and that is heavy.

Live Update (Over-the-air (OTA) updates) is not a way to eliminate store review. It is a path to deliver only a web bundle that is compatible with the app you already submitted to the store—narrowly and frequently. New features and behavior changes still go through store submission as before.

The finished shape in this article connects those two paths with a single entry point. Push a tag, CI validates the tag and diff, and routes delivery appropriately to users. Rules, differences from other cross-platform environments, and how much release authority to give AI are covered in the note. From here, this guide builds that path in a Capacitor app.

# What you will build

You will finish these four pieces:

1. **Live Update setup**: configure the app to receive bundles, verify signatures, and roll back on failure
2. **Cloud Build setup**: let Capawesome Cloud build signed iOS / Android binaries from Git
3. **Cloud Deploy setup**: submit built binaries to TestFlight / Google Play
4. **CI setup**: determine the delivery path from a tag and trigger Live Update or Cloud Build → Cloud Deploy

Connecting these four means developers only push a version tag.

```bash
npm run release
git push origin --tags
```

CI receiving the tag routes bug fixes in existing features to Live Update, and builds iOS / Android for store submission when the release includes new features, behavior changes, or native changes. Native changes always require store submission.

```text
Push a tag
  → Determine the delivery path
  ├─ Bug fix to existing functionality → Build and sign the bundle → Live Update
  └─ New feature, behavior change, or native change → Cloud Build → Cloud Deploy
```

In this order, configure the app, native build, store submission, and the CI that connects them. The logic that decides between Live Update and store submission is saved for last as a bonus section.

# 1. Configure Live Update in the app

From here, add `@capawesome/capacitor-live-update` v8 to a Capacitor 8 app. Capawesome's [compatibility table](https://capawesome.io/docs/plugins/live-update/) shows plugin v8 for Capacitor 8. For Capacitor 7 or earlier, choose the plugin with the same major version.

## Capawesome Cloud preparation

Live Update, Cloud Build, and Cloud Deploy all start from the same App on Capawesome Cloud. First, prepare the App ID that the following settings will attach to.

### Create an App

First create an App in [Capawesome Cloud](https://cloud.capawesome.io/) and save the issued App ID.

This App ID is not an iOS / Android Application ID like `com.example.app`. It is the UUID that identifies your app on Capawesome Cloud. You can also create it from the CLI:

```bash
npx @capawesome/cli apps:create
```

For detailed UI steps, see the [official setup guide](https://capawesome.io/docs/cloud/live-updates/setup/).

## App-side preparation

Creating an App in Capawesome Cloud alone does not let devices receive bundles yet. Integrate the plugin, signing keys, and update policy into the app.

### Install the plugin and sync

In your Capacitor app directory, add the plugin:

```bash
npm install @capawesome/capacitor-live-update@^8.0.0
npx cap sync
```

`cap sync` integrates the plugin into the native project. This integration itself cannot be delivered via Live Update, so the first time you submit to the store. That binary becomes the foundation that receives web bundles afterward.

### Create keys to sign bundles

Live Update delivers production code to devices outside the store. Beyond downloading over HTTPS, the app should accept only bundles you signed.

Capawesome CLI can generate RSA private and public keys:

```bash
npx @capawesome/cli apps:liveupdates:generatesigningkey \
  --private-key-path=./keys/private.pem \
  --public-key-path=./keys/public.pem \
  --key-size=4096
```

Use `private.pem` to sign bundles. Do not commit it to Git; register it in GitHub Secrets when you move it to CI. Embed `public.pem` in the app to verify downloaded bundle signatures. Key roles and generation steps are also described in Capawesome's [Code Signing guide](https://capawesome.io/docs/cloud/live-updates/advanced/code-signing/).

### Configure `capacitor.config.ts`

In a real app, I started from this configuration:

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  webDir: 'www/browser',
  plugins: {
    LiveUpdate: {
      appId: '00000000-0000-0000-0000-000000000000',
      autoBlockRolledBackBundles: true,
      autoDeleteBundles: true,
      autoUpdateStrategy: 'background',
      publicKey: '-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----',
      readyTimeout: 10000,
    },
  },
};

export default config;
```

#### What each setting does

Put the Capawesome Cloud App ID you saved first in `appId`. Put the contents of `public.pem` on one line in `publicKey`.

Each setting has this role:

| Setting | Role |
| --- | --- |
| `autoUpdateStrategy: 'background'` | Check for updates at launch and on resume; download in the background |
| `readyTimeout: 10000` | Roll back if startup success is not reported within 10 seconds |
| `autoBlockRolledBackBundles: true` | Do not download bundles that were rolled back again |
| `autoDeleteBundles: true` | Delete unnecessary bundles after `ready()` |
| `publicKey` | Verify bundle signatures on the device |

With `background`, a downloaded bundle applies on the next launch. JavaScript does not swap mid-screen while the user is viewing a page.

## Keep native builds and bundles compatible

Delivering the same bundle to every app risks calling features that do not exist on older native builds. So split channels using build number as the compatibility boundary.

### Set a channel per build number

From the start, do not put every device on one `production` channel. Split channels by native build number.

In Android's `android/app/build.gradle`, set a channel name using `versionCode`:

```groovy
android {
    defaultConfig {
        versionCode 9000000
        versionName "9.0.0"
        resValue "string", "capawesome_live_update_default_channel",
                 "production-" + versionCode
    }
}
```

On iOS in `Info.plist`, use `CURRENT_PROJECT_VERSION`:

```xml
<key>CapawesomeLiveUpdateDefaultChannel</key>
<string>production-$(CURRENT_PROJECT_VERSION)</string>
```

Aligning Android `versionCode` and iOS build number to `9000000` makes both use `production-9000000`.

Capawesome also [recommends versioned channels](https://capawesome.io/docs/cloud/live-updates/guides/best-practices/) to reduce compatibility accidents. Use channels not as environment names but as the boundary for "bundles that run on this native binary."

## Judge startup success and failure

Downloading a bundle and starting the app successfully with that bundle are different. Count startup success only when the screen reaches a usable state.

### Call `ready()` after the first screen renders

Setting `readyTimeout` alone does not let the app judge startup success. When the app starts normally with a new bundle, call `LiveUpdate.ready()`.

However, calling it immediately after Angular bootstrap can mark "startup success" even if the first routing throws. In my app, I call it after Angular stabilizes, the first `NavigationEnd` fires, and one render frame completes.

```ts
import {
  ApplicationRef,
  inject,
  provideEnvironmentInitializer,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LiveUpdate } from '@capawesome/capacitor-live-update';
import { Capacitor } from '@capacitor/core';
import { filter, firstValueFrom, take } from 'rxjs';

export const provideLiveUpdateReadiness = () =>
  provideEnvironmentInitializer(() => {
    if (!Capacitor.isNativePlatform()) return;

    const appRef = inject(ApplicationRef);
    const router = inject(Router);

    void Promise.all([
      firstValueFrom(appRef.isStable.pipe(filter(Boolean), take(1))),
      firstValueFrom(
        router.events.pipe(
          filter((event) => event instanceof NavigationEnd),
          take(1),
        ),
      ),
    ])
      .then(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => resolve()),
          ),
      )
      .then(() => LiveUpdate.ready())
      .catch((error) =>
        console.error('Failed to mark Live Update as ready.', error),
      );
  });
```

Add this to the providers in `app.config.ts`:

```ts
export const appConfig: ApplicationConfig = {
  providers: [provideLiveUpdateReadiness()],
};
```

It does nothing on web and runs only on Capacitor iOS / Android.

# 2. Configure Cloud Build

Live Update setup provides a path to deliver fixes to the current app. Next, prepare a path to build a new app itself for feature or native changes.

Cloud Build's job is to produce signed IPA / AAB from a specific Git commit. Store submission comes in Cloud Deploy next.

To do that, fix in order: what to build, which environment to build in, and which certificates sign the output.

## Fix the build source

Cloud Build needs "which source" and "which command" to build. Fix the Git repository and build command.

### 1. Fix the Git repository

In Capawesome Cloud Git connections, connect your Git provider and choose the build repository from the App's Git repository settings. That fixes the repository; CI passes which commit to build later as `gitRef`.

### 2. Fix the build command

For a standard project, Capawesome Cloud auto-detects install and build commands. If the app is not at the repository root or you want explicit commands, fix them in `capawesome.config.json`:

```json
{
  "cloud": {
    "apps": [
      {
        "appId": "00000000-0000-0000-0000-000000000000",
        "baseDir": "app",
        "dependencyInstallCommand": "npm ci",
        "webBuildCommand": "npm run build -- --configuration production"
      }
    ]
  }
}
```

#### Reading `capawesome.config.json`

`baseDir` is the Capacitor app directory. `dependencyInstallCommand` installs dependencies. `webBuildCommand` builds the web assets placed in `webDir`.

Despite the name `webBuildCommand`, this does not deploy a browser build. It is the command that produces web assets embedded in Capacitor's native binary. See [App Configuration](https://capawesome.io/docs/cloud/native-builds/configuration/) for settings.

## Fix the build environment

Even with the same source, different environment variables or secrets produce different binaries. Collect production build values into a reusable Environment.

### Create a `production` environment

Register values needed for builds in a Capawesome Cloud Environment:

```bash
npx @capawesome/cli apps:environments:create --name production
```

#### Separate Secrets and Variables

Put private registry tokens, paid package license keys, SSH keys for private repositories, and similar values in Secrets. Put values safe to expose—API endpoints, build mode, and so on—in Variables. Passing this environment name from CI reproduces the same build environment every time.

## Configure binary signing

IPA / AAB submitted to stores need signatures. Register iOS and Android signing information on the Cloud Build side; CI only passes the names.

### Register iOS signing as `production-ios`

Register Distribution certificate and provisioning profile in Capawesome Cloud Certificates and name them `production-ios`. If iOS has Extensions, you need provisioning profiles for every target—not just the main app.

### Register Android signing as `production-android`

Register release keystore, alias, and passwords in Certificates and name them `production-android`. Do not put the keystore or passwords in Git.

Pass these two names later to GitHub Actions as `certificate`. Cloud Build can now produce signed iOS / Android binaries from the commit and `production` environment CI specifies.

The binaries have not been submitted to stores yet. Next, configure Cloud Deploy to move them to TestFlight / Google Play.

# 3. Configure Cloud Deploy

Cloud Build can now produce signed binaries. But those binaries still live only on Capawesome Cloud. To reach TestFlight or Google Play, register store credentials and destinations.

Capawesome Cloud's official docs call this [App Store Publishing](https://capawesome.io/docs/cloud/app-store-publishing/setup/) and call each run a Deployment. This article refers to it as Cloud Deploy, paired with Cloud Build.

## Create an iOS destination

Prepare a Destination with Apple credentials so Cloud Deploy can connect to App Store Connect.

### Create a TestFlight destination

Create an Apple App Store Destination and name it `testflight`.

#### Credentials to register

When using an App Store Connect API Key, register:

- API Key file in `.p8` format
- Key ID
- Issuer ID
- Apple Developer Team ID

Deploying to this Destination uploads the build to App Store Connect and processes it in TestFlight.

## Create an Android destination

On Google Play, fix track and release status in the Destination along with credentials. This example submits to Internal testing for in-house verification.

### Create a Google Play destination

Create a Google Play Destination and name it `google-play-internal`.

#### Settings for Internal testing

Register target app, artifact format, track, and credentials together in the Destination:

| Setting | Value |
| --- | --- |
| Package name | Android Application ID |
| Publishing format | AAB |
| Track | Internal |
| Release status | Completed |
| Credential | JSON key for a Service Account with Google Play permissions |

Google Play requires a manual upload the first time only. From the second time onward, Cloud Deploy can submit to Internal testing. Details are in [Google Play Store Destination](https://capawesome.io/docs/cloud/app-store-publishing/destinations/google-play-store/).

By now, Cloud Build has "how to build" and Cloud Deploy has "where to submit" registered.

# 4. Connect delivery paths in GitHub Actions

With Live Update, Cloud Build, and Cloud Deploy configured separately, connect all three in GitHub Actions so one path runs from tag to finished delivery.

The real workflow handles a full service release; this article extracts only the jobs needed for mobile delivery.

## GitHub preparation

Once Capawesome Cloud is configured, let GitHub Actions call it. Pass App ID as a Variable; pass token and signing private key as Secrets.

### Register Variables and Secrets

Register these values in GitHub:

| Type | Name | Purpose |
| --- | --- | --- |
| Variable | `CAPAWESOME_APP_ID` | Capawesome Cloud App ID |
| Secret | `CAPAWESOME_TOKEN` | API token to trigger Cloud Build / Deploy and Live Update |
| Secret | `CAPAWESOME_LIVE_UPDATE_PRIVATE_KEY` | Private key to sign web bundles |

## Create the workflow

Connect the three configurations in one workflow. Depending on tag classification, only Live Update or only Cloud Build → Cloud Deploy runs.

### Finished GitHub Actions

The finished workflow looks like this. It is long, but it does three things: classify, Live Update, and submit to stores.

```yaml
name: Mobile Release

on:
  push:
    tags:
      - v[0-9]+.[0-9]+.[0-9]+
      - v[0-9]+.[0-9]+.[0-9]+-[0-9]+

concurrency:
  group: production-release
  cancel-in-progress: false

jobs:
  classify:
    runs-on: ubuntu-latest
    outputs:
      release_kind: ${{ steps.release.outputs.release_kind }}
      version: ${{ steps.release.outputs.version }}
      build_number: ${{ steps.release.outputs.build_number }}
      production_channel: ${{ steps.release.outputs.production_channel }}
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - id: release
        uses: rdlabo-team/ionic-angular-library/.github/actions/classify-mobile-release@main
        with:
          app-path: app
          tag: ${{ github.ref_name }}

  publishLiveUpdate:
    needs: classify
    if: needs.classify.outputs.release_kind == 'live-update'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: app/package-lock.json
      - run: npm ci
        working-directory: app
      - run: npm run build -- --configuration production
        working-directory: app
      - name: Publish Live Update
        uses: rdlabo-team/ionic-angular-library/.github/actions/publish-live-update@main
        with:
          app-path: app
          app-id: ${{ vars.CAPAWESOME_APP_ID }}
          channel: ${{ needs.classify.outputs.production_channel }}
          build-number: ${{ needs.classify.outputs.build_number }}
          version: ${{ needs.classify.outputs.version }}
          token: ${{ secrets.CAPAWESOME_TOKEN }}
          private-key: ${{ secrets.CAPAWESOME_LIVE_UPDATE_PRIVATE_KEY }}

  publishNative:
    needs: classify
    if: needs.classify.outputs.release_kind == 'store'
    runs-on: ubuntu-latest
    environment: production
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: ios
            type: app-store
            certificate: production-ios
            destination: testflight
          - platform: android
            type: release
            certificate: production-android
            destination: google-play-internal
    steps:
      - name: Build and submit ${{ matrix.platform }}
        uses: capawesome-team/cloud-build-action@v0.1.2
        with:
          appId: ${{ vars.CAPAWESOME_APP_ID }}
          token: ${{ secrets.CAPAWESOME_TOKEN }}
          gitRef: ${{ github.sha }}
          environment: production
          platform: ${{ matrix.platform }}
          type: ${{ matrix.type }}
          certificate: ${{ matrix.certificate }}
          destination: ${{ matrix.destination }}
```

## Reading the two delivery jobs

The center of the workflow is `publishLiveUpdate` and `publishNative`. The former delivers a web bundle; the latter builds a native binary and submits to stores.

### 1. Live Update builds, signs, and uploads the bundle

When `classify` returns `live-update`, `publishLiveUpdate` builds the web bundle and passes it to a shared action. Inside the action, these steps are fixed:

- Pack `www/browser` into `bundle.zip`
- Create `production-<build number>` channel if it does not exist
- Pin Android / iOS min and max to the same build number
- Record commit SHA and release version in the bundle
- Sign with the private key from GitHub Secrets

The private key is written to a temporary file and deleted in `finally` regardless of upload success.

### 2. Store submission triggers Cloud Build → Cloud Deploy

When `classify` returns `store`, `publishNative` runs. iOS and Android split in a matrix and each builds a native binary from the same `gitRef`.

`certificate` is the signing configuration registered in Cloud Build. `destination` is the name registered in Cloud Deploy. Passing both to `cloud-build-action` runs signed binary build through submit to TestFlight / Google Play Internal in one flow.

This is not direct deploy to user devices. CI's job ends at getting builds into store review and distribution.

## Preserve delivery order

Even with correct branching, overlapping releases could let an older one deliver after a newer one. On the GitHub Actions side, run production releases one at a time.

### Do not run two releases at once

Use the same concurrency group, do not cancel the release that started first, and queue later tags.

```yaml
concurrency:
  group: production-release
  cancel-in-progress: false
```

For example, running `v9.0.1` and `v9.0.1-1` at the same time could let the later-started job upload first and swap tag and delivery order. Run one release at a time and queue tags that arrive later.

# How a week of releases changes

Once this setup connects, developers stop wondering "which command was it this time?" For example, a week of releases might look like this:

| Timing | Tag | Change | Delivery path |
| --- | --- | --- | --- |
| Monday | `v9.0.0` | Update Capacitor; add camera permission | Store submission |
| Tuesday | `v9.0.1` | Fix list screen layout bug | Live Update |
| Wednesday | `v9.0.1-1` | Fix input validation condition | Live Update |
| Thursday | `v9.0.2` | Fix offline guidance copy error | Live Update |
| Next week | `v9.1.0` | Add new native plugin | Store submission |

The command is the same every time. Only the version changes. Feature changes go to the store; bugs found in between go via Live Update.

# Bonus: automatically split Live Update and store submission

The main line—Live Update, Cloud Build, Cloud Deploy, and CI—is complete. Keys, certificates, destinations, and build steps that were scattered outside the app now move from one tag.

As a bonus, here is how to split Live Update and store submission.

CI cannot fully infer from code alone whether a change is a bug fix or a feature change. Humans express delivery intent in version tags; the workflow's `classify` validates native diff and compatibility.

## The criterion is "bug fix or feature change"

Whether a change stays in the web layer alone is only the technical condition for Live Update. Even web-only changes that add features or change existing behavior go to store submission.

### First, look at the purpose of the change

Before implementation files, decide whether the change alters app functionality.

> Is this a fix that restores store-reviewed existing behavior to how it should work?

If the answer is No, it is store submission. Only if Yes should you proceed to the next check.

### Next, look at compatibility with the native build

Even for a bug fix, Live Update cannot deliver if native recompilation is required. Confirm compatibility with the current binary.

#### Example delivery paths

From both purpose and native compatibility, choose the path like this:

| Change | Delivery path |
| --- | --- |
| Layout bugs, typos, fixes to existing logic | Live Update |
| New features or behavior changes implementable in web alone | Store submission |
| Add, remove, or update Capacitor plugins | Store submission |
| `Info.plist`, `AndroidManifest.xml`, permissions | Store submission |
| App icon or native settings | Store submission |

You must not deliver a web bundle that uses a new native plugin to an old native binary—the plugin is not embedded on the device. Live Update requires both "it is a bug fix" and "it is compatible with the existing binary."

## Express intent in tags; validate with diff

Put human delivery intent on the tag; CI verifies it does not contradict the actual diff.

### Express delivery intent in tags

Use these two tag kinds as release entry points:

```text
vX.Y.Z     Stable release
vX.Y.Z-N   Follow-up fix for the same patch release
```

In this workflow, feature additions and changes go to store submission as major / minor updates. Only bug fixes in existing features become patches or `-N` tags—candidates for Live Update.

### Validate deliverability with diff

Do not decide from the tag alone; also check diff from the previous tag.

1. Decide the planned delivery path from the tag
2. Check diff from the previous tag
3. Stop if Live Update was planned but native diff exists

What CI can verify mechanically is version and native diff. Whether a patch mixed in feature changes is guaranteed by PR and release review.

## Inside the `classify` action

Tag and diff validation can be packaged into a reusable GitHub Action.

### Core of the classification logic

Shortened, the core logic looks like this:

```js
const NATIVE_PATHS = [
  'android',
  'ios',
  'capacitor.config.ts',
  'capacitor.config.json',
];

const sameMajorMinor =
  previousMajor === currentMajor &&
  previousMinor === currentMinor;

if (!previousTag || !sameMajorMinor) {
  assertNativeVersionMatchesTag();
  assertNativeBuildNumberIncreased();
  return 'store';
}

if (nativeDependencyChanges || nativeFilesChanged.length > 0) {
  throw new Error(
    'Patch tags cannot contain native changes. ' +
    'Bump major or minor for a store release.',
  );
}

assertLiveUpdateIsCompatibleWithNativeVersion();
return 'live-update';
```

It also checks that Android and iOS version and build number match, and that build number follows the rule representing major / minor.

### Values passed to downstream jobs

After classification, pass four values to downstream jobs:

```text
release_kind=live-update
version=9.0.1
build_number=9000000
production_channel=production-9000000
```

The workflow branches on `release_kind` alone:

```yaml
- name: Publish Live Update
  if: needs.classify.outputs.release_kind == 'live-update'

publishNative:
  if: needs.classify.outputs.release_kind == 'store'
```

Humans cut a tag. CI checks tag and diff and proceeds to Live Update or store submission. If they contradict, it stops without delivering either way.

# Summary: connect finished implementation to the path that reaches users

Back to the layout bug found the day after store release from the opening. After fixing it, cut a patch version and push the tag. CI builds the bundle, signs it, and delivers via Live Update only to the target native versions.

For new features or native changes, the entry point is the same. Push the tag and Cloud Build produces signed binaries; Cloud Deploy submits to TestFlight and Google Play.

Live Update is not the goal by itself. Whether fixing or changing features, developers focus on "what to deliver" rather than "how to deliver it." The biggest outcome here is connecting the place where implementation finishes to the path that reaches users without a gap.

See you next time.

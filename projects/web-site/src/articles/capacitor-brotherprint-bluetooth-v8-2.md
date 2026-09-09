---
title: "From Capacitor to Brother Printers: Official Bluetooth Support in v8.2.0"
description: "Brother Print v8.2.0 fixes the iOS Bluetooth discovery crash, corrects Android permissions, and adds optional printer filtering and SDK-free regression tests."
zennSlug: capacitor-brotherprint-bluetooth-v8-2
emoji: "🖨️"
updatedAt: "2026-09-09"
relatedLibraries:
  - capacitor-brotherprint
---

I have released v8.2.0 of `@rdlabo/capacitor-brotherprint`, the Capacitor plugin for Brother printers that I maintain.

The headline change is official Bluetooth support on iOS and Android.

The plugin already had Bluetooth APIs. However, discovery could crash the app on iOS, so I could not confidently list it as supported. This time, I identified the cause and fixed discovery and permission handling while testing on physical devices.

I also added an optional filter for Android, where non-printer devices were appearing in printer search results.

https://github.com/rdlabo-dev/capacitor-brotherprint

## Bluetooth discovery crashed because of an Info.plist type

This plugin exposes the Brother SDK through Capacitor. Images created on the web side can be passed to the native iOS or Android SDK for printing.

The investigation started when Bluetooth discovery on an iPad terminated the app with this exception:

```text
-[__NSCFString count]: unrecognized selector sent to instance
```

Instead of returning an error to JavaScript, the native exception terminated the app itself. The app could not even tell the user that discovery had failed.

The cause was the `Info.plist` example in our repository. It declared `UISupportedExternalAccessoryProtocols` as a string rather than an array.

```xml
<!-- Before -->
<key>UISupportedExternalAccessoryProtocols</key>
<string>com.brother.ptcbp</string>
```

The correct configuration is:

```xml
<!-- After -->
<key>UISupportedExternalAccessoryProtocols</key>
<array>
    <string>com.brother.ptcbp</string>
</array>
```

Even with just one protocol, the value must be an array of strings. Passing a string caused an exception when the code tried to count its elements as an array.

By contrast, `NSBluetoothAlwaysUsageDescription` and `NSBluetoothPeripheralUsageDescription` are correctly represented as strings. They do not need to become arrays. As of September 9, 2026, Brother's official guide also describes those two keys correctly. The problem was the type of the external accessory protocol setting in our repository.

It is a small configuration example, but users copy it into their apps. Even correct library code will not work if the installation instructions are wrong.

I updated the example and documented the crash's cause in the [installation guide](https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.2.0/docs/installation.md).

## Fixing discovery and permissions, not just configuration

On iOS, when no connected printer is found, the plugin now calls the Brother SDK's `startBluetoothAccessorySearch` to open the system accessory selection and pairing interface.

I also connected a physical Android device and corrected runtime permission handling for Bluetooth discovery. For Bluetooth Classic, pair the printer in Android's system settings before searching.

During this investigation, I verified discovery and opening a communication channel to a QL-820NWBc from an iPad, and detection of a paired QL printer from a Pixel 8a. That describes the discovery and connection checks performed here, not verification of every printing configuration.

With these fixes in place, I also updated the README's description of the Bluetooth connection issue.

The QL-series connection discussed here uses Bluetooth Classic. I distinguish it from BLE and document support and testing status for each model in the [README's compatibility table](https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.2.0/README.md#supported-models). Separately from official Bluetooth support, the plugin as a whole remains a release candidate.

## On Android, searching for printers also finds non-printers

Once Bluetooth discovery worked, another issue became apparent: Android search results included paired devices that were not printers.

It is tempting to assume that a search through the Brother SDK returns only Brother printers. That is not how these results are filtered.

Could we just check whether a device name contains `Brother` or `QL-`?

I wanted to avoid that too. Bluetooth device names can be changed, and an open-source library should not dictate what users name their devices. The SDK's `ModelName` is also a Bluetooth device name in this context, not an identifier that guarantees a particular model.

Instead of checking names, I added filtering based on the Printer classification reported by the Bluetooth Class of Device.

### Let the caller choose whether to filter

The new option is `bluetoothPrintersOnly`.

```typescript
import {
  BrotherPrint,
  BRLMPrinterPort,
} from '@rdlabo/capacitor-brotherprint';

await BrotherPrint.search({
  port: BRLMPrinterPort.bluetooth,
  searchDuration: 15, // Required by the type, but not used for Bluetooth Classic
  bluetoothPrintersOnly: true,
});
```

This example shows the search options. Results arrive through `onPrinterAvailable`, not the return value, so register a listener first in an actual app. The [search guide](https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.2.0/docs/search.md) covers listener registration and retaining discovered results.

This option applies only to Android Bluetooth Classic searches. It is ignored on iOS and for other connection types.

The default is `false`. Omitting it preserves the existing results.

Since this is a printer plugin, always filtering might seem reasonable. However, this check only tells us whether a device reports the Printer classification. Enabling it excludes devices whose classification cannot be obtained. Conversely, printers from other manufacturers remain if they report that classification.

I cannot remove previously discoverable devices from every user's environment just because doing so works well with my own hardware. Apps that want a printer-focused selection screen can enable it. Apps that need the existing results can keep them. This time, I left that choice with the caller.

:::details Why we do not compare directly with the reported 0x140680 value

The Brother QL-820NWB and TD-2350D checked during the investigation reported a Class of Device of `0x140680`.

That value includes service information as well as the device classification. The filter uses only the Imaging major class and the bit representing Printer.

Android's `deviceClass` also omits the service bits, so an exact comparison with `0x140680` would not work.

The implementation masks only the relevant bits:

```kotlin
(deviceClass and 0x1F80) == 0x0680
```

This avoids excluding a printer that also reports Scanner capabilities. The code comments record both the observed `0x140680` value and the bits used for classification.

The SATO printer checked during the investigation also had the Printer classification. This check identifies a device category, not Brother products.

:::

## Reviewing search completion and failure notifications

Alongside the Bluetooth fixes, I reviewed Promise completion and event emission.

I found paths where canceling a search left its Promise pending, and others where `resolve()` was called before discovery finished.

When an app calls `await BrotherPrint.search(...)`, neither proceeding before discovery finishes nor waiting indefinitely is useful. Both affect loading indicators and when the user can take the next action.

v8.2.0 also includes these fixes:

- Complete the Promise when an iOS Wi-Fi search is canceled.
- Complete Android Wi-Fi and USB search Promises after discovery finishes.
- Avoid overwriting pending calls during Android USB permission requests.
- Reject invalid Base64 and non-image input before opening the printer.
- Emit `onPrintError` as well as rejecting the call for print input validation and related failures.

In existing apps, pay particular attention to search completion timing and error presentation. If both a Promise's `catch` handler and an event listener display notifications, check that the same failure is not shown twice.

## Putting SDK-independent logic into CI

I also added Android and iOS regression tests to CI. Instead of bundling the Brother SDK in the repository, I extracted SDK-independent logic and tested the actual production code. The tests cover Android Bluetooth printer classification and iOS image decoding.

This lets us check classification rules and invalid image handling on every PR. Discovery and connection through the SDK, and actual printing, remain outside this CI suite. Automated tests check logic regressions; physical devices are still needed to verify SDK and hardware combinations.

## Upgrading to v8.2.0

Update an existing app with:

```sh
npm install @rdlabo/capacitor-brotherprint@8.2.0
npx cap sync
```

If your iOS app copied the previous configuration example, update the app's `Info.plist` too. Upgrading the package alone will not rewrite that setting.

New installations also require a separate Brother SDK setup. The instructions and full change list are available here:

- [Installation guide](https://github.com/rdlabo-dev/capacitor-brotherprint/blob/v8.2.0/docs/installation.md)
- [v8.2.0 release notes](https://github.com/rdlabo-dev/capacitor-brotherprint/releases/tag/v8.2.0)

The biggest outcome of this release is identifying why Bluetooth connections failed, correcting the configuration and discovery code, and being able to document Bluetooth as a supported connection option.

If you previously tried Bluetooth without success, check the `Info.plist` type and give it another try. Reports from hardware I do not own are welcome too. Include the printer model, OS, connection type, and exactly which operations you verified in an issue; that makes it easier to update the compatibility table.

Until next time.

---
title: "API"
code: []
scrollActiveLine: []
sourceRevision: "f356d45638e3abbc56fcf92bd932439ba9e40517c0de9117798743319005ecd1"
---
Öffentliche Methoden, Ergebnistypen, Fehlertypen und Ereignisse, die `@capacitor/docgen` aus `@capacitor-community/stripe-identity` v8.2.1 auflöst.

`addListener` wird für die drei unterstützten Ereignisnamen `Loaded`, `FailedToLoad` und `VerificationResult` generiert. `Completed`, `Canceled` und `Failed` sind Werte von `IdentityVerificationResult.result` (`IdentityVerificationSheetResultInterface`). Sie werden nicht als separate `addListener`-Überladungen unterstützt.

## Methoden

!::initialize::

!::create::

!::present::

!::addListener::

## Interfaces

!::InitializeIdentityVerificationSheetOption::

!::CreateIdentityVerificationSheetOption::

!::IdentityVerificationResult::

!::StripeIdentityError::

!::PluginListenerHandle::

## Typaliase

!::IdentityVerificationSheetResultInterface::

## Enums

!::IdentityVerificationSheetEventsEnum::

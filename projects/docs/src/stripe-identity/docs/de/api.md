---
title: "API"
code: []
scrollActiveLine: []
sourceRevision: "8e3e3e902cb290a89fde5e69ac2370f02dcf058ca20be64dd127a31af69b50a9"
---
Öffentliche Methoden, Ergebnistypen, Fehlertypen und Ereignisse, die `@capacitor/docgen` aus `@capacitor-community/stripe-identity` v8.3.0 auflöst.

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

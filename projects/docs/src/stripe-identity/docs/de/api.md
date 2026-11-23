---
title: "API"
code: []
scrollActiveLine: []
sourceRevision: "fe2be2501dfe768eb14afdb2f6497051efdb315eb3d65e94b298574b176865f3"
---
Öffentliche Methoden, Ergebnistypen, Fehlertypen und Ereignisse, die `@capacitor/docgen` aus `@capacitor-community/stripe-identity` v8.4.0 auflöst.

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

---
title: "Eine erweiterte API auswählen"
sourceRevision: "36b669fe0fe5d7f321ae97def344d07b379feb38f23ffd5579bce18341b4d4ed"
---
# Erweiterte APIs

Die grundlegende Registrierung übernimmt bereits Messung, Aufnahme und Übergabebestätigung. Fügen Sie keinen zweiten Projektionsmanager für denselben Host hinzu. Verwenden Sie die folgenden APIs, wenn Ihr Renderer die jeweilige Arbeit bereits übernimmt und sie koordinieren muss:

| Bedarf | API / Leitfaden |
| --- | --- |
| Aufgeschobene native Positionierung direkt vor der Rückkehr einer undurchsichtigen Android-Ansicht anwenden | `beforeNativeReveal`, `updatePlacement`, `isProjecting` und `bindProjectionPlacement`; siehe [Android-Positionierungsübergabe](android-placement.md#final-placement-when-returning-from-an-opaque-image-android). Beide Callbacks führen standardmäßig keine eigene Positionierungsarbeit aus. |
| Unabhängige Seiten oder Modals mit mehreren nativen Steuerelementen verwalten | `createWebProjectionSurface` / `createWebProjectionSurfaces`; siehe [Renderer-Leitfaden](renderer.md). |
| Mehrere Fallback-Container in einer nativen Transaktion koordinieren | `createWebProjectionBatch`; siehe [Batch-Übergabe](web-projection.md#multiple-fallbacks-in-one-native-transaction). |
| Ein bestehendes Zuständigkeitsmodell abbilden, das Oberflächenhelfer nicht ausdrücken können | `createWebProjectionScope` / `createWebProjection`; siehe [untergeordnete Web-Projektion](web-projection.md). |
| Ersetzbare Zustandsaktualisierungen serialisieren und eine verlorene Bestätigung wiederherstellen | `createNativeUpdateQueue`; siehe [Aktualisierungsplanung und Wiederherstellung](update-queue.md). |
| Die native Bridge für einen eigenen Renderer implementieren | `handle`-Methoden der Snapshot-Manager; siehe [native Übergabe](native-handoff.md). |

Dies sind Integrationsentscheidungen, keine zusätzlichen Schritte zum Abschluss einer normalen `NativeUIProjection`-Einrichtung. Belassen Sie Geschäftsaktionen, SDK-Interaktion und Anwendungsbenachrichtigungen im konsumierenden Plugin.

[Dokumentationsübersicht](../README.md)

---
title: "Gemeinsame Steuerelemente für native Adapter"
sourceRevision: "df25f5115089f83ef851866adc2db0f16a2ce21ac4a1eed70cb497b56c35c2ba"
---
# Gemeinsame Steuerelemente für native Adapter

Das bestehende Engine-Paket enthält auch die von Capacitor Native UI verwendete Implementierung der Steuerelemente. Ein zusätzliches npm-Paket oder ein weiterer Workspace ist nicht erforderlich.

- `@webview-native-ui/engine`: generische Projektions-API; unveränderte Abhängigkeitsgrenze.
- `@webview-native-ui/engine/controls`: Steuerelement-Laufzeit und Transportvertrag.
- `@webview-native-ui/engine/controls/ionic`: optionale Ionic-Overlay-Implementierung.
- `@webview-native-ui/engine/integration`: der einzige gemeinsam genutzte Integrationszustand für Übergänge und Suche.

Ein Adapter erstellt eine Instanz von `createNativeUI({ plugin, getPlatform, isAvailable })` und behält sie über seine gesamte Lebensdauer. Das Plugin implementiert die Transportschnittstelle `NativeUIPlugin`. Der Adapter verwaltet Hostregistrierung, Methodenzuordnung, Listener-Benachrichtigungen und Lebenszyklus-Hooks; die Engine verwaltet Rendering, DOM-Zuständigkeit, Erweiterungsbestätigungen und die Reihenfolge des Abbaus. Cordova kann denselben Transport ohne Capacitor-Import bereitstellen. Das Cordova Native UI-Plugin selbst folgt in einer späteren Änderung.

SwiftPM stellt das optionale Produkt `WebViewNativeUIControls` bereit, das von `WebViewNativeUIEngine` abhängt. CocoaPods stellt `WebViewNativeUIControls` mit derselben Abhängigkeit bereit. Android stellt das optionale Artefakt `io.github.webview-native-ui:controls` aus `android/controls` bereit; es hängt von `engine` und Compose ab. Generische Engine-Verbraucher behalten ihre bestehenden Abhängigkeiten und Android-Mindest-SDK 23. Controls benötigt Android API 24. Native Adapter erstellen `NativeUIController` und leiten Anfragen und Ereignisse weiter. iOS empfängt JSON-Dictionaries und Abschluss-Closures; Android empfängt JSONObjects.

Das Ionic-Theme importiert die Engine-Integration direkt. Der kompatible Capacitor-Integrationsexport exportiert dieses Modul erneut. Lösen Sie in der Anwendung genau eine Engine-Version auf; bündeln Sie keine private Kopie der Integration im Theme oder Adapter. Der Einstiegspunkt `/controls` lädt keinen Ionic-Laufzeitcode; laden Sie `/controls/ionic` nur, wenn Sie Ionic-Overlays aktivieren.

## Prüfung und Veröffentlichungsreihenfolge

Führen Sie `npm run test:controls` für die migrierten Steuerelementtests und `npm test` für die generische Projektion aus. Das SwiftPM-Schema `WebViewNativeUIEngine-Package` deckt beide nativen Targets ab. Androids `:controls:testReleaseUnitTest` deckt den migrierten Snapshot-Parser ab. Bestehende Capacitor-Transporttests und Tests des gehosteten Lebenszyklus bleiben in dessen Repository; das Theme behält die echte Demo-E2E-Suite.

Erstellen und prüfen Sie zuerst die Engine, einschließlich beider signierter Maven-Artefakte im selben Central-Bundle und beider über npm verteilter Podspecs. Veröffentlichen Sie die nativen Engine-Artefakte und das npm-Paket mit derselben Version, bevor Sie die Registry-Lockdateien von Capacitor und Theme aktualisieren. Kandidatenprüfungen verwenden lokale npm-Tarballs und einen temporären SwiftPM-Pfad oder ein lokales Maven-Repository; committen Sie diese temporären Pfade nicht.

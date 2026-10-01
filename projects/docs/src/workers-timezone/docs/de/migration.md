---
title: "Migration"
sourceRevision: "de9dd1781ec167db1c8164d0ecb74a96278ca0e25147df9959b5fcc62464ce2e"
---
# Migration

Ab Kit `0.12.0` ist `@rdlabo/workers-hono-kit/business-time` ein veralteter Re-Export dieses Pakets. Installieren Sie `@rdlabo/workers-timezone` direkt und ändern Sie den Importpfad. Bestehende Funktionsnamen bleiben verfügbar. Neuer Code kann `toLocalDateTime`, `localDateTimeToInstant` und die weiteren zeitzonenneutralen Namen aus der [API](./api.md) verwenden.

## Verhaltensänderungen

Der Standard bleibt `Asia/Tokyo`, aber Kompatibilität bedeutet nicht für jede Eingabe eine identische Ausgabe:

- Die Konvertierung verwendet historische IANA-Versätze statt eines festen `+09:00`. Historische Datumswerte für Tokio können
  daher unterschiedliche Ergebnisse liefern.
- Ungültige reine Datumswerte werden zu `null` normalisiert. Die Konstruktion ungültiger Datum-Zeit-Werte löst `RangeError` aus,
  statt in einen anderen Monat überzulaufen.
- Bei Sommerzeitüberschneidungen wird das frühere Vorkommen gewählt. Übersprungene lokale Uhrzeiten und vollständig übersprungene Daten lösen einen Fehler aus.

Behandeln Sie dies bei der Migration von der alten Implementierung mit festem Versatz als inkompatible Verhaltensänderungen. Testen Sie historische Daten und Validierungsgrenzen vor der Bereitstellung. Der Kompatibilitätsimport teilt dasselbe zugrunde liegende Modul; er ist kein separater Konfigurationsplatz für eine Zeitzone.

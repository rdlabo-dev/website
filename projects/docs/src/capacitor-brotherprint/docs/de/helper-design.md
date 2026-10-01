---
title: "Entwurfsentscheidungen der Hilfsfunktionen"
sourceRevision: "a9463d3640cf72326849d5a28e159987a62069688361d5deed5929e6d0c2c6f0"
---
# Entwurfsentscheidungen

Diese Hilfsfunktionen lagern wiederkehrende Verbindungsaufgaben aus Etikettendruck-Anwendungen aus. Sie verwenden das in diesem Paket enthaltene Plugin und behalten den vorhandenen nativen Vertrag bei.

## Verantwortungsgrenzen

| Beobachtete Aufgaben in Anwendungen | Gemeinsames Verhalten | Verantwortung der Anwendung |
| --- | --- | --- |
| Ansichten wiederholen plattform- und modellabhängige Verbindungsprüfungen | Capacitor-Plattform auslesen, unterstützte Ports filtern und die gespeicherte beziehungsweise Standardverbindung bestimmen | Verbindungsmöglichkeiten anzeigen |
| Eine zweite Suche trifft ein, während die erste läuft | Hilfsfunktionsaufrufe bis zum nativen Abschluss und Entfernen der Listener serialisieren; nach Fehlern wieder bereit sein | Entscheiden, wann gesucht wird, und eine Ladeoberfläche anzeigen |
| Ein gespeicherter Netzwerkdrucker kann die Verbindung verloren haben | Einen passenden vorherigen Kanal prüfen und bei Nichtverfügbarkeit erneut suchen | Speicher-Callbacks bereitstellen und entscheiden, ob eine erneute Suche sinnvoll ist |
| Ein Drucker wird manuell eingegeben statt über die Suche gefunden | Einen expliziten Port mit Adresse ohne Suchmetadaten oder Ausweichsuche prüfen | Das tatsächliche Modell angeben, den Port wählen und nicht verfügbare Ergebnisse behandeln |
| Suchereignisse wiederholen sich oder verwenden Produktnamensaliase | Ergebnisse sammeln und vorhandenen Modell-Enums zuordnen | Einen Drucker auswählen oder die Auswahl abbrechen |
| Ansichten registrieren Listener und werden später geschlossen | Eine Sitzung verwaltet Ergebnisse, Druck-Listener und einen endgültigen geschlossenen Zustand; eingereihte native Vorgänge überspringen und verspätete Ergebnisse verwerfen | Eine Sitzung pro Ansicht erstellen, beim Verlassen freigeben und nach asynchroner Bilderzeugung `closed` prüfen, bevor Benutzeroberflächen angezeigt werden |

## Ein wiederverwendbarer Kandidat und ein explizites Ziel

Die Unterscheidung zwischen Vorbereitung und expliziter Prüfung ist beabsichtigt. Ein vorheriger Drucker ist eine Komfortfunktion, bei der auf eine neue Suche ausgewichen werden kann. Eine ausdrücklich gewählte Adresse ist dagegen ein Ziel: Eine fehlgeschlagene Prüfung darf nicht stillschweigend einen anderen Drucker auswählen.

## Bis zum nativen Abschluss serialisieren

Im tatsächlichen Anwendungscode kamen sowohl kurze Vorabsuchen als auch längere, vom Benutzer angeforderte Suchvorgänge vor. Daher bleibt die Dauer eine explizite native Suchoption. Feste JavaScript-Timer werden nicht verwendet, um auf den SDK-Abschluss zu schließen. Mehrere Ports können durchsucht werden, indem ein Hilfsfunktionsaufruf nach dem anderen abgewartet wird. Es werden weder ein automatischer Suchplan noch eine Ableitung der Verbindungsart hinzugefügt.

## Anwendungsrichtlinien

Auswahldialoge, Speicherimplementierung, Listen ausgeblendeter Geräte, Analysen, Bilderzeugung, Schriften, Etikettenlayouts und benutzerseitige Meldungen gehören in die Anwendung. Änderungen am nativen SDK und automatische Druckwiederholungen sind nicht Teil dieser Hilfsfunktionen. Vorhandene native Fehler und Verfügbarkeitsergebnisse bleiben erhalten, statt neu eingestuft zu werden.

## Freigabe der Ansicht vom nativen Abschluss trennen

`BrotherPrinterSession` bildet die zustandsbehaftete Grenze einer Druckansicht. Sie teilt dieselbe native Verbindungswarteschlange mit den zustandslosen Hilfsfunktionen. Dadurch kann eine neue Ansicht keine noch laufende Suche der vorherigen Ansicht überlagern. Die Freigabe beansprucht nicht, einen nativen Vorgang abzubrechen: Eine aktive Suche wird abgeschlossen und ihr Listener entfernt; ein bereits gestarteter Druck läuft weiter. `dispose()` wartet auf das Entfernen der Druck-Listener, nicht auf den Abschluss der Suche oder des Drucks. Warten Sie separat auf das Promise von `printImage()`, wenn der Aufrufer auf den Druckabschluss warten muss. Die Anwendung benötigt keine eigene Suchwarteschlange, Listener-Liste oder Abbruchgenerierungszähler.

## Von der Anwendung bereitgestellter Speicher

Der optionale Sitzungsspeicher verwaltet Verbindungsschlüssel und JSON-Serialisierung über die Callbacks `get`, `set` und `remove`. Anwendungen stellen den Speicher bereit; für die Druckervorbereitung und das Merken des ausgewählten Ziels ist kein separater Persistenzcode in der App nötig.

Anwendungs- und Codebeispiele finden Sie unter [JavaScript-Druckerhilfen](/docs/connection-management).

## Was die Tests belegen

Die Tests prüfen diese Verbindungsabläufe mit dem gebauten Paket und dem Standard-Testrunner von Node. Sie belegen weder die Kompatibilität physischer Drucker noch die Modellidentität anhand einer Verfügbarkeitsprüfung.

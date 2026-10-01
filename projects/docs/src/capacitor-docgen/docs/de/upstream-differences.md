---
title: "Unterschiede zum ursprünglichen Projekt"
sourceRevision: "4e8f949ba40ff9226107e041163402b220c811ad21843f708ed02745f61551c4"
---
Dieser Vergleich bezieht sich auf die veröffentlichten npm-Pakete `@rdlabo/capacitor-docgen@0.4.1` und `@capacitor/docgen@0.3.1`. Der Fork basiert auf dem Ionic-Projekt, wird aber von rdlabo separat veröffentlicht und gepflegt.

## Kompatibilitätsübersicht

| Bereich                             | Ursprüngliches Projekt 0.3.1                                                                                          | rdlabo-Fork 0.4.1                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Paket                             | `@capacitor/docgen`                                                                                     | `@rdlabo/capacitor-docgen`                            |
| Ausführbare Datei                              | `docgen`                                                                                                | `docgen`                                              |
| CLI-Optionen                           | `--api` (`-a`), `--output-readme` (`-r`), `--output-json` (`-j`), `--project` (`-p`), `--silent` (`-s`) | Identisch                                                  |
| README-Platzhalter                 | `<docgen-index>`, `<docgen-api>`                                                                        | Identisch                                                  |
| Zentrale Exports                        | `generate`, `parse`, Ausgabehilfsfunktionen, `run`, öffentliche Typen                                                | Identisch                                                  |
| Metadaten zur Schnittstellenvererbung         | Nicht bereitgestellt                                                                                             | `DocsInterface.extends: string[]`                     |
| Geerbte Methoden und Eigenschaften    | Nicht aufgelöst                                                                                            | Aus den ermittelten Objekten der Basisschnittstellen angehängt         |
| Vererbung der primären API             | Nur direkt deklarierte API-Member                                                                      | Die Member der ermittelten Basisobjekte werden an die API angehängt  |
| Basisschnittstelle über einen Typalias | Für die Vererbung nicht aufgelöst                                                                            | Die `complexTypes` des Alias werden zur Ermittlung der Basisschnittstellen verwendet |

Die veröffentlichten Tarballs enthalten byteidentische kompilierte Module für CLI-Parsing, Generierung, Markdown-Verarbeitung, Ausgabeformatierung und die Erstellung des TypeScript-Programms. Die verhaltensändernden Implementierungen beschränken sich auf `dist/parse.js`; die Änderung der öffentlichen Deklarationen befindet sich in `dist/types.d.ts`. Auch die Paketmetadaten und README-Inhalte unterscheiden sich.

## Ergänzungen des Parsers

Für jede Schnittstelle auf oberster Ebene speichert der Fork den Text ihrer TypeScript-Vererbungsausdrücke in `DocsInterface.extends`. Wenn docgen diese Schnittstelle erfasst, führt es folgende Schritte aus:

1. Es behält einen Basisnamen bei, der direkt mit einer eingelesenen Schnittstelle übereinstimmt;
2. es löst einen passenden Typalias in die von ihm referenzierten `complexTypes` auf;
3. es ermittelt die daraus resultierenden Basisschnittstellen; und
4. es hängt die Methoden und Eigenschaften, die zu diesem Zeitpunkt in diesen Basisschnittstellenobjekten vorhanden sind, an die abgeleitete Schnittstelle an.

Seit v0.4.1 wird dieselbe Erfassung auch für die primäre API-Schnittstelle ausgeführt. Eine Plugin-API kann dadurch Methoden von einer Plugin-Basisschnittstelle erben. In v0.4.0 erfolgte diese Auflösung nur bei unterstützenden Schnittstellen.

## Beobachtbare Ausgabe

Für eine abgeleitete Optionsschnittstelle gibt das ursprüngliche Projekt nur die Member aus, die direkt in dieser Schnittstelle deklariert sind. Der Fork gibt diese Member aus, gefolgt von den Membern, die sich zu diesem Zeitpunkt im ermittelten Basisschnittstellenobjekt befinden. Das unverarbeitete JSON und die generierte Markdown-Tabelle enthalten daher geerbte Member, und das programmatische Ergebnis enthält das Array `extends`.

Die Erfassung verändert die gemeinsamen eingelesenen Schnittstellenobjekte direkt. Veranlasst ein anderes API-Member zuerst die Erfassung und Erweiterung einer Basisschnittstelle, enthält dieses Basisobjekt bereits kopierte Member seiner Vorgänger, wenn eine später erfasste abgeleitete Schnittstelle es verwendet. Diese indirekten Member werden dann an die abgeleitete Schnittstelle weitergegeben. Die Ausgabe kann deshalb von der Reihenfolge der Member-Erfassung abhängen, obwohl der Code nicht in einer einzigen Operation rekursiv die gesamte Vererbungskette durchläuft.

Die bestehenden CLI-Optionen, die Platzhalterersetzung, die Überschriften-Generierung, die JSON-Ausgabe und die exportierten Funktionen behalten ansonsten das Verhalten des ursprünglichen Projekts bei.

## Aktuelle Grenzen

Die Erweiterung ist bewusst eine kleine Ergänzung des Parsers und keine vollständige Auflösung aller TypeScript-Typen:

- Sie löst nicht in einer einzigen Erfassungsoperation rekursiv eine vollständige mehrstufige Vererbungskette auf. Da Objekte direkt verändert werden, kann eine zuvor erweiterte Basis jedoch ihre bereits kopierten Vorgänger-Member an eine später erfasste abgeleitete Schnittstelle weitergeben. Ohne diese vorherige Erfassung erhält dieselbe abgeleitete Schnittstelle nur die ursprünglichen direkten Member der Basis.
- Ein Member der abgeleiteten Schnittstelle, das ein Basis-Member überschreibt, wird nicht anhand seines Namens mit diesem abgeglichen. Beide Einträge können erscheinen, da die Deduplizierung die Objektidentität verwendet.
- Die Zuordnung bei der Vererbung erfolgt namensbasiert anhand der eingelesenen Schnittstellen auf oberster Ebene. Qualifizierte Ausdrücke und das Zusammenführen von Deklarationen werden durch die Erweiterung nicht normalisiert.
- Das Paket verwendet weiterhin dieselbe TypeScript-Parserabhängigkeit `~4.2.4` und dieselbe Node.js-Engine-Deklaration `>=18` wie das ursprüngliche Projekt 0.3.1.
- Beide Pakete stellen dieselbe ausführbare Datei `docgen` bereit. Verwenden Sie daher eines der beiden, statt sie gleichzeitig als direkte Abhängigkeiten zu installieren.

Diese Grenzen, einschließlich beider Erfassungsreihenfolgen, werden in diesem Dokumentationsrepository durch Vertragstests geprüft. Der Vergleich wird sich daher ändern, wenn eine künftige Fork-Version das Verhalten ändert.

## Versionshistorie

- Der Fork v0.3.x führte das separat veröffentlichte Paket `@rdlabo/capacitor-docgen` und eine erste Unterstützung für Vererbung ein.
- Der Fork v0.4.0 stellte die Ermittlung der Vererbung auf TypeScript-Vererbungsklauseln um, ergänzte `DocsInterface.extends`, löste Schnittstellenaliase auf und erweiterte die Ausgabe um geerbte Methoden und Eigenschaften.
- Der Fork v0.4.1 wandte die Erweiterung um geerbte Member auch auf die primäre API-Schnittstelle an.

Prüfen Sie bei der Bewertung späterer Versionen die festgelegten Quellen des [Forks v0.4.1](https://github.com/rdlabo-dev/capacitor-docgen/tree/v0.4.1) und des [ursprünglichen Projekts v0.3.1](https://github.com/ionic-team/capacitor-docgen/tree/v0.3.1).

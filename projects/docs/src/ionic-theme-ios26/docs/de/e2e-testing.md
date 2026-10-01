---
title: "E2E-Tests mit Screenshots"
sourceRevision: "36c551fdceca8117e6a2c28a49f3b0e573a461d91a526be517018f0727c235a1"
---
# E2E-Tests mit Screenshots

Diese Maintainer-Anleitung erklärt die Ausführung der visuellen Playwright-Regressionstests für die iOS26-Demo. Die Tests decken jeden in `demo/e2e/screenshot.spec.ts` deklarierten Eintrag im hellen und dunklen Modus ab. Overlay-Varianten werden aus den gemeinsamen Arrays in `demo/src/app/overlay-types.ts` erzeugt.

## Die Testsuite ausführen

Installieren Sie zuerst die Abhängigkeiten der Demo:

```bash
cd demo
npm install
```

Wählen Sie anschließend den zur Aufgabe passenden Befehl:

```bash
npm run test:e2e          # Die Testsuite ausführen
npm run test:e2e:ui       # Playwright im UI-Modus öffnen
npm run test:e2e:debug    # Mit dem Playwright-Debugger ausführen
npm run test:e2e:update   # Referenzbilder für beabsichtigte Änderungen neu erzeugen
```

Führen Sie zum Nachbilden der Linux-Umgebung von CI die Docker-Varianten aus `demo/` aus:

```bash
npm run test:e2e:docker
npm run test:e2e:docker:update
```

Die Docker-Befehle verwenden das in `demo/package.json` festgelegte Playwright-Image.

## Einen Fehler prüfen

Eine Screenshot-Abweichung kann eine Regression oder eine beabsichtigte visuelle Änderung sein. Vor dem Aktualisieren einer Referenz:

1. Prüfen Sie Ist-, Soll- und Differenzbilder in `demo/test-results/`.
2. Prüfen Sie die betroffene Route im hellen und dunklen Modus.
3. Bestätigen Sie, dass die Komponentenänderung beabsichtigt ist.
4. Erzeugen Sie die Referenz mit `npm run test:e2e:update` neu oder verwenden Sie für das CI-Rendering die Docker-Variante.

Der HTML-Bericht wird in `demo/playwright-report/` gespeichert und lässt sich folgendermaßen öffnen:

```bash
npx playwright show-report
```

## Die Abdeckung erweitern

Aktualisieren Sie beim Hinzufügen einer Demo-Route oder Overlay-Variante `demo/e2e/screenshot.spec.ts` und erzeugen Sie die betreffenden Referenzen neu. Committen Sie Referenzänderungen erst nach Prüfung der visuellen Differenz.

Pull Requests mit Ziel `main` oder `ios26` führen den E2E-Workflow in `.github/workflows/e2e-pull_request.yml` aus. Pushes auf beide Branches führen `.github/workflows/e2e-main.yml` aus. GitHub baut den Merge-Ref des Pull Requests gegen dessen Zielbranch. Ein Pull Request für `ios26` beginnt deshalb mit den iOS-26-Snapshots. Vom Pull Request beabsichtigt geänderte Snapshots werden dann als Teil dieses Merge-Ergebnisses geprüft. Der Befehl `/update-screenshots` lädt sein Aktualisierungsverfahren aus dem Zielbranch des Pull Requests und committet die neu erzeugten Screenshots in dessen Branch.

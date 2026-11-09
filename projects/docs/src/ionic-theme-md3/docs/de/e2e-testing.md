---
title: "E2E-Tests mit Screenshots"
sourceRevision: "3243fd490f863debf57d5e7974d310cfc70a9511efa4dc5b47186e978362703b"
---

# E2E-Tests mit Screenshots

Diese Maintainer-Anleitung erklärt die Ausführung der visuellen Playwright-Regressionstests für die Material-Design-3-Demo. Die Tests decken jeden in `demo/e2e/screenshot.spec.ts` deklarierten Eintrag im hellen und dunklen Modus ab. Overlay-Varianten werden aus den gemeinsamen Arrays in `demo/src/app/overlay-types.ts` erzeugt.

## Die Testsuite ausführen

Installieren Sie zuerst die Abhängigkeiten der Demo:

```bash
cd demo
npm install
```

Wählen Sie anschließend den zur Aufgabe passenden Befehl:

```bash
npm run test:e2e          # Suite ausführen
npm run test:e2e:ui       # Playwright-UI-Modus öffnen
npm run test:e2e:debug    # Mit dem Playwright-Debugger ausführen
# Kommentieren Sie für akzeptierte PR-Referenzänderungen /update-screenshots in der PR.
```

Führen Sie zum Nachbilden der Linux-Umgebung von CI die Docker-Varianten aus `demo/` aus:

```bash
npm run test:e2e:docker
```

Die Docker-Befehle verwenden das in `demo/package.json` festgelegte Playwright-Image.

## Einen Fehler prüfen

Eine Screenshot-Abweichung kann eine Regression oder eine beabsichtigte visuelle Änderung sein. Vor dem Aktualisieren einer Referenz:

1. Prüfen Sie Ist-, Soll- und Differenzbilder in `demo/test-results/`.
2. Prüfen Sie die betroffene Route im hellen und dunklen Modus.
3. Bestätigen Sie, dass die Komponentenänderung beabsichtigt ist.
4. Fordern Sie `/update-screenshots` in der PR an und prüfen Sie den CI-generierten Commit.
   Lokale Läufe von `test:e2e:update` / `test:e2e:docker:update` sind zur Untersuchung in einem Wegwerf-Checkout möglich; committen Sie diese Bilder nicht als PR-Referenzen.

Der HTML-Bericht wird in `demo/playwright-report/` gespeichert und lässt sich folgendermaßen öffnen:

```bash
npx playwright show-report
```

## Die Abdeckung erweitern

Aktualisieren Sie beim Hinzufügen einer Demo-Route oder Overlay-Variante `demo/e2e/screenshot.spec.ts` und erzeugen Sie die betreffenden Referenzen neu. Nutzen Sie den CI-Aktualisierungsworkflow und prüfen Sie dessen committierten Bildvergleich.

Pull Requests führen den E2E-Workflow in `.github/workflows/e2e-pull_request.yml` aus. Pushes auf `main` führen `.github/workflows/e2e-main.yml` aus.

## PR-Referenzbilder aktualisieren

Posten Sie bei einer beabsichtigten Darstellungsänderung `/update-screenshots` in der PR. Der Workflow prüft die Mitarbeitendenberechtigung, erzeugt Bilder im festgelegten Playwright-Container und committet sie auf den PR-Branch. Holen Sie diesen Commit vor der weiteren Arbeit. Prüfen Sie Änderungen im hellen/dunklen Modus und nehmen Sie keine unerwarteten Änderungen in die Referenz auf. Lokale Screenshots sind Untersuchungsartefakte, keine Ersatzreferenzen für diesen Workflow.

## Dokumentationsvorschauen

Die Docs-Seite der Demo wird aus `docs/special-markup.md` generiert. Führen Sie nach Änderungen `npm --prefix demo run docs:generate` aus, committen Sie den generierten Inhalt und prüfen Sie `/main/docs` in der laufenden Demo. Auch `prestart` und `prebuild` regenerieren ihn. Belassen Sie Einrichtungshinweise in den verlinkten Anleitungen und Vorschau-Markup im Quell-Markdown; bearbeiten Sie `docs-content.generated.ts` nicht von Hand.

---
title: "Identity Verification Sheet"
code: ["identity-verification-sheet/example.ts.md"]
scrollActiveLine: [{"id":"","activeLine":{"example.ts":[1,1]}},{"id":"auf-das-ergebnis-h%C3%B6ren","activeLine":{"example.ts":[5,18]}},{"id":"sitzungszugangsdaten-beziehen","activeLine":{"example.ts":[31,34]}},{"id":"die-web-plattform-initialisieren","activeLine":{"example.ts":[27,31]}},{"id":"das-sheet-erstellen-und-anzeigen","activeLine":{"example.ts":[34,42]}},{"id":"failedtoload-verarbeiten","activeLine":{"example.ts":[18,27]}},{"id":"verificationresult-verarbeiten","activeLine":{"example.ts":[5,18]}},{"id":"fehler-und-abbruch","activeLine":{"example.ts":[5,18]}}]
sourceRevision: "f1ef38cf6f85e81d0ab969d17174fe4680e030d4c66aa998cb09fc22cfaec596"
---
Stripe Identity prüft Identitätsdokumente unter iOS und Android in einem nativen Sheet und im Web über Stripe.js. Der Anwendungscode bleibt dabei in Capacitor.

Das Plugin unterstützt iOS, Android und Web. Native Plattformen zeigen das Stripe Identity Verification Sheet mit `verificationId` und `ephemeralKeySecret` an. Das Web ruft nach `initialize` `verifyIdentity` mit `clientSecret` auf.

## Der Weg zur ersten Verifizierung

Gehen Sie für die erste erfolgreiche Übermittlung in dieser Reihenfolge vor:

1. Erstellen Sie eine VerificationSession auf Ihrem Backend und geben Sie die folgenden für den Client sicheren Felder zurück.
2. Registrieren Sie den Listener `VerificationResult` einmal beim Anwendungsstart, vor `present()`.
3. Rufen Sie im Web `initialize` mit dem veröffentlichbaren Schlüssel auf.
4. Rufen Sie `create` und anschließend `present()` auf.

Erster Erfolg auf dem Gerät: Das Sheet öffnet sich und Sie erhalten `Completed`, nachdem der Nutzer das Testdokument hochgeladen hat. `Completed` bedeutet, dass die Übermittlung abgeschlossen ist, nicht die Prüfung. Bestätigen Sie das offizielle Ergebnis mit Identity-Webhooks auf Ihrem Server. Das Codepanel folgt demselben Ablauf.

## Auf das Ergebnis hören

Registrieren Sie den Ergebnis-Listener einmal beim Anwendungsstart und vor dem Aufruf von `present()`. Android kann die Activity und die JavaScript-Laufzeit neu erstellen, während das native Sheet geöffnet ist. Frühe Registrierung verhindert deshalb, dass ein geliefertes Ergebnis verpasst wird.

Behalten Sie den Listener während der Lebensdauer seiner zuständigen Instanz auf Anwendungsebene bei, beispielsweise `main.ts`, einem Anwendungsinitialisierer oder einem beim Start initialisierten Singleton-Dienst. Entfernen Sie ihn nicht unmittelbar nach der Rückkehr von `present()`. Unter Android wird `present()` aufgelöst, sobald das Sheet angezeigt wird; das Ergebnis trifft später über `VerificationResult` ein.

`Completed`, `Canceled` und `Failed` sind Ergebniswerte in `IdentityVerificationResult.result`. Sie werden nicht als separate `addListener`-Überladungen unterstützt. Registrieren Sie `IdentityVerificationSheetEventsEnum.VerificationResult` und prüfen Sie `result`.

!::IdentityVerificationSheetEventsEnum::

Die native Ergebnisübergabe bleibt im Arbeitsspeicher. Sie garantiert keine Wiederherstellung nach dem Beenden des Prozesses durch das Betriebssystem.

## Sitzungszugangsdaten beziehen

Erstellen Sie auf Ihrem Backend mit dem geheimen Stripe-Schlüssel eine VerificationSession. Erstellen Sie anschließend einen temporären Schlüssel für diese Sitzung und geben Sie ausschließlich für den Client sichere Felder zurück.

Der offizielle Demo-Server (`POST /identify`) erstellt eine VerificationSession vom Typ `document`, erstellt einen temporären Schlüssel mit `{ verification_session: session.id }` und der Stripe-API-Version `2022-11-15` und antwortet mit:

| Antwortfeld         | Quelle                              | Plugin-Option von `create` |
| ---------------------- | ----------------------------------- | ---------------------- |
| `verificationId`      | `VerificationSession.id`            | `verificationId`       |
| `ephemeralKeySecret`   | `EphemeralKey.secret`               | `ephemeralKeySecret`   |
| `clientSecret`         | `VerificationSession.client_secret` | `clientSecret`         |

```ts
const session = await stripe.identity.verificationSessions.create({
  type: 'document',
});
const ephemeralKey = await stripe.ephemeralKeys.create(
  { verification_session: session.id },
  { apiVersion: '2022-11-15' },
);

return {
  verificationId: session.id,
  ephemeralKeySecret: ephemeralKey.secret,
  clientSecret: session.client_secret,
};
```

Bewahren Sie den geheimen Stripe-Schlüssel auf dem Server auf. Die Capacitor-Anwendung sollte ausschließlich den veröffentlichbaren Schlüssel für Web-`initialize` sowie `verificationId`, `ephemeralKeySecret` und `clientSecret` erhalten. Liefern Sie `STRIPE_SECRET_KEY` niemals im Client, in der nativen Binärdatei oder im Frontend-Bundle aus.

`Completed` auf dem Gerät bedeutet, dass der Nutzer seine Dokumente fertig hochgeladen hat. Die VerificationSession wechselt anschließend in die Verarbeitung. Bestätigen Sie das offizielle Ergebnis auf dem Server über Identity-Webhooks wie `identity.verification_session.verified`, `identity.verification_session.requires_input`, `identity.verification_session.processing`, `identity.verification_session.canceled` und `identity.verification_session.redacted`. Siehe [Verifizierungsergebnisse verarbeiten](https://docs.stripe.com/identity/handle-verification-outcomes).

## Die Web-Plattform initialisieren

`initialize` ist nur im Web erforderlich. Es lädt Stripe.js mit dem veröffentlichbaren Schlüssel. Natives `initialize` wird aufgelöst, ohne diesen Schlüssel zu verwenden.

!::initialize::

## Das Sheet erstellen und anzeigen

Übergeben Sie die Backend-Felder an `create` und rufen Sie anschließend `present()` auf.

- **iOS und Android** benötigen `verificationId` und `ephemeralKeySecret`. Fehlt einer der Werte, wird `create` zurückgewiesen und `FailedToLoad` erzeugt.
- **Web** verwendet ausschließlich `clientSecret`. Native Plattformen ignorieren `clientSecret`. Sie können es in nativen Builds weglassen; nehmen Sie es auf, wenn derselbe Code im Web läuft.
- Importieren Sie `CreateIdentityVerificationSheetOption` und `InitializeIdentityVerificationSheetOption` nicht aus `@capacitor-community/stripe-identity`. Diese Optionstypen werden aus dem Paketindex nicht erneut exportiert.

!::create::

!::CreateIdentityVerificationSheetOption::

!::present::

`present()` gibt `Promise<void>` zurück, nicht `IdentityVerificationResult`. Lesen Sie das Ergebnis aus dem Listener `VerificationResult`.

## FailedToLoad verarbeiten

`FailedToLoad` wird ausgelöst, wenn `create` das Sheet nicht erstellen kann. Das Promise von `create` wird ebenfalls mit demselben Text zurückgewiesen.

Native Plattformen erzeugen es, wenn `verificationId` oder `ephemeralKeySecret` fehlt: `Invalid Params. This method require verificationId or ephemeralKeySecret.` unter Android; iOS verwendet denselben Satz mit kleingeschriebenem `this`. iOS erzeugt es außerdem, wenn die Schlüssel des primären Anwendungssymbols in `Info.plist` fehlen.

Der Listener-Typ ist `StripeIdentityError`. iOS liefert `{ message }`. Android legt den Text derzeit als Zeichenfolge unter `error` ab. Verarbeiten Sie sowohl den Listener als auch das zurückgewiesene Promise von `create`.

Web-`create` erzeugt immer `Loaded` und validiert `clientSecret` nicht. Web-`present` löst `Stripe is not initialized.` oder `clientSecret is not set.` aus statt `FailedToLoad`.

!::StripeIdentityError::

## VerificationResult verarbeiten

`IdentityVerificationResult.result` ist `IdentityVerificationSheetResultInterface`: `Completed`, `Canceled` oder `Failed`.

| `result`    | Bedeutung                                                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `Completed` | Der Nutzer hat Dokumente übermittelt. Die Verifizierung wird noch verarbeitet; warten Sie auf Webhooks.                                                     |
| `Canceled`  | Der Nutzer hat das Sheet geschlossen. Ermöglichen Sie einen erneuten Versuch. Im Web entspricht dies `session_cancelled` von Stripe.js.                                   |
| `Failed`    | Der Ablauf ist fehlgeschlagen. Lesen Sie `error.message` und zeigen Sie es an. Native Plattformen senden den lokalisierten Fehlertext; das Web leitet den Stripe.js-Fehler weiter. |

`error` ist bei `Failed` vorhanden. Registrieren Sie weder `addListener(IdentityVerificationSheetEventsEnum.Completed)` noch `Canceled` oder `Failed`. Diese Enum-Member sind Ergebniswerte, keine unterstützten Listener-Namen.

!::IdentityVerificationResult::

!::IdentityVerificationSheetResultInterface::

## Fehler und Abbruch

Behandeln Sie Abbruch als Nutzeraktion, nicht als Absturz. Behalten Sie den Listener registriert und ermöglichen Sie einen weiteren Zyklus aus `create` und `present`.

Das Verhalten von `present()` unterscheidet sich je nach Plattform:

- **Android** löst auf, sobald das Sheet angezeigt ist. Ein späteres `VerificationResult`, das bis zur Verarbeitung im Speicher bleibt, meldet `Completed`, `Canceled` oder `Failed`. Ein beim Anzeigen ausgelöster Fehler weist das Promise zurück.
- **iOS** wartet bis zum Schließen des Sheets, meldet `VerificationResult` und löst anschließend `present()` auf.
- **Web** wartet auf `verifyIdentity`. Abbruch und Fehler melden `VerificationResult` und lösen auf. Fehlendes `initialize` oder `clientSecret` führt zur Zurückweisung.

Leiten Sie aus dem Auflösen von `present()` keinen Erfolg ab. Verzweigen Sie immer anhand von `verification.result`.

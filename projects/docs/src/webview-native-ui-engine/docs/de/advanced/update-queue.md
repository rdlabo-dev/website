---
title: "Aktualisierungen serialisieren und wiederherstellen"
sourceRevision: "04fa29373a7332571832d110c95c91ce905742829895c92dfdffcd1c43ac0a4b"
---
# Zustandsaktualisierungen serialisieren und verlorene Bestätigungen wiederherstellen

Verwenden Sie `createNativeUpdateQueue`, wenn ein Renderer DOM-Zustand asynchron liest und native Aktualisierungen sendet. Ereignisschübe sollten einen Lesevorgang des aktuellen Zustands erzeugen, und ein zweiter Lesevorgang darf den vorherigen Durchlauf nicht überlappen. Dieser Helfer ist optional: Er verändert weder native Registrierungen noch andere Projektions-APIs. Behalten Sie einen bestehenden Scheduler bei, wenn der Renderer einen anderen Takt oder eine andere Wiederherstellungsstrategie benötigt. Die Warteschlange bündelt Anfragen über `requestAnimationFrame`; während eines Durchlaufs eintreffende Anfragen lösen einen späteren Durchlauf aus.

Beispielsweise treffen eine Größenänderung, eine Auswahlaktualisierung und eine DOM-Mutation in einem Frame ein, während die vorherige native Aktualisierung noch auf Bestätigung wartet. Stellen Sie einen Durchlauf mit aktuellem Zustand in die Warteschlange, statt überlappende Lesevorgänge zu starten. Geht der Bridge eine Bestätigung verloren, gleichen Sie den aktuellen Zustand ab, bevor Sie Aktualisierungen fortsetzen; verwenden Sie diese Warteschlange niemals, um einen Kauf, Klick oder Anzeigenladevorgang zu wiederholen.

```ts
import { createNativeUpdateQueue } from '@webview-native-ui/engine';

const updates = createNativeUpdateQueue(window, {
  async update(send) {
    const state = await renderer.readCurrentState();
    const reply = await send(
      () => renderer.sendState(state),
      (reply) => {
        if (reply.revision !== state.revision) throw new Error('Revision mismatch');
      },
    );
    if (reply) renderer.accept(state, reply);
  },
  retry: () => renderer.invalidateLastAcceptedState(),
  failed: (error) => renderer.stopAndRestoreFallback(error),
  reconnect: true,
});

// Aus bestehenden Layout-/Inhaltsbenachrichtigungen:
updates.request();
// Nachdem die bestehende Verbindungsprüfung native Sitzung/Revision abgeglichen hat:
updates.reconnected();
// Beim Abbau des Renderers:
updates.destroy();
```

`renderer` steht für den bestehenden Code der Integration. `send` dient ausschließlich ersetzbarem Zustand und wird innerhalb eines Aktualisierungsdurchlaufs sequenziell aufgerufen, niemals für Klicks, Auswahlaktionen, Käufe oder SDK-Anfragen. Ein fehlgeschlagenes Senden überspringt die restlichen Sendevorgänge dieses Durchlaufs und fordert einen neuen Durchlauf an, keine Wiederholung seiner Payload. Scheitert auch dieser, wartet `reconnect: true` auf einen externen Handshake; ohne diese Option meldet die Warteschlange einen endgültigen Fehler. Eine ungültige Bestätigung wartet sofort auf Abgleich. Nach dem Abgleich ist ein weiterer fehlgeschlagener Versuch oder eine ungültige Bestätigung endgültig; ein vollständig erfolgreicher Aktualisierungsdurchlauf setzt das Wiederherstellungsbudget zurück. Die Warteschlange installiert weder Verbindungs-Polling noch Abonnements.

Belassen Sie Operationszeitlimits im Transport. Ein Timeout bricht den zugrunde liegenden nativen Aufruf nicht ab: Der native Renderer muss veraltete Revisionen ablehnen, und die Verbindungsprüfung muss vor einer Wiederherstellungsmeldung den aktuellen Zustand abgleichen. Die Freigabe unterdrückt späte Sendeergebnisse und künftige Durchläufe; sie kann eine bereits gesendete native Operation nicht rückgängig machen. Verwenden Sie `dirty`, um überholte DOM-Messungen abzulehnen, `running`, um Verbindungsabgleich während eines Durchlaufs aufzuschieben, und `waiting`, um eine ausstehende Wiederherstellung zu erkennen. Revisionsvergabe, akzeptierte Geometrie und Fallback-Strategie bleiben beim Renderer.

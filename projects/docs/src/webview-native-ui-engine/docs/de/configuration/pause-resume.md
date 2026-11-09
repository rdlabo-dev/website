---
title: "Pause und Fortsetzung bei benutzerdefinierten Overlays"
sourceRevision: "6bc991883033a91a4b656683f020629a717ca2d9bec6de1070bbe4acdef407f6"
---
# Native UI mit einem benutzerdefinierten Web-Overlay überdecken

Verwenden Sie `pause()`, bevor Sie ein benutzerdefiniertes Modal oder ein `div` über nativer UI darstellen, und `resume()` beim Schließen. Verwenden Sie für Ionic-Overlays die automatische [Ionic-Integration](ionic-overlays.md). Sie nutzt dieselbe Koordination, überdeckt aber nur Oberflächen hinter dem Overlay.

## Plugin-Entwickler: Engine-Funktionen erneut exportieren

```ts
export { pause, resume } from '@webview-native-ui/engine';
```

Die Funktionen teilen sich einen Pausezähler über Engine-fähige Plugins und Bundles im selben Dokument hinweg. Ein Wrapper oder eine native Plugin-Methode ist nicht erforderlich.

## Anwendungsentwickler: Jede Pause mit einer Fortsetzung paaren

```ts
import { pause, resume } from 'your-plugin';

pause();
try {
  await showCustomModal();
} finally {
  resume();
}
```

`showCustomModal()` muss beim Schließen des Modals aufgelöst werden. Rufen Sie bei ereignisgesteuerten Modals `resume()` beim Schließen, Abbrechen oder bei einem Fehler auf. Verwenden Sie auch bei mehreren Plugins ein Paar pro Overlay; verschachtelte Overlays benötigen jeweils ein eigenes Paar.

Eine Pause ersetzt sichtbare native Oberflächen durch vorbereitete Web-Bilder oder ihren gewöhnlichen Web-Fallback. Ausgeblendete Oberflächen bleiben ausgeblendet. Das letzte `resume()` hebt die Anforderung auf und bewahrt dabei die Darstellungsabsicht jedes Plugins sowie die verbleibende Ionic-Overlay-Abdeckung.

Der Zähler verfolgt keine Aufrufer und ordnet einzelne Aufrufe nicht einander zu. Ein zusätzliches `resume()` während einer Pause kann die Anforderung eines anderen Overlays aufheben; nur ein `resume()` bei Zählerstand null bleibt wirkungslos. Jeder Besitzer muss jede angeforderte Pause genau einmal freigeben.

Beide Funktionen kehren sofort zurück, ohne native Bestätigungen oder das Zeichnen abzuwarten. Die Rückkehr von `pause()` bedeutet nicht, dass die native UI bereits hinter das Web-Overlay gewechselt ist; sie kann bis zum Abschluss der Übergabe im Vordergrund bleiben. Das letzte `resume()` verschiebt die native Wiederherstellung bis zum zweiten Animationsframe, damit das Entfernen des Overlays gezeichnet werden kann, ohne den Abschluss der Compositor-Arbeit zu garantieren. Rufen Sie es nach dem Entfernen des Overlays oder dem Abschluss seiner Schließanimation auf. Ein neues `pause()` bricht eine ausstehende Wiederherstellung ab. `pause()` unmittelbar vor einem blockierenden `window.alert()` aufzurufen, garantiert daher keine abgeschlossene Übergabe. Die Funktionen erkennen benutzerdefinierte Overlays nicht automatisch.

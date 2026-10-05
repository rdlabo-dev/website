---
title: "Native UI Shell (Vorschau)"
sourceRevision: "32aae8c2b668ab41cc77be12bcaa2e37ee23417ddc60830bffb6cc76d82c6fb2"
---
# Native UI Shell (Vorschau)

Die Native UI Shell ist in `1.2.0` als **Vorschau** verfügbar. Ihre API und die unterstützten Bedienelemente können sich bis zur stabilen Version ändern. Der stabile Status ist nach der offiziellen Veröffentlichung von Xcode 27.1 geplant.

Die Native UI Shell ergänzt eine Ionic-Anwendung um native Navigations- und Aktionsbedienelemente rund um ihren Web-Inhalt. Das optionale Capacitor-iOS-Plugin rendert unterstützte fest positionierte Ionic-Bedienelemente mit UIKit oder SwiftUI und dem Liquid-Glass-Material des Systems. Seiteninhalt, Scrollen, Anwendungszustand und Routing bleiben in der Ionic-WebView.

## Hintergrund

Basecamp beschrieb diesen hybriden Ansatz in [Hybrid sweet spot: Native navigation, web content](https://signalvnoise.com/posts/3743-hybrid-sweet-spot-native-navigation-web-content) vom 8. Mai 2014: Web-Inhalte bilden den Kern, native UI wird dort eingesetzt, wo sie die Bedienung verbessert. Die [Ankündigung von Capacitor 1.0.0 Alpha](https://ionic.io/blog/announcing-capacitor-1-0-0-alpha) vom 27. Februar 2018 enthielt ausdrücklich **Native UI Shell** in der Roadmap und verlinkte auf diesen Artikel. Die Verbindung nativer UI mit Web-Inhalten gehörte von Anfang an zur Ausrichtung von Capacitor.

Dieses Paket greift diese Idee für Ionic und Liquid Glass wieder auf. Bestehendes Ionic-Markup definiert die Shell: geeignete Werkzeugleisten-Bedienelemente, Tabs, fest positionierte FABs und durchsuchbare Tabs erhalten eine native Darstellung. UIKit übernimmt Aussehen und Interaktion; die Bridge synchronisiert den DOM-Zustand und leitet Aktionen an die ursprünglichen Ionic-Komponenten zurück. Ionic verwaltet weiterhin den Navigationsstapel, Seitenübergänge und die Anwendungslogik. Der Umfang der Shell beschränkt sich auf die unten beschriebenen unterstützten fest positionierten Bedienelemente.

## Die Shell aktivieren

Aktivieren Sie die Shell nach der Installation des im README beschriebenen Theme-CSS einmal beim Start der Anwendung:

```ts
import { enableNativeUIShell } from '@rdlabo/ionic-theme-ios27/native';

void enableNativeUIShell();
```

`enableNativeUIShell()` liest außerdem den effektiven Radius der linken oberen Ecke der WebView aus und wendet ihn auf Seitenübergänge an. Um ausschließlich den Übergang zu konfigurieren, ohne native Bedienelemente zu aktivieren, rufen Sie Folgendes auf:

```ts
import { configureNativeTransition } from '@rdlabo/ionic-theme-ios27/native';

await configureNativeTransition();
```

Behalten Sie die vorhandene Einstellung `navAnimation: iosTransitionAnimation` bei. Es sind keine Registrierung pro Seite, Komponentenliste, nativen Callbacks oder Swift-View-Controller erforderlich. Führen Sie nach der Installation oder Aktualisierung des Pakets `npx cap sync ios` aus. Das native Plugin verwendet Swift Package Manager (SPM). Führen Sie für eine bestehende CocoaPods-Anwendung `npx cap spm-migration-assistant` aus und verknüpfen Sie das erzeugte Paket `CapApp-SPM` in Xcode mit dem App-Target. Verwenden Sie Xcode ab 26 und Capacitor 8 für den Build; natives Glas benötigt iOS ab 26. Web, Android, SSR und ältere iOS-Versionen behalten die Web-Implementierung.

Diese Funktion muss ausdrücklich aktiviert werden. Der gewöhnliche Paketeinstiegspunkt importiert Capacitor nicht, und `@capacitor/core` ist eine optionale Peer-Abhängigkeit. Die nativen Quellen werden bei Capacitor Sync dennoch erkannt und gebaut, wenn das Paket in einem Capacitor-Projekt installiert ist, auch wenn die Anwendung `enableNativeUIShell()` nicht aufruft.

Die native Darstellung folgt dem angewendeten Theme-CSS für klassenbasierten, systemgesteuerten oder dauerhaft dunklen Modus. Änderungen des System-Themes werden synchronisiert, solange die Laufzeit aktiv ist.

## Unterstütztes Markup

Die folgende Tabelle beschreibt die gewöhnliche Native UI Shell. Für Vertical Bars gelten die separaten [Regeln für Werkzeugleistenaktionen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#toolbar-actions).

| Ionic-Komponente                               | Unterstütztes Aussehen und unterstützte Platzierung                                                                        | Native Darstellung                                                      |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `ion-button`                                  | `fill="default"`, Standardglas, in einer fest positionierten Header-/Footer-Werkzeugleiste                                        | Glas-`UIButton`                                                      |
| `ion-buttons`                                 | Fest positionierte Werkzeugleiste mit mindestens zwei direkten `ion-button`- / `ion-menu-button`-Kindern ohne Hintergrundfüllung, die sich die Glasfläche des Themes teilen | Eine `UIGlassEffect`-Fläche mit unabhängigen nativen Schaltflächen           |
| `ion-back-button`                             | Standardsymbol und Standardfarbe in einer fest positionierten Header-/Footer-Werkzeugleiste                                                  | Glas-`UIButton` mit der aufgelösten Ionic-Beschriftung bzw. dem aufgelösten Ionic-Symbol                 |
| `ion-menu-button`                             | Fest positionierte Werkzeugleiste innerhalb der Theme-Glasfläche von `ion-buttons`                                                       | Glas-`UIButton`; ursprüngliche Ionic-Menüumschaltung                          |
| `ion-tab-bar`                                 | Fest positionierte Tabs mit reinen Symbol- oder Textelementen, einem Symbol pro Element, Punkt-/Text-Badges sowie Auswahl- und Deaktivierungszustand  | `UITabBar` und `UITabBarItem`                                         |
| `ion-segment`                                 | Fest positionierte, nicht scrollbare Werkzeugleiste, Text **oder** ein Symbol pro Element                                              | `UISegmentedControl`                                                  |
| `ion-fab` / `ion-fab-button` / `ion-fab-list` | Glas-FAB in einem festen Slot von `ion-content`; eine Hauptschaltfläche und optionale gerichtete Listen                  | Dauerhafter Glas-`UIButton` für jede Schaltfläche; eine Synchronisierungsgruppe für das FAB |

Für die gewöhnliche Native UI Shell sind nur Komponenten im iOS-Modus mit installierten Theme-Variablen geeignet. Die ausdrücklich aktivierte Funktion Vertical Bars ist, wie unten beschrieben, modusunabhängig. `ios-theme-disabled` und das ältere `ios26-disabled` am Element oder an einem Vorfahren schließen es immer aus. Ist das Theme für ein einzelnes Tab- oder Segmentelement deaktiviert, bleibt dessen gesamte Gruppe im Web.

Verwenden Sie `data-shell="disabled"` oder die gleichwertige Klasse `ios-theme-shell-disabled`, um nur die iOS Native UI Shell zu deaktivieren und das Web-Theme beizubehalten. Dies schließt das Element und alle seine Nachfahren aus. Wird das Attribut oder die Klasse zur Laufzeit hinzugefügt oder entfernt, wird automatisch die Web-Darstellung wiederhergestellt beziehungsweise die Eignung für die native Darstellung erneut geprüft.

Nur der genaue Wert `disabled` deaktiviert die Funktion; ein leerer oder unbekannter Wert wird ignoriert. Entfernen Sie das Attribut, um die Projektion wieder zu aktivieren. Ist auch die Klasse vorhanden, müssen Sie beide entfernen. Dies deaktiviert keine Klicks und verändert das Web-Theme nicht. Das Datenattribut ist in `1.2.0` verfügbar.

```html
<ion-toolbar data-shell="disabled">
  <ion-button>Web glass button</ion-button>
</ion-toolbar>
```

Wenn ein Kind innerhalb einer gemeinsam genutzten nativen Fläche ausgeschlossen wird, bleibt die gesamte Fläche im Web. Dies gilt für Schaltflächengruppen, Tab-Leisten, Segmente und FAB-Listen. Der Ausschluss des Such-FABs oder eines Teils des Such-Footers deaktiviert die native Suchintegration. Die Tab-Leiste kann weiterhin nativ gerendert werden, sofern sie geeignet bleibt.

Eine geeignete Platzierung ist auch bei Glasdarstellung erforderlich. In der gewöhnlichen Native UI Shell benötigen Schaltflächen, Zurück-Schaltflächen, Menüschaltflächengruppen und Segmente eine Werkzeugleiste direkt innerhalb von `ion-header` oder `ion-footer`, ohne einen umgebenden `ion-content`-Vorfahren. Schaltflächen direkt in einem Header/Footer, eigenständige Werkzeugleisten sowie in scrollenden Inhalt verschachtelte Werkzeugleisten oder Header bleiben im Web. Auch FABs ohne `slot="fixed"` bleiben im Web. Wird ein projiziertes Bedienelement an eine ausgeschlossene Stelle verschoben, kehrt es zur Web-Darstellung zurück. Beim Zurückverschieben wird seine Eignung erneut geprüft. Ist `.ios-theme-vertical-bars` aktiviert, kann ein normales `ion-back-button` stattdessen von außerhalb einer fest positionierten Werkzeugleiste in den vertikalen Steuerbereich projiziert werden, auch aus geroutetem Inhalt oder einer dauerhaften Anwendungshülle. Die Anwendung entscheidet, wo dieser Modus aktiviert wird und welcher Ionic-Komponentenmodus verwendet wird. Die Projektion durch Vertical Bars benötigt keine `ios`-Modusklassen. Eingeklappte Header, ausgeschlossene Bedienelemente und verlassene Seiten werden ausgeschlossen. Vordergrund-Modals über die volle Breite können wie unten beschrieben an Vertical Bars teilnehmen; andere Overlay-Flächen behalten ihr eigenes Layout.

Native Tabs akzeptieren gleich breite Elemente mit dem Ionic-Standardlayout `layout="icon-top"`. Die native Leiste verwendet lokal eine kompakte horizontale und eine reguläre vertikale Größenklasse, um die übereinander angeordneten Symbole und Beschriftungen des Webs auf dem iPad und im Querformat zu erhalten. Die Größenklasse der Anwendung ändert sich dadurch nicht. Größe und Gewicht der Beschriftung folgen dem Web-Snapshot. Andere ausdrücklich gesetzte Ionic-Layouts (`icon-start`, `icon-end`, `icon-bottom`, `icon-hide`, `label-hide`) sowie ungleiche Elementbreiten belassen die gesamte Tab-Leiste im Web. Die Platzierung am Anfang, in der Mitte oder am Ende folgt der ursprünglichen `ion-tab-bar`, einschließlich RTL. Richtungsabhängige `ion-icon`-Grafiken behalten ihre gerenderte RTL-Spiegelung.

Außerhalb von Vertical Bars sind eigenständige Schaltflächen mit dem Füllmodus clear, solid oder outline ausgeschlossen. Eine Glasgruppe `ion-buttons` mit mindestens zwei Schaltflächen im Modus clear wird als eine Fläche projiziert; ihre Kinder behalten getrennte Aktionen. Menüschaltflächen können diese Gruppe ebenfalls nutzen. Eine einzelne Menüschaltfläche verwendet ihre übergeordnete `ion-buttons` als Glasfläche, sodass unter der nativen Schaltfläche kein Web-Glas verbleibt. Eine Menüschaltfläche außerhalb dieser Theme-Glasfläche bleibt im Web. Gemischte Füllungen, nicht unterstützte Kinder oder ein Kind mit deaktiviertem Theme belassen die Gruppe im Web. Einzelne Schaltflächen im Modus clear bleiben im Web. Benutzerdefinierte Schaltflächenfarben, eigene Zurück-Symbole/-Farben, einklappbare Header, Werkzeugleisten innerhalb scrollenden Inhalts, Modal-Inhalte, scrollbare/expandierte Segmente und die Integration mit Segment-Views bleiben im Web. Komplexe Slots und nicht unterstützte SVG-Funktionen greifen ebenfalls auf die Web-Darstellung zurück. Das Plugin übersetzt beliebiges Anwendungs-CSS nicht in UIKit-Styles.

Natives Glas nimmt den tatsächlich dahinter gezeichneten Web-Inhalt als Grundlage. Bestehende Werkzeugleistenhintergründe und Header-Unschärfe beeinflussen diesen Inhalt weiterhin. Damit Inhalt unter einem Header scrollt, verwenden Sie das normale Ionic-Layout mit durchscheinendem Header und Vollbildinhalt. Das Plugin verschiebt Seiteninhalt nicht und überschreibt keinen von der Anwendung festgelegten undurchsichtigen Werkzeugleistenhintergrund.

Solange eine Web-Eingabe die Bildschirmtastatur verwendet, kehren gewöhnliche Bedienelemente zur Web-Darstellung zurück. Beim Schließen werden sie erneut geprüft. Dies gilt auch für iPad-Layouts, in denen die Tastatur den visuellen Viewport nicht verschiebt. Ein natives Suchfeld behält seine eigene native Tastatur und Suchfläche.

Wenn ein vorhandenes Bedienelement nicht mehr unterstützt wird, wird seine Web-Quelle gezeichnet, bevor die native Abdeckung entfernt wird. Dies vermeidet eine leere Übergabe. Web-/UIKit-Aktualisierungen sind jedoch nicht atomar und können sich kurz überlappen. Dieses Verhalten an der Grenze unterscheidet sich von gewöhnlicher Seitennavigation, bei der unveränderte gemeinsam genutzte native Tabs erhalten bleiben.

## Zustand und Ereignisse

Menüschaltflächen verwenden das aufgelöste Standardsymbol oder konfigurierte Symbol von Ionic beziehungsweise ein unterstütztes Slot-Symbol oder eine Slot-Beschriftung. Die native Aktivierung klickt auf das ursprüngliche `ion-menu-button` und erhält die Zielauswahl über `menu`. Nicht standardmäßige Menüschaltflächentypen (`submit` / `reset`) bleiben im Web. `disabled`, `autoHide`, Menüverfügbarkeit und Sichtbarkeit der geteilten Ansicht folgen dem tatsächlichen DOM. Das Öffnen eines Menüs stellt Web-Bedienelemente wieder her und entfernt deren native Abdeckungen. Beim Schließen werden geeignete Bedienelemente erneut projiziert.

Das DOM bestimmt Beschriftungen, SVG-Inhalt, Platzierung, ausgewählte Werte und Anwendungsverhalten. Die Platzierungsreferenz ist `ion-tab-bar` selbst. Der native Tab-Inhalt verwendet dessen Rechteck als Größenvorgabe und Platzierungsanker und berücksichtigt dabei den größeren äußeren Rahmen der UITabBar: `tab-bar-position-start`, `tab-bar-position-center` und `tab-bar-position-end` steuern den horizontalen Anker einschließlich RTL. `slot="bottom"` erhält die untere und `slot="top"` die obere Kante. Klassenänderungen werden automatisch abgeglichen. UIKit bestimmt innere Abstände und die Größe der umschließenden Fläche; das unterstützte gestapelte Layout und die Beschriftungstypografie folgen dem Web. UIKit kann die Inhaltsbreite auch bei ausfüllender Positionierung begrenzen. Bei Viewports ab 768px Breite begrenzt das Web-Theme normale Leisten mit zwei, drei, vier oder fünf Elementen ungefähr auf die Maße gestapelter iPad-Flächen (188, 274, 336 und 414pt). Kleinere Viewports behalten die Smartphone-Größen. Die Standardleiste ist 62pt hoch, mit einer 54pt hohen Auswahl und 4pt Innenabstand. Benachbarte Schaltflächen überlappen wie UIKit-Bedienelemente. Die Ausrichtung von Symbolen und Beschriftungen wird anhand von Simulator-Screenshots geprüft. Dies sind Zielwerte der Standarddarstellung, keine Garantie für eigene Schriftarten, Symbole oder Beschriftungen; UIKit bestimmt weiterhin seine intrinsische Breite. Eine abweichende native Breite oder Höhe verhindert die Projektion nicht. Badge- und Titelaktualisierungen erhalten die Identität nativer Elemente und vermessen die Fläche am selben Platzierungsanker neu. Das Plugin streckt keine Symbole und verändert keine internen UIKit-Bedienelemente, um CSS-Elementbreiten zu erzwingen. Es vermisst den View-Unterbaum mit den nativen Tab-Bedienelementen ohne private Klassennamen oder feste Korrekturen des Innenabstands. Bei einem unbekannten Layout wird die Web-Darstellung wiederhergestellt. Die Laufzeit überwacht Strukturänderungen, betroffene Shadow Roots, Größenänderungen, Seitenlebenszyklusereignisse und Overlays. `display: none`, `hidden`, Theme-Klassen, das Entfernen von Komponenten und Änderungen am Deaktivierungszustand werden automatisch abgeglichen. Native Touch-Ereignisse werden vor dem Klicken auf das ursprüngliche Ionic-Element gegen das aktuelle DOM und die Revision geprüft.

Behalten Sie bei Formularen `ion-button type="submit"` und den vorhandenen Submit-Handler des Formulars bei. Ein externes Formular wird weiterhin als `[form]="formRef"` übergeben. Das Plugin ruft `form.submit()` nicht auf, ergänzt keinen zweiten Absendeweg und verändert nicht die Zuständigkeit für Angular-Formulare. Segmentwerte behalten ihren ursprünglichen Typ, da das ursprüngliche `ion-segment-button` angeklickt wird. Programmatische Wertänderungen erzeugen kein künstliches `ionChange`.

Beschriftungen verwenden nativen Text. Lokale statische SVGs und aufgelöste `ion-icon`-SVGs einschließlich `name` und Änderungen an `name` werden mit der Bildschirmauflösung rasterisiert und zwischengespeichert. Die quellengetreue Projektion erhält ihre Farben; die Systemprojektion vertikaler Werkzeugleisten-Schaltflächen verwendet von SwiftUI eingefärbte Vorlagensymbole. Tab-SVGs, die der Textfarbe folgen, verwenden natives Template-Rendering. Dadurch wechseln Symbole und Beschriftungen ihre Auswahlfarbe gemeinsam, ohne auf ein weiteres Bridge-Bild zu warten. Mehrfarbige Tab-Grafiken behalten ihre ursprünglichen Farben. Externe Referenzen, `<use>`, Animationen, eingebettetes HTML/Bilder, SVG-Text und Stylesheets sind ausgeschlossen. Web-Schriftarten und beliebige Slot-Layouts werden nicht exakt nachgebildet.

Der native Host nimmt Eingaben nur innerhalb nativer Bedienelemente entgegen. Tab-Interaktion und Barrierefreiheit werden durch das normale [UITabBar](https://developer.apple.com/documentation/uikit/uitabbar)-Bedienelement bereitgestellt. Leere Bereiche leiten Berührungen an die WebView weiter. Ionic iOS blendet leere Badges standardmäßig aus. Ein leeres sichtbares `ion-badge` wird zu einem nativen Benachrichtigungspunkt; ein nicht leeres Badge zeigt seinen Text an. Hintergrund- und Textfarben von Badges stammen aus den berechneten DOM-Styles einschließlich der Ionic-`color`-Paletten. Ausgeblendete oder entfernte Badges entfernen das native Badge. Tabs verwenden das Standard-Tab-Bedienelement von UIKit für Auswahl, Touch-Verhalten, Badges und Barrierefreiheit und erhalten die Elementidentität bei Auswahlaktualisierungen. UIKit bestimmt das Elementlayout innerhalb der vermessenen Leiste; beliebige CSS-Elementplatzierung wird daher nicht nachgebildet. Native Bedienelemente stellen Namen, Deaktivierungs-/Auswahlmerkmale und Badges für die Barrierefreiheit bereit. Während der Projektion wird die Quelle vor der Web-Barrierefreiheit verborgen. Dies garantiert keine identische VoiceOver-Reihenfolge zwischen Web und UIKit.

## Durchsuchbare Tabs

Vorhandene Registrierungen mit `attachTabBarSearchable(tabBar, fabButton, footer)` verwenden automatisch native Suche, wenn ihre untere Tab-Leiste und die Glas-Suchbedienelemente unterstützt werden. Es sind keine neue Komponentenoption, Route, native Einrichtung oder Seiten-Listener erforderlich. Gewöhnliche Tab-Leisten verwenden weiterhin `UITabBar`; horizontale durchsuchbare Gruppen verwenden einen dauerhaften `UITabBarController`, `UITab` / `UISearchTab` und `UISearchController`. Die ursprüngliche Capacitor-WebView rendert weiterhin Ergebnisse und verarbeitet die Navigation.

Bei Vertical Bars erhält die native Leiste sämtliche Tabs und ihre Auswahl. SwiftUIs `searchable` und `searchToolbarBehavior(.minimize)` stellen System-Suchschaltfläche, Suchfeld, Schließbedienelement und Übergänge innerhalb derselben nativen Navigationsfläche bereit. Apple bestimmt ihre Platzierung für das aktuelle Gerätelayout und fokussiert das native Feld beim Öffnen der Systemsuche. Eingabe-, Fokus-, Löschen- und Absendeereignisse verwenden dieselbe Bridge wie die horizontale Suche. Sobald Vertical Bars aktiviert ist, platziert die Web-Projektion die registrierte Suchschaltfläche über den sichtbaren vertikalen Tabs oder am unteren Leistenende, wenn die Tabs ausgeblendet sind, und leitet die Aktivierung an das ursprüngliche FAB weiter. Native Suche ersetzt diese Web-Projektion, sobald sie verfügbar ist. Auch die Web-Suchdarstellung erhält die vertikalen Tabs.

Die Suchregistrierung umgeht keine Platzierungsbeschränkungen. Ihre Suchleiste und Schließen-Schaltfläche müssen in fest positionierten Footer-Werkzeugleisten liegen. Ihr Auslöser muss zu einem `ion-fab[slot="fixed"]` direkt innerhalb von `ion-content` oder direkt zum vorhandenen nicht scrollenden `.ion-page`-Layout gehören. Ein Wrapper innerhalb scrollenden Inhalts ist kein fester Slot.

Bei horizontalen Tabs behält Native UI Shell den durchsuchbaren Controller bei, solange eine Registrierung aktiv ist, auch während eines Seitenübergangs oder bei vorübergehender Nichtverfügbarkeit (`available: false`). Derselbe Controller verwaltet die Tabs im Ruhezustand und die aktive Suche. Im Ruhezustand wird seine Ansicht an die ursprüngliche `ion-tab-bar` angepasst, um die ursprüngliche Breite der gewöhnlichen Tab-Fläche beizubehalten. UIKit kann die Breite bei kleinen Tab-Gruppen begrenzen. UIKit verwaltet die Platzierung der Suchschaltfläche neben den Tabs. Registrieren Sie die Suche, bevor die Zielseite vollständig eingeblendet ist (zum Beispiel in `ionViewWillEnter`), damit beim ersten Aufruf nicht erst gewöhnliche Tabs gezeichnet und dann ausgetauscht werden.

Beim Öffnen der Suche bleibt der ausgewählte Ionic-Tab erhalten und die Tastatur wird nicht automatisch angezeigt (`automaticallyActivatesSearch` bleibt deaktiviert). Tippen Sie auf das Feld oder rufen Sie `ion-searchbar.setFocus()` auf, um die Tastatur anzuzeigen. Während der Suche friert Native UI Shell die Projektion des Web-Layouts ein und hält die Größenanpassung von Capacitor Keyboard auf `none`; UIKit verwaltet die Tab- und Suchoberfläche, ohne während der Sitzung die Rahmen anzupassen. Beim Schließen der Suche kehren die gewöhnlichen Tabs an ihre ursprüngliche Position zurück. Gewöhnliche native Tabs behalten eine optimistische Auswahl bei, bis der Web-Zustand `selected` nachgezogen hat. Eingabeereignisse und Aktualisierungen von `value` durch die Anwendung werden bis zum Schließen der Suche weiterhin über die Bridge übertragen. Das aufgelöste SVG des Auslösers, seine Beschriftung für die Barrierefreiheit und das Suchsymbol werden aus Ionic projiziert, einschließlich `ion-icon name`.

Native Bearbeitungen laufen über die Ionic-Eingabehandler und erhalten die Entprellung von `ionInput` sowie `ionChange`, `ionFocus`, `ionBlur` und `ionClear`. Programmatische `value`-Änderungen erzeugen kein `ionInput`; synchrone Anwendungskorrekturen werden von veralteten nativen Eingaben unterschieden. Die native Bearbeitung verwaltet markierten Text und den Cursor. Die Rückkehr über die Schließen-Aktion des Footers erhält den Wert und erzeugt weder `ionCancel` noch `ionClear`.

Die erste unterstützte Suchkonfiguration verwendet Glas-Suchleisten im iOS-Modus mit der Standard-Suchtastatur, dem Standard-Löschbedienelement, ohne interne Abbrechen-Schaltfläche und mit den Standardeinstellungen für Autokorrektur und Großschreibung. Benutzerdefinierte Eingabemodi, Hinweise für die Eingabetaste, minimale/maximale Länge, Autovervollständigung, Autokorrektur, Rechtschreibprüfung, Löschsymbole und klassische Suchleisten bleiben im Web. `disabled`, `placeholder`, `value` und `setFocus()` werden für unterstützte Gruppen synchronisiert. Allgemeine eigenständige Suchleisten gehören nicht zu dieser Funktion.

Das Verlassen einer Seite, Overlays, Theme-Ausschlüsse und der Verlust nativer Zuständigkeit schließen die native Darstellung und erhalten den zuletzt synchronisierten beziehungsweise von der Anwendung gesetzten Wert. Eine spätere Suche beginnt in diesem geschlossenen Zustand. Die Registrierung bleibt über Übergänge zwischengespeicherter Seiten hinweg erhalten; eine erneute Registrierung bei jeder Rückkehr ist nicht erforderlich. Wartezeiten der Bridge sind begrenzt. Verliert eine Öffnungsanforderung die Bridge, kann ihr ausstehender Eintritt über die vorhandene Web-Animation abgeschlossen werden. Eine getrennte Bridge kann native Zeichen, die nie an JavaScript geliefert wurden, nicht wiederherstellen.

Das Ersetzen der registrierten `ion-searchbar` oder ihres Eingabefelds beendet die alte Bearbeitungssitzung. Das neue Element behält seinen eigenen Anwendungswert und beginnt beim erneuten Öffnen eine neue native Sitzung.

Während die Native UI Shell aktiviert ist, unterdrückt sie den oberen Scroll-Randeffekt der WebView, da Ionic die Header-Kante bereits zeichnet. Dadurch wird ein zweiter dunkler Verlauf vermieden, wenn Betriebssystem- und Web-Themes voneinander abweichen. Beim Beenden wird die ursprüngliche Einstellung wiederhergestellt.

Der native Suchcontroller bleibt über seiner eigenen Tastatur sichtbar. Andere projizierte Bedienelemente werden ausgeblendet, wenn eine Web-Eingabe die Tastatur öffnet. Für Standardbedienelemente gelten die UIKit-eigene Barrierefreiheit und das Verhalten bei reduzierter Bewegung. Vollständige VoiceOver-Navigation ist keine geprüfte Garantie für Gleichwertigkeit.

## Übergänge und Wiederherstellung

FABs behalten `activated`, das `show` jedes Kindes, `close()` und die ursprünglichen Klickhandler von Ionic bei. Mehrere Listen, anfängliches Aufklappen, kleine Schaltflächen und `edge` verwenden das vermessene Layout jeder Schaltfläche. Die native Seite bildet die gestaffelte Sichtbarkeit von Ionic ab, ohne einen weiteren Timer oder eine eigene Öffnen-/Schließen-Steuerung hinzuzufügen. Änderungen am Hauptschaltflächensymbol werden mit dem aufgelösten `closeIcon` überblendet. Reduzierte Bewegung deaktiviert diese Überblendung. Native FAB-Schaltflächeninstanzen bleiben über Öffnen-/Schließen-Aktualisierungen hinweg bestehen. Das Quell-FAB bleibt während des normalen Öffnens und Schließens durchgehend projiziert.

Die FAB-Unterstützung umfasst das normale kreisförmige Glasdesign, Text und aufgelöste statische SVG-/`ion-icon`-Inhalte einschließlich RTL-Symbolspiegelung. Ein einziges nicht unterstütztes Kind belässt das gesamte FAB in der Web-Darstellung, auch wenn seine Liste geschlossen ist. Farbige gefüllte Schaltflächen, Submit-/Reset- oder href-FABs, eigene Host-Hintergründe/-Formen/-Bewegungen, Platzierung außerhalb eines festen Slots und nicht unterstützte Grafiken bleiben im Web. Beispielsweise behält die Demo-Seite `floating-action-button-fixed` mit rotem Hintergrund ihre bestehende Web-Darstellung. Ein FAB im festen Slot muss ein direktes Kind von `ion-content` sein; ein `slot="fixed"`-Attribut an einem Geschwisterelement der Seite ist kein Content-Slot.

Benutzerdefinierte Host-Animationen oder Transition-Deklarationen am FAB, an der Liste oder an einer Schaltfläche belassen die Gruppe im Web, bis sie entfernt werden. Schaltflächen-Transforms unterstützen die normale Identität und scale(0) für ausgeblendete Kinder, aber keine eigenen Skalierungen. Für Kinder innerhalb einer Liste mit `display:none` können Browser den berechneten Transform als `none` melden, obwohl ein eigener Transform deklariert ist. Solche Transforms werden geprüft, sobald Layoutinformationen verfügbar sind. Falls erforderlich kehrt dann das gesamte FAB ins Web zurück. Das Plugin analysiert keine Anwendungs-Stylesheets und öffnet Listen nicht vorübergehend, um verborgenes Layout vorherzusagen.

Die integrierte `iosTransitionAnimation` wartet auf das Entfernen nativer Elemente, bevor sie die Web-Animation startet. Interaktiver Fortschritt sowie Abschluss oder Abbruch werden währenddessen in eine Warteschlange gestellt. Stationäre gemeinsam genutzte Tabs bleiben erhalten. Erstes Rendern und Übergänge ohne Animation-Builder werden von der Startlaufzeit und den Ionic-Lebenszyklusereignissen abgedeckt. Standard-Ionic- und benutzerdefinierte Navigations-Builder können dieselbe Integration über `withNativeUIShellTransition()` nutzen, das sowohl aus dem Paketwurzelpfad als auch aus `/vertical-bars` exportiert wird. Die Einrichtung beschreibt [Ihre Navigationsanimation verbinden](./iphone-duo-with-original-theme.md#3.-connect-your-navigation-animation).

Beim Tab-Wechsel entfällt die Web-/native Überblendung, damit ein auslaufender UIKit-Snapshot nicht über dem nächsten Tab stehen bleibt. Die Erkennung vergleicht die Router-URL mit dem noch ausgewählten Tab in `ionViewWillLeave` sowie mit den Vanilla-DOM-Ereignissen `ionTabsWillChange` / `ionTabsDidChange`. Beim Hinzufügen und Entfernen von Seiten im Stapel bleibt die normale 180ms-Übergabe erhalten.

Normale Ionic-Overlays unterbrechen die native Projektion bis zum Schließen. Nicht unterstützte Konfigurationen durchsuchbarer Tabs verwenden die vorhandene Web-Animation und teilen diese Zuständigkeit mit Web-Glasgesten. CSS-Bewegungen unterstützter umgebender Flächen führen ebenfalls vorübergehend zur Web-Darstellung.

Beim Entfernen nativer Elemente wird die Quelle wiederhergestellt und darf gezeichnet werden, bevor ihre native Abdeckung entfernt wird. Beim Übernehmen wird die Quelle erst nach einer erfolgreichen und aktuellen nativen Antwort ausgeblendet. Verzögerte Antworten werden für jedes Bedienelement erneut geprüft: Bereits geeignete Bedienelemente behalten ihre native Abdeckung, während Inhaltsaktualisierungen nachziehen. Nur entfernte oder ungeeignete Quellen kehren ins Web zurück; neu übernommene Quellen benötigen eine exakte Bestätigung. Gewöhnliche Seitenänderungen rufen nie die globale Löschoperation auf. UIKit-Tab-Instanzen und -Elemente bleiben erhalten; identische Rahmen und Auswahlen werden nicht erneut angewendet. Doppelte oder veraltete Aktivierungen werden verworfen. WebKit und UIKit rendern weiterhin getrennt. Die Implementierung vermeidet absichtlich leere Frames, bietet jedoch keine Garantie für atomare Komposition auf Betriebssystemebene. Prüfen Sie eigene Übergänge und Overlays vor der Einführung auf den von der Anwendung unterstützten Simulatoren. Unbekannte Overlay-Systeme fallen nicht unter den Vertrag der automatischen Integration.

Wenn eine Bridge-Aktualisierung fehlschlägt oder das Zeitlimit überschreitet, stoppt die Laufzeit und stellt die Web-Darstellung wieder her. Sie verbindet sich nicht automatisch erneut. `getStatus()` meldet `stopped` und den Grund. Für einen bewussten erneuten Versuch rufen Sie `destroy()` an diesem Handle und danach erneut `enableNativeUIShell()` auf.

Für Diagnosen oder das Beenden der Anwendung:

```ts
const shell = await enableNativeUIShell(); // Wiederholte Aufrufe teilen sich die Laufzeit
console.log(shell.getStatus()); // Zustand, Anzahl projizierter Steuerelemente, Anzahl Aktualisierungen, Fehlergrund
await shell.destroy(); // DOM wiederherstellen, native Steuerelemente entfernen und Listener/Cache freigeben
```

Die Projektion ist standardmäßig global aktiviert. Beschränken Sie sie auf ausgewählte Ionic-Komponenten, wenn Ihre Anwendung nur einen Teil der nativen Shell benötigt, oder deaktivieren Sie sie global unter Beibehaltung desselben Konfigurationswegs:

```ts
const shell = await enableNativeUIShell({
  enabled: true,
  controls: {
    tabs: true,
  },
});

// Entspricht einer deaktivierten Native UI Shell; alle Steuerelemente bleiben im Web.
const disabledShell = await enableNativeUIShell({ enabled: false });
```

Wenn `controls` fehlt, werden aus Gründen der Abwärtskompatibilität alle unterstützten Bedienelemente aktiviert. Ist `controls` vorhanden, sind nur Einträge mit `true` für die native Darstellung geeignet. Verfügbare Einträge sind `tabs`, `toolbar`, `segment` und `fab`.

Fordern Sie vor dem Anzeigen eines eigenen Modals oder Overlays, das die Native UI Shell nicht erkennen kann, eine Unterbrechung an. Sobald diese aufgelöst ist, sind projizierte Bedienelemente zur Web-Darstellung zurückgekehrt. Geben Sie die Unterbrechung nach dem Schließen immer wieder frei:

```ts
const suspension = await shell.suspend();

try {
  await modal.present();
  await modal.onDidDismiss();
} finally {
  await suspension.resume();
}
```

Unterbrechungen können verschachtelt werden, und `resume()` ist idempotent. Die native Projektion wird erst fortgesetzt, wenn sämtliche aktiven Unterbrechungen freigegeben sind. Dabei wird das aktuelle DOM anstelle eines veralteten Snapshots verwendet.

Natives Material und Aussehen der Bedienelemente folgen der laufenden iOS-Version. Ein iOS-26-Gerät erhält nicht allein durch die Installation dieses Themes das Erscheinungsbild von iOS 27.

## iPhone Duo unterstützen (Vorschau)

Die iPhone-Duo-Unterstützung einschließlich der eigenständigen Funktion Vertical Bars ohne Native UI Shell ist in `1.2.0` neben der Native UI Shell als **Vorschau** verfügbar. Ihre APIs und das unterstützte Verhalten können sich ändern.

Der eigenständige Einstiegspunkt für den vertikalen Steuerbereich (`@rdlabo/ionic-theme-ios27/vertical-bars`) und `dist/css/vertical-bars.css` funktionieren ohne Laden des iOS-27-Themes. Rufen Sie für diesen Anwendungsfall `enableVerticalControlArea()` auf; es projiziert ausschließlich Bedienelemente im vertikalen Bereich. Anwendungen, die bereits `enableNativeUIShell()` aufrufen, sollten diese einzelne Laufzeit beibehalten und nicht beide starten. Die gesamte Einrichtung einschließlich Scharnierstellung und geteilter Ansicht für Anwendungen, die diese Shell gar nicht verwenden, beschreibt [iPhone-Duo-Unterstützung](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo).

Die Funktion Vertical Bars verwendet eine SwiftUI-`TabView` und eine Werkzeugleiste in der Systemleiste. Ionic bleibt die Quelle für Beschriftungen, Symbole, Auswahl-/Deaktivierungszustand und Aktionen. Leistenlayout, native Rückfalloption und unterstützte Overlays finden Sie unter [Vertical Bars](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars).

Bei Vertical Bars benötigen `ion-button`-Aktionen in fest positionierten Werkzeugleisten ein `ion-icon` oder SVG mit `slot="icon-only"`. Alle Füllungen und Ionic-Farben sind geeignet; Absende-Schaltflächen folgen derselben Platzierungsregel. Fügen Sie `.ios-theme-horizontal-only` zu einer Schaltfläche oder ihrer Gruppe `ion-buttons` hinzu, um sie horizontal zu belassen. Platzierungs- und Ausschlussregeln finden Sie unter [Werkzeugleistenaktionen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#toolbar-actions).

**Aussehen nativer Schaltflächen:** In `1.2.0` verwenden native vertikale Schaltflächen standardmäßig `buttonProjection: 'system'`. Verwenden Sie `source`, um Ionic-Füllungen und -Farben zu projizieren, sowie `data-projection="source|system"` oder die gleichwertigen Klassen `ios-theme-projection-source` / `ios-theme-projection-system` für lokale Ausnahmen. Diese Einstellungen betreffen ausschließlich native vertikale `ion-button`- und `ion-menu-button`-Aktionen. Horizontale Bedienelemente und Web-Klone behalten ihr bisheriges Verhalten. Migration, Prioritäten und Füllungsregeln beschreibt [Das Aussehen von Schaltflächen wählen](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/vertical-bars#choose-button-appearance).

Die eigenständige Einrichtung unter Beibehaltung Ihres vorhandenen Themes beschreibt [iPhone Duo mit Ihrem bestehenden Theme](https://docs.rdlabo.dev/projects/ionic-theme-ios27/docs/iphone-duo-with-original-theme).

## API der Native UI Shell

Die folgende generierte Referenz dokumentiert das von `enableNativeUIShell()` zurückgegebene Handle. Die zugrunde liegende Capacitor-Bridge und ihr Protokoll für Bedienelement-Snapshots sind Implementierungsdetails.

<docgen-index>

* [`getStatus()`](#getstatus)
* [`suspend()`](#suspend)
* [`destroy()`](#destroy)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Die JSDoc-Kommentare in der Quelldatei aktualisieren und docgen erneut ausführen, um die folgende Dokumentation zu aktualisieren-->

### getStatus()

```typescript
getStatus() => NativeUIShellStatus
```

Gibt den aktuellen Projektionszustand von Web und nativer Darstellung zurück.

**Rückgabe:** <code><a href="#nativeuishellstatus">NativeUIShellStatus</a></code>

--------------------


### suspend()

```typescript
suspend() => Promise<NativeUIShellSuspension>
```

Stellt projizierte Bedienelemente im Web wieder her, bis die zurückgegebene Freigabe fortgesetzt wird.

**Rückgabe:** <code>Promise&lt;<a href="#nativeuishellsuspension">NativeUIShellSuspension</a>&gt;</code>

--------------------


### destroy()

```typescript
destroy() => Promise<void>
```

Stoppt die Synchronisierung, stellt Web-Bedienelemente wieder her und gibt native Ressourcen frei.

--------------------


### Interfaces


#### NativeUIShellStatus

| Eigenschaft            | Typ                                        |
| --------------- | ------------------------------------------- |
| **`state`**     | <code>'native' \| 'stopped' \| 'web'</code> |
| **`projected`** | <code>number</code>                         |
| **`updates`**   | <code>number</code>                         |
| **`reason`**    | <code>string</code>                         |


#### NativeUIShellSuspension

| Methode     | Signatur                    | Beschreibung                                                                                    |
| ---------- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| **resume** | () =&gt; Promise&lt;void&gt; | Gibt diese Unterbrechung frei. Die native Projektion wird fortgesetzt, nachdem alle aktiven Unterbrechungen freigegeben wurden. |

</docgen-api>

## Quellcodestruktur

Jedes TypeScript-Modul in [`src/native/components`](../src/native/components) deklariert sein Ionic-Tag und seinen DOM-Reader. `components/index.ts` kombiniert diese Exporte zu Selektoren für die Erkennung und zum Komponententyp. Gemeinsame DOM-Messungen, Elementdaten und SVG-Rendering liegen in `src/native/shared`. `runtime.ts` verwaltet Synchronisierung, Sichtbarkeitsübergaben und Lebenszyklusereignisse.

Unter iOS verwaltet [`Components`](../ios/Sources/IonicNativeUIShellPlugin/Components) das Erstellen und Aktualisieren von UIKit-Bedienelementen sowie Komponentennamen. `ShellButton` bündelt die native Schaltflächenimplementierung für gewöhnliche Schaltflächen, Zurück- und Menüschaltflächen. `Shared` verwaltet Host-View, typisierte Snapshots, Geometrie, Farben und Bild-Cache. Capacitor dekodiert jeden vollständigen Snapshot einmal mit `Decodable`. Renderer verwenden typisierte Modelle und vergleichen Inhalte mit `Equatable`. Ungültige Batches werden zurückgewiesen, bevor sichtbare Bedienelemente geändert werden. `IonicNativeUIShellPlugin.swift` koordiniert Capacitor-Aufrufe, Revisionen und die Lebensdauer nativer Views.

## Demo und Prüfung

Die Demo enthält eine Seite `native-ui-shell` zum Testen fest positionierter Bedienelemente. Bauen Sie die Bibliothek im Repository-Wurzelverzeichnis und führen Sie die Browsertests aus:

```sh
npm ci
npm run build
cd demo
npm ci
npx --no-install playwright install chromium
npx --no-install playwright test e2e/native-ui-shell.spec.ts e2e/native-ui-shell-edge.spec.ts
```

Verwenden Sie für native Interaktions- und Platzierungstests Xcode ab 26, XcodeGen und einen gestarteten Simulator mit iOS ab 26. Führen Sie im Repository-Wurzelverzeichnis `sh scripts/verify-native-ui-shell.sh SIMULATOR_UDID` aus. Dies erstellt außerdem eine unabhängige Swift-Package-Manager-Anwendung auf Basis des npm-Pakets. Führen Sie für die Integration durchsuchbarer Tabs `sh scripts/verify-native-search.sh SIMULATOR_UDID` aus, oder ergänzen Sie den Befehl um `edge`, um Randfälle bei Platzierung, Navigation und Tastatur zu prüfen. Die Skripte geben den Speicherort ihrer lokalen Testartefakte aus.

Suchcontroller behalten ihren von UIKit verwalteten Übergang bei und sind von der normalen Überblendung bei der Übernahme von Bedienelementen ausgeschlossen.

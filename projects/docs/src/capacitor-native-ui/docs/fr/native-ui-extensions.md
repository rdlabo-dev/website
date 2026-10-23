---
title: "Extensions Native UI locales à l’application (expérimentales)"
sourceRevision: "7a6090c65dcd1aafed1efcdfc7c2c38987b43ee2966696277f6f004cbc9e9b2f"
---
# Extensions Native UI locales à l’application (expérimentales)

> **Expérimental :** l’API d’extension, les interfaces d’enregistrement natives et leur comportement peuvent changer dans les versions futures. Cela concerne SwiftUI et Kotlin/Compose, ainsi que les placements `element` et `tab-accessory`.

Une extension projette votre interface Web existante dans une View SwiftUI sur iOS ou du contenu Jetpack Compose sur Android. Conservez les deux définitions dans l’application : aucun package npm, bibliothèque séparée ou plugin Capacitor supplémentaire n’est nécessaire. L’élément Web reste la source de vérité et l’interface de repli.

Les extensions utilisent le même [modèle de projection](../README.md#how-projection-works) que les contrôles intégrés. Définissez les données et actions DOM à exposer, puis fournissez leur présentation native.

## Avant de commencer

Partez d’une application Capacitor 8 existante et installez le plugin si nécessaire :

```sh
npm install @rdlabo/capacitor-native-ui @erkamyaman/capacitor-foldable
```

Choisissez la plateforme native à prendre en charge :

- **Android :** utilisez votre projet Capacitor Android et un appareil ou émulateur API 24+. Suivez l’étape 1, l’[enregistrement Kotlin/Compose](#2b-register-compose-content-on-android), puis les étapes 3 et 4. Aucun projet iOS, Xcode, Ionic ou package de thème n’est requis.
- **iOS :** utilisez votre projet Capacitor iOS, Xcode 26+ et un appareil ou simulateur iOS 26+. Suivez l’étape 1, l’[enregistrement SwiftUI](#2a-register-a-swiftui-view-on-ios), puis les étapes 3 et 4. Pour projeter aussi les contrôles standard, suivez la [configuration Ionic](setup.md) ou [HTML](framework-independent.md).
- **Les deux :** partagez le lecteur DOM de l’étape 1 et enregistrez du contenu natif sous le même nom sur chaque plateforme.

Les exemples TypeScript ci-dessous utilisent le point d’entrée Ionic. Sans Ionic, importez `defineNativeUI` et `enableNativeUI` depuis `@rdlabo/capacitor-native-ui/core`.

## 1. Définir un lecteur DOM

```ts
// src/native-ui/counter.ts
import { defineNativeUI } from '@rdlabo/capacitor-native-ui';

export const counter = defineNativeUI({
  name: 'app.counter',
  selector: '[data-counter]',
  read(element) {
    return {
      props: { count: Number(element.getAttribute('data-count') ?? 0) },
      actions: { increment: element.querySelector<HTMLButtonElement>('button') },
    };
  },
});
```

Par exemple, utilisez cette source Web. Son espace réservé accueille aussi le contenu natif et une erreur d’action :

```html
<div data-counter data-count="0" style="width: 280px; min-height: 128px">
  <p data-count-label>Count: 0</p>
  <button type="button">Increment</button>
</div>
```

Conservez le gestionnaire de clic de votre framework pour mettre à jour le compteur et `data-count`. En HTML simple, ceci suffit :

```ts
const source = document.querySelector<HTMLElement>('[data-counter]')!;
source.querySelector('button')!.addEventListener('click', () => {
  const count = Number(source.dataset.count ?? 0) + 1;
  source.dataset.count = String(count);
  source.querySelector('[data-count-label]')!.textContent = `Count: ${count}`;
});
```

Le shell observe les changements DOM et envoie les nouvelles props au contenu natif. L’état rendu dans les attributs ou le texte est observé automatiquement. Pour les propriétés ou états externes lus sans mutation DOM, appelez `shell.markForCheck()` après modification.

### Contrat du lecteur

| Partie | Exigence |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| Exécution | Synchrone et en lecture seule. |
| Repli Web | Retourner `null` lorsque la source doit rester Web. |
| `props` | Objet JSON contenant nombres finis, chaînes, booléens, null, tableaux et objets ; limité à 64K caractères. |
| Cibles d’action | La source ou ses descendants. Les cibles absentes, masquées ou désactivées ne peuvent pas être activées. |
| Nombre d’actions | Jusqu’à 30 par source. |

## 2a. Enregistrer une View SwiftUI sur iOS

Exécutez `npx cap sync ios` après installation du plugin, puis ajoutez un fichier Swift à la cible Xcode de l’application. Importez `NativeUIPlugin`, fourni par `@rdlabo/capacitor-native-ui`. Conservez votre intégration SPM ou CocoaPods.

```swift
import SwiftUI
import NativeUIPlugin

struct CounterProps: Decodable {
    let count: Int
}

struct CounterView: View {
    let props: CounterProps
    let actions: NativeUIActions
    @State private var error: String?

    var body: some View {
        HStack {
            Text("Count: \(props.count)")
            Button("Increment") {
                Task { @MainActor in
                    do {
                        try await actions.activate("increment")
                        error = nil
                    } catch {
                        self.error = "Action unavailable"
                    }
                }
            }
            .disabled(!actions.isAvailable("increment"))
            if let error { Text(error) }
        }
    }
}

@MainActor func registerAppNativeUI() throws {
    try NativeUI.register("app.counter") {
        (props: CounterProps, actions: NativeUIActions) in
        CounterView(props: props, actions: actions)
    }
}
```

Appelez `registerAppNativeUI()` une seule fois depuis `application(_:didFinishLaunchingWithOptions:)`, avant l’activation du shell par JavaScript. Gérez-y une erreur d’enregistrement ; les noms vides ou dupliqués sont rejetés. Le Swift est compilé dans l’application : ajouter ou modifier une View nécessite une recompilation iOS. L’enregistrement est une configuration synchrone, pas une commande du pont natif.

## 2b. Enregistrer du contenu Compose sur Android

Android prend en charge **uniquement les extensions d’élément**. Les contrôles Ionic et HTML standard restent Web, y compris les boutons explicites. Vertical Bars natif et `tab-accessory` sont propres à iOS ; Android peut combiner rail Web et extensions d’élément. Le même lecteur DOM, les props, les cibles d’action et `markForCheck()` fonctionnent sur les deux plateformes.

Exécutez `npx cap sync android` après installation. Utilisez Kotlin dans l’application Android. Dans le `build.gradle` racine, ajoutez les plugins de compilation Kotlin et Compose à `buildscript.dependencies`, avec la même version Kotlin que l’application (le plugin utilise `2.2.20` par défaut). Définissez `ext.kotlin_version = '2.2.20'` dans le `buildscript` racine si nécessaire :

```groovy
classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
classpath "org.jetbrains.kotlin:compose-compiler-gradle-plugin:$kotlin_version"
```

Dans `app/build.gradle`, appliquez `kotlin-android` et `org.jetbrains.kotlin.plugin.compose`, et activez `android { buildFeatures { compose true } }`. Native UI expose Compose UI et Foundation ; ajoutez vous-même Material si votre extension l’utilise.

Enregistrez une seule fois depuis `Application.onCreate()`, sur le thread principal, avant l’activation JavaScript du shell. Utilisez une sous-classe `Application` configurée par `android:name=".App"` sur `<application>` dans `AndroidManifest.xml` ; évitez l’enregistrement à chaque recréation d’Activity.

```kotlin
import android.app.Application
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import dev.rdlabo.capacitor.nativeui.NativeUI
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch

class App : Application() {
    override fun onCreate() {
        super.onCreate()
        NativeUI.register(
            name = "app.counter",
            decode = { json -> json.getInt("count") },
        ) { count, actions, context ->
            val scope = rememberCoroutineScope()
            var error by remember { mutableStateOf<String?>(null) }
            val enabled = actions.isAvailable("increment")
            val foreground = if (context.dark) Color.White else Color.Black
            val background = if (context.dark) Color(0xFF202020) else Color.White
            val textStyle = TextStyle(color = foreground)
            Column(Modifier.fillMaxSize().background(background).padding(8.dp)) {
                BasicText("Count: $count", style = textStyle)
                Box(
                    Modifier.fillMaxWidth().heightIn(min = 48.dp)
                        .alpha(if (enabled) 1f else 0.5f)
                        .clickable(enabled = enabled, role = Role.Button, onClickLabel = "Increment count") {
                            scope.launch {
                                try {
                                    actions.activate("increment")
                                    error = null
                                } catch (cancelled: CancellationException) {
                                    throw cancelled
                                } catch (unavailable: IllegalStateException) {
                                    error = "Action unavailable. Try again."
                                }
                            }
                        },
                    contentAlignment = Alignment.Center,
                ) { BasicText("Increment", style = textStyle) }
                BasicText(
                    error ?: "",
                    modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
                    style = textStyle,
                )
            }
        }
    }
}
```

Le shell dimensionne et positionne l’hôte Compose depuis le rectangle DOM source. `context.sourceFrame` contient des pixels CSS ; `sourceFrameInDp` contient des dp Compose, avec `dpPerCSSPixel` comme facteur de conversion. `sourceID` et `viewportWidth` décrivent la source et la fenêtre actuelles. `rtl` est aussi appliqué via `LocalLayoutDirection` ; utilisez `dark` pour choisir votre thème Compose. N’appliquez pas à nouveau `x` et `y` de la source dans le contenu.

Le callback `decode` s’exécute avant acceptation de la projection. S’il lève une exception, la source reste Web. Les noms vides ou dupliqués sont rejetés. Le contenu Compose gère son style et son accessibilité. Recompilez Android après toute modification Kotlin.

## 3. Activer avec des définitions locales

```ts
import { enableNativeUI } from '@rdlabo/capacitor-native-ui';
import { counter } from './native-ui/counter';

const shell = await enableNativeUI({ ionic: { auto: false }, extensions: [counter] });
```

Cet exemple active vos extensions sans projeter automatiquement les contrôles Ionic. Les sources explicites `data-native-ui` restent actives. Pour projeter aussi les contrôles Ionic standard sur iOS compatible, omettez `ionic: { auto: false }`. Les contrôles standard Android restent Web dans les deux cas.

Remplacez l’appel de démarrage existant par celui-ci ; ne démarrez pas un second shell. Raccordez-le à votre framework via les [exemples de cycle de vie de la racine](setup.md#place-startup-in-your-frameworks-app-root), en plaçant ces options dans l’appel partagé.

Conservez des objets d’extension stables entre les appels d’activation. Les modifier pendant l’exécution nécessite d’abord `await shell.destroy()`. Leurs noms doivent être uniques dans une activation. N’enregistrez pas de sélecteurs se chevauchant pour une source. Une extension possède son sous-arbre source ; les contrôles intégrés qu’il contient ne sont pas projetés séparément.

## 4. Compiler et essayer l’extension

Compilez les ressources Web, puis synchronisez et recompilez la plateforme configurée :

- **Android :** exécutez `npx cap sync android`, puis compilez et lancez depuis Android Studio. Le compteur doit s’afficher avec Compose.
- **iOS :** exécutez `npx cap sync ios`, puis compilez et lancez depuis Xcode. Sous iOS 26+, le compteur doit s’afficher avec SwiftUI.

Touchez Increment : le gestionnaire Web original doit mettre à jour `data-count` et le compteur natif doit suivre. Dans le navigateur, le compteur Web original doit encore fonctionner.

Pour connaître les raisons de repli d’une source, activez temporairement [`debug: true`](configuration.md#understand-why-a-source-stays-on-the-web). Si elle reste Web, vérifiez que l’enregistrement précède l’activation JavaScript et que noms et props concordent. Sur Android, vérifiez la déclaration de la sous-classe `Application` dans le manifeste ; sur iOS, l’appartenance du fichier Swift à la cible.

## Le contenu et le placement sont indépendants

| `placement` | Comportement |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Omis ou `'element'` | Héberge le contenu natif dans le cadre Web de l’élément source sur iOS 26+ ou Android API 24+. |
| `'tab-accessory'` | Attache la View à l’accessoire d’onglets SwiftUI système d’une barre projetée sur iOS 26.1+. |

Les extensions sont indépendantes de `controls` et `ionic.auto`, y compris avec `enableVerticalControlArea()`. L’application contrôle leur présentation : retournez `null` du lecteur pour laisser une source Web, puis appelez `markForCheck()` lorsque cette condition change. Les accessoires nécessitent toujours leur hôte d’onglets natif compatible.

### Prérequis des accessoires d’onglets

| Exigence | Configuration prise en charge |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| Emplacement source | À l’intérieur de son `ion-tabs` propriétaire ; le shell résout son `ion-tab-bar`. |
| Hôte natif | Hôte d’onglets SwiftUI Vertical Bars sur iOS 26.1+. |
| Nombre d’accessoires | Un seul accessoire par hôte. |
| Disposition de repli Web | Conservez une disposition Web équivalente, comme un pied de page fixe ; la source garde son espace lorsqu’elle est masquée. |

Les barres UIKit ordinaires, l’absence d’onglets natifs, iOS 26.0 ou des accessoires concurrents laissent la source Web. L’application ne transmet pas de références aux contrôleurs natifs et le shell ne simule pas un accessoire système par une superposition flottante.

## Lire la géométrie source et l’état de présentation

Le shell mesure automatiquement l’élément DOM source. Avec le placement `element` par défaut, il positionne et dimensionne l’hôte SwiftUI selon ce rectangle. Vous n’avez pas à transmettre de coordonnées dans `props` ni à positionner la vue native vous-même.

Utilisez la closure d’enregistrement à trois arguments pour recevoir ces informations :

```swift
try NativeUI.register("app.counter") {
    (props: CounterProps, actions: NativeUIActions, context: NativeUIContext) in
    CounterView(props: props, actions: actions)
        .padding(.horizontal, context.sourceFrame.width < 240 ? 4 : 12)
}
```

La closure existante `(props, actions)` reste prise en charge. Les deux formes utilisent les mêmes noms et vérifications de doublons.

| Propriété du contexte | Signification |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `sourceID` | Identité opaque de la source pendant sa durée de vie actuelle ; ce n’est pas le `id` HTML. |
| `sourceFrame` | `getBoundingClientRect()` du DOM en pixels CSS par rapport à la fenêtre Web, avec `x`, `y`, `width` et `height`. |
| `sourceFrameInWebView` | Rectangle source converti en points UIKit dans les coordonnées locales de la WebView ; pas en coordonnées écran. |
| `viewportWidth` | Largeur CSS de la fenêtre utilisée pour convertir les coordonnées de cet instantané. |
| `pointsPerCSSPixel` | Points UIKit par pixel CSS ; ce n’est pas la densité de pixels de l’appareil. |
| `placement` | `.element` ou `.tabAccessory`. |
| `colorScheme` | `.light` ou `.dark`, également appliqué à l’environnement SwiftUI. |
| `layoutDirection` | `.leftToRight` ou `.rightToLeft`, également appliqué à l’environnement SwiftUI. |

La closure reçoit un contexte actualisé lorsque le shell applique un nouvel instantané, notamment lors des déplacements, redimensionnements et changements d’apparence. Utilisez le contexte actuel au lieu de mémoriser sa géométrie dans `@State`. Les mises à jour traversent le pont Web/natif ; ce ne sont pas des mesures DOM synchrones depuis Swift.

Pour `tabAccessory`, `sourceFrame` décrit toujours l’élément DOM d’origine. Le système attribue la position et la taille réelles de l’accessoire. Utilisez `GeometryReader` dans votre View SwiftUI pour connaître l’espace local réel, quel que soit le placement :

```swift
GeometryReader { geometry in
    CounterView(props: props, actions: actions)
        .frame(width: geometry.size.width, height: geometry.size.height)
}
```

N’appliquez pas `sourceFrame.x` ou `y` comme décalage SwiftUI supplémentaire : le shell positionne déjà l’hôte pour `element`. Votre View organise son contenu à l’intérieur de cet hôte.

## Utiliser les capacités de projection partagées

| Capacité | Utilisation par une extension |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Position et taille | Placement automatique de l’hôte et `NativeUIContext` ; limites locales réelles via `GeometryReader`. |
| Mode sombre et RTL | `context` ou `@Environment(\.colorScheme)` et `@Environment(\.layoutDirection)` de SwiftUI. |
| Reduce Motion et accessibilité | Valeurs d’environnement SwiftUI comme `@Environment(\.accessibilityReduceMotion)` et modificateurs d’accessibilité natifs. Donnez des noms accessibles aux contrôles personnalisés. |
| État applicatif issu du DOM | Retournez des `props` JSON depuis `read(element)` ; les changements DOM déclenchent la synchronisation. Sans mutation DOM, appelez `shell.markForCheck()`. |
| Cibles d’action actives/visibles | `actions.availableNames` ou `actions.isAvailable("increment")` ; les cibles DOM indisponibles sont omises. |
| Invoquer l’action Web d’origine | `try await actions.activate("increment")` ; fin et échec suivent le contrat ci-dessous. |
| Repli Web temporaire et nettoyage | Gérés automatiquement pour le contenu incompatible, les superpositions, la suspension de navigation et la suppression de sources. |
| Suspension contrôlée par l’application | Utilisez `suspend()` sur le handle, `resume()` sur le jeton retourné, et `destroy()` depuis JavaScript. |

Par exemple, désactivez un bouton natif lorsque son action d’origine est indisponible :

```swift
Button("Increment") {
    Task { @MainActor in
        do { try await actions.activate("increment") }
        catch { /* Present an application-appropriate error. */ }
    }
}
.disabled(!actions.isAvailable("increment"))
```

La disponibilité est un instantané, pas une réservation : une cible peut disparaître avant l’activation ; gérez aussi les erreurs. Texte personnalisé, sélection, polices, couleurs et badges relèvent des `props` et de la View SwiftUI de votre extension ; le shell ne déduit pas la structure visuelle d’un composant personnalisé depuis le CSS. Lisez les styles calculés et attributs dans votre lecteur. Utilisez les API partagées de conversion d’images et de couleurs ci-dessous au lieu de les réimplémenter.

## Planifier une vérification de source

Les attributs, textes, enfants, tailles observées, défilements et événements de cycle de vie pris en charge déclenchent des vérifications automatiques. Le shell ne surveille pas périodiquement les variables JavaScript ou propriétés DOM arbitraires. Après un changement d’état utilisé par votre lecteur sans mutation DOM, demandez une vérification :

```ts
source.playbackPosition = newPosition; // Propriété définie par l’application et lue par votre extension.
shell.markForCheck();
```

`markForCheck(): void` planifie une relecture et une mesure géométrique ; elle ne met pas à jour le DOM applicatif et ne force pas de rendu natif. Les appels répétés sont regroupés, les instantanés inchangés ne sont pas envoyés. Un appel pendant une mise à jour du pont planifie une vérification ultérieure. La projection suspendue le reste jusqu’à sa reprise. Après `destroy()` ou sans runtime de projection, les appels ne font rien.

Appelez après validation des changements DOM pertinents par votre framework. Cette API ne déclenche ni détection Angular ni rendu React/Vue, et ce n’est pas une promesse attendant la fin native. Elle fonctionne aussi pour les contrôles standard dont les propriétés changent sans mutation observable.

## Réutiliser les conversions natives d’images et de couleurs

Le deuxième argument du lecteur expose la capture et la rastérisation SVG standard. Il accepte un `svg` local ou un `ion-icon` résolu appartenant à la source et retourne une **référence d’image opaque**, ou `null` si l’image n’est pas prise en charge. Retournez cette référence dans `props` ; n’essayez pas de lire les octets de façon synchrone :

```ts
const badge = defineNativeUI({
  name: 'app.badge',
  selector: '[data-badge]',
  read(element, context) {
    return {
      props: {
        icon: context.image(element.querySelector<HTMLElement>('ion-icon')),
        color: getComputedStyle(element).color,
      },
    };
  },
});
```

Avant envoi de l’instantané, le shell résout les références en `{ data, width, height, template }` : données PNG base64, dimensions CSS et mode de rendu. Les références imbriquées et copies sont prises en charge ; la clé `$nativeUIImage` est réservée aux références du contexte de lecture actuel. Passez `{ template: true }` comme second argument à `image()` pour que SwiftUI teinte l’icône ; par défaut, les couleurs source sont conservées. Les restrictions SVG locales, la capture RTL, la rastérisation selon l’échelle d’affichage et le cache des contrôles standard s’appliquent. Les ressources externes et contenus SVG incompatibles retournent `null` ; un `ion-icon` non résolu doit conserver le repli Web jusqu’au chargement. Un échec de rastérisation ou des props trop volumineuses laissent l’extension Web.

Sur iOS, décodez le résultat avec `NativeUIImage` et utilisez les convertisseurs partagés :

```swift
struct BadgeProps: Decodable {
    let icon: NativeUIImage?
    let color: String
}

struct BadgeView: View {
    let props: BadgeProps
    var body: some View {
        if let icon = props.icon, let image = NativeUIRendering.image(icon) {
            Image(uiImage: image)
                .foregroundStyle(Color(uiColor: NativeUIRendering.color(props.color)))
        }
    }
}
```

`NativeUIRendering.image` retourne `nil` pour des données invalides. `NativeUIRendering.color` accepte les valeurs calculées `rgb()`/`rgba()` ; les formats incompatibles utilisent `.label` ou la couleur `fallback:` fournie. Les deux sont partagés avec les moteurs standard. Ils n’évaluent ni sélecteurs, ni variables CSS, ni noms de couleurs, ni feuilles de style arbitraires.

## Cycle de vie et fin des actions

Le shell gère découverte, géométrie, synchronisation d’état, intégration des contrôleurs natifs, retrait pour superpositions, suspension et nettoyage. Les extensions n’implémentent pas de hooks d’attachement/détachement. Les sources Web sont masquées uniquement après acceptation native. Un moteur non enregistré, un décodage de props défaillant, un placement incompatible ou un lecteur en échec laisse l’instance Web. La politique existante des superpositions s’applique ; les extensions redeviennent Web lorsque des superpositions Web couvrent la page.

Le placement d’élément nécessite que la source tienne entièrement dans la fenêtre et les limites de découpage overflow de ses ancêtres, y compris les conteneurs de défilement shadow Ionic. Les sources partiellement découpées restent Web et redeviennent admissibles une fois entièrement visibles. Les accessoires d’onglets utilisent le placement de leur hôte système.

### Fin d’une action

| Événement | Résultat de `try await actions.activate(name)` |
| ------------------------------------------------------------------ | -------------------------------------------- |
| L’élément Web original reçoit le clic | Se termine. |
| Le gestionnaire lance une requête réseau, une navigation ou une modale | N’attend pas ce travail applicatif. |
| Action désactivée, supprimée ou périmée | Rejette. |
| Nettoyage, annulation de tâche native ou expiration du pont | Termine les appels en attente. |

L’accusé de réception du pont est une méthode Promise de Capacitor.

Le [lecteur de démonstration](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.2/demo/src/native-ui/counter.ts) et la [View SwiftUI de démonstration](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.2/demo/ios/App/App/NativeUICounter.swift) présentent les deux placements avec des fichiers locaux à l’application. Ouvrez la page Native UI de la démo pour comparer projection native et repli Web.

## Exemple : mini-lecteur

Le mini-lecteur de démonstration applique le même modèle aux métadonnées de piste et actions de lecture : un [lecteur DOM et repli Web](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.2/demo/src/native-ui/mini-player.ts) associé à une [View SwiftUI locale](https://github.com/rdlabo-dev/ionic-theme-ios27/blob/ios27-v2.0.2/demo/ios/App/App/NativeMiniPlayer.swift). L’application Web gère l’état de lecture et la modale ; les actions natives `open` et `toggle` activent ses boutons d’origine. C’est un exemple d’interface, pas un moteur audio. Adaptez ces fichiers après la configuration des extensions ci-dessus.

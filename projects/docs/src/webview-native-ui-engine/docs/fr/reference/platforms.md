---
title: "Limites de capture et des plateformes"
sourceRevision: "51bea8d4a3b4cd13ce718f6c9cb171dee5bfa9af6be8d0c033e488854847b6da"
---
# Limites de capture et des plateformes

Choisissez les paramètres de capture et de repli en fonction de la surface native réelle. Commencez par le [contrat de projection](projection.md) et le [guide de configuration](../configuration/README.md) ; cette référence décrit les comportements et limites des plateformes, pas des étapes de configuration supplémentaires.

Une carte opaque dans un flux et un contrôle de lecteur translucide nécessitent des choix de capture différents. Dessiner uniquement la carte peut éviter de capturer le contenu voisin ; dessiner uniquement le contrôle translucide perd l’arrière-plan avec lequel il se mélange. Utilisez les cas ci-dessous pour choisir le comportement de capture, et conservez un repli Web pour le contenu non capturable. Ces choix préservent les pixels disponibles, pas la vidéo en direct ni tous les effets du compositeur de la plateforme.

## Modes de capture Android

Pour les vues SDK Android opaques pouvant être rendues par logiciel, utilisez `captureMode = NativeUIProjection.CaptureMode.VIEW` avec une politique explicite `failedFallback` (`WEB`, sauf si le consommateur maintient le placement natif). Cela dessine uniquement les pixels de la View sans marge périphérique, afin que le découpage d’une publicité partiellement visible n’incorpore pas de barre d’outils ou de contenu adjacent. Les vidéos, SurfaceView, vues translucides et contenus nécessitant la composition Window doivent conserver le mode `COMPOSITED` par défaut. Le consommateur doit fournir un hôte DOM correspondant et découpé pour la View opaque complète ; les masques de contour natifs arbitraires, les transformations et le découpage personnalisé ne sont pas reproduits.

Les pixels VIEW sont mis en cache selon l’identité de la View native, ses dimensions et la révision du contenu. Le défilement ordinaire conserve l’image Web décodée et actualise le placement sans capture, encodage PNG ni décodage d’image. L’image couvre la boîte de bordure de l’hôte à l’origine locale (0, 0), indépendamment de la latence de confirmation du placement natif. Les images opaques restent dessinées sous la View native active entre les défilements. Avant de masquer cette View, l’Engine attend la disponibilité visuelle de la WebView et un dessin ; VIEW ne crée pas de copies d’image natives d’entrée ou de retour. La confirmation du retour attend le dessin natif et la frame d’animation suivante. Une vérification de génération empêche un callback de couverture retardé de masquer le contenu après restauration ou suspension.

Le Bitmap natif est recyclé après l’encodage PNG en mode VIEW ; le PNG et l’image Web décodée restent en cache. Les notifications de mise à jour du plugin font avancer la révision du contenu : notifiez une mise à jour dès que le contenu change sans remplacement de la View. Le remplacement de l’enregistrement, la navigation de la WebView, reset ou close retire le cache. L’encodage reste hors du thread UI ; le dessin de la View et la propriété du cache y restent, avec la limite existante de 8 millions de pixels.

COMPOSITED conserve les copies natives de transfert pour le contenu translucide. Les copies d’entrée attendent la disponibilité visuelle de la WebView et un dessin avant d’être retirées. Si le délai d’entrée de 500 ms expire, la View native est restaurée avant la suppression de la copie, et une confirmation de dessin tardive est rejetée.

## Bibliothèque Android

Android utilise une bibliothèque Gradle Android, distribuée sous forme d’AAR via Maven plutôt que par enregistrement de plugin Capacitor. Les coordonnées de publication sont `io.github.webview-native-ui:engine:<version>`. Compilez et vérifiez la publication Maven locale avec :

```sh
android/gradlew -p android testDebugUnitTest assembleRelease connectedDebugAndroidTest publishReleasePublicationToVerificationRepository
```

`NativeUIClippedView` est un helper de bas niveau qui applique la position et le découpage fournis par l’appelant sans réinitialiser les dimensions inchangées. `NativeUIProjection` gère le transfert vers l’image et la restauration ; il n’utilise pas ce helper pour mettre en page le moteur de rendu. Le plugin consommateur gère le placement natif normal et les changements de taille. Android ne revendique pas de liaison overflow native de type WKWebView. Les enregistrements de haut niveau partagent un observateur tactile de fenêtre non consommant : down annule l’adoption d’une capture en cours, up/cancel/perte de focus autorise de nouveau la préparation, et le démontage supprime uniquement cet enregistrement. La distribution des callbacks et les valeurs de retour existantes sont préservées.

`NativeUISnapshots` prépare des images PixelCopy composites et des fichiers PNG locaux, puis couvre et restaure à partir de ce cache. L’encodage s’exécute hors du thread UI ; une seule préparation s’exécute par propriétaire. Notifiez les changements visuels et les interactions, puis libérez les jetons au démontage. Tous les appels de vue et de cycle de vie s’exécutent sur le thread UI. Le plugin conserve la gestion des révisions, de l’admissibilité et de la politique de repli.

Après l’affichage ou le retrait des pixels Web préparés, `NativeUIWebReadiness.prepare` vérifie la disponibilité pour un dessin ultérieur de la WebView. Son prédicat `current` doit valider la session propriétaire, la génération de source et la révision de l’image. La copie native temporaire couvre ce transfert asynchrone ; le démarrage de la superposition lui-même n’attend pas. Ni la confirmation du pont ni ce callback ne prouvent la présentation sur l’écran physique.

Une image opaque peut rester sous une vue native opaque entre les transferts, mais cette politique ne doit pas être appliquée aux contrôles translucides : dessiner une vue translucide au-dessus de sa propre apparence capturée composerait le contenu deux fois. Choisissez le comportement de capture pour la vue et l’arrière-plan réels, et validez l’intégration complète. Ne synthétisez jamais de clics à travers une image projetée.

### Surfaces Android translucides

Capturez les pixels composites de la fenêtre, arrière-plan compris, plutôt que de dessiner la vue translucide sur un bitmap vide. Gardez l’image Web préparée décodée, mais masquée. Lors du transfert, `cover(token, window, reference, views)` installe une copie d’image opaque temporaire avant de masquer ces vues natives dans le même tour UI. Révélez l’image Web, confirmez la disponibilité du dessin Web, puis retirez la copie d’entrée. La superposition démarre immédiatement ; l’encodage d’image n’est jamais sur ce chemin.

Pour le retour, installez la copie de retour préparée avec `restore`, restaurez les vues natives sous celle-ci, masquez l’image Web et retirez la copie de retour après la disponibilité du dessin Web. Cela évite de composer les pixels natifs translucides actifs sur leur propre instantané. Validez le jeton et la génération actuelle de la surface à chaque callback asynchrone. La copie temporaire est non interactive et limitée ; le démontage libère les deux copies et les ressources en cache.

Cela préserve l’arrière-plan capturé, pas une scène en changement continu derrière l’image. Les changements d’arrière-plan doivent invalider le cache via les mêmes notifications de changement visuel que les mises à jour du contenu. Les vidéos et les surfaces de capture non prises en charge conservent la politique de repli du consommateur.

Les tests d’intégration des consommateurs appartiennent à leurs dépôts respectifs. La CI de l’Engine teste ses contrats navigateur, Swift et Android sans exiger de checkout d’un moteur de rendu voisin.

## Précision des couleurs des images sur iOS

Les instantanés de fenêtre préparés utilisent un bitmap Display P3 étendu Float16 pendant la capture et sont encodés en PNG Display P3 16 bits sur une file d’arrière-plan. La projection Web affiche directement l’image préparée, sans conversion Canvas ou WebGPU. Les copies natives d’entrée et de retour utilisent aussi le PNG décodé : les deux côtés partagent donc les mêmes pixels préparés après conversion des couleurs. L’encodage et le décodage restent hors du transfert des superpositions ; les consommateurs n’ont besoin d’aucun nouveau paramètre ni dépendance.

Cela réduit la perte de couleur dans les contenus à gamut étendu, mais ne garantit pas une apparence Liquid Glass identique : la composition native et la conversion vers un PNG à valeurs entières peuvent encore modifier les pixels. Une précision supérieure augmente aussi la mémoire de capture et la taille des images. La politique de repli existante s’applique si la préparation échoue. Android conserve son chemin de capture propre à la plateforme.

### Différences de capture de Liquid Glass

Un contrôle Liquid Glass capturé peut différer du contrôle natif actif lorsqu’il est projeté dans la WebView. Les reflets lumineux des bords ainsi que la réfraction ou le flou de l’arrière-plan ne sont pas entièrement préservés par le chemin de capture. Une précision de couleur supérieure ne résout pas, à elle seule, cette différence.

![Captures d’appareils comparant les barres d’onglets UIKit capturées et actives sur iPhone et iPad](../assets/ios-native-capture-comparison.png)

À gauche : **iPhone 15 Pro Max, iOS 27.2**. À droite : **iPad mini (6e génération), iPadOS 27.2**. Chaque capture d’appareil montre le **PNG Display P3 16 bits capturé dans WKWebView en haut** et la **barre d’onglets UIKit active en bas**, à la même taille sur cet appareil. Les captures ont été placées côte à côte sans redimensionnement ni modification de leur profil colorimétrique commun. Ces résultats proviennent d’appareils physiques, pas de captures du simulateur.

La capture d’écran système préserve l’apparence active, mais la capture au niveau de l’application ne la reproduit pas entièrement. Sur l’iPhone testé, la différence était également présente lorsque l’image capturée non encodée était affichée dans une `UIImageView` native, avant encodage PNG ou affichage WebView. Dessiner l’ensemble de la `UIWindow` dans un bitmap couvrant toute la fenêtre, puis le recadrer, n’a pas amélioré le résultat par rapport au bitmap recadré de l’Engine.

Les captures d’écran système servent de preuve pour cette comparaison, pas de backend de capture alternatif pour l’Engine. Ces captures ont été obtenues avec des outils de développement et Developer Mode (mode développeur) activé sur les appareils. Les API applicatives de capture d’écran telles que ReplayKit exigent le consentement de l’utilisateur ; prendre manuellement une capture d’écran exige aussi une action utilisateur. Recadrer une capture d’écran système préserverait ses pixels capturés, mais ne supprime pas ces conditions d’acquisition. L’Engine n’adopte donc pas cette approche pour les transferts automatiques d’interface : la projection ordinaire ne doit pas dépendre de Developer Mode, d’actions de capture d’écran ni d’un parcours d’autorisation d’enregistrement d’écran. Consultez la [documentation de sécurité ReplayKit d’Apple](https://support.apple.com/guide/security/replaykit-security-seca5fc039dd/web).

Nous avons signalé cette limite à Apple et demandé une méthode prise en charge permettant de capturer l’apparence complète sans démarrer une session d’enregistrement d’écran. Consultez la [discussion des forums Apple Developer](https://developer.apple.com/forums/thread/853543). Apple a suggéré de capturer un ancêtre incluant l’arrière-plan nécessaire ; la comparaison de fenêtre entière ci-dessus teste cette approche. Cela reste une limite de capture observée, pas un correctif confirmé ni un engagement d’Apple. Validez les contrôles translucides sur des appareils physiques avec les arrière-plans pris en charge par votre plugin.

## Stockage temporaire et autorisations de l’application

Les images préparées restent dans le stockage temporaire privé de l’application. iOS utilise `FileManager.default.temporaryDirectory`. Sur Android, construisez `NativeUISnapshots` avec un répertoire dans `context.cacheDir` ; n’utilisez pas de stockage partagé ou externe. Aucune des deux plateformes ne nécessite de demande d’autorisation d’accès à la photothèque ou au stockage pour ce chemin. Aucun plugin Capacitor Filesystem n’est requis. Consultez les [répertoires sandbox d’Apple](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/FileSystemOverview/FileSystemOverview.html) et le [stockage propre à l’application sur Android](https://developer.android.com/training/data-storage/app-specific).

`Capacitor.convertFileSrc` associe l’URL de fichier renvoyée au serveur local existant de la WebView. Il n’accorde aucune autorisation de système de fichiers et ne téléverse pas l’image. Si l’application définit une Content Security Policy, son `img-src` doit autoriser l’origine locale de l’application utilisée par cette URL ; n’activez pas un accès `file:` étendu ni des paramètres sans rapport d’accès aux fichiers de la WebView.

`release(token)` et le démontage du propriétaire suppriment les fichiers d’instantanés possédés. Une interruption brutale du processus peut laisser des images temporaires jusqu’au nettoyage du cache par le système d’exploitation ou à la désinstallation de l’application ; une suppression immédiate après un crash n’est pas garantie. Gardez ce stockage privé et traitez-le comme jetable, pas comme des données applicatives persistantes.

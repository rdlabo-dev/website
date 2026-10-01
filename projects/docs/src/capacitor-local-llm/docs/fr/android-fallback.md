---
title: "Modèle de repli Android"
sourceRevision: "4d49ca639190d946aa4120301eb35e5668bbfb7a857df355f0efc0ca2e597d79"
---
# Modèle de repli Android

Lorsque ML Kit signale que Gemini Nano est indisponible, configurez explicitement un repli LiteRT-LM. Guides associés : [Configuration](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/setup), [Disponibilité](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/availability), [Images](https://docs.rdlabo.dev/projects/capacitor-local-llm/docs/images).

## Gemini Nano indisponible

Lorsque ML Kit signale que Gemini Nano est indisponible (y compris sur les appareils dépourvus de la fonctionnalité AICore requise), une application peut configurer explicitement un modèle local [LiteRT-LM](https://github.com/google-ai-edge/LiteRT-LM) `.litertlm`. Gemini Nano reste privilégié pour la génération textuelle ordinaire dès qu’il est disponible. Le plugin n’inclut pas les poids des modèles et ne les télécharge pas silencieusement : l’application gère le fichier du modèle, l’expérience de téléchargement, le stockage, les mises à jour et le respect de sa licence.

La configuration du repli privilégie les images et définit `supportsImages` à `true` par défaut, car LiteRT-LM 0.16.1 n’expose pas d’introspection stable des modalités. Utilisez un modèle multimodal, ou passez `supportsImages: false` pour un modèle textuel. Le point de départ recommandé pour les applications visuelles est un modèle de la [collection officielle de multimodalité LiteRT](https://huggingface.co/collections/litert-community/multi-modality-models), comme Gemma 4 E2B. Notez que Gemma 4 E2B fait environ 2.6 GB ; la taille du modèle et l’usage mémoire doivent être évalués sur chaque appareil pris en charge. Une conversion LFM2.5-VL-450M plus petite existe, mais sa fiche de modèle documente un défaut actuel de positionnement visuel ; elle n’est donc pas la recommandation par défaut.

```typescript
// Renommez le modèle téléchargé et incluez-le dans android/app/src/main/assets
// ou fournissez un chemin absolu lisible vers un fichier géré par l’application.
await LocalLLM.configureFallbackModel({
  path: '/android_asset/gemma-4-E2B-it.litertlm',
  maxTokens: 4096,
  maxImages: 1,
  // supportsImages vaut true par défaut
});

const { id: chatId } = await LocalLLM.createChat({
  instructions: 'Answer questions about the supplied image.',
});

const result = await LocalLLM.generateText({
  chatId,
  prompt: 'Describe this image concisely.',
  images: [{ uri: 'content://com.example.files/photo.jpg' }],
});
```

Chaque élément `images[]` accepte exactement l’une des valeurs `uri` ou `base64`. Les URI Android acceptent les chemins absolus lisibles, les URL `file://` décodées sans autorité et les URI `content://`. L’entrée Base64 accepte des octets encodés bruts ou une URL `data:image/...;base64,...`. L’option obsolète `imagePaths` reste disponible pour compatibilité et conserve le comportement v2.0 : elle utilise uniquement un repli LiteRT-LM configuré, même si ML Kit est disponible ; ne passez pas les deux options. Chaque image décodée est limitée à 32 MiB. Les URI de contenu et les entrées Base64 sont converties sur un dispatcher d’E/S en fichiers temporaires de cache d’application de taille limitée, puis supprimées après la génération. Les images s’appliquent uniquement à l’échange actuel et ne sont pas conservées dans l’historique.

Appelez `getImageAnalysisAvailability()` avant toute entrée d’image. Android considère l’état commun `available` de ML Kit Prompt comme la disponibilité de son API d’entrée d’image documentée et privilégie ce backend ; sinon, il utilise un repli LiteRT-LM configuré avec capacités visuelles. ML Kit décode les images via les API Android et limite le prétraitement à un bord maximal de 2048 pixels et environ 4 mégapixels par image, avec au plus 4 images et environ 8 mégapixels au total par demande. Ainsi, `maxImages: 4` est seulement une limite de nombre : quatre grandes images peuvent encore dépasser le budget de pixels total. LiteRT-LM reçoit directement le fichier résolu. Un repli textuel rejette les images avec `LOCAL_LLM_UNSUPPORTED` au lieu de les ignorer silencieusement.

Le parcours multi-image de ML Kit reste expérimental tant qu’il n’a pas terminé les tests de validation sur appareil physique avec Gemini Nano compatible. Ne considérez pas l’analyse d’images ML Kit comme prête pour la production sur la seule base de `getImageAnalysisAvailability()` ; validez la génération et le streaming, l’annulation, les images multiples, le nettoyage des URI de contenu et les erreurs d’images trop volumineuses sur chaque famille d’appareils prise en charge.

Privilégiez un chemin absolu de modèle géré par l’application pour les grands modèles. `/android_asset/...` est pris en charge par commodité, mais le plugin doit copier cet asset dans les fichiers privés de l’application, car le moteur natif exige un chemin réel. Il réutilise la copie privée versionnée au sein d’une même version de l’application, ferme l’ancien moteur lors d’une reconfiguration et supprime les anciennes copies du même asset après une nouvelle initialisation réussie. Lors d’une mise à niveau de l’application, le stockage maximal peut temporairement inclure l’asset empaqueté, l’ancienne copie privée et la nouvelle copie temporaire. Le moteur actif reste chargé pendant la durée de vie du plugin ; les fichiers gérés par l’application ne doivent pas être remplacés ni supprimés avant la destruction du plugin ou la configuration réussie d’un autre modèle.

Le repli utilise les messages structurés de LiteRT-LM, son flux de streaming natif et son API d’annulation. Il exécute actuellement les pipelines textuels et visuels sur CPU pour une compatibilité étendue et sérialise la génération, la configuration, le préchauffage, le téléchargement et la destruction avec le même mutex du plugin. `downloadModel()` continue de gérer uniquement le modèle système ML Kit. LiteRT-LM évolue rapidement : activez donc le repli explicitement et réalisez des tests prolongés sur appareils physiques avant la publication.

La dépendance Android fixe `kotlinx-coroutines` à 1.11.0, car le binaire LiteRT-LM 0.16.1 utilise la nouvelle ABI de méthode par défaut de `SendChannel`, tandis que son POM publié déclare encore 1.9.0. Supprimer ou rétrograder cette version fixée provoque un `NoSuchMethodError` à la fin du streaming natif ; consultez l’[issue LiteRT-LM #2812](https://github.com/google-ai-edge/LiteRT-LM/issues/2812) du projet amont.

Le modèle est facultatif, mais la dépendance d’exécution LiteRT-LM est incluse pour toutes les applications Android utilisant le plugin. La version 0.16.1 ajoute un AAR d’environ 20 MB compressés et des bibliothèques natives d’environ 22 MB par build arm64 (les APK de débogage universels sont plus volumineux ; les Android App Bundles sont normalement séparés par ABI). Vérifiez la taille finale APK/AAB et les ABI 64 bits prises en charge. LiteRT-LM est sous Apache-2.0 ; les poids des modèles ont leurs propres licences et conditions d’utilisation. Conservez `LICENSE` et `THIRD_PARTY_NOTICE.txt` du runtime dans les mentions OSS de votre application et examinez séparément les conditions du modèle choisi.

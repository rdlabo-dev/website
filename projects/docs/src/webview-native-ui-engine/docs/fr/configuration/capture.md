---
title: "Timing de capture"
sourceRevision: "d96661854c40b245d82c079e1106470993dadb679ce6a90d2a0e9c3f4f056788"
---
# Configurer le timing de capture

Utilisez ce paramètre lorsqu’un changement d’état réussi est signalé avant la fin de son animation visuelle. Par exemple, un événement de sélection d’onglet peut arriver alors que la surbrillance est encore agrandie ; une capture immédiate conserverait cette forme intermédiaire sous la prochaine superposition Web. Retardez la préparation en arrière-plan jusqu’à la stabilisation du contrôle. Conservez la valeur par défaut lorsque l’apparence mesurée est déjà stable ; un délai plus long maintient également l’image précédente disponible plus longtemps.

`captureDelayMs` est un paramètre d’enregistrement facultatif commun à Capacitor et Cordova. Sa valeur par défaut est de **50 millisecondes** sur iOS, Android et dans les options de bas niveau de `createWebProjection`. Les valeurs doivent être finies et non négatives. Il utilise le debounce existant : une nouvelle mise à jour ou interaction relance la préparation une fois l’activité stabilisée. Il n’ajoute pas de second minuteur et ne retarde pas la présentation de la superposition.

Jusqu’à ce que les pixels de remplacement soient prêts, la dernière image terminée reste disponible. S’il n’existe aucune image terminée, le repli Web normal s’applique. Ouvrir une superposition pendant le debounce n’attend pas une nouvelle capture. Augmenter le délai prolonge donc aussi la période pendant laquelle l’apparence précédente peut être utilisée après une mise à jour.

Une valeur initiale recommandée pour les **animations de sélection Liquid Glass de UITabBar est de 600 ms**. Dans les comparaisons sur les simulateurs iPhone iOS 27.0 et Duo iOS 27.1, 50 ms capturaient une sélection agrandie, 300 ms conservaient encore une légère variation résiduelle et 600 ms correspondaient à l’apparence stabilisée observée à 1000 ms. Il s’agit d’une recommandation pour cette interaction, pas d’un contrat de timing Apple ni d’une durée universelle de Liquid Glass. Mesurez la sélection, la resélection et les mises à jour successives de votre contrôle avant de choisir une valeur. Aucun instantané stabilisé n’est garanti pour un contenu en changement continu.

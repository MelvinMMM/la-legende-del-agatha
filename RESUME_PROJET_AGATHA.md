# 🥊 LA LÉGENDE D'EL AGATHA — DOSSIER COMPLET DU PROJET
**Version :** v1.1.0  
**Auteur & Game Designer :** Melvin  
**Dépôt GitHub :** [MelvinMMM/la-legende-del-agatha](https://github.com/MelvinMMM/la-legende-del-agatha)  
**Hébergement :** Déployé sur Netlify & Testable en local sur `http://localhost:3333` (ou `3000`)

---

## 📖 1. SYNOPSIS & UNIVERS DU JEU

*La Légende d'El Agatha* est un jeu narratif et d'arcade humoristique développé pour l'anniversaire d'une amie (**Agatha**). 

Agatha mène une double vie trépidante :
- **Le jour :** Étudiante modèle préparant ses examens et confrontée aux épreuves de la vie quotidienne d'adulte.
- **La nuit :** Masquée sous les traits d'**El Agatha**, redoutable luchadora des rings souterrains de Mexico !

### Les Personnages Récurrents :
* **🥊 El Agatha :** L'héroïne invincible, rapide, courageuse mais confrontée au stress des études et du permis.
* **🥊 Melvin (Coach) :** L'entraîneur tactique au grand cœur qui prodigue ses conseils avisés (*"Respire, mi ganador..."*).
* **📣 Lucie :** La meilleure amie survoltée qui soutient Agatha moralement et lui envoie des SMS de panique en rafale (*"Clignotant ou tu vas voir Jésus !"*).
* **📋 El Moniteur :** Le boss impassible de l'Épisode 2, silhouette d'acier, lunettes de fer, prêt à sanctionner le moindre centimètre sur son carnet de notes.

---

## 🎨 2. CHARTE GRAPHIQUE & IDENTITÉ VISUELLE

* **🧡 Orange Solaire (`#F59E0B` / `#FBBF24`) :** Titres rétro, gloire, trophées, badges principaux.
* **💜 Violet Mystique (`#8B5CF6` / `#1E1435`) :** Sélecteur d'épisodes, boutons actifs, boîtes de dialogues.
* **💖 Rose Magenta Luchadora (`#EC4899` / `#F43F5E`) :** Masque d'Agatha, actions spéciales, énergie vitale.
* **💠 Cyan Vitesse (`#38BDF8`) :** Moteur de course, jauges d'Asphalt, reflets des vitres.
* **🟢 Vert Victoire (`#10B981`) :** Point de patinage parfait, sortie validée, obtention du permis.

### Polices Typographiques :
* `Chiringuito Espacial` : Titres principaux, bannières d'arcade.
* `Mayan` : Textes narratifs, dialogues, statistiques, HUD.
* `Viva Mexico` & `Outline Style` : Écrans titres et décors.

---

## 🏗️ 3. ARCHITECTURE TECHNIQUE DU CODEBASE (`web/`)

Le projet est entièrement autonome dans le sous-dossier `web/` (qui constitue la racine du dépôt Git déployé sur Netlify).

```
web/
├── index.html                  # Structure DOM unique (Single-Page App)
├── style.css                   # Styles globaux, animations, responsive & HUDs
├── README.md                   # Documentation utilisateur
├── Assets/
│   ├── logo.png                # Tête d'Agatha détourée (Favicon & Menus)
│   ├── player/agatha*.png      # Sprites d'Agatha (Course, Saut, Attaque)
│   ├── E1/                     # Fonds 2D de l'Épisode 1 (bg1 à bg5)
│   ├── Image intro/            # 10 planches de cinématique pour le prologue
│   ├── Music/Game land/        # Pistes audio MP3 (45, 46, 47, 48, 49, 50, 52, 55)
│   └── Fonts/                  # Polices TTF officielles
└── js/
    ├── lib/
    │   └── three.min.js        # Moteur 3D Three.js r128 (Autonome & Offline)
    ├── config.js               # Constantes, États (STATES), dialogues & lore
    ├── audioManager.js         # Singleton Audio BGM & Voix
    ├── saveManager.js          # Singleton Sauvegarde (localStorage)
    ├── uiManager.js            # Contrôleur d'écrans & Observer UI
    ├── rpgBattleManager.js     # Moteur Combat Tour par Tour (Boss Ep1)
    ├── drivingEngine3D.js      # Moteur 3D Three.js de Conduite Arcade (Épisode 2)
    ├── gameEngine.js           # Moteur 2D Canvas & Boucle de jeu (Épisode 1)
    ├── introManager.js         # Cinématique interactive
    ├── states/gameStates.js    # State Machine (FSM)
    ├── strategies/             # Stratégies de niveaux 1 à 5
    └── main.js                 # Point d'entrée & Écouteurs d'événements
```

---

## 🥊 4. ÉPISODE 1 : "LOS EXÁMENES FINALES" (100% TERMINÉ)

L'Épisode 1 est un jeu d'arcade 2D complet en 5 niveaux menant à la cinématique de fin :

1. **Niveau 1 — Ring de Lucha :** Bagarre contre des fournitures scolaires animées (stylos lasers, équerres sauteuses, encres toxiques).
2. **Niveau 2 — La Salle de Classe :** Mini-jeu de Quiz interactif sur tableau noir avec pénalités de dégâts en cas de mauvaise réponse.
3. **Niveau 3 — Le Couloir des Casiers :** Épreuve de survie et d'esquive de portes de casiers piégées.
4. **Niveau 4 — Le Labo ZBrush :** Affrontement 2D contre le Monolithe ZBrush avec pattern d'attaques.
5. **Niveau 5 — Boss RPG Tour par Tour :**
   - Style Final Fantasy classique (Agatha à gauche, Boss à droite).
   - Jauges de PV (200) et d'Endurance (200).
   - Attaques : `Puño de la Lucha` (20 dégâts), `Plancha Voladora` (35 dégâts, priorité), `Suplex Escolar` (55 dégâts, stun).
   - Soutiens : Melvin (`ATQ +50%`), Lucie (`+30 PV & Esquive`).
   - Boss en 5 phases successives (*Projet de fin d'études*, *Showreels*, *Prueba técnica*, *Grand oral*, *Exámenes finales*).
6. **Écran Outro & Générique de fin :** Piste musicale 52, crédits défilants, déblocage automatique de l'Épisode 2.

---

## 🚗 5. ÉPISODE 2 : "EL PERMISO DE CONDUCIR" (THREE.JS 3D)

Inspiré des jeux de course arcade type *Asphalt*, avec caméra de poursuite 3e personne dynamique et physique 3D WebGL.

### Les 3 Rounds de l'Examen :
* **Round 1 — Le Démarrage en Côte (L'Épreuve du Point de Patinage) :**
  - Route inclinée en 3D avec décors urbains.
  - La voiture attend au frein à main serré.
  - Le joueur maintient `[↑]` pour amener l'aiguille dans la zone verte (2200 - 3800 RPM).
  - Un appui sur `[ESPACE]` (ou clic sur le bouton doré) relâche le frein à main pour s'élancer vers le sommet !
* **Round 2 — Le Rond-Point des Enfers (Asphalt Traffic Dodger) :**
  - Immense rond-point à 4 voies avec îlot central, palmiers et monument aztèque.
  - 8 véhicules IA circulent à des allures variées.
  - Commandes : Dérapage avec `[ESPACE]`, clignotants gauche `[Q]` et droit `[E]`.
  - Objectif : Fracasser le chrono, activer le clignotant droit et prendre la Sortie 3 sans emboutir les autres voitures.
* **Round 3 — Le Créneau de l'Angoisse (Boss Final : El Moniteur) :**
  - Ambiance nocturne avec réverbères et phares allumés.
  - Radar de stationnement sonore (bips ultrasonores de plus en plus rapides à l'approche du trottoir et des voitures).
  - Réaliser un créneau parfait dans la boîte verte pour terrasser El Moniteur et décrocher le diplôme !

### Correctifs Récents Validés :
* **Résolution du Game Over instantané :** Ajout d'un cooldown d'invulnérabilité de 2 secondes sur `addStrike()` et frein à main serré au démarrage.
* **Correction du vol de la voiture :** Intégration de la voiture directement dans le repère local de la route pour qu'elle reste toujours collée à l'asphalte.
* **Look Auto-École réaliste :** Fin de l'aspect "voiture de police", carrosserie blanche lumineuse avec enseigne de toit orange `AUTO-ÉCOLE` et gyrophare clignotant.
* **Isolation stricte des HUDs :** Correction de la classe `.hidden` pour que les compteurs des 3 rounds ne se superposent plus.

---

## 🚀 6. GUIDE DE DÉMARRAGE RAPIDE POUR L'IDE ANTIGRAVITY

### Lancer le serveur local :
Dans le dossier `web/` :
```powershell
npx serve -l 3333
```
Accès navigateur : `http://localhost:3333`

### Synchroniser avec GitHub :
```powershell
git add .
git commit -m "message"
git push
```
Le déploiement Netlify se déclenche automatiquement à chaque push sur la branche `main`.

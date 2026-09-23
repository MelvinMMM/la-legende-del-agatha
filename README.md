# 🥊 La Légende d'El Agatha — Épisode 1 : Los Exámenes Finales

![Version](https://img.shields.io/badge/Version-1.0.0-f59e0b?style=for-the-badge&logo=gamepad)
![Platform](https://img.shields.io/badge/Platform-Web%20%2F%20HTML5%20Canvas-ec4899?style=for-the-badge&logo=html5)
![Architecture](https://img.shields.io/badge/Architecture-Modular%20ES6%20%2F%20Design%20Patterns-8b5cf6?style=for-the-badge&logo=javascript)
![License](https://img.shields.io/badge/License-Proprietary-10b981?style=for-the-badge)

> *« La chica que lucha contra el destino ! »*  
> **La Légende d'El Agatha** est un jeu rétro 2D en Pixel Art mêlant action arcade, quiz survolté, survie et combat RPG au tour par tour inspiré des plus grands classiques du jeu vidéo.

---

## 📖 Synopsis

Dans les rues poussiéreuses et populaires de Mexico, une jeune étudiante mène une double vie trépidante :
* **Le jour** : Agatha prépare son diplôme sous le regard sévère des professeurs, enchaîne les révisions et lutte contre la fatigue.
* **La nuit** : Elle enfile son masque, monte sur le ring et devient la terreur des arènes clandestines : **EL AGATHA** !

Accompagnée de son coach tactique **Melvin** 🥊 et de sa meilleure amie et soutien moral **Lucie** 📣, Agatha doit affronter l'épreuve ultime de sa scolarité : **Los Exámenes Finales** !

---

## 🎮 Contenu & Niveaux de l'Épisode 1

L'Épisode 1 propose une aventure variée structurée en 5 épreuves aux mécaniques uniques :

| Niveau | Nom de l'Épreuve | Type de Gameplay | Objectif |
| :---: | :--- | :--- | :--- |
| **1** | **Ring de Lucha** | 🏃 Action / Collecte Arcade | Esquiver les stylos lasers et équerres mortelles tout en ramassant les notes de cours. |
| **2** | **Examen Écrit** | 📝 QCM Éclair Interactif | Répondre aux questions pièges des révisions sous les tirs de craie du professeur. |
| **3** | **Couloir des Casiers** | 🚪 Survie & Esquive | Éviter les casiers métalliques qui ciblent et foncent sur Agatha. |
| **4** | **Labo ZBrush** | 🗿 Combat de Boss Temps Réel | Vaincre le Monolithe 3D géant en lui assénant des prises de Lucha Libre. |
| **5** | **Los Exámenes Finales** | ⚔️ RPG Tour par Tour *(Final Fantasy Style)* | Terrasser les 5 sous-boss et l'Examen Final dans un combat tactique au sommet ! |

---

## ⚔️ Système de Combat RPG (Niveau 5)

Le combat final contre **Los Exámenes Finales** se déroule en tour par tour complet avec gestion des **Points de Vie (PV)** et de l'**Endurance (END)** :

### 🥊 Attaques Lucha Libre :
* **Coup de Poing Normal** : Frappe de base constante (coût : 10 END).
* **Plancha Voladora** : Attaque aérienne prioritaire rapide (coût : 15 END).
* **Suplex Escolar** : Prise lourde dévastatrice avec 30% de chance d'étourdir l'adversaire (coût : 25 END).

### 🛡️ Soutien des Alliés :
* **Melvin (Coach)** : Analyse tactique qui augmente les dégâts d'Agatha de **+50%** pour le tour suivant (coût : 20 END).
* **Lucie (Meilleure Amie)** : Encouragements qui restaurent **+40 PV** et confèrent **50% d'esquive** au tour suivant (coût : 20 END).

---

## 🎨 Charte Graphique & Identité Visuelle

Le jeu arbore une direction artistique rétro et vibrante bâtie autour d'une trinité de couleurs emblématiques :

* 🧡 **Orange Solaire & Calavera (`#F59E0B` / `#FBBF24`)** : Titres majestueux, scores, feux d'artifice et triomphe.
* 💜 **Violet Nocturne (`#8B5CF6` / `#1E1435`)** : Sélecteur d'épisodes, ambiances clandestines et encarts de dialogue.
* 💖 **Rose Magenta Lucha (`#EC4899` / `#F43F5E`)** : Identité d'Agatha, masque, boutons d'action et badges de combat.

---

## 🛠️ Architecture Technique & Design Patterns

Développé en architecture logicielle propre et modulaire, le dossier `web/` est **100% autonome (Self-Contained)** :

* **Singleton Pattern** : `GameEngine`, `SaveManager`, `UIManager`, `RPGBattleManager`, `AudioManager`.
* **Strategy Pattern** : `Level1Strategy`, `Level2Strategy`, `Level3Strategy`, `Level4Strategy`, `Level5Strategy`.
* **State Machine Pattern** : Gestion propre des états (`START`, `MENU`, `EPISODES`, `WORLDMAP`, `INTRO`, `GAME`, `VICTORY`, `GAMEOVER`, `OUTRO`).
* **Persistance Locale** : Progression et niveaux débloqués enregistrés de manière transparente dans `localStorage`.
* **Audio Engine Dédié** : Mixage indépendant des musiques d'ambiance et des voix off synchronisées.

---

## 🚀 Lancer le Jeu en Local

### Prérequis :
Aucune installation complexe requise. Un simple navigateur moderne suffit (Chrome, Firefox, Edge, Safari).

### Méthode 1 : Serveur Node.js (Recommandé)
```bash
# Dans le dossier web
cd web
npx serve -l 3000
```
Ouvre ensuite ton navigateur sur : **`http://localhost:3000`**

### Méthode 2 : Extension VS Code (Live Server)
1. Ouvre le dossier `web/` dans VS Code.
2. Clique droit sur `index.html` -> **Open with Live Server**.

---

## 🚗 Prochainement... Épisode 2 : El Permiso de Conducir

Après avoir triomphé des examens scolaires, Agatha devra faire face à son prochain défi d'adulte :
* 🚗 **L'examen du permis de conduire** face au redoutable **El Moniteur** et son carnet de notes.
* 🛑 Les 3 rounds infernaux : *Le Démarrage en côte*, *Le Rond-point de l'angoisse*, et *Le Créneau mortel* !

---

## 👥 Crédits & Équipe

* **Game Design, Scénario & Développement** : Melvin
* **Héroïne** : El Agatha
* **Alliés du Corner** : Melvin (Coach) & Lucie (Support)
* **Bande Sonore** : Game Land Collection (Pistes 45 à 55)

---
*© 2026 La Légende d'El Agatha — Version 1.0.0 — Fait avec passion.*

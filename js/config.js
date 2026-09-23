/* ==========================================================================
   CONFIG & REGISTRY - LA LÉGENDE D'EL AGATHA (WEB VERSION)
   ========================================================================== */

const STATES = {
    START: 'START',
    MENU: 'MENU',
    EPISODES: 'EPISODES',
    WORLDMAP: 'WORLDMAP',
    INTRO: 'INTRO',
    GAME: 'GAME',
    VICTORY: 'VICTORY',
    GAMEOVER: 'GAMEOVER',
    OUTRO: 'OUTRO'
};

const AUDIO_TRACKS = {
    MENU: 'Assets/Music/Game land/je sais pas trop... 45.mp3',
    MAP: 'Assets/Music/Game land/je sais pas trop... 46.mp3',
    INTRO: 'Assets/Music/Game land/je sais pas trop... 48.mp3',
    VICTORY: 'Assets/Music/Game land/je sais pas trop... 49.mp3',
    GAMEOVER: 'Assets/Music/Game land/je sais pas trop... 50.mp3',
    LEVEL1: 'Assets/Music/Game land/je sais pas trop... 47.mp3',
    LEVEL2: 'Assets/Music/Game land/je sais pas trop... 52.mp3',
    BOSS: 'Assets/Music/Game land/je sais pas trop... 55.mp3',
    OUTRO: 'Assets/Music/Game land/je sais pas trop... 52.mp3'
};

const episodeData = {
    1: { title: "Los Exámenes Finales", desc: "Agatha affronte les premières vagues d'examens et de fournitures scolaires mortelles !", boss: "Los Exámenes Finales" },
    2: { title: "El Permiso de Conducir", desc: "Le combat psychologique dans la voiture grise contre El Moniteur et son carnet de notes.", boss: "El Moniteur" },
    3: { title: "El Bailleur", desc: "Le gardien des appartements exige RIB froissé, fiches de paie et garanties solidairement éternelles !", boss: "El Bailleur" },
    4: { title: "El Wifi Capricioso", desc: "L'ennemi invisible des ondes qui coupe la connexion à minuit entre les toilettes et le pesto !", boss: "El Wifi Capricioso" },
    5: { title: "El Presidente Macron", desc: "Débat politique au pupitre de l'Élysée : contrez les statistiques et les réformes à coups de Suplex !", boss: "El Presidente Macron" },
    6: { title: "El Jefe Final - Jesús", desc: "L'ultime confrontation face à la sagesse infinie et au vrai boss du jeu : La Vida Adulta !", boss: "Jesús" }
};

const episodeStories = {
    2: {
        title: "ÉPISODE 2 : El Permiso de Conducir",
        text: `Après les nuits passées à combattre dans les arènes souterraines, Agatha pensait pouvoir souffler. Mais son prochain adversaire l’attendait au tournant.

Pour continuer ses études loin de chez elle, elle devait décrocher un document redoutable : EL PERMISO DE CONDUCIR !

Sur le siège passager trônait El Moniteur, silhouette sévère, lunettes de fer, carnet de notes à la main.

• 1er round : Le démarrage en côte.
• 2ème round : Le rond-point infernal.
• 3ème round : Le créneau, la prise de soumission préférée du boss !

"Va-t-elle réussir à abattre El Permiso de Conducir ?" (Prochainement dans la suite !)`
    },
    3: {
        title: "ÉPISODE 3 : El Bailleur",
        text: `Dans les bas-fonds de Mexico populaire, un nouvel adversaire attendait El Agatha... EL BAILLEUR !

Dans son bureau étroit tapissé de contrats, les chiffres flottaient comme les compagnons de Davy Jones.

"Dossier complet ! Trois fiches de paie ! Garant solvable ! Ou tu es OUT !"

Armée d'une photocopie de sa carte étudiante, d'un RIB froissé et du soutien de Lucie, Agatha se prépare à l'affrontement.`
    },
    4: {
        title: "ÉPISODE 4 : El Wifi Capricioso",
        text: `Minuit passé. Projet à rendre dans 47 minutes. Soudain... LE VOYANT ROUGE CLIGNOTE.

El Wifi Capricioso s'est réveillé ! Planqué derrière la box fibre poussiéreuse, il absorbe les paquets réseau.

Agatha doit courir d'une pièce à l'autre, réinitialiser les routeurs tout en évitant les coupures de courant et les barres de chargement infinies !`
    },
    5: {
        title: "ÉPISODE 5 : El Presidente Macron",
        text: `Invitée au débat télévisé de l'Élysée, Agatha doit esquiver les réformes surprises et les graphiques de productivité en 3D !

Face aux punchlines présidentielles et aux promesses de stage non rémunéré, seule une prise de Lucha Libre bien placée pourra sauver le diplôme national.`
    },
    6: {
        title: "ÉPISODE 6 : El Jefe Final - Jesús",
        text: `Le ring ultime se dresse au sommet de la pyramide aztèque du destin.

Face à elle : Jesús, maître de la vie adulte, des impôts, des factures EDF et du passage à l'âge mûr.

Un combat titanesque en 10 rounds pour la liberté et la gloire éternelle d'El Agatha !`
    }
};

const introDialogue = [
    { text: "Dans les rues poussiéreuses de Mexico, une jeune étudiante mène une double vie...", speaker: "VOIX OFF", img: "scene1" },
    { text: "Le jour, Agatha prépare son diplôme sous le regard sévère des professeurs.", speaker: "VOIX OFF", img: "scene2" },
    { text: "La nuit, elle enfile son masque et devient la terreur des rings : EL AGATHA !", speaker: "VOIX OFF", img: "scene3" },
    { text: "Agatha : 'Demain commence la semaine des examens finaux... Je dois être prête !'", speaker: "AGATHA", img: "scene4" },
    { text: "Melvin : 'Ne sous-estime pas les stylos et équerres, Agatha ! Ils attaquent en groupe !'", speaker: "MELVIN (COACH)", img: "scene5" },
    { text: "Lucie : 'Et surtout, n'oublie pas de réviser pendant tes combats ! Je serai là pour t'aider !'", speaker: "LUCIE", img: "scene6" },
    { text: "Soudain, une alerte résonne dans l'arène : les monstres scolaires attaquent !", speaker: "VOIX OFF", img: "scene7" },
    { text: "Agatha : 'C'est l'heure de montrer ce que vaut la Lucha Libre étudiante !'", speaker: "AGATHA", img: "scene8" },
    { text: "La cloche retentit... Les épreuves commencent !", speaker: "VOIX OFF", img: "scene9" },
    { text: "ÉPISODE 1 : LOS EXÁMENES FINALES ! ¡ A LUCHAR !", speaker: "VOIX OFF", img: "scene10" }
];

const quizQuestions = [
    { q: "Quelle est la capitale du Mexique ?", opts: ["Mexico", "Cancún", "Guadalajara"], correct: 0 },
    { q: "Quel est le masque traditionnel des catcheurs mexicains ?", opts: ["Sombrero", "Máscara de Lucha Libre", "Poncho"], correct: 1 },
    { q: "Combien font 7 x 8 ?", opts: ["54", "56", "64"], correct: 1 },
    { q: "Dans un triangle rectangle, quel théorème relie les côtés ?", opts: ["Thalès", "Pythagore", "Newton"], correct: 1 },
    { q: "Quel est l'élément chimique de symbole 'O' ?", opts: ["Or", "Oxygène", "Osmium"], correct: 1 },
    { q: "Qui est le coach d'El Agatha ?", opts: ["Jesús", "Melvin", "El Moniteur"], correct: 1 },
    { q: "Quel logiciel 3D hante les nuits des étudiants ?", opts: ["ZBrush", "Paint", "Excel"], correct: 0 },
    { q: "En espagnol, comment dit-on 'Au revoir' ?", opts: ["Hola", "Adiós", "Gracias"], correct: 1 },
    { q: "Quel est le nom de la meilleure amie d'Agatha ?", opts: ["Lucie", "Maria", "Elena"], correct: 0 },
    { q: "Comment s'appelle l'attaque rapide d'Agatha ?", opts: ["Plancha Voladora", "Dormez-vous", "Chute libre"], correct: 0 }
];

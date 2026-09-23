/* ==========================================================================
   LEVEL STRATEGIES (STRATEGY PATTERN) - LA LÉGENDE D'EL AGATHA
   ========================================================================== */

class BaseLevelStrategy {
    constructor(levelNum) {
        this.levelNum = levelNum;
    }

    init(gameState, canvasWidth, canvasHeight, uiManager) {
        throw new Error("init() must be implemented by concrete Level Strategy");
    }

    getBgmTrack() {
        return AUDIO_TRACKS.LEVEL1;
    }

    getBackgroundImage(assets) {
        return assets.images.ringBg;
    }

    hasNotes() {
        return true;
    }
}

class Level1Strategy extends BaseLevelStrategy {
    constructor() {
        super(1);
    }

    init(gameState, canvasWidth, canvasHeight, uiManager) {
        gameState.totalNotesNeeded = 10;
        uiManager.hideQuizOverlay();
        const rpgOverlay = document.getElementById('rpg-battle-overlay');
        if (rpgOverlay) rpgOverlay.classList.add('hidden');

        gameState.notes = [
            new NoteCollectible(canvasWidth, canvasHeight)
        ];

        gameState.enemies = [
            EnemyFactory.createEnemy('stylo', canvasWidth * 0.2, 100, canvasWidth, canvasHeight),
            EnemyFactory.createEnemy('stylo', canvasWidth * 0.75, 120, canvasWidth, canvasHeight),
            EnemyFactory.createEnemy('equere', canvasWidth * 0.35, 80, canvasWidth, canvasHeight),
            EnemyFactory.createEnemy('equere', canvasWidth * 0.6, 90, canvasWidth, canvasHeight)
        ];

        uiManager.showToast("🥊 Melvin", "Niveau 1 : Ramasse les 10 notes une par une avant la fin des 60s !");
    }

    getBgmTrack() {
        return AUDIO_TRACKS.LEVEL1;
    }

    getBackgroundImage(assets) {
        return assets.images.ringBg;
    }

    hasNotes() {
        return true;
    }
}

class Level2Strategy extends BaseLevelStrategy {
    constructor() {
        super(2);
    }

    init(gameState, canvasWidth, canvasHeight, uiManager) {
        gameState.totalNotesNeeded = 10;
        uiManager.prepareShuffledQuiz();
        uiManager.showQuizOverlay();
        const rpgOverlay = document.getElementById('rpg-battle-overlay');
        if (rpgOverlay) rpgOverlay.classList.add('hidden');

        gameState.notes = [];
        gameState.enemies = [
            EnemyFactory.createEnemy('stylo', canvasWidth * 0.12, 110, canvasWidth, canvasHeight),
            EnemyFactory.createEnemy('stylo', canvasWidth * 0.35, 140, canvasWidth, canvasHeight),
            EnemyFactory.createEnemy('stylo', canvasWidth * 0.62, 120, canvasWidth, canvasHeight),
            EnemyFactory.createEnemy('stylo', canvasWidth * 0.85, 135, canvasWidth, canvasHeight),
            EnemyFactory.createEnemy('equere', canvasWidth * 0.22, 90, canvasWidth, canvasHeight),
            EnemyFactory.createEnemy('equere', canvasWidth * 0.50, 85, canvasWidth, canvasHeight),
            EnemyFactory.createEnemy('equere', canvasWidth * 0.76, 95, canvasWidth, canvasHeight)
        ];

        uiManager.showToast("📚 LA SALLE DE CLASSE", "Réponds aux 10 questions au tableau [1, 2, 3] tout en esquivant le tir continu d'équerres et stylos !");
    }

    getBgmTrack() {
        return AUDIO_TRACKS.LEVEL1;
    }

    getBackgroundImage(assets) {
        return assets.images.classBg;
    }

    hasNotes() {
        return false;
    }
}

class Level3Strategy extends BaseLevelStrategy {
    constructor() {
        super(3);
    }

    init(gameState, canvasWidth, canvasHeight, uiManager) {
        gameState.totalNotesNeeded = 0;
        uiManager.hideQuizOverlay();
        const rpgOverlay = document.getElementById('rpg-battle-overlay');
        if (rpgOverlay) rpgOverlay.classList.add('hidden');

        gameState.notes = [];
        gameState.enemies = [
            EnemyFactory.createEnemy('casier', canvasWidth * 0.08, 100, canvasWidth, canvasHeight, false),
            EnemyFactory.createEnemy('casier', canvasWidth * 0.24, 100, canvasWidth, canvasHeight, true),
            EnemyFactory.createEnemy('casier', canvasWidth * 0.40, 100, canvasWidth, canvasHeight, false),
            EnemyFactory.createEnemy('casier', canvasWidth * 0.56, 100, canvasWidth, canvasHeight, false),
            EnemyFactory.createEnemy('casier', canvasWidth * 0.72, 100, canvasWidth, canvasHeight, true),
            EnemyFactory.createEnemy('casier', canvasWidth * 0.86, 100, canvasWidth, canvasHeight, false)
        ];

        uiManager.showToast("🚪 COULOIR DES CASIERS", "Attention ! 2 casiers avec cible 🎯 ciblent directement Agatha ! Bouge sans arrêt !");
    }

    getBgmTrack() {
        return AUDIO_TRACKS.LEVEL1;
    }

    getBackgroundImage(assets) {
        return assets.images.lockersBg;
    }

    hasNotes() {
        return false;
    }
}

class Level4Strategy extends BaseLevelStrategy {
    constructor() {
        super(4);
    }

    init(gameState, canvasWidth, canvasHeight, uiManager) {
        gameState.totalNotesNeeded = 0;
        uiManager.hideQuizOverlay();
        const rpgOverlay = document.getElementById('rpg-battle-overlay');
        if (rpgOverlay) rpgOverlay.classList.add('hidden');

        gameState.notes = [];
        const boss = new BossZBrush(canvasWidth, canvasHeight);
        gameState.enemies = [boss];

        uiManager.showToast("🗿 LABO ZBRUSH - MINI-BOSS", "Ramasse les munitions ⚡ pour tirer sur le Logo ZBrush et réduire ses 100 PV à 0 !");
    }

    getBgmTrack() {
        return AUDIO_TRACKS.LEVEL1;
    }

    getBackgroundImage(assets) {
        return assets.images.zbrushBg;
    }

    hasNotes() {
        return false;
    }
}

class Level5Strategy extends BaseLevelStrategy {
    constructor() {
        super(5);
    }

    init(gameState, canvasWidth, canvasHeight, uiManager) {
        gameState.totalNotesNeeded = 0;
        uiManager.hideQuizOverlay();

        const rpgOverlay = document.getElementById('rpg-battle-overlay');
        if (rpgOverlay) {
            rpgOverlay.classList.remove('hidden');
            rpgOverlay.classList.add('active');
        }

        RPGBattleManager.getInstance().startBattle();
    }

    getBgmTrack() {
        return AUDIO_TRACKS.BOSS; // "je sais pas trop... 55.mp3"
    }

    getBackgroundImage(assets) {
        return assets.images.ringBg5; // "Assets/E1/bg5.jpg"
    }

    hasNotes() {
        return false;
    }
}

class LevelStrategyFactory {
    static getStrategy(levelNum) {
        switch (levelNum) {
            case 1: return new Level1Strategy();
            case 2: return new Level2Strategy();
            case 3: return new Level3Strategy();
            case 4: return new Level4Strategy();
            case 5: return new Level5Strategy();
            default: return new Level1Strategy();
        }
    }
}

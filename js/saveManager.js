/* ==========================================================================
   SAVE MANAGER (SINGLETON PATTERN) - LA LÉGENDE D'EL AGATHA
   ========================================================================== */

class SaveManager {
    constructor() {
        if (SaveManager.instance) {
            return SaveManager.instance;
        }

        this.hasSave = false;
        this.playerProgress = {
            unlockedLevel: 1,
            unlockedEpisode: 1,
            completedLevels: []
        };

        this.load();
        SaveManager.instance = this;
    }

    static getInstance() {
        if (!SaveManager.instance) {
            SaveManager.instance = new SaveManager();
        }
        return SaveManager.instance;
    }

    load() {
        try {
            const hasSave = localStorage.getItem('agatha_has_save');
            const savedUnlocked = localStorage.getItem('agatha_unlocked_level');
            const savedUnlockedEp = localStorage.getItem('agatha_unlocked_episode');
            const savedCompleted = localStorage.getItem('agatha_completed_levels');

            if (savedUnlocked) this.playerProgress.unlockedLevel = parseInt(savedUnlocked);
            if (savedUnlockedEp) this.playerProgress.unlockedEpisode = parseInt(savedUnlockedEp);
            if (savedCompleted) this.playerProgress.completedLevels = JSON.parse(savedCompleted);

            this.hasSave = (hasSave === 'true') || 
                           (this.playerProgress.completedLevels && this.playerProgress.completedLevels.length > 0) || 
                           (this.playerProgress.unlockedLevel > 1) ||
                           (this.playerProgress.unlockedEpisode > 1);
        } catch (e) {
            console.warn("Erreur lecture sauvegarde:", e);
            this.hasSave = false;
        }
    }

    hasSavedGame() {
        return this.hasSave;
    }

    save() {
        try {
            localStorage.setItem('agatha_has_save', 'true');
            localStorage.setItem('agatha_unlocked_level', this.playerProgress.unlockedLevel);
            localStorage.setItem('agatha_unlocked_episode', this.playerProgress.unlockedEpisode);
            localStorage.setItem('agatha_completed_levels', JSON.stringify(this.playerProgress.completedLevels));
            this.hasSave = true;
        } catch (e) {
            console.warn("Erreur écriture sauvegarde:", e);
        }
    }

    resetProgress() {
        this.playerProgress = {
            unlockedLevel: 1,
            unlockedEpisode: 1,
            completedLevels: []
        };
        this.hasSave = true;
        this.save();
    }

    unlockLevel(levelNum) {
        if (levelNum > this.playerProgress.unlockedLevel && levelNum <= 5) {
            this.playerProgress.unlockedLevel = levelNum;
            this.save();
        }
    }

    completeLevel(levelNum) {
        if (!this.playerProgress.completedLevels.includes(levelNum)) {
            this.playerProgress.completedLevels.push(levelNum);
        }

        if (levelNum === 5) {
            this.playerProgress.unlockedEpisode = Math.max(this.playerProgress.unlockedEpisode, 2);
        }

        const nextLvl = levelNum + 1;
        if (nextLvl <= 5 && nextLvl > this.playerProgress.unlockedLevel) {
            this.playerProgress.unlockedLevel = nextLvl;
        }

        this.save();
    }
}

const saveManager = new SaveManager();

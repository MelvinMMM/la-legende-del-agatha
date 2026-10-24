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
            completedLevels: [],
            ep2UnlockedRound: 1,
            ep2CompletedRounds: []
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

            const savedEp2Round = localStorage.getItem('agatha_ep2_unlocked_round');
            const savedEp2Completed = localStorage.getItem('agatha_ep2_completed_rounds');
            if (savedEp2Round) this.playerProgress.ep2UnlockedRound = parseInt(savedEp2Round);
            if (savedEp2Completed) this.playerProgress.ep2CompletedRounds = JSON.parse(savedEp2Completed);

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
            localStorage.setItem('agatha_ep2_unlocked_round', this.playerProgress.ep2UnlockedRound || 1);
            localStorage.setItem('agatha_ep2_completed_rounds', JSON.stringify(this.playerProgress.ep2CompletedRounds || []));
            this.hasSave = true;
        } catch (e) {
            console.warn("Erreur écriture sauvegarde:", e);
        }
    }

    resetProgress() {
        this.playerProgress = {
            unlockedLevel: 1,
            unlockedEpisode: 1,
            completedLevels: [],
            ep2UnlockedRound: 1,
            ep2CompletedRounds: []
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

    completeEp2Round(roundNum) {
        if (!this.playerProgress.ep2CompletedRounds.includes(roundNum)) {
            this.playerProgress.ep2CompletedRounds.push(roundNum);
        }

        const nextRound = roundNum + 1;
        if (nextRound <= 3 && nextRound > (this.playerProgress.ep2UnlockedRound || 1)) {
            this.playerProgress.ep2UnlockedRound = nextRound;
        }

        this.save();
    }
}

const saveManager = new SaveManager();

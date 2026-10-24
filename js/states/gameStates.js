/* ==========================================================================
   GAME STATES (STATE PATTERN) - LA LÉGENDE D'EL AGATHA
   ========================================================================== */

class GameStateMachine {
    constructor(engine) {
        this.engine = engine;
        this.currentStateName = null;
    }

    setState(newStateName) {
        this.currentStateName = newStateName;
        this.engine.isPaused = false;
        uiManager.pauseModal.classList.add('hidden');

        if (newStateName !== STATES.GAME) {
            uiManager.hideQuizOverlay();
        }

        uiManager.showScreen(newStateName);

        switch (newStateName) {
            case STATES.START:
            case STATES.MENU:
            case STATES.EPISODES:
                audioManager.playBgm(AUDIO_TRACKS.MENU);
                break;
            case STATES.WORLDMAP:
                this.renderWorldMapUI();
                audioManager.playBgm(AUDIO_TRACKS.MAP);
                break;
            case STATES.INTRO:
            case STATES.EPISODE2_INTRO:
                audioManager.playBgm(AUDIO_TRACKS.INTRO);
                break;
            case STATES.EPISODE2_MAP:
                audioManager.playBgm(AUDIO_TRACKS.MAP);
                break;
            case STATES.GAME:
                const strategy = LevelStrategyFactory.getStrategy(this.engine.currentLevel);
                audioManager.playBgm(strategy.getBgmTrack());
                break;
            case STATES.EPISODE2_GAME:
                const isEp2Boss = (typeof drivingEngine3D !== 'undefined' && drivingEngine3D.currentRound === 3);
                audioManager.playBgm(isEp2Boss ? AUDIO_TRACKS.BOSS : AUDIO_TRACKS.LEVEL1);
                break;
            case STATES.VICTORY:
            case STATES.EPISODE2_VICTORY:
                audioManager.playBgm(AUDIO_TRACKS.VICTORY);
                break;
            case STATES.GAMEOVER:
            case STATES.EPISODE2_GAMEOVER:
                audioManager.playBgm(AUDIO_TRACKS.GAMEOVER);
                break;
        }
    }

    renderWorldMapUI() {
        const unlockedLvl = saveManager.playerProgress.unlockedLevel;
        const completedLevels = saveManager.playerProgress.completedLevels;

        for (let i = 1; i <= 5; i++) {
            const node = document.getElementById(`node-level-${i}`);
            const statusEl = document.getElementById(`status-level-${i}`);

            if (!node) continue;

            node.className = 'map-node';
            const isCompleted = completedLevels.includes(i);
            const isUnlocked = (i <= unlockedLvl);

            if (i === this.engine.newlyUnlockedLevel) {
                node.classList.add('node-unlocked', 'node-just-unlocked');
                if (statusEl) { statusEl.textContent = '🔓 NOUVEAU !'; statusEl.style.color = '#fbbf24'; }
            } else if (isCompleted) {
                node.classList.add('node-completed');
                if (statusEl) { statusEl.textContent = '✅ RÉUSSI'; statusEl.style.color = '#22c55e'; }
            } else if (isUnlocked) {
                node.classList.add('node-unlocked');
                if (statusEl) { statusEl.textContent = 'DISPO'; statusEl.style.color = '#ec4899'; }
            } else {
                node.classList.add('node-locked');
                if (statusEl) { statusEl.textContent = '🔒 VERROUILLÉ'; statusEl.style.color = '#94a3b8'; }
            }
        }
    }
}

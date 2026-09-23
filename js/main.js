/* ==========================================================================
   MAIN ENTRY POINT - LA LÉGENDE D'EL AGATHA (WEB VERSION)
   ========================================================================== */

window.addEventListener('load', () => {
    const engine = GameEngine.getInstance();

    // Start Screen Listeners
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        startScreen.addEventListener('click', () => {
            if (engine.stateMachine.currentStateName === STATES.START) engine.goToMenuWithFade();
        });
    }

    // Main Menu Listeners
    document.getElementById('btn-new-game').addEventListener('click', () => {
        audioManager.unlockAudio();
        saveManager.resetProgress(); // Réinitialise la progression à 0 pour une Nouvelle Partie !
        introManager.startIntro(engine); // Relance le prologue de cinématique !
    });

    document.getElementById('btn-continue').addEventListener('click', () => {
        if (!saveManager.hasSavedGame()) {
            return;
        }
        audioManager.unlockAudio();
        engine.stateMachine.setState(STATES.WORLDMAP);
    });

    document.getElementById('btn-episodes-menu').addEventListener('click', () => {
        audioManager.unlockAudio();
        engine.stateMachine.setState(STATES.EPISODES);
    });

    document.getElementById('btn-fullscreen').addEventListener('click', () => {
        audioManager.unlockAudio();
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.warn(err));
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    });

    document.getElementById('btn-options').addEventListener('click', () => {
        audioManager.unlockAudio();
        uiManager.optionsModal.classList.remove('hidden');
    });

    document.getElementById('btn-close-options').addEventListener('click', () => {
        uiManager.optionsModal.classList.add('hidden');
    });

    // World Map Node Click Listeners
    for (let i = 1; i <= 5; i++) {
        const node = document.getElementById(`node-level-${i}`);
        if (node) {
            node.addEventListener('click', () => {
                if (i <= saveManager.playerProgress.unlockedLevel) {
                    engine.startLevel(i);
                } else {
                    alert(`Le Niveau ${i} est verrouillé ! Termine le niveau précédent pour le débloquer.`);
                }
            });
        }
    }

    // Episode Cards Listeners
    document.getElementById('btn-play-ep1').addEventListener('click', () => {
        engine.stateMachine.setState(STATES.WORLDMAP);
    });

    document.getElementById('btn-back-menu-ep').addEventListener('click', () => {
        engine.stateMachine.setState(STATES.MENU);
    });

    document.getElementById('btn-back-episodes').addEventListener('click', () => {
        engine.stateMachine.setState(STATES.EPISODES);
    });

    document.getElementById('btn-back-menu-map').addEventListener('click', () => {
        engine.stateMachine.setState(STATES.MENU);
    });

    document.getElementById('btn-map-return').addEventListener('click', () => {
        engine.stateMachine.setState(STATES.WORLDMAP);
    });

    // Story Modal / Locked Modal Listeners (Bouton Fermer & Fond)
    const btnCloseStory = document.getElementById('btn-close-story');
    if (btnCloseStory) {
        btnCloseStory.addEventListener('click', (e) => {
            if (e) e.stopPropagation();
            uiManager.closeStoryModal();
        });
    }

    const storyModal = document.getElementById('story-modal');
    if (storyModal) {
        storyModal.addEventListener('click', (e) => {
            if (e.target === storyModal) {
                uiManager.closeStoryModal();
            }
        });
    }

    // Pause & Fullscreen Menu Listeners
    const btnPause = document.getElementById('btn-pause-toggle');
    const btnRpgPause = document.getElementById('btn-rpg-pause-toggle');
    if (btnPause) btnPause.addEventListener('click', () => engine.togglePause());
    if (btnRpgPause) btnRpgPause.addEventListener('click', () => engine.togglePause());

    const toggleFullscreen = () => {
        audioManager.unlockAudio();
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.warn(err));
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    const btnHudFs = document.getElementById('btn-hud-fullscreen');
    const btnRpgFs = document.getElementById('btn-rpg-fullscreen');
    if (btnHudFs) btnHudFs.addEventListener('click', toggleFullscreen);
    if (btnRpgFs) btnRpgFs.addEventListener('click', toggleFullscreen);

    document.getElementById('btn-resume-game').addEventListener('click', () => engine.togglePause());
    document.getElementById('btn-restart-game').addEventListener('click', (e) => {
        if (e) e.stopPropagation();
        audioManager.unlockAudio();
        engine.startLevel(engine.currentLevel || 1);
    });
    document.getElementById('btn-pause-options').addEventListener('click', () => uiManager.optionsModal.classList.remove('hidden'));
    document.getElementById('btn-quit-level').addEventListener('click', () => engine.stateMachine.setState(STATES.WORLDMAP));

    // Game Over & Victory Listeners (Bouton Réessayer)
    document.getElementById('btn-retry').addEventListener('click', (e) => {
        if (e) e.stopPropagation();
        audioManager.unlockAudio();
        engine.startLevel(engine.currentLevel || 1);
    });
    document.getElementById('btn-return-menu').addEventListener('click', () => engine.stateMachine.setState(STATES.MENU));

    // Outro / Crédits Listeners
    const btnOutroEp = document.getElementById('btn-outro-episodes');
    const btnSkipCredits = document.getElementById('btn-skip-credits');
    if (btnOutroEp) btnOutroEp.addEventListener('click', () => {
        audioManager.unlockAudio();
        engine.stateMachine.setState(STATES.EPISODES);
    });
    if (btnSkipCredits) btnSkipCredits.addEventListener('click', () => {
        audioManager.unlockAudio();
        engine.stateMachine.setState(STATES.MENU);
    });

    // Quiz Options Click Listeners
    document.getElementById('quiz-opt-1').addEventListener('click', () => uiManager.answerQuiz(0, engine.gameState, () => engine.triggerVictory()));
    document.getElementById('quiz-opt-2').addEventListener('click', () => uiManager.answerQuiz(1, engine.gameState, () => engine.triggerVictory()));
    document.getElementById('quiz-opt-3').addEventListener('click', () => uiManager.answerQuiz(2, engine.gameState, () => engine.triggerVictory()));

    // Volume Sliders
    document.getElementById('volume-bgm').addEventListener('input', (e) => {
        audioManager.setBgmVolume(parseFloat(e.target.value));
    });

    document.getElementById('volume-voices').addEventListener('input', (e) => {
        audioManager.setVoiceVolume(parseFloat(e.target.value));
    });

    // Start Engine Loop
    engine.start();
});

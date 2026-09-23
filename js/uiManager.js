/* ==========================================================================
   UI MANAGER & OBSERVER - LA LÉGENDE D'EL AGATHA
   ========================================================================== */

class UIManager {
    constructor() {
        if (UIManager.instance) {
            return UIManager.instance;
        }

        // Screens
        this.startScreen = document.getElementById('start-screen');
        this.menuScreen = document.getElementById('menu-screen');
        this.episodesScreen = document.getElementById('episodes-screen');
        this.worldmapScreen = document.getElementById('worldmap-screen');
        this.introScreen = document.getElementById('intro-screen');
        this.hudOverlay = document.getElementById('hud-overlay');
        this.victoryScreen = document.getElementById('victory-screen');
        this.gameoverScreen = document.getElementById('gameover-screen');
        this.outroScreen = document.getElementById('outro-screen');
        this.optionsModal = document.getElementById('options-modal');
        this.pauseModal = document.getElementById('pause-modal');
        this.storyModal = document.getElementById('story-modal');
        this.quizOverlay = document.getElementById('quiz-overlay');
        this.fadeOverlay = document.getElementById('fade-overlay');

        // HUD Elements
        this.hpBarFill = document.getElementById('hp-bar-fill');
        this.hpText = document.getElementById('hp-text');
        this.hudTimer = document.getElementById('hud-timer');
        this.hudNotes = document.getElementById('hud-notes');
        this.allyToast = document.getElementById('ally-notification');
        this.allyAvatar = document.getElementById('ally-avatar');
        this.allyMsg = document.getElementById('ally-msg');

        // Quiz elements
        this.quizQuestion = document.getElementById('quiz-question');
        this.quizOpt1Text = document.getElementById('quiz-opt-1-text');
        this.quizOpt2Text = document.getElementById('quiz-opt-2-text');
        this.quizOpt3Text = document.getElementById('quiz-opt-3-text');

        this.toastTimeout = null;
        this.activeQuizQuestions = [];
        this.currentQuizIndex = 0;

        UIManager.instance = this;
    }

    static getInstance() {
        if (!UIManager.instance) {
            UIManager.instance = new UIManager();
        }
        return UIManager.instance;
    }

    showToast(avatar, message) {
        if (this.allyAvatar) this.allyAvatar.textContent = avatar;
        if (this.allyMsg) this.allyMsg.textContent = message;
        if (this.allyToast) this.allyToast.classList.remove('hidden');

        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            if (this.allyToast) this.allyToast.classList.add('hidden');
        }, 4000);
    }

    updateHUD(player, timeRemaining, notesCollected, totalNotesNeeded, currentLevel) {
        if (!player) return;

        if (this.hpBarFill) this.hpBarFill.style.width = player.hp + '%';
        if (this.hpText) this.hpText.textContent = Math.round(player.hp) + '/100';
        
        if (this.hudTimer) {
            this.hudTimer.textContent = (currentLevel === 4) ? '♾️ BOSS' : Math.ceil(timeRemaining) + 's';
        }
        
        if (this.hudNotes) {
            if (currentLevel === 4) {
                const engine = GameEngine.getInstance();
                const boss = engine.gameState.enemies.find(e => e.isBoss);
                const bossHp = boss ? Math.round(boss.hp) : 0;
                this.hudNotes.textContent = `🗿 BOSS : ${bossHp}/100 PV`;
            } else if (currentLevel === 3) {
                this.hudNotes.textContent = `🚪 SURVIE : ESQUIVE !`;
            } else if (currentLevel === 2) {
                this.hudNotes.textContent = `📝 Q : ${this.currentQuizIndex + 1}/${this.activeQuizQuestions.length || 10}`;
            } else {
                this.hudNotes.textContent = `📝 ${notesCollected} / ${totalNotesNeeded}`;
            }
        }
    }

    updateEpisodesView() {
        const unlockedEp = saveManager ? saveManager.playerProgress.unlockedEpisode : 1;

        for (let ep = 2; ep <= 6; ep++) {
            const card = document.getElementById(`card-ep${ep}`);
            const title = document.getElementById(`title-ep${ep}`);
            const desc = document.getElementById(`desc-ep${ep}`);
            const boss = document.getElementById(`boss-ep${ep}`);
            const status = document.getElementById(`status-ep${ep}`);

            if (!card) continue;

            // Remove old onclick
            card.onclick = null;

            const data = episodeData[ep];
            if (ep <= unlockedEp) {
                card.classList.remove('locked');
                card.classList.add('active');
                if (title) title.textContent = data.title;
                if (desc) desc.textContent = data.desc;
                if (boss) boss.textContent = `Boss : ${data.boss}`;
                if (status) {
                    status.textContent = "DÉBLOQUÉ 🎉 (EN PRODUCTION 🚧)";
                    status.className = "ep-status unlocked";
                }

                // Check if button already exists
                let playBtn = card.querySelector('.btn-play-unlocked');
                if (!playBtn) {
                    playBtn = document.createElement('button');
                    playBtn.className = 'btn btn-primary btn-card btn-play-unlocked';
                    playBtn.textContent = (ep === 2) ? "DÉCOUVRIR L'ÉPISODE 🚗 (EN PRODUCTION)" : "VOIR LE STATUT 📖";
                    playBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.openStoryModal(ep);
                    });
                    card.appendChild(playBtn);
                }

                // Clicking the unlocked card also opens the modal
                card.onclick = () => {
                    this.openStoryModal(ep);
                };
            } else {
                card.classList.add('locked');
                card.classList.remove('active');
                if (title) title.textContent = "???";
                if (desc) desc.textContent = "???";
                if (boss) boss.textContent = "Boss: ???";
                if (status) {
                    status.textContent = "VERROUILLÉ";
                    status.className = "ep-status locked-text";
                }
                const existingBtn = card.querySelector('.btn-play-unlocked');
                if (existingBtn) existingBtn.remove();

                // Clicking on a locked card opens the locked warning (no spoilers!)
                card.onclick = () => {
                    this.openLockedEpisodeModal(ep);
                };
            }
        }
    }

    openLockedEpisodeModal(episodeNum) {
        const titleEl = document.getElementById('story-title');
        const bodyEl = document.getElementById('story-body');

        if (titleEl) titleEl.textContent = `🔒 ÉPISODE ${episodeNum} VERROUILLÉ`;
        if (bodyEl) {
            bodyEl.innerHTML = `
                <div style="text-align: center; padding: 15px 10px;">
                    <div style="font-size: 3.2rem; margin-bottom: 12px;">🚫</div>
                    <p style="font-family: 'Mayan', sans-serif; font-size: 1.35rem; color: #fbbf24; font-weight: bold; line-height: 1.5; margin-bottom: 12px;">
                        Termine le niveau d'avant pour pouvoir accéder à ce niveau !
                    </p>
                    <p style="font-family: 'Mayan', sans-serif; font-size: 1.05rem; color: #cbd5e1; line-height: 1.4;">
                        Affronte et terrasse les boss des épreuves précédentes pour débloquer la suite de la légende d'El Agatha.
                    </p>
                </div>
            `;
        }

        if (this.storyModal) this.storyModal.classList.remove('hidden');
    }

    openStoryModal(episodeNum) {
        const unlockedEp = saveManager ? saveManager.playerProgress.unlockedEpisode : 1;
        if (episodeNum > unlockedEp) {
            this.openLockedEpisodeModal(episodeNum);
            return;
        }

        const story = episodeStories[episodeNum];
        if (!story) return;

        const titleEl = document.getElementById('story-title');
        const bodyEl = document.getElementById('story-body');

        if (titleEl) titleEl.textContent = story.title;
        if (bodyEl) {
            bodyEl.innerHTML = `
                <div style="background: rgba(245, 158, 11, 0.15); border: 2px solid #fbbf24; border-radius: 10px; padding: 12px 16px; margin-bottom: 18px; text-align: center;">
                    <span style="font-family: 'Chiringuito Espacial', cursive, sans-serif; font-size: 1.2rem; color: #fbbf24; letter-spacing: 1px;">
                        🚧 NIVEAU EN COURS DE PRODUCTION / MAINTENANCE 🚧
                    </span>
                    <p style="font-family: 'Mayan', sans-serif; font-size: 0.95rem; color: #cbd5e1; margin-top: 6px;">
                        Félicitations pour avoir terminé l'Épisode 1 ! L'Épisode 2 est actuellement en plein développement dans l'arène !
                    </p>
                </div>
                <div style="padding: 12px; background: rgba(15, 23, 42, 0.85); border: 1.5px dashed #38bdf8; border-radius: 8px; text-align: center;">
                    <p style="font-family: 'Mayan', sans-serif; font-size: 1.05rem; color: #38bdf8; font-weight: bold; margin: 0;">
                        🚗 Prépare-toi... El Moniteur et son créneau infernal arrivent très bientôt !
                    </p>
                </div>
            `;
        }

        if (this.storyModal) this.storyModal.classList.remove('hidden');
    }

    closeStoryModal() {
        if (this.storyModal) this.storyModal.classList.add('hidden');
    }

    prepareShuffledQuiz() {
        this.activeQuizQuestions = [...quizQuestions].sort(() => Math.random() - 0.5);
        this.currentQuizIndex = 0;
        this.loadCurrentQuizQuestion();
    }

    loadCurrentQuizQuestion() {
        if (!this.activeQuizQuestions || this.currentQuizIndex >= this.activeQuizQuestions.length) return;
        const qData = this.activeQuizQuestions[this.currentQuizIndex];
        if (this.quizQuestion) this.quizQuestion.textContent = qData.q;
        if (this.quizOpt1Text) this.quizOpt1Text.textContent = qData.opts[0];
        if (this.quizOpt2Text) this.quizOpt2Text.textContent = qData.opts[1];
        if (this.quizOpt3Text) this.quizOpt3Text.textContent = qData.opts[2];
    }

    showQuizOverlay() {
        if (this.quizOverlay) this.quizOverlay.classList.remove('hidden');
    }

    hideQuizOverlay() {
        if (this.quizOverlay) this.quizOverlay.classList.add('hidden');
    }

    answerQuiz(optionIndex, gameState, onVictoryCallback) {
        if (this.currentQuizIndex >= this.activeQuizQuestions.length) return;
        const currentQ = this.activeQuizQuestions[this.currentQuizIndex];

        if (optionIndex === currentQ.correct) {
            this.showToast("✅ BONNE RÉPONSE !", "Excellent réflexe ! Prochaine question !");
            this.currentQuizIndex++;
            if (this.currentQuizIndex >= this.activeQuizQuestions.length) {
                if (onVictoryCallback) onVictoryCallback();
            } else {
                this.loadCurrentQuizQuestion();
            }
        } else {
            gameState.player.takeDamage(12, null, (a, m) => this.showToast(a, m));
            this.showToast("❌ MAUVAISE RÉPONSE !", "Attention ! Le professeur t'a lancé une craie ! (-12 PV)");
        }
    }

    updateMenuButtons() {
        const btnContinue = document.getElementById('btn-continue');
        if (!btnContinue) return;

        const canContinue = typeof saveManager !== 'undefined' && saveManager.hasSavedGame();
        if (canContinue) {
            btnContinue.disabled = false;
            btnContinue.classList.remove('btn-disabled');
            btnContinue.title = "Reprendre votre aventure";
        } else {
            btnContinue.disabled = true;
            btnContinue.classList.add('btn-disabled');
            btnContinue.title = "Aucune partie enregistrée. Clique sur 'NOUVELLE PARTIE' !";
        }
    }

    showScreen(screenName) {
        const rpgOverlay = document.getElementById('rpg-battle-overlay');
        const screens = [
            this.startScreen, this.menuScreen, this.episodesScreen, 
            this.worldmapScreen, this.introScreen, this.hudOverlay, 
            this.victoryScreen, this.gameoverScreen, rpgOverlay, this.outroScreen
        ];

        screens.forEach(s => {
            if (s) {
                s.classList.remove('active');
                s.classList.add('hidden');
            }
        });

        if (screenName === STATES.MENU) {
            this.updateMenuButtons();
        }

        if (screenName === STATES.EPISODES) {
            this.updateEpisodesView();
        }

        const isLevel5 = (typeof GameEngine !== 'undefined' && GameEngine.getInstance() && GameEngine.getInstance().currentLevel === 5);

        const targetMap = {
            [STATES.START]: this.startScreen,
            [STATES.MENU]: this.menuScreen,
            [STATES.EPISODES]: this.episodesScreen,
            [STATES.WORLDMAP]: this.worldmapScreen,
            [STATES.INTRO]: this.introScreen,
            [STATES.GAME]: isLevel5 ? rpgOverlay : this.hudOverlay,
            [STATES.VICTORY]: this.victoryScreen,
            [STATES.GAMEOVER]: this.gameoverScreen,
            [STATES.OUTRO]: this.outroScreen
        };

        const target = targetMap[screenName];
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }
    }
}

const uiManager = new UIManager();

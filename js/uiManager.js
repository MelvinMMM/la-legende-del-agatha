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

        // Screens Épisode 2 (Three.js 3D Driving)
        this.ep2IntroScreen = document.getElementById('ep2-intro-screen');
        this.ep2MapScreen = document.getElementById('ep2-map-screen');
        this.ep2Overlay = document.getElementById('episode2-overlay');
        this.ep2VictoryScreen = document.getElementById('ep2-victory-screen');
        this.ep2GameoverScreen = document.getElementById('ep2-gameover-screen');
        this.ep2CurrentIntroStep = 0;

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
            const isAvailable = (ep <= unlockedEp) || (ep === 2);

            if (isAvailable) {
                card.classList.remove('locked');
                card.classList.add('active');
                if (title) title.textContent = data.title;
                if (desc) desc.textContent = data.desc;
                if (boss) boss.textContent = `Boss : ${data.boss}`;
                if (status) {
                    if (ep === 2) {
                        status.textContent = "DÉBLOQUÉ 🎉 - DISPONIBLE ! 🚗✨";
                        status.className = "ep-status unlocked ep2-highlight-badge";
                    } else {
                        status.textContent = "DÉBLOQUÉ 🎉 (EN PRODUCTION 🚧)";
                        status.className = "ep-status unlocked";
                    }
                }

                // Check if button already exists
                let playBtn = card.querySelector('.btn-play-unlocked');
                if (!playBtn) {
                    playBtn = document.createElement('button');
                    playBtn.className = 'btn btn-primary btn-card btn-play-unlocked';
                    playBtn.textContent = (ep === 2) ? "JOUER À L'ÉPISODE 2 🏎️💨" : "VOIR LE STATUT 📖";
                    playBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.openStoryModal(ep);
                    });
                    card.appendChild(playBtn);
                } else {
                    playBtn.textContent = (ep === 2) ? "JOUER À L'ÉPISODE 2 🏎️💨" : "VOIR LE STATUT 📖";
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
        const isAvailable = (episodeNum <= unlockedEp) || (episodeNum === 2);
        if (!isAvailable) {
            this.openLockedEpisodeModal(episodeNum);
            return;
        }

        const story = episodeStories[episodeNum];
        if (!story) return;

        const titleEl = document.getElementById('story-title');
        const bodyEl = document.getElementById('story-body');

        if (titleEl) titleEl.textContent = story.title;
        if (bodyEl) {
            if (episodeNum === 2) {
                bodyEl.innerHTML = `
                    <div style="background: rgba(56, 189, 248, 0.15); border: 2px solid #38bdf8; border-radius: 10px; padding: 14px 18px; margin-bottom: 16px; text-align: left;">
                        <span style="font-family: 'Chiringuito Espacial', cursive, sans-serif; font-size: 1.25rem; color: #38bdf8; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                            🚗 ÉPISODE 2 : EL PERMISO DE CONDUCIR
                        </span>
                        <p style="font-family: 'Mayan', sans-serif; font-size: 0.95rem; color: #e2e8f0; line-height: 1.5; margin: 0 0 10px 0;">
                            L’arène n’est plus une cage métallique : c’est une voiture banale, grise, aux sièges qui sentent l'angoisse.
                            Sur le siège passager trône <strong>El Moniteur</strong>, silhouette sévère, lunettes de fer et carnet de notes à la main.
                        </p>
                        <div style="background: rgba(15, 23, 42, 0.85); border-radius: 8px; padding: 10px; font-family: 'Mayan', sans-serif; font-size: 0.9rem; color: #fbbf24;">
                            <div>⛰️ <strong>Round 1 :</strong> Le démarrage en côte (Point de patinage)</div>
                            <div>🔄 <strong>Round 2 :</strong> Le rond-point des enfers (Asphalt & Clignotants)</div>
                            <div>🅿️ <strong>Round 3 :</strong> Le créneau du Boss (La soumission d'El Moniteur !)</div>
                        </div>
                    </div>
                    <button id="btn-modal-start-ep2" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 1.15rem; font-weight: bold; background: linear-gradient(135deg, #10b981, #059669); border-color: #34d399; box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);">
                        LANCER L'ÉPISODE 2 🚗💨
                    </button>
                `;

                // Wire launch button
                setTimeout(() => {
                    const btnStart = document.getElementById('btn-modal-start-ep2');
                    if (btnStart) {
                        btnStart.onclick = () => {
                            this.closeStoryModal();
                            const engine = GameEngine.getInstance();
                            if (engine && engine.stateMachine) {
                                engine.stateMachine.setState(STATES.EPISODE2_INTRO);
                            }
                        };
                    }
                }, 50);
            } else {
                bodyEl.innerHTML = `
                    <div style="background: rgba(245, 158, 11, 0.15); border: 2px solid #fbbf24; border-radius: 10px; padding: 12px 16px; margin-bottom: 18px; text-align: center;">
                        <span style="font-family: 'Chiringuito Espacial', cursive, sans-serif; font-size: 1.2rem; color: #fbbf24; letter-spacing: 1px;">
                            🚧 NIVEAU EN COURS DE PRODUCTION / MAINTENANCE 🚧
                        </span>
                        <p style="font-family: 'Mayan', sans-serif; font-size: 0.95rem; color: #cbd5e1; margin-top: 6px;">
                            Cet épisode sera disponible prochainement dans la suite de l'aventure !
                        </p>
                    </div>
                `;
            }
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

    // ==========================================
    // ÉPISODE 2 : GESTION DE LA CARTE DES ROUNDS
    // ==========================================
    renderEp2MapUI() {
        const unlockedRound = (saveManager && saveManager.playerProgress.ep2UnlockedRound) ? saveManager.playerProgress.ep2UnlockedRound : 1;
        const completedRounds = (saveManager && saveManager.playerProgress.ep2CompletedRounds) ? saveManager.playerProgress.ep2CompletedRounds : [];

        for (let r = 1; r <= 3; r++) {
            const card = document.getElementById(`ep2-node-round-${r}`);
            const statusEl = document.getElementById(`ep2-status-round-${r}`);
            const btnPlay = document.getElementById(`btn-play-round-${r}`);

            if (!card) continue;

            const isCompleted = completedRounds.includes(r);
            const isUnlocked = (r <= unlockedRound);

            card.classList.remove('round-unlocked', 'round-completed', 'round-locked');

            if (isCompleted) {
                card.classList.add('round-completed');
                if (statusEl) { statusEl.textContent = '✅ RÉUSSI'; statusEl.className = 'round-status status-completed'; }
                if (btnPlay) {
                    btnPlay.disabled = false;
                    btnPlay.className = 'btn btn-secondary btn-round';
                    btnPlay.textContent = 'REJOUER LE ROUND 🔄';
                    btnPlay.onclick = () => this.startEp2Game(r);
                }
            } else if (isUnlocked) {
                card.classList.add('round-unlocked');
                if (statusEl) { statusEl.textContent = 'DISPO'; statusEl.className = 'round-status status-unlocked'; }
                if (btnPlay) {
                    btnPlay.disabled = false;
                    btnPlay.className = 'btn btn-primary btn-round';
                    btnPlay.textContent = (r === 3) ? 'DÉFIER LE BOSS 👑' : 'DÉMARRER LE ROUND 🥊';
                    btnPlay.onclick = () => this.startEp2Game(r);
                }
            } else {
                card.classList.add('round-locked');
                if (statusEl) { statusEl.textContent = '🔒 VERROUILLÉ'; statusEl.className = 'round-status status-locked'; }
                if (btnPlay) {
                    btnPlay.disabled = true;
                    btnPlay.className = 'btn btn-disabled btn-round';
                    btnPlay.textContent = 'VERROUILLÉ 🔒';
                    btnPlay.onclick = null;
                }
            }
        }
    }

    startEp2Game(roundNum) {
        const engine = (typeof GameEngine !== 'undefined') ? GameEngine.getInstance() : null;
        if (engine && engine.stateMachine) {
            engine.stateMachine.setState(STATES.EPISODE2_GAME);
        }
        if (typeof drivingEngine3D !== 'undefined') {
            drivingEngine3D.startRound(roundNum);
        }
    }

    // ==========================================
    // ÉPISODE 2 : PROLOGUE & DIALOGUES
    // ==========================================
    startEp2Intro() {
        this.ep2CurrentIntroStep = 0;
        this.playEp2IntroStep(0);

        const btnNext = document.getElementById('btn-ep2-next-dialog');
        const btnSkip = document.getElementById('btn-ep2-skip-intro');

        if (btnNext) {
            btnNext.onclick = () => {
                this.ep2CurrentIntroStep++;
                if (this.ep2CurrentIntroStep >= episode2IntroDialogue.length) {
                    this.finishEp2Intro();
                } else {
                    this.playEp2IntroStep(this.ep2CurrentIntroStep);
                }
            };
        }

        if (btnSkip) {
            btnSkip.onclick = () => this.finishEp2Intro();
        }
    }

    playEp2IntroStep(index) {
        if (!episode2IntroDialogue || index >= episode2IntroDialogue.length) return;
        const step = episode2IntroDialogue[index];

        const textEl = document.getElementById('ep2-intro-text');
        const speakerEl = document.getElementById('ep2-intro-speaker');
        const imgEl = document.getElementById('ep2-intro-image');
        const btnNext = document.getElementById('btn-ep2-next-dialog');

        if (textEl) textEl.textContent = step.text;
        if (speakerEl) speakerEl.textContent = step.speaker;
        if (imgEl && step.img) imgEl.src = step.img;

        if (btnNext) {
            if (index === episode2IntroDialogue.length - 1) {
                btnNext.textContent = "EN ROUTE VERS L'ÉPREUVE 🏁";
                btnNext.style.background = "linear-gradient(135deg, #10b981, #059669)";
            } else {
                btnNext.textContent = "Suivant ▶️";
                btnNext.style.background = "";
            }
        }
    }

    finishEp2Intro() {
        const engine = (typeof GameEngine !== 'undefined') ? GameEngine.getInstance() : null;
        if (engine && engine.stateMachine) {
            engine.stateMachine.setState(STATES.EPISODE2_MAP);
        }
    }

    showScreen(screenName) {
        const rpgOverlay = document.getElementById('rpg-battle-overlay');
        const screens = [
            this.startScreen, this.menuScreen, this.episodesScreen, 
            this.worldmapScreen, this.introScreen, this.hudOverlay, 
            this.victoryScreen, this.gameoverScreen, rpgOverlay, this.outroScreen,
            this.ep2IntroScreen, this.ep2MapScreen, this.ep2Overlay,
            this.ep2VictoryScreen, this.ep2GameoverScreen
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

        if (screenName === STATES.EPISODE2_MAP) {
            this.renderEp2MapUI();
        }

        if (screenName === STATES.EPISODE2_INTRO) {
            this.startEp2Intro();
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
            [STATES.OUTRO]: this.outroScreen,
            [STATES.EPISODE2_INTRO]: this.ep2IntroScreen,
            [STATES.EPISODE2_MAP]: this.ep2MapScreen,
            [STATES.EPISODE2_GAME]: this.ep2Overlay,
            [STATES.EPISODE2_VICTORY]: this.ep2VictoryScreen,
            [STATES.EPISODE2_GAMEOVER]: this.ep2GameoverScreen
        };

        const target = targetMap[screenName];
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }
    }
}

const uiManager = new UIManager();

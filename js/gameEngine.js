/* ==========================================================================
   GAME ENGINE (SINGLETON PATTERN & MAIN CONTROLLER) - LA LÉGENDE D'EL AGATHA
   ========================================================================== */

class GameEngine {
    constructor() {
        if (GameEngine.instance) {
            return GameEngine.instance;
        }

        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.currentLevel = 1;
        this.newlyUnlockedLevel = null;
        this.isPaused = false;
        this.lastTime = 0;

        this.keys = {
            ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
            KeyW: false, KeyS: false, KeyA: false, KeyD: false
        };

        this.gameState = {
            player: null,
            enemies: [],
            projectiles: [],
            notes: [],
            powerups: [],
            timeRemaining: 60,
            notesCollected: 0,
            totalNotesNeeded: 5,
            slowMoTimer: 0,
            powerupSpawnTimer: 8.0
        };

        this.projectiles = [];
        this.assets = { images: {}, audio: {} };
        this.stateMachine = new GameStateMachine(this);

        this.initCanvas();
        this.initInputs();
        this.loadAssets(() => {
            console.log("Assets Web chargés avec succès !");
        });

        GameEngine.instance = this;
    }

    static getInstance() {
        if (!GameEngine.instance) {
            GameEngine.instance = new GameEngine();
        }
        return GameEngine.instance;
    }

    initCanvas() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.ctx.imageSmoothingEnabled = false;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    initInputs() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyP' || e.code === 'KeyM') {
                if (this.stateMachine.currentStateName === STATES.GAME || this.isPaused) {
                    this.togglePause();
                    return;
                }
            }

            if (this.stateMachine.currentStateName === STATES.START && (e.code === 'Enter' || e.code === 'Space')) {
                this.goToMenuWithFade();
            }

            if (this.stateMachine.currentStateName === STATES.INTRO && (e.code === 'Enter' || e.code === 'Space')) {
                if (window.introManager) introManager.finishIntro();
            }

            if (this.stateMachine.currentStateName === STATES.GAME && this.currentLevel === 2) {
                if (e.code === 'Digit1' || e.code === 'Numpad1') uiManager.answerQuiz(0, this.gameState, () => this.triggerVictory());
                if (e.code === 'Digit2' || e.code === 'Numpad2') uiManager.answerQuiz(1, this.gameState, () => this.triggerVictory());
                if (e.code === 'Digit3' || e.code === 'Numpad3') uiManager.answerQuiz(2, this.gameState, () => this.triggerVictory());
            }

            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = false;
            }
        });
    }

    loadAssets(onComplete) {
        const sources = {
            ringBg: 'Assets/E1/bg1.jpg',
            classBg: 'Assets/E1/bg2.jpg',
            lockersBg: 'Assets/E1/bg3.jpg',
            zbrushBg: 'Assets/E1/bg4.jpg',
            ringBg5: 'Assets/E1/bg5.jpg',
            casierClosed: 'Assets/casier_closed.png',
            casierOpen: 'Assets/casier_open.png',
            zbrushLogo: 'Assets/zbrush_logo.png',
            bossExam: 'Assets/boss_exam.png',
            mapBg: 'Assets/map_bg.jpg',
            agatha0: 'Assets/player/agatha0.png',
            agatha1: 'Assets/player/agatha1.png',
            agatha2: 'Assets/player/agatha2.png',
            agatha3: 'Assets/player/agatha3.png',
            agathaAttack: 'Assets/player/agathaattack.png',
            stylo: 'Assets/stylo.png',
            equere: 'Assets/equere.png',
            note: 'Assets/note.png',
            scene1: 'Assets/Image intro/scene 1.jpg',
            scene2: 'Assets/Image intro/scene 2.jpg',
            scene3: 'Assets/Image intro/scene 3.jpg',
            scene4: 'Assets/Image intro/scene 4.jpg',
            scene5: 'Assets/Image intro/scene 5.jpg',
            scene6: 'Assets/Image intro/scene 6.jpg',
            scene7: 'Assets/Image intro/scene 7.jpg',
            scene8: 'Assets/Image intro/scene 8.jpg',
            scene9: 'Assets/Image intro/scene 9.jpg',
            scene10: 'Assets/Image intro/scene 10.jpg'
        };

        let total = Object.keys(sources).length;
        let loaded = 0;

        for (let key in sources) {
            const img = new Image();
            img.src = sources[key];
            img.onload = () => {
                loaded++;
                if (loaded >= total && onComplete) onComplete();
            };
            img.onerror = () => {
                loaded++;
                if (loaded >= total && onComplete) onComplete();
            };
            this.assets.images[key] = img;
        }
    }

    goToMenuWithFade() {
        audioManager.unlockAudio();
        if (uiManager.fadeOverlay) uiManager.fadeOverlay.classList.add('active');

        setTimeout(() => {
            this.stateMachine.setState(STATES.MENU);
            setTimeout(() => {
                if (uiManager.fadeOverlay) uiManager.fadeOverlay.classList.remove('active');
            }, 150);
        }, 450);
    }

    startLevel(levelNum) {
        this.currentLevel = parseInt(levelNum) || 1;
        this.isPaused = false;
        if (uiManager.pauseModal) uiManager.pauseModal.classList.add('hidden');
        if (uiManager.optionsModal) uiManager.optionsModal.classList.add('hidden');

        for (let k in this.keys) this.keys[k] = false;

        this.gameState.player = new Player(this.canvas.width, this.canvas.height, this.assets);
        this.gameState.player.invulnerableTimer = 1.5;

        this.projectiles = [];
        this.gameState.enemies = [];
        this.gameState.notes = [];
        this.gameState.powerups = [];
        this.gameState.timeRemaining = 60;
        this.gameState.notesCollected = 0;
        this.gameState.slowMoTimer = 0;
        this.gameState.powerupSpawnTimer = (this.currentLevel === 4) ? 3.0 : 8.0;

        const strategy = LevelStrategyFactory.getStrategy(this.currentLevel);
        strategy.init(this.gameState, this.canvas.width, this.canvas.height, uiManager);

        this.stateMachine.setState(STATES.GAME);
        uiManager.updateHUD(this.gameState.player, this.gameState.timeRemaining, this.gameState.notesCollected, this.gameState.totalNotesNeeded, this.currentLevel);
    }

    togglePause() {
        if (this.stateMachine.currentStateName !== STATES.GAME && !this.isPaused) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            uiManager.pauseModal.classList.remove('hidden');
            audioManager.pauseBgm();
        } else {
            uiManager.pauseModal.classList.add('hidden');
            audioManager.resumeBgm();
        }
    }

    triggerVictory() {
        uiManager.hideQuizOverlay();
        const rpgOverlay = document.getElementById('rpg-battle-overlay');
        if (rpgOverlay) rpgOverlay.classList.add('hidden');

        if (this.currentLevel === 5) {
            saveManager.completeLevel(5);
            uiManager.updateEpisodesView();
            audioManager.playBgm(AUDIO_TRACKS.OUTRO);
            this.stateMachine.setState(STATES.OUTRO);
            return;
        }

        const hpVal = Math.round(this.gameState.player.hp);
        document.getElementById('summary-hp').textContent = hpVal + '/100';
        document.getElementById('summary-notes').textContent = ((this.currentLevel === 4) ? 'Boss Vaincu !' : (this.currentLevel === 3 ? 'Survie Réussie !' : (this.gameState.notesCollected + '/' + this.gameState.totalNotesNeeded)));

        saveManager.completeLevel(this.currentLevel);
        this.stateMachine.setState(STATES.VICTORY);
    }

    triggerGameOver() {
        uiManager.hideQuizOverlay();
        const rpgOverlay = document.getElementById('rpg-battle-overlay');
        if (rpgOverlay) rpgOverlay.classList.add('hidden');
        this.stateMachine.setState(STATES.GAMEOVER);
    }

    update(dt) {
        if (this.stateMachine.currentStateName !== STATES.GAME || this.isPaused) return;

        // Pas de timer pour les Boss Niveaux 4 & 5
        if (this.currentLevel < 4) {
            this.gameState.timeRemaining -= dt;
            if (this.gameState.timeRemaining <= 0) {
                this.gameState.timeRemaining = 0;
                if (this.currentLevel === 3) {
                    this.triggerVictory();
                } else {
                    this.triggerGameOver();
                }
                return;
            }
        }

        // Mode RPG Tour par Tour : la logique est gérée par RPGBattleManager
        if (this.currentLevel === 5) return;

        if (this.gameState.slowMoTimer > 0) this.gameState.slowMoTimer -= dt;
        const isSlowMo = this.gameState.slowMoTimer > 0;

        this.gameState.player.update(dt, this.keys);

        // Power-ups and Weapon spawns
        this.gameState.powerupSpawnTimer -= dt;
        if (this.gameState.powerupSpawnTimer <= 0) {
            this.gameState.powerupSpawnTimer = (this.currentLevel === 4) ? 4.0 : 9.0;
            const types = (this.currentLevel === 4) ? ['weapon', 'weapon', 'shield', 'lucie'] : ['shield', 'lucie'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            const px = 120 + Math.random() * (this.canvas.width - 240);
            const py = 220 + Math.random() * (this.canvas.height - 320);
            this.gameState.powerups.push(new PowerUp(randomType, px, py));

            if (randomType === 'weapon') {
                uiManager.showToast("⚡ Munition d'Attaque", "Ramasse le bonus ⚡ pour lancer un tir sur le Logo ZBrush !");
            } else if (randomType === 'lucie') {
                uiManager.showToast("📣 Lucie", "Boost de Lucie disponible !");
            } else {
                uiManager.showToast("🥊 Melvin", "Bouclier de Melvin disponible !");
            }
        }

        this.gameState.enemies.forEach(e => e.update(dt, isSlowMo, this.projectiles, this.gameState.player));

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            if (proj instanceof PlayerAttackProjectile) {
                const boss = this.gameState.enemies.find(e => e.isBoss);
                if (proj.update(dt, boss)) {
                    this.projectiles.splice(i, 1);
                }
            } else {
                if (proj.update(dt, isSlowMo, this.gameState.player)) {
                    this.projectiles.splice(i, 1);
                }
            }
        }

        if (this.currentLevel === 1) {
            this.gameState.notes.forEach(n => n.update(dt));

            for (let i = this.gameState.notes.length - 1; i >= 0; i--) {
                const note = this.gameState.notes[i];
                const dist = Math.hypot(
                    (this.gameState.player.x + 30) - (note.x + 18),
                    (this.gameState.player.y + 35) - (note.y + 18)
                );
                if (dist < 40) {
                    this.gameState.notes.splice(i, 1);
                    this.gameState.notesCollected++;
                    uiManager.updateHUD(this.gameState.player, this.gameState.timeRemaining, this.gameState.notesCollected, this.gameState.totalNotesNeeded, this.currentLevel);

                    if (this.gameState.notesCollected >= this.gameState.totalNotesNeeded) {
                        this.triggerVictory();
                        return;
                    } else {
                        this.gameState.notes.push(new NoteCollectible(this.canvas.width, this.canvas.height));
                        uiManager.showToast("📝 NOTE RAMASSÉE", `Note ${this.gameState.notesCollected}/${this.gameState.totalNotesNeeded} ! En avant pour la suivante !`);
                    }
                }
            }
        }

        for (let i = this.gameState.powerups.length - 1; i >= 0; i--) {
            const p = this.gameState.powerups[i];
            if (p.update(dt)) {
                this.gameState.powerups.splice(i, 1);
                continue;
            }

            const dist = Math.hypot(
                (this.gameState.player.x + 30) - (p.x + 20),
                (this.gameState.player.y + 35) - (p.y + 20)
            );

            if (dist < 45) {
                if (p.type === 'weapon') {
                    const boss = this.gameState.enemies.find(e => e.isBoss);
                    if (boss) {
                        const targetX = boss.x + boss.width / 2;
                        const targetY = boss.y + boss.height / 2;
                        this.projectiles.push(new PlayerAttackProjectile(this.gameState.player.x + 30, this.gameState.player.y + 35, targetX, targetY));
                    }
                } else if (p.type === 'shield') {
                    this.gameState.player.shieldHits = 2;
                    uiManager.showToast("🥊 Melvin", "Bouclier de Melvin activé ! (2 chocs absorbés)");
                } else if (p.type === 'lucie') {
                    this.gameState.player.hp = Math.min(100, this.gameState.player.hp + 25);
                    this.gameState.player.speedBuffTimer = 6.0;
                    uiManager.showToast("📣 Lucie", "Boost de Lucie activé ! (Vitesse Boostée + Soins)");
                }
                this.gameState.powerups.splice(i, 1);
            }
        }

        uiManager.updateHUD(this.gameState.player, this.gameState.timeRemaining, this.gameState.notesCollected, this.gameState.totalNotesNeeded, this.currentLevel);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.stateMachine.currentStateName === STATES.WORLDMAP) {
            const mapBg = this.assets.images.mapBg;
            if (mapBg) {
                this.ctx.drawImage(mapBg, 0, 0, this.canvas.width, this.canvas.height);
            } else {
                this.ctx.fillStyle = '#0f172a';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
            return;
        }

        const strategy = LevelStrategyFactory.getStrategy(this.currentLevel);
        const bgImg = strategy.getBackgroundImage(this.assets);

        if (bgImg) {
            this.ctx.drawImage(bgImg, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = '#0f172a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.ctx.fillStyle = 'rgba(5, 3, 10, 0.25)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.stateMachine.currentStateName === STATES.GAME) {
            if (this.currentLevel === 5) return; // Mode RPG plein écran
            if (strategy.hasNotes()) {
                this.gameState.notes.forEach(n => n.draw(this.ctx, this.assets));
            }
            this.gameState.powerups.forEach(p => p.draw(this.ctx));
            this.gameState.enemies.forEach(e => e.draw(this.ctx, this.assets));
            this.projectiles.forEach(p => p.draw(this.ctx));
            if (this.gameState.player) this.gameState.player.draw(this.ctx);
        }
    }

    start() {
        this.stateMachine.setState(STATES.START);

        const loop = (timestamp) => {
            if (!this.lastTime) this.lastTime = timestamp;
            const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
            this.lastTime = timestamp;

            this.update(dt);
            this.render();

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}

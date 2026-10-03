/* ==========================================================================
   RPG BATTLE MANAGER (NIVEAU 5 - TOUR PAR TOUR) - LA LÉGENDE D'EL AGATHA
   ========================================================================== */

class RPGBattleManager {
    constructor() {
        if (RPGBattleManager.instance) {
            return RPGBattleManager.instance;
        }

        this.overlay = document.getElementById('rpg-battle-overlay');
        
        // UI Elements
        this.agathaHpBar = document.getElementById('rpg-agatha-hp');
        this.agathaHpText = document.getElementById('rpg-agatha-hp-text');
        this.agathaEndBar = document.getElementById('rpg-agatha-end');
        this.agathaEndText = document.getElementById('rpg-agatha-end-text');
        this.agathaBuffs = document.getElementById('rpg-agatha-buffs');

        this.bossName = document.getElementById('rpg-boss-name');
        this.bossHpBar = document.getElementById('rpg-boss-hp');
        this.bossHpText = document.getElementById('rpg-boss-hp-text');
        this.bossStatus = document.getElementById('rpg-boss-status');
        this.stageTag = document.getElementById('rpg-stage-tag');

        this.agathaImg = document.getElementById('rpg-agatha-img');
        this.bossImg = document.getElementById('rpg-boss-img');
        this.logText = document.getElementById('rpg-log-text');

        this.isProcessingTurn = false;

        this.stages = [
            { name: "📁 EL PROYECTO DE FIN DE ESTUDIOS", hp: 100, maxHp: 100, speed: 20, atk: 14 },
            { name: "🎬 EL RENDER Y LOS SHOWREELS", hp: 120, maxHp: 120, speed: 28, atk: 18 },
            { name: "💻 LA PRUEBA TÉCNICA PRÁCTICA", hp: 140, maxHp: 140, speed: 34, atk: 22 },
            { name: "🗣️ EL GRAN ORAL", hp: 160, maxHp: 160, speed: 15, atk: 28 },
            { name: "📜 LOS EXÁMENES FINALES", hp: 220, maxHp: 220, speed: 38, atk: 32 }
        ];

        this.currentStageIndex = 0;
        this.agatha = {
            hp: 200,
            maxHp: 200,
            endurance: 200,
            maxEndurance: 200,
            speed: 25,
            atkBuffTurns: 0,
            dodgeBuffTurns: 0
        };

        this.currentBoss = null;
        this.initButtons();

        RPGBattleManager.instance = this;
    }

    static getInstance() {
        if (!RPGBattleManager.instance) {
            RPGBattleManager.instance = new RPGBattleManager();
        }
        return RPGBattleManager.instance;
    }

    initButtons() {
        // Attaques
        const btnPuno = document.getElementById('btn-rpg-puno');
        const btnPlancha = document.getElementById('btn-rpg-plancha');
        const btnSuplex = document.getElementById('btn-rpg-suplex');

        // Soutien
        const btnMelvin = document.getElementById('btn-rpg-melvin');
        const btnLucie = document.getElementById('btn-rpg-lucie');

        if (btnPuno) btnPuno.addEventListener('click', () => this.handlePlayerAction('puno'));
        if (btnPlancha) btnPlancha.addEventListener('click', () => this.handlePlayerAction('plancha'));
        if (btnSuplex) btnSuplex.addEventListener('click', () => this.handlePlayerAction('suplex'));
        if (btnMelvin) btnMelvin.addEventListener('click', () => this.handlePlayerAction('melvin'));
        if (btnLucie) btnLucie.addEventListener('click', () => this.handlePlayerAction('lucie'));
    }

    startBattle() {
        this.agatha.hp = 200;
        this.agatha.maxHp = 200;
        this.agatha.endurance = 200;
        this.agatha.maxEndurance = 200;
        this.agatha.atkBuffTurns = 0;
        this.agatha.dodgeBuffTurns = 0;
        this.currentStageIndex = 0;
        this.isProcessingTurn = false;

        this.currentBoss = { ...this.stages[0], isStunned: false };

        this.updateUI();
        this.logText.textContent = "🔥 Le combat de Lucha Libre commence ! Choisis ton attaque !";
        audioManager.playBgm(AUDIO_TRACKS.BOSS);
    }

    updateUI() {
        if (!this.currentBoss) return;

        // Agatha Bars (sur 200)
        const agathaHpRatio = Math.max(0, (this.agatha.hp / this.agatha.maxHp) * 100);
        this.agathaHpBar.style.width = agathaHpRatio + '%';
        this.agathaHpText.textContent = `${Math.round(this.agatha.hp)}/200`;

        const agathaEndRatio = Math.max(0, (this.agatha.endurance / this.agatha.maxEndurance) * 100);
        this.agathaEndBar.style.width = agathaEndRatio + '%';
        this.agathaEndText.textContent = `${Math.round(this.agatha.endurance)}/200`;

        // Buffs
        let buffsHtml = '';
        if (this.agatha.atkBuffTurns > 0) buffsHtml += `<span class="buff-badge">🥊 ATQ +50% (${this.agatha.atkBuffTurns}T)</span> `;
        if (this.agatha.dodgeBuffTurns > 0) buffsHtml += `<span class="buff-badge">📣 ESQUIVE (${this.agatha.dodgeBuffTurns}T)</span>`;
        this.agathaBuffs.innerHTML = buffsHtml;

        // Stage Tag
        this.stageTag.textContent = `PRUEBA ${this.currentStageIndex + 1} / 5`;

        // Boss Info
        this.bossName.textContent = this.currentBoss.name;
        const bossHpRatio = Math.max(0, (this.currentBoss.hp / this.currentBoss.maxHp) * 100);
        this.bossHpBar.style.width = bossHpRatio + '%';
        this.bossHpText.textContent = `${Math.round(this.currentBoss.hp)}/${this.currentBoss.maxHp}`;
        this.bossStatus.textContent = this.currentBoss.isStunned ? "STATUT: 💫 ÉTOURDI" : "STATUT: NORMAL";
    }

    handlePlayerAction(actionType) {
        if (this.isProcessingTurn) return;

        // Check costs
        const costs = { puno: 5, plancha: 25, suplex: 40, melvin: 20, lucie: 20 };
        const cost = costs[actionType] || 0;

        if (this.agatha.endurance < cost) {
            this.logText.textContent = "⚡ Endurance insuffisante pour exécuter cette action !";
            return;
        }

        this.isProcessingTurn = true;
        this.agatha.endurance -= cost;

        // Check turn priority
        const isPlancha = (actionType === 'plancha');
        const agathaGoesFirst = isPlancha || (this.agatha.speed >= this.currentBoss.speed);

        if (agathaGoesFirst) {
            this.executeAgathaTurn(actionType, () => {
                if (this.currentBoss.hp > 0) {
                    setTimeout(() => {
                        this.executeBossTurn(() => this.finishTurn());
                    }, 800);
                } else {
                    this.handleBossDefeated();
                }
            });
        } else {
            this.logText.textContent = `⚡ ${this.currentBoss.name} est plus rapide et attaque en premier !`;
            setTimeout(() => {
                this.executeBossTurn(() => {
                    if (this.agatha.hp > 0) {
                        setTimeout(() => {
                            this.executeAgathaTurn(actionType, () => {
                                if (this.currentBoss.hp <= 0) {
                                    this.handleBossDefeated();
                                } else {
                                    this.finishTurn();
                                }
                            });
                        }, 800);
                    }
                });
            }, 700);
        }
    }

    executeAgathaTurn(actionType, callback) {
        // Attack Animation
        this.agathaImg.src = 'Assets/player/agathaattack.png';
        const agathaBox = document.getElementById('rpg-agatha-sprite-box');
        if (agathaBox) agathaBox.style.transform = 'translateX(60px)';

        setTimeout(() => {
            this.agathaImg.src = 'Assets/player/agatha0.png';
            if (agathaBox) agathaBox.style.transform = 'translateX(0)';
        }, 450);

        let dmgMultiplier = (this.agatha.atkBuffTurns > 0) ? 1.5 : 1.0;

        switch (actionType) {
            case 'puno': {
                const baseDmg = 20 * dmgMultiplier;
                this.currentBoss.hp -= baseDmg;
                this.logText.textContent = `🥊 Agatha lance PUÑO DE LA LUCHA ! (-${Math.round(baseDmg)} PV)`;
                break;
            }

            case 'plancha': {
                const baseDmg = 35 * dmgMultiplier;
                this.currentBoss.hp -= baseDmg;
                this.logText.textContent = `⚡ PLANCHA VOLADORA ! Agatha saute du haut des cordes ! (-${Math.round(baseDmg)} PV)`;
                break;
            }

            case 'suplex': {
                const baseDmg = 55 * dmgMultiplier;
                this.currentBoss.hp -= baseDmg;
                const isStun = Math.random() < 0.30;
                if (isStun) {
                    this.currentBoss.isStunned = true;
                    this.logText.textContent = `💥 SUPLEX ESCOLAR DÉVASTATEUR ! (-${Math.round(baseDmg)} PV) Le Boss est ÉTOURDI 💫 !`;
                } else {
                    this.logText.textContent = `💥 SUPLEX ESCOLAR ! (-${Math.round(baseDmg)} PV)`;
                }
                break;
            }

            case 'melvin': {
                this.agatha.atkBuffTurns = 3;
                this.logText.textContent = `🥊 Melvin crie ses consignes de catch ! Dégâts +50% pendant 3 tours !`;
                break;
            }

            case 'lucie': {
                this.agatha.hp = Math.min(200, this.agatha.hp + 40);
                this.agatha.dodgeBuffTurns = 2;
                this.logText.textContent = `📣 Lucie t'encourage ! (+40 PV soignés & Boost d'Esquive activé !)`;
                break;
            }
        }

        this.updateUI();
        if (callback) setTimeout(callback, 750);
    }

    executeBossTurn(callback) {
        if (this.currentBoss.isStunned) {
            this.currentBoss.isStunned = false;
            this.logText.textContent = `💫 ${this.currentBoss.name} est étourdi et ne peut pas attaquer ce tour !`;
            this.updateUI();
            if (callback) setTimeout(callback, 750);
            return;
        }

        // Check dodge
        if (this.agatha.dodgeBuffTurns > 0 && Math.random() < 0.50) {
            this.logText.textContent = `💨 Agatha ESQUIVE l'attaque de ${this.currentBoss.name} grâce au boost de Lucie !`;
            if (callback) setTimeout(callback, 750);
            return;
        }

        // Boss animation
        const bossBox = document.getElementById('rpg-boss-sprite-box');
        if (bossBox) bossBox.style.transform = 'translateX(-60px)';
        setTimeout(() => {
            if (bossBox) bossBox.style.transform = 'translateX(0)';
        }, 450);

        const bossDmg = this.currentBoss.atk;
        this.agatha.hp -= bossDmg;

        this.logText.textContent = `⚠️ ${this.currentBoss.name} contre-attaque ! (-${bossDmg} PV)`;
        this.updateUI();

        if (this.agatha.hp <= 0) {
            this.agatha.hp = 0;
            this.updateUI();
            setTimeout(() => {
                GameEngine.getInstance().triggerGameOver();
            }, 1000);
        } else {
            if (callback) setTimeout(callback, 750);
        }
    }

    finishTurn() {
        // Regen endurance (+20 per turn sur 200 max)
        this.agatha.endurance = Math.min(200, this.agatha.endurance + 20);

        // Reduce buff timers
        if (this.agatha.atkBuffTurns > 0) this.agatha.atkBuffTurns--;
        if (this.agatha.dodgeBuffTurns > 0) this.agatha.dodgeBuffTurns--;

        this.updateUI();
        this.isProcessingTurn = false;
    }

    handleBossDefeated() {
        this.currentStageIndex++;

        if (this.currentStageIndex >= this.stages.length) {
            this.logText.textContent = "🏆 VICTOIRE SUPRÊME ! Agatha a terrassé LOS EXÁMENES FINALES !";
            setTimeout(() => {
                GameEngine.getInstance().triggerVictory();
            }, 1500);
        } else {
            const nextStage = this.stages[this.currentStageIndex];
            this.currentBoss = { ...nextStage, isStunned: false };
            this.logText.textContent = `🎉 PRUEBA VENCIDA ! L'épreuve suivante entre sur le ring : ${nextStage.name} !`;
            this.updateUI();

            setTimeout(() => {
                this.finishTurn();
            }, 1200);
        }
    }
}

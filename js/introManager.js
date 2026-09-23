/* ==========================================================================
   INTRO & CINEMATIC MANAGER - LA LÉGENDE D'EL AGATHA
   ========================================================================== */

const introSteps = [
    { text: "On raconte que dans les ruelles populaires...", duration: 3.0, scene: "scene1", voice: "v1", speaker: "MELVIN" },
    { text: "des quartiers populaires...", duration: 1.5, speaker: "MELVIN" },
    { text: "de Mexico populaire...", duration: 2.0, speaker: "MELVIN" },
    { text: "…qu’à la tombée de la nuit…", duration: 2.0, voice: "v2", speaker: "MELVIN" },
    { text: "une silhouette surgit sous les néons tremblants des clubs clandestins.", duration: 4.5, speaker: "MELVIN" },
    { text: "Et cette silhouette…", duration: 1.5, scene: "scene2", voice: "v3", speaker: "LUCIE" },
    { text: "C'EST ELLE !!!!!!", duration: 1.5, speaker: "LUCIE" },
    { text: "Une fille toujours en retard sur ses devoirs,\navec des cernes en forme de continents.", duration: 4.3, scene: "scene3", speaker: "LUCIE" },
    { text: "Une étudiante discrète... fatiguée...", duration: 3.5, scene: "scene7", voice: "v4", speaker: "MELVIN" },
    { text: "Mais la nuit, sous le masque, c’est une autre histoire.", duration: 4.0, scene: "scene8", speaker: "MELVIN" },
    { text: "Le jour, elle révise ses devoirs. La nuit, elle les affronte.", duration: 4.8, scene: "scene9", voice: "v5", speaker: "LUCIE" },
    { text: "EL-AGA-THA ! EL-AGA-THA ! EL-AGA-THA !", duration: 5.0, voice: "v6", speaker: "LA FOULE" },
    { text: "Pas pour l’argent. Pas pour la gloire. Non…", duration: 5.0, scene: "scene4", voice: "v7", speaker: "MELVIN" },
    { text: "Pour réussir son année scolaire.", duration: 2.8, scene: "scene6", speaker: "MELVIN" },
    { text: "Tu veux ton diplôme, Agatha ? Alors prouve-le.", duration: 4.0, scene: "scene10", voice: "v8", speaker: "LE DIRECTEUR" },
    { text: "Affronte tes épreuves... à ta manière.", duration: 3.0, speaker: "LE DIRECTEUR" },
    { text: "Ce soir, elle n’étudie pas les matières...\nELLE LES DETRUIT !", duration: 5.0, scene: "scene9", voice: "v9", speaker: "MELVIN" }
];

const voiceSources = {
    v1: 'Assets/Voices/1.mp3',
    v2: 'Assets/Voices/2.mp3',
    v3: 'Assets/Voices/3.mp3',
    v4: 'Assets/Voices/4.mp3',
    v5: 'Assets/Voices/5.mp3',
    v6: 'Assets/Voices/6.mp3',
    v7: 'Assets/Voices/7.mp3',
    v8: 'Assets/Voices/8.mp3',
    v9: 'Assets/Voices/9.mp3'
};

class IntroManager {
    constructor() {
        if (IntroManager.instance) {
            return IntroManager.instance;
        }

        this.currentStep = 0;
        this.currentSceneImg = "scene1";
        this.introTimeout = null;

        this.introImg = document.getElementById('intro-image');
        this.introSpeaker = document.getElementById('intro-speaker');
        this.introText = document.getElementById('intro-text');
        this.btnSkipIntro = document.getElementById('btn-skip-intro');

        if (this.btnSkipIntro) {
            this.btnSkipIntro.addEventListener('click', () => this.finishIntro());
        }

        IntroManager.instance = this;
    }

    static getInstance() {
        if (!IntroManager.instance) {
            IntroManager.instance = new IntroManager();
        }
        return IntroManager.instance;
    }

    startIntro(engine) {
        this.engine = engine;
        this.currentStep = 0;
        this.currentSceneImg = "scene1";
        if (this.btnSkipIntro) {
            this.btnSkipIntro.textContent = "Passer l'intro ⏭️";
            this.btnSkipIntro.classList.remove('btn-intro-ready');
        }
        engine.stateMachine.setState(STATES.INTRO);
        this.playStep(this.currentStep);
    }

    playStep(index) {
        if (this.introTimeout) clearTimeout(this.introTimeout);

        if (index >= introSteps.length) {
            if (this.btnSkipIntro) {
                this.btnSkipIntro.textContent = "PASSER À LA CARTE DES NIVEAUX 🗺️ ⏩";
                this.btnSkipIntro.classList.add('btn-intro-ready');
            }
            return;
        }

        const step = introSteps[index];
        if (this.introSpeaker) this.introSpeaker.textContent = step.speaker || "VOIX OFF";
        if (this.introText) this.introText.innerHTML = step.text.replace(/\n/g, "<br>");

        if (step.scene && this.engine.assets.images[step.scene]) {
            this.currentSceneImg = step.scene;
            if (this.introImg) this.introImg.src = this.engine.assets.images[step.scene].src;
        } else if (this.currentSceneImg && this.engine.assets.images[this.currentSceneImg]) {
            if (this.introImg) this.introImg.src = this.engine.assets.images[this.currentSceneImg].src;
        }

        if (step.voice && voiceSources[step.voice]) {
            audioManager.playVoice(voiceSources[step.voice]);
        }

        // Si nous sommes sur la dernière réplique du prologue :
        if (index === introSteps.length - 1) {
            const durationMs = (step.duration || 5.0) * 1000;
            // Quand la dernière réplique est lue, mettre en évidence le bouton sans changer automatiquement de scène !
            this.introTimeout = setTimeout(() => {
                if (this.btnSkipIntro) {
                    this.btnSkipIntro.textContent = "PASSER À LA CARTE DES NIVEAUX 🗺️ ⏩";
                    this.btnSkipIntro.classList.add('btn-intro-ready');
                }
            }, durationMs);
            return;
        }

        // Passage automatique aux répliques suivantes
        const durationMs = (step.duration || 3.0) * 1000;
        this.introTimeout = setTimeout(() => {
            this.currentStep++;
            this.playStep(this.currentStep);
        }, durationMs);
    }

    finishIntro() {
        if (this.introTimeout) clearTimeout(this.introTimeout);
        audioManager.stopVoice();
        if (this.engine) {
            this.engine.stateMachine.setState(STATES.WORLDMAP);
        }
    }
}

const introManager = new IntroManager();

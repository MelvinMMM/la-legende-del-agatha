/* ==========================================================================
   AUDIO MANAGER (SINGLETON PATTERN) - LA LÉGENDE D'EL AGATHA
   ========================================================================== */

class AudioManager {
    constructor() {
        if (AudioManager.instance) {
            return AudioManager.instance;
        }
        
        this.bgmVolume = 0.6;
        this.voiceVolume = 0.9;
        this.currentBgm = null;
        this.currentBgmSrc = "";
        this.currentVoiceAudio = null;
        this.audioUnlocked = false;

        AudioManager.instance = this;
    }

    static getInstance() {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    unlockAudio() {
        if (this.audioUnlocked) return;
        this.audioUnlocked = true;
    }

    playBgm(src) {
        if (this.currentBgmSrc === src && this.currentBgm && !this.currentBgm.paused) {
            return;
        }

        if (this.currentBgm) {
            this.currentBgm.pause();
        }

        this.currentBgmSrc = src;
        this.currentBgm = new Audio(src);
        this.currentBgm.loop = true;
        this.currentBgm.volume = this.bgmVolume;

        const playPromise = this.currentBgm.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log("BGM play blocked:", e);
            });
        }
    }

    pauseBgm() {
        if (this.currentBgm) {
            this.currentBgm.pause();
        }
    }

    resumeBgm() {
        if (this.currentBgm) {
            this.currentBgm.play().catch(e => console.log(e));
        }
    }

    playVoice(src) {
        if (this.currentVoiceAudio) {
            this.currentVoiceAudio.pause();
        }
        this.currentVoiceAudio = new Audio(src);
        this.currentVoiceAudio.volume = this.voiceVolume;
        this.currentVoiceAudio.play().catch(e => console.log("Voice play blocked", e));
    }

    stopVoice() {
        if (this.currentVoiceAudio) {
            this.currentVoiceAudio.pause();
        }
    }

    setBgmVolume(val) {
        this.bgmVolume = val;
        if (this.currentBgm) this.currentBgm.volume = this.bgmVolume;
    }

    setVoiceVolume(val) {
        this.voiceVolume = val;
        if (this.currentVoiceAudio) this.currentVoiceAudio.volume = this.voiceVolume;
    }
}

const audioManager = new AudioManager();

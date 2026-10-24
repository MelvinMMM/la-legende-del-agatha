/* ==========================================================================
   DRIVING ENGINE 3D (THREE.JS) - ÉPISODE 2 : EL PERMISO DE CONDUCIR
   La Légende d'El Agatha
   ========================================================================== */

class DrivingEngine3D {
    constructor() {
        if (DrivingEngine3D.instance) {
            return DrivingEngine3D.instance;
        }

        this.canvas = document.getElementById('threeCanvas');
        this.container = document.getElementById('episode2-overlay');
        this.currentRound = 1;
        this.isRunning = false;
        this.isPaused = false;

        // Three.js Core
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // Car & Physics State
        this.car = null;
        this.wheels = [];
        this.frontWheels = [];
        this.roofLight = null;
        this.brakeLights = [];
        this.blinkerLights = { left: [], right: [] };
        this.activeBlinker = null; // 'left', 'right', null
        this.blinkerTimer = 0;

        this.carState = {
            x: 0, y: 0, z: 0,
            speed: 0,
            maxSpeed: 28,
            maxReverseSpeed: -10,
            acceleration: 18,
            braking: 30,
            drag: 0.97,
            steeringAngle: 0,
            maxSteeringAngle: 0.6,
            steeringSpeed: 2.5,
            rotationY: 0,
            isDrifting: false,
            // Round 1 specific
            rpm: 1000,
            isBraking: false,
            clutchEngaged: false,
            hillLaunched: false,
            stallsCount: 0,
            // Round 2 specific
            distanceToExit: 220,
            tookCorrectExit: false,
            // Round 3 specific
            inParkingZone: false,
            isParked: false,
            distanceToCurb: 10,
            distanceToRearCar: 10
        };

        // Inputs
        this.keys = {
            up: false, down: false, left: false, right: false,
            space: false, blinkLeft: false, blinkRight: false
        };

        // Environment & Objects
        this.environmentObjects = [];
        this.trafficCars = [];
        this.particles = [];
        this.parkingBox = null;

        // Audio Synthesizer (Web Audio API)
        this.audioCtx = null;
        this.engineOsc = null;
        this.engineGain = null;
        this.lastBeepTime = 0;

        // Strikes on El Moniteur's notebook
        this.strikes = 0;
        this.maxStrikes = 3;

        this.initDOM();
        this.initInputs();

        DrivingEngine3D.instance = this;
    }

    static getInstance() {
        if (!DrivingEngine3D.instance) {
            DrivingEngine3D.instance = new DrivingEngine3D();
        }
        return DrivingEngine3D.instance;
    }

    initDOM() {
        // Blinker Buttons
        const btnBlinkL = document.getElementById('btn-blink-left');
        const btnBlinkR = document.getElementById('btn-blink-right');
        if (btnBlinkL) btnBlinkL.addEventListener('click', () => this.toggleBlinker('left'));
        if (btnBlinkR) btnBlinkR.addEventListener('click', () => this.toggleBlinker('right'));

        // Pause & Fullscreen
        const btnPause = document.getElementById('btn-ep2-pause');
        if (btnPause) btnPause.addEventListener('click', () => this.togglePause());

        // Restart
        const btnRestart = document.getElementById('btn-ep2-restart');
        if (btnRestart) btnRestart.addEventListener('click', () => this.startRound(this.currentRound));

        // Horn
        const btnHorn = document.getElementById('btn-ep2-horn');
        if (btnHorn) btnHorn.addEventListener('click', () => this.playHorn());
    }

    initInputs() {
        window.addEventListener('keydown', (e) => {
            if (!this.isRunning || this.isPaused) return;

            if (e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.up = true;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') this.keys.down = true;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
            if (e.code === 'Space') {
                this.keys.space = true;
                e.preventDefault();
            }

            // Blinkers: Q for left, E for right (or A/E)
            if (e.code === 'KeyQ') this.toggleBlinker('left');
            if (e.code === 'KeyE') this.toggleBlinker('right');

            // Horn: H
            if (e.code === 'KeyH') this.playHorn();
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.up = false;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') this.keys.down = false;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
            if (e.code === 'Space') this.keys.space = false;
        });

        window.addEventListener('resize', () => {
            if (!this.renderer || !this.camera) return;
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        });
    }

    initAudio() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        if (!this.engineOsc) {
            try {
                this.engineOsc = this.audioCtx.createOscillator();
                this.engineGain = this.audioCtx.createGain();
                this.engineOsc.type = 'sawtooth';
                this.engineOsc.frequency.setValueAtTime(45, this.audioCtx.currentTime);
                this.engineGain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);

                const filter = this.audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(320, this.audioCtx.currentTime);

                this.engineOsc.connect(filter);
                filter.connect(this.engineGain);
                this.engineGain.connect(this.audioCtx.destination);
                this.engineOsc.start();
            } catch (e) {
                console.warn("Audio WebAudio non disponible:", e);
            }
        }
    }

    stopAudio() {
        if (this.engineGain && this.audioCtx) {
            this.engineGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        }
    }

    updateEngineSound(rpmOrSpeed) {
        if (!this.engineOsc || !this.audioCtx || this.isPaused) return;
        const targetFreq = 35 + (rpmOrSpeed * 0.04);
        this.engineOsc.frequency.setTargetAtTime(Math.min(targetFreq, 300), this.audioCtx.currentTime, 0.08);
        if (this.engineGain) {
            this.engineGain.gain.setTargetAtTime(0.05, this.audioCtx.currentTime, 0.1);
        }
    }

    playHorn() {
        if (!this.audioCtx) this.initAudio();
        if (!this.audioCtx) return;
        try {
            const osc1 = this.audioCtx.createOscillator();
            const osc2 = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc1.type = 'triangle';
            osc2.type = 'triangle';
            osc1.frequency.setValueAtTime(440, this.audioCtx.currentTime);
            osc2.frequency.setValueAtTime(554, this.audioCtx.currentTime);

            gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc1.start();
            osc2.start();
            osc1.stop(this.audioCtx.currentTime + 0.35);
            osc2.stop(this.audioCtx.currentTime + 0.35);
        } catch (e) {}
    }

    playSensorBeep(dist) {
        if (!this.audioCtx || dist > 6) return;
        const now = performance.now();
        const interval = Math.max(80, dist * 120);
        if (now - this.lastBeepTime > interval) {
            this.lastBeepTime = now;
            try {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
                gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.start();
                osc.stop(this.audioCtx.currentTime + 0.08);
            } catch (e) {}
        }
    }

    toggleBlinker(side) {
        if (this.activeBlinker === side) {
            this.activeBlinker = null;
        } else {
            this.activeBlinker = side;
        }
        this.updateBlinkerUI();
    }

    updateBlinkerUI() {
        const btnL = document.getElementById('btn-blink-left');
        const btnR = document.getElementById('btn-blink-right');
        if (btnL) btnL.classList.toggle('active', this.activeBlinker === 'left');
        if (btnR) btnR.classList.toggle('active', this.activeBlinker === 'right');
    }

    startRound(roundNum) {
        this.currentRound = roundNum;
        this.isRunning = true;
        this.isPaused = false;
        this.strikes = 0;
        this.activeBlinker = null;
        this.updateBlinkerUI();

        this.initAudio();

        // Setup Three.js scene
        this.setupScene();

        // Round specific build
        if (roundNum === 1) this.buildRound1HillStart();
        else if (roundNum === 2) this.buildRound2Roundabout();
        else if (roundNum === 3) this.buildRound3Parking();

        // Setup HUD
        this.setupRoundHUD(roundNum);

        // Start render loop
        this.clock.start();
        this.animate();
    }

    setupScene() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.currentRound === 3 ? 0x090d16 : 0x70b5ff);
        this.scene.fog = new THREE.FogExp2(this.currentRound === 3 ? 0x090d16 : 0x70b5ff, 0.012);

        this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 800);
        this.camera.position.set(0, 3.5, -7);

        if (!this.renderer) {
            this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Ambient Light
        const ambLight = new THREE.AmbientLight(this.currentRound === 3 ? 0x334466 : 0xffffff, this.currentRound === 3 ? 0.4 : 0.75);
        this.scene.add(ambLight);

        // Directional Sun / Moon Light
        const dirLight = new THREE.DirectionalLight(this.currentRound === 3 ? 0xaaccff : 0xfffaed, this.currentRound === 3 ? 0.6 : 1.2);
        dirLight.position.set(30, 60, -30);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 10;
        dirLight.shadow.camera.far = 150;
        const d = 35;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        this.scene.add(dirLight);

        // Create Agatha's Car
        this.createCar();

        this.environmentObjects = [];
        this.trafficCars = [];
        this.particles = [];
    }

    createCar() {
        this.car = new THREE.Group();
        this.wheels = [];
        this.frontWheels = [];
        this.brakeLights = [];
        this.blinkerLights = { left: [], right: [] };

        // 1. Car Body (Sedan Low-Poly Auto-École)
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x94a3b8, // Gris auto-école de l'angoisse
            roughness: 0.35,
            metalness: 0.25
        });

        // Lower Chassis
        const chassisGeo = new THREE.BoxGeometry(1.8, 0.55, 3.8);
        const chassis = new THREE.Mesh(chassisGeo, bodyMat);
        chassis.position.y = 0.55;
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        this.car.add(chassis);

        // Cabin / Roof
        const cabinMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.6 });
        const cabinGeo = new THREE.BoxGeometry(1.5, 0.55, 2.0);
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.set(0, 1.05, -0.2);
        cabin.castShadow = true;
        this.car.add(cabin);

        // Roof Sign "AUTO ÉCOLE - LUCHA"
        const signGeo = new THREE.BoxGeometry(1.0, 0.22, 0.35);
        const signMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, 1.42, -0.2);
        this.car.add(sign);

        // Roof Flashing Amber Light
        const lightGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 12);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        this.roofLight = new THREE.Mesh(lightGeo, lightMat);
        this.roofLight.position.set(0, 1.58, -0.2);
        this.car.add(this.roofLight);

        // Mexican Luchadora Decal Band (Pink / Gold)
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
        const stripeGeo = new THREE.BoxGeometry(1.82, 0.08, 3.82);
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.y = 0.55;
        this.car.add(stripe);

        // Headlights
        const headLightMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
        const hlGeo = new THREE.BoxGeometry(0.3, 0.15, 0.08);
        const hlL = new THREE.Mesh(hlGeo, headLightMat);
        hlL.position.set(-0.65, 0.6, 1.9);
        const hlR = new THREE.Mesh(hlGeo, headLightMat);
        hlR.position.set(0.65, 0.6, 1.9);
        this.car.add(hlL);
        this.car.add(hlR);

        // Headlight Spotlights for night (Round 3)
        if (this.currentRound === 3) {
            const spotL = new THREE.SpotLight(0xfffbeb, 2.5, 30, Math.PI / 6, 0.4);
            spotL.position.set(-0.65, 0.6, 2.0);
            spotL.target.position.set(-0.65, 0, 15);
            this.car.add(spotL);
            this.car.add(spotL.target);

            const spotR = new THREE.SpotLight(0xfffbeb, 2.5, 30, Math.PI / 6, 0.4);
            spotR.position.set(0.65, 0.6, 2.0);
            spotR.target.position.set(0.65, 0, 15);
            this.car.add(spotR);
            this.car.add(spotR.target);
        }

        // Taillights (Red)
        const tailMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x7f1d1d });
        const tlGeo = new THREE.BoxGeometry(0.3, 0.15, 0.08);
        const tlL = new THREE.Mesh(tlGeo, tailMat);
        tlL.position.set(-0.65, 0.6, -1.9);
        const tlR = new THREE.Mesh(tlGeo, tailMat);
        tlR.position.set(0.65, 0.6, -1.9);
        this.car.add(tlL);
        this.car.add(tlR);
        this.brakeLights.push(tlL, tlR);

        // Blinkers (Orange)
        const blMatL = new THREE.MeshBasicMaterial({ color: 0x332200 });
        const blMatR = new THREE.MeshBasicMaterial({ color: 0x332200 });
        const blGeo = new THREE.BoxGeometry(0.12, 0.12, 0.06);

        const blFL = new THREE.Mesh(blGeo, blMatL);
        blFL.position.set(-0.85, 0.6, 1.88);
        const blRL = new THREE.Mesh(blGeo, blMatL);
        blRL.position.set(-0.85, 0.6, -1.88);

        const blFR = new THREE.Mesh(blGeo, blMatR);
        blFR.position.set(0.85, 0.6, 1.88);
        const blRR = new THREE.Mesh(blGeo, blMatR);
        blRR.position.set(0.85, 0.6, -1.88);

        this.car.add(blFL, blRL, blFR, blRR);
        this.blinkerLights.left.push(blFL, blRL);
        this.blinkerLights.right.push(blFR, blRR);

        // 4 Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 16);
        wheelGeo.rotateZ(Math.PI / 2);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8, roughness: 0.2 });

        const wheelPositions = [
            { x: -0.9, y: 0.36, z: 1.15, isFront: true },
            { x: 0.9, y: 0.36, z: 1.15, isFront: true },
            { x: -0.9, y: 0.36, z: -1.15, isFront: false },
            { x: 0.9, y: 0.36, z: -1.15, isFront: false }
        ];

        wheelPositions.forEach(p => {
            const wheelGroup = new THREE.Group();
            wheelGroup.position.set(p.x, p.y, p.z);

            const tire = new THREE.Mesh(wheelGeo, wheelMat);
            tire.castShadow = true;
            wheelGroup.add(tire);

            const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.29, 8), rimMat);
            rim.rotateZ(Math.PI / 2);
            wheelGroup.add(rim);

            this.car.add(wheelGroup);
            this.wheels.push(wheelGroup);
            if (p.isFront) this.frontWheels.push(wheelGroup);
        });

        // Driver: Agatha Mask Silhouette
        const agathaHead = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0xec4899 }) // Masque Rose
        );
        agathaHead.position.set(-0.35, 1.1, -0.15);
        this.car.add(agathaHead);

        // El Moniteur Silhouette with glasses
        const moniteurHead = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0x334155 }) // Silhouette sombre
        );
        moniteurHead.position.set(0.35, 1.1, -0.15);
        this.car.add(moniteurHead);

        this.scene.add(this.car);
    }

    // ==========================================
    // ROUND 1: LE DÉMARRAGE EN CÔTE
    // ==========================================
    buildRound1HillStart() {
        this.carState.x = 0;
        this.carState.y = 1.0;
        this.carState.z = 0;
        this.carState.speed = 0;
        this.carState.rotationY = 0;
        this.carState.rpm = 900;
        this.carState.hillLaunched = false;
        this.carState.stallsCount = 0;

        // Steep Incline Road (20% slope = ~11 degrees)
        const slopeAngle = 0.18; // Radians
        const roadLength = 220;

        const roadGroup = new THREE.Group();
        roadGroup.rotation.x = slopeAngle;

        // Asphalt Road
        const roadGeo = new THREE.PlaneGeometry(12, roadLength);
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x22262e, roughness: 0.85 });
        const road = new THREE.Mesh(roadGeo, roadMat);
        road.rotation.x = -Math.PI / 2;
        road.position.z = roadLength / 2 - 10;
        road.receiveShadow = true;
        roadGroup.add(road);

        // Center White Dashes
        for (let z = 0; z < roadLength; z += 6) {
            const dashGeo = new THREE.PlaneGeometry(0.25, 3);
            const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const dash = new THREE.Mesh(dashGeo, dashMat);
            dash.rotation.x = -Math.PI / 2;
            dash.position.set(0, 0.02, z);
            roadGroup.add(dash);
        }

        // Sidewalks & Buildings
        for (let z = -10; z < roadLength; z += 18) {
            // Houses Left & Right
            const hL = this.createBuilding(0x818cf8);
            hL.position.set(-11, 3.5, z);
            roadGroup.add(hL);

            const hR = this.createBuilding(0xf59e0b);
            hR.position.set(11, 3.5, z);
            roadGroup.add(hR);

            // Trees
            const tree = this.createTree();
            tree.position.set(-7.5, 0, z + 9);
            roadGroup.add(tree);
        }

        // The Angry Red Car behind Agatha
        const redCar = this.createStaticCar(0xdc2626);
        redCar.position.set(0, 0.45, -7);
        roadGroup.add(redCar);

        // Checkpoint Banner at the top
        const bannerGroup = new THREE.Group();
        bannerGroup.position.set(0, 4, 180);
        const bannerGeo = new THREE.BoxGeometry(12, 1.5, 0.3);
        const bannerMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const banner = new THREE.Mesh(bannerGeo, bannerMat);
        bannerGroup.add(banner);
        roadGroup.add(bannerGroup);

        this.scene.add(roadGroup);
        this.roadSlope = slopeAngle;
    }

    // ==========================================
    // ROUND 2: LE ROND-POINT DES ENFERS (ASPHALT)
    // ==========================================
    buildRound2Roundabout() {
        this.carState.x = 0;
        this.carState.y = 0;
        this.carState.z = -55;
        this.carState.speed = 10;
        this.carState.rotationY = 0;
        this.carState.distanceToExit = 200;
        this.carState.tookCorrectExit = false;

        // Ground Plane
        const groundGeo = new THREE.PlaneGeometry(350, 350);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Huge 4-Lane Circular Roundabout
        const innerRadius = 25;
        const outerRadius = 65;
        const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.02;
        ring.receiveShadow = true;
        this.scene.add(ring);

        // Central Island (Green with Palms)
        const islandGeo = new THREE.CircleGeometry(innerRadius, 32);
        const islandMat = new THREE.MeshStandardMaterial({ color: 0x065f46 });
        const island = new THREE.Mesh(islandGeo, islandMat);
        island.rotation.x = -Math.PI / 2;
        island.position.y = 0.05;
        this.scene.add(island);

        // Center Statue / Monument
        const statueGeo = new THREE.CylinderGeometry(1.5, 2.5, 12, 16);
        const statueMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8 });
        const statue = new THREE.Mesh(statueGeo, statueMat);
        statue.position.set(0, 6, 0);
        this.scene.add(statue);

        // Exits (4 arterial roads: North, South, East, West)
        const exitDirs = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
        exitDirs.forEach((ang, idx) => {
            const roadGroup = new THREE.Group();
            roadGroup.rotation.y = ang;

            const armGeo = new THREE.PlaneGeometry(16, 90);
            const armMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
            const arm = new THREE.Mesh(armGeo, armMat);
            arm.rotation.x = -Math.PI / 2;
            arm.position.set(0, 0.015, outerRadius + 45);
            roadGroup.add(arm);

            if (idx === 1) { // Exit 3 (East) is the target exit!
                const exitSign = new THREE.Mesh(
                    new THREE.BoxGeometry(16, 2.2, 0.5),
                    new THREE.MeshBasicMaterial({ color: 0x10b981 })
                );
                exitSign.position.set(0, 5, outerRadius + 50);
                roadGroup.add(exitSign);
            }

            this.scene.add(roadGroup);
        });

        // 8 AI Traffic Cars circulating on the roundabout
        this.trafficCars = [];
        const colors = [0xf59e0b, 0xef4444, 0x3b82f6, 0x10b981, 0x8b5cf6, 0xffffff];
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const laneRadius = innerRadius + 8 + (i % 3) * 11;
            const speed = 0.25 + Math.random() * 0.15;
            const tCar = this.createStaticCar(colors[i % colors.length]);

            this.trafficCars.push({
                mesh: tCar,
                angle: angle,
                radius: laneRadius,
                speed: speed
            });
            this.scene.add(tCar);
        }
    }

    // ==========================================
    // ROUND 3: LE CRÉNEAU DE L'ANGOISSE (BOSS)
    // ==========================================
    buildRound3Parking() {
        this.carState.x = 2.2;
        this.carState.y = 0;
        this.carState.z = 18;
        this.carState.speed = 0;
        this.carState.rotationY = 0;
        this.carState.inParkingZone = false;
        this.carState.isParked = false;

        // Street at Night
        const streetGeo = new THREE.PlaneGeometry(14, 100);
        const streetMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
        const street = new THREE.Mesh(streetGeo, streetMat);
        street.rotation.x = -Math.PI / 2;
        street.receiveShadow = true;
        this.scene.add(street);

        // Sidewalk Right
        const sidewalkGeo = new THREE.BoxGeometry(4, 0.3, 100);
        const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
        sidewalk.position.set(8.5, 0.15, 0);
        this.scene.add(sidewalk);

        // Parked Cars: Car 1 (Front) & Car 2 (Behind)
        const frontCar = this.createStaticCar(0xef4444); // Red sports car
        frontCar.position.set(5.0, 0, 7.5);
        this.scene.add(frontCar);

        const rearCar = this.createStaticCar(0x3b82f6); // Blue luxury sedan
        rearCar.position.set(5.0, 0, -7.5);
        this.scene.add(rearCar);

        // The Ideal Parking Box (Between z = -3.5 and z = 3.5, x around 5.0)
        const boxGeo = new THREE.PlaneGeometry(2.4, 6.2);
        const boxMat = new THREE.MeshBasicMaterial({
            color: 0x10b981,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide
        });
        this.parkingBox = new THREE.Mesh(boxGeo, boxMat);
        this.parkingBox.rotation.x = -Math.PI / 2;
        this.parkingBox.position.set(5.0, 0.03, 0);
        this.scene.add(this.parkingBox);

        // Street Lamps casting warm pools of light
        for (let z = -40; z <= 40; z += 20) {
            const lampGroup = new THREE.Group();
            lampGroup.position.set(7.5, 0, z);

            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6), new THREE.MeshStandardMaterial({ color: 0x334155 }));
            pole.position.y = 3;
            lampGroup.add(pole);

            const lightBulb = new THREE.PointLight(0xffedd5, 1.2, 18);
            lightBulb.position.y = 5.8;
            lampGroup.add(lightBulb);

            this.scene.add(lampGroup);
        }
    }

    createBuilding(color) {
        const h = 8 + Math.random() * 8;
        const b = new THREE.Mesh(
            new THREE.BoxGeometry(6, h, 10),
            new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 })
        );
        b.castShadow = true;
        b.receiveShadow = true;
        return b;
    }

    createTree() {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.25, 2.5),
            new THREE.MeshStandardMaterial({ color: 0x78350f })
        );
        trunk.position.y = 1.25;
        tree.add(trunk);

        const foliage = new THREE.Mesh(
            new THREE.SphereGeometry(1.4, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x15803d })
        );
        foliage.position.y = 2.8;
        foliage.castShadow = true;
        tree.add(foliage);
        return tree;
    }

    createStaticCar(color) {
        const car = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3 });
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 3.8), mat);
        chassis.position.y = 0.55;
        chassis.castShadow = true;
        car.add(chassis);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 1.9), new THREE.MeshStandardMaterial({ color: 0x111827 }));
        cabin.position.set(0, 1.05, -0.2);
        car.add(cabin);

        const wGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
        wGeo.rotateZ(Math.PI / 2);
        const wMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
        [[-0.9, 0.35, 1.1], [0.9, 0.35, 1.1], [-0.9, 0.35, -1.1], [0.9, 0.35, -1.1]].forEach(p => {
            const w = new THREE.Mesh(wGeo, wMat);
            w.position.set(...p);
            car.add(w);
        });
        return car;
    }

    setupRoundHUD(roundNum) {
        const hudTitle = document.getElementById('ep2-hud-title');
        const hudSub = document.getElementById('ep2-hud-subtitle');
        const round1HUD = document.getElementById('ep2-round1-hud');
        const round2HUD = document.getElementById('ep2-round2-hud');
        const round3HUD = document.getElementById('ep2-round3-hud');

        if (round1HUD) round1HUD.classList.add('hidden');
        if (round2HUD) round2HUD.classList.add('hidden');
        if (round3HUD) round3HUD.classList.add('hidden');

        if (roundNum === 1) {
            if (hudTitle) hudTitle.textContent = "⛰️ ROUND 1 : DÉMARRAGE EN CÔTE";
            if (hudSub) hudSub.textContent = "Maintiens l'accélérateur [↑] en zone verte (2500 - 3500 RPM) puis relâche le frein !";
            if (round1HUD) round1HUD.classList.remove('hidden');
        } else if (roundNum === 2) {
            if (hudTitle) hudTitle.textContent = "🔄 ROUND 2 : LE ROND-POINT DES ENFERS";
            if (hudSub) hudSub.textContent = "Fonce dans le trafic ! Enclenche le clignotant droit [D] pour la sortie 3 !";
            if (round2HUD) round2HUD.classList.remove('hidden');
        } else if (roundNum === 3) {
            if (hudTitle) hudTitle.textContent = "🅿️ ROUND 3 : LE CRÉNEAU DU BOSS";
            if (hudSub) hudSub.textContent = "Recule doucement dans la boîte verte sans heurter les voitures ni le trottoir !";
            if (round3HUD) round3HUD.classList.remove('hidden');
        }

        this.updateStrikesUI();
    }

    updateStrikesUI() {
        const strikesEl = document.getElementById('ep2-strikes-val');
        if (strikesEl) {
            strikesEl.innerHTML = '❌ '.repeat(this.strikes) + '⚪ '.repeat(Math.max(0, this.maxStrikes - this.strikes));
        }
    }

    addStrike(reason) {
        this.strikes++;
        this.updateStrikesUI();

        const toast = document.getElementById('ep2-moniteur-toast');
        const toastMsg = document.getElementById('ep2-moniteur-msg');
        if (toast && toastMsg) {
            toastMsg.textContent = `El Moniteur : "${reason} ! (+1 Faute)"`;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 3500);
        }

        if (this.strikes >= this.maxStrikes) {
            this.triggerGameOver(reason);
        }
    }

    animate() {
        if (!this.isRunning) return;
        requestAnimationFrame(() => this.animate());

        if (this.isPaused) return;

        const delta = Math.min(this.clock.getDelta(), 0.1);
        this.update(delta);
        this.render();
    }

    update(delta) {
        // Blinker flashing
        this.blinkerTimer += delta * 4;
        const blinkOn = Math.floor(this.blinkerTimer) % 2 === 0;

        if (this.roofLight) {
            this.roofLight.material.color.setHex(blinkOn ? 0xf59e0b : 0x78350f);
        }

        if (this.blinkerLights.left.length > 0) {
            const isLeftActive = (this.activeBlinker === 'left') && blinkOn;
            this.blinkerLights.left.forEach(m => m.material.color.setHex(isLeftActive ? 0xf59e0b : 0x221100));
        }

        if (this.blinkerLights.right.length > 0) {
            const isRightActive = (this.activeBlinker === 'right') && blinkOn;
            this.blinkerLights.right.forEach(m => m.material.color.setHex(isRightActive ? 0xf59e0b : 0x221100));
        }

        // Taillights brighten on brake
        const braking = this.keys.down || this.keys.space;
        this.brakeLights.forEach(tl => {
            tl.material.emissive.setHex(braking ? 0xef4444 : 0x7f1d1d);
        });

        // Delegate to current round physics
        if (this.currentRound === 1) this.updateRound1(delta);
        else if (this.currentRound === 2) this.updateRound2(delta);
        else if (this.currentRound === 3) this.updateRound3(delta);

        // Wheel Rotation
        const wheelRotSpeed = (this.carState.speed * delta) / 0.36;
        this.wheels.forEach(w => {
            w.children.forEach(c => c.rotation.x += wheelRotSpeed);
        });

        // Front Wheel Steering Angle
        this.frontWheels.forEach(w => {
            w.rotation.y = this.carState.steeringAngle;
        });

        // Camera Follow (Smooth Chase Cam)
        this.updateCamera(delta);
    }

    // ==========================================
    // UPDATE ROUND 1 (CÔTE)
    // ==========================================
    updateRound1(delta) {
        const rpmBar = document.getElementById('ep2-rpm-bar');
        const rpmText = document.getElementById('ep2-rpm-text');

        if (!this.carState.hillLaunched) {
            // Player is balancing throttle [UP] and brake [DOWN]
            if (this.keys.up) {
                this.carState.rpm = Math.min(6500, this.carState.rpm + delta * 2800);
            } else {
                this.carState.rpm = Math.max(900, this.carState.rpm - delta * 2400);
            }

            const isSweetSpot = (this.carState.rpm >= 2400 && this.carState.rpm <= 3800);
            if (rpmBar) {
                const pct = Math.min(100, (this.carState.rpm / 6500) * 100);
                rpmBar.style.width = pct + '%';
                rpmBar.style.background = isSweetSpot ? '#10b981' : (this.carState.rpm > 3800 ? '#ef4444' : '#38bdf8');
            }
            if (rpmText) rpmText.textContent = `${Math.round(this.carState.rpm)} RPM`;

            this.updateEngineSound(this.carState.rpm);

            // Releasing the brake [DOWN is false] while in sweet spot launches the car!
            if (!this.keys.down && isSweetSpot && this.keys.up) {
                this.carState.hillLaunched = true;
                this.carState.speed = 12;
                const status = document.getElementById('ep2-clutch-status');
                if (status) {
                    status.textContent = "✅ EMBRAYAGE RÉUSSI ! GRAVIS LA CÔTE !";
                    status.style.color = "#10b981";
                }
            } else if (!this.keys.down && this.carState.rpm < 1600) {
                // Calage ! Engine dies
                this.addStrike("Moteur calé ! Embrayage relâché trop bas");
                this.carState.rpm = 900;
                this.carState.speed = 0;
            }
        } else {
            // Car is driving up the hill!
            if (this.keys.up) this.carState.speed = Math.min(22, this.carState.speed + delta * 15);
            else this.carState.speed *= 0.98;

            if (this.keys.left) this.carState.x = Math.max(-4.5, this.carState.x - delta * 8);
            if (this.keys.right) this.carState.x = Math.min(4.5, this.carState.x + delta * 8);

            this.carState.z += this.carState.speed * delta;
            this.car.position.set(this.carState.x, 1.0 + (this.carState.z * Math.sin(this.roadSlope)), this.carState.z * Math.cos(this.roadSlope));
            this.car.rotation.x = -this.roadSlope;

            this.updateEngineSound(this.carState.speed * 180);

            // Checkpoint reached?
            if (this.carState.z >= 175) {
                this.triggerVictory();
            }
        }
    }

    // ==========================================
    // UPDATE ROUND 2 (ROND-POINT)
    // ==========================================
    updateRound2(delta) {
        // Accelerate & Brake
        if (this.keys.up) this.carState.speed = Math.min(this.carState.maxSpeed, this.carState.speed + this.carState.acceleration * delta);
        else if (this.keys.down) this.carState.speed = Math.max(this.carState.maxReverseSpeed, this.carState.speed - this.carState.braking * delta);
        else this.carState.speed *= this.carState.drag;

        // Steering & Drift
        const isDrifting = this.keys.space && Math.abs(this.carState.speed) > 10;
        const steerFactor = isDrifting ? 1.6 : 1.0;

        if (this.keys.left) {
            this.carState.steeringAngle = Math.min(this.carState.maxSteeringAngle, this.carState.steeringAngle + this.carState.steeringSpeed * delta);
            this.carState.rotationY += this.carState.steeringAngle * steerFactor * (this.carState.speed / 20) * delta;
        } else if (this.keys.right) {
            this.carState.steeringAngle = Math.max(-this.carState.maxSteeringAngle, this.carState.steeringAngle - this.carState.steeringSpeed * delta);
            this.carState.rotationY += this.carState.steeringAngle * steerFactor * (this.carState.speed / 20) * delta;
        } else {
            this.carState.steeringAngle *= 0.85;
        }

        // Position update
        this.carState.x += Math.sin(this.carState.rotationY) * this.carState.speed * delta;
        this.carState.z += Math.cos(this.carState.rotationY) * this.carState.speed * delta;

        this.car.position.set(this.carState.x, 0, this.carState.z);
        this.car.rotation.y = this.carState.rotationY;

        this.updateEngineSound(Math.abs(this.carState.speed) * 160);

        // Update AI Traffic
        this.trafficCars.forEach(tc => {
            tc.angle += (tc.speed * delta);
            tc.mesh.position.x = Math.sin(tc.angle) * tc.radius;
            tc.mesh.position.z = Math.cos(tc.angle) * tc.radius;
            tc.mesh.rotation.y = tc.angle + Math.PI / 2;

            // Collision with Agatha
            const dist = this.car.position.distanceTo(tc.mesh.position);
            if (dist < 2.5) {
                this.addStrike("Refus de priorité / Choc avec un véhicule");
                this.carState.speed *= -0.3; // Rebond
            }
        });

        // Exit Check (Exit 3 is at x > 65 and z between -15 and 15)
        if (this.carState.x > 65 && Math.abs(this.carState.z) < 16) {
            if (this.activeBlinker === 'right') {
                this.triggerVictory();
            } else {
                this.addStrike("Sortie de rond-point sans clignotant droit !");
                this.carState.x = 55; // Repousse sur le rond-point
            }
        }

        // Speedometer UI
        const speedEl = document.getElementById('ep2-speed-val');
        if (speedEl) speedEl.textContent = `${Math.round(Math.abs(this.carState.speed) * 3.6)} km/h`;
    }

    // ==========================================
    // UPDATE ROUND 3 (CRÉNEAU DU BOSS)
    // ==========================================
    updateRound3(delta) {
        // Slow precision maneuvering
        const precisionMaxSpeed = 8;
        const precisionReverse = -6;

        if (this.keys.up) this.carState.speed = Math.min(precisionMaxSpeed, this.carState.speed + 8 * delta);
        else if (this.keys.down) this.carState.speed = Math.max(precisionReverse, this.carState.speed - 8 * delta);
        else this.carState.speed *= 0.88;

        const steerMultiplier = (this.carState.speed < 0) ? -1 : 1;
        if (this.keys.left) {
            this.carState.steeringAngle = Math.min(this.carState.maxSteeringAngle * 1.2, this.carState.steeringAngle + 2.5 * delta);
            this.carState.rotationY += this.carState.steeringAngle * steerMultiplier * 1.5 * delta;
        } else if (this.keys.right) {
            this.carState.steeringAngle = Math.max(-this.carState.maxSteeringAngle * 1.2, this.carState.steeringAngle - 2.5 * delta);
            this.carState.rotationY += this.carState.steeringAngle * steerMultiplier * 1.5 * delta;
        } else {
            this.carState.steeringAngle *= 0.85;
        }

        this.carState.x += Math.sin(this.carState.rotationY) * this.carState.speed * delta;
        this.carState.z += Math.cos(this.carState.rotationY) * this.carState.speed * delta;

        this.car.position.set(this.carState.x, 0, this.carState.z);
        this.car.rotation.y = this.carState.rotationY;

        this.updateEngineSound(Math.abs(this.carState.speed) * 200 + 800);

        // Distance calculations for parking sensor & checks
        const distToSidewalk = Math.abs(6.5 - this.carState.x);
        const distToRearCar = Math.abs(this.carState.z - (-7.5));
        const distToFrontCar = Math.abs(this.carState.z - 7.5);

        const minObsDist = Math.min(distToRearCar, distToFrontCar, distToSidewalk);
        this.playSensorBeep(minObsDist);

        // Ultrasonic sensor UI bar
        const sensorBar = document.getElementById('ep2-sensor-fill');
        if (sensorBar) {
            const pct = Math.max(0, Math.min(100, (1 - (minObsDist / 6)) * 100));
            sensorBar.style.width = pct + '%';
            sensorBar.style.background = (minObsDist < 1.0) ? '#ef4444' : (minObsDist < 2.5 ? '#f59e0b' : '#10b981');
        }

        // Choc trottoir ou voiture ?
        if (this.carState.x > 6.8) {
            this.addStrike("Choc sur la bordure de trottoir !");
            this.carState.x = 6.4;
            this.carState.speed = 0;
        }

        if (Math.abs(this.carState.x - 5.0) < 1.6 && (this.carState.z < -5.5 || this.carState.z > 5.5)) {
            this.addStrike("Collision avec un véhicule en stationnement !");
            this.carState.speed = 0;
        }

        // Check if parked inside the green box!
        const insideX = Math.abs(this.carState.x - 5.0) < 0.6;
        const insideZ = Math.abs(this.carState.z) < 1.6;
        const alignedAngle = Math.abs(this.carState.rotationY % Math.PI) < 0.15;
        const isStopped = Math.abs(this.carState.speed) < 0.2;

        if (insideX && insideZ && alignedAngle && isStopped) {
            this.triggerVictory();
        }
    }

    updateCamera(delta) {
        if (!this.car || !this.camera) return;

        // Ideal position behind car
        const offset = new THREE.Vector3(0, 3.2, -6.5);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.car.rotation.y);

        const targetPos = this.car.position.clone().add(offset);
        this.camera.position.lerp(targetPos, delta * 6);

        const lookAtPos = this.car.position.clone().add(new THREE.Vector3(0, 1.2, 0));
        this.camera.lookAt(lookAtPos);
    }

    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseModal = document.getElementById('pause-modal');
        if (pauseModal) {
            if (this.isPaused) pauseModal.classList.remove('hidden');
            else pauseModal.classList.add('hidden');
        }
    }

    triggerVictory() {
        this.isRunning = false;
        this.stopAudio();

        if (typeof saveManager !== 'undefined') {
            saveManager.completeEp2Round(this.currentRound);
        }

        if (typeof audioManager !== 'undefined') {
            audioManager.playBgm(AUDIO_TRACKS.VICTORY);
        }

        const engine = (typeof GameEngine !== 'undefined') ? GameEngine.getInstance() : null;
        if (engine && engine.stateMachine) {
            engine.stateMachine.setState(STATES.EPISODE2_VICTORY);
        }
    }

    triggerGameOver(reason) {
        this.isRunning = false;
        this.stopAudio();

        if (typeof audioManager !== 'undefined') {
            audioManager.playBgm(AUDIO_TRACKS.GAMEOVER);
        }

        const reasonEl = document.getElementById('ep2-gameover-reason');
        if (reasonEl) reasonEl.textContent = `Motif de recalage : ${reason}`;

        const engine = (typeof GameEngine !== 'undefined') ? GameEngine.getInstance() : null;
        if (engine && engine.stateMachine) {
            engine.stateMachine.setState(STATES.EPISODE2_GAMEOVER);
        }
    }
}

window.drivingEngine3D = new DrivingEngine3D();

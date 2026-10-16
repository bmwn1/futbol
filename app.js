/**
 * ARENA PRIME // FUTBOL 360
 * High-performance Interactive Football Experience
 */

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initAmbientCanvas();
    initAudioEngine();
    initPenaltyGame();
    initTacticsBoard();
    initMatchCenter();
    init3DTiltCards();
    initQuizEngine();
    initNavScroll();
});

/* ==========================================================================
   1. PRELOADER & NAVBAR
   ========================================================================== */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    const hide = () => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
    };
    if (document.readyState === 'complete') {
        setTimeout(hide, 400);
    } else {
        window.addEventListener('load', () => setTimeout(hide, 400));
        setTimeout(hide, 1200); // Reliable fallback
    }
}

function initNavScroll() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
}

/* ==========================================================================
   2. SYNTHESIZED WEB AUDIO ENGINE (STADIUM SFX)
   Zero external audio files needed; 100% reliable & offline-capable.
   ========================================================================== */
let audioCtx = null;
let isAudioActive = false;
let crowdGainNode = null;
let crowdSourceNode = null;

function initAudioEngine() {
    const audioBtn = document.getElementById('audioToggleBtn');
    const audioText = document.getElementById('audioBtnText');

    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContextClass();
        }

        isAudioActive = !isAudioActive;

        if (isAudioActive) {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            audioBtn.classList.add('audio-playing');
            if (audioText) audioText.innerHTML = '<i class="fa-solid fa-volume-high"></i> Stadion: ON';
            startSynthesizedCrowd();
            playWhistleSound();
        } else {
            audioBtn.classList.remove('audio-playing');
            if (audioText) audioText.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> Stadion: OFF';
            stopSynthesizedCrowd();
        }
    });
}

// Generate continuous cheering stadium drone using filtered pink noise
function startSynthesizedCrowd() {
    if (!audioCtx || !isAudioActive) return;

    // First ensure any existing sound node is killed
    stopSynthesizedCrowd();

    try {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const bufferSize = audioCtx.sampleRate * 2.5;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
            b6 = white * 0.115926;
        }

        crowdSourceNode = audioCtx.createBufferSource();
        crowdSourceNode.buffer = noiseBuffer;
        crowdSourceNode.loop = true;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, audioCtx.currentTime);
        filter.Q.setValueAtTime(2.2, audioCtx.currentTime);

        crowdGainNode = audioCtx.createGain();
        crowdGainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);

        crowdSourceNode.connect(filter);
        filter.connect(crowdGainNode);
        crowdGainNode.connect(audioCtx.destination);
        crowdSourceNode.start(0);
    } catch (e) {
        console.warn('Audio synthesis notice:', e);
    }
}

// Complete and immediate silence
function stopSynthesizedCrowd() {
    if (crowdGainNode && audioCtx) {
        try {
            crowdGainNode.gain.cancelScheduledValues(0);
            crowdGainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            crowdGainNode.gain.value = 0;
            crowdGainNode.disconnect();
        } catch (e) {}
        crowdGainNode = null;
    }

    if (crowdSourceNode) {
        try {
            crowdSourceNode.stop(0);
            crowdSourceNode.disconnect();
        } catch (e) {}
        crowdSourceNode = null;
    }

    if (audioCtx && audioCtx.state === 'running') {
        try {
            audioCtx.suspend();
        } catch (e) {}
    }
}

// Referee Whistle Sound
function playWhistleSound() {
    if (!isAudioActive || !audioCtx || audioCtx.state !== 'running') return;
    try {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(2700, audioCtx.currentTime);
        osc2.frequency.setValueAtTime(2950, audioCtx.currentTime);

        const vibrato = audioCtx.createOscillator();
        const vibratoGain = audioCtx.createGain();
        vibrato.frequency.setValueAtTime(35, audioCtx.currentTime);
        vibratoGain.gain.setValueAtTime(150, audioCtx.currentTime);
        vibrato.connect(osc1.frequency);
        vibrato.connect(osc2.frequency);
        vibrato.start();

        gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.32);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(audioCtx.currentTime + 0.32);
        osc2.stop(audioCtx.currentTime + 0.32);
        vibrato.stop(audioCtx.currentTime + 0.32);
    } catch(e) {}
}

// Ball Kick Sound
function playKickSound() {
    if (!isAudioActive || !audioCtx || audioCtx.state !== 'running') return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } catch(e) {}
}

// Goal Roar Fanfare
function playGoalSound() {
    if (!isAudioActive || !audioCtx || audioCtx.state !== 'running') return;
    playWhistleSound();
    try {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, index) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.08);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime + index * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + index * 0.08 + 0.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime + index * 0.08);
            osc.stop(audioCtx.currentTime + index * 0.08 + 0.5);
        });
    } catch(e) {}
}

/* ==========================================================================
   3. INTERACTIVE PENALTY SHOOTOUT CANVAS GAME
   ========================================================================== */
function initPenaltyGame() {
    const canvas = document.getElementById('penaltyCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.parentElement.clientWidth;
    let height = canvas.parentElement.clientHeight;

    function resize() {
        width = canvas.parentElement.clientWidth;
        height = canvas.parentElement.clientHeight;
        canvas.width = width;
        canvas.height = height;
    }
    resize();
    window.addEventListener('resize', resize);

    // Score State
    let goals = 0;
    let saves = 0;
    let streak = 0;
    let bestStreak = 0;

    const goalsEl = document.getElementById('statGoals');
    const savesEl = document.getElementById('statSaves');
    const streakEl = document.getElementById('statStreak');
    const overlayMsg = document.getElementById('penaltyOverlayMsg');
    const kickBtn = document.getElementById('btnKickBall');
    const resetBtn = document.getElementById('btnResetPenalty');

    // Power Meter
    let power = 50;
    let powerDirection = 1;
    let powerActive = true;
    const powerFill = document.getElementById('powerFill');
    const powerVal = document.getElementById('powerVal');

    setInterval(() => {
        if (!powerActive) return;
        power += powerDirection * 2.8;
        if (power >= 100) {
            power = 100;
            powerDirection = -1;
        } else if (power <= 10) {
            power = 10;
            powerDirection = 1;
        }
        if (powerFill) powerFill.style.width = power + '%';
        if (powerVal) powerVal.textContent = Math.round(power) + '%';
    }, 25);

    // Game objects
    let targetX = width * 0.5;
    let targetY = height * 0.35;

    // Goalkeeper
    const keeper = {
        x: width * 0.5,
        y: height * 0.45,
        targetX: width * 0.5,
        targetY: height * 0.45,
        width: 44,
        height: 80,
        diving: false,
        diveProgress: 0,
        state: 'idle' // idle, diving, saved
    };

    // Football
    const ball = {
        x: width * 0.5,
        y: height * 0.88,
        startX: width * 0.5,
        startY: height * 0.88,
        radius: 18,
        targetX: width * 0.5,
        targetY: height * 0.35,
        progress: 0,
        isFlying: false,
        trail: []
    };

    // Goal Post Dimensions
    function getGoalBox() {
        const gw = width * 0.65;
        const gh = height * 0.46;
        const gx = (width - gw) / 2;
        const gy = height * 0.16;
        return { x: gx, y: gy, w: gw, h: gh };
    }

    // Aim on Canvas Click
    canvas.addEventListener('mousemove', (e) => {
        if (ball.isFlying) return;
        const rect = canvas.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
    });

    canvas.addEventListener('click', (e) => {
        if (ball.isFlying) return;
        const rect = canvas.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
        executeKick();
    });

    if (kickBtn) {
        kickBtn.addEventListener('click', executeKick);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            goals = 0;
            saves = 0;
            streak = 0;
            updateScoreUI();
            resetBallAndKeeper();
        });
    }

    function executeKick() {
        if (ball.isFlying) return;
        powerActive = false;
        ball.isFlying = true;
        ball.progress = 0;
        ball.startX = width * 0.5;
        ball.startY = height * 0.88;
        ball.targetX = targetX;
        ball.targetY = targetY;
        ball.trail = [];

        playKickSound();

        // AI Goalkeeper Decision
        keeper.diving = true;
        keeper.state = 'diving';

        // Keeper predicts a direction (Left, Center, Right)
        const gBox = getGoalBox();
        const rand = Math.random();
        let keeperChoiceX;
        if (rand < 0.42) {
            // Dive left
            keeperChoiceX = gBox.x + gBox.w * 0.22;
        } else if (rand < 0.84) {
            // Dive right
            keeperChoiceX = gBox.x + gBox.w * 0.78;
        } else {
            // Stay center
            keeperChoiceX = gBox.x + gBox.w * 0.5;
        }

        keeper.targetX = keeperChoiceX;
        keeper.targetY = gBox.y + gBox.h * 0.65 + (Math.random() * 20 - 10);
    }

    function checkOutcome() {
        const gBox = getGoalBox();
        const isInsideGoal = (
            ball.targetX >= gBox.x + 12 &&
            ball.targetX <= gBox.x + gBox.w - 12 &&
            ball.targetY >= gBox.y + 10 &&
            ball.targetY <= gBox.y + gBox.h
        );

        // Distance from ball target to keeper target
        const distToKeeper = Math.hypot(ball.targetX - keeper.targetX, ball.targetY - keeper.targetY);
        const keeperReach = 58;

        if (!isInsideGoal) {
            // Off-target or post
            showPenaltyNotice("NOANIQ ZARBA! 💨", "saved");
            saves++;
            streak = 0;
        } else if (distToKeeper < keeperReach) {
            // Keeper saves!
            showPenaltyNotice("DAHSHATLI SEYV! 🧤", "saved");
            saves++;
            streak = 0;
            playWhistleSound();
        } else {
            // GOAL!
            showPenaltyNotice("GOOOOOOL! ⚽🔥", "goal");
            goals++;
            streak++;
            if (streak > bestStreak) bestStreak = streak;
            playGoalSound();
            spawnConfetti(canvas);
        }

        updateScoreUI();

        setTimeout(() => {
            resetBallAndKeeper();
            powerActive = true;
        }, 2200);
    }

    function showPenaltyNotice(text, type) {
        if (!overlayMsg) return;
        overlayMsg.textContent = text;
        overlayMsg.className = `penalty-overlay-message ${type} active`;
        setTimeout(() => {
            overlayMsg.classList.remove('active');
        }, 1800);
    }

    function updateScoreUI() {
        if (goalsEl) goalsEl.textContent = goals;
        if (savesEl) savesEl.textContent = saves;
        if (streakEl) streakEl.textContent = streak;
    }

    function resetBallAndKeeper() {
        ball.isFlying = false;
        ball.progress = 0;
        ball.x = width * 0.5;
        ball.y = height * 0.88;
        ball.trail = [];

        keeper.x = width * 0.5;
        keeper.y = height * 0.45;
        keeper.targetX = width * 0.5;
        keeper.diving = false;
        keeper.state = 'idle';
    }

    // Render Loop
    function render() {
        ctx.clearRect(0, 0, width, height);

        const gBox = getGoalBox();

        // 1. Draw Pitch Perspective Grass Lines
        ctx.fillStyle = '#05180c';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(0, 255, 135, 0.12)';
        ctx.lineWidth = 2;
        // Pitch lines vanishing towards goal
        for (let i = -4; i <= 4; i++) {
            ctx.beginPath();
            ctx.moveTo(width * 0.5 + i * (width * 0.12), height);
            ctx.lineTo(gBox.x + (i + 4) * (gBox.w / 8), gBox.y + gBox.h);
            ctx.stroke();
        }

        // Penalty Spot
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.88, 5, 0, Math.PI * 2);
        ctx.fill();

        // 2. Draw Goal Post & Net
        // Net Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(gBox.x, gBox.y, gBox.w, gBox.h);

        // Net Mesh
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        const netSpacing = 16;
        for (let x = gBox.x; x <= gBox.x + gBox.w; x += netSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, gBox.y);
            ctx.lineTo(x, gBox.y + gBox.h);
            ctx.stroke();
        }
        for (let y = gBox.y; y <= gBox.y + gBox.h; y += netSpacing) {
            ctx.beginPath();
            ctx.moveTo(gBox.x, y);
            ctx.lineTo(gBox.x + gBox.w, y);
            ctx.stroke();
        }

        // Post Bars (Thick Neon White)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 10;
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(0, 255, 135, 0.5)';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(gBox.x, gBox.y + gBox.h);
        ctx.lineTo(gBox.x, gBox.y);
        ctx.lineTo(gBox.x + gBox.w, gBox.y);
        ctx.lineTo(gBox.x + gBox.w, gBox.y + gBox.h);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // 3. Draw Goalkeeper
        if (keeper.diving) {
            keeper.x += (keeper.targetX - keeper.x) * 0.14;
            keeper.y += (keeper.targetY - keeper.y) * 0.14;
        } else {
            // Idle bounce
            keeper.x = width * 0.5 + Math.sin(Date.now() * 0.003) * 20;
            keeper.y = gBox.y + gBox.h * 0.72;
        }

        // Goalkeeper Body
        ctx.save();
        ctx.translate(keeper.x, keeper.y);

        // Gloves
        ctx.fillStyle = '#ffbe0b';
        ctx.beginPath();
        ctx.arc(-22, -10, 8, 0, Math.PI * 2);
        ctx.arc(22, -10, 8, 0, Math.PI * 2);
        ctx.fill();

        // Jersey (Cyan/Gold GK Kit)
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.roundRect(-16, -25, 32, 45, 6);
        ctx.fill();

        // Head
        ctx.fillStyle = '#f6d8be';
        ctx.beginPath();
        ctx.arc(0, -38, 12, 0, Math.PI * 2);
        ctx.fill();

        // Shorts & Legs
        ctx.fillStyle = '#0a101d';
        ctx.fillRect(-14, 20, 10, 26);
        ctx.fillRect(4, 20, 10, 26);
        ctx.restore();

        // 4. Aim Target Indicator (when not flying)
        if (!ball.isFlying) {
            ctx.strokeStyle = 'rgba(0, 255, 135, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(targetX, targetY, 14, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(targetX - 20, targetY);
            ctx.lineTo(targetX + 20, targetY);
            ctx.moveTo(targetX, targetY - 20);
            ctx.lineTo(targetX, targetY + 20);
            ctx.stroke();
        }

        // 5. Draw Football & Trail
        if (ball.isFlying) {
            ball.progress += 0.045 * (power / 50);

            // Curve calculation
            const curX = ball.startX + (ball.targetX - ball.startX) * ball.progress;
            const curY = ball.startY + (ball.targetY - ball.startY) * ball.progress - Math.sin(ball.progress * Math.PI) * 45;
            const curRadius = 18 - (ball.progress * 8); // scales down into distance

            ball.x = curX;
            ball.y = curY;
            ball.trail.push({ x: curX, y: curY, r: curRadius });

            if (ball.trail.length > 8) ball.trail.shift();

            // Draw glowing trail
            ball.trail.forEach((t, idx) => {
                ctx.fillStyle = `rgba(0, 255, 135, ${idx * 0.08})`;
                ctx.beginPath();
                ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
                ctx.fill();
            });

            if (ball.progress >= 1) {
                ball.isFlying = false;
                checkOutcome();
            }
        }

        // Draw Ball
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 255, 135, 0.6)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        const drawRadius = ball.isFlying ? (18 - ball.progress * 8) : 18;
        ctx.arc(ball.x, ball.y, Math.max(8, drawRadius), 0, Math.PI * 2);
        ctx.fill();

        // Ball Pentagons Pattern
        ctx.fillStyle = '#05070a';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, Math.max(3, drawRadius * 0.38), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        requestAnimationFrame(render);
    }
    render();
}

// Particle Confetti Burst
function spawnConfetti(canvas) {
    const parent = canvas.parentElement;
    for (let i = 0; i < 40; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti-particle';
        conf.style.position = 'absolute';
        conf.style.left = (Math.random() * 80 + 10) + '%';
        conf.style.top = '30%';
        conf.style.width = (Math.random() * 8 + 4) + 'px';
        conf.style.height = (Math.random() * 8 + 4) + 'px';
        conf.style.backgroundColor = ['#00ff87', '#ffbe0b', '#00f0ff', '#ffffff'][Math.floor(Math.random() * 4)];
        conf.style.borderRadius = '2px';
        conf.style.zIndex = '30';
        conf.style.pointerEvents = 'none';
        conf.style.transition = 'all 1s cubic-bezier(0.2, 0.8, 0.3, 1)';
        parent.appendChild(conf);

        setTimeout(() => {
            conf.style.transform = `translate(${Math.random() * 200 - 100}px, ${Math.random() * 250 + 50}px) rotate(${Math.random() * 360}deg)`;
            conf.style.opacity = '0';
        }, 20);

        setTimeout(() => conf.remove(), 1200);
    }
}

/* ==========================================================================
   4. INTERACTIVE TACTICAL FORMATION ENGINE & ROSTER
   ========================================================================== */
const TACTICAL_DATABASE = {
    formations: {
        '4-3-3': [
            { id: 1, num: 1, name: 'Courtois', role: 'GK', x: 50, y: 88, ovr: 90, pac: 46, sho: 20, pas: 68, dri: 42, def: 90, phy: 86, club: 'Real Madrid', val: '€28M' },
            { id: 2, num: 2, name: 'Walker', role: 'RB', x: 86, y: 70, ovr: 84, pac: 90, sho: 63, pas: 78, dri: 79, def: 81, phy: 82, club: 'Man City', val: '€18M' },
            { id: 3, num: 4, name: 'Van Dijk', role: 'CB', x: 63, y: 72, ovr: 89, pac: 78, sho: 60, pas: 71, dri: 72, def: 90, phy: 86, club: 'Liverpool', val: '€32M' },
            { id: 4, num: 5, name: 'Saliba', role: 'CB', x: 37, y: 72, ovr: 88, pac: 83, sho: 40, pas: 72, dri: 74, def: 88, phy: 84, club: 'Arsenal', val: '€80M' },
            { id: 5, num: 3, name: 'Theo', role: 'LB', x: 14, y: 70, ovr: 87, pac: 94, sho: 73, pas: 78, dri: 84, def: 80, phy: 84, club: 'AC Milan', val: '€60M' },
            { id: 6, num: 16, name: 'Rodri', role: 'CDM', x: 50, y: 54, ovr: 91, pac: 66, sho: 80, pas: 86, dri: 84, def: 87, phy: 85, club: 'Man City', val: '€130M' },
            { id: 7, num: 17, name: 'De Bruyne', role: 'CM', x: 72, y: 44, ovr: 90, pac: 72, sho: 87, pas: 94, dri: 87, def: 65, phy: 75, club: 'Man City', val: '€50M' },
            { id: 8, num: 5, name: 'Bellingham', role: 'CM', x: 28, y: 44, ovr: 91, pac: 80, sho: 87, pas: 88, dri: 90, def: 80, phy: 84, club: 'Real Madrid', val: '€180M' },
            { id: 9, num: 19, name: 'Lamine Yamal', role: 'RW', x: 84, y: 24, ovr: 87, pac: 92, sho: 82, pas: 86, dri: 93, def: 35, phy: 68, club: 'Barcelona', val: '€150M' },
            { id: 10, num: 9, name: 'Haaland', role: 'ST', x: 50, y: 18, ovr: 93, pac: 89, sho: 94, pas: 70, dri: 81, def: 45, phy: 88, club: 'Man City', val: '€180M' },
            { id: 11, num: 7, name: 'Mbappé', role: 'LW', x: 16, y: 24, ovr: 93, pac: 97, sho: 90, pas: 82, dri: 92, def: 36, phy: 78, club: 'Real Madrid', val: '€180M' }
        ],
        '4-2-3-1': [
            { id: 1, num: 1, name: 'Courtois', role: 'GK', x: 50, y: 88, ovr: 90, pac: 46, sho: 20, pas: 68, dri: 42, def: 90, phy: 86, club: 'Real Madrid', val: '€28M' },
            { id: 2, num: 2, name: 'Walker', role: 'RB', x: 86, y: 72, ovr: 84, pac: 90, sho: 63, pas: 78, dri: 79, def: 81, phy: 82, club: 'Man City', val: '€18M' },
            { id: 3, num: 4, name: 'Van Dijk', role: 'CB', x: 62, y: 75, ovr: 89, pac: 78, sho: 60, pas: 71, dri: 72, def: 90, phy: 86, club: 'Liverpool', val: '€32M' },
            { id: 4, num: 5, name: 'Saliba', role: 'CB', x: 38, y: 75, ovr: 88, pac: 83, sho: 40, pas: 72, dri: 74, def: 88, phy: 84, club: 'Arsenal', val: '€80M' },
            { id: 5, num: 3, name: 'Theo', role: 'LB', x: 14, y: 72, ovr: 87, pac: 94, sho: 73, pas: 78, dri: 84, def: 80, phy: 84, club: 'AC Milan', val: '€60M' },
            { id: 6, num: 41, name: 'Rice', role: 'CDM', x: 36, y: 58, ovr: 88, pac: 75, sho: 70, pas: 83, dri: 81, def: 87, phy: 86, club: 'Arsenal', val: '€120M' },
            { id: 7, num: 16, name: 'Rodri', role: 'CDM', x: 64, y: 58, ovr: 91, pac: 66, sho: 80, pas: 86, dri: 84, def: 87, phy: 85, club: 'Man City', val: '€130M' },
            { id: 8, num: 7, name: 'Saka', role: 'RAM', x: 80, y: 38, ovr: 88, pac: 88, sho: 84, pas: 85, dri: 89, def: 60, phy: 76, club: 'Arsenal', val: '€140M' },
            { id: 9, num: 5, name: 'Bellingham', role: 'CAM', x: 50, y: 36, ovr: 91, pac: 80, sho: 87, pas: 88, dri: 90, def: 80, phy: 84, club: 'Real Madrid', val: '€180M' },
            { id: 10, num: 7, name: 'Vinicius Jr', role: 'LAM', x: 20, y: 38, ovr: 92, pac: 96, sho: 86, pas: 83, dri: 93, def: 34, phy: 72, club: 'Real Madrid', val: '€200M' },
            { id: 11, num: 9, name: 'Haaland', role: 'ST', x: 50, y: 18, ovr: 93, pac: 89, sho: 94, pas: 70, dri: 81, def: 45, phy: 88, club: 'Man City', val: '€180M' }
        ],
        '3-5-2': [
            { id: 1, num: 1, name: 'Courtois', role: 'GK', x: 50, y: 88, ovr: 90, pac: 46, sho: 20, pas: 68, dri: 42, def: 90, phy: 86, club: 'Real Madrid', val: '€28M' },
            { id: 2, num: 24, name: 'Gvardiol', role: 'CB', x: 75, y: 74, ovr: 86, pac: 82, sho: 60, pas: 78, dri: 80, def: 85, phy: 84, club: 'Man City', val: '€75M' },
            { id: 3, num: 4, name: 'Van Dijk', role: 'CB', x: 50, y: 75, ovr: 89, pac: 78, sho: 60, pas: 71, dri: 72, def: 90, phy: 86, club: 'Liverpool', val: '€32M' },
            { id: 4, num: 5, name: 'Saliba', role: 'CB', x: 25, y: 74, ovr: 88, pac: 83, sho: 40, pas: 72, dri: 74, def: 88, phy: 84, club: 'Arsenal', val: '€80M' },
            { id: 5, num: 2, name: 'Hakimi', role: 'RWB', x: 90, y: 48, ovr: 86, pac: 93, sho: 75, pas: 80, dri: 83, def: 77, phy: 79, club: 'PSG', val: '€65M' },
            { id: 6, num: 16, name: 'Rodri', role: 'CM', x: 62, y: 54, ovr: 91, pac: 66, sho: 80, pas: 86, dri: 84, def: 87, phy: 85, club: 'Man City', val: '€130M' },
            { id: 7, num: 5, name: 'Bellingham', role: 'CAM', x: 50, y: 38, ovr: 91, pac: 80, sho: 87, pas: 88, dri: 90, def: 80, phy: 84, club: 'Real Madrid', val: '€180M' },
            { id: 8, num: 17, name: 'De Bruyne', role: 'CM', x: 38, y: 54, ovr: 90, pac: 72, sho: 87, pas: 94, dri: 87, def: 65, phy: 75, club: 'Man City', val: '€50M' },
            { id: 9, num: 3, name: 'Theo', role: 'LWB', x: 10, y: 48, ovr: 87, pac: 94, sho: 73, pas: 78, dri: 84, def: 80, phy: 84, club: 'AC Milan', val: '€60M' },
            { id: 10, num: 9, name: 'Haaland', role: 'ST', x: 62, y: 18, ovr: 93, pac: 89, sho: 94, pas: 70, dri: 81, def: 45, phy: 88, club: 'Man City', val: '€180M' },
            { id: 11, num: 7, name: 'Mbappé', role: 'ST', x: 38, y: 18, ovr: 93, pac: 97, sho: 90, pas: 82, dri: 92, def: 36, phy: 78, club: 'Real Madrid', val: '€180M' }
        ]
    }
};

function initTacticsBoard() {
    const pitchBox = document.getElementById('pitchNodesWrap');
    const formationBtns = document.querySelectorAll('.btn-formation');

    if (!pitchBox) return;

    let currentFormation = '4-3-3';

    function renderPlayers() {
        pitchBox.innerHTML = '';
        const roster = TACTICAL_DATABASE.formations[currentFormation];

        roster.forEach((player) => {
            const node = document.createElement('div');
            node.className = 'player-node';
            node.style.left = player.x + '%';
            node.style.top = player.y + '%';

            const disc = document.createElement('div');
            disc.className = `player-disc ${player.role === 'GK' ? 'gk' : ''}`;
            disc.textContent = player.num;

            const nameBadge = document.createElement('div');
            nameBadge.className = 'player-node-name';
            nameBadge.textContent = player.name;

            node.appendChild(disc);
            node.appendChild(nameBadge);

            node.addEventListener('click', () => {
                document.querySelectorAll('.player-node').forEach(n => n.classList.remove('selected'));
                node.classList.add('selected');
                updatePlayerDossier(player);
                playKickSound();
            });

            pitchBox.appendChild(node);
        });

        // Auto select striker on load
        const striker = roster.find(p => p.role === 'ST') || roster[0];
        updatePlayerDossier(striker);
    }

    formationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            formationBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFormation = btn.dataset.formation;
            renderPlayers();
        });
    });

    renderPlayers();
}

function updatePlayerDossier(player) {
    const nameEl = document.getElementById('dossierName');
    const roleEl = document.getElementById('dossierRole');
    const clubEl = document.getElementById('dossierClub');
    const valEl = document.getElementById('dossierValue');
    const ovrEl = document.getElementById('dossierOvr');

    if (nameEl) nameEl.textContent = player.name;
    if (roleEl) roleEl.textContent = `${player.role} #${player.num}`;
    if (clubEl) clubEl.textContent = player.club;
    if (valEl) valEl.textContent = player.val;
    if (ovrEl) ovrEl.textContent = player.ovr;

    // Update Skill Bars
    const stats = [
        { id: 'barPac', val: player.pac, txtId: 'numPac' },
        { id: 'barSho', val: player.sho, txtId: 'numSho' },
        { id: 'barPas', val: player.pas, txtId: 'numPas' },
        { id: 'barDri', val: player.dri, txtId: 'numDri' },
        { id: 'barDef', val: player.def, txtId: 'numDef' },
        { id: 'barPhy', val: player.phy, txtId: 'numPhy' }
    ];

    stats.forEach(st => {
        const bar = document.getElementById(st.id);
        const txt = document.getElementById(st.txtId);
        if (bar) bar.style.width = st.val + '%';
        if (txt) txt.textContent = st.val;
    });
}

/* ==========================================================================
   5. LIVE MATCH CENTER, TICKER & MODAL INSIGHTS
   ========================================================================== */
const MATCH_DATABASE = [
    {
        id: 'm1',
        league: 'UCL',
        leagueName: 'UEFA Chempionlar Ligasi',
        status: 'LIVE 78\'',
        home: 'Real Madrid',
        homeLogo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
        away: 'Man City',
        awayLogo: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
        homeScore: 3,
        awayScore: 2,
        possession: [54, 46],
        shots: [14, 11],
        shotsOnTarget: [7, 5],
        xg: ['2.14', '1.82'],
        events: [
            { time: '14\'', text: '⚽ Vinicius Jr (Assist: Bellingham)' },
            { time: '29\'', text: '⚽ Haaland (Assist: De Bruyne)' },
            { time: '55\'', text: '⚽ Mbappé (Ajoyib zarba!)' },
            { time: '67\'', text: '⚽ Phil Foden (Uzoqdan zarba)' },
            { time: '74\'', text: '⚽ Bellingham (Bosh bilan gol)' }
        ]
    },
    {
        id: 'm2',
        league: 'EPL',
        leagueName: 'Premier League',
        status: 'LIVE 61\'',
        home: 'Arsenal',
        homeLogo: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
        away: 'Liverpool',
        awayLogo: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
        homeScore: 2,
        awayScore: 1,
        possession: [51, 49],
        shots: [12, 10],
        shotsOnTarget: [6, 4],
        xg: ['1.65', '1.20'],
        events: [
            { time: '22\'', text: '⚽ Bukayo Saka (Penalti)' },
            { time: '40\'', text: '⚽ Mohamed Salah' },
            { time: '58\'', text: '⚽ Declan Rice' }
        ]
    },
    {
        id: 'm3',
        league: 'LALIGA',
        leagueName: 'La Liga',
        status: 'LIVE 34\'',
        home: 'Barcelona',
        homeLogo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
        away: 'Atletico Madrid',
        awayLogo: 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
        homeScore: 1,
        awayScore: 0,
        possession: [65, 35],
        shots: [9, 3],
        shotsOnTarget: [4, 1],
        xg: ['1.15', '0.28'],
        events: [
            { time: '19\'', text: '⚽ Lamine Yamal (Sehrli dribling va gol)' }
        ]
    },
    {
        id: 'm4',
        league: 'SERIEA',
        leagueName: 'Serie A',
        status: 'Tugadi',
        home: 'Inter Milan',
        homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
        away: 'Juventus',
        awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg',
        homeScore: 2,
        awayScore: 2,
        possession: [58, 42],
        shots: [16, 9],
        shotsOnTarget: [6, 4],
        xg: ['2.01', '1.45'],
        events: [
            { time: '12\'', text: '⚽ Lautaro Martinez' },
            { time: '35\'', text: '⚽ Vlahovic' },
            { time: '52\'', text: '⚽ Barella' },
            { time: '88\'', text: '⚽ Yildiz (Durang gol)' }
        ]
    },
    {
        id: 'm5',
        league: 'SUPERLIGA',
        leagueName: 'O\'zbekiston Superligasi',
        status: 'LIVE 82\'',
        home: 'Paxtakor',
        homeLogo: 'https://upload.wikimedia.org/wikipedia/en/5/52/Pakhtakor_Tashkent_logo.svg',
        away: 'Navbahor',
        awayLogo: 'https://upload.wikimedia.org/wikipedia/en/f/f6/Navbahor_Namangan_logo.png',
        homeScore: 2,
        awayScore: 1,
        possession: [53, 47],
        shots: [11, 8],
        shotsOnTarget: [5, 4],
        xg: ['1.70', '1.10'],
        events: [
            { time: '15\'', text: '⚽ Dragan Ceran' },
            { time: '49\'', text: '⚽ Jamshid Iskanderov' },
            { time: '77\'', text: '⚽ Doston Hamdamov' }
        ]
    }
];

function initMatchCenter() {
    const grid = document.getElementById('matchesGrid');
    const filterBtns = document.querySelectorAll('.pill-btn');
    const modalBackdrop = document.getElementById('matchModalBackdrop');
    const modalClose = document.getElementById('modalCloseBtn');

    if (!grid) return;

    let activeFilter = 'ALL';

    function renderMatches() {
        grid.innerHTML = '';
        const filtered = activeFilter === 'ALL' 
            ? MATCH_DATABASE 
            : MATCH_DATABASE.filter(m => m.league === activeFilter);

        filtered.forEach(m => {
            const card = document.createElement('div');
            card.className = 'match-card-futuristic';
            const isLive = m.status.includes('LIVE');

            card.innerHTML = `
                <div class="match-top-row">
                    <span class="league-tag"><i class="fa-solid fa-trophy"></i> ${m.leagueName}</span>
                    <span class="status-badge ${isLive ? 'live' : 'finished'}">${m.status}</span>
                </div>
                <div class="match-score-row">
                    <div class="team-block">
                        <img src="${m.homeLogo}" alt="${m.home}" onerror="this.src='https://crests.football-data.org/65.svg'">
                        <span class="team-name">${m.home}</span>
                    </div>
                    <div class="score-center">
                        <div class="score-display">${m.homeScore} : ${m.awayScore}</div>
                    </div>
                    <div class="team-block away">
                        <img src="${m.awayLogo}" alt="${m.away}" onerror="this.src='https://crests.football-data.org/57.svg'">
                        <span class="team-name">${m.away}</span>
                    </div>
                </div>
                <div class="match-bottom-details">
                    <span>xG: ${m.xg[0]} - ${m.xg[1]}</span>
                    <span class="btn-match-insights">Batafsil Tahlil <i class="fa-solid fa-arrow-right"></i></span>
                </div>
            `;

            card.addEventListener('click', () => openMatchModal(m));
            grid.appendChild(card);
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.league;
            renderMatches();
        });
    });

    if (modalClose && modalBackdrop) {
        modalClose.addEventListener('click', () => {
            modalBackdrop.classList.remove('active');
        });
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) modalBackdrop.classList.remove('active');
        });
    }

    renderMatches();
}

function openMatchModal(match) {
    const modal = document.getElementById('matchModalBackdrop');
    const content = document.getElementById('modalDynamicContent');
    if (!modal || !content) return;

    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 25px;">
            <span style="color: var(--neon-green); font-family: var(--font-display); font-size: 0.85rem; letter-spacing: 2px;">${match.leagueName}</span>
            <h2 style="font-family: var(--font-display); font-size: 1.8rem; margin: 10px 0; color: #fff;">${match.home} vs ${match.away}</h2>
            <div style="font-family: var(--font-display); font-size: 2.8rem; font-weight: 900; color: var(--neon-green); text-shadow: 0 0 20px var(--neon-green-glow);">
                ${match.homeScore} - ${match.awayScore}
            </div>
            <span style="background: rgba(255,0,85,0.2); color: var(--live-red); padding: 4px 14px; border-radius: 20px; font-weight: 800; font-size: 0.8rem;">
                ${match.status}
            </span>
        </div>

        <!-- STATS BARS -->
        <div style="background: rgba(0,0,0,0.3); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
            <h4 style="font-family: var(--font-display); font-size: 0.9rem; color: var(--text-silver); margin-bottom: 15px; text-transform: uppercase;">Uchrashuv Statistikasi</h4>
            
            <div style="margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                    <span>${match.possession[0]}%</span>
                    <span style="color: var(--text-muted);">To'p nazorati</span>
                    <span>${match.possession[1]}%</span>
                </div>
                <div style="display: flex; height: 8px; border-radius: 4px; overflow: hidden; background: #222;">
                    <div style="width: ${match.possession[0]}%; background: var(--neon-green);"></div>
                    <div style="width: ${match.possession[1]}%; background: var(--cyber-cyan);"></div>
                </div>
            </div>

            <div style="margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                    <span>${match.shots[0]}</span>
                    <span style="color: var(--text-muted);">Zarbalar soni</span>
                    <span>${match.shots[1]}</span>
                </div>
                <div style="display: flex; height: 8px; border-radius: 4px; overflow: hidden; background: #222;">
                    <div style="width: ${(match.shots[0] / (match.shots[0] + match.shots[1])) * 100}%; background: var(--neon-green);"></div>
                    <div style="width: ${(match.shots[1] / (match.shots[0] + match.shots[1])) * 100}%; background: var(--cyber-cyan);"></div>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px;">
                    <span>${match.xg[0]}</span>
                    <span style="color: var(--text-muted);">Kutilgan gollar (xG)</span>
                    <span>${match.xg[1]}</span>
                </div>
            </div>
        </div>

        <!-- EVENTS TIMELINE -->
        <div>
            <h4 style="font-family: var(--font-display); font-size: 0.9rem; color: var(--text-silver); margin-bottom: 12px; text-transform: uppercase;">O'yin Xronikasi</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${match.events.map(ev => `
                    <div style="display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.03); padding: 10px 14px; border-radius: 10px;">
                        <span style="color: var(--neon-green); font-family: var(--font-display); font-weight: 800; font-size: 0.85rem;">${ev.time}</span>
                        <span style="color: #fff; font-size: 0.9rem;">${ev.text}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    modal.classList.add('active');
}

/* ==========================================================================
   6. 3D GYROSCOPIC TILT EFFECT ON CARDS
   ========================================================================== */
function init3DTiltCards() {
    const cards = document.querySelectorAll('.fut-card-wrap');

    cards.forEach(wrap => {
        const card = wrap.querySelector('.fut-card');
        if (!card) return;

        wrap.addEventListener('mousemove', (e) => {
            const rect = wrap.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -14;
            const rotateY = ((x - centerX) / centerX) * 14;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
        });

        wrap.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

/* ==========================================================================
   7. FOOTBALL FAN TRIVIA QUIZ
   ========================================================================== */
const QUIZ_QUESTIONS = [
    {
        q: "2022-yilgi Qatardagi Jahon chempionati finalida qaysi ikki terma jamoa afsonaviy o'yin ko'rsatgan?",
        options: [
            "Fransiya va Xorvatiya",
            "Argentina va Fransiya",
            "Braziliya va Germaniya",
            "Ispaniya va Angliya"
        ],
        correct: 1
    },
    {
        q: "UEFA Chempionlar Ligasida eng ko'p (15 marta) g'alaba qozongan qirollik klubi qaysi?",
        options: [
            "AC Milan",
            "Bayern Munich",
            "Real Madrid",
            "Liverpool"
        ],
        correct: 2
    },
    {
        q: "Futbol tarixida eng ko'p 'Oltin to'p' (Ballon d'Or) sovrinini yutgan afsonaviy daho kim?",
        options: [
            "Cristiano Ronaldo (5)",
            "Lionel Messi (8)",
            "Johan Cruyff (3)",
            "Pele (Faxriy)"
        ],
        correct: 1
    },
    {
        q: "O'zbekiston milliy terma jamoasi tarixidagi eng yaxshi to'purar rekordchi kim?",
        options: [
            "Mirjalol Qosimov",
            "Maksim Shatskix",
            "Eldor Shomurodov",
            "Server Jeparov"
        ],
        correct: 2
    },
    {
        q: "Angliya Premyer-ligasining bir mavsumida eng ko'p gol urish (36 gol) mutlaq rekordchisi kim?",
        options: [
            "Mohamed Salah",
            "Alan Shearer",
            "Thierry Henry",
            "Erling Haaland"
        ],
        correct: 3
    }
];

function initQuizEngine() {
    let curIndex = 0;
    let score = 0;

    const qNumEl = document.getElementById('quizQNum');
    const qTextEl = document.getElementById('quizQText');
    const optionsWrap = document.getElementById('quizOptionsWrap');
    const meterBar = document.getElementById('quizMeterBar');
    const scoreVal = document.getElementById('quizScoreVal');
    const quizCard = document.getElementById('quizCardInner');
    const resultBox = document.getElementById('quizResultBox');
    const finalScoreEl = document.getElementById('finalScoreNum');
    const restartBtn = document.getElementById('btnRestartQuiz');

    if (!qTextEl || !optionsWrap) return;

    function renderQuestion() {
        const cur = QUIZ_QUESTIONS[curIndex];
        if (qNumEl) qNumEl.textContent = `Savol ${curIndex + 1} / ${QUIZ_QUESTIONS.length}`;
        if (qTextEl) qTextEl.textContent = cur.q;
        if (meterBar) meterBar.style.width = `${((curIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`;

        optionsWrap.innerHTML = '';
        cur.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn-quiz-option';
            btn.innerHTML = `<span>${opt}</span> <i class="fa-regular fa-circle"></i>`;
            btn.addEventListener('click', () => handleAnswer(idx, btn));
            optionsWrap.appendChild(btn);
        });
    }

    function handleAnswer(chosenIdx, btn) {
        const cur = QUIZ_QUESTIONS[curIndex];
        const allBtns = optionsWrap.querySelectorAll('.btn-quiz-option');
        allBtns.forEach(b => b.disabled = true);

        if (chosenIdx === cur.correct) {
            btn.classList.add('correct');
            btn.querySelector('i').className = 'fa-solid fa-circle-check';
            score += 20;
            if (scoreVal) scoreVal.textContent = score;
            playGoalSound();
        } else {
            btn.classList.add('wrong');
            btn.querySelector('i').className = 'fa-solid fa-circle-xmark';
            allBtns[cur.correct].classList.add('correct');
            allBtns[cur.correct].querySelector('i').className = 'fa-solid fa-circle-check';
            playWhistleSound();
        }

        setTimeout(() => {
            curIndex++;
            if (curIndex < QUIZ_QUESTIONS.length) {
                renderQuestion();
            } else {
                showResults();
            }
        }, 1400);
    }

    function showResults() {
        if (quizCard) quizCard.style.display = 'none';
        if (resultBox) {
            resultBox.style.display = 'block';
            if (finalScoreEl) finalScoreEl.textContent = `${score} / 100`;
        }
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            curIndex = 0;
            score = 0;
            if (scoreVal) scoreVal.textContent = '0';
            if (resultBox) resultBox.style.display = 'none';
            if (quizCard) quizCard.style.display = 'block';
            renderQuestion();
        });
    }

    renderQuestion();
}

/* ==========================================================================
   8. AMBIENT PARTICLES CANVAS
   ========================================================================== */
function initAmbientCanvas() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 35;

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 2 + 1,
            color: Math.random() > 0.5 ? 'rgba(0, 255, 135, 0.4)' : 'rgba(0, 240, 255, 0.3)'
        });
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

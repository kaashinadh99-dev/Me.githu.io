/* =========================================================
   CYBER LAB PORTFOLIO
   Developed by Kaashinadh
   Launch fix + particles + audio + navigation + game
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // =====================================================
    // HELPERS
    // =====================================================

    const $ = (id) => document.getElementById(id);

    const safeAddEvent = (element, event, callback, options) => {
        if (element) {
            element.addEventListener(event, callback, options);
        }
    };

    // =====================================================
    // 1. CYBER LAB BOOT / LAUNCH
    // =====================================================

    const bootScreen = $("bootScreen");
    const mainSite = $("mainSite");
    const launchButton = $("launchButton");

    let labLaunched = false;

    function launchLab() {
        if (labLaunched) return;
        labLaunched = true;

        console.log("CYBER LAB: Launch sequence initiated");

        // Reveal the portfolio first
        if (mainSite) {
            mainSite.style.display = "block";
            mainSite.style.visibility = "visible";

            requestAnimationFrame(() => {
                mainSite.classList.add("show");
            });
        }

        // Hide boot screen
        if (bootScreen) {
            bootScreen.classList.add("boot-exit");
        }

        document.body.classList.add("lab-active");

        // Complete transition
        setTimeout(() => {
            if (bootScreen) {
                bootScreen.style.display = "none";
                bootScreen.setAttribute("aria-hidden", "true");
            }

            if (mainSite) {
                mainSite.style.opacity = "1";
                mainSite.style.visibility = "visible";
            }

            // Start/reveal animations after launch
            window.dispatchEvent(new Event("portfolio-launched"));

            // Initialize particles if they haven't started
            initParticles();

            console.log("CYBER LAB: System online");
        }, 750);

        playBootSound();
        showToast("SYSTEM ONLINE — WELCOME TO THE LAB");
    }

    safeAddEvent(launchButton, "click", launchLab);

    // Optional: allow Enter key on boot screen
    safeAddEvent(document, "keydown", (event) => {
        if (!labLaunched && event.key === "Enter") {
            launchLab();
        }
    });

    // =====================================================
    // 2. AUDIO ENGINE
    // =====================================================

    let audioContext = null;
    let soundEnabled = true;

    const soundToggle = $("soundToggle");
    const soundIcon = $("soundIcon");
    const soundLabel = $("soundLabel");

    function getAudioContext() {
        if (!audioContext) {
            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

            if (AudioContextClass) {
                audioContext = new AudioContextClass();
            }
        }

        if (audioContext && audioContext.state === "suspended") {
            audioContext.resume().catch(() => {});
        }

        return audioContext;
    }

    function playTone(
        frequency = 440,
        duration = 0.12,
        volume = 0.04,
        type = "sine"
    ) {
        if (!soundEnabled) return;

        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(
                frequency,
                ctx.currentTime
            );

            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(
                0.001,
                ctx.currentTime + duration
            );

            oscillator.connect(gain);
            gain.connect(ctx.destination);

            oscillator.start();
            oscillator.stop(ctx.currentTime + duration);
        } catch (error) {
            console.warn("Audio error:", error);
        }
    }

    function playBootSound() {
        if (!soundEnabled) return;

        playTone(330, 0.12, 0.04, "sine");

        setTimeout(() => playTone(440, 0.12, 0.04, "sine"), 100);
        setTimeout(() => playTone(660, 0.2, 0.05, "sine"), 220);
        setTimeout(() => playTone(880, 0.3, 0.035, "triangle"), 400);
    }

    function playClickSound() {
        playTone(700, 0.05, 0.025, "square");
    }

    function playJumpSound() {
        playTone(420, 0.09, 0.035, "sine");
        setTimeout(() => playTone(650, 0.08, 0.025, "sine"), 60);
    }

    function playCrashSound() {
        if (!soundEnabled) return;

        playTone(180, 0.3, 0.06, "sawtooth");
        setTimeout(() => playTone(90, 0.4, 0.04, "square"), 120);
    }

    function playScoreSound() {
        playTone(950, 0.05, 0.025, "sine");
    }

    safeAddEvent(soundToggle, "click", () => {
        soundEnabled = !soundEnabled;

        if (soundIcon) {
            soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
        }

        if (soundLabel) {
            soundLabel.textContent = soundEnabled ? "SOUND ON" : "SOUND OFF";
        }

        if (soundEnabled) {
            playClickSound();
        }
    });

    // =====================================================
    // 3. TOAST NOTIFICATION
    // =====================================================

    let toastTimer = null;

    function showToast(message) {
        let toast = $("cyberToast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "cyberToast";
            toast.className = "cyber-toast";

            Object.assign(toast.style, {
                position: "fixed",
                bottom: "25px",
                left: "50%",
                transform: "translateX(-50%) translateY(20px)",
                padding: "12px 20px",
                background: "rgba(4, 15, 25, 0.95)",
                color: "#00f5ff",
                border: "1px solid rgba(0,245,255,0.35)",
                borderRadius: "8px",
                fontFamily: "monospace",
                fontSize: "12px",
                zIndex: "999999",
                opacity: "0",
                transition: "all 0.3s ease",
                textAlign: "center",
                maxWidth: "90vw"
            });

            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(-50%) translateY(20px)";
        }, 2600);
    }

    // =====================================================
    // 4. NAVIGATION
    // =====================================================

    const menuToggle = $("menuToggle");
    const navMenu = $("navMenu");

    safeAddEvent(menuToggle, "click", () => {
        if (!navMenu) return;

        navMenu.classList.toggle("active");
        menuToggle.classList.toggle("active");

        playClickSound();
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            navMenu?.classList.remove("active");
            menuToggle?.classList.remove("active");

            playClickSound();
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", (event) => {
        if (!navMenu || !menuToggle) return;

        if (
            navMenu.classList.contains("active") &&
            !navMenu.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            navMenu.classList.remove("active");
            menuToggle.classList.remove("active");
        }
    });

    // =====================================================
    // 5. ACTIVE NAVIGATION ON SCROLL
    // =====================================================

    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const sectionId = entry.target.id;

                    navLinks.forEach((link) => {
                        link.classList.remove("active");

                        if (
                            link.getAttribute("href") ===
                            "#" + sectionId
                        ) {
                            link.classList.add("active");
                        }
                    });
                });
            },
            {
                rootMargin: "-30% 0px -60% 0px",
                threshold: 0
            }
        );

        sections.forEach((section) => {
            sectionObserver.observe(section);
        });
    }

    // =====================================================
    // 6. SCROLL REVEAL ANIMATIONS
    // =====================================================

    const revealElements = document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right"
    );

    function revealAll() {
        revealElements.forEach((element) => {
            const rect = element.getBoundingClientRect();

            if (rect.top < window.innerHeight * 0.92) {
                element.classList.add("revealed");
                element.classList.add("active");
            }
        });
    }

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                        entry.target.classList.add("active");
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });
    } else {
        revealAll();
    }

    safeAddEvent(window, "scroll", revealAll, { passive: true });

    // =====================================================
    // 7. PARTICLE SYSTEM
    // =====================================================

    const particleCanvas = $("particleCanvas");
    const particleCtx = particleCanvas
        ? particleCanvas.getContext("2d")
        : null;

    let particles = [];
    let particleAnimationStarted = false;
    let mouse = {
        x: null,
        y: null,
        radius: 120
    };

    function resizeParticleCanvas() {
        if (!particleCanvas || !particleCtx) return;

        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;

        createParticles();
    }

    function createParticles() {
        if (!particleCanvas) return;

        particles = [];

        const count = Math.min(
            Math.floor((window.innerWidth * window.innerHeight) / 12000),
            110
        );

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * particleCanvas.width,
                y: Math.random() * particleCanvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    function drawParticles() {
        if (!particleCanvas || !particleCtx) return;

        particleCtx.clearRect(
            0,
            0,
            particleCanvas.width,
            particleCanvas.height
        );

        particles.forEach((particle, index) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            if (particle.x < 0) particle.x = particleCanvas.width;
            if (particle.x > particleCanvas.width) particle.x = 0;

            if (particle.y < 0) particle.y = particleCanvas.height;
            if (particle.y > particleCanvas.height) particle.y = 0;

            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                const dx = particle.x - mouse.x;
                const dy = particle.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius && distance > 0) {
                    const force = (mouse.radius - distance) / mouse.radius;

                    particle.x += (dx / distance) * force * 2;
                    particle.y += (dy / distance) * force * 2;
                }
            }

            particleCtx.beginPath();
            particleCtx.arc(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );

            particleCtx.fillStyle =
                `rgba(0, 245, 255, ${particle.opacity})`;

            particleCtx.fill();

            // Connect nearby particles
            for (let j = index + 1; j < particles.length; j++) {
                const other = particles[j];

                const dx = particle.x - other.x;
                const dy = particle.y - other.y;

                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 115) {
                    const opacity = 0.12 * (1 - distance / 115);

                    particleCtx.beginPath();
                    particleCtx.moveTo(particle.x, particle.y);
                    particleCtx.lineTo(other.x, other.y);

                    particleCtx.strokeStyle =
                        `rgba(0, 245, 255, ${opacity})`;

                    particleCtx.lineWidth = 0.6;
                    particleCtx.stroke();
                }
            }
        });

        requestAnimationFrame(drawParticles);
    }

    function initParticles() {
        if (particleAnimationStarted) return;

        particleAnimationStarted = true;

        resizeParticleCanvas();
        drawParticles();
    }

    safeAddEvent(window, "resize", resizeParticleCanvas);

    safeAddEvent(window, "mousemove", (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    safeAddEvent(window, "mouseout", () => {
        mouse.x = null;
        mouse.y = null;
    });

    safeAddEvent(window, "touchmove", (event) => {
        if (event.touches.length > 0) {
            mouse.x = event.touches[0].clientX;
            mouse.y = event.touches[0].clientY;
        }
    }, { passive: true });

    // =====================================================
    // 8. CONTACT FORM
    // =====================================================

    const contactForm = $("contactForm");
    const contactName = $("contactName");
    const contactEmail = $("contactEmail");
    const contactMessage = $("contactMessage");
    const formStatus = $("formStatus");

    safeAddEvent(contactForm, "submit", (event) => {
        event.preventDefault();

        const name = contactName?.value.trim() || "";
        const email = contactEmail?.value.trim() || "";
        const message = contactMessage?.value.trim() || "";

        if (!name || !email || !message) {
            if (formStatus) {
                formStatus.textContent =
                    "Please complete all fields.";
            }

            showToast("PLEASE COMPLETE ALL FIELDS");
            return;
        }

        if (!email.includes("@") || !email.includes(".")) {
            if (formStatus) {
                formStatus.textContent =
                    "Please enter a valid email address.";
            }

            showToast("INVALID EMAIL ADDRESS");
            return;
        }

        // Replace this with your actual email
        const destinationEmail = "dipinraj@example.com";

        const subject = encodeURIComponent(
            `Portfolio Contact — ${name}`
        );

        const body = encodeURIComponent(
            `Name: ${name}\n` +
            `Email: ${email}\n\n` +
            `Message:\n${message}`
        );

        const mailtoURL =
            `mailto:${destinationEmail}?subject=${subject}&body=${body}`;

        if (formStatus) {
            formStatus.textContent =
                "Opening your email application...";
        }

        window.location.href = mailtoURL;

        showToast("MESSAGE PREPARED");

        contactForm.reset();
    });

    // =====================================================
    // 9. GAME — CYBER DINO RUNNER
    // =====================================================

    const gameCanvas = $("gameCanvas");
    const gameCtx = gameCanvas
        ? gameCanvas.getContext("2d")
        : null;

    const gameOverlay = $("gameOverlay");
    const gameOverlayTitle = $("gameOverlayTitle");
    const gameOverlayText = $("gameOverlayText");
    const gameStartButton = $("gameStartButton");

    const gameScoreElement = $("gameScore");
    const highScoreElement = $("highScore");
    const gameSpeedElement = $("gameSpeed");

    const jumpButton = $("jumpButton");
    const duckButton = $("duckButton");
    const restartGameButton = $("restartGameButton");

    const GAME_WIDTH = 800;
    const GAME_HEIGHT = 300;
    const GROUND_Y = 245;

    let gameRunning = false;
    let gameStarted = false;
    let gameOver = false;

    let gameScore = 0;
    let gameSpeed = 7;
    let highScore = 0;

    let lastGameTime = 0;
    let obstacleTimer = 0;
    let nextObstacleTime = 1100;
    let groundOffset = 0;

    let currentTheme = 0;
    let lastThemeScore = 0;

    let obstacles = [];

    const GRAVITY = 0.85;
    const JUMP_FORCE = -14.5;
    const FAST_FALL = 2.2;

    const themes = [
        {
            background: "#071018",
            ground: "#00f5ff",
            obstacle: "#00f5ff",
            player: "#00f5ff",
            accent: "#39ff14"
        },
        {
            background: "#08150c",
            ground: "#39ff14",
            obstacle: "#39ff14",
            player: "#b4ff8c",
            accent: "#00f5ff"
        },
        {
            background: "#10091b",
            ground: "#bf5fff",
            obstacle: "#bf5fff",
            player: "#e5b8ff",
            accent: "#ff4fd8"
        },
        {
            background: "#170b0b",
            ground: "#ff4d6d",
            obstacle: "#ff4d6d",
            player: "#ffb3c1",
            accent: "#ffaa00"
        }
    ];

    let player = {
        x: 70,
        y: GROUND_Y - 46,
        width: 34,
        height: 46,
        standingHeight: 46,
        duckHeight: 26,
        velocityY: 0,
        jumping: false,
        ducking: false,
        grounded: true
    };

    // Load high score
    try {
        highScore = Number(
            localStorage.getItem("cyberDinoHighScore") || 0
        );
    } catch (error) {
        highScore = 0;
    }

    if (highScoreElement) {
        highScoreElement.textContent = highScore;
    }

    // Canvas scaling
    function resizeGameCanvas() {
        if (!gameCanvas || !gameCtx) return;

        const rect = gameCanvas.getBoundingClientRect();

        if (rect.width === 0) return;

        const ratio = GAME_WIDTH / GAME_HEIGHT;

        let width = rect.width;
        let height = width / ratio;

        if (height > rect.height && rect.height > 0) {
            height = rect.height;
            width = height * ratio;
        }

        gameCanvas.width = GAME_WIDTH;
        gameCanvas.height = GAME_HEIGHT;

        gameCanvas.style.width = "100%";
    }

    safeAddEvent(window, "resize", resizeGameCanvas);
    resizeGameCanvas();

    // =====================================================
    // GAME RESET
    // =====================================================

    function resetGame() {
        gameScore = 0;
        gameSpeed = 7;

        obstacleTimer = 0;
        nextObstacleTime = 1000;

        groundOffset = 0;
        currentTheme = 0;
        lastThemeScore = 0;

        obstacles = [];

        player.x = 70;
        player.y = GROUND_Y - player.standingHeight;
        player.width = 34;
        player.height = player.standingHeight;

        player.velocityY = 0;
        player.jumping = false;
        player.ducking = false;
        player.grounded = true;

        gameOver = false;
        gameRunning = false;
        gameStarted = false;

        updateGameHUD();
        drawGame();
    }

    // =====================================================
    // GAME START
    // =====================================================

    function startGame() {
        if (gameRunning) return;

        resetGame();

        gameRunning = true;
        gameStarted = true;
        gameOver = false;

        if (gameOverlay) {
            gameOverlay.classList.add("hidden");
            gameOverlay.style.display = "none";
        }

        playClickSound();

        lastGameTime = performance.now();

        requestAnimationFrame(gameLoop);
    }

    safeAddEvent(gameStartButton, "click", startGame);
    safeAddEvent(restartGameButton, "click", startGame);

    // =====================================================
    // PLAYER CONTROLS
    // =====================================================

    function jump() {
        if (!gameStarted || gameOver) return;

        if (player.grounded && !player.ducking) {
            player.velocityY = JUMP_FORCE;
            player.jumping = true;
            player.grounded = false;

            playJumpSound();
        }
    }

    function duckStart() {
        if (!gameStarted || gameOver) return;

        player.ducking = true;

        if (player.grounded) {
            player.height = player.duckHeight;
            player.y = GROUND_Y - player.duckHeight;
        }
    }

    function duckEnd() {
        player.ducking = false;

        if (player.grounded) {
            player.height = player.standingHeight;
            player.y = GROUND_Y - player.standingHeight;
        }
    }

    safeAddEvent(jumpButton, "pointerdown", (event) => {
        event.preventDefault();
        jump();
    });

    safeAddEvent(duckButton, "pointerdown", (event) => {
        event.preventDefault();
        duckStart();
    });

    safeAddEvent(duckButton, "pointerup", duckEnd);
    safeAddEvent(duckButton, "pointercancel", duckEnd);
    safeAddEvent(duckButton, "pointerleave", duckEnd);

    safeAddEvent(document, "keydown", (event) => {
        if (
            event.code === "Space" ||
            event.code === "ArrowUp"
        ) {
            if (
                gameCanvas &&
                gameCanvas.getBoundingClientRect().top <
                window.innerHeight
            ) {
                event.preventDefault();

                if (!gameStarted && !gameOver) {
                    startGame();
                } else {
                    jump();
                }
            }
        }

        if (event.code === "ArrowDown") {
            event.preventDefault();
            duckStart();
        }

        if (event.code === "KeyR" && gameOver) {
            startGame();
        }
    });

    safeAddEvent(document, "keyup", (event) => {
        if (event.code === "ArrowDown") {
            duckEnd();
        }
    });

    // =====================================================
    // OBSTACLES
    // =====================================================

    function spawnObstacle() {
        const birdAllowed = gameScore > 150;
        const isBird = birdAllowed && Math.random() < 0.35;

        if (isBird) {
            const altitudeOptions = [
                GROUND_Y - 90,
                GROUND_Y - 120,
                GROUND_Y - 65
            ];

            obstacles.push({
                type: "bird",
                x: GAME_WIDTH + 30,
                y: altitudeOptions[
                    Math.floor(Math.random() * altitudeOptions.length)
                ],
                width: 38,
                height: 24,
                wingFrame: 0
            });

            return;
        }

        const randomType = Math.random();

        if (randomType < 0.5) {
            obstacles.push({
                type: "cactus",
                x: GAME_WIDTH + 30,
                y: GROUND_Y - 42,
                width: 22,
                height: 42
            });
        } else {
            obstacles.push({
                type: "cluster",
                x: GAME_WIDTH + 30,
                y: GROUND_Y - 36,
                width: 46,
                height: 36
            });
        }
    }

    // =====================================================
    // COLLISION DETECTION
    // =====================================================

    function collisionCheck(playerBox, obstacleBox) {
        const inset = 4;

        return (
            playerBox.x + inset <
                obstacleBox.x + obstacleBox.width - inset &&
            playerBox.x + playerBox.width - inset >
                obstacleBox.x + inset &&
            playerBox.y + inset <
                obstacleBox.y + obstacleBox.height - inset &&
            playerBox.y + playerBox.height - inset >
                obstacleBox.y + inset
        );
    }

    // =====================================================
    // GAME OVER
    // =====================================================

    function endGame() {
        gameRunning = false;
        gameOver = true;

        playCrashSound();

        const finalScore = Math.floor(gameScore);

        if (finalScore > highScore) {
            highScore = finalScore;

            try {
                localStorage.setItem(
                    "cyberDinoHighScore",
                    String(highScore)
                );
            } catch (error) {
                console.warn("Could not save high score.");
            }
        }

        updateGameHUD();

        if (gameOverlay) {
            gameOverlay.style.display = "flex";
            gameOverlay.classList.remove("hidden");
        }

        if (gameOverlayTitle) {
            gameOverlayTitle.textContent = "SYSTEM FAILURE";
        }

        if (gameOverlayText) {
            gameOverlayText.textContent =
                `Score: ${finalScore} — Try again to beat your record!`;
        }

        if (gameStartButton) {
            gameStartButton.textContent = "RESTART GAME";
        }

        showToast(`GAME OVER — SCORE ${finalScore}`);
    }

    // =====================================================
    // GAME HUD
    // =====================================================

    function updateGameHUD() {
        if (gameScoreElement) {
            gameScoreElement.textContent = Math.floor(gameScore);
        }

        if (highScoreElement) {
            highScoreElement.textContent = highScore;
        }

        if (gameSpeedElement) {
            gameSpeedElement.textContent =
                `${gameSpeed.toFixed(1)}x`;
        }
    }

    // =====================================================
    // GAME UPDATE
    // =====================================================

    function updateGame(deltaTime) {
        if (!gameRunning) return;

        const dt = Math.min(deltaTime / 16.67, 2.5);

        // Score
        gameScore += gameSpeed * 0.04 * dt;

        // Speed scaling
        gameSpeed = Math.min(
            18,
            7 + gameScore / 180
        );

        // Change environment theme
        if (gameScore - lastThemeScore >= 400) {
            lastThemeScore = Math.floor(gameScore / 400) * 400;
            currentTheme = (currentTheme + 1) % themes.length;
        }

        // Player physics
        if (!player.grounded) {
            player.velocityY += GRAVITY * dt;

            player.y += player.velocityY * dt;

            if (player.ducking) {
                player.velocityY += FAST_FALL * dt;
            }

            if (
                player.y + player.height >= GROUND_Y
            ) {
                player.y = GROUND_Y - player.height;
                player.velocityY = 0;
                player.grounded = true;
                player.jumping = false;
            }
        }

        // Duck dimensions
        if (player.ducking && player.grounded) {
            player.height = player.duckHeight;
            player.y = GROUND_Y - player.duckHeight;
        } else if (!player.ducking && player.grounded) {
            player.height = player.standingHeight;
            player.y = GROUND_Y - player.standingHeight;
        }

        // Ground movement
        groundOffset += gameSpeed * dt;

        // Spawn obstacles
        obstacleTimer += deltaTime;

        if (obstacleTimer >= nextObstacleTime) {
            spawnObstacle();

            obstacleTimer = 0;

            nextObstacleTime =
                900 + Math.random() * 900 - gameSpeed * 15;

            nextObstacleTime = Math.max(
                600,
                nextObstacleTime
            );
        }

        // Move obstacles
        obstacles.forEach((obstacle) => {
            obstacle.x -= gameSpeed * dt;

            if (obstacle.type === "bird") {
                obstacle.wingFrame += deltaTime;
            }
        });

        // Remove old obstacles
        obstacles = obstacles.filter(
            (obstacle) =>
                obstacle.x + obstacle.width > -50
        );

        // Collision
        const playerBox = {
            x: player.x,
            y: player.y,
            width: player.width,
            height: player.height
        };

        for (const obstacle of obstacles) {
            if (collisionCheck(playerBox, obstacle)) {
                endGame();
                return;
            }
        }

        updateGameHUD();
    }

    // =====================================================
    // DRAW GAME BACKGROUND
    // =====================================================

    function drawBackground() {
        if (!gameCtx) return;

        const theme = themes[currentTheme];

        gameCtx.fillStyle = theme.background;
        gameCtx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Grid
        gameCtx.strokeStyle = "rgba(0,245,255,0.07)";
        gameCtx.lineWidth = 1;

        for (let x = 0; x < GAME_WIDTH; x += 40) {
            gameCtx.beginPath();
            gameCtx.moveTo(x, 0);
            gameCtx.lineTo(x, GAME_HEIGHT);
            gameCtx.stroke();
        }

        for (let y = 0; y < GAME_HEIGHT; y += 40) {
            gameCtx.beginPath();
            gameCtx.moveTo(0, y);
            gameCtx.lineTo(GAME_WIDTH, y);
            gameCtx.stroke();
        }

        // Decorative glowing orb
        const gradient = gameCtx.createRadialGradient(
            650, 70, 5,
            650, 70, 70
        );

        gradient.addColorStop(
            0,
            `${theme.accent}22`
        );

        gradient.addColorStop(
            1,
            "rgba(0,0,0,0)"
        );

        gameCtx.fillStyle = gradient;
        gameCtx.fillRect(570, 0, 160, 150);

        // Ground
        gameCtx.strokeStyle = theme.ground;
        gameCtx.lineWidth = 2;

        gameCtx.shadowBlur = 12;
        gameCtx.shadowColor = theme.ground;

        gameCtx.beginPath();
        gameCtx.moveTo(0, GROUND_Y);
        gameCtx.lineTo(GAME_WIDTH, GROUND_Y);
        gameCtx.stroke();

        gameCtx.shadowBlur = 0;

        // Ground dashes
        gameCtx.fillStyle = theme.ground;

        for (let i = 0; i < 30; i++) {
            const dashX =
                ((i * 45 - groundOffset) % GAME_WIDTH + GAME_WIDTH)
                % GAME_WIDTH;

            gameCtx.fillRect(
                dashX,
                GROUND_Y + 10,
                18,
                2
            );
        }
    }

    // =====================================================
    // DRAW PLAYER
    // =====================================================

    function drawPlayer() {
        if (!gameCtx) return;

        const theme = themes[currentTheme];

        gameCtx.save();

        gameCtx.fillStyle = theme.player;
        gameCtx.shadowBlur = 12;
        gameCtx.shadowColor = theme.player;

        const x = player.x;
        const y = player.y;
        const w = player.width;
        const h = player.height;

        // Main body
        gameCtx.fillRect(x + 4, y + 8, w - 8, h - 8);

        // Head
        if (!player.ducking) {
            gameCtx.fillRect(x + 14, y, 22, 20);

            // Eye
            gameCtx.fillStyle = "#071018";
            gameCtx.fillRect(x + 28, y + 7, 4, 4);

            // Tail
            gameCtx.fillStyle = theme.player;
            gameCtx.fillRect(x, y + 15, 8, 7);

            // Legs
            gameCtx.fillRect(x + 7, y + h - 6, 8, 8);
            gameCtx.fillRect(x + 22, y + h - 6, 8, 8);
        } else {
            gameCtx.fillRect(x + 14, y + 2, 28, 14);

            // Eye
            gameCtx.fillStyle = "#071018";
            gameCtx.fillRect(x + 34, y + 6, 4, 3);

            // Duck legs
            gameCtx.fillStyle = theme.player;
            gameCtx.fillRect(x + 6, y + h - 5, 12, 5);
            gameCtx.fillRect(x + 22, y + h - 5, 12, 5);
        }

        gameCtx.restore();
    }

    // =====================================================
    // DRAW CACTUS
    // =====================================================

    function drawCactus(obstacle) {
        if (!gameCtx) return;

        const theme = themes[currentTheme];

        gameCtx.save();

        gameCtx.fillStyle = theme.obstacle;
        gameCtx.shadowBlur = 10;
        gameCtx.shadowColor = theme.obstacle;

        if (obstacle.type === "cactus") {
            const x = obstacle.x;
            const y = obstacle.y;

            // Main cactus
            gameCtx.fillRect(x + 7, y, 9, obstacle.height);

            // Arms
            gameCtx.fillRect(x, y + 12, 7, 7);
            gameCtx.fillRect(x, y + 8, 4, 12);

            gameCtx.fillRect(x + 16, y + 18, 7, 7);
            gameCtx.fillRect(x + 19, y + 12, 4, 14);
        } else {
            const x = obstacle.x;
            const y = obstacle.y;

            // Cluster of cacti
            gameCtx.fillRect(x + 4, y + 9, 10, 27);
            gameCtx.fillRect(x + 17, y, 12, 36);
            gameCtx.fillRect(x + 32, y + 12, 10, 24);

            gameCtx.fillRect(x, y + 16, 6, 6);
            gameCtx.fillRect(x + 1, y + 11, 4, 13);

            gameCtx.fillRect(x + 28, y + 18, 8, 6);
            gameCtx.fillRect(x + 32, y + 13, 4, 12);
        }

        gameCtx.restore();
    }

    // =====================================================
    // DRAW BIRD
    // =====================================================

    function drawBird(obstacle) {
        if (!gameCtx) return;

        const theme = themes[currentTheme];

        gameCtx.save();

        gameCtx.fillStyle = theme.accent;
        gameCtx.shadowBlur = 10;
        gameCtx.shadowColor = theme.accent;

        const x = obstacle.x;
        const y = obstacle.y;

        // Body
        gameCtx.fillRect(x + 8, y + 8, 22, 12);

        // Head
        gameCtx.fillRect(x + 26, y + 5, 10, 10);

        // Beak
        gameCtx.fillRect(x + 36, y + 9, 5, 3);

        // Wing animation
        const wingUp =
            Math.floor(obstacle.wingFrame / 120) % 2 === 0;

        if (wingUp) {
            gameCtx.fillRect(x + 12, y, 15, 8);
        } else {
            gameCtx.fillRect(x + 12, y + 15, 15, 8);
        }

        // Eye
        gameCtx.fillStyle = "#071018";
        gameCtx.fillRect(x + 30, y + 8, 3, 3);

        gameCtx.restore();
    }

    // =====================================================
    // DRAW GAME
    // =====================================================

    function drawGame() {
        if (!gameCtx) return;

        drawBackground();

        obstacles.forEach((obstacle) => {
            if (obstacle.type === "bird") {
                drawBird(obstacle);
            } else {
                drawCactus(obstacle);
            }
        });

        drawPlayer();

        // Score inside canvas
        gameCtx.save();

        gameCtx.fillStyle = themes[currentTheme].accent;
        gameCtx.font = "bold 14px monospace";
        gameCtx.textAlign = "right";

        gameCtx.fillText(
            `SCORE ${Math.floor(gameScore)}`,
            GAME_WIDTH - 20,
            25
        );

        gameCtx.fillText(
            `SPEED ${gameSpeed.toFixed(1)}x`,
            GAME_WIDTH - 20,
            45
        );

        gameCtx.restore();
    }

    // =====================================================
    // GAME LOOP
    // =====================================================

    function gameLoop(timestamp) {
        if (!gameRunning) return;

        const deltaTime = timestamp - lastGameTime;

        lastGameTime = timestamp;

        updateGame(deltaTime);
        drawGame();

        if (gameRunning) {
            requestAnimationFrame(gameLoop);
        }
    }

    // =====================================================
    // INITIAL GAME DISPLAY
    // =====================================================

    if (gameOverlay) {
        gameOverlay.style.display = "flex";
    }

    if (gameOverlayTitle) {
        gameOverlayTitle.textContent = "CYBER RUNNER";
    }

    if (gameOverlayText) {
        gameOverlayText.textContent =
            "Jump over obstacles. Duck under incoming drones. Survive!";
    }

    if (gameStartButton) {
        gameStartButton.textContent = "START GAME";
    }

    resetGame();

    // =====================================================
    // 10. CLICK SOUNDS FOR UI
    // =====================================================

    document.querySelectorAll(
        "button, .project-card, .skill-card, .social-link"
    ).forEach((element) => {
        if (
            element === launchButton ||
            element === soundToggle ||
            element === gameStartButton ||
            element === jumpButton ||
            element === duckButton ||
            element === restartGameButton
        ) {
            return;
        }

        safeAddEvent(element, "click", () => {
            playClickSound();
        });
    });

    // =====================================================
    // 11. YEAR AUTO-UPDATE
    // =====================================================

    document.querySelectorAll("[data-current-year]").forEach((element) => {
        element.textContent = new Date().getFullYear();
    });

    const yearElement = $("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // =====================================================
    // 12. INITIAL SYSTEM STATUS
    // =====================================================

    console.log(
        "%c CYBER LAB PORTFOLIO ",
        "background:#00f5ff;color:#000;font-weight:bold;padding:5px;"
    );

    console.log("System ready.");
    console.log("Waiting for ENTER THE LAB...");

});

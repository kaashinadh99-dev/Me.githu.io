
/* =========================================================
   DIPIN RAJ // CYBER LAB
   Complete Portfolio JavaScript
   Boot Screen | Particles | Audio | Navigation
   Contact Form | Cyber Dino Game
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =========================
       DOM HELPER
    ========================= */
    const $ = (id) => document.getElementById(id);

    const safeEvent = (element, event, callback) => {
        if (element) {
            element.addEventListener(event, callback);
        }
    };

    /* =========================
       BOOT SCREEN
    ========================= */
    const bootScreen = $("bootScreen");
    const bootLog = $("bootLog");
    const launchButton = $("launchButton");
    const mainSite = $("mainSite");

    const bootLines = [
        "[SYSTEM] Initializing Cyber Lab...",
        "[OK] Loading user profile: DIPIN RAJ",
        "[OK] Establishing secure connection...",
        "[OK] Loading visual interface...",
        "[OK] Cybernetic modules online...",
        "[OK] Particle engine initialized...",
        "[OK] Security protocols activated...",
        "[OK] All systems operational.",
        "[READY] Welcome to the Cyber Lab."
    ];

    let bootStarted = false;
    let labLaunched = false;

    function startBootAnimation() {
        if (!bootLog || bootStarted) return;

        bootStarted = true;
        bootLog.innerHTML = "";

        bootLines.forEach((line, index) => {
            setTimeout(() => {
                if (!bootLog) return;

                const lineElement = document.createElement("div");
                lineElement.className = "boot-line";
                lineElement.textContent = line;
                bootLog.appendChild(lineElement);

                bootLog.scrollTop = bootLog.scrollHeight;
            }, index * 250);
        });
    }

    function launchLab() {
        if (labLaunched) return;
        labLaunched = true;

        // Make portfolio visible immediately
        if (mainSite) {
            mainSite.style.display = "block";
            mainSite.style.visibility = "visible";
            mainSite.style.opacity = "1";
            mainSite.classList.add("show");
        }

        // Fade out boot screen
        if (bootScreen) {
            bootScreen.classList.add("boot-exit");
        }

        // Update body state
        document.body.classList.remove("booting");
        document.body.classList.add("lab-active");

        // Start portfolio features
        initParticles();
        revealAllElements();
        initNavigation();
        initAudio();

        // Scroll to homepage
        setTimeout(() => {
            const homeSection = $("home");
            if (homeSection) {
                homeSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }, 100);

        showToast("WELCOME TO THE CYBER LAB");

        // Remove boot screen after transition
        setTimeout(() => {
            if (bootScreen) {
                bootScreen.style.display = "none";
            }
        }, 850);
    }

    startBootAnimation();

    safeEvent(launchButton, "click", launchLab);

    safeEvent(bootScreen, "keydown", (event) => {
        if (event.key === "Enter" && !labLaunched) {
            launchLab();
        }
    });

    safeEvent(document, "keydown", (event) => {
        if (
            event.key === "Enter" &&
            !labLaunched &&
            document.activeElement === document.body
        ) {
            launchLab();
        }
    });

    /* =========================
       TOAST NOTIFICATION
    ========================= */
    const toast = $("toast");
    let toastTimer;

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    /* =========================
       AUDIO SYSTEM
    ========================= */
    let audioContext = null;
    let soundEnabled = true;

    function getAudioContext() {
        if (!audioContext) {
            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) return null;

            audioContext = new AudioContextClass();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume().catch(() => {});
        }

        return audioContext;
    }

    function playTone(
        frequency = 440,
        duration = 0.08,
        type = "sine",
        volume = 0.04
    ) {
        if (!soundEnabled) return;

        const ctx = getAudioContext();
        if (!ctx) return;

        try {
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            gain.gain.setValueAtTime(0.0001, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(
                volume,
                ctx.currentTime + 0.01
            );
            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                ctx.currentTime + duration
            );

            oscillator.connect(gain);
            gain.connect(ctx.destination);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration + 0.02);
        } catch (error) {
            console.warn("Audio error:", error);
        }
    }

    function playBootSound() {
        playTone(450, 0.08, "square", 0.025);

        setTimeout(() => playTone(650, 0.08, "square", 0.025), 100);
        setTimeout(() => playTone(850, 0.12, "square", 0.025), 200);
    }

    function playLaunchSound() {
        playTone(400, 0.12, "sawtooth", 0.035);

        setTimeout(() => playTone(600, 0.12, "sawtooth", 0.035), 100);
        setTimeout(() => playTone(900, 0.18, "sine", 0.035), 200);
    }

    function playClickSound() {
        playTone(700, 0.04, "square", 0.015);
    }

    function playJumpSound() {
        playTone(520, 0.07, "square", 0.02);
        setTimeout(() => playTone(760, 0.06, "square", 0.02), 40);
    }

    function playCrashSound() {
        playTone(160, 0.2, "sawtooth", 0.04);
        setTimeout(() => playTone(100, 0.3, "sawtooth", 0.035), 100);
    }

    function initAudio() {
        const soundToggle = $("soundToggle");
        const soundIcon = $("soundIcon");
        const soundLabel = $("soundLabel");

        safeEvent(soundToggle, "click", () => {
            soundEnabled = !soundEnabled;

            if (soundIcon) {
                soundIcon.textContent = soundEnabled ? "♫" : "🔇";
            }

            if (soundLabel) {
                soundLabel.textContent = soundEnabled ? "SOUND ON" : "SOUND OFF";
            }

            if (soundEnabled) {
                playClickSound();
                showToast("SOUND ENABLED");
            } else {
                showToast("SOUND DISABLED");
            }
        });

        safeEvent(document, "click", (event) => {
            if (
                event.target.closest("button") ||
                event.target.closest("a")
            ) {
                if (
                    event.target.closest("#soundToggle") ||
                    event.target.closest("#launchButton")
                ) {
                    return;
                }

                playClickSound();
            }
        });

        playLaunchSound();
    }

    /* =========================
       MOBILE NAVIGATION
    ========================= */
    function initNavigation() {
        const menuButton = $("menuButton");
        const mobileMenu = $("mobileMenu");

        if (!menuButton || !mobileMenu) return;

        function closeMenu() {
            mobileMenu.classList.remove("active");
            menuButton.classList.remove("active");
            menuButton.setAttribute("aria-expanded", "false");
        }

        safeEvent(menuButton, "click", (event) => {
            event.stopPropagation();

            const isOpen = mobileMenu.classList.toggle("active");

            menuButton.classList.toggle("active", isOpen);
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });

        mobileMenu.querySelectorAll("a").forEach((link) => {
            safeEvent(link, "click", closeMenu);
        });

        safeEvent(document, "click", (event) => {
            if (
                !mobileMenu.contains(event.target) &&
                !menuButton.contains(event.target)
            ) {
                closeMenu();
            }
        });

        safeEvent(window, "resize", () => {
            if (window.innerWidth > 900) {
                closeMenu();
            }
        });
    }

    /* =========================
       ACTIVE NAVIGATION
    ========================= */
    function initActiveNavigation() {
        const navLinks = document.querySelectorAll(
            ".desktop-nav a, .mobile-menu a, .bottom-nav a"
        );

        const sections = document.querySelectorAll(
            "main section[id], section[id]"
        );

        if (!sections.length || !navLinks.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const currentId = entry.target.id;

                    navLinks.forEach((link) => {
                        const href = link.getAttribute("href");

                        link.classList.toggle(
                            "active",
                            href === `#${currentId}`
                        );
                    });
                });
            },
            {
                threshold: 0.25,
                rootMargin: "-15% 0px -45% 0px"
            }
        );

        sections.forEach((section) => observer.observe(section));
    }

    /* =========================
       SCROLL REVEAL
    ========================= */
    function revealAllElements() {
        const revealElements = document.querySelectorAll(".reveal");

        if (!("IntersectionObserver" in window)) {
            revealElements.forEach((element) => {
                element.classList.add("visible");
            });
            return;
        }

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
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
    }

    /* =========================
       PARTICLE BACKGROUND
    ========================= */
    let particleAnimationStarted = false;

    function initParticles() {
        if (particleAnimationStarted) return;
        particleAnimationStarted = true;

        const canvas = $("particleCanvas");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let particles = [];

        const particleCount = window.innerWidth < 600 ? 45 : 85;

        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;

            particles = [];

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 2 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    alpha: Math.random() * 0.6 + 0.15
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((particle) => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                if (particle.x < 0) particle.x = width;
                if (particle.x > width) particle.x = 0;
                if (particle.y < 0) particle.y = height;
                if (particle.y > height) particle.y = 0;

                ctx.beginPath();
                ctx.arc(
                    particle.x,
                    particle.y,
                    particle.size,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = `rgba(0, 255, 220, ${particle.alpha})`;
                ctx.fill();
            });

            // Connecting particle lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 115) {
                        const opacity = 0.12 * (1 - distance / 115);

                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);

                        ctx.strokeStyle = `rgba(0, 255, 220, ${opacity})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(drawParticles);
        }

        resizeCanvas();
        drawParticles();

        safeEvent(window, "resize", resizeCanvas);
    }

    /* =========================
       CONTACT FORM
    ========================= */
    function initContactForm() {
        const contactForm = $("contactForm");
        const nameInput = $("contactName");
        const emailInput = $("contactEmail");
        const messageInput = $("contactMessage");
        const formStatus = $("formStatus");

        if (!contactForm) return;

        safeEvent(contactForm, "submit", (event) => {
            event.preventDefault();

            const name = nameInput?.value.trim() || "";
            const email = emailInput?.value.trim() || "";
            const message = messageInput?.value.trim() || "";

            if (!name || !email || !message) {
                if (formStatus) {
                    formStatus.textContent =
                        "ERROR: Please complete all fields.";
                }

                showToast("PLEASE COMPLETE ALL FIELDS");
                return;
            }

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                if (formStatus) {
                    formStatus.textContent =
                        "ERROR: Invalid email address.";
                }

                showToast("INVALID EMAIL ADDRESS");
                return;
            }

            if (formStatus) {
                formStatus.textContent = "Opening your email application...";
            }

            /*
             * Replace this placeholder with your actual email address.
             */
            const destinationEmail = "dipinraj@example.com";

            const subject = encodeURIComponent(
                `Portfolio Contact - ${name}`
            );

            const body = encodeURIComponent(
                `Name: ${name}\n` +
                `Email: ${email}\n\n` +
                `Message:\n${message}`
            );

            const mailto =
                `mailto:${destinationEmail}?subject=${subject}&body=${body}`;

            window.location.href = mailto;

            showToast("MESSAGE PREPARED");

            contactForm.reset();
        });
    }

    /* =========================
       CYBER DINO RUNNER GAME
    ========================= */
    function initDinoGame() {
        const canvas = $("gameCanvas");
        const overlay = $("gameOverlay");
        const overlayTitle = $("gameOverlayTitle");
        const overlayText = $("gameOverlayText");
        const startButton = $("gameStartButton");

        const scoreElement = $("gameScore");
        const highScoreElement = $("highScore");
        const speedElement = $("gameSpeed");

        const jumpButton = $("jumpButton");
        const duckButton = $("duckButton");
        const restartButton = $("restartGameButton");

        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const W = 800;
        const H = 300;
        const groundY = 245;

        canvas.width = W;
        canvas.height = H;

        let running = false;
        let gameOver = false;
        let animationId = null;

        let score = 0;
        let speed = 6;
        let frame = 0;
        let spawnTimer = 0;
        let themeLevel = 0;

        let highScore = Number(
            localStorage.getItem("cyberDinoHighScore") || 0
        );

        if (highScoreElement) {
            highScoreElement.textContent = highScore;
        }

        const themes = [
            {
                background: "#07111c",
                ground: "#00ffd5",
                obstacle: "#00ffd5",
                sky: "#0a1725"
            },
            {
                background: "#130b20",
                ground: "#ff3cf7",
                obstacle: "#ff3cf7",
                sky: "#160d2c"
            },
            {
                background: "#071a12",
                ground: "#80ff00",
                obstacle: "#80ff00",
                sky: "#082116"
            },
            {
                background: "#1c0c0c",
                ground: "#ff5e00",
                obstacle: "#ff5e00",
                sky: "#260e12"
            }
        ];

        let currentTheme = themes[0];

        const player = {
            x: 75,
            y: groundY - 48,
            width: 40,
            height: 48,
            normalHeight: 48,
            duckHeight: 27,
            velocityY: 0,
            gravity: 0.78,
            jumpPower: -14,
            grounded: true,
            ducking: false
        };

        let obstacles = [];
        let clouds = [];
        let stars = [];

        /* ---------- WORLD ---------- */

        function createWorld() {
            clouds = [];
            stars = [];

            for (let i = 0; i < 6; i++) {
                clouds.push({
                    x: Math.random() * W,
                    y: 30 + Math.random() * 110,
                    width: 40 + Math.random() * 70,
                    speed: 0.4 + Math.random() * 0.5
                });
            }

            for (let i = 0; i < 35; i++) {
                stars.push({
                    x: Math.random() * W,
                    y: Math.random() * 180,
                    size: Math.random() * 2 + 0.5,
                    alpha: Math.random() * 0.6 + 0.2
                });
            }
        }

        createWorld();

        /* ---------- RESET ---------- */

        function resetGame() {
            score = 0;
            speed = 6;
            frame = 0;
            spawnTimer = 0;
            themeLevel = 0;

            currentTheme = themes[0];

            player.y = groundY - player.normalHeight;
            player.velocityY = 0;
            player.grounded = true;
            player.ducking = false;
            player.height = player.normalHeight;

            obstacles = [];

            gameOver = false;
            running = false;

            updateGameUI();
            drawGame();
        }

        /* ---------- UI ---------- */

        function updateGameUI() {
            if (scoreElement) {
                scoreElement.textContent = Math.floor(score);
            }

            if (highScoreElement) {
                highScoreElement.textContent = highScore;
            }

            if (speedElement) {
                speedElement.textContent = speed.toFixed(1);
            }
        }

        function showGameOverlay(title, text, buttonText) {
            if (overlay) {
                overlay.style.display = "flex";
                overlay.classList.remove("hidden");
            }

            if (overlayTitle) {
                overlayTitle.textContent = title;
            }

            if (overlayText) {
                overlayText.textContent = text;
            }

            if (startButton) {
                startButton.textContent = buttonText;
            }
        }

        function hideGameOverlay() {
            if (overlay) {
                overlay.style.display = "none";
                overlay.classList.add("hidden");
            }
        }

        /* ---------- GAME START ---------- */

        function startGame() {
            if (running) return;

            resetGame();
            running = true;
            gameOver = false;

            hideGameOverlay();

            playClickSound();

            animationId = requestAnimationFrame(gameLoop);
        }

        /* ---------- PLAYER ---------- */

        function jump() {
            if (!running || gameOver) return;

            if (player.grounded && !player.ducking) {
                player.velocityY = player.jumpPower;
                player.grounded = false;
                playJumpSound();
            }
        }

        function duck(isDucking) {
            if (!running || gameOver) return;

            if (isDucking && player.grounded) {
                player.ducking = true;
                player.height = player.duckHeight;
                player.y = groundY - player.duckHeight;
            } else {
                player.ducking = false;
                player.height = player.normalHeight;

                if (player.grounded) {
                    player.y = groundY - player.normalHeight;
                }
            }
        }

        function updatePlayer() {
            if (!player.grounded) {
                player.velocityY += player.gravity;
                player.y += player.velocityY;

                if (player.y + player.height >= groundY) {
                    player.y = groundY - player.height;
                    player.velocityY = 0;
                    player.grounded = true;
                }
            }

            if (player.ducking && player.grounded) {
                player.height = player.duckHeight;
                player.y = groundY - player.duckHeight;
            }
        }

        /* ---------- OBSTACLES ---------- */

        function spawnObstacle() {
            const type = Math.random();

            if (type < 0.65) {
                const height = 35 + Math.random() * 25;

                obstacles.push({
                    type: "cactus",
                    x: W + 20,
                    y: groundY - height,
                    width: 22 + Math.random() * 14,
                    height: height
                });
            } else {
                obstacles.push({
                    type: "bird",
                    x: W + 20,
                    y: groundY - 90 - Math.random() * 35,
                    width: 42,
                    height: 25,
                    wingFrame: 0
                });
            }
        }

        function updateObstacles() {
            spawnTimer++;

            const spawnInterval = Math.max(
                55,
                105 - speed * 3
            );

            if (spawnTimer > spawnInterval) {
                spawnObstacle();
                spawnTimer = 0;
            }

            obstacles.forEach((obstacle) => {
                obstacle.x -= speed;

                if (obstacle.type === "bird") {
                    obstacle.wingFrame++;
                }
            });

            obstacles = obstacles.filter(
                obstacle => obstacle.x + obstacle.width > -50
            );
        }

        /* ---------- COLLISION ---------- */

        function checkCollision() {
            const playerBox = {
                x: player.x + 6,
                y: player.y + 5,
                width: player.width - 12,
                height: player.height - 10
            };

            for (const obstacle of obstacles) {
                const obstacleBox = {
                    x: obstacle.x + 4,
                    y: obstacle.y + 4,
                    width: obstacle.width - 8,
                    height: obstacle.height - 8
                };

                const collision =
                    playerBox.x < obstacleBox.x + obstacleBox.width &&
                    playerBox.x + playerBox.width > obstacleBox.x &&
                    playerBox.y < obstacleBox.y + obstacleBox.height &&
                    playerBox.y + playerBox.height > obstacleBox.y;

                if (collision) {
                    endGame();
                    return true;
                }
            }

            return false;
        }

        /* ---------- SCORE ---------- */

        function updateScore() {
            score += 0.12 * speed;

            speed = Math.min(
                16,
                6 + score / 250
            );

            const newThemeLevel = Math.floor(score / 400);

            if (newThemeLevel !== themeLevel) {
                themeLevel = newThemeLevel;
                currentTheme = themes[themeLevel % themes.length];
            }

            updateGameUI();
        }

        /* ---------- DRAW WORLD ---------- */

        function drawBackground() {
            ctx.fillStyle = currentTheme.background;
            ctx.fillRect(0, 0, W, H);

            // Stars
            stars.forEach((star) => {
                ctx.globalAlpha = star.alpha;
                ctx.fillStyle = currentTheme.ground;

                ctx.fillRect(
                    star.x,
                    star.y,
                    star.size,
                    star.size
                );
            });

            ctx.globalAlpha = 1;

            // Clouds
            clouds.forEach((cloud) => {
                cloud.x -= cloud.speed;

                if (cloud.x + cloud.width < 0) {
                    cloud.x = W + Math.random() * 100;
                }

                ctx.fillStyle = "rgba(0,255,220,0.06)";

                ctx.fillRect(
                    cloud.x,
                    cloud.y,
                    cloud.width,
                    2
                );

                ctx.fillRect(
                    cloud.x + 12,
                    cloud.y - 6,
                    cloud.width * 0.4,
                    2
                );
            });

            // Ground
            ctx.fillStyle = currentTheme.ground;
            ctx.fillRect(0, groundY, W, 2);

            // Grid
            ctx.globalAlpha = 0.15;
            ctx.strokeStyle = currentTheme.ground;
            ctx.lineWidth = 1;

            for (let x = 0; x < W; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, groundY);
                ctx.lineTo(x - 25, H);
                ctx.stroke();
            }

            for (let y = groundY + 12; y < H; y += 18) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(W, y);
                ctx.stroke();
            }

            ctx.globalAlpha = 1;
        }

        /* ---------- DRAW PLAYER ---------- */

        function drawPlayer() {
            const x = player.x;
            const y = player.y;
            const h = player.height;

            ctx.save();

            ctx.shadowColor = currentTheme.ground;
            ctx.shadowBlur = 14;
            ctx.fillStyle = currentTheme.ground;

            // Body
            ctx.fillRect(x + 5, y + h * 0.3, 27, h * 0.6);

            // Head
            if (!player.ducking) {
                ctx.fillRect(x + 22, y, 24, 23);

                // Eye
                ctx.fillStyle = currentTheme.background;
                ctx.fillRect(x + 36, y + 7, 4, 4);

                // Mouth
                ctx.fillRect(x + 39, y + 17, 8, 3);
            } else {
                ctx.fillRect(x + 22, y + 4, 27, 19);

                ctx.fillStyle = currentTheme.background;
                ctx.fillRect(x + 39, y + 9, 4, 4);
            }

            // Legs
            if (!player.ducking) {
                const legOffset = Math.sin(frame * 0.25) * 5;

                ctx.fillStyle = currentTheme.ground;

                ctx.fillRect(
                    x + 10,
                    y + h - 8,
                    8,
                    14 + legOffset
                );

                ctx.fillRect(
                    x + 24,
                    y + h - 8,
                    8,
                    14 - legOffset
                );
            }

            // Cyber glow
            ctx.shadowBlur = 0;

            ctx.restore();
        }

        /* ---------- DRAW OBSTACLES ---------- */

        function drawObstacles() {
            obstacles.forEach((obstacle) => {
                ctx.save();

                ctx.fillStyle = currentTheme.obstacle;
                ctx.shadowColor = currentTheme.obstacle;
                ctx.shadowBlur = 12;

                if (obstacle.type === "cactus") {
                    ctx.fillRect(
                        obstacle.x,
                        obstacle.y,
                        obstacle.width,
                        obstacle.height
                    );

                    ctx.fillRect(
                        obstacle.x - 8,
                        obstacle.y + obstacle.height * 0.35,
                        8,
                        6
                    );

                    ctx.fillRect(
                        obstacle.x - 8,
                        obstacle.y + obstacle.height * 0.2,
                        6,
                        16
                    );

                    ctx.fillRect(
                        obstacle.x + obstacle.width,
                        obstacle.y + obstacle.height * 0.5,
                        8,
                        6
                    );

                    ctx.fillRect(
                        obstacle.x + obstacle.width + 2,
                        obstacle.y + obstacle.height * 0.3,
                        6,
                        15
                    );
                } else {
                    // Bird obstacle
                    const wing = Math.sin(frame * 0.4) * 8;

                    ctx.fillRect(
                        obstacle.x + 8,
                        obstacle.y + 8,
                        26,
                        12
                    );

                    ctx.fillRect(
                        obstacle.x + 28,
                        obstacle.y + 4,
                        10,
                        10
                    );

                    ctx.fillRect(
                        obstacle.x + 36,
                        obstacle.y + 10,
                        8,
                        3
                    );

                    ctx.fillRect(
                        obstacle.x + 12,
                        obstacle.y + 10 + wing,
                        18,
                        5
                    );
                }

                ctx.restore();
            });
        }

        /* ---------- DRAW GAME ---------- */

        function drawGame() {
            drawBackground();
            drawObstacles();
            drawPlayer();
        }

        /* ---------- GAME OVER ---------- */

        function endGame() {
            if (gameOver) return;

            gameOver = true;
            running = false;

            playCrashSound();

            if (score > highScore) {
                highScore = Math.floor(score);

                localStorage.setItem(
                    "cyberDinoHighScore",
                    String(highScore)
                );
            }

            updateGameUI();

            showGameOverlay(
                "SYSTEM FAILURE",
                `SCORE: ${Math.floor(score)}  |  BEST: ${highScore}`,
                "RESTART SYSTEM"
            );

            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }

        /* ---------- GAME LOOP ---------- */

        function gameLoop() {
            if (!running || gameOver) return;

            frame++;

            updatePlayer();
            updateObstacles();
            updateScore();

            drawGame();

            if (checkCollision()) {
                return;
            }

            animationId = requestAnimationFrame(gameLoop);
        }

        /* ---------- CONTROLS ---------- */

        safeEvent(startButton, "click", startGame);
        safeEvent(restartButton, "click", startGame);

        safeEvent(jumpButton, "click", jump);

        safeEvent(duckButton, "pointerdown", () => {
            duck(true);
        });

        safeEvent(duckButton, "pointerup", () => {
            duck(false);
        });

        safeEvent(duckButton, "pointerleave", () => {
            duck(false);
        });

        safeEvent(duckButton, "pointercancel", () => {
            duck(false);
        });

        safeEvent(window, "keydown", (event) => {
            if (
                event.code === "Space" ||
                event.code === "ArrowUp"
            ) {
                const gameSection = $("game");

                if (!gameSection) return;

                const rect = gameSection.getBoundingClientRect();

                const visible =
                    rect.top < window.innerHeight &&
                    rect.bottom > 0;

                if (!visible) return;

                event.preventDefault();

                if (!running && !gameOver) {
                    startGame();
                } else if (gameOver) {
                    startGame();
                } else {
                    jump();
                }
            }

            if (event.code === "ArrowDown") {
                const gameSection = $("game");

                if (!gameSection) return;

                const rect = gameSection.getBoundingClientRect();

                const visible =
                    rect.top < window.innerHeight &&
                    rect.bottom > 0;

                if (visible) {
                    event.preventDefault();
                    duck(true);
                }
            }
        });

        safeEvent(window, "keyup", (event) => {
            if (event.code === "ArrowDown") {
                duck(false);
            }
        });

        safeEvent(canvas, "touchstart", (event) => {
            if (!running && !gameOver) {
                startGame();
                return;
            }

            if (gameOver) {
                startGame();
                return;
            }

            event.preventDefault();
            jump();
        }, { passive: false });

        // Initial game display
        resetGame();

        showGameOverlay(
            "CYBER DINO",
            "PRESS START OR SPACE TO BEGIN",
            "START GAME"
        );
    }

    /* =========================
       COPYRIGHT YEAR
    ========================= */
    function initYear() {
        const yearElements = document.querySelectorAll(
            "#year, .current-year"
        );

        yearElements.forEach((element) => {
            element.textContent = new Date().getFullYear();
        });
    }

    /* =========================
       INITIALIZATION
    ========================= */
    initContactForm();
    initDinoGame();
    initYear();

    /*
     * Navigation and audio initialize after
     * entering the Cyber Lab.
     */

    console.log(
        "%c DIPIN RAJ // CYBER LAB ",
        "background:#00ffd5;color:#001;font-weight:bold;padding:8px;"
    );

    console.log(
        "%c SYSTEM READY | ALL MODULES LOADED ",
        "color:#00ffd5;font-weight:bold;"
    );
});

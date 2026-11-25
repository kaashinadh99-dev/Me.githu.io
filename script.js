
/* ==================================================
   DIPIN RAJ CYBER LAB
   BOOT / AUDIO / PARTICLES / PORTFOLIO / DINO GAME
================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const $ = id => document.getElementById(id);

  /* ==================================================
     SYSTEM ELEMENTS
  ================================================== */

  const bootScreen = $("bootScreen");
  const mainSite = $("mainSite");
  const launchButton = $("launchButton");

  const soundToggle = $("soundToggle");
  const soundIcon = $("soundIcon");
  const soundLabel = $("soundLabel");

  const menuButton = $("menuButton");
  const mobileMenu = $("mobileMenu");

  const toast = $("toast");

  let launched = false;
  let soundEnabled = true;
  let audioContext = null;
  let toastTimeout;

  /* ==================================================
     AUDIO ENGINE
  ================================================== */

  function getAudio() {
    if (!audioContext) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioContext = new AC();
    }
    return audioContext;
  }

  function tone(freq, endFreq, duration, type = "sine", volume = .04, delay = 0) {
    if (!soundEnabled) return;

    const ctx = getAudio();
    if (!ctx) return;

    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(1, endFreq),
        ctx.currentTime + delay + duration
      );
    }

    gain.gain.setValueAtTime(.0001, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(
      volume,
      ctx.currentTime + delay + .02
    );
    gain.gain.exponentialRampToValueAtTime(
      .0001,
      ctx.currentTime + delay + duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + .04);
  }

  function startupSound() {
    tone(70, 240, .6, "sawtooth", .035, 0);
    tone(500, 1700, .2, "square", .018, .3);
    tone(1500, 450, .15, "square", .014, .55);
    tone(440, 440, .12, "sine", .05, .8);
    tone(660, 660, .14, "sine", .05, .95);
    tone(880, 880, .25, "sine", .055, 1.1);
    tone(1000, 1700, .18, "triangle", .035, 1.35);
  }

  function clickSound() {
    tone(900, 600, .06, "square", .012);
  }

  function jumpSound() {
    tone(320, 700, .1, "sine", .025);
  }

  function crashSound() {
    tone(180, 50, .45, "sawtooth", .055);
    tone(90, 35, .35, "square", .025, .1);
  }

  function scoreSound() {
    tone(900, 1200, .06, "sine", .025);
  }

  /* ==================================================
     BOOT TERMINAL TYPING
  ================================================== */

  const bootLog = $("bootLog");

  const bootMessages = [
    "Initializing cyber interface...",
    "Loading digital environment...",
    "Establishing secure session...",
    "Loading portfolio modules...",
    "Interactive game engine detected...",
    "SYSTEM READY // Awaiting access"
  ];

  let bootLine = 0;

  function typeBootLine() {
    if (!bootLog || bootLine >= bootMessages.length) return;

    const line = document.createElement("p");

    const ok = document.createElement("span");
    ok.className = bootLine === bootMessages.length - 1 ? "warning" : "ok";
    ok.textContent = bootLine === bootMessages.length - 1 ? "[ READY ] " : "[ OK ] ";

    line.appendChild(ok);
    line.appendChild(document.createTextNode(bootMessages[bootLine]));

    bootLog.appendChild(line);
    bootLine++;

    setTimeout(typeBootLine, 480);
  }

  typeBootLine();

  /* ==================================================
     LAUNCH
  ================================================== */

  launchButton.addEventListener("click", async () => {

    if (launched) return;
    launched = true;

    launchButton.disabled = true;
    launchButton.innerHTML = "INITIALIZING SYSTEM...";

    if (soundEnabled) {
      const ctx = getAudio();
      if (ctx && ctx.state === "suspended") await ctx.resume();
      startupSound();
    }

    setTimeout(() => {
      bootScreen.classList.add("hide");
      mainSite.classList.add("show");
      document.body.classList.remove("booting");
      showToast("ACCESS GRANTED // WELCOME TO CYBER LAB");
    }, 600);

  });

  /* ==================================================
     SOUND BUTTON
  ================================================== */

  function updateSoundUI() {
    soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
    soundLabel.textContent = soundEnabled ? "AUDIO" : "MUTED";
  }

  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    updateSoundUI();

    if (soundEnabled && launched) {
      tone(600, 1000, .12, "sine", .04);
    }

    showToast(soundEnabled ? "AUDIO SYSTEM ACTIVE" : "AUDIO MUTED");
  });

  updateSoundUI();

  /* ==================================================
     MOBILE MENU
  ================================================== */

  menuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
    clickSound();
  });

  mobileMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      clickSound();
    });
  });

  /* ==================================================
     TOAST
  ================================================== */

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 2600);
  }

  /* ==================================================
     NAVIGATION ACTIVE STATE
  ================================================== */

  const navLinks = document.querySelectorAll(
    ".desktop-nav a, .bottom-nav a"
  );

  const sections = document.querySelectorAll("main section[id]");

  function setActive(id) {
    navLinks.forEach(link => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === "#" + id
      );
    });
  }

  if ("IntersectionObserver" in window) {

    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, {
      threshold: .25,
      rootMargin: "-15% 0px -40% 0px"
    });

    sections.forEach(section => navObserver.observe(section));
  }

  navLinks.forEach(link => {
    link.addEventListener("mouseenter", () => {
      if (launched) tone(1000, 800, .025, "sine", .008);
    });
    link.addEventListener("click", clickSound);
  });

  /* ==================================================
     SCROLL REVEALS
  ================================================== */

  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });

    revealItems.forEach(el => revealObserver.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add("visible"));
  }

  /* ==================================================
     NEON PARTICLE SYSTEM
  ================================================== */

  const particleCanvas = $("particleCanvas");
  const particleCtx = particleCanvas.getContext("2d");

  let particles = [];
  let mouse = { x: null, y: null };
  let particleWidth = 0;
  let particleHeight = 0;

  function resizeParticles() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    particleWidth = window.innerWidth;
    particleHeight = window.innerHeight;

    particleCanvas.width = particleWidth * dpr;
    particleCanvas.height = particleHeight * dpr;

    particleCanvas.style.width = particleWidth + "px";
    particleCanvas.style.height = particleHeight + "px";

    particleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const amount = Math.min(
      75,
      Math.floor(particleWidth / 13)
    );

    particles = Array.from({ length: amount }, () => ({
      x: Math.random() * particleWidth,
      y: Math.random() * particleHeight,
      vx: (Math.random() - .5) * .35,
      vy: (Math.random() - .5) * .35,
      size: Math.random() * 2 + .4
    }));
  }

  // Alias for canvas context
  const particleCtx = particleCtxSafe();

  function particleCtxSafe() {
    return particleCanvas.getContext("2d");
  }

  resizeParticles();
  window.addEventListener("resize", resizeParticles);

  window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("touchmove", e => {
    if (e.touches.length) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  function drawParticles() {

    particleCtx.clearRect(0, 0, particleWidth, particleHeight);

    particles.forEach(p => {

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > particleWidth) p.vx *= -1;
      if (p.y < 0 || p.y > particleHeight) p.vy *= -1;

      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100 && distance > 0) {
          p.x += dx / distance * .6;
          p.y += dy / distance * .6;
        }
      }

      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      particleCtx.fillStyle = "rgba(0,240,255,.65)";
      particleCtx.fill();

    });

    // Connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {

        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 95) {
          particleCtx.beginPath();
          particleCtx.moveTo(particles[i].x, particles[i].y);
          particleCtx.lineTo(particles[j].x, particles[j].y);
          particleCtx.strokeStyle =
            `rgba(0,240,255,${.09 * (1 - dist / 95)})`;
          particleCtx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  }

  drawParticles();

  /* ==================================================
     CONTACT FORM
     MAILTO METHOD
  ================================================== */

  $("contactForm").addEventListener("submit", e => {
    e.preventDefault();

    const name = $("contactName").value.trim();
    const email = $("contactEmail").value.trim();
    const message = $("contactMessage").value.trim();

    if (!name || !email || !message) {
      $("formStatus").textContent = "ERROR: COMPLETE ALL FIELDS.";
      return;
    }

    // Replace this with your actual email address
    const destination = "dipinraj@example.com";

    const subject = encodeURIComponent("Portfolio Contact - " + name);

    const body = encodeURIComponent(
      "Name: " + name +
      "\nEmail: " + email +
      "\n\nMessage:\n" + message
    );

    $("formStatus").textContent = "OPENING EMAIL CLIENT...";

    window.location.href =
      "mailto:" + destination +
      "?subject=" + subject +
      "&body=" + body;
  });

  /* ==================================================
     GAME: CYBER DINO RUNNER
     HTML5 CANVAS IMPLEMENTATION OF YOUR PYTHON GAME
  ================================================== */

  const canvas = $("gameCanvas");
  const ctx = canvas.getContext("2d");

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 300;
  const GROUND_Y = 245;

  const GRAVITY = .85;
  const JUMP_VELOCITY = -14.5;
  const FAST_FALL_GRAVITY = 2.2;
  const INITIAL_SPEED = 7;
  const MAX_SPEED = 18;

  let gameRunning = false;
  let gameOver = false;
  let gameStarted = false;

  let score = 0;
  let speed = INITIAL_SPEED;
  let spawnTimer = 70;
  let obstacles = [];
  let lastTime = 0;
  let animationId = null;

  let highScore = Number(localStorage.getItem("cyberDinoHighScore") || 0);

  $("highScore").textContent = String(highScore).padStart(5, "0");

  /* --------------------------------------------------
     DINO PLAYER
  -------------------------------------------------- */

  const dino = {
    x: 70,
    standW: 34,
    standH: 46,
    duckW: 48,
    duckH: 26,
    y: GROUND_Y - 46,
    velY: 0,
    jumping: false,
    ducking: false,
    legTimer: 0,

    get rect() {
      if (this.ducking && !this.jumping) {
        return {
          x: this.x,
          y: GROUND_Y - this.duckH,
          w: this.duckW,
          h: this.duckH
        };
      }

      return {
        x: this.x,
        y: this.y,
        w: this.standW,
        h: this.standH
      };
    },

    jump() {
      if (!gameRunning || this.jumping) return;

      this.velY = JUMP_VELOCITY;
      this.jumping = true;
      this.ducking = false;

      jumpSound();
    },

    setDuck(value) {
      this.ducking = value;
    },

    update(dt) {
      const factor = dt / 16.667;

      if (this.jumping) {

        const gravity = this.ducking
          ? FAST_FALL_GRAVITY
          : GRAVITY;

        this.velY += gravity * factor;
        this.y += this.velY * factor;

        if (this.y >= GROUND_Y - this.standH) {
          this.y = GROUND_Y - this.standH;
          this.velY = 0;
          this.jumping = false;
        }
      }

      this.legTimer += factor;
    }
  };

  /* --------------------------------------------------
     OBSTACLES
  -------------------------------------------------- */

  function createObstacle(kind) {

    const obs = {
      kind,
      x: GAME_WIDTH + 20,
      wingTimer: 0
    };

    if (kind === "cactus_small") {
      obs.w = 22;
      obs.h = 42;
      obs.y = GROUND_Y - obs.h;
    }
    else if (kind === "cactus_cluster") {
      obs.w = 46;
      obs.h = 36;
      obs.y = GROUND_Y - obs.h;
    }
    else {
      obs.w = 38;
      obs.h = 24;

      const altitudes = [
        GROUND_Y - 26,
        GROUND_Y - 52,
        GROUND_Y - 82
      ];

      obs.y = altitudes[Math.floor(Math.random() * altitudes.length)];
    }

    obs.rect = function() {
      return {
        x: this.x + 3,
        y: this.y + 3,
        w: this.w - 6,
        h: this.h - 6
      };
    };

    return obs;
  }

  /* --------------------------------------------------
     COLLISION
  -------------------------------------------------- */

  function intersects(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  /* --------------------------------------------------
     GAME RESET
  -------------------------------------------------- */

  function resetGame() {

    dino.y = GROUND_Y - dino.standH;
    dino.velY = 0;
    dino.jumping = false;
    dino.ducking = false;
    dino.legTimer = 0;

    obstacles = [];
    speed = INITIAL_SPEED;
    score = 0;
    spawnTimer = 70;

    gameOver = false;
    gameRunning = true;
    gameStarted = true;

    lastTime = performance.now();

    $("gameOverlay").classList.add("hidden");
    $("gameOverlayTitle").textContent = "DINO RUNNER";
    $("gameOverlayText").textContent = "Run, jump and survive.";

    updateGameUI();

    if (animationId) {
      cancelAnimationFrame(animationId);
    }

    animationId = requestAnimationFrame(gameLoop);
  }

  /* --------------------------------------------------
     GAME OVER
  -------------------------------------------------- */

  function endGame() {

    if (gameOver) return;

    gameOver = true;
    gameRunning = false;

    crashSound();

    const finalScore = Math.floor(score);

    if (finalScore > highScore) {
      highScore = finalScore;

      localStorage.setItem(
        "cyberDinoHighScore",
        String(highScore)
      );

      $("gameOverlayTitle").textContent = "NEW HIGH SCORE!";
    } else {
      $("gameOverlayTitle").textContent = "GAME OVER";
    }

    $("gameOverlayText").textContent =
      "Score: " + String(finalScore).padStart(5, "0") +
      " — Press restart to try again.";

    $("gameStartButton").textContent = "PLAY AGAIN";

    $("gameOverlay").classList.remove("hidden");

    updateGameUI();
  }

  /* --------------------------------------------------
     GAME UI
  -------------------------------------------------- */

  function updateGameUI() {

    $("gameScore").textContent = String(Math.floor(score)).padStart(5, "0");
    $("highScore").textContent = String(highScore).padStart(5, "0");

    $("gameSpeed").textContent =
      (speed / INITIAL_SPEED).toFixed(1) + "x";
  }

  $("gameStartButton").addEventListener("click", () => {
    clickSound();
    resetGame();
  });

  $("restartGameButton").addEventListener("click", () => {
    clickSound();
    resetGame();
  });

  /* --------------------------------------------------
     INPUT
  -------------------------------------------------- */

  function jump() {
    if (!gameRunning) return;
    dino.jump();
  }

  function duck(value) {
    dino.setDuck(value);
  }

  window.addEventListener("keydown", e => {

    // Don't capture keys when typing into form fields
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA"
    ) return;

    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();

      if (!gameRunning) {
        if (gameStarted && gameOver) {
          resetGame();
        }
      } else {
        jump();
      }
    }

    if (e.code === "ArrowDown") {
      e.preventDefault();
      duck(true);
    }

  });

  window.addEventListener("keyup", e => {
    if (e.code === "ArrowDown") {
      duck(false);
    }
  });

  /* TOUCH JUMP */

  const jumpButton = $("jumpButton");
  const duckButton = $("duckButton");

  jumpButton.addEventListener("pointerdown", e => {
    e.preventDefault();
    jump();
  });

  /* TOUCH DUCK */

  duckButton.addEventListener("pointerdown", e => {
    e.preventDefault();
    duck(true);
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach(eventName => {
    duckButton.addEventListener(eventName, () => duck(false));
  });

  /* --------------------------------------------------
     GAME DRAWING
  -------------------------------------------------- */

  function drawBackground(night) {

    ctx.fillStyle = night ? "#07101b" : "#eaf7ff";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Cyber grid
    ctx.strokeStyle = night
      ? "rgba(0,240,255,.08)"
      : "rgba(0,140,180,.09)";

    ctx.lineWidth = 1;

    for (let x = 0; x < GAME_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_HEIGHT);
      ctx.stroke();
    }

    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_WIDTH, y);
      ctx.stroke();
    }

    // Ground
    ctx.strokeStyle = night ? "#00f0ff" : "#456579";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(GAME_WIDTH, GROUND_Y);
    ctx.stroke();

    // Ground markings
    ctx.fillStyle = night ? "rgba(0,240,255,.25)" : "rgba(40,120,150,.25)";

    for (let x = 0; x < GAME_WIDTH; x += 60) {
      const offset = (score * 4) % 60;

      ctx.fillRect(x - offset, GROUND_Y + 12, 20, 2);
    }

    // Small decorative skyline
    ctx.fillStyle = night
      ? "rgba(0,240,255,.04)"
      : "rgba(40,120,150,.07)";

    for (let x = 0; x < GAME_WIDTH; x += 75) {
      const h = 20 + ((x * 17) % 55);

      ctx.fillRect(x, GROUND_Y - h, 45, h);
    }
  }

  function drawDino() {

    const r = dino.rect;

    const night = (Math.floor(score / 400) % 2) === 1;

    ctx.fillStyle = night ? "#00f0ff" : "#007b9b";

    // Body
    roundRect(ctx, r.x, r.y, r.w, r.h, 4);

    if (dino.ducking && !dino.jumping) {

      // Duck head / eye
      ctx.fillRect(r.x + r.w - 7, r.y + 2, 12, 12);

      ctx.fillStyle = night ? "#07101b" : "#eaf7ff";
      ctx.fillRect(r.x + r.w - 8, r.y + 6, 4, 4);

    } else {

      // Snout
      ctx.fillStyle = night ? "#00f0ff" : "#007b9b";
      ctx.fillRect(r.x + r.w - 6, r.y + 2, 12, 14);

      // Eye
      ctx.fillStyle = night ? "#07101b" : "#eaf7ff";
      ctx.fillRect(r.x + r.w - 4, r.y + 6, 4, 4);

    }

    // Animated legs
    if (!dino.jumping) {

      const legX = dino.legTimer % 12 < 6
        ? r.x + 8
        : r.x + 20;

      ctx.strokeStyle = night ? "#00f0ff" : "#007b9b";
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(legX, r.y + r.h);
      ctx.lineTo(legX, r.y + r.h + 5);
      ctx.stroke();
    }

  }

  function drawCactus(obs) {

    ctx.fillStyle = "#00ff9d";

    if (obs.kind === "cactus_small") {

      roundRect(
        ctx,
        obs.x + obs.w / 3,
        obs.y,
        obs.w / 3,
        obs.h,
        3
      );

      roundRect(
        ctx,
        obs.x - 3,
        obs.y + obs.h / 3,
        obs.w,
        obs.h / 4,
        3
      );

    } else {

      roundRect(
        ctx,
        obs.x + 10,
        obs.y,
        15,
        obs.h,
        3
      );

      roundRect(
        ctx,
        obs.x,
        obs.y + obs.h / 2,
        obs.w,
        9,
        3
      );

      roundRect(
        ctx,
        obs.x + 3,
        obs.y + 8,
        8,
        12,
        3
      );

    }

  }

  function drawBird(obs) {

    ctx.fillStyle = "#ff4fc8";

    // Bird body
    roundRect(
      ctx,
      obs.x,
      obs.y + 8,
      obs.w,
      10,
      3
    );

    // Wing animation
    const wingY = obs.wingTimer < 8
      ? obs.y
      : obs.y + 14;

    ctx.beginPath();
    ctx.moveTo(obs.x + 10, obs.y + 10);
    ctx.lineTo(obs.x + 24, obs.y + 10);
    ctx.lineTo(obs.x + 16, wingY);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = "#07101b";
    ctx.fillRect(obs.x + obs.w - 8, obs.y + 10, 3, 3);
  }

  function drawObstacles() {
    obstacles.forEach(obs => {
      if (obs.kind === "bird") {
        drawBird(obs);
      } else {
        drawCactus(obs);
      }
    });
  }

  function roundRect(context, x, y, w, h, radius) {

    const r = Math.min(radius, w / 2, h / 2);

    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + w - r, y);
    context.quadraticCurveTo(x + w, y, x + w, y + r);
    context.lineTo(x + w, y + h - r);
    context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    context.lineTo(x + r, y + h);
    context.quadraticCurveTo(x, y + h, x, y + h - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
    context.fill();
  }

  /* --------------------------------------------------
     GAME LOOP
  -------------------------------------------------- */

  function gameLoop(timestamp) {

    if (!gameRunning) return;

    const dt = Math.min(timestamp - lastTime || 16.67, 40);
    lastTime = timestamp;

    const factor = dt / 16.667;

    // Update player
    dino.update(dt);

    // Score
    score += speed * .04 * factor;

    // Speed progression
    speed = Math.min(
      MAX_SPEED,
      INITIAL_SPEED + score / 180
    );

    // Obstacle spawning
    spawnTimer -= factor;

    if (spawnTimer <= 0) {

      let kind;

      if (score > 150 && Math.random() < .35) {
        kind = "bird";
      } else {
        kind = Math.random() < .5
          ? "cactus_small"
          : "cactus_cluster";
      }

      obstacles.push(createObstacle(kind));

      const minGap = Math.floor(45 + speed * 1.5);

      spawnTimer = minGap + Math.random() * 45;
    }

    // Move obstacles and collision
    obstacles.forEach(obs => {

      obs.x -= speed * factor;
      obs.wingTimer = (obs.wingTimer + factor) % 16;

      if (intersects(dino.rect, obs.rect())) {
        endGame();
      }

    });

    obstacles = obstacles.filter(obs => obs.x + obs.w > -20);

    // Day/night every 400 score points
    const night = (Math.floor(score / 400) % 2) === 1;

    drawBackground(night);
    drawDino();
    drawObstacles();

    updateGameUI();

    if (!gameOver) {
      animationId = requestAnimationFrame(gameLoop);
    }
  }

  /* --------------------------------------------------
     INITIAL GAME SCREEN
  -------------------------------------------------- */

  drawBackground(false);
  drawDino();

  // Initial welcome screen
  $("gameOverlay").classList.remove("hidden");

  $("gameOverlayTitle").textContent = "DINO RUNNER";
  $("gameOverlayText").textContent =
    "Jump over obstacles and duck under birds. Survive to beat your high score.";

  $("gameStartButton").textContent = "START GAME";

  /* ==================================================
     CONSOLE
  ================================================== */

  console.log(
    "%c DIPIN RAJ // CYBER LAB ",
    "background:#050810;color:#00f0ff;font-size:20px;font-weight:bold;padding:10px;"
  );

  console.log(
    "%c SYSTEM ONLINE // GAME ENGINE INITIALIZED ",
    "color:#00ff9d;font-size:12px;"
  );

});

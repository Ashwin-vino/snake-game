/**
 * MODERN SNAKE GAME - ARCADE ADVENTURE
 * Complete system: XP & Levels, Coins & Gems, Power-Up Shop (Magnet, Shield, Freeze, Cut),
 * 4 Free Themed Maps (Classic, Desert, Train, Space), Obstacles, Speed Boosters,
 * Space Time-Stop Quick-Reaction Event, Skins, and Web Audio API soundscape.
 */

(() => {
  'use strict';

  // =========================================================================
  // 1. CONSTANTS, STORAGE KEYS & CATALOGS
  // =========================================================================

  const STORAGE_KEYS = {
    SELECTED_FOOD: 'snake_selected_food',
    THEME: 'snake_theme',
    SOUND: 'snake_sound_enabled',
    VIBRATION: 'snake_vibration_enabled',
    CLASSIC_HIGH: 'snake_classic_high_score',
    ENDLESS_HIGH: 'snake_endless_high_score',
    TOTAL_FRUITS: 'snake_total_fruits_eaten',
    COINS: 'snake_coins',
    GEMS: 'snake_gems',
    MAP: 'snake_selected_map',
    SKIN: 'snake_selected_skin',
    POWERUPS: 'snake_powerups'
  };

  const FOODS = [
    { id: 'apple', name: 'Apple', icon: '🍎', color: '#ef4444' },
    { id: 'orange', name: 'Orange', icon: '🍊', color: '#f97316' },
    { id: 'banana', name: 'Banana', icon: '🍌', color: '#eab308' },
    { id: 'coconut', name: 'Coconut', icon: '🥥', color: '#a16207' },
    { id: 'walnut', name: 'Walnut', icon: '🌰', color: '#854d0e' },
    { id: 'lemon', name: 'Lemon', icon: '🍋', color: '#facc15' },
    { id: 'watermelon', name: 'Watermelon', icon: '🍉', color: '#10b981' },
    { id: 'grapes', name: 'Grapes', icon: '🍇', color: '#8b5cf6' },
    { id: 'strawberry', name: 'Strawberry', icon: '🍓', color: '#f43f5e' },
    { id: 'pineapple', name: 'Pineapple', icon: '🍍', color: '#eab308' },
    { id: 'kiwi', name: 'Kiwi', icon: '🥝', color: '#84cc16' },
    { id: 'peach', name: 'Peach', icon: '🍑', color: '#fb923c' },
    { id: 'cherry', name: 'Cherry', icon: '🍒', color: '#e11d48' },
    { id: 'mango', name: 'Mango', icon: '🥭', color: '#f59e0b' },
    { id: 'pear', name: 'Pear', icon: '🍐', color: '#a3e635' },
    { id: 'blueberry', name: 'Blueberry', icon: '🫐', color: '#3b82f6' }
  ];

  const MAPS = {
    CLASSIC: 'classic',
    DESERT: 'desert',
    TRAIN: 'train',
    SPACE: 'space'
  };

  const SKINS = {
    classic: { name: 'Classic Arcade', head: '#10b981', body: '#34d399', tail: '#6ee7b7' },
    desert: { name: 'Desert Viper', head: '#d97706', body: '#f59e0b', tail: '#fde68a' },
    train: { name: 'Cyber Train', head: '#475569', body: '#94a3b8', tail: '#cbd5e1' },
    space: { name: 'Cosmic Nebula', head: '#8b5cf6', body: '#06b6d4', tail: '#38bdf8' }
  };

  const GRID_SIZE = 20;
  const CANVAS_SIZE = 440;
  const CELL_SIZE = CANVAS_SIZE / GRID_SIZE; // 22px

  const MODES = {
    CLASSIC: 'CLASSIC',
    ENDLESS: 'ENDLESS'
  };

  const DIRECTIONS = {
    UP: { x: 0, y: -1, name: 'UP', icon: '▲' },
    DOWN: { x: 0, y: 1, name: 'DOWN', icon: '▼' },
    LEFT: { x: -1, y: 0, name: 'LEFT', icon: '◀' },
    RIGHT: { x: 1, y: 0, name: 'RIGHT', icon: '▶' }
  };

  // =========================================================================
  // 2. SYNTHESIZED WEB AUDIO SYSTEM
  // =========================================================================

  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) audioCtx = new AudioClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!appState.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);

      } else if (type === 'eat') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(960, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);

      } else if (type === 'coin') {
        [987.77, 1318.51].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.25, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * 0.09);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + (idx + 1) * 0.09);
        });

      } else if (type === 'gem') {
        [1046.5, 1567.98, 2093.0].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.2, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + (idx + 1) * 0.1);
        });

      } else if (type === 'levelup') {
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.25, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + (idx + 1) * 0.14);
        });

      } else if (type === 'powerup') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);

      } else if (type === 'shield_break') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);

      } else if (type === 'boost') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.28);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);

      } else if (type === 'gameover') {
        [340, 270, 180].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0.2, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + (i + 1) * 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + (i + 1) * 0.14);
        });

      } else if (type === 'portal') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);

      } else if (type === 'train_warn') {
        [392, 523.25].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
          gain.gain.setValueAtTime(0.18, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + (i + 1) * 0.15);
        });
      }
    } catch {
      // Audio fallback
    }
  }

  function triggerVibrate(pattern) {
    if (appState.vibrationEnabled && 'vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch {}
    }
  }

  // =========================================================================
  // 3. PERSISTENT APPLICATION STATE
  // =========================================================================

  const appState = {
    theme: 'dark',
    soundEnabled: true,
    vibrationEnabled: true,
    selectedFoodId: 'apple',
    tempSelectedFoodId: 'apple',
    selectedMap: MAPS.CLASSIC,
    selectedSkin: 'classic',
    classicHighScore: 0,
    endlessHighScore: 0,
    totalFruitsEaten: 0,
    coins: 0,
    gems: 0,
    powerups: {
      magnet: 1,
      shield: 1,
      freeze: 0,
      cut: 0
    },
    currentScreen: 'screen-menu'
  };

  function loadSavedState() {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme === 'dark' || savedTheme === 'light') appState.theme = savedTheme;

      const savedFood = localStorage.getItem(STORAGE_KEYS.SELECTED_FOOD);
      if (savedFood && FOODS.some(f => f.id === savedFood)) {
        appState.selectedFoodId = savedFood;
        appState.tempSelectedFoodId = savedFood;
      }

      const savedMap = localStorage.getItem(STORAGE_KEYS.MAP);
      if (savedMap && Object.values(MAPS).includes(savedMap)) {
        appState.selectedMap = savedMap;
      }

      const savedSkin = localStorage.getItem(STORAGE_KEYS.SKIN);
      if (savedSkin && SKINS[savedSkin]) {
        appState.selectedSkin = savedSkin;
      }

      const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND);
      if (savedSound !== null) appState.soundEnabled = savedSound === 'true';

      const savedVib = localStorage.getItem(STORAGE_KEYS.VIBRATION);
      if (savedVib !== null) appState.vibrationEnabled = savedVib === 'true';

      const cHigh = parseInt(localStorage.getItem(STORAGE_KEYS.CLASSIC_HIGH), 10);
      if (!isNaN(cHigh)) appState.classicHighScore = cHigh;

      const eHigh = parseInt(localStorage.getItem(STORAGE_KEYS.ENDLESS_HIGH), 10);
      if (!isNaN(eHigh)) appState.endlessHighScore = eHigh;

      const fruits = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_FRUITS), 10);
      if (!isNaN(fruits)) appState.totalFruitsEaten = fruits;

      const coins = parseInt(localStorage.getItem(STORAGE_KEYS.COINS), 10);
      if (!isNaN(coins)) appState.coins = coins;

      const gems = parseInt(localStorage.getItem(STORAGE_KEYS.GEMS), 10);
      if (!isNaN(gems)) appState.gems = gems;

      const savedPowers = localStorage.getItem(STORAGE_KEYS.POWERUPS);
      if (savedPowers) {
        try {
          const parsed = JSON.parse(savedPowers);
          appState.powerups = { ...appState.powerups, ...parsed };
        } catch {}
      }
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, appState.theme);
      localStorage.setItem(STORAGE_KEYS.SELECTED_FOOD, appState.selectedFoodId);
      localStorage.setItem(STORAGE_KEYS.MAP, appState.selectedMap);
      localStorage.setItem(STORAGE_KEYS.SKIN, appState.selectedSkin);
      localStorage.setItem(STORAGE_KEYS.SOUND, appState.soundEnabled);
      localStorage.setItem(STORAGE_KEYS.VIBRATION, appState.vibrationEnabled);
      localStorage.setItem(STORAGE_KEYS.CLASSIC_HIGH, appState.classicHighScore);
      localStorage.setItem(STORAGE_KEYS.ENDLESS_HIGH, appState.endlessHighScore);
      localStorage.setItem(STORAGE_KEYS.TOTAL_FRUITS, appState.totalFruitsEaten);
      localStorage.setItem(STORAGE_KEYS.COINS, appState.coins);
      localStorage.setItem(STORAGE_KEYS.GEMS, appState.gems);
      localStorage.setItem(STORAGE_KEYS.POWERUPS, JSON.stringify(appState.powerups));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // XP & Level helpers
  function getLevelData() {
    // Every fruit = 10 XP. 10 fruits = 100 XP = 1 Level increase.
    const totalXP = appState.totalFruitsEaten * 10;
    const level = 1 + Math.floor(totalXP / 100);
    const currentXP = totalXP % 100;
    const nextLevelXP = 100;
    const progressPercent = Math.min(100, (currentXP / nextLevelXP) * 100);

    return { totalXP, level, currentXP, nextLevelXP, progressPercent };
  }

  function getSelectedFood() {
    return FOODS.find(f => f.id === appState.selectedFoodId) || FOODS[0];
  }

  // =========================================================================
  // 4. GAME ENGINE & OBSTACLE SYSTEMS
  // =========================================================================

  const game = {
    mode: MODES.CLASSIC,
    map: MAPS.CLASSIC,
    snake: [],
    direction: DIRECTIONS.RIGHT,
    directionQueue: [],
    food: { x: 10, y: 10 },
    score: 0,
    length: 3,
    highScore: 0,
    isPaused: false,
    isRunning: false,
    isGameOver: false,
    lastTickTime: 0,
    tickInterval: 140,
    particles: [],
    floatingTexts: [],
    sessionFruitsEaten: 0,

    // Active powerup timers/flags
    shieldActive: false,
    invulnerableUntil: 0,
    magnetTimeRemaining: 0,
    freezeTimeRemaining: 0,
    boostTimeRemaining: 0,

    // Map Specific Objects
    cacti: [],               // Desert: { x, y, expireTime }
    trains: [],              // Train: { axis: 'x'|'y', fixedCoord: N, position: N, speed: N, length: N }
    trainWarning: null,      // Warning alert before train enters
    speedBoosters: [],       // Train: { x, y }
    planets: [],             // Space: [{ x, y, icon, radius }]

    // Space Time-Stop Event
    timeStopActive: false,
    timeStopSeq: [],
    timeStopIndex: 0,
    timeStopTimer: null,
    fruitsUntilTimeStop: 6
  };

  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  function setupCanvasDpi() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    ctx.scale(dpr, dpr);
  }

  function calculateBaseInterval(score) {
    if (score < 50) return 140;
    if (score < 100) return 115;
    if (score < 200) return 90;
    return 75;
  }

  function getEffectiveTickInterval() {
    let interval = calculateBaseInterval(game.score);
    // Speed Boost in Train map: 35% faster
    if (game.boostTimeRemaining > 0) {
      interval = Math.max(45, Math.floor(interval * 0.65));
    }
    // Freeze Power-up: slow motion
    if (game.freezeTimeRemaining > 0) {
      interval = Math.floor(interval * 1.8);
    }
    return interval;
  }

  function resetGame(mode) {
    game.mode = mode;
    game.map = appState.selectedMap;
    game.direction = DIRECTIONS.RIGHT;
    game.directionQueue = [];
    game.score = 0;
    game.sessionFruitsEaten = 0;
    game.isPaused = false;
    game.isGameOver = false;
    game.isRunning = true;
    game.lastTickTime = performance.now();
    game.tickInterval = calculateBaseInterval(0);
    game.particles = [];
    game.floatingTexts = [];

    // Reset powerup statuses
    game.shieldActive = false;
    game.invulnerableUntil = 0;
    game.magnetTimeRemaining = 0;
    game.freezeTimeRemaining = 0;
    game.boostTimeRemaining = 0;
    game.timeStopActive = false;
    game.fruitsUntilTimeStop = 6;

    // Reset map obstacles
    game.cacti = [];
    game.trains = [];
    game.trainWarning = null;
    game.speedBoosters = [];
    game.planets = [];

    // Starting snake
    const startY = Math.floor(GRID_SIZE / 2);
    game.snake = [
      { x: 5, y: startY },
      { x: 4, y: startY },
      { x: 3, y: startY }
    ];
    game.length = game.snake.length;
    game.highScore = mode === MODES.CLASSIC ? appState.classicHighScore : appState.endlessHighScore;

    // Initialize Map Specific Obstacles
    if (game.map === MAPS.SPACE) {
      initSpacePlanets();
    } else if (game.map === MAPS.TRAIN) {
      spawnSpeedBooster();
    }

    spawnFood();
    updateHUD();
    updatePowerupButtons();
    closeAllOverlays();

    // Map & mode pills in HUD
    const mapPill = document.getElementById('hud-map-pill');
    if (mapPill) {
      const mapIcons = { classic: '🕹️ Classic', desert: '🏜️ Desert', train: '🚆 Train', space: '🚀 Space' };
      mapPill.textContent = mapIcons[game.map] || 'Classic';
    }

    const quitBtn = document.getElementById('btn-game-quit');
    const lengthContainer = document.getElementById('hud-length-container');
    if (quitBtn) quitBtn.style.display = mode === MODES.ENDLESS ? 'inline-flex' : 'none';
    if (lengthContainer) lengthContainer.style.display = mode === MODES.ENDLESS ? 'flex' : 'none';
  }

  // --- MAP 2: DESERT CACTUS OBSTACLES ---
  function updateDesertObstacles() {
    if (game.map !== MAPS.DESERT || !game.isRunning || game.isPaused) return;

    const now = performance.now();
    // Remove expired cacti
    game.cacti = game.cacti.filter(c => now < c.expireTime);

    // Number of cacti scales gently with score
    let targetCacti = 1;
    if (game.score >= 60) targetCacti = 2;
    if (game.score >= 140) targetCacti = 3;

    if (game.cacti.length < targetCacti && Math.random() < 0.04) {
      let emptyCells = getEmptyCells();
      if (emptyCells.length > 0) {
        // Choose cell not directly adjacent to snake head
        const head = game.snake[0];
        const safeCells = emptyCells.filter(c => Math.hypot(c.x - head.x, c.y - head.y) > 3);
        const cell = (safeCells.length > 0 ? safeCells : emptyCells)[Math.floor(Math.random() * (safeCells.length || emptyCells.length))];
        game.cacti.push({
          x: cell.x,
          y: cell.y,
          expireTime: now + (Math.random() * 8000 + 10000) // 10-18 seconds
        });
      }
    }
  }

  // --- MAP 3: TRAIN & SPEED BOOSTERS ---
  function updateTrainObstacles() {
    if (game.map !== MAPS.TRAIN || !game.isRunning || game.isPaused) return;

    // Random train schedule
    if (game.trains.length === 0 && !game.trainWarning && Math.random() < 0.008) {
      // Pick random track (horizontal row 6, 10, or 14)
      const tracks = [5, 10, 15];
      const fixedRow = tracks[Math.floor(Math.random() * tracks.length)];
      game.trainWarning = { row: fixedRow, blink: 0, expires: performance.now() + 1800 };
      playSound('train_warn');

      setTimeout(() => {
        if (!game.isRunning) return;
        game.trainWarning = null;
        game.trains.push({
          row: fixedRow,
          pos: -4,
          length: 5,
          speed: 0.35 // Moves smoothly across
        });
      }, 1800);
    }

    // Advance trains
    for (let i = game.trains.length - 1; i >= 0; i--) {
      const tr = game.trains[i];
      tr.pos += tr.speed;
      if (tr.pos - tr.length > GRID_SIZE + 2) {
        game.trains.splice(i, 1);
      }
    }

    // Spawn / maintain speed booster
    if (game.speedBoosters.length === 0 && Math.random() < 0.02) {
      spawnSpeedBooster();
    }
  }

  function spawnSpeedBooster() {
    const empty = getEmptyCells();
    if (empty.length > 0) {
      const choice = empty[Math.floor(Math.random() * empty.length)];
      game.speedBoosters = [{ x: choice.x, y: choice.y }];
    }
  }

  // --- MAP 4: SPACE PLANET OBSTACLES & TIME STOP ---
  function initSpacePlanets() {
    // 3 celestial planetary obstacles placed strategically
    const planetIcons = ['🌍', '🪐', '🌑'];
    const positions = [
      { x: 4, y: 4 },
      { x: 15, y: 5 },
      { x: 10, y: 14 }
    ];
    game.planets = positions.map((pos, idx) => ({
      x: pos.x,
      y: pos.y,
      icon: planetIcons[idx % planetIcons.length]
    }));
  }

  function triggerSpaceTimeStop() {
    if (game.timeStopActive || !game.isRunning) return;
    game.timeStopActive = true;
    playSound('portal');

    // Generate sequence of 4-6 directions
    const dirKeys = ['LEFT', 'UP', 'RIGHT', 'DOWN'];
    let count = 4;
    if (game.score >= 80) count = 5;
    if (game.score >= 160) count = 6;

    game.timeStopSeq = [];
    for (let i = 0; i < count; i++) {
      const r = dirKeys[Math.floor(Math.random() * dirKeys.length)];
      game.timeStopSeq.push(r);
    }
    game.timeStopIndex = 0;

    renderTimeStopOverlay();
    showOverlay('overlay-reaction');

    // Timer bar: 4.5 seconds
    const duration = 4500;
    const startTime = performance.now();
    const timerFill = document.getElementById('reaction-timer-fill');

    if (game.timeStopTimer) clearInterval(game.timeStopTimer);
    game.timeStopTimer = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      if (timerFill) timerFill.style.width = `${pct}%`;

      if (elapsed >= duration) {
        clearInterval(game.timeStopTimer);
        finishTimeStop(false);
      }
    }, 50);
  }

  function renderTimeStopOverlay() {
    const box = document.getElementById('reaction-sequence-box');
    if (!box) return;
    box.innerHTML = '';
    const arrows = { UP: '▲', DOWN: '▼', LEFT: '◀', RIGHT: '▶' };

    game.timeStopSeq.forEach((dir, idx) => {
      const el = document.createElement('div');
      el.className = `seq-item ${idx === 0 ? 'active' : ''}`;
      el.id = `seq-step-${idx}`;
      el.textContent = arrows[dir];
      box.appendChild(el);
    });
  }

  function handleReactionInput(dirName) {
    if (!game.timeStopActive) return;

    const expected = game.timeStopSeq[game.timeStopIndex];
    const currentEl = document.getElementById(`seq-step-${game.timeStopIndex}`);

    if (dirName === expected) {
      playSound('click');
      if (currentEl) {
        currentEl.classList.remove('active');
        currentEl.classList.add('done');
      }
      game.timeStopIndex++;

      if (game.timeStopIndex >= game.timeStopSeq.length) {
        // Complete!
        clearInterval(game.timeStopTimer);
        finishTimeStop(true);
      } else {
        const nextEl = document.getElementById(`seq-step-${game.timeStopIndex}`);
        if (nextEl) nextEl.classList.add('active');
      }
    } else {
      // Wrong button
      if (currentEl) {
        currentEl.classList.add('wrong');
        setTimeout(() => currentEl.classList.remove('wrong'), 200);
      }
    }
  }

  function finishTimeStop(success) {
    game.timeStopActive = false;
    closeAllOverlays();

    if (success) {
      playSound('levelup');
      game.score += 50;
      appState.coins += 10;
      appState.gems += 5;
      saveState();
      updateHeaderCurrencies();
      showToast('⚡ REACTION SUCCESS! +50 Score, +10 Coins, +5 Gems!');
    } else {
      showToast('Time Stop expired! Resuming cosmic journey...');
    }
    game.lastTickTime = performance.now();
  }

  function getEmptyCells() {
    let cells = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const isSnake = game.snake.some(s => s.x === x && s.y === y);
        const isCactus = game.cacti.some(c => c.x === x && c.y === y);
        const isPlanet = game.planets.some(p => p.x === x && p.y === y);
        const isBooster = game.speedBoosters.some(b => b.x === x && b.y === y);
        if (!isSnake && !isCactus && !isPlanet && !isBooster) {
          cells.push({ x, y });
        }
      }
    }
    return cells;
  }

  function spawnFood() {
    const empty = getEmptyCells();
    if (empty.length > 0) {
      const choice = empty[Math.floor(Math.random() * empty.length)];
      game.food = { x: choice.x, y: choice.y };
    }
  }

  function handleDirectionInput(newDir) {
    if (!game.isRunning || game.isPaused || game.isGameOver || game.timeStopActive) return;

    const last = game.directionQueue.length > 0
      ? game.directionQueue[game.directionQueue.length - 1]
      : game.direction;

    const isOpposite = (newDir.x === -last.x && newDir.y === -last.y);
    const isSame = (newDir.x === last.x && newDir.y === last.y);

    if (!isOpposite && !isSame && game.directionQueue.length < 2) {
      game.directionQueue.push(newDir);
    }
  }

  // --- POWER-UPS ACTIVATION ---
  function activatePowerUp(type) {
    if (!game.isRunning || game.isPaused || game.isGameOver) return;
    if (appState.powerups[type] <= 0) {
      showToast(`You don't own any ${type} power-ups! Buy in Shop.`);
      return;
    }

    appState.powerups[type]--;
    saveState();
    updatePowerupButtons();
    playSound('powerup');

    if (type === 'magnet') {
      game.magnetTimeRemaining = 10;
      showToast('🧲 Magnet Activated! Drawing food to snake!');
    } else if (type === 'shield') {
      game.shieldActive = true;
      showToast('🛡️ Shield Active! 1 lethal collision will be absorbed.');
    } else if (type === 'freeze') {
      game.freezeTimeRemaining = 8;
      showToast('❄️ Freeze Activated! Slow motion enabled!');
    } else if (type === 'cut') {
      // Cuts snake length in half (minimum 3)
      if (game.snake.length > 3) {
        const newLen = Math.max(3, Math.floor(game.snake.length / 2));
        game.snake = game.snake.slice(0, newLen);
        game.length = game.snake.length;
        spawnEatParticles(game.snake[0].x, game.snake[0].y);
        showToast(`✂️ Snake body trimmed to ${newLen} segments!`);
      } else {
        showToast('Snake is already at minimum size!');
      }
    }
    updateStatusChips();
  }

  // --- MAIN GAME TICK ---
  function stepGame() {
    if (game.directionQueue.length > 0) {
      game.direction = game.directionQueue.shift();
    }

    // Magnet Effect: pull food 1 step closer to head
    if (game.magnetTimeRemaining > 0) {
      const head = game.snake[0];
      const dx = head.x - game.food.x;
      const dy = head.y - game.food.y;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        if (Math.abs(dx) > Math.abs(dy)) {
          game.food.x += dx > 0 ? 1 : -1;
        } else {
          game.food.y += dy > 0 ? 1 : -1;
        }
      }
    }

    const head = game.snake[0];
    let newHead = {
      x: head.x + game.direction.x,
      y: head.y + game.direction.y
    };

    // Boundary check
    let hitWall = false;
    if (game.mode === MODES.CLASSIC) {
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        hitWall = true;
      }
    } else {
      // Endless wrap
      if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
      else if (newHead.x >= GRID_SIZE) newHead.x = 0;
      if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
      else if (newHead.y >= GRID_SIZE) newHead.y = 0;
    }

    // Obstacle Collisions
    const hitCactus = game.cacti.some(c => c.x === newHead.x && c.y === newHead.y);
    const hitPlanet = game.planets.some(p => p.x === newHead.x && p.y === newHead.y);

    let hitTrain = false;
    for (const tr of game.trains) {
      const trainMin = tr.pos;
      const trainMax = tr.pos + tr.length;
      if (newHead.y === tr.row && newHead.x >= trainMin && newHead.x <= trainMax) {
        hitTrain = true;
        break;
      }
    }

    // Self-Collision
    const eatingFood = (newHead.x === game.food.x && newHead.y === game.food.y);
    const checkSegs = eatingFood ? game.snake : game.snake.slice(0, -1);
    const hitSelf = checkSegs.some(s => s.x === newHead.x && s.y === newHead.y);

    const isLethal = hitWall || hitCactus || hitPlanet || hitTrain || hitSelf;

    if (isLethal) {
      // Check Shield
      if (game.shieldActive) {
        game.shieldActive = false;
        playSound('shield_break');
        triggerVibrate([50, 50, 50]);
        spawnEatParticles(head.x, head.y);
        showToast('🛡️ Shield absorbed the lethal collision!');
        updateStatusChips();
        return; // Absorb collision, do not advance into death cell
      }

      // Game Over
      if (game.mode === MODES.CLASSIC) {
        let reason = 'You crashed!';
        if (hitWall) reason = 'You hit the wall!';
        else if (hitCactus) reason = 'You bumped into a sharp cactus!';
        else if (hitPlanet) reason = 'You collided with a celestial planet!';
        else if (hitTrain) reason = 'You were hit by a train carriage!';
        else if (hitSelf) reason = 'You bit your own tail!';
        triggerGameOver(reason);
      } else {
        triggerEndlessQuit('You completed your run.');
      }
      return;
    }

    // Touch speed booster in Train map
    const hitBoosterIndex = game.speedBoosters.findIndex(b => b.x === newHead.x && b.y === newHead.y);
    if (hitBoosterIndex !== -1) {
      game.speedBoosters.splice(hitBoosterIndex, 1);
      game.boostTimeRemaining = 6;
      playSound('boost');
      triggerVibrate(30);
      showToast('⚡ TURBO SPEED BOOST ACTIVATED!');
      updateStatusChips();
    }

    // Advance snake
    game.snake.unshift(newHead);

    if (eatingFood) {
      handleFoodEaten(newHead);
    } else {
      game.snake.pop();
    }

    // Timers update
    updateActiveTimers();
    updateHUD();
  }

  function handleFoodEaten(cell) {
    game.score += 10;
    game.length = game.snake.length;
    game.sessionFruitsEaten++;
    appState.totalFruitsEaten++;

    // Currency checks
    // 10 fruits eaten -> +10 Coins
    if (appState.totalFruitsEaten % 10 === 0) {
      appState.coins += 10;
      playSound('coin');
      spawnFloatingText('+10 Coins 🪙', cell.x, cell.y - 1);
    }

    // 20 fruits eaten -> +10 Gems
    if (appState.totalFruitsEaten % 20 === 0) {
      appState.gems += 10;
      playSound('gem');
      spawnFloatingText('+10 Gems 💎', cell.x, cell.y - 2);
    }

    // Level-Up Check
    const prevLevel = 1 + Math.floor((appState.totalFruitsEaten - 1) * 10 / 100);
    const currLevel = 1 + Math.floor(appState.totalFruitsEaten * 10 / 100);

    if (currLevel > prevLevel) {
      triggerLevelUp(currLevel);
    } else {
      playSound('eat');
    }

    triggerVibrate(25);
    spawnEatParticles(cell.x, cell.y);
    spawnFloatingText('+10', cell.x, cell.y);
    bumpScoreUI();

    // Check high score
    if (game.score > game.highScore) {
      game.highScore = game.score;
      if (game.mode === MODES.CLASSIC) {
        appState.classicHighScore = game.score;
      } else {
        appState.endlessHighScore = game.score;
      }
    }

    // Space map time-stop trigger count
    if (game.map === MAPS.SPACE) {
      game.fruitsUntilTimeStop--;
      if (game.fruitsUntilTimeStop <= 0) {
        game.fruitsUntilTimeStop = 6;
        setTimeout(triggerSpaceTimeStop, 300);
      }
    }

    saveState();
    updateHeaderCurrencies();
    spawnFood();
  }

  function triggerLevelUp(newLevel) {
    playSound('levelup');
    triggerVibrate([80, 50, 100]);
    appState.coins += 10; // Bonus reward
    saveState();

    const display = document.getElementById('levelup-display');
    if (display) display.textContent = `LEVEL ${newLevel}`;
    showOverlay('overlay-levelup');
  }

  function updateActiveTimers() {
    // Decrement powerup timers by frame time (roughly tick interval)
    const dt = 0.12; // approximate step seconds
    if (game.magnetTimeRemaining > 0) {
      game.magnetTimeRemaining = Math.max(0, game.magnetTimeRemaining - dt);
    }
    if (game.freezeTimeRemaining > 0) {
      game.freezeTimeRemaining = Math.max(0, game.freezeTimeRemaining - dt);
    }
    if (game.boostTimeRemaining > 0) {
      game.boostTimeRemaining = Math.max(0, game.boostTimeRemaining - dt);
    }
    updateStatusChips();
  }

  function updateStatusChips() {
    const sShield = document.getElementById('status-shield');
    const sMagnet = document.getElementById('status-magnet');
    const sFreeze = document.getElementById('status-freeze');
    const sBoost = document.getElementById('status-boost');

    if (sShield) sShield.classList.toggle('show', game.shieldActive);

    if (sMagnet) {
      const show = game.magnetTimeRemaining > 0;
      sMagnet.classList.toggle('show', show);
      if (show) document.getElementById('timer-magnet').textContent = `${Math.ceil(game.magnetTimeRemaining)}s`;
    }

    if (sFreeze) {
      const show = game.freezeTimeRemaining > 0;
      sFreeze.classList.toggle('show', show);
      if (show) document.getElementById('timer-freeze').textContent = `${Math.ceil(game.freezeTimeRemaining)}s`;
    }

    if (sBoost) {
      const show = game.boostTimeRemaining > 0;
      sBoost.classList.toggle('show', show);
      if (show) document.getElementById('timer-boost').textContent = `${Math.ceil(game.boostTimeRemaining)}s`;
    }
  }

  function bumpScoreUI() {
    const el = document.getElementById('hud-score');
    if (el) {
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
      setTimeout(() => el.classList.remove('bump'), 180);
    }
  }

  function spawnEatParticles(cellX, cellY) {
    const food = getSelectedFood();
    const cx = cellX * CELL_SIZE + CELL_SIZE / 2;
    const cy = cellY * CELL_SIZE + CELL_SIZE / 2;

    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 / 10) * i + (Math.random() - 0.5);
      const spd = Math.random() * 2.5 + 1.2;
      game.particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: Math.random() * 3 + 2,
        color: food.color,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.03
      });
    }
  }

  function spawnFloatingText(text, cellX, cellY) {
    game.floatingTexts.push({
      text,
      x: cellX * CELL_SIZE + CELL_SIZE / 2,
      y: cellY * CELL_SIZE,
      vy: -1.2,
      opacity: 1.0,
      decay: 0.03
    });
  }

  function triggerGameOver(cause) {
    game.isRunning = false;
    game.isGameOver = true;
    playSound('gameover');
    triggerVibrate([80, 50, 100]);

    const isNewHigh = game.score > 0 && game.score >= appState.classicHighScore;
    if (isNewHigh) playSound('levelup');

    document.getElementById('gameover-cause').textContent = cause || 'You hit an obstacle!';
    document.getElementById('gameover-score').textContent = game.score;
    document.getElementById('gameover-high-score').textContent = appState.classicHighScore;

    const badge = document.getElementById('gameover-new-high-badge');
    if (badge) badge.classList.toggle('show', isNewHigh);

    showOverlay('overlay-gameover');
  }

  function triggerEndlessQuit(customSub) {
    game.isRunning = false;
    game.isGameOver = true;
    playSound('gameover');

    const isNewHigh = game.score > 0 && game.score >= appState.endlessHighScore;
    if (isNewHigh) playSound('levelup');

    const sub = document.querySelector('#overlay-endless-quit .overlay-subtitle');
    if (sub) sub.textContent = customSub || 'Great run! Here is your endless expedition summary.';

    document.getElementById('endless-result-score').textContent = game.score;
    document.getElementById('endless-result-length').textContent = game.snake.length;
    document.getElementById('endless-result-high').textContent = appState.endlessHighScore;

    const badge = document.getElementById('endless-new-high-badge');
    if (badge) badge.classList.toggle('show', isNewHigh);

    showOverlay('overlay-endless-quit');
  }

  function togglePause() {
    if (!game.isRunning || game.isGameOver || game.timeStopActive) return;

    game.isPaused = !game.isPaused;
    if (game.isPaused) {
      playSound('click');
      document.getElementById('pause-score').textContent = game.score;
      document.getElementById('pause-map').textContent = game.map.toUpperCase();
      showOverlay('overlay-pause');
    } else {
      playSound('click');
      closeAllOverlays();
      game.lastTickTime = performance.now();
    }
  }

  // =========================================================================
  // 5. RENDERING PIPELINE (THEMED MAPS & SKINS)
  // =========================================================================

  function renderGame() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 1. Draw Themed Background
    renderMapBackground(isDark);

    // 2. Draw Themed Obstacles
    renderMapObstacles();

    // 3. Draw Food
    renderFood(isDark);

    // 4. Draw Snake with Selected Skin
    renderSnake(isDark);

    // 5. Render Particles & Floating Text
    renderFX();
  }

  function renderMapBackground(isDark) {
    if (game.map === MAPS.CLASSIC) {
      // Classic clean grid
      const dot = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          if ((x + y) % 2 === 0) {
            ctx.fillStyle = dot;
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    } else if (game.map === MAPS.DESERT) {
      // Warm sandy background
      ctx.fillStyle = isDark ? '#2e1907' : '#fef3c7';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Subtle dune ripples
      ctx.strokeStyle = isDark ? 'rgba(245, 158, 11, 0.06)' : 'rgba(217, 119, 6, 0.1)';
      ctx.lineWidth = 2;
      for (let y = 20; y < CANVAS_SIZE; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(CANVAS_SIZE * 0.3, y - 8, CANVAS_SIZE * 0.7, y + 8, CANVAS_SIZE, y);
        ctx.stroke();
      }
    } else if (game.map === MAPS.TRAIN) {
      // Railway tracks background
      ctx.fillStyle = isDark ? '#141c2b' : '#e2e8f0';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Train tracks on lines 5, 10, 15
      const tracks = [5, 10, 15];
      tracks.forEach(row => {
        const y = row * CELL_SIZE;
        // Wooden sleepers
        ctx.fillStyle = isDark ? '#334155' : '#94a3b8';
        for (let x = 0; x < CANVAS_SIZE; x += 14) {
          ctx.fillRect(x, y + 2, 7, CELL_SIZE - 4);
        }
        // Metal rails
        ctx.strokeStyle = isDark ? '#64748b' : '#475569';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, y + 4); ctx.lineTo(CANVAS_SIZE, y + 4);
        ctx.moveTo(0, y + CELL_SIZE - 4); ctx.lineTo(CANVAS_SIZE, y + CELL_SIZE - 4);
        ctx.stroke();
      });
    } else if (game.map === MAPS.SPACE) {
      // Cosmic space background
      ctx.fillStyle = '#060814';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Twinkling stars
      const t = performance.now() / 1000;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 35; i++) {
        const sx = ((i * 37) % CANVAS_SIZE);
        const sy = ((i * 73) % CANVAS_SIZE);
        const alpha = Math.sin(t + i) * 0.4 + 0.6;
        ctx.globalAlpha = alpha;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.globalAlpha = 1.0;
    }
  }

  function renderMapObstacles() {
    // Desert: Cacti 🌵
    if (game.map === MAPS.DESERT) {
      game.cacti.forEach(c => {
        const cx = c.x * CELL_SIZE + CELL_SIZE / 2;
        const cy = c.y * CELL_SIZE + CELL_SIZE / 2;
        ctx.font = `${Math.floor(CELL_SIZE * 0.9)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌵', cx, cy);
      });
    }

    // Train: Warning indicator & Trains 🚆
    if (game.map === MAPS.TRAIN) {
      if (game.trainWarning) {
        const y = game.trainWarning.row * CELL_SIZE;
        const blink = Math.sin(performance.now() / 100) > 0;
        if (blink) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
          ctx.fillRect(0, y, CANVAS_SIZE, CELL_SIZE);
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#ef4444';
          ctx.fillText('⚠️ TRAIN APPROACHING ⚠️', CANVAS_SIZE / 2, y + CELL_SIZE / 2 + 4);
        }
      }

      game.trains.forEach(tr => {
        const y = tr.row * CELL_SIZE;
        for (let seg = 0; seg < tr.length; seg++) {
          const x = (tr.pos + seg) * CELL_SIZE;
          if (x >= -CELL_SIZE && x <= CANVAS_SIZE) {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(x + 1, y + 2, CELL_SIZE - 2, CELL_SIZE - 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 4, y + 6, CELL_SIZE - 8, 4); // window
          }
        }
      });

      // Speed Boosters ⚡
      game.speedBoosters.forEach(b => {
        const bx = b.x * CELL_SIZE + CELL_SIZE / 2;
        const by = b.y * CELL_SIZE + CELL_SIZE / 2;
        ctx.font = `${Math.floor(CELL_SIZE * 0.9)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', bx, by);
      });
    }

    // Space: Planets 🪐
    if (game.map === MAPS.SPACE) {
      game.planets.forEach(p => {
        const px = p.x * CELL_SIZE + CELL_SIZE / 2;
        const py = p.y * CELL_SIZE + CELL_SIZE / 2;
        ctx.font = `${Math.floor(CELL_SIZE * 0.95)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.icon, px, py);
      });
    }
  }

  function renderFood(isDark) {
    const food = getSelectedFood();
    const fx = game.food.x * CELL_SIZE + CELL_SIZE / 2;
    const fy = game.food.y * CELL_SIZE + CELL_SIZE / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(fx, fy + 2, CELL_SIZE * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.1)';
    ctx.fill();

    const pulse = Math.sin(performance.now() / 200) * 1.5;
    ctx.font = `${Math.floor(CELL_SIZE * 0.85 + pulse)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(food.icon, fx, fy);
    ctx.restore();
  }

  function renderSnake(isDark) {
    const skin = SKINS[appState.selectedSkin] || SKINS.classic;

    for (let i = game.snake.length - 1; i >= 0; i--) {
      const seg = game.snake[i];
      const px = seg.x * CELL_SIZE;
      const py = seg.y * CELL_SIZE;
      const radius = 6;

      ctx.save();
      if (i === 0) {
        // Snake Head
        ctx.fillStyle = skin.head;
        ctx.shadowColor = skin.head;
        ctx.shadowBlur = isDark ? 8 : 4;

        // Shield active glow
        if (game.shieldActive) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);
        }

        drawRoundedRect(ctx, px + 1.5, py + 1.5, CELL_SIZE - 3, CELL_SIZE - 3, radius + 2);
        ctx.fill();
        drawSnakeEyes(ctx, px, py, CELL_SIZE, game.direction);
      } else {
        // Body Segment
        const t = i / game.snake.length;
        ctx.fillStyle = interpolateColor(skin.body, skin.tail, t);
        const pad = 2;
        drawRoundedRect(ctx, px + pad, py + pad, CELL_SIZE - pad * 2, CELL_SIZE - pad * 2, radius);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawRoundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  function drawSnakeEyes(context, x, y, size, dir) {
    const eyeRadius = 2.4;
    const pupilRadius = 1.3;
    let eye1 = { x: 0, y: 0 };
    let eye2 = { x: 0, y: 0 };
    let lookOffset = { x: 0, y: 0 };

    if (dir === DIRECTIONS.RIGHT) {
      eye1 = { x: x + size * 0.7, y: y + size * 0.3 };
      eye2 = { x: x + size * 0.7, y: y + size * 0.7 };
      lookOffset = { x: 0.8, y: 0 };
    } else if (dir === DIRECTIONS.LEFT) {
      eye1 = { x: x + size * 0.3, y: y + size * 0.3 };
      eye2 = { x: x + size * 0.3, y: y + size * 0.7 };
      lookOffset = { x: -0.8, y: 0 };
    } else if (dir === DIRECTIONS.UP) {
      eye1 = { x: x + size * 0.3, y: y + size * 0.3 };
      eye2 = { x: x + size * 0.7, y: y + size * 0.3 };
      lookOffset = { x: 0, y: -0.8 };
    } else {
      eye1 = { x: x + size * 0.3, y: y + size * 0.7 };
      eye2 = { x: x + size * 0.7, y: y + size * 0.7 };
      lookOffset = { x: 0, y: 0.8 };
    }

    [eye1, eye2].forEach(eye => {
      context.beginPath();
      context.arc(eye.x, eye.y, eyeRadius, 0, Math.PI * 2);
      context.fillStyle = '#ffffff';
      context.fill();

      context.beginPath();
      context.arc(eye.x + lookOffset.x, eye.y + lookOffset.y, pupilRadius, 0, Math.PI * 2);
      context.fillStyle = '#0f172a';
      context.fill();
    });
  }

  function renderFX() {
    // Particles
    for (let i = game.particles.length - 1; i >= 0; i--) {
      const p = game.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        game.particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Floating text
    for (let i = game.floatingTexts.length - 1; i >= 0; i--) {
      const ft = game.floatingTexts[i];
      ft.y += ft.vy;
      ft.opacity -= ft.decay;
      if (ft.opacity <= 0) {
        game.floatingTexts.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.opacity);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 13px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  function interpolateColor(color1, color2, factor) {
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);
    const r1 = (c1 >> 16) & 255, g1 = (c1 >> 8) & 255, b1 = c1 & 255;
    const r2 = (c2 >> 16) & 255, g2 = (c2 >> 8) & 255, b2 = c2 & 255;
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    return `rgb(${r},${g},${b})`;
  }

  // Master Game Loop
  function gameLoop(now) {
    if (game.isRunning && !game.isPaused && !game.isGameOver && !game.timeStopActive) {
      // Dynamic Map obstacles update
      updateDesertObstacles();
      updateTrainObstacles();

      const delta = now - game.lastTickTime;
      const interval = getEffectiveTickInterval();
      if (delta >= interval) {
        stepGame();
        game.lastTickTime = now;
      }
    }

    if (appState.currentScreen === 'screen-game') {
      renderGame();
    }

    requestAnimationFrame(gameLoop);
  }

  // =========================================================================
  // 6. MAIN MENU MINI-SNAKE ANIMATION
  // =========================================================================

  const menuCanvas = document.getElementById('menu-anim-canvas');
  const menuCtx = menuCanvas ? menuCanvas.getContext('2d') : null;
  let menuSnake = [
    { x: 140, y: 40 },
    { x: 125, y: 40 },
    { x: 110, y: 40 },
    { x: 95, y: 40 },
    { x: 80, y: 40 }
  ];
  let menuPhase = 0;

  function renderMenuAnimation() {
    if (!menuCtx || appState.currentScreen !== 'screen-menu') return;
    menuCtx.clearRect(0, 0, menuCanvas.width, menuCanvas.height);
    menuPhase += 0.05;

    const activeFood = getSelectedFood();
    menuCtx.font = '24px sans-serif';
    menuCtx.textAlign = 'center';
    menuCtx.textBaseline = 'middle';
    menuCtx.fillText(activeFood.icon, 230, 42 + Math.sin(menuPhase * 0.8) * 4);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const headColor = isDark ? '#10b981' : '#059669';

    for (let i = menuSnake.length - 1; i >= 0; i--) {
      const segX = menuSnake[i].x + (menuPhase * 15) % 120;
      const segY = 40 + Math.sin(menuPhase + i * 0.5) * 12;

      menuCtx.save();
      menuCtx.fillStyle = i === 0 ? headColor : '#34d399';
      menuCtx.beginPath();
      menuCtx.arc(segX, segY, i === 0 ? 8 : 6, 0, Math.PI * 2);
      menuCtx.fill();
      menuCtx.restore();
    }
  }

  setInterval(renderMenuAnimation, 33);

  // =========================================================================
  // 7. NAVIGATION & UI SYNC
  // =========================================================================

  function navigateTo(screenId) {
    playSound('click');
    document.querySelectorAll('.screen').forEach(scr => scr.classList.remove('active'));
    closeAllOverlays();

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      appState.currentScreen = screenId;
    }

    if (screenId === 'screen-menu') {
      updateMenuStats();
      updateHeaderCurrencies();
    } else if (screenId === 'screen-mode-select') {
      document.getElementById('mode-classic-high').textContent = appState.classicHighScore;
      document.getElementById('mode-endless-high').textContent = appState.endlessHighScore;
    } else if (screenId === 'screen-maps') {
      updateMapsUI();
    } else if (screenId === 'screen-shop') {
      updateShopUI();
    } else if (screenId === 'screen-profile') {
      updateProfileUI();
    } else if (screenId === 'screen-customize') {
      renderFoodSelectionGrid();
    }
  }

  function showOverlay(overlayId) {
    const el = document.getElementById(overlayId);
    if (el) el.classList.add('active');
  }

  function closeAllOverlays() {
    document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
  }

  function showToast(msg) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function updateHeaderCurrencies() {
    const lvl = getLevelData();
    const topLvl = document.getElementById('top-level');
    const topCoins = document.getElementById('top-coins');
    const topGems = document.getElementById('top-gems');

    if (topLvl) topLvl.textContent = lvl.level;
    if (topCoins) topCoins.textContent = appState.coins;
    if (topGems) topGems.textContent = appState.gems;

    // Menu XP bar
    const menuLvl = document.getElementById('menu-level-num');
    const menuXP = document.getElementById('menu-xp-text');
    const menuFill = document.getElementById('menu-xp-fill');
    if (menuLvl) menuLvl.textContent = lvl.level;
    if (menuXP) menuXP.textContent = `${lvl.currentXP} / ${lvl.nextLevelXP} XP`;
    if (menuFill) menuFill.style.width = `${lvl.progressPercent}%`;

    // Map and food pills in menu
    const mapNames = { classic: 'Classic', desert: 'Desert', train: 'Train', space: 'Space' };
    const mapIcons = { classic: '🕹️', desert: '🏜️', train: '🚆', space: '🚀' };
    const mMapIcon = document.getElementById('menu-map-icon');
    const mMapName = document.getElementById('menu-map-name');
    if (mMapIcon) mMapIcon.textContent = mapIcons[appState.selectedMap] || '🕹️';
    if (mMapName) mMapName.textContent = mapNames[appState.selectedMap] || 'Classic';

    const food = getSelectedFood();
    const mFoodIcon = document.getElementById('menu-food-icon');
    const mFoodName = document.getElementById('menu-food-name');
    if (mFoodIcon) mFoodIcon.textContent = food.icon;
    if (mFoodName) mFoodName.textContent = food.name;
  }

  function updateHUD() {
    const lvl = getLevelData();
    document.getElementById('hud-mode-pill').textContent = game.mode;
    document.getElementById('hud-score').textContent = game.score;
    document.getElementById('hud-high-score').textContent = game.highScore;
    document.getElementById('hud-length').textContent = game.snake.length;

    const hudLvl = document.getElementById('hud-level-num');
    const hudXP = document.getElementById('hud-xp-text');
    const hudFill = document.getElementById('hud-xp-fill');
    if (hudLvl) hudLvl.textContent = lvl.level;
    if (hudXP) hudXP.textContent = `XP: ${lvl.currentXP} / ${lvl.nextLevelXP}`;
    if (hudFill) hudFill.style.width = `${lvl.progressPercent}%`;
  }

  function updateMenuStats() {
    const cl = document.getElementById('menu-classic-high');
    const ed = document.getElementById('menu-endless-high');
    if (cl) cl.textContent = appState.classicHighScore;
    if (ed) ed.textContent = appState.endlessHighScore;
  }

  function updatePowerupButtons() {
    const types = ['magnet', 'shield', 'freeze', 'cut'];
    types.forEach(t => {
      const countEl = document.getElementById(`count-${t}`);
      const btn = document.getElementById(`btn-use-${t}`);
      const qty = appState.powerups[t] || 0;
      if (countEl) countEl.textContent = qty;
      if (btn) btn.classList.toggle('disabled', qty <= 0);
    });
  }

  function updateMapsUI() {
    document.querySelectorAll('.map-card').forEach(card => {
      const mapKey = card.getAttribute('data-map');
      const isSelected = mapKey === appState.selectedMap;
      card.classList.toggle('selected', isSelected);
      const btn = card.querySelector('.btn-select-map');
      if (btn) btn.textContent = isSelected ? 'Active Map' : 'Select Map';
    });
  }

  function updateShopUI() {
    document.getElementById('shop-coins-val').textContent = appState.coins;
    document.getElementById('shop-gems-val').textContent = appState.gems;

    document.getElementById('inv-magnet').textContent = appState.powerups.magnet || 0;
    document.getElementById('inv-shield').textContent = appState.powerups.shield || 0;
    document.getElementById('inv-freeze').textContent = appState.powerups.freeze || 0;
    document.getElementById('inv-cut').textContent = appState.powerups.cut || 0;
  }

  function updateProfileUI() {
    const lvl = getLevelData();
    document.getElementById('profile-level-num').textContent = `LEVEL ${lvl.level}`;
    document.getElementById('profile-xp-counter').textContent = `${lvl.currentXP} / ${lvl.nextLevelXP} XP`;
    document.getElementById('profile-xp-fill').style.width = `${lvl.progressPercent}%`;

    document.getElementById('profile-stat-coins').textContent = appState.coins;
    document.getElementById('profile-stat-gems').textContent = appState.gems;
    document.getElementById('profile-stat-fruits').textContent = appState.totalFruitsEaten;
    document.getElementById('profile-stat-best').textContent = Math.max(appState.classicHighScore, appState.endlessHighScore);

    // Update skin selector
    document.querySelectorAll('.skin-card').forEach(card => {
      const skinKey = card.getAttribute('data-skin');
      const isSelected = skinKey === appState.selectedSkin;
      card.classList.toggle('selected', isSelected);
      const status = card.querySelector('.skin-status');
      if (status) status.textContent = isSelected ? '✓ Selected' : 'Select';
    });
  }

  function renderFoodSelectionGrid() {
    const grid = document.getElementById('food-grid');
    if (!grid) return;
    grid.innerHTML = '';

    FOODS.forEach(food => {
      const isSelected = food.id === appState.tempSelectedFoodId;
      const card = document.createElement('div');
      card.className = `food-card ${isSelected ? 'selected' : ''}`;
      card.innerHTML = `
        <span class="food-card-icon">${food.icon}</span>
        <span class="food-card-name">${food.name}</span>
        <span class="food-card-status">${isSelected ? '✓ Selected' : 'Select'}</span>
      `;
      card.addEventListener('click', () => {
        playSound('click');
        appState.tempSelectedFoodId = food.id;
        document.querySelectorAll('.food-card').forEach(c => {
          c.classList.remove('selected');
          const s = c.querySelector('.food-card-status');
          if (s) s.textContent = 'Select';
        });
        card.classList.add('selected');
        const st = card.querySelector('.food-card-status');
        if (st) st.textContent = '✓ Selected';

        document.getElementById('summary-food-icon').textContent = food.icon;
        document.getElementById('summary-food-name').textContent = food.name;
      });
      grid.appendChild(card);
    });
  }

  function applyTheme(theme) {
    appState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    saveState();
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';

    const darkBtn = document.getElementById('setting-theme-dark');
    const lightBtn = document.getElementById('setting-theme-light');
    if (darkBtn && lightBtn) {
      darkBtn.classList.toggle('active', theme === 'dark');
      lightBtn.classList.toggle('active', theme === 'light');
    }
  }

  // =========================================================================
  // 8. EVENT LISTENERS & SHOP TRANSACTIONS
  // =========================================================================

  function setupEventListeners() {
    // Header
    document.getElementById('header-logo').addEventListener('click', () => navigateTo('screen-menu'));
    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
      playSound('click');
      applyTheme(appState.theme === 'dark' ? 'light' : 'dark');
    });

    // Menu Buttons
    document.getElementById('btn-main-play').addEventListener('click', () => navigateTo('screen-mode-select'));
    document.getElementById('btn-main-maps').addEventListener('click', () => navigateTo('screen-maps'));
    document.getElementById('btn-main-shop').addEventListener('click', () => navigateTo('screen-shop'));
    document.getElementById('btn-main-profile').addEventListener('click', () => navigateTo('screen-profile'));
    document.getElementById('btn-main-customize').addEventListener('click', () => navigateTo('screen-customize'));
    document.getElementById('btn-main-settings').addEventListener('click', () => navigateTo('screen-settings'));

    document.getElementById('menu-map-pill').addEventListener('click', () => navigateTo('screen-maps'));
    document.getElementById('menu-food-pill').addEventListener('click', () => navigateTo('screen-customize'));
    document.getElementById('menu-xp-card').addEventListener('click', () => navigateTo('screen-profile'));

    // Mode Selection
    document.getElementById('btn-mode-back').addEventListener('click', () => navigateTo('screen-menu'));
    document.getElementById('btn-start-classic').addEventListener('click', () => {
      playSound('click');
      navigateTo('screen-game');
      resetGame(MODES.CLASSIC);
    });
    document.getElementById('btn-start-endless').addEventListener('click', () => {
      playSound('click');
      navigateTo('screen-game');
      resetGame(MODES.ENDLESS);
    });

    // Maps Selection (100% Free)
    document.getElementById('btn-maps-back').addEventListener('click', () => navigateTo('screen-menu'));
    document.querySelectorAll('.btn-select-map').forEach(btn => {
      btn.addEventListener('click', e => {
        playSound('click');
        const mapKey = e.currentTarget.getAttribute('data-map');
        appState.selectedMap = mapKey;
        // Automatically suggest matching skin
        appState.selectedSkin = mapKey;
        saveState();
        updateMapsUI();
        updateHeaderCurrencies();
        showToast(`Map switched to ${mapKey.toUpperCase()}! (100% Free)`);
      });
    });

    // Shop Transactions
    document.getElementById('btn-shop-back').addEventListener('click', () => navigateTo('screen-menu'));

    document.getElementById('btn-buy-magnet').addEventListener('click', () => {
      if (appState.coins >= 10) {
        appState.coins -= 10;
        appState.powerups.magnet = (appState.powerups.magnet || 0) + 1;
        saveState();
        playSound('coin');
        updateShopUI();
        updateHeaderCurrencies();
        showToast('Bought 🧲 Magnet! (-10 Coins)');
      } else {
        showToast('Not enough Coins! Eat 10 fruits to earn 10 coins.');
      }
    });

    document.getElementById('btn-buy-shield').addEventListener('click', () => {
      if (appState.coins >= 10) {
        appState.coins -= 10;
        appState.powerups.shield = (appState.powerups.shield || 0) + 1;
        saveState();
        playSound('coin');
        updateShopUI();
        updateHeaderCurrencies();
        showToast('Bought 🛡️ Shield! (-10 Coins)');
      } else {
        showToast('Not enough Coins! Eat 10 fruits to earn 10 coins.');
      }
    });

    document.getElementById('btn-buy-freeze').addEventListener('click', () => {
      if (appState.gems >= 10) {
        appState.gems -= 10;
        appState.powerups.freeze = (appState.powerups.freeze || 0) + 1;
        saveState();
        playSound('gem');
        updateShopUI();
        updateHeaderCurrencies();
        showToast('Bought ❄️ Freeze! (-10 Gems)');
      } else {
        showToast('Not enough Gems! Eat 20 fruits to earn 10 gems.');
      }
    });

    document.getElementById('btn-buy-cut').addEventListener('click', () => {
      if (appState.gems >= 10) {
        appState.gems -= 10;
        appState.powerups.cut = (appState.powerups.cut || 0) + 1;
        saveState();
        playSound('gem');
        updateShopUI();
        updateHeaderCurrencies();
        showToast('Bought ✂️ Cut! (-10 Gems)');
      } else {
        showToast('Not enough Gems! Eat 20 fruits to earn 10 gems.');
      }
    });

    // Profile & Skins
    document.getElementById('btn-profile-back').addEventListener('click', () => navigateTo('screen-menu'));
    document.querySelectorAll('.skin-card').forEach(card => {
      card.addEventListener('click', () => {
        playSound('click');
        const skinKey = card.getAttribute('data-skin');
        appState.selectedSkin = skinKey;
        saveState();
        updateProfileUI();
        showToast(`Skin updated to ${SKINS[skinKey].name}!`);
      });
    });

    // In-Game Powerup Hotbar Buttons
    document.getElementById('btn-use-magnet').addEventListener('click', () => activatePowerUp('magnet'));
    document.getElementById('btn-use-shield').addEventListener('click', () => activatePowerUp('shield'));
    document.getElementById('btn-use-freeze').addEventListener('click', () => activatePowerUp('freeze'));
    document.getElementById('btn-use-cut').addEventListener('click', () => activatePowerUp('cut'));

    // In-Game Controls
    document.getElementById('btn-game-pause').addEventListener('click', togglePause);
    document.getElementById('btn-game-quit').addEventListener('click', () => {
      playSound('click');
      triggerEndlessQuit('You concluded your endless journey.');
    });

    // Space Reaction Mobile Buttons
    document.querySelectorAll('.r-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = btn.getAttribute('data-dir');
        handleReactionInput(dir);
      });
    });

    // Level-up Modal Button
    document.getElementById('btn-levelup-continue').addEventListener('click', () => {
      playSound('click');
      closeAllOverlays();
      if (game.isRunning) game.lastTickTime = performance.now();
    });

    // Fruit Customization Save
    document.getElementById('btn-custom-back').addEventListener('click', () => navigateTo('screen-menu'));
    document.getElementById('btn-save-food').addEventListener('click', () => {
      playSound('click');
      appState.selectedFoodId = appState.tempSelectedFoodId;
      saveState();
      updateHeaderCurrencies();
      showToast(`Saved! Fruit changed to ${getSelectedFood().name}`);
    });

    // Settings
    document.getElementById('btn-settings-back').addEventListener('click', () => navigateTo('screen-menu'));
    document.getElementById('setting-theme-dark').addEventListener('click', () => { playSound('click'); applyTheme('dark'); });
    document.getElementById('setting-theme-light').addEventListener('click', () => { playSound('click'); applyTheme('light'); });

    const sToggle = document.getElementById('setting-sound-toggle');
    sToggle.checked = appState.soundEnabled;
    sToggle.addEventListener('change', e => {
      appState.soundEnabled = e.target.checked;
      saveState();
      if (appState.soundEnabled) playSound('click');
    });

    const vToggle = document.getElementById('setting-vibration-toggle');
    vToggle.checked = appState.vibrationEnabled;
    vToggle.addEventListener('change', e => {
      appState.vibrationEnabled = e.target.checked;
      saveState();
      triggerVibrate(30);
    });

    // Reset Data Modal
    document.getElementById('btn-reset-data').addEventListener('click', () => {
      playSound('click');
      showOverlay('modal-confirm-reset');
    });
    document.getElementById('btn-confirm-reset-cancel').addEventListener('click', () => {
      playSound('click');
      closeAllOverlays();
    });
    document.getElementById('btn-confirm-reset-ok').addEventListener('click', () => {
      playSound('click');
      localStorage.clear();
      appState.theme = 'dark';
      appState.soundEnabled = true;
      appState.vibrationEnabled = true;
      appState.selectedFoodId = 'apple';
      appState.tempSelectedFoodId = 'apple';
      appState.selectedMap = MAPS.CLASSIC;
      appState.selectedSkin = 'classic';
      appState.classicHighScore = 0;
      appState.endlessHighScore = 0;
      appState.totalFruitsEaten = 0;
      appState.coins = 0;
      appState.gems = 0;
      appState.powerups = { magnet: 1, shield: 1, freeze: 0, cut: 0 };

      applyTheme('dark');
      sToggle.checked = true;
      vToggle.checked = true;
      updateHeaderCurrencies();
      closeAllOverlays();
      showToast('All progress, currencies, levels, and settings have been reset!');
    });

    // Overlay Navigation
    document.getElementById('btn-pause-resume').addEventListener('click', togglePause);
    document.getElementById('btn-pause-menu').addEventListener('click', () => {
      game.isRunning = false;
      closeAllOverlays();
      navigateTo('screen-menu');
    });

    document.getElementById('btn-gameover-replay').addEventListener('click', () => {
      playSound('click');
      resetGame(MODES.CLASSIC);
    });
    document.getElementById('btn-gameover-menu').addEventListener('click', () => {
      closeAllOverlays();
      navigateTo('screen-menu');
    });

    document.getElementById('btn-endless-replay').addEventListener('click', () => {
      playSound('click');
      resetGame(MODES.ENDLESS);
    });
    document.getElementById('btn-endless-menu').addEventListener('click', () => {
      closeAllOverlays();
      navigateTo('screen-menu');
    });

    // Keyboard Controls & Number Hotkeys (1-4 for powerups)
    window.addEventListener('keydown', e => {
      // Space reaction input intercept
      if (game.timeStopActive) {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); handleReactionInput('UP'); }
        else if (e.code === 'ArrowDown' || e.code === 'KeyS') { e.preventDefault(); handleReactionInput('DOWN'); }
        else if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); handleReactionInput('LEFT'); }
        else if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); handleReactionInput('RIGHT'); }
        return;
      }

      if (appState.currentScreen === 'screen-game') {
        switch (e.code) {
          case 'ArrowUp':
          case 'KeyW':
            e.preventDefault();
            handleDirectionInput(DIRECTIONS.UP);
            break;
          case 'ArrowDown':
          case 'KeyS':
            e.preventDefault();
            handleDirectionInput(DIRECTIONS.DOWN);
            break;
          case 'ArrowLeft':
          case 'KeyA':
            e.preventDefault();
            handleDirectionInput(DIRECTIONS.LEFT);
            break;
          case 'ArrowRight':
          case 'KeyD':
            e.preventDefault();
            handleDirectionInput(DIRECTIONS.RIGHT);
            break;
          case 'Digit1':
            activatePowerUp('magnet');
            break;
          case 'Digit2':
            activatePowerUp('shield');
            break;
          case 'Digit3':
            activatePowerUp('freeze');
            break;
          case 'Digit4':
            activatePowerUp('cut');
            break;
          case 'KeyP':
          case 'Escape':
          case 'Space':
            e.preventDefault();
            togglePause();
            break;
        }
      }
    });

    // Virtual Mobile D-Pad
    const dpadMap = [
      { id: 'dpad-up', dir: DIRECTIONS.UP },
      { id: 'dpad-down', dir: DIRECTIONS.DOWN },
      { id: 'dpad-left', dir: DIRECTIONS.LEFT },
      { id: 'dpad-right', dir: DIRECTIONS.RIGHT }
    ];
    dpadMap.forEach(({ id, dir }) => {
      const btn = document.getElementById(id);
      if (btn) {
        const press = e => {
          e.preventDefault();
          btn.classList.add('pressed');
          handleDirectionInput(dir);
        };
        const release = () => btn.classList.remove('pressed');
        btn.addEventListener('pointerdown', press);
        btn.addEventListener('pointerup', release);
        btn.addEventListener('pointercancel', release);
      }
    });

    // Canvas Touch Swipes
    let touchX = 0, touchY = 0;
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length > 0) {
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

    canvas.addEventListener('touchend', e => {
      if (e.changedTouches.length > 0) {
        const dx = e.changedTouches[0].clientX - touchX;
        const dy = e.changedTouches[0].clientY - touchY;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (Math.abs(dx) > 25) handleDirectionInput(dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
        } else {
          if (Math.abs(dy) > 25) handleDirectionInput(dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
        }
      }
    }, { passive: true });

    // Audio Unlock
    const unlock = () => {
      getAudioContext();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  // =========================================================================
  // 9. INITIALIZATION
  // =========================================================================

  function init() {
    loadSavedState();
    applyTheme(appState.theme);
    setupCanvasDpi();
    updateHeaderCurrencies();
    updateMenuStats();
    setupEventListeners();

    requestAnimationFrame(gameLoop);
    renderGame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

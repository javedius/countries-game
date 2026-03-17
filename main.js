// Основные настраиваемые параметры игры.
const CONFIG = {
  // Общее количество секций кольца.
  totalSections: 36,
  // Сколько секций подряд отсутствуют и образуют выход.
  gapSectionCount: 4,
  // Задержка между появлениями стран на арене.
  itemSpawnMs: 100,
  // Скорость вращения кольца.
  ringRotationSpeed: 0.6,
  // Насколько сильно шары меняют направление при столкновении друг с другом.
  itemRepulsionForce: 1,
  // Насколько сильно борт меняет направление шара при ударе.
  wallRepulsionForce: 1000,
  // Постоянная скорость движения всех активных шаров.
  itemSpeed: 240,
  // ISO-код принудительного победителя. Пустая строка = честная игра.
  forcedWinnerIso: "",
  // Насколько сильно режим принудительной победы влияет на траектории.
  forcedWinnerBias: 28,
};

// Задержка перед стартом нового раунда после определения победителя.
const RESTART_DELAY_MS = 3000;
// Фиксированный шаг симуляции для стабильного апдейта.
const FIXED_DT = 1 / 60;
// Координаты центра арены на canvas.
const CENTER = { x: 360, y: 455 };
// Радиус игровой внутренней области круга.
const INNER_RADIUS = 246;
// Радиус одного шара-страны.
const ITEM_RADIUS = 23;
// Гравитация для выбывших шаров.
const GRAVITY = 880;
// Коэффициент упругости при столкновениях.
const RESTITUTION = 0.92;
// Дополнительное ускорение наружу при попадании в пустой сектор.
const GAP_ACCELERATION = 520;
// Высота, на которой оседают выбывшие шары.
const FALL_Y = 900;

// Список стран, которые участвуют в раунде.
const countries = [
  ["Afghanistan", "AF"], ["Albania", "AL"], ["Algeria", "DZ"], ["Andorra", "AD"], ["Angola", "AO"],
  ["Argentina", "AR"], ["Armenia", "AM"], ["Australia", "AU"], ["Austria", "AT"], ["Azerbaijan", "AZ"],
  ["Bahamas", "BS"], ["Bahrain", "BH"], ["Bangladesh", "BD"], ["Barbados", "BB"], ["Belarus", "BY"],
  ["Belgium", "BE"], ["Belize", "BZ"], ["Benin", "BJ"], ["Bhutan", "BT"], ["Bolivia", "BO"],
  ["Bosnia", "BA"], ["Botswana", "BW"], ["Brazil", "BR"], ["Brunei", "BN"], ["Bulgaria", "BG"],
  ["Burkina Faso", "BF"], ["Burundi", "BI"], ["Cambodia", "KH"], ["Cameroon", "CM"], ["Canada", "CA"],
  ["Cape Verde", "CV"], ["Chile", "CL"], ["China", "CN"], ["Colombia", "CO"], ["Comoros", "KM"],
  ["Congo", "CG"], ["Costa Rica", "CR"], ["Croatia", "HR"], ["Cuba", "CU"], ["Cyprus", "CY"],
  ["Czechia", "CZ"], ["Denmark", "DK"], ["Djibouti", "DJ"], ["Dominica", "DM"], ["Dominican Republic", "DO"],
  ["Ecuador", "EC"], ["Egypt", "EG"], ["El Salvador", "SV"], ["Estonia", "EE"], ["Eswatini", "SZ"],
  ["Ethiopia", "ET"], ["Fiji", "FJ"], ["Finland", "FI"], ["France", "FR"], ["Gabon", "GA"],
  ["Gambia", "GM"], ["Georgia", "GE"], ["Germany", "DE"], ["Ghana", "GH"], ["Greece", "GR"],
  ["Guatemala", "GT"], ["Guinea", "GN"], ["Guyana", "GY"], ["Haiti", "HT"], ["Honduras", "HN"],
  ["Hungary", "HU"], ["Iceland", "IS"], ["India", "IN"], ["Indonesia", "ID"], ["Iran", "IR"],
  ["Iraq", "IQ"], ["Ireland", "IE"], ["Israel", "IL"], ["Italy", "IT"], ["Jamaica", "JM"],
  ["Japan", "JP"], ["Jordan", "JO"], ["Kazakhstan", "KZ"], ["Kenya", "KE"], ["Kiribati", "KI"],
  ["Kuwait", "KW"], ["Kyrgyzstan", "KG"], ["Laos", "LA"], ["Latvia", "LV"], ["Lebanon", "LB"],
  ["Lesotho", "LS"], ["Liberia", "LR"], ["Libya", "LY"], ["Liechtenstein", "LI"], ["Lithuania", "LT"],
  ["Luxembourg", "LU"], ["Madagascar", "MG"], ["Malawi", "MW"], ["Malaysia", "MY"], ["Maldives", "MV"],
  ["Mali", "ML"], ["Malta", "MT"], ["Mexico", "MX"], ["Moldova", "MD"], ["Monaco", "MC"],
  ["Mongolia", "MN"], ["Montenegro", "ME"], ["Morocco", "MA"], ["Mozambique", "MZ"], ["Myanmar", "MM"],
  ["Namibia", "NA"], ["Nepal", "NP"], ["Netherlands", "NL"], ["New Zealand", "NZ"], ["Nicaragua", "NI"],
  ["Niger", "NE"], ["Nigeria", "NG"], ["North Korea", "KP"], ["North Macedonia", "MK"], ["Norway", "NO"],
  ["Oman", "OM"], ["Pakistan", "PK"], ["Panama", "PA"], ["Paraguay", "PY"], ["Peru", "PE"],
  ["Philippines", "PH"], ["Poland", "PL"], ["Portugal", "PT"], ["Qatar", "QA"], ["Romania", "RO"],
  ["Rwanda", "RW"], ["Saint Lucia", "LC"], ["Saudi Arabia", "SA"], ["Senegal", "SN"], ["Serbia", "RS"],
  ["Sierra Leone", "SL"], ["Singapore", "SG"], ["Slovakia", "SK"], ["Slovenia", "SI"], ["Somalia", "SO"],
  ["South Africa", "ZA"], ["South Korea", "KR"], ["Spain", "ES"], ["Sri Lanka", "LK"], ["Sudan", "SD"],
  ["Suriname", "SR"], ["Sweden", "SE"], ["Switzerland", "CH"], ["Syria", "SY"], ["Tajikistan", "TJ"],
  ["Tanzania", "TZ"], ["Thailand", "TH"], ["Togo", "TG"], ["Tonga", "TO"], ["Tunisia", "TN"],
  ["Turkey", "TR"], ["Turkmenistan", "TM"], ["Uganda", "UG"], ["Ukraine", "UA"], ["United Arab Emirates", "AE"],
  ["United Kingdom", "GB"], ["United States", "US"], ["Uruguay", "UY"], ["Uzbekistan", "UZ"], ["Vanuatu", "VU"],
  ["Venezuela", "VE"], ["Vietnam", "VN"], ["Yemen", "YE"], ["Zambia", "ZM"], ["Zimbabwe", "ZW"]
].slice(0, 116);

// Основной canvas для отрисовки игры.
const canvas = document.querySelector("#game");
// 2D-контекст для всей графики.
const ctx = canvas.getContext("2d");
// Контейнер таблицы лидеров в правом верхнем блоке.
const leaderboardEl = document.querySelector("#leaderboard");

// Общее количество побед по названиям стран между раундами.
const winners = new Map();
// Доступные системные голоса браузера.
let availableVoices = [];
// Разрешил ли пользователь воспроизведение речи первым действием.
let speechUnlocked = false;

// Возвращает новую перемешанную копию массива стран.
function shuffleCountries(list) {
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  if (CONFIG.forcedWinnerIso) {
    const forcedIndex = shuffled.findIndex((country) => country[1] === CONFIG.forcedWinnerIso.toUpperCase());
    if (forcedIndex > 0) {
      const [forcedCountry] = shuffled.splice(forcedIndex, 1);
      shuffled.unshift(forcedCountry);
    }
  }
  return shuffled;
}

function loadVoices() {
  if (!("speechSynthesis" in window)) return;
  availableVoices = window.speechSynthesis.getVoices();
}

function unlockSpeech() {
  if (!("speechSynthesis" in window) || speechUnlocked) return;
  speechUnlocked = true;
  loadVoices();

  const utterance = new SpeechSynthesisUtterance("");
  utterance.volume = 0;
  window.speechSynthesis.speak(utterance);
}

function getEnglishVoice() {
  if (!availableVoices.length) loadVoices();
  return (
    availableVoices.find((voice) => voice.lang === "en-US") ||
    availableVoices.find((voice) => voice.lang.startsWith("en-")) ||
    availableVoices.find((voice) => voice.lang.startsWith("en")) ||
    null
  );
}

// Текущее изменяемое состояние раунда.
const state = {
  // Общее прошедшее время симуляции.
  time: 0,
  // Текущий угол поворота кольца.
  rotation: 0,
  // Текущая скорость вращения кольца.
  rotationSpeed: CONFIG.ringRotationSpeed,
  // Индекс следующей страны для спавна.
  spawnIndex: 0,
  // Накопленный таймер спавна в миллисекундах.
  spawnTimer: 0,
  // Активные страны, которые ещё находятся внутри арены.
  items: [],
  // Случайный порядок стран для текущего раунда.
  spawnOrder: shuffleCountries(countries),
  // Страны, уже выбывшие в текущем раунде.
  eliminated: [],
  // Визуальные падающие шары после вылета.
  falling: [],
  // Победитель текущего раунда, если уже определён.
  winner: null,
  // Таймер до автоматического перезапуска раунда.
  winnerTimer: 0,
  // Уже была ли озвучка про последние 5 стран в текущем раунде.
  announcedFiveLeft: false,
  // Номер текущего раунда.
  round: 1,
  // Начальная секция пустого окна в кольце.
  gapStart: 0,
};

function isoToFlagEmoji(iso) {
  return iso
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function createItem(country, index) {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 70;
  const launchAngle = Math.random() * Math.PI * 2;
  return {
    id: `${country[1]}-${index}-${Math.random().toString(16).slice(2, 6)}`,
    name: country[0],
    iso: country[1],
    flag: isoToFlagEmoji(country[1]),
    x: CENTER.x + Math.cos(angle) * radius,
    y: CENTER.y + Math.sin(angle) * radius,
    vx: Math.cos(launchAngle) * CONFIG.itemSpeed,
    vy: Math.sin(launchAngle) * CONFIG.itemSpeed,
    radius: ITEM_RADIUS,
    escaping: false,
    eliminated: false,
  };
}

function isForcedWinner(item) {
  return Boolean(CONFIG.forcedWinnerIso) && item.iso === CONFIG.forcedWinnerIso.toUpperCase();
}

function applyForcedWinnerBias(item, dt) {
  if (!CONFIG.forcedWinnerIso) return;
  const dx = item.x - CENTER.x;
  const dy = item.y - CENTER.y;
  const distance = Math.hypot(dx, dy) || 0.0001;
  const direction = isForcedWinner(item) ? -1 : 1;
  const force = CONFIG.forcedWinnerBias * dt * direction;
  item.vx += (dx / distance) * force;
  item.vy += (dy / distance) * force;
}

function resetRound() {
  state.spawnIndex = 0;
  state.spawnTimer = 0;
  state.items = [];
  state.spawnOrder = shuffleCountries(countries);
  state.eliminated = [];
  state.falling = [];
  state.winner = null;
  state.winnerTimer = 0;
  state.announcedFiveLeft = false;
  state.gapStart = Math.floor(Math.random() * CONFIG.totalSections);
  state.rotationSpeed = CONFIG.ringRotationSpeed;
}

function startNewRound() {
  state.round += 1;
  resetRound();
}

function inGap(angle) {
  const normalized = ((angle - state.rotation) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  const section = Math.floor((normalized / (Math.PI * 2)) * CONFIG.totalSections);
  for (let offset = 0; offset < CONFIG.gapSectionCount; offset += 1) {
    if (section === (state.gapStart + offset) % CONFIG.totalSections) return true;
  }
  return false;
}

function spawnNextItem() {
  if (state.spawnIndex >= state.spawnOrder.length) return;
  state.items.push(createItem(state.spawnOrder[state.spawnIndex], state.spawnIndex));
  state.spawnIndex += 1;
}

function keepItemSpeed(item, angle = Math.random() * Math.PI * 2) {
  const speed = Math.hypot(item.vx, item.vy);
  if (speed === 0) {
    item.vx = Math.cos(angle) * CONFIG.itemSpeed;
    item.vy = Math.sin(angle) * CONFIG.itemSpeed;
    return;
  }
  const scale = CONFIG.itemSpeed / speed;
  item.vx *= scale;
  item.vy *= scale;
}

function resolveItemCollisions() {
  for (let i = 0; i < state.items.length; i += 1) {
    const a = state.items[i];
    for (let j = i + 1; j < state.items.length; j += 1) {
      const b = state.items[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const minDist = a.radius + b.radius;
      if (dist === 0 || dist >= minDist) continue;
      const nx = dx / dist;
      const ny = dy / dist;
      const overlap = minDist - dist;
      a.x -= nx * overlap * 0.5;
      a.y -= ny * overlap * 0.5;
      b.x += nx * overlap * 0.5;
      b.y += ny * overlap * 0.5;

      const relVx = b.vx - a.vx;
      const relVy = b.vy - a.vy;
      const separating = relVx * nx + relVy * ny;
      if (separating > 0) continue;
      const impulse = -(1 + RESTITUTION) * separating * 0.5 * CONFIG.itemRepulsionForce;
      a.vx -= impulse * nx;
      a.vy -= impulse * ny;
      b.vx += impulse * nx;
      b.vy += impulse * ny;
      keepItemSpeed(a);
      keepItemSpeed(b);
    }
  }
}

function ejectItem(item) {
  item.eliminated = true;
  const exitAngle = Math.atan2(item.y - CENTER.y, item.x - CENTER.x);
  state.items = state.items.filter((candidate) => candidate.id !== item.id);
  state.eliminated.push(item);
  state.falling.push({
    ...item,
    x: 70 + (state.eliminated.length % 9) * 68 + (Math.random() - 0.5) * 8,
    y: -40 - Math.random() * 140,
    vx: (Math.random() - 0.5) * 60,
    vy: 0,
    angle: exitAngle,
    spin: (Math.random() - 0.5) * 4,
    settled: false,
  });
}

function updateArenaCollision(item, dt) {
  const dx = item.x - CENTER.x;
  const dy = item.y - CENTER.y;
  const distance = Math.hypot(dx, dy) || 0.0001;
  const angle = Math.atan2(dy, dx);
  const ringLimit = INNER_RADIUS - item.radius;

  if (item.escaping) {
    item.vx = (dx / distance) * CONFIG.itemSpeed;
    item.vy = (dy / distance) * CONFIG.itemSpeed;
    if (distance > INNER_RADIUS + item.radius * 2.5) {
      ejectItem(item);
    }
    return;
  }

  if (distance < ringLimit) return;

  if (inGap(angle)) {
    if (isForcedWinner(item)) {
      item.x = CENTER.x + (dx / distance) * ringLimit;
      item.y = CENTER.y + (dy / distance) * ringLimit;
      item.vx = (-dx / distance) * CONFIG.itemSpeed;
      item.vy = (-dy / distance) * CONFIG.itemSpeed;
      return;
    }
    item.escaping = true;
    item.vx = (dx / distance) * CONFIG.itemSpeed;
    item.vy = (dy / distance) * CONFIG.itemSpeed;
    if (distance > INNER_RADIUS + item.radius * 2.5) {
      ejectItem(item);
    }
    return;
  }

  const nx = dx / distance;
  const ny = dy / distance;
  item.x = CENTER.x + nx * ringLimit;
  item.y = CENTER.y + ny * ringLimit;
  const outward = item.vx * nx + item.vy * ny;
  if (outward > 0) {
    item.vx -= (1 + RESTITUTION) * outward * nx;
    item.vy -= (1 + RESTITUTION) * outward * ny;
  }

  const tangentSpeed = state.rotationSpeed * INNER_RADIUS * 0.45;
  item.vx += (-ny * tangentSpeed + -nx * CONFIG.wallRepulsionForce * dt) * 0.024;
  item.vy += (nx * tangentSpeed + -ny * CONFIG.wallRepulsionForce * dt) * 0.024;
  keepItemSpeed(item);
}

function updateFalling(dt) {
  for (const item of state.falling) {
    if (item.settled) continue;
    item.vy += GRAVITY * dt;
    item.x += item.vx * dt;
    item.y += item.vy * dt;
    item.angle += item.spin * dt;
    if (item.y >= FALL_Y) {
      item.y = FALL_Y;
      item.vy *= -0.18;
      item.vx *= 0.84;
      if (Math.abs(item.vy) < 22) {
        item.vy = 0;
        item.spin *= 0.4;
        item.settled = true;
      }
    }
  }
}

function speakText(text) {
  if (!("speechSynthesis" in window) || !speechUnlocked) return;
  loadVoices();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  const voice = getEnglishVoice();
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

function announceFiveCountriesLeft() {
  speakText("5 countries left");
}

function announceWinner(name) {
  speakText(`${name} is the winner`);
}

function determineWinner() {
  if (state.winner || state.items.length !== 1 || state.spawnIndex < state.spawnOrder.length) return;
  state.winner = state.items[0];
  winners.set(state.winner.name, (winners.get(state.winner.name) || 0) + 1);
  state.winnerTimer = RESTART_DELAY_MS;
  announceWinner(state.winner.name);
  renderLeaderboard();
}

function update(dt) {
  state.time += dt;
  state.rotation += state.rotationSpeed * dt;

  if (!state.winner && state.spawnIndex < state.spawnOrder.length) {
    state.spawnTimer += dt * 1000;
    if (state.spawnTimer >= CONFIG.itemSpawnMs) {
      state.spawnTimer -= CONFIG.itemSpawnMs;
      spawnNextItem();
    }
  }

  for (const item of [...state.items]) {
    applyForcedWinnerBias(item, dt);
    keepItemSpeed(item);
    item.x += item.vx * dt;
    item.y += item.vy * dt;
    updateArenaCollision(item, dt);
    keepItemSpeed(item);
  }

  resolveItemCollisions();
  updateFalling(dt);
  if (
    !state.announcedFiveLeft &&
    state.spawnIndex >= state.spawnOrder.length &&
    state.items.length === 5
  ) {
    state.announcedFiveLeft = true;
    announceFiveCountriesLeft();
  }
  determineWinner();

  if (state.winner) {
    state.winnerTimer -= dt * 1000;
    if (state.winnerTimer <= 0) {
      startNewRound();
    }
  }
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.globalAlpha = 0.16;
  for (let i = 0; i < 40; i += 1) {
    ctx.fillStyle = i % 2 ? "#4defff" : "#ffffff";
    ctx.beginPath();
    ctx.arc((i * 137) % canvas.width, (i * 71) % canvas.height, (i % 3) + 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawRing() {
  const sectionArc = (Math.PI * 2) / CONFIG.totalSections;
  ctx.save();
  ctx.translate(CENTER.x, CENTER.y);
  ctx.rotate(state.rotation);
  ctx.lineWidth = 10;
  ctx.lineCap = "round";

  for (let section = 0; section < CONFIG.totalSections; section += 1) {
    let hidden = false;
    for (let offset = 0; offset < CONFIG.gapSectionCount; offset += 1) {
      if (section === (state.gapStart + offset) % CONFIG.totalSections) {
        hidden = true;
        break;
      }
    }
    if (hidden) continue;
    ctx.strokeStyle = section % 2 === 0 ? "#49ecff" : "#15b8ff";
    const start = section * sectionArc + 0.04;
    const end = start + sectionArc - 0.12;
    ctx.beginPath();
    ctx.arc(0, 0, INNER_RADIUS + 8, start, end);
    ctx.stroke();
  }
  ctx.restore();
}

function drawItem(item) {
  ctx.save();
  ctx.translate(item.x, item.y);

  ctx.beginPath();
  ctx.fillStyle = "#fbfdff";
  ctx.shadowColor = "rgba(73,236,255,0.55)";
  ctx.shadowBlur = 18;
  ctx.arc(0, 0, item.radius + 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = "#0d1d37";
  ctx.fillRect(-item.radius, -item.radius, item.radius * 2, item.radius * 2);

  ctx.font = `${Math.round(item.radius * 1.8)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(item.flag, 0, item.radius * 0.02);

  ctx.restore();

  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.beginPath();
  ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();
}

function drawLabels() {
  ctx.fillStyle = "#dffcff";
  ctx.font = '700 32px "Avenir Next Condensed", "Arial Narrow", sans-serif';
  ctx.fillText(`ROUND ${state.round}`, 36, 58);

  // ctx.fillStyle = "#7fd2e7";
  // ctx.font = '700 20px "Avenir Next Condensed", "Arial Narrow", sans-serif';
  // ctx.fillText(`Countries in arena: ${state.items.length}`, 36, 92);
  // ctx.fillText(`Spawned: ${state.spawnIndex}/${countries.length}`, 36, 118);
  // ctx.fillText(`Missing sectors: ${CONFIG.gapSectionCount}/${CONFIG.totalSections}`, 36, 144);
}

function drawWinnerCard() {
  if (!state.winner) return;
  const width = 440;
  const height = 290;
  const x = (canvas.width - width) / 2;
  const y = 220;

  ctx.save();
  ctx.fillStyle = "rgba(4, 15, 34, 0.94)";
  ctx.strokeStyle = "#49ecff";
  ctx.lineWidth = 4;
  roundRect(ctx, x, y, width, height, 30);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f5fdff";
  ctx.textAlign = "center";
  ctx.font = '800 38px "Avenir Next Condensed", "Arial Narrow", sans-serif';
  ctx.fillText("CHAMPION", canvas.width / 2, y + 54);

  ctx.font = "88px sans-serif";
  ctx.fillText(state.winner.flag, canvas.width / 2, y + 144);

  ctx.font = '700 34px "Avenir Next Condensed", "Arial Narrow", sans-serif';
  ctx.fillText(state.winner.name, canvas.width / 2, y + 210);

  ctx.fillStyle = "#ffcc38";
  ctx.font = '700 26px "Avenir Next Condensed", "Arial Narrow", sans-serif';
  ctx.fillText(`Restart in ${Math.ceil(state.winnerTimer / 1000)}s`, canvas.width / 2, y + 248);
  ctx.restore();
}

function drawFallingItems() {
  for (const item of state.falling) {
    drawItem(item);
  }
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
    return;
  }
  canvas.requestFullscreen?.();
}

function render() {
  drawBackground();
  drawRing();
  for (const item of state.items) drawItem(item);
  drawFallingItems();
  // drawLabels();
  drawWinnerCard();
}

function renderLeaderboard() {
  const sorted = [...winners.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  leaderboardEl.innerHTML = "";
  sorted.forEach(([name, count], index) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${index + 1}</span><span>${name}</span><span>${count}W</span>`;
    leaderboardEl.appendChild(li);
  });
  while (leaderboardEl.children.length < 3) {
    const li = document.createElement("li");
    li.innerHTML = `<span>${leaderboardEl.children.length + 1}</span><span>---</span><span>0W</span>`;
    leaderboardEl.appendChild(li);
  }
}

function frame() {
  update(FIXED_DT);
  render();
  requestAnimationFrame(frame);
}

function renderGameToText() {
  return JSON.stringify({
    coordinates: "origin top-left, +x right, +y down",
    round: state.round,
    phase: state.winner ? "winner" : state.spawnIndex < countries.length ? "spawning" : "battle",
    rotation: Number(state.rotation.toFixed(2)),
    gapSections: [state.gapStart, state.gapStart + CONFIG.gapSectionCount - 1],
    activeCount: state.items.length,
    spawnedCount: state.spawnIndex,
    config: {
      itemSpawnMs: CONFIG.itemSpawnMs,
      ringRotationSpeed: CONFIG.ringRotationSpeed,
      itemRepulsionForce: CONFIG.itemRepulsionForce,
      wallRepulsionForce: CONFIG.wallRepulsionForce,
      itemSpeed: CONFIG.itemSpeed,
      forcedWinnerIso: CONFIG.forcedWinnerIso,
    },
    leader: state.winner ? state.winner.name : state.items[0]?.name ?? null,
    winner: state.winner?.name ?? null,
    restartInMs: Math.max(0, Math.ceil(state.winnerTimer)),
    activeItems: state.items.slice(0, 8).map((item) => ({
      name: item.name,
      x: Math.round(item.x),
      y: Math.round(item.y),
      vx: Math.round(item.vx),
      vy: Math.round(item.vy),
    })),
    eliminatedCount: state.eliminated.length,
  });
}

window.render_game_to_text = renderGameToText;
window.advanceTime = (ms) => {
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  for (let i = 0; i < steps; i += 1) update(FIXED_DT);
  render();
};

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "f") {
    toggleFullscreen();
  }
});

window.addEventListener("pointerdown", unlockSpeech, { once: true });
window.addEventListener("touchstart", unlockSpeech, { once: true });
window.addEventListener("click", unlockSpeech, { once: true });

if ("speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
}

renderLeaderboard();
resetRound();
spawnNextItem();
render();
requestAnimationFrame(frame);

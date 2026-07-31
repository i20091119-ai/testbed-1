/* ═══════════════════════════════════════════════════════════════
   경남수학문화관 「저울 수학」  — 게임 엔진
   지렛대(모멘트) 원리로 저울의 수평을 맞추는 체험 학습 게임

   모멘트 = 무게 × 거리(눈금)
   왼쪽 모멘트 합 == 오른쪽 모멘트 합  →  수평 (정답)
   ═══════════════════════════════════════════════════════════════ */
(function () {
'use strict';

/* ───────────────────────────────────────────────────────────────
   ① 그림 교체 지점 — 준비하신 그림으로 아래 경로만 바꾸면 됩니다.
   ─────────────────────────────────────────────────────────────── */
const ASSETS = {
  logo:   'assets/logo.svg',     // 수학문화관 로고 (가로로 긴 형태 권장)
  weight: 'assets/weight.svg',   // 무게추 기본 그림 (정사각형 권장)

  // 무게마다 다른 그림을 쓰고 싶을 때만 채우세요. 예) { 1:'assets/w1.png', 2:'assets/w2.png' }
  weightByValue: {},

  // true 면 기본 그림 한 장의 색조를 무게마다 바꿔 알록달록하게 보여 줍니다.
  // 직접 그린 그림을 쓸 때는 false 로 두세요.
  tintByValue: true,
};

/* ───────────────────────────────────────────────────────────────
   ② 게임 규칙 기본값
   ─────────────────────────────────────────────────────────────── */
const RULES = {
  maxDist: 5,                                        // 눈금 칸 수 (문제 데이터와 맞춰야 함)
  maxStack: 3,                                       // 한 칸에 올릴 수 있는 추 개수
  timeByTier: { 1: 45, 2: 50, 3: 60, 4: 75, 5: 90 }, // 단계별 제한 시간(초)
  scoreBase: 100,
  scorePerTier: 20,
  scorePerSecond: 2,
  scoreStreak: 10,
  hintPenalty: 30,
  maxTilt: 11,                                       // 저울이 기울 수 있는 최대 각도
  freeWeights: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],      // 자유 탐구 모드 추 목록
};

const DEFAULT_CFG = {
  total: 10,        // 한 판 문제 수
  timer: 1,         // 제한 시간 사용
  timescale: 1,     // 시간 여유 배율
  fixedTier: 0,     // 0 = 자동
  sound: 1,
  readout: 0,       // 모멘트 계산 값 표시
};

/* ── 작은 도구들 ────────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);
const el = (cls, tag) => { const n = document.createElement(tag || 'div'); if (cls) n.className = cls; return n; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (n) => Math.floor(Math.random() * n);
const pickOne = (arr) => arr[rand(arr.length)];
const CIRCLED = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];

const store = {
  get(k, d) { try { const v = localStorage.getItem('gnmc-balance-' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('gnmc-balance-' + k, JSON.stringify(v)); } catch (e) {} },
};

let cfg = Object.assign({}, DEFAULT_CFG, store.get('cfg', {}));

/* ── 효과음 (음원 파일 없이 합성) ───────────────────────────── */
let actx = null;
function audio() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
function tone(freq, dur, type, vol, delay) {
  const a = audio(); if (!a) return;
  const t0 = a.currentTime + (delay || 0);
  const o = a.createOscillator(), g = a.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol == null ? 0.16 : vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(a.destination);
  o.start(t0); o.stop(t0 + dur + 0.03);
}
const SFX = {
  pick:    () => tone(660, 0.08, 'sine', 0.10),
  drop:    () => { tone(392, 0.10, 'triangle', 0.14); tone(196, 0.16, 'sine', 0.10, 0.02); },
  back:    () => tone(300, 0.10, 'sine', 0.09),
  correct: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.30, 'triangle', 0.16, i * 0.09)),
  wrong:   () => { tone(220, 0.26, 'sawtooth', 0.09); tone(165, 0.32, 'sine', 0.10, 0.10); },
  tick:    () => tone(880, 0.05, 'square', 0.05),
  fanfare: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.5, 'triangle', 0.15, i * 0.13)),
};
function sfx(name) { if (cfg.sound) try { SFX[name](); } catch (e) {} }

/* ───────────────────────────────────────────────────────────────
   ③ 상태
   ─────────────────────────────────────────────────────────────── */
const state = {
  mode: 'quiz',       // 'quiz' | 'free'
  problem: null,
  items: [],          // 저울에 올라간 추 {uid,w,d,side,fixed,trayUid}
  tray: [],           // 보관함 [{uid,w,used}]
  qIndex: 0,
  total: 10,
  score: 0,
  streak: 0,
  correct: 0,
  bestTier: 1,
  wrongRun: 0,
  usedIds: [],
  results: [],
  hintLevel: 0,
  timeLeft: 0,
  timeMax: 0,
  timerId: null,
  lastTick: 0,
  locked: false,
};
let uidSeq = 0;

/* ───────────────────────────────────────────────────────────────
   ④ 추(디스크) 만들기
   ─────────────────────────────────────────────────────────────── */
function hueFor(w) { return ((w - 1) * 37) % 360; }

function makeDisc(w, opts) {
  opts = opts || {};
  const d = el('disc' + (opts.fixed ? ' fixed' : '') + (opts.placed ? ' placed' : ''));
  const src = ASSETS.weightByValue[w] || ASSETS.weight;
  const img = new Image();
  img.alt = '';
  img.decoding = 'async';
  // 그림 파일을 못 찾으면 CSS 로 그린 기본 모양으로 대체
  img.onerror = function () { img.remove(); d.insertBefore(el('fallback'), d.firstChild); };
  if (ASSETS.tintByValue && !ASSETS.weightByValue[w]) img.style.filter = 'hue-rotate(' + hueFor(w) + 'deg) saturate(1.06)';
  img.src = src;
  d.appendChild(img);
  const n = el('num', 'span'); n.textContent = w; d.appendChild(n);
  d.dataset.w = w;
  return d;
}

/* ───────────────────────────────────────────────────────────────
   ⑤ 저울 만들기 / 그리기
   ─────────────────────────────────────────────────────────────── */
const slotEls = {};   // 'left:3' → element

function buildScale() {
  const beam = $('beam');
  beam.querySelectorAll('.slot').forEach((n) => n.remove());
  for (const side of ['left', 'right']) {
    for (let d = 1; d <= RULES.maxDist; d++) {
      const s = el('slot');
      s.dataset.side = side; s.dataset.d = String(d);
      s.style.setProperty('--sx', (side === 'left' ? -1 : 1) * d * 9 + '%');
      s.appendChild(el('slot-glow'));
      s.appendChild(el('slot-mark'));
      const num = el('slot-num'); num.textContent = d; s.appendChild(num);
      s.appendChild(el('stack'));
      beam.appendChild(s);
      slotEls[side + ':' + d] = s;
    }
  }
}

function itemsAt(side, d) { return state.items.filter((i) => i.side === side && i.d === d); }
function momentOf(side) { return state.items.filter((i) => i.side === side).reduce((s, i) => s + i.w * i.d, 0); }

/** 이 칸에 추를 놓을 수 있는가? */
function slotAllowed(side, d) {
  if (state.mode === 'free') return true;
  const p = state.problem; if (!p) return false;
  if (side !== 'right') return false;                 // 문제 모드에서는 오른팔에만 놓는다
  if (!p.showDist && d !== 1) return false;           // 1~2단계는 ①번 칸만
  return true;
}

function renderBoard() {
  for (const key in slotEls) {
    const s = slotEls[key];
    const [side, dStr] = key.split(':');
    const d = +dStr;
    const stack = s.querySelector('.stack');
    stack.innerHTML = '';
    const list = itemsAt(side, d).slice().sort((a, b) => (b.fixed ? 1 : 0) - (a.fixed ? 1 : 0));
    for (const it of list) {
      const disc = makeDisc(it.w, { fixed: it.fixed, placed: true });
      disc.dataset.uid = it.uid;
      if (it.justAdded) { disc.classList.add('appear'); it.justAdded = false; }
      if (!it.fixed && !state.locked) disc.addEventListener('pointerdown', onGrab);
      stack.appendChild(disc);
    }
    s.classList.toggle('disabled', !slotAllowed(side, d));
  }
  updateBeam();
  updateEquation();
  updateReadout();
}

function renderTray() {
  const tray = $('tray');
  tray.innerHTML = '';
  for (const t of state.tray) {
    const disc = makeDisc(t.w, {});
    disc.dataset.trayUid = t.uid;
    if (t.used) disc.classList.add('used');
    else if (!state.locked) disc.addEventListener('pointerdown', onGrab);
    tray.appendChild(disc);
  }
}

function updateBeam() {
  const L = momentOf('left'), R = momentOf('right');
  const tilt = RULES.maxTilt * Math.tanh((R - L) / 14);
  document.documentElement.style.setProperty('--tilt', tilt.toFixed(2) + 'deg');
  const balanced = L === R && state.items.length > 0;
  $('scale').classList.toggle('balanced', balanced);
}

function updateReadout() {
  const box = $('moment-readout');
  const show = !!cfg.readout || state.hintLevel >= 2 || state.mode === 'free';
  box.hidden = !show;
  if (!show) return;
  const L = momentOf('left'), R = momentOf('right');
  $('mr-left').textContent = L;
  $('mr-right').textContent = R;
  const eq = $('mr-eq');
  eq.textContent = L === R ? '=' : (L > R ? '>' : '<');
  eq.classList.toggle('ok', L === R);
}

/* ── 수식 그리기 ───────────────────────────────────────────── */
function blankValue() {
  const p = state.problem; if (!p) return null;
  const list = itemsAt(p.blank.side, p.blank.d).filter((i) => !i.fixed);
  if (!list.length) return null;
  return list.reduce((s, i) => s + i.w, 0);
}

function eqSpan(text, cls) { const s = el(cls, 'span'); s.textContent = text; return s; }

function renderEquation() {
  const box = $('equation');
  box.innerHTML = '';
  const p = state.problem;

  if (state.mode === 'free') {
    const side = (name) => {
      const list = state.items.filter((i) => i.side === name).sort((a, b) => a.d - b.d);
      return list.length ? list.map((i) => [i.w, i.d]) : [[0, 1]];
    };
    drawTerms(box, side('left'), true);
    box.appendChild(eqSpan(momentOf('left') === momentOf('right') ? '=' : '≠', 'eq-eq'));
    drawTerms(box, side('right'), true);
    return;
  }
  if (!p) return;
  drawTerms(box, p.eq.left, p.showDist);
  box.appendChild(eqSpan('=', 'eq-eq'));
  drawTerms(box, p.eq.right, p.showDist);
}

function drawTerms(box, terms, showDist) {
  terms.forEach((t, idx) => {
    if (idx) box.appendChild(eqSpan('+', 'eq-op'));
    if (t[0] === '□') {
      const v = blankValue();
      const b = el('eq-blank' + (v !== null ? ' filled' : ''), 'span');
      b.textContent = v !== null ? v : '?';
      box.appendChild(b);
    } else {
      box.appendChild(eqSpan(String(t[0]), 'eq-num'));
    }
    if (showDist) {
      box.appendChild(eqSpan('×', 'eq-op'));
      box.appendChild(eqSpan(String(t[1]), 'eq-dist'));
    }
  });
}

let lastBlank = null;
function updateEquation() {
  const v = state.mode === 'free' ? null : blankValue();
  renderEquation();
  if (state.mode !== 'free' && v !== lastBlank) lastBlank = v;
}

/* ───────────────────────────────────────────────────────────────
   ⑥ 드래그 (마우스 · 손가락 공통 — Pointer Events)
   ─────────────────────────────────────────────────────────────── */
let drag = null;

function onGrab(e) {
  if (state.locked) return;
  if (e.button != null && e.button !== 0) return;
  e.preventDefault();
  audio();                                   // 첫 터치에 소리 활성화

  const node = e.currentTarget;
  const w = +node.dataset.w;
  let trayUid = node.dataset.trayUid != null ? +node.dataset.trayUid : null;
  const fromBoard = node.dataset.uid != null;

  if (fromBoard) {
    // 저울 위의 추를 집었다 → 일단 내려놓고 손에 든 상태로
    const uid = +node.dataset.uid;
    const it = state.items.find((i) => i.uid === uid);
    if (!it || it.fixed) return;
    trayUid = it.trayUid;
    state.items = state.items.filter((i) => i.uid !== uid);
    renderBoard();
  } else {
    // 보관함에서 집었다
    const t = state.tray.find((x) => x.uid === trayUid);
    if (!t || t.used) return;
    if (state.mode !== 'free') { t.used = true; renderTray(); }
  }

  const ghost = makeDisc(w, {});
  ghost.classList.add('ghost');
  $('drag-layer').appendChild(ghost);

  drag = { w: w, trayUid: trayUid, ghost: ghost, startX: e.clientX, startY: e.clientY,
           hot: null, pid: e.pointerId, fromBoard: fromBoard, moved: false };
  moveGhost(e.clientX, e.clientY);
  sfx('pick');

  window.addEventListener('pointermove', onMove, { passive: false });
  window.addEventListener('pointerup', onDrop);
  window.addEventListener('pointercancel', onDrop);
}

function moveGhost(x, y) { drag.ghost.style.left = x + 'px'; drag.ghost.style.top = y + 'px'; }

function onMove(e) {
  if (!drag) return;
  e.preventDefault();
  moveGhost(e.clientX, e.clientY);
  if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 10) drag.moved = true;
  const hot = nearestSlot(e.clientX, e.clientY);
  if (hot !== drag.hot) {
    if (drag.hot) drag.hot.classList.remove('hot');
    if (hot) hot.classList.add('hot');
    drag.hot = hot;
  }
  const overTray = pointInRect(e.clientX, e.clientY, $('tray').getBoundingClientRect(), 24);
  $('tray').classList.toggle('drop-hot', !!overTray && !hot);
}

function pointInRect(x, y, r, pad) {
  pad = pad || 0;
  return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
}

/** 손가락 위치에서 가장 가까운(놓을 수 있는) 눈금 찾기 */
function nearestSlot(x, y) {
  const disc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--disc')) || 60;
  let best = null, bestD = Infinity;
  for (const key in slotEls) {
    const s = slotEls[key];
    const side = s.dataset.side, d = +s.dataset.d;
    if (!slotAllowed(side, d)) continue;
    if (itemsAt(side, d).length >= RULES.maxStack) continue;
    const r = s.querySelector('.slot-mark').getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2 + disc * 0.6;     // 추는 눈금 아래에 매달린다
    const dist = Math.hypot(x - cx, (y - cy) * 0.55); // 위아래로는 조금 더 너그럽게
    if (dist < bestD) { bestD = dist; best = s; }
  }
  return bestD < disc * 1.75 ? best : null;
}

function onDrop(e) {
  if (!drag) return;
  window.removeEventListener('pointermove', onMove);
  window.removeEventListener('pointerup', onDrop);
  window.removeEventListener('pointercancel', onDrop);

  const hot = drag.hot;
  if (hot) hot.classList.remove('hot');
  $('tray').classList.remove('drop-hot');
  drag.ghost.remove();

  const d = drag; drag = null;

  // 저울 위의 추를 끌지 않고 톡 누르기만 하면 보관함으로 돌려보낸다
  const tapToReturn = d.fromBoard && !d.moved;

  if (hot && !tapToReturn && e.type !== 'pointercancel') {
    state.items.push({
      uid: ++uidSeq, w: d.w, d: +hot.dataset.d, side: hot.dataset.side,
      fixed: false, trayUid: d.trayUid, justAdded: true,
    });
    sfx('drop');
  } else {
    // 놓을 곳이 없으면 보관함으로 되돌린다 (톡 누르기 = 되돌리기)
    if (state.mode !== 'free' && d.trayUid != null) {
      const t = state.tray.find((x) => x.uid === d.trayUid);
      if (t) t.used = false;
    }
    sfx('back');
  }
  renderTray();
  renderBoard();
  afterChange();
}

/* ───────────────────────────────────────────────────────────────
   ⑦ 문제 진행
   ─────────────────────────────────────────────────────────────── */
function pickTier(index) {
  if (cfg.fixedTier) return cfg.fixedTier;
  let base = Math.floor(index * 5 / Math.max(1, state.total)) + 1;
  if (state.streak >= 5) base += 2; else if (state.streak >= 3) base += 1;
  if (state.wrongRun >= 2) base -= 1;
  return clamp(base, 1, 5);
}

function pickProblem(tier) {
  const bank = window.PROBLEMS || [];
  let pool = bank.filter((p) => p.tier === tier && state.usedIds.indexOf(p.id) < 0);
  if (!pool.length) pool = bank.filter((p) => p.tier === tier);
  if (!pool.length) pool = bank;
  const p = pickOne(pool);
  state.usedIds.push(p.id);
  return p;
}

function loadProblem(p) {
  state.problem = p;
  state.hintLevel = 0;
  state.locked = false;
  lastBlank = null;
  state.items = [];
  uidSeq = 0;

  for (const side of ['left', 'right']) {
    for (const [w, d] of p.fixed[side]) {
      state.items.push({ uid: ++uidSeq, w: w, d: d, side: side, fixed: true, trayUid: null });
    }
  }
  state.tray = p.tray.map((w) => ({ uid: ++uidSeq, w: w, used: false }));

  // 안내 문구
  const note = $('equation-note');
  if (!p.showDist) note.innerHTML = '추는 모두 <b>' + CIRCLED[1] + '번 칸</b>에 놓아요';
  else if (p.place.length > 1) note.innerHTML = '추를 <b>' + p.place.length + '개</b> 놓아야 해요';
  else note.innerHTML = '숫자 옆의 <b>파란 수</b>는 <b>몇 번 칸</b>인지를 뜻해요';

  for (const key in slotEls) slotEls[key].classList.remove('hint-target');

  $('hud-qnum').textContent = state.qIndex + 1;
  $('hud-qtotal').textContent = state.total;
  $('hud-level').textContent = '★'.repeat(p.tier) + '☆'.repeat(5 - p.tier);
  $('btn-hint').disabled = false;
  state.bestTier = Math.max(state.bestTier, p.tier);

  renderTray();
  renderBoard();
  renderDots();
  fit();
  startTimer(RULES.timeByTier[p.tier] || 60);
}

function nextQuestion() {
  if (state.qIndex >= state.total) return finishGame();
  loadProblem(pickProblem(pickTier(state.qIndex)));
}

function afterChange() {
  if (state.mode === 'free' || state.locked || !state.problem) return;
  const L = momentOf('left'), R = momentOf('right');
  const byPlayer = state.items.filter((i) => !i.fixed).length;
  if (L === R && byPlayer > 0) succeed();
}

function succeed() {
  state.locked = true;
  stopTimer();
  const p = state.problem;
  const canonical = blankValue() === p.place[0][0];

  const timeBonus = cfg.timer ? Math.round(state.timeLeft) * RULES.scorePerSecond : 0;
  const gain = Math.max(20,
    RULES.scoreBase + p.tier * RULES.scorePerTier + timeBonus +
    state.streak * RULES.scoreStreak - state.hintLevel * RULES.hintPenalty);

  state.score += gain;
  state.correct += 1;
  state.streak += 1;
  state.wrongRun = 0;
  state.results[state.qIndex] = true;

  $('hud-score').textContent = state.score;
  const box = document.querySelector('.hud-score-box');
  box.classList.remove('bump'); void box.offsetWidth; box.classList.add('bump');

  $('mascot').classList.add('happy');
  setTimeout(() => $('mascot').classList.remove('happy'), 1200);

  sfx('correct');
  const praise = pickOne(['수평이 됐어요!', '정확해요!', '참 잘했어요!', '멋져요!', '대단해요!']);
  showFlash('⚖️ ' + praise, (canonical ? '＋' + gain + '점' : '다른 방법으로도 수평! ＋' + gain + '점'), false);

  renderDots();
  setTimeout(() => { hideFlash(); state.qIndex += 1; nextQuestion(); }, 1750);
}

function fail(reason) {
  state.locked = true;
  stopTimer();
  state.streak = 0;
  state.wrongRun += 1;
  state.results[state.qIndex] = false;
  renderDots();
  sfx('wrong');

  $('scale').classList.add('shake');
  setTimeout(() => $('scale').classList.remove('shake'), 500);

  showAnswer();
  showFlash(reason === 'time' ? '⏰ 시간이 다 됐어요' : '아쉬워요!', '정답은 □ = ' + state.problem.place[0][0], true);
  setTimeout(() => { hideFlash(); state.qIndex += 1; nextQuestion(); }, 2600);
}

/** 정답 배치를 저울 위에 보여 준다 */
function showAnswer() {
  const p = state.problem;
  state.items = state.items.filter((i) => i.fixed);
  for (const [w, d] of p.place) {
    state.items.push({ uid: ++uidSeq, w: w, d: d, side: 'right', fixed: false, trayUid: null, justAdded: true });
  }
  state.tray.forEach((t) => { t.used = true; });
  renderTray();
  renderBoard();
}

function renderDots() {
  const box = $('progress-dots');
  box.innerHTML = '';
  for (let i = 0; i < state.total; i++) {
    const d = el('pdot');
    if (i < state.qIndex) d.classList.add(state.results[i] ? 'ok' : 'no');
    else if (i === state.qIndex) d.classList.add('now');
    box.appendChild(d);
  }
}

/* ── 제한 시간 ─────────────────────────────────────────────── */
function startTimer(sec) {
  stopTimer();
  if (!cfg.timer) { $('hud-timer').style.visibility = 'hidden'; return; }
  $('hud-timer').style.visibility = 'visible';
  state.timeMax = Math.round(sec * cfg.timescale);
  state.timeLeft = state.timeMax;
  state.lastTick = Date.now();
  paintTimer();
  state.timerId = setInterval(() => {
    const now = Date.now();
    const dt = (now - state.lastTick) / 1000;
    state.lastTick = now;
    if (state.locked) return;
    const before = Math.ceil(state.timeLeft);
    state.timeLeft = Math.max(0, state.timeLeft - dt);
    const after = Math.ceil(state.timeLeft);
    if (after !== before && after <= 5 && after > 0) sfx('tick');
    paintTimer();
    if (state.timeLeft <= 0) fail('time');
  }, 120);
}
function stopTimer() { if (state.timerId) { clearInterval(state.timerId); state.timerId = null; } }

function paintTimer() {
  const ring = $('timer-ring');
  const p = state.timeMax ? state.timeLeft / state.timeMax : 0;
  ring.style.setProperty('--p', p.toFixed(3));
  ring.style.setProperty('--ring-color', p > 0.5 ? 'var(--mint)' : p > 0.25 ? 'var(--yellow)' : 'var(--pink)');
  ring.classList.toggle('warn', p <= 0.25);
  $('timer-num').textContent = Math.ceil(state.timeLeft);
}

/* ── 알림 ─────────────────────────────────────────────────── */
function showFlash(main, sub, bad) {
  const f = $('flash'), inner = $('flash-inner');
  inner.className = 'flash-inner' + (bad ? ' bad' : '');
  inner.innerHTML = main + (sub ? '<small>' + sub + '</small>' : '');
  f.hidden = false;
}
function hideFlash() { $('flash').hidden = true; }

/* ───────────────────────────────────────────────────────────────
   ⑧ 힌트 / 다시 / 넘기기
   ─────────────────────────────────────────────────────────────── */
function useHint() {
  if (state.locked || !state.problem) return;
  const p = state.problem;
  state.hintLevel += 1;
  if (state.hintLevel === 1) {
    slotEls[p.blank.side + ':' + p.blank.d].classList.add('hint-target');
    $('equation-note').innerHTML = '□ 에 넣을 추는 <b>' + CIRCLED[p.blank.d] + '번 칸</b>에 놓아요 (−' + RULES.hintPenalty + '점)';
  } else if (state.hintLevel === 2) {
    $('equation-note').innerHTML = '왼쪽은 모두 합해서 <b>' + momentOf('left') + '</b> 만큼이에요 (−' + RULES.hintPenalty + '점)';
    updateReadout();
  } else {
    state.hintLevel = 2;
    $('btn-hint').disabled = true;
  }
  sfx('pick');
}

function resetBoard() {
  if (state.locked || state.mode === 'quiz' && !state.problem) return;
  state.items = state.items.filter((i) => i.fixed);
  state.tray.forEach((t) => { t.used = false; });
  renderTray(); renderBoard();
  sfx('back');
}

/* ───────────────────────────────────────────────────────────────
   ⑨ 화면 전환 / 게임 시작·종료
   ─────────────────────────────────────────────────────────────── */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('is-active'));
  $('screen-' + name).classList.add('is-active');
  if (name === 'game') requestAnimationFrame(fit);
}

function startGame() {
  state.mode = 'quiz';
  state.qIndex = 0;
  state.total = cfg.total;
  state.score = 0; state.streak = 0; state.correct = 0;
  state.bestTier = 1; state.wrongRun = 0;
  state.usedIds = []; state.results = [];
  $('hud-score').textContent = '0';
  $('btn-skip').hidden = false;
  $('btn-hint').hidden = false;
  hideFlash();
  showScreen('game');
  nextQuestion();
}

function startFree() {
  state.mode = 'free';
  state.problem = null;
  state.locked = false;
  state.items = [];
  uidSeq = 0;
  state.tray = RULES.freeWeights.map((w) => ({ uid: ++uidSeq, w: w, used: false }));
  state.total = 0;
  stopTimer();
  $('hud-timer').style.visibility = 'hidden';
  $('hud-qnum').textContent = '∞';
  $('hud-qtotal').textContent = '∞';
  $('hud-level').textContent = '자유 탐구';
  $('equation-note').innerHTML = '추를 마음대로 올려 보며 <b>수평</b>이 되는 규칙을 찾아 봐요';
  $('progress-dots').innerHTML = '';
  $('btn-skip').hidden = true;
  $('btn-hint').hidden = true;
  hideFlash();
  renderTray();
  renderBoard();
  showScreen('game');
}

function finishGame() {
  stopTimer();
  const best = Math.max(store.get('best', 0), state.score);
  store.set('best', best);

  const ratio = state.total ? state.correct / state.total : 0;
  const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;

  $('res-score').textContent = state.score;
  $('res-correct').textContent = state.correct + ' / ' + state.total;
  $('res-tier').textContent = state.bestTier + '단계';
  $('res-best').textContent = best;
  $('result-stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  $('result-emoji').textContent = stars === 3 ? '🏆' : stars === 2 ? '🎉' : '🌱';
  $('result-title').textContent = stars === 3 ? '완벽해요!' : stars === 2 ? '참 잘했어요!' : '도전 성공!';
  $('result-msg').textContent = stars === 3
    ? '지렛대의 원리를 완전히 이해했어요. 다음엔 더 어려운 단계에 도전해 볼까요?'
    : stars === 2 ? '아주 잘하고 있어요! 한 번 더 하면 더 잘할 수 있어요.'
    : '괜찮아요. 추를 바깥쪽에 놓을수록 더 무거워진다는 걸 기억해요!';

  showScreen('result');
  sfx('fanfare');
  runConfetti();
}

/* ── 색종이 효과 ───────────────────────────────────────────── */
let confettiRAF = null;
function runConfetti() {
  const cv = $('confetti');
  const ctx = cv.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr;
  ctx.scale(dpr, dpr);
  const W = cv.clientWidth, H = cv.clientHeight;
  const colors = ['#ff8fb1', '#6ec7f5', '#7ed7a5', '#ffd166', '#b39ddb'];
  const ps = [];
  for (let i = 0; i < 130; i++) {
    ps.push({ x: Math.random() * W, y: -Math.random() * H, w: 6 + Math.random() * 8, h: 8 + Math.random() * 10,
      vy: 1.4 + Math.random() * 2.6, vx: -0.9 + Math.random() * 1.8, a: Math.random() * Math.PI,
      va: -0.12 + Math.random() * 0.24, c: colors[i % colors.length] });
  }
  const t0 = Date.now();
  cancelAnimationFrame(confettiRAF);
  (function loop() {
    ctx.clearRect(0, 0, W, H);
    for (const p of ps) {
      p.x += p.vx; p.y += p.vy; p.a += p.va;
      if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (Date.now() - t0 < 6000) confettiRAF = requestAnimationFrame(loop);
    else ctx.clearRect(0, 0, W, H);
  })();
}

/* ───────────────────────────────────────────────────────────────
   ⑩ 화면 크기 맞추기
   ─────────────────────────────────────────────────────────────── */
const BELOW_PIVOT = 0.71;   // 받침점 아래로 쓸 수 있는 높이 비율 (--pivot-y 와 짝)

function fit() {
  const stage = $('stage').getBoundingClientRect();
  if (!stage.height) return;

  // 추 크기: 눈금 간격(9%)과 쌓을 높이 중 작은 쪽에 맞춘다
  const beamW = Math.min(stage.width * 0.97, 1400);
  const byWidth = beamW * 0.082;
  const byHeight = (stage.height * BELOW_PIVOT - 44) / RULES.maxStack;
  const d = clamp(Math.min(byWidth, byHeight), 30, 118);
  document.documentElement.style.setProperty('--disc', Math.round(d) + 'px');

  // 저울 높이: 추가 다 들어갈 만큼만 쓰고 무대 가운데에 놓는다 (기둥이 쓸데없이 길어지지 않도록)
  const need = (d * RULES.maxStack + 52) / BELOW_PIVOT;
  $('scale').style.height = Math.round(clamp(need, 180, stage.height)) + 'px';
}

/* ───────────────────────────────────────────────────────────────
   ⑪ 설정 화면
   ─────────────────────────────────────────────────────────────── */
function bindSettings() {
  const map = { 'set-total': 'total', 'set-timer': 'timer', 'set-timescale': 'timescale', 'set-tier': 'fixedTier', 'set-sound': 'sound', 'set-readout': 'readout' };
  for (const id in map) {
    const sel = $(id);
    sel.value = String(cfg[map[id]]);
    sel.addEventListener('change', () => {
      cfg[map[id]] = parseFloat(sel.value);
      store.set('cfg', cfg);
      if (map[id] === 'readout') updateReadout();
    });
  }
  $('btn-reset-best').addEventListener('click', () => { store.set('best', 0); paintBest(); $('btn-reset-best').textContent = '지웠어요 ✓'; });
}

function paintBest() {
  const b = store.get('best', 0);
  $('title-best').textContent = b > 0 ? '🏅 최고 기록 ' + b + '점' : '';
}

function openModal(id) { $(id).hidden = false; }
function closeModal(id) { $(id).hidden = true; }

/* ───────────────────────────────────────────────────────────────
   ⑫ 초기화
   ─────────────────────────────────────────────────────────────── */
function init() {
  // 로고
  for (const id of ['title-logo', 'hud-logo']) {
    const img = $(id);
    img.src = ASSETS.logo;
    img.onerror = function () { img.replaceWith(Object.assign(document.createElement('span'), { className: 'hud-logo', textContent: '경남수학문화관' })); };
  }

  buildScale();
  bindSettings();
  paintBest();

  $('btn-start').addEventListener('click', () => { audio(); startGame(); });
  $('btn-free').addEventListener('click', () => { audio(); startFree(); });
  $('btn-help').addEventListener('click', () => openModal('modal-help'));
  $('btn-settings').addEventListener('click', () => openModal('modal-settings'));
  document.querySelectorAll('.modal-close').forEach((b) => b.addEventListener('click', () => closeModal(b.dataset.close)));
  document.querySelectorAll('.modal').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m) m.hidden = true; }));

  $('btn-home').addEventListener('click', () => { stopTimer(); hideFlash(); showScreen('title'); paintBest(); });
  $('btn-hint').addEventListener('click', useHint);
  $('btn-reset').addEventListener('click', resetBoard);
  $('btn-skip').addEventListener('click', () => { if (!state.locked && state.problem) fail('skip'); });
  $('btn-again').addEventListener('click', startGame);
  $('btn-to-title').addEventListener('click', () => { showScreen('title'); paintBest(); });

  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', () => setTimeout(fit, 240));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('.modal').forEach((m) => { m.hidden = true; }); });
  // 확대/스크롤 방지 (전자칠판에서 화면이 흔들리지 않도록)
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dragstart', (e) => e.preventDefault());

  fit();

  // 개발용: 문제 데이터가 없으면 알려 준다
  if (!window.PROBLEMS || !window.PROBLEMS.length) {
    $('title-best').textContent = '⚠️ 문제 데이터(js/problems.js)를 불러오지 못했습니다.';
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

// 자동 검사용으로 내부 상태를 노출 (게임 동작에는 영향 없음)
// tools-test-problems-ingame.js 가 문제를 하나씩 불러와 실제로 풀어 보는 데 씁니다.
window.__balance = {
  state: state, cfg: cfg, momentOf: momentOf, RULES: RULES,
  load: loadProblem, blankValue: blankValue,
};

})();

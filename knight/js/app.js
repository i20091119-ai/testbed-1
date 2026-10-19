/* ═══════════════════════════════════════════════════════════════
 * app.js — 기사의 여행 (5×5 나이트 투어) 본체
 * 경남수학문화관 · 학급 전자칠판용 1~4인 동시 대결
 *
 * 화면 흐름: 인원 선택 → 규칙 안내 → 시작하기 → 카운트다운 → 게임 → 결과
 * ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 규칙 상수 ─────────────────────────────────────────────── */
  var N = 5;                       // 체스판 한 변
  var TOTAL_CELLS = N * N;         // 25칸
  var TOTAL_TIME = 120;            // 전체 제한시간 2분
  var POINT_NEW = 10;              // 새 칸을 밟을 때마다
  var POINT_TOUR = 100;            // 25칸 완주 보너스
  var TOUR_FLASH_MS = 1800;        // 완주 축하 후 새 보드까지
  var HINT_AFTER_MISSES = 3;       // 연속 오답 이때부터 갈 수 있는 칸 살짝 표시
  var HINT_MS = 3000;

  /* 나이트의 ㄱ자 이동 8방향 */
  var KNIGHT = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

  var PLAYER_DEFS = [
    { name: '1P', color: '#e6455c' },
    { name: '2P', color: '#2f8fd0' },
    { name: '3P', color: '#3fae74' },
    { name: '4P', color: '#d98c00' }
  ];

  var MEDALS = ['🥇', '🥈', '🥉'];

  /* ── 이미지 교체 슬롯 ──────────────────────────────────────
   * 아래 경로에 그림을 넣으면 자동으로 교체되고, 없으면 기본 그래픽이 쓰인다.
   * 명세는 docs/이미지_에셋_명세서.pdf 참고. */
  var KNIGHT_IMG = 'assets/pieces/knight-%d.png';   // 플레이어별 나이트 말
  var MEDAL_IMG = {                                  // 결과 화면 메달
    '🥇': 'assets/ui/medal-1.png',
    '🥈': 'assets/ui/medal-2.png',
    '🥉': 'assets/ui/medal-3.png'
  };
  var medalReady = {};

  /* 그림이 실제로 열리면 콜백 — 없으면 아무 일도 일어나지 않는다 */
  function ifImageExists(src, cb) {
    var probe = new Image();
    probe.onload = function () { cb(src); };
    probe.src = src;
  }

  Object.keys(MEDAL_IMG).forEach(function (sym) {
    ifImageExists(MEDAL_IMG[sym], function () { medalReady[sym] = true; });
  });

  function medalHTML(sym) {
    return medalReady[sym]
      ? '<img src="' + MEDAL_IMG[sym] + '" alt="">'
      : sym;
  }

  /* ── DOM ──────────────────────────────────────────────────── */
  var $ = function (id) { return document.getElementById(id); };
  var stage = $('stage');
  var screens = {
    start:  $('screen-start'),
    rules:  $('screen-rules'),
    game:   $('screen-game'),
    result: $('screen-result')
  };
  var boardsEl = $('boards');
  var clockEl = $('clock');
  var timerBar = $('timer-bar');
  var countOverlay = $('countdown-overlay');
  var countNum = $('countdown-num');
  var pauseOverlay = $('pause-overlay');
  var howtoModal = $('howto-modal');

  /* ── 상태 ─────────────────────────────────────────────────── */
  var state = {
    screen: 'start',
    count: 1,            // 인원
    players: [],
    running: false,      // 타이머가 흐르는 중
    remaining: TOTAL_TIME * 1000,
    endAt: 0,
    raf: 0,
    lastTickSec: -1,
    countTimers: []
  };

  /* ══════════ 화면 배율 ══════════
   * 기본 무대는 1920×1080. 화면 비율이 다르면 무대를 넓혀(또는 높여)
   * 레터박스 없이 꽉 차게 만든다. UI는 모두 중앙 기준이다. */
  var STAGE_W = 1920, STAGE_H = 1080;
  var STAGE_MAX_W = 2560, STAGE_MAX_H = 1440;

  function fitStage() {
    var aspect = window.innerWidth / window.innerHeight;
    var w = Math.min(STAGE_MAX_W, Math.max(STAGE_W, Math.round(STAGE_H * aspect)));
    var h = Math.min(STAGE_MAX_H, Math.max(STAGE_H, Math.round(STAGE_W / aspect)));
    stage.style.width = w + 'px';
    stage.style.height = h + 'px';
    var s = Math.min(window.innerWidth / w, window.innerHeight / h);
    stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }
  window.addEventListener('resize', fitStage);
  fitStage();

  /* ══════════ 화면 전환 ══════════ */
  function showScreen(name) {
    Object.keys(screens).forEach(function (k) {
      screens[k].classList.toggle('active', k === name);
    });
    state.screen = name;
  }

  /* ══════════ 보드 만들기 ══════════ */
  function makePlayer(idx) {
    var def = PLAYER_DEFS[idx];

    var panel = document.createElement('div');
    panel.className = 'panel';
    panel.style.setProperty('--pc', def.color);

    /* 플레이어별 나이트 말 그림이 있으면 내장 SVG 대신 쓴다.
     * CSS 변수 안의 상대 경로는 스타일시트(css/) 기준으로 풀리는 브라우저가 있어
     * 절대 URL로 바꿔서 넣는다. */
    ifImageExists(KNIGHT_IMG.replace('%d', idx + 1), function (src) {
      var abs = new URL(src, document.baseURI).href;
      panel.style.setProperty('--knight-img', 'url("' + abs + '")');
    });

    var laps = document.createElement('div');
    laps.className = 'laps hidden';
    panel.appendChild(laps);

    var top = document.createElement('div');
    top.className = 'panel-top';
    var nameEl = document.createElement('span');
    nameEl.className = 'pname';
    nameEl.textContent = def.name;
    var scoreEl = document.createElement('span');
    scoreEl.className = 'pscore';
    scoreEl.textContent = '0';
    top.appendChild(nameEl);
    top.appendChild(scoreEl);
    panel.appendChild(top);

    var wrap = document.createElement('div');
    wrap.className = 'board-wrap';
    var board = document.createElement('div');
    board.className = 'board';

    var cells = [];
    for (var r = 0; r < N; r++) {
      cells.push([]);
      for (var c = 0; c < N; c++) {
        var cell = document.createElement('button');
        cell.className = 'cell' + ((r + c) % 2 ? ' dark' : '');
        cell.type = 'button';
        var order = document.createElement('span');
        order.className = 'order';
        cell.appendChild(order);
        board.appendChild(cell);
        cells[r].push(cell);
        bindCell(idx, r, c, cell);
      }
    }

    /* 이동 경로 선 (칸 단위 좌표계 0~5) */
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'path-svg');
    svg.setAttribute('viewBox', '0 0 ' + N + ' ' + N);
    svg.setAttribute('preserveAspectRatio', 'none');
    var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    svg.appendChild(poly);
    board.appendChild(svg);

    wrap.appendChild(board);
    panel.appendChild(wrap);

    var msg = document.createElement('div');
    msg.className = 'pmsg';
    panel.appendChild(msg);

    var btns = document.createElement('div');
    btns.className = 'panel-btns';
    var undoBtn = document.createElement('button');
    undoBtn.className = 'pbtn';
    undoBtn.type = 'button';
    undoBtn.textContent = '↩️ 되돌리기';
    var resetBtn = document.createElement('button');
    resetBtn.className = 'pbtn';
    resetBtn.type = 'button';
    resetBtn.textContent = '🔄 새로 시작';
    btns.appendChild(undoBtn);
    btns.appendChild(resetBtn);
    panel.appendChild(btns);

    var p = {
      idx: idx,
      def: def,
      score: 0,
      laps: 0,          // 완주 횟수
      best: 0,          // 한 보드에서 밟은 최고 칸 수
      order: [],        // [[r,c], ...] 밟은 순서
      mark: null,       // mark[r][c] = 몇 번째로 밟았는지 (0이면 아직)
      cur: null,        // 나이트 위치 [r,c]
      stuck: false,
      celebrating: false,
      misses: 0,
      hintTimer: 0,
      els: { panel: panel, laps: laps, score: scoreEl, cells: cells, poly: poly, msg: msg, undo: undoBtn, reset: resetBtn }
    };

    undoBtn.addEventListener('click', function () { undo(p); });
    resetBtn.addEventListener('click', function () { manualReset(p); });

    clearBoard(p);
    return p;
  }

  /* 각 보드의 칸은 독립적으로 반응한다 — 여러 명이 동시에 눌러도 서로 막지 않는다 */
  function bindCell(playerIdx, r, c, cell) {
    cell.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      var p = state.players[playerIdx];
      if (p) tapCell(p, r, c, cell);
    });
  }

  function buildBoards(count) {
    boardsEl.innerHTML = '';
    boardsEl.className = 'boards n' + count;
    state.players = [];
    for (var i = 0; i < count; i++) {
      var p = makePlayer(i);
      state.players.push(p);
      boardsEl.appendChild(p.els.panel);
    }
  }

  /* ══════════ 보드 상태 ══════════ */
  function clearBoard(p) {
    p.mark = [];
    for (var r = 0; r < N; r++) {
      p.mark.push([]);
      for (var c = 0; c < N; c++) p.mark[r].push(0);
    }
    p.order = [];
    p.cur = null;
    p.stuck = false;
    p.misses = 0;
    clearHints(p);
    render(p);
  }

  function inBoard(r, c) { return r >= 0 && r < N && c >= 0 && c < N; }

  function isKnightMove(from, r, c) {
    var dr = Math.abs(from[0] - r), dc = Math.abs(from[1] - c);
    return (dr === 1 && dc === 2) || (dr === 2 && dc === 1);
  }

  function legalMoves(p) {
    var out = [];
    if (!p.cur) return out;
    for (var i = 0; i < KNIGHT.length; i++) {
      var r = p.cur[0] + KNIGHT[i][0], c = p.cur[1] + KNIGHT[i][1];
      if (inBoard(r, c) && p.mark[r][c] === 0) out.push([r, c]);
    }
    return out;
  }

  /* ══════════ 칸 터치 ══════════ */
  function tapCell(p, r, c, cell) {
    if (!state.running || p.celebrating) return;
    SFX.unlock();

    var ok = p.cur === null ? p.mark[r][c] === 0
                            : (p.mark[r][c] === 0 && isKnightMove(p.cur, r, c));
    if (!ok) {
      p.misses++;
      shake(cell);
      SFX.wrong();
      if (p.misses >= HINT_AFTER_MISSES) showHints(p);
      return;
    }

    p.misses = 0;
    clearHints(p);
    p.order.push([r, c]);
    p.mark[r][c] = p.order.length;
    p.cur = [r, c];
    p.score += POINT_NEW;
    if (p.order.length > p.best) p.best = p.order.length;
    SFX.step();
    render(p);

    if (p.order.length === TOTAL_CELLS) completeTour(p);
    else checkStuck(p);
  }

  function shake(cell) {
    cell.classList.remove('shake');
    void cell.offsetWidth;            // 애니메이션 재시작
    cell.classList.add('shake');
    setTimeout(function () { cell.classList.remove('shake'); }, 340);
  }

  function showHints(p) {
    clearHints(p);
    legalMoves(p).forEach(function (m) { p.els.cells[m[0]][m[1]].classList.add('hint'); });
    p.hintTimer = setTimeout(function () { clearHints(p); }, HINT_MS);
  }

  function clearHints(p) {
    if (p.hintTimer) { clearTimeout(p.hintTimer); p.hintTimer = 0; }
    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) p.els.cells[r][c].classList.remove('hint');
    }
  }

  /* ══════════ 막힘 · 되돌리기 · 새로 시작 ══════════ */
  function checkStuck(p) {
    var was = p.stuck;
    p.stuck = p.order.length > 0 && p.order.length < TOTAL_CELLS && legalMoves(p).length === 0;
    if (p.stuck && !was) SFX.stuck();
    render(p);
  }

  /* 되돌리기: 마지막 한 칸을 밟지 않은 것으로 되돌린다.
   * 그 칸에서 받은 10점도 함께 되돌아간다(같은 칸을 다시 밟아 점수를 벌 수 없게). */
  function undo(p) {
    if (!state.running || p.celebrating || p.order.length === 0) return;
    SFX.unlock();
    var last = p.order.pop();
    p.mark[last[0]][last[1]] = 0;
    p.score = Math.max(0, p.score - POINT_NEW);
    p.cur = p.order.length ? p.order[p.order.length - 1] : null;
    p.misses = 0;
    clearHints(p);
    SFX.undo();
    checkStuck(p);
  }

  /* 새로 시작: 막혔을 때만. 보드는 비우고 지금까지 쌓은 점수는 그대로 둔다. */
  function manualReset(p) {
    if (!state.running || p.celebrating || !p.stuck) return;
    SFX.unlock();
    SFX.reset();
    clearBoard(p);
  }

  /* ══════════ 완주 ══════════ */
  function completeTour(p) {
    p.celebrating = true;
    p.laps++;
    p.score += POINT_TOUR;
    SFX.tour();
    render(p);

    var flash = document.createElement('div');
    flash.className = 'tour-flash';
    flash.innerHTML =
      '<div class="tf-emoji">🏁</div>' +
      '<div class="tf-title">25칸 완주!</div>' +
      '<div class="tf-sub">보너스 +' + POINT_TOUR + '점</div>';
    p.els.panel.appendChild(flash);

    setTimeout(function () {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
      p.celebrating = false;
      if (state.running) clearBoard(p);      // 새 보드로 다시 도전 (점수는 유지)
    }, TOUR_FLASH_MS);
  }

  /* ══════════ 그리기 ══════════ */
  function render(p) {
    p.els.score.textContent = p.score;

    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        var cell = p.els.cells[r][c];
        var n = p.mark[r][c];
        cell.classList.toggle('visited', n > 0);
        cell.classList.toggle('current', !!p.cur && p.cur[0] === r && p.cur[1] === c);
        cell.firstChild.textContent = n > 0 ? n : '';
      }
    }

    var pts = p.order.map(function (m) { return (m[1] + 0.5) + ',' + (m[0] + 0.5); }).join(' ');
    p.els.poly.setAttribute('points', pts);

    p.els.laps.textContent = '🏁 완주 ×' + p.laps;
    p.els.laps.classList.toggle('hidden', p.laps === 0);

    p.els.undo.disabled = !state.running || p.order.length === 0;
    p.els.reset.disabled = !state.running || !p.stuck;
    p.els.reset.classList.toggle('ready', state.running && p.stuck);

    var msg;
    if (!state.running) msg = '';
    else if (p.stuck) msg = '막혔어요! 되돌리거나 새로 시작해요';
    else if (p.cur === null) msg = '아무 칸이나 눌러 출발!';
    else msg = p.order.length + ' / ' + TOTAL_CELLS + '칸';
    p.els.msg.textContent = msg;
    p.els.msg.classList.toggle('stuck', !!p.stuck);
  }

  /* ══════════ 타이머 ══════════ */
  function fmt(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  function tick() {
    if (!state.running) return;
    var left = state.endAt - Date.now();
    if (left <= 0) { left = 0; }

    state.remaining = left;
    clockEl.textContent = fmt(left);
    timerBar.style.width = (left / (TOTAL_TIME * 1000) * 100) + '%';

    var ratio = left / (TOTAL_TIME * 1000);
    timerBar.classList.toggle('warn', ratio <= 0.4 && ratio > 0.15);
    timerBar.classList.toggle('danger', ratio <= 0.15);
    clockEl.classList.toggle('warn', ratio <= 0.4 && ratio > 0.15);
    clockEl.classList.toggle('danger', ratio <= 0.15);

    var sec = Math.ceil(left / 1000);
    if (sec !== state.lastTickSec) {
      if (sec <= 10 && sec > 0) SFX.tick();
      state.lastTickSec = sec;
    }

    if (left <= 0) { finish(); return; }
    state.raf = requestAnimationFrame(tick);
  }

  function startTimer() {
    state.running = true;
    state.endAt = Date.now() + state.remaining;
    state.lastTickSec = -1;
    state.players.forEach(render);
    cancelAnimationFrame(state.raf);
    state.raf = requestAnimationFrame(tick);
  }

  function stopTimer() {
    state.running = false;
    cancelAnimationFrame(state.raf);
    state.raf = 0;
  }

  /* ══════════ 카운트다운 ══════════ */
  function clearCountTimers() {
    state.countTimers.forEach(clearTimeout);
    state.countTimers = [];
  }

  function runCountdown(done) {
    clearCountTimers();
    countOverlay.classList.remove('hidden');
    var steps = ['3', '2', '1', '시작!'];
    steps.forEach(function (txt, i) {
      state.countTimers.push(setTimeout(function () {
        countNum.textContent = txt;
        countNum.classList.toggle('go', i === steps.length - 1);
        countNum.style.animation = 'none';
        void countNum.offsetWidth;
        countNum.style.animation = '';
        SFX.countdown(i === steps.length - 1);
      }, i * 800));
    });
    state.countTimers.push(setTimeout(function () {
      countOverlay.classList.add('hidden');
      done();
    }, steps.length * 800));
  }

  /* ══════════ 게임 시작 · 종료 ══════════ */
  function startGame(count) {
    state.count = count;
    state.remaining = TOTAL_TIME * 1000;
    state.running = false;
    buildBoards(count);
    clockEl.textContent = fmt(state.remaining);
    timerBar.style.width = '100%';
    timerBar.classList.remove('warn', 'danger');
    clockEl.classList.remove('warn', 'danger');
    pauseOverlay.classList.add('hidden');
    howtoModal.classList.add('hidden');
    Confetti.stop();
    showScreen('game');
    runCountdown(startTimer);
  }

  function finish() {
    stopTimer();
    clearCountTimers();
    countOverlay.classList.add('hidden');
    SFX.timeout();
    state.players.forEach(function (p) {
      clearHints(p);
      p.els.panel.classList.add('done');
      render(p);
    });
    setTimeout(showResult, 900);
  }

  /* ══════════ 결과 ══════════ */
  function soloGrade(p) {
    if (p.laps >= 2) return { medal: '🏆', label: '기사단장' };
    if (p.laps >= 1) return { medal: '🥇', label: '완주 기사' };
    if (p.best >= 20) return { medal: '🥈', label: '베테랑 기사' };
    if (p.best >= 15) return { medal: '🥉', label: '견습 기사' };
    return { medal: '🎖️', label: '도전자' };
  }

  function detailText(p) {
    var parts = [];
    if (p.laps > 0) parts.push('완주 ' + p.laps + '번');
    parts.push('한 판 최고 ' + p.best + '칸');
    return parts.join(' · ');
  }

  function showResult() {
    var list = $('result-list');
    list.innerHTML = '';

    var ranked = state.players.slice().sort(function (a, b) { return b.score - a.score; });

    /* 동점은 공동 순위 (예: 1, 1, 3) */
    var ranks = [];
    ranked.forEach(function (p, i) {
      ranks.push(i > 0 && p.score === ranked[i - 1].score ? ranks[i - 1] : i + 1);
    });

    ranked.forEach(function (p, i) {
      var solo = state.count === 1;
      var grade = solo ? soloGrade(p) : null;
      var rank = ranks[i];
      var tied = !solo && ranks.filter(function (r) { return r === rank; }).length > 1;

      var li = document.createElement('li');
      li.className = 'rrow';
      li.style.setProperty('--pc', p.def.color);
      li.style.animationDelay = (i * 0.14) + 's';
      li.innerHTML =
        '<span class="rr-medal">' + medalHTML(solo ? grade.medal : (MEDALS[rank - 1] || '🎖️')) + '</span>' +
        '<span class="rr-rank">' + (solo ? grade.label : (tied ? '공동 ' : '') + rank + '위') + '</span>' +
        '<span class="rr-name">' + p.def.name + '</span>' +
        '<span class="rr-detail">' + detailText(p) + '</span>' +
        '<span class="rr-score">' + p.score + '<small>점</small></span>';
      list.appendChild(li);
    });

    var head = $('result-rank');
    if (state.count === 1) {
      head.textContent = '🏆 ' + soloGrade(ranked[0]).label + '!';
    } else {
      var winners = ranked.filter(function (p, i) { return ranks[i] === 1; });
      head.textContent = '🏆 ' + winners.map(function (p) { return p.def.name; }).join(' · ') +
                         (winners.length > 1 ? ' 공동 우승!' : ' 우승!');
    }

    $('btn-again').textContent = (state.count === 1 ? '다시 도전하기' : '다시 대결하기') + ' 🔄';

    showScreen('result');
    SFX.fanfare();
    Confetti.start($('confetti-canvas'));
  }

  function goHome() {
    stopTimer();
    clearCountTimers();
    countOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    howtoModal.classList.add('hidden');
    Confetti.stop();
    showScreen('start');
  }

  /* ══════════ 이벤트 ══════════ */
  document.querySelectorAll('.pick-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      SFX.unlock();
      SFX.click();
      state.count = parseInt(btn.dataset.count, 10);
      $('rules-players').textContent = state.count === 1
        ? '1인 도전 · 나 혼자 기사의 여행'
        : state.count + '인 대결 · 화면을 ' + state.count + '칸으로 나눠요';
      showScreen('rules');
    });
  });

  $('btn-rules-back').addEventListener('click', function () { SFX.click(); showScreen('start'); });
  $('btn-rules-go').addEventListener('click', function () { SFX.click(); startGame(state.count); });

  $('btn-pause').addEventListener('click', function () {
    if (!state.running) return;
    SFX.click();
    state.remaining = Math.max(0, state.endAt - Date.now());
    stopTimer();
    state.players.forEach(render);
    pauseOverlay.classList.remove('hidden');
  });
  $('btn-pause-resume').addEventListener('click', function () {
    SFX.click();
    pauseOverlay.classList.add('hidden');
    runCountdown(startTimer);
  });
  $('btn-pause-quit').addEventListener('click', function () { SFX.click(); goHome(); });

  $('btn-quit').addEventListener('click', function () { SFX.click(); goHome(); });

  $('btn-howto-game').addEventListener('click', function () { SFX.click(); howtoModal.classList.remove('hidden'); });
  $('btn-howto-close').addEventListener('click', function () { SFX.click(); howtoModal.classList.add('hidden'); });

  $('btn-mute').addEventListener('click', function () {
    SFX.unlock();
    var m = SFX.toggleMute();
    $('btn-mute').textContent = m ? '🔇' : '🔊';
    if (!m) SFX.click();
  });
  $('btn-mute').textContent = SFX.isMuted() ? '🔇' : '🔊';

  $('btn-again').addEventListener('click', function () {
    SFX.click();
    Confetti.stop();
    startGame(state.count);
  });
  $('btn-home').addEventListener('click', function () { SFX.click(); goHome(); });

  /* 첫 터치에서 오디오 잠금 해제 (브라우저 자동재생 정책) */
  document.addEventListener('pointerdown', function once() {
    SFX.unlock();
    document.removeEventListener('pointerdown', once);
  });

  showScreen('start');
})();

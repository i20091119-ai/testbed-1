/**
 * 「저울 수학」 문제 은행 검사기
 * ─────────────────────────────────────────────────────────────
 * js/problems.js 의 문제 100개가 실제로 성립하는지 검사합니다.
 * 문제를 직접 고치거나 추가한 뒤에 반드시 한 번 돌려 보세요.
 *
 *     node tools-test-problems.js
 *
 * 검사 결과가 하나라도 ❌ 이면 종료 코드 1 로 끝납니다.
 *
 * ※ 이 파일은 문제를 만든 tools-generate-problems.js 와 별개로,
 *    게임 규칙(js/game.js)만 보고 처음부터 다시 작성한 검사입니다.
 */
'use strict';

const fs = require('fs');
const path = require('path');

/* ── 게임 규칙 (js/game.js 의 RULES 와 일치해야 함) ────────── */
const MAX_W = 12;      // 추 무게 최대
const MAX_D = 5;       // 눈금 칸 수
const MAX_STACK = 3;   // 한 칸에 쌓을 수 있는 추 개수
const TIERS = 5;
const PER_TIER = 20;

/* ── 문제 데이터 읽기 ──────────────────────────────────────── */
const src = fs.readFileSync(path.join(__dirname, 'js', 'problems.js'), 'utf8');
const sandbox = { window: {} };
new Function('window', src)(sandbox.window);
const PROBLEMS = sandbox.window.PROBLEMS;

/* ── 검사 결과 모으기 ──────────────────────────────────────── */
const failedChecks = [];   // 실패한 검사 항목
const notes = [];
let checks = 0;
function section(title) { console.log(`\n── ${title} ──`); }
/** 검사 하나의 결과를 출력하고, 실패했으면 전체 결과에 반영한다 */
function report(name, bad, total) {
  checks++;
  const ok = bad.length === 0;
  console.log(`  ${ok ? '✅' : '❌'} ${name}${total != null ? ` (${total - bad.length}/${total})` : ''}`);
  if (!ok) {
    bad.slice(0, 6).forEach((b) => console.log(`       · ${b}`));
    if (bad.length > 6) console.log(`       · … 외 ${bad.length - 6}건`);
    failedChecks.push({ name, bad });
  }
}

/* ── 도우미 ────────────────────────────────────────────────── */
const moment = (list) => list.reduce((s, [w, d]) => s + w * d, 0);
const termKey = (t) => `${t[0]}@${t[1]}`;
const sortKeys = (a) => a.slice().sort();
const sameMultiset = (a, b) =>
  a.length === b.length && String(sortKeys(a)) === String(sortKeys(b));

/** 문제 모드에서 이 칸에 추를 놓을 수 있는가 (js/game.js 의 slotAllowed 와 동일 규칙) */
const allowedDists = (p) => (p.showDist ? [1, 2, 3, 4, 5] : [1]);

console.log(`문제 은행 검사  —  총 ${PROBLEMS ? PROBLEMS.length : 0}문제`);

/* ═══════════════════════════════════════════════════════════
   1. 기본 구조
   ═══════════════════════════════════════════════════════════ */
section('1. 기본 구조');
{
  if (!Array.isArray(PROBLEMS) || !PROBLEMS.length) {
    console.log('  ❌ 문제 데이터를 읽지 못했습니다 (js/problems.js 확인)'); process.exit(1);
  }
  report('문제 배열을 읽을 수 있다', []);

  const bad = [];
  console.log(`  ✅ 문제 개수 ${PROBLEMS.length}개`);

  const ids = new Set();
  for (const p of PROBLEMS) {
    const at = `#${p.id}`;
    if (typeof p.id !== 'number' || ids.has(p.id)) bad.push(`${at} id 중복/누락`);
    ids.add(p.id);
    if (!(p.tier >= 1 && p.tier <= TIERS)) bad.push(`${at} tier 범위 밖: ${p.tier}`);
    if (typeof p.showDist !== 'boolean') bad.push(`${at} showDist 누락`);
    if (!p.fixed || !Array.isArray(p.fixed.left) || !Array.isArray(p.fixed.right)) bad.push(`${at} fixed 형식 오류`);
    if (!Array.isArray(p.place) || !p.place.length) bad.push(`${at} place 누락`);
    if (!p.blank || !p.eq || !Array.isArray(p.tray)) bad.push(`${at} blank/eq/tray 누락`);

    const all = [...(p.fixed.left || []), ...(p.fixed.right || []), ...(p.place || [])];
    for (const t of all) {
      if (!Array.isArray(t) || t.length !== 2) { bad.push(`${at} 항목 형식 오류`); continue; }
      const [w, d] = t;
      if (!Number.isInteger(w) || w < 1 || w > MAX_W) bad.push(`${at} 무게 범위 밖: ${w}`);
      if (!Number.isInteger(d) || d < 1 || d > MAX_D) bad.push(`${at} 눈금 범위 밖: ${d}`);
    }
  }
  report('모든 문제의 필드·범위가 올바르다', bad, PROBLEMS.length);

  const perTier = {};
  PROBLEMS.forEach((p) => { perTier[p.tier] = (perTier[p.tier] || 0) + 1; });
  const tierBad = [];
  for (let t = 1; t <= TIERS; t++) if (perTier[t] !== PER_TIER) tierBad.push(`${t}단계 ${perTier[t] || 0}문제 (${PER_TIER}문제여야 함)`);
  report(`단계별 ${PER_TIER}문제씩 있다`, tierBad, TIERS);
}

/* ═══════════════════════════════════════════════════════════
   2. 저울이 실제로 수평이 되는가  (핵심)
   ═══════════════════════════════════════════════════════════ */
section('2. 저울이 실제로 수평이 되는가');
{
  const bad = [];
  for (const p of PROBLEMS) {
    const L = moment(p.fixed.left);
    const R = moment(p.fixed.right) + moment(p.place);
    if (L !== R) bad.push(`#${p.id}(${p.tier}단계) 왼쪽 ${L} ≠ 오른쪽 ${R}`);
  }
  report('정답대로 놓으면 양쪽 모멘트가 같다', bad, PROBLEMS.length);

  const zero = PROBLEMS.filter((p) => moment(p.fixed.left) <= 0)
    .map((p) => `#${p.id} 왼쪽이 비어 있음`);
  report('왼쪽 팔에 항상 추가 올려져 있다', zero, PROBLEMS.length);

  // 시작하자마자 이미 수평이면 문제가 성립하지 않는다
  const pre = PROBLEMS.filter((p) => moment(p.fixed.left) === moment(p.fixed.right))
    .map((p) => `#${p.id} 시작부터 수평`);
  report('시작 상태는 수평이 아니다', pre, PROBLEMS.length);
}

/* ═══════════════════════════════════════════════════════════
   3. 화면의 등식이 저울과 같은 문제인가
   ═══════════════════════════════════════════════════════════ */
section('3. 화면의 등식이 저울과 같은 문제인가');
{
  const badTerms = [], badBlank = [], badSolve = [], badDist = [];

  for (const p of PROBLEMS) {
    const at = `#${p.id}(${p.tier}단계)`;
    const answer = p.place[0][0];

    // (1) 등식의 항이 저울 위의 추와 하나씩 정확히 대응하는가 (합이 아니라 항 단위로)
    const eqL = p.eq.left.map(termKey);
    const boardL = p.fixed.left.map(termKey);
    if (!sameMultiset(eqL, boardL)) badTerms.push(`${at} 좌변 [${eqL}] ≠ 왼팔 [${boardL}]`);

    const eqR = p.eq.right.map((t) => termKey([t[0] === '□' ? answer : t[0], t[1]]));
    const boardR = [...p.fixed.right, ...p.place].map(termKey);
    if (!sameMultiset(eqR, boardR)) badTerms.push(`${at} 우변 [${eqR}] ≠ 오른팔 [${boardR}]`);

    // (2) 빈칸은 정확히 하나, 그리고 place[0] 을 가리켜야 한다
    const blanks = [...p.eq.left, ...p.eq.right].filter((t) => t[0] === '□');
    if (blanks.length !== 1) badBlank.push(`${at} 빈칸 ${blanks.length}개`);
    else if (blanks[0][1] !== p.blank.d) badBlank.push(`${at} 빈칸 눈금 불일치`);
    if (p.blank.side !== 'right') badBlank.push(`${at} 빈칸이 오른쪽이 아님`);
    if (p.blank.d !== p.place[0][1]) badBlank.push(`${at} blank.d 와 place[0] 눈금 불일치`);

    // (3) 등식만 보고 □ 를 유일하게 구할 수 있는가 (계수 ≠ 0, 답이 1~12 자연수)
    //     좌변합 = 우변합 → □ = (좌변합 − 우변상수) / 계수
    const coefOf = (terms) => terms.filter((t) => t[0] === '□').reduce((s, t) => s + t[1], 0);
    const constOf = (terms) => terms.filter((t) => t[0] !== '□').reduce((s, t) => s + t[0] * t[1], 0);
    const coef = coefOf(p.eq.right) - coefOf(p.eq.left);
    const cons = constOf(p.eq.left) - constOf(p.eq.right);
    if (coef === 0) badSolve.push(`${at} □ 의 계수가 0 (답을 정할 수 없음)`);
    else {
      const x = cons / coef;
      if (!Number.isInteger(x)) badSolve.push(`${at} □ 가 자연수가 아님: ${x}`);
      else if (x < 1 || x > MAX_W) badSolve.push(`${at} □ 가 범위 밖: ${x}`);
      else if (x !== answer) badSolve.push(`${at} 등식의 답(${x}) ≠ 놓을 추(${answer})`);
    }

    // (4) 거리를 숨기는 문제(1~2단계)는 모든 추가 ①번 칸에 있어야 등식이 참이 된다
    if (!p.showDist) {
      const all = [...p.fixed.left, ...p.fixed.right, ...p.place];
      const off = all.filter((t) => t[1] !== 1);
      if (off.length) badDist.push(`${at} 거리 표시를 숨겼는데 ①번 칸이 아닌 추가 ${off.length}개`);
    }
  }

  report('등식의 각 항이 저울 위 추와 일치한다', badTerms, PROBLEMS.length * 2);
  report('빈칸이 정확히 하나이고 위치가 맞다', badBlank, PROBLEMS.length);
  report('등식만으로 □ 를 유일하게 구할 수 있다', badSolve, PROBLEMS.length);
  report('거리를 숨긴 문제는 모두 ①번 칸만 쓴다', badDist, PROBLEMS.filter((p) => !p.showDist).length);
}

/* ═══════════════════════════════════════════════════════════
   4. 게임 규칙 안에서 실제로 풀 수 있는가
   ═══════════════════════════════════════════════════════════ */
section('4. 게임 규칙 안에서 실제로 풀 수 있는가');
{
  const badSide = [], badSlot = [], badStack = [], badTray = [];

  for (const p of PROBLEMS) {
    const at = `#${p.id}(${p.tier}단계)`;

    // 문제 모드에서는 오른팔에만 놓을 수 있다
    // (place 는 side 를 갖지 않으므로 게임이 항상 오른쪽에 놓는다 → 정답이 오른쪽 전제인지 확인)
    const okSide = moment(p.fixed.left) > moment(p.fixed.right);
    if (!okSide) badSide.push(`${at} 오른쪽에 추를 더해서는 수평을 만들 수 없음`);

    // 놓을 수 있는 눈금인가
    const allow = allowedDists(p);
    for (const [w, d] of p.place) {
      if (allow.indexOf(d) < 0) badSlot.push(`${at} 잠긴 칸(${d}번)에 놓아야 하는 추 ${w}`);
    }

    // 한 칸 최대 3개
    const cnt = {};
    p.fixed.left.forEach(([, d]) => { cnt['L' + d] = (cnt['L' + d] || 0) + 1; });
    p.fixed.right.forEach(([, d]) => { cnt['R' + d] = (cnt['R' + d] || 0) + 1; });
    p.place.forEach(([, d]) => { cnt['R' + d] = (cnt['R' + d] || 0) + 1; });
    for (const k in cnt) if (cnt[k] > MAX_STACK) badStack.push(`${at} ${k} 칸에 추 ${cnt[k]}개 (최대 ${MAX_STACK})`);

    // 보관함에 정답 추가 (중복 포함) 모두 있는가
    const bag = p.tray.slice();
    for (const [w] of p.place) {
      const i = bag.indexOf(w);
      if (i < 0) badTray.push(`${at} 보관함에 정답 추 ${w} 없음`);
      else bag.splice(i, 1);
    }
    if (p.tray.length < p.place.length) badTray.push(`${at} 보관함이 정답 추보다 적음`);
  }

  report('오른팔에 추를 더해 수평을 만들 수 있다', badSide, PROBLEMS.length);
  report('정답 추를 놓아야 할 칸이 모두 열려 있다', badSlot, PROBLEMS.length);
  report('한 칸에 추가 3개를 넘지 않는다', badStack, PROBLEMS.length);
  report('보관함에 정답 추가 모두 들어 있다', badTray, PROBLEMS.length);
}

/* ═══════════════════════════════════════════════════════════
   5. 보관함의 추만으로 실제 풀이가 존재하는가 (완전 탐색)
   ═══════════════════════════════════════════════════════════ */
section('5. 보관함으로 만들 수 있는 모든 풀이 (완전 탐색)');
{
  /** 보관함의 추를 열린 칸에 놓는 모든 경우를 세어 수평이 되는 배치를 모은다 */
  function allSolutions(p) {
    const allow = allowedDists(p);
    const tray = p.tray;
    const baseL = moment(p.fixed.left);
    const baseR = moment(p.fixed.right);
    const fixedCnt = {};
    p.fixed.right.forEach(([, d]) => { fixedCnt[d] = (fixedCnt[d] || 0) + 1; });

    const found = new Set();
    const cur = [];
    (function rec(i, sum, cnt) {
      if (i === tray.length) {
        if (cur.length && baseL === baseR + sum) {
          found.add(cur.map(([w, d]) => `${w}@${d}`).sort().join(','));
        }
        return;
      }
      rec(i + 1, sum, cnt);                       // 이 추는 쓰지 않는다
      for (const d of allow) {
        const used = (cnt[d] || 0) + (fixedCnt[d] || 0);
        if (used >= MAX_STACK) continue;
        cnt[d] = (cnt[d] || 0) + 1;
        cur.push([tray[i], d]);
        rec(i + 1, sum + tray[i] * d, cnt);
        cur.pop();
        cnt[d] -= 1;
      }
    })(0, 0, {});
    return found;
  }

  const noSolution = [], missingIntended = [], notUnique = [];

  for (const p of PROBLEMS) {
    const sols = allSolutions(p);
    const intended = p.place.map(([w, d]) => `${w}@${d}`).sort().join(',');

    if (sols.size === 0) noSolution.push(`#${p.id}(${p.tier}단계) 풀이 없음`);
    if (!sols.has(intended)) missingIntended.push(`#${p.id} 의도한 정답 배치가 성립하지 않음`);

    if (sols.size > 1) {
      const others = [...sols].filter((s) => s !== intended);
      notUnique.push(`#${p.id}(${p.tier}단계) 다른 풀이 ${others.length}가지: ${others.slice(0, 3).join(' / ')}`);
    }
  }

  report('보관함만으로 풀 수 있는 문제다', noSolution, PROBLEMS.length);
  report('의도한 정답 배치가 실제로 수평이 된다', missingIntended, PROBLEMS.length);
  // 게임은 "수평이면 정답"이므로, 다른 풀이가 있으면 □ 를 맞히지 않고도 통과할 수 있다
  report('수평을 만드는 방법이 정답 하나뿐이다', notUnique, PROBLEMS.length);
}

/* ═══════════════════════════════════════════════════════════
   6. 오답 유인 추가 실제로 오답인가
   ═══════════════════════════════════════════════════════════ */
section('6. 오답 유인 추가 실제로 오답인가');
{
  const bad = [];
  for (const p of PROBLEMS) {
    // "빈칸 자리에 추 하나만 놓는" 가장 흔한 풀이 방식에서,
    // 정답 이외의 추를 놓았을 때 수평이 되어 버리면 안 된다
    if (p.place.length !== 1) continue;
    const need = moment(p.fixed.left) - moment(p.fixed.right);
    const d = p.blank.d;
    for (const w of p.tray) {
      if (w === p.place[0][0]) continue;
      if (w * d === need) bad.push(`#${p.id} 오답 추 ${w} 를 ${d}번 칸에 놓아도 수평이 됨`);
    }
  }
  const single = PROBLEMS.filter((p) => p.place.length === 1).length;
  report('오답 유인 추로는 수평이 되지 않는다', bad, single);
}

/* ═══════════════════════════════════════════════════════════
   7. 중복 문제
   ═══════════════════════════════════════════════════════════ */
section('7. 중복 문제');
{
  const seen = new Map(), dup = [];
  for (const p of PROBLEMS) {
    const key = JSON.stringify([p.fixed.left.slice().sort(), p.fixed.right.slice().sort(), p.place.slice().sort()]);
    if (seen.has(key)) dup.push(`#${p.id} 가 #${seen.get(key)} 와 같은 문제`);
    else seen.set(key, p.id);
  }
  report('완전히 같은 문제가 없다', dup, PROBLEMS.length);

  // 같은 단계 안에서 등식 문구까지 같은 경우
  const eqSeen = new Map(), eqDup = [];
  for (const p of PROBLEMS) {
    const key = p.tier + '|' + JSON.stringify([p.eq.left, p.eq.right]);
    if (eqSeen.has(key)) eqDup.push(`#${p.id} 등식이 #${eqSeen.get(key)} 와 동일`);
    else eqSeen.set(key, p.id);
  }
  report('같은 단계에 똑같은 등식이 없다', eqDup, PROBLEMS.length);
}

/* ═══════════════════════════════════════════════════════════
   8. 난이도가 실제로 올라가는가
   ═══════════════════════════════════════════════════════════ */
section('8. 난이도가 실제로 올라가는가');
{
  const stat = [];
  for (let t = 1; t <= TIERS; t++) {
    const ps = PROBLEMS.filter((p) => p.tier === t);
    const terms = ps.reduce((s, p) => s + p.eq.left.length + p.eq.right.length, 0) / ps.length;
    const mom = ps.reduce((s, p) => s + moment(p.fixed.left), 0) / ps.length;
    const place = ps.reduce((s, p) => s + p.place.length, 0) / ps.length;
    const dist = ps.filter((p) => p.showDist).length;
    stat.push({ t, terms, mom, place, dist, n: ps.length });
  }
  console.log('  단계 | 평균 항 수 | 평균 모멘트 | 놓을 추 | 거리 사용');
  for (const s of stat) {
    console.log(`   ${s.t}   |    ${s.terms.toFixed(1)}     |    ${s.mom.toFixed(1).padStart(5)}    |   ${s.place.toFixed(1)}   | ${s.dist}/${s.n}`);
  }
  // 난이도는 "항 수" 같은 하나의 숫자가 아니라, 설계한 연산 단계로 올라간다.
  //  1 덧셈 → 2 뺄셈 → 3 곱셈·나눗셈(거리 도입) → 4 혼합 → 5 혼합 + 추 2개
  const design = [];
  const at = (t) => stat[t - 1];
  if (at(1).dist !== 0) design.push('1단계에 거리 개념이 들어감');
  if (at(2).dist !== 0) design.push('2단계에 거리 개념이 들어감');
  for (const t of [3, 4, 5]) if (at(t).dist !== at(t).n) design.push(`${t}단계에 거리를 쓰지 않는 문제가 있음`);
  if (at(2).terms <= at(1).terms - 0.1) design.push('2단계(뺄셈)의 항 수가 1단계보다 적음');
  if (at(4).terms <= at(3).terms) design.push('4단계(혼합)의 항 수가 3단계보다 많지 않음');
  if (at(5).terms <= at(4).terms) design.push('5단계의 항 수가 4단계보다 많지 않음');
  if (at(5).place < 2) design.push('5단계에서 놓을 추가 2개가 아님');
  for (const t of [1, 2, 3, 4]) if (at(t).place !== 1) design.push(`${t}단계에서 놓을 추가 1개가 아님`);
  // 거리를 쓰기 시작한 3단계부터는 다루는 수의 크기가 커져야 한다
  for (const t of [4, 5]) if (at(t).mom <= at(t - 1).mom) design.push(`${t}단계의 평균 모멘트가 ${t - 1}단계보다 크지 않음`);

  report('설계한 난이도 단계 구조를 지킨다', design);
  console.log('     (3단계는 항 수가 줄지만 곱셈·나눗셈과 거리 개념이 새로 들어가는 지점입니다)');
}

/* ═══════════════════════════════════════════════════════════
   결과
   ═══════════════════════════════════════════════════════════ */
console.log('\n' + '═'.repeat(52));
if (failedChecks.length) {
  const total = failedChecks.reduce((s, f) => s + f.bad.length, 0);
  console.log(`❌ 검사 ${checks}개 중 ${failedChecks.length}개 실패 (문제 ${total}건)`);
  failedChecks.forEach((f) => console.log(`   · ${f.name} — ${f.bad.length}건`));
  process.exit(1);
}
console.log(`✅ 검사 ${checks}개 모두 통과 — 문제 ${PROBLEMS.length}개`);
notes.forEach((n) => console.log(`   ℹ️  ${n}`));

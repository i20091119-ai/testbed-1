/**
 * 경남수학문화관 「저울 수학」 문제 은행 생성기
 * 난이도 5단계 × 20문제 = 100문제를 생성하고 전수 검증한 뒤 js/problems.js 로 출력한다.
 *
 * 문제 스키마
 * {
 *   id, tier, showDist,
 *   fixed:  { left:[[w,d],...], right:[[w,d],...] },  // 미리 올려져 있는 추 (움직일 수 없음)
 *   place:  [[w,d],...],                              // 아이가 놓아야 하는 추 (0번이 빈칸 □)
 *   blank:  { side:'right', d:n },                    // □ 가 가리키는 칸
 *   eq:     { left:[[w|'□',d],...], right:[...] },    // 화면에 보여줄 등식
 *   tray:   [n,...]                                   // 트레이에 놓일 추 값 (정답 + 오답 유인)
 * }
 */
'use strict';

const fs = require('fs');
const path = require('path');

const MAX_W = 12;   // 추 무게 최대
const MAX_D = 5;    // 눈금 최대
const PER_TIER = 20;

// ── 재현 가능한 난수 (LCG) ────────────────────────────────
let seed = 20260730;
function rnd() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ── 단계별 생성기 (성공 시 문제 객체, 실패 시 null) ────────
const makers = {
  // 1단계: 덧셈. 거리는 모두 1칸이라 화면에 거리를 표시하지 않는다.
  1() {
    const a = ri(2, 9), b = ri(2, 9);
    const s = a + b;
    if (s > MAX_W) return null;
    return {
      showDist: false,
      fixed: { left: [[a, 1], [b, 1]], right: [] },
      place: [[s, 1]],
      blank: { side: 'right', d: 1 },
      eq: { left: [[a, 1], [b, 1]], right: [['□', 1]] },
    };
  },

  // 2단계: 뺄셈. 오른팔 1칸에 추가 하나 올려져 있고, 모자란 만큼을 채운다.
  2() {
    const b = ri(2, 9), x = ri(2, 9);
    const a = b + x;
    if (a > MAX_W) return null;
    return {
      showDist: false,
      fixed: { left: [[a, 1]], right: [[b, 1]] },
      place: [[x, 1]],
      blank: { side: 'right', d: 1 },
      eq: { left: [[a, 1]], right: [['□', 1], [b, 1]] },
    };
  },

  // 3단계: 거리 도입 → 곱셈·나눗셈. 양쪽 눈금이 다르므로 무게만으로는 풀 수 없다.
  3() {
    const dl = ri(1, MAX_D), dr = ri(1, MAX_D);
    if (dl === dr) return null;
    const a = ri(2, MAX_W);
    const m = a * dl;
    if (m % dr !== 0) return null;
    const x = m / dr;
    if (x < 1 || x > MAX_W) return null;
    return {
      showDist: true,
      fixed: { left: [[a, dl]], right: [] },
      place: [[x, dr]],
      blank: { side: 'right', d: dr },
      eq: { left: [[a, dl]], right: [['□', dr]] },
    };
  },

  // 4단계: 두 항 혼합. (A) 왼쪽 두 개 → 오른쪽 하나 / (B) 양쪽에 하나씩 + 빈칸
  4() {
    if (rnd() < 0.55) {
      const p = ri(1, MAX_D), q = ri(1, MAX_D);
      if (p === q) return null;
      const a = ri(1, 9), b = ri(1, 9);
      const m = a * p + b * q;
      const r = ri(1, MAX_D);
      if (m % r !== 0) return null;
      const x = m / r;
      if (x < 1 || x > MAX_W) return null;
      return {
        showDist: true,
        fixed: { left: [[a, p], [b, q]], right: [] },
        place: [[x, r]],
        blank: { side: 'right', d: r },
        eq: { left: [[a, p], [b, q]], right: [['□', r]] },
      };
    }
    const p = ri(2, MAX_D), a = ri(2, MAX_W);
    const m = a * p;
    const q = ri(1, MAX_D), b = ri(1, 9);
    if (b * q >= m) return null;
    const r = ri(1, MAX_D);
    if (r === q) return null;                 // 빈칸 자리에는 고정 추가 없도록
    const rem = m - b * q;
    if (rem % r !== 0) return null;
    const x = rem / r;
    if (x < 1 || x > MAX_W) return null;
    return {
      showDist: true,
      fixed: { left: [[a, p]], right: [[b, q]] },
      place: [[x, r]],
      blank: { side: 'right', d: r },
      eq: { left: [[a, p]], right: [['□', r], [b, q]] },
    };
  },

  // 5단계: 혼합 + 추 2개 배치. 빈칸은 하나지만 옮겨야 할 추는 둘.
  5() {
    const p = ri(1, MAX_D), q = ri(1, MAX_D);
    if (p === q) return null;
    const a = ri(2, 9), b = ri(2, 9);
    const m = a * p + b * q;
    const r = ri(1, MAX_D), s = ri(1, MAX_D);
    if (r === s) return null;
    const c = ri(2, 9);
    const rem = m - c * s;
    if (rem <= 0 || rem % r !== 0) return null;
    const x = rem / r;
    if (x < 1 || x > MAX_W) return null;
    return {
      showDist: true,
      fixed: { left: [[a, p], [b, q]], right: [] },
      place: [[x, r], [c, s]],
      blank: { side: 'right', d: r },
      eq: { left: [[a, p], [b, q]], right: [['□', r], [c, s]] },
    };
  },
};

// ── 트레이(추 보관함) 구성: 정답 추 + 그럴듯한 오답 추 ─────
function candidateTray(place, tier) {
  const need = place.map((p) => p[0]);
  const size = tier <= 2 ? 4 : tier <= 4 ? 5 : 6;
  const tray = need.slice();
  // 정답 근처 값을 먼저 유인책으로 넣는다
  const lures = [];
  for (const n of need) for (const d of [1, -1, 2, -2, 3, -3]) lures.push(n + d);
  for (const v of shuffle(lures)) {
    if (tray.length >= size) break;
    if (v >= 1 && v <= MAX_W && !tray.includes(v)) tray.push(v);
  }
  let guard = 0;
  while (tray.length < size && guard++ < 200) {
    const v = ri(1, MAX_W);
    if (!tray.includes(v)) tray.push(v);
  }
  return shuffle(tray);
}

/**
 * 보관함의 추를 열린 칸에 놓아 수평을 만드는 모든 방법을 찾는다.
 * 게임은 "수평이면 정답"으로 처리하므로, 의도한 배치 말고 다른 방법이 있으면
 * 아이가 □ 를 맞히지 않고도 통과할 수 있다 → 그런 트레이는 쓰지 않는다.
 */
function solutionsOf(p) {
  const allow = p.showDist ? [1, 2, 3, 4, 5] : [1];
  const mom = (l) => l.reduce((s, [w, d]) => s + w * d, 0);
  const baseL = mom(p.fixed.left), baseR = mom(p.fixed.right);
  const fixedCnt = {};
  p.fixed.right.forEach(([, d]) => { fixedCnt[d] = (fixedCnt[d] || 0) + 1; });

  const found = new Set();
  const cur = [];
  (function rec(i, sum, cnt) {
    if (found.size > 1) return;                     // 2가지만 찾으면 충분
    if (i === p.tray.length) {
      if (cur.length && baseL === baseR + sum) {
        found.add(cur.map(([w, d]) => `${w}@${d}`).sort().join(','));
      }
      return;
    }
    rec(i + 1, sum, cnt);                           // 이 추는 쓰지 않는다
    for (const d of allow) {
      if ((cnt[d] || 0) + (fixedCnt[d] || 0) >= 3) continue;
      cnt[d] = (cnt[d] || 0) + 1;
      cur.push([p.tray[i], d]);
      rec(i + 1, sum + p.tray[i] * d, cnt);
      cur.pop();
      cnt[d] -= 1;
    }
  })(0, 0, {});
  return found;
}

/**
 * 풀이가 "의도한 배치 하나뿐"인 보관함을 만든다.
 *
 * 오답 유인 후보를 정답에 가까운 순서로 훑으면서, 그 추를 넣어도 여전히
 * 풀이가 하나뿐인 경우에만 채택한다. 이렇게 하면 "그럴듯하면서도
 * 다른 정답을 만들지 않는" 가장 가까운 오답들이 선택된다.
 * 필요한 개수를 채우지 못하면 null → 그 문제는 버린다.
 */
function buildUniqueTray(p, tier) {
  const need = p.place.map((x) => x[0]);
  const intended = p.place.map(([w, d]) => `${w}@${d}`).sort().join(',');
  const target = tier <= 2 ? 4 : tier <= 4 ? 5 : 6;
  const minSize = Math.max(3, need.length + 2);

  // 정답 추만으로도 유일하지 않다면 이 문제는 애초에 성립하지 않는다
  p.tray = need.slice();
  const base = solutionsOf(p);
  if (base.size !== 1 || !base.has(intended)) return null;

  // 오답 유인 후보: 정답에 가까운 값부터, 같은 거리면 무작위로
  const cands = [];
  for (let v = 1; v <= MAX_W; v++) {
    if (need.indexOf(v) >= 0) continue;
    cands.push({ v: v, d: Math.min.apply(null, need.map((n) => Math.abs(n - v))), r: rnd() });
  }
  cands.sort((a, b) => (a.d - b.d) || (a.r - b.r));

  const tray = need.slice();
  for (const c of cands) {
    if (tray.length >= target) break;
    p.tray = tray.concat([c.v]);
    const sols = solutionsOf(p);
    if (sols.size === 1 && sols.has(intended)) tray.push(c.v);
  }

  if (tray.length < minSize) return null;
  return shuffle(tray);
}

// ── 검증: 모멘트가 실제로 같은지, 규칙을 어기지 않는지 ─────
function validate(p) {
  const mom = (list) => list.reduce((s, [w, d]) => s + w * d, 0);
  const left = mom(p.fixed.left);
  const right = mom(p.fixed.right) + mom(p.place);
  if (left !== right) return '모멘트 불일치';
  if (left <= 0) return '왼쪽이 비어 있음';

  // 눈금 범위 / 무게 범위
  const all = [...p.fixed.left, ...p.fixed.right, ...p.place];
  for (const [w, d] of all) {
    if (!Number.isInteger(w) || w < 1 || w > MAX_W) return `무게 범위 밖: ${w}`;
    if (!Number.isInteger(d) || d < 1 || d > MAX_D) return `눈금 범위 밖: ${d}`;
  }
  // 한 칸에 최대 3개
  const count = {};
  for (const side of ['left', 'right']) {
    for (const [, d] of p.fixed[side]) count[`${side}:${d}`] = (count[`${side}:${d}`] || 0) + 1;
  }
  for (const [, d] of p.place) count[`right:${d}`] = (count[`right:${d}`] || 0) + 1;
  for (const k in count) if (count[k] > 3) return `한 칸에 추가 너무 많음: ${k}`;

  // 놓을 추는 모두 오른쪽, 빈칸은 place[0]
  if (p.blank.side !== 'right' || p.blank.d !== p.place[0][1]) return '빈칸 위치 불일치';

  // 수평을 만드는 방법이 의도한 정답 하나뿐인지
  {
    const intended = p.place.map(([w, d]) => `${w}@${d}`).sort().join(',');
    const sols = solutionsOf(p);
    if (sols.size !== 1 || !sols.has(intended)) return '정답 말고 다른 방법으로도 수평이 됨';
  }

  // 트레이에 정답 추가 모두 들어 있는지
  const bag = p.tray.slice();
  for (const [w] of p.place) {
    const i = bag.indexOf(w);
    if (i < 0) return `트레이에 정답 추 없음: ${w}`;
    bag.splice(i, 1);
  }

  // 등식이 저울과 같은 문제인지 (□ 를 정답으로 되돌려 계산)
  const evalSide = (terms) =>
    terms.reduce((s, [w, d]) => s + (w === '□' ? p.place[0][0] : w) * d, 0);
  if (evalSide(p.eq.left) !== evalSide(p.eq.right)) return '등식 불일치';
  if (evalSide(p.eq.left) !== left) return '등식과 저울 불일치';
  const blanks = [...p.eq.left, ...p.eq.right].filter(([w]) => w === '□').length;
  if (blanks !== 1) return `빈칸 개수 오류: ${blanks}`;
  return null;
}

/**
 * 문제의 "좋은 정도" (작을수록 좋음)
 *  · 오답 유인이 정답에서 멀수록 나쁘다 — 정답만 눈에 띄면 찍어서 맞힐 수 있다
 *  · 보관함이 목표 개수보다 적으면 나쁘다 — 고를 것이 적으면 그만큼 쉬워진다
 *  · 정답에 아주 가까운 오답(±2)이 하나도 없으면 크게 나쁘다
 */
const TRAY_TARGET = { 1: 4, 2: 4, 3: 5, 4: 5, 5: 6 };
function quality(p) {
  const need = p.place.map((x) => x[0]);
  const lures = p.tray.filter((v) => need.indexOf(v) < 0);
  const dist = lures.map((v) => Math.min.apply(null, need.map((n) => Math.abs(n - v))));
  const mean = dist.length ? dist.reduce((a, b) => a + b, 0) / dist.length : 9;
  const short = Math.max(0, TRAY_TARGET[p.tier] - p.tray.length);
  const noNear = dist.some((d) => d <= 2) ? 0 : 4;
  return mean + short * 2 + noNear;
}

// ── 생성 ───────────────────────────────────────────────
// 후보를 넉넉히 만든 뒤, 단계마다 가장 좋은 20문제만 고른다.
const POOL = 60000;
const problems = [];
let id = 0;
for (let tier = 1; tier <= 5; tier++) {
  const byKey = new Map();
  const norm = (l) => l.map((t) => t.join('@')).sort().join(',');

  for (let i = 0; i < POOL; i++) {
    const p = makers[tier]();
    if (!p) continue;
    p.tier = tier;

    // 추의 순서만 다른 문제(예: 6+5 와 5+6)는 같은 문제로 본다
    const key = [norm(p.fixed.left), norm(p.fixed.right), norm(p.place)].join('|');

    // 수평을 만드는 방법이 정답 하나뿐인 보관함을 찾는다 (못 찾으면 문제를 버린다)
    const tray = buildUniqueTray(p, tier);
    if (!tray) continue;
    p.tray = tray;
    if (validate(p)) continue;

    // 같은 문제가 이미 있으면 더 좋은 쪽만 남긴다
    const prev = byKey.get(key);
    if (!prev || quality(p) < quality(prev)) byKey.set(key, p);
  }

  const picked = [...byKey.values()].sort((a, b) => quality(a) - quality(b)).slice(0, PER_TIER);
  // 화면에 나오는 순서가 품질 순이 되지 않도록 섞는다
  for (const p of shuffle(picked)) { p.id = ++id; problems.push(p); }

  const made = picked.length;
  if (made < PER_TIER) {
    console.error(`❌ ${tier}단계 문제를 ${made}개밖에 만들지 못했습니다.`);
    process.exit(1);
  }
}

// ── 전수 재검증 ────────────────────────────────────────
let bad = 0;
for (const p of problems) {
  const err = validate(p);
  if (err) { bad++; console.error(`❌ #${p.id} (${p.tier}단계): ${err}`); }
}
if (bad) process.exit(1);

// ── 출력 ───────────────────────────────────────────────
const termStr = (t, showDist) => (showDist ? `${t[0]} × ${t[1]}` : `${t[0]}`);
const eqStr = (p) =>
  `${p.eq.left.map((t) => termStr(t, p.showDist)).join(' + ')} = ` +
  `${p.eq.right.map((t) => termStr(t, p.showDist)).join(' + ')}`;

const lines = problems.map((p) => {
  const j = JSON.stringify({
    id: p.id, tier: p.tier, showDist: p.showDist,
    fixed: p.fixed, place: p.place, blank: p.blank, eq: p.eq, tray: p.tray,
  });
  return `  /* ${String(p.id).padStart(3)} | ${p.tier}단계 | ${eqStr(p)} → □=${p.place[0][0]} */\n  ${j},`;
});

const out = `/**
 * 경남수학문화관 「저울 수학」 문제 은행 — 자동 생성 파일
 *
 *  · 총 ${problems.length}문제 (난이도 1~5단계 × ${PER_TIER}문제)
 *  · 모든 문제는 "왼쪽 모멘트 합 = 오른쪽 모멘트 합" 을 만족하도록 검증되었습니다.
 *  · 모멘트 = 무게 × 거리(눈금)
 *
 * 문제를 직접 고치거나 추가하고 싶다면 아래 형식을 그대로 따라 주세요.
 *
 *   id       : 문제 번호
 *   tier     : 난이도 1~5
 *   showDist : true 면 등식에 "무게 × 거리" 를 모두 보여 줍니다 (false 면 무게만)
 *   fixed    : 미리 올려져 있어 움직일 수 없는 추  { left: [[무게,눈금],...], right: [...] }
 *   place    : 아이가 트레이에서 끌어다 놓아야 하는 추 (0번째가 빈칸 □ 에 해당)
 *   blank    : □ 가 가리키는 칸  { side:'right', d: 눈금 }
 *   eq       : 화면 위쪽에 보여 줄 등식 ('□' 가 빈칸)
 *   tray     : 트레이에 놓일 추 값 목록 (정답 추 + 헷갈리게 하는 추)
 */
window.PROBLEMS = [
${lines.join('\n')}
];
`;

const dest = path.resolve(__dirname, 'js/problems.js');
fs.writeFileSync(process.argv[2] || dest, out, 'utf8');

// 요약
const byTier = {};
for (const p of problems) byTier[p.tier] = (byTier[p.tier] || 0) + 1;
console.log(`✅ ${problems.length}문제 생성 및 검증 완료`, byTier);
console.log('— 샘플 —');
for (const t of [1, 2, 3, 4, 5]) {
  const p = problems.find((x) => x.tier === t);
  console.log(`  ${t}단계: ${eqStr(p)}   (□=${p.place[0][0]}, 트레이 ${p.tray.join(',')})`);
}

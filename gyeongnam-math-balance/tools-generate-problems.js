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
function buildTray(place, tier) {
  const need = place.map((p) => p[0]);
  const size = tier <= 2 ? 4 : tier <= 4 ? 5 : 6;
  const tray = need.slice();
  // 정답 근처 값을 먼저 유인책으로 넣는다
  const lures = [];
  for (const n of need) for (const d of [1, -1, 2, -2]) lures.push(n + d);
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

// ── 생성 ───────────────────────────────────────────────
const problems = [];
let id = 0;
for (let tier = 1; tier <= 5; tier++) {
  const seen = new Set();
  let made = 0, guard = 0;
  while (made < PER_TIER && guard++ < 400000) {
    const p = makers[tier]();
    if (!p) continue;
    p.tier = tier;
    p.tray = buildTray(p.place, tier);
    const key = JSON.stringify([p.fixed, p.place]);
    if (seen.has(key)) continue;
    const err = validate(p);
    if (err) continue;
    seen.add(key);
    p.id = ++id;
    problems.push(p);
    made++;
  }
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

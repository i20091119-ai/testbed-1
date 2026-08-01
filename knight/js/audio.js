/* ═══════════════════════════════════════════════════════════════
 * audio.js — WebAudio 합성 효과음 (음원 파일·네트워크 불필요)
 * ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var ctx = null;
  var muted = localStorage.getItem('gnmc-knight-muted') === '1';

  function ensure() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* 단일 톤. slideTo 를 주면 주파수가 미끄러진다 */
  function tone(freq, dur, opts) {
    if (muted || !ensure()) return;
    opts = opts || {};
    var t0 = ctx.currentTime + (opts.delay || 0);
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, t0 + dur);
    var vol = opts.vol || 0.12;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  var SFX = {
    click:   function () { tone(660, 0.08, { type: 'triangle', vol: 0.1 }); },
    pickup:  function () { tone(440, 0.09, { type: 'triangle', slideTo: 700, vol: 0.12 }); },
    drop:    function () { tone(500, 0.1, { type: 'triangle', slideTo: 300, vol: 0.12 }); },
    correct: function () {                       // 도-미-솔-도 아르페지오
      tone(523, 0.14, { type: 'triangle', vol: 0.14 });
      tone(659, 0.14, { type: 'triangle', vol: 0.14, delay: 0.11 });
      tone(784, 0.14, { type: 'triangle', vol: 0.14, delay: 0.22 });
      tone(1047, 0.3, { type: 'triangle', vol: 0.16, delay: 0.33 });
    },
    wrong:   function () {
      tone(220, 0.22, { type: 'sawtooth', slideTo: 140, vol: 0.09 });
      tone(180, 0.25, { type: 'sawtooth', slideTo: 110, vol: 0.09, delay: 0.16 });
    },
    tick:    function () { tone(880, 0.05, { type: 'square', vol: 0.05 }); },
    timeout: function () { tone(392, 0.3, { type: 'sine', slideTo: 196, vol: 0.13 }); },

    /* ── 기사의 여행 전용 ── */
    step:    function () {                       // 나이트가 새 칸에 착지
      tone(392, 0.07, { type: 'triangle', vol: 0.11 });
      tone(588, 0.11, { type: 'triangle', vol: 0.12, delay: 0.05 });
    },
    undo:    function () { tone(520, 0.12, { type: 'sine', slideTo: 330, vol: 0.1 }); },
    reset:   function () {                       // 보드 새로 시작
      tone(300, 0.1, { type: 'triangle', slideTo: 460, vol: 0.1 });
      tone(460, 0.12, { type: 'triangle', slideTo: 620, vol: 0.1, delay: 0.09 });
    },
    stuck:   function () {                       // 더 갈 곳이 없을 때
      tone(300, 0.18, { type: 'sine', slideTo: 220, vol: 0.1 });
      tone(240, 0.2, { type: 'sine', slideTo: 170, vol: 0.09, delay: 0.14 });
    },
    tour:    function () {                       // 25칸 완주
      var notes = [523, 659, 784, 1047, 1319];
      for (var i = 0; i < notes.length; i++) {
        tone(notes[i], 0.26, { type: 'triangle', vol: 0.15, delay: i * 0.1 });
      }
    },
    countdown: function (last) {                 // 3-2-1(false) / 시작!(true)
      if (last) tone(880, 0.35, { type: 'triangle', vol: 0.16 });
      else tone(523, 0.16, { type: 'triangle', vol: 0.13 });
    },
    fanfare: function () {                       // 종료 팡파레
      var notes = [523, 523, 523, 659, 784, 659, 784, 1047];
      var times = [0, 0.16, 0.32, 0.48, 0.64, 0.88, 1.04, 1.2];
      for (var i = 0; i < notes.length; i++) {
        tone(notes[i], 0.22, { type: 'triangle', vol: 0.15, delay: times[i] });
        tone(notes[i] / 2, 0.22, { type: 'sine', vol: 0.08, delay: times[i] });
      }
    },
    isMuted: function () { return muted; },
    toggleMute: function () {
      muted = !muted;
      localStorage.setItem('gnmc-knight-muted', muted ? '1' : '0');
      return muted;
    },
    unlock: ensure   // 첫 사용자 터치에서 호출해 오디오 컨텍스트 활성화
  };

  window.SFX = SFX;
})();

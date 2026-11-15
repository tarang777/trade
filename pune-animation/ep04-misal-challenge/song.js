// THE SONG for EP04: every sound comes from an event in score.js.   node song.js   (STEMS=1 writes stems)
// A pressure-cooker whistle hook, a bouncy dholak groove for the vlog, a rising hit + tabla for each level
// (level three gets thunder and a timpani roll), a held-breath silence on the bite, then the BLAST: whistle,
// boom, rocket sweep. The stamp, a relieved harmonium for buttermilk, a marimba "sticker", the meter sting.
const path = require('path');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const Genre = require('./engine/audio/genres');
const Voice = require('./engine/audio/voice');
const U = require('./engine/util');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, clock, chordAt } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), brass = bus(), fx = bus(), amb = bus(), heart = bus(), verb = bus();
const rng = U.mulberry32(44);

// ---------- HOOK: the pressure-cooker whistle out of his ears ----------
fx.addMono(I.thud(80, 0.12), ev.hook, 0.8);
fx.addMono(I.whistle(1.1), ev.hook, 0.35);
fx.addMono(I.noiseSweep(1.2, 2000, 8000, { pink: false, shape: (x) => Math.sin(Math.PI * x) }), ev.hook, 0.12); // the hiss of steam

// ---------- the vlog: a bouncy groove ----------
Genre.play('desi', { clock, from: 2, to: 7, chordAt, buses: { drums, bass, pad, keys }, gain: 0.75, fill: [6] });
for (const k of [0, 0.5, 1]) fx.addMono(I.pop(1500 + k * 400), ev.eatery + 0.3 + k * 0.15, 0.12); // "hi friends!" sparkle
fx.addMono(I.bwomp(), ev.peek + 0.5, 0.2);
// ---------- the three levels: each lands with a bigger hit; the groove climbs ----------
Genre.play('desi', { clock, from: 8, to: 13, chordAt, buses: { drums, bass, pad, keys }, gain: 0.85, fill: [9, 12] });
ev && [ev.l1, ev.l2].forEach((t, i) => { fx.addMono(I.thud(70, 0.14), t, 0.8 + i * 0.1); fx.addMono(I.tabla('na', { midi: 62 + i * 3 }), t, 0.5); drums.addMono(I.crash(2 + i), t, 0.25 + i * 0.08); fx.addMono(I.ting(84 + i * 3, { gap: 0.06 }), t + 0.05, 0.1); });
for (let k = 0; k < 6; k++) fx.addMono(I.pluck(m('A4') + k), ev.l2 + 1.2 + k * 0.12, 0.05); // heat shimmer
// level three: the groove drops out, thunder, a timpani roll, an ominous low brass
for (const b of [drums, bass, pad, keys]) MIX.gate(b, ev.l3 - 0.02, T(18, 2) - 0.02, 0.01);
fx.addMono(I.thud(50, 0.25), ev.l3, 1); fx.addMono(I.subBoom(2, 60, 28), ev.l3, 0.6); fx.addMono(I.noiseSweep(1.6, 200, 900, { pink: true, shape: (x) => Math.exp(-3 * x) }), ev.l3, 0.35);
for (const n of ['D2', 'A2', 'D3']) { const { L, R } = I.brassNote(m(n), BEAT * 6, { bright: 0.7, seed: m(n) }); brass.addStereo(L, R, ev.l3 + 0.1, 0.07); }
for (let k = 0; k < 14; k++) fx.addMono(I.timpani(m('D2'), { decay: 0.25, seed: k }), ev.l3 + 2.2 + k * 0.1, 0.06 + k * 0.012);
// the bite: a crunch... silence... a heartbeat
fx.addMono(I.paperFwip(0.6), ev.bite, 0.3);
fx.addMono(I.thud(45, 0.1), ev.bite + BEAT * 1.2, 0.3);
// ---------- BLAST OFF ----------
fx.addMono(I.whistle(1.6), ev.blast - 0.02, 0.3);
fx.addMono(I.thud(55, 0.25), ev.blast, 1); fx.addMono(I.subBoom(2.2, 70, 26), ev.blast, 0.7); drums.addMono(I.crash(4), ev.blast, 0.5);
fx.addMono(I.noiseSweep(2.4, 400, 6000, { pink: true, shape: (x) => Math.sin(Math.PI * x) }), ev.blast + 0.05, 0.25); // the rocket
fx.addMono(I.launchWhistle ? I.launchWhistle() : I.whistle(0.8), ev.blast + 0.3, 0.15);
fx.addMono(I.noiseSweep(1.2, 5000, 300, { pink: true }), T(17, 2), 0.12); // falling back down
fx.addMono(I.boing(), T(18, 1.5), 0.25);
// ---------- PUNE RULE #4: the stamp ----------
fx.addMono(I.thud(60, 0.2), ev.rule, 1); fx.addMono(I.subBoom(1.2, 70, 32), ev.rule, 0.5); drums.addMono(I.crash(3), ev.rule, 0.4);
for (const n of ['F3', 'A3', 'C4', 'F4']) { const { L, R } = I.brassNote(m(n), BEAT * 0.9, { stab: true, bright: 1.3, seed: m(n) }); brass.addStereo(L, R, ev.rule, 0.1); }
Genre.play('desi', { clock, from: 19, to: 20, chordAt, buses: { drums, bass, pad, keys }, gain: 0.7 });
for (const b of [drums, bass, pad, keys]) MIX.gate(b, T(20, 3), T(30), 0.01);
// ---------- buttermilk: relief ----------
fx.addMono(I.noiseSweep(0.8, 6000, 800, { pink: true }), ev.kaka + 3.2, 0.08); // the steam fizzles out
for (const c of sc.chords.filter((q) => q.bar >= 21 && q.bar < 29)) {
  for (const n of c.notes) { const { L, R } = I.padNote(n - 12, BEAT * 4 * 1.05, { attack: 0.5, release: 1.2, cutoff: 1300, seed: n }); heart.addStereo(L, R, T(c.bar), 0.05); }
  const { L, R } = I.harmonium(c.notes[0], BEAT * 3.6, { attack: 0.3, release: 0.6, bright: 0.8, seed: c.bar }); keys.addStereo(L, R, T(c.bar), 0.04);
  bass.addMono(I.bass(typeof c.bass === 'number' ? c.bass : m(c.bass), BEAT * 3.6, { bright: 0.15, sub: 1 }), T(c.bar), 0.22);
}
Genre.play('lofi', { clock, from: 24, to: 28, chordAt, buses: { drums, bass, pad, keys }, gain: 0.5, chords: false });
// the 11/10 sticker + hearts
for (const [k, n] of [[0, 'C5'], [0.5, 'F5'], [1, 'A5'], [1.5, 'C6']]) fx.addMono(I.marimba(m(n)), ev.sticker + k * BEAT * 0.5, 0.2);
fx.addMono(I.thud(90, 0.1), ev.sticker, 0.7); fx.addMono(I.pop(2200), ev.sticker, 0.3);
// ---------- METER DOWN ----------
fx.addMono(I.tvClick(), ev.meter, 0.6); fx.addMono(I.woodTick(1.8), ev.meter, 0.4);
drums.addMono(I.dholak('ghe'), ev.meter, 1); drums.addMono(I.clap({ spread: 1.2 }), ev.meter, 0.5);
for (const n of ['F4', 'A4', 'C5']) { const { L, R } = I.harmonium(m(n), 1.4, { attack: 0.01, release: 0.8, bright: 1.1, seed: m(n) }); keys.addStereo(L, R, ev.meter, 0.08); }
for (const k of [0, 0.5]) { const { L, R } = I.brassNote(m('C5'), BEAT * 0.35, { stab: true, bright: 1.6, seed: 9 + k }); brass.addStereo(L, R, ev.meter + BEAT * (1 + k), 0.1); }

// ---------- the voiceover ----------
// Each line: the ElevenLabs take vo/<id>.mp3 if it exists, else an espeak-ng Marathi/Hindi placeholder.
// Trimmed of silence, levelled, placed at its score time; words share the line by length (for captions);
// the mouth track comes from the voice bus (lip-sync).
const fs = require('fs');
const { execFileSync } = require('child_process');
function placeVoices(lines) {
  const dir = path.join(__dirname, 'vo'), out = path.join(__dirname, 'out');
  fs.mkdirSync(path.join(out, '.vo-ph'), { recursive: true });
  const vbus = new Bus(N), placed = [];
  let engine = 'sarvam-bulbul-v3';
  for (const l of lines) {
    let f = ['.wav', '.mp3'].map((e) => path.join(dir, l.id + e)).find((q) => fs.existsSync(q)) || path.join(dir, l.id + '.mp3');
    if (!fs.existsSync(f)) {
      engine = 'mixed';
      f = path.join(out, '.vo-ph', l.id + '.wav');
      if (!fs.existsSync(f)) execFileSync('espeak-ng', ['-v', (l.who === 'arjun' ? 'hi' : 'mr') + (l.who === 'aaji' ? '+f3' : '+m3'), '-s', '150', '-w', f, l.text]);
    }
    let a = Voice.decode(f);
    let i0 = 0, i1 = a.length - 1;
    while (i0 < a.length && Math.abs(a[i0]) < 0.012) i0++;
    while (i1 > i0 && Math.abs(a[i1]) < 0.012) i1--;
    a = a.slice(Math.max(0, i0 - 0.02 * SR), Math.min(a.length, i1 + 0.06 * SR));
    let s2 = 0, c = 0; for (const x of a) if (Math.abs(x) > 0.01) { s2 += x * x; c++; }
    const g = c ? Math.min(6, 0.12 / Math.sqrt(s2 / c)) : 0;
    const dur = a.length / SR;
    vbus.addMono(a.map((x) => x * g), l.at, 1);
    const ws = l.display.split(/\s+/).filter(Boolean), tot = ws.reduce((q, w) => q + w.length, 0);
    let acc = 0; const words = ws.map((w) => { const t0 = l.at + (acc / tot) * dur; acc += w.length; return { w, t: +t0.toFixed(3), end: +(l.at + (acc / tot) * dur).toFixed(3) }; });
    placed.push({ t: +l.at.toFixed(3), end: +(l.at + dur).toFixed(3), text: l.text, display: l.display, alt: l.alt, who: l.who, id: l.id, words });
  }
  const json = { engine, lines: placed, mouth: Voice.mouthTrack(vbus, 30) };
  fs.writeFileSync(path.join(out, 'voice.json'), JSON.stringify(json));
  return { bus: vbus, engine, lines: placed };
}
const vo = placeVoices(sc.vo);

// ---------- mix ----------
const room = reverb(verb, { room: 0.7, damp: 0.4 });
const music = [drums, bass, pad, keys, brass, heart, amb];
MIX.duck(music, vo.bus, { depth: 0.5 });
const stems = { drums, bass, pad, keys, brass, heart, amb, fx, voice: vo.bus, verb: room };
const GAIN = { drums: 0.8, bass: 0.75, pad: 0.9, keys: 1, brass: 2.2, heart: 2.2, amb: 1.4, fx: 1, voice: 2.0, verb: 0.5 };
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? path.join(__dirname, 'out') : null });
MIX.highpass(mix, 28);
MIX.fadeOut(mix, DURATION - 0.6, DURATION);
const res = MIX.master(mix, 0.8, undefined, { lufs: process.env.LUFS ? +process.env.LUFS : -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS  voice: ${vo.engine} (${vo.lines.length} lines)`);

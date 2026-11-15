// THE SONG for EP02: every sound comes from an event in score.js.   node song.js   (STEMS=1 writes stems)
// A sly dholak groove for the walk past the signs (a "ting" as each sign is revealed), two doorbell
// ding-dongs (the second louder), a timpani + record scratch as the door flies open, a brass stamp on
// Pune Rule #2, then a warm harmonium + music-box heart theme for poha, the painting and the gift.
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
const rng = U.mulberry32(22);

// ---------- HOOK: the sign swings in on its nail ----------
fx.addMono(I.thud(80, 0.14), ev.hook, 0.9);
fx.addMono(I.woodTick(0.8), ev.hook, 0.5);
for (let k = 1; k < 4; k++) fx.addMono(I.woodTick(1.1 + k * 0.1), ev.hook + k * 0.28, 0.12 / k); // the creak as it settles
fx.addMono(I.pluck(m('D5')), ev.hook, 0.25);

// ---------- the walk past the signs: a sly groove ----------
Genre.play('desi', { clock, from: 2, to: 5, chordAt, buses: { drums, bass, pad, keys }, gain: 0.7, chords: false });
Genre.play('desi', { clock, from: 5, to: 15, chordAt, buses: { drums, bass, pad, keys }, gain: 0.85, fill: [8, 12, 14] });
for (const k of [0, 0.5]) { const { L, R } = I.brassNote(m('A4'), BEAT * 0.35, { stab: true, bright: 1.6, seed: 3 + k }); brass.addStereo(L, R, T(2, k), 0.12); } // auto toot-toot
// a reveal "ting" + whoosh on each sign
for (const t of [ev.sign1, ev.sign2, ev.door]) { fx.addMono(I.ting(86, { gap: 0.07, seed: Math.round(t) }), t, 0.12); fx.addMono(I.noiseSweep(0.35, 800, 4000, { pink: true }), t - 0.3, 0.05); }
// Pinya coos at sign 2
for (let k = 0; k < 2; k++) amb.addMono(I.voice(m('E3') - k, 0.25, { syl: 'o', type: 'tenor', seed: 90 + k, breath: 0.4, glide: -2 }), ev.sign2 + 1.2 + k * 0.32, 0.05);
// the groove stops: a held breath before the rings
for (const b of [drums, bass, pad, keys]) MIX.gate(b, ev.ring1 - BEAT, T(31), 0.01);
fx.addMono(I.heartbeat ? I.heartbeat() : I.thud(50, 0.1), ev.ring1 - BEAT * 1.8, 0.25);

// ---------- the doorbell: ding-dong, then DING-DONG ----------
function dingdong(t, g) { fx.addMono(I.bell(1318, 0.5, 1.2, 1), t, g, 0.1); fx.addMono(I.bell(1046, 0.7, 1.2, 1), t + BEAT * 0.45, g, 0.1); verb.addMono(I.bell(1318, 0.5, 1.2, 1), t, g * 0.4); }
dingdong(ev.ring1, 0.25);
dingdong(ev.ring2, 0.4);
fx.addMono(I.bwomp(), ev.ring2 + BEAT * 1.2, 0.2); // "uh-oh"

// ---------- the door flies open ----------
fx.addMono(I.scratch(0.3), ev.open, 0.5);
fx.addMono(I.thud(60, 0.2), ev.open, 0.9);
fx.addMono(I.timpani(m('D2')), ev.open, 0.7);
fx.addMono(I.subBoom(0.8, 70, 34), ev.open, 0.35);

// ---------- PUNE RULE #2: the stamp ----------
fx.addMono(I.thud(60, 0.2), ev.rule, 1);
fx.addMono(I.subBoom(1.2, 70, 32), ev.rule, 0.5);
drums.addMono(I.crash(3), ev.rule, 0.4);
for (const n of ['F3', 'A3', 'C4', 'F4']) { const { L, R } = I.brassNote(m(n), BEAT * 0.9, { stab: true, bright: 1.3, seed: m(n) }); brass.addStereo(L, R, ev.rule, 0.1); }
Genre.play('desi', { clock, from: 18, to: 20, chordAt, buses: { drums, bass, pad, keys }, gain: 0.75 });
for (const b of [drums, bass, pad, keys]) MIX.gate(b, T(19, 3.5), T(31), 0.01);

// ---------- the heart: harmonium + pad + music box from the courtyard to the end ----------
for (const c of sc.chords.filter((q) => q.bar >= 20 && q.bar < 31)) {
  for (const n of c.notes) { const { L, R } = I.padNote(n - 12, BEAT * 4 * 1.05, { attack: 0.5, release: 1.2, cutoff: 1300, seed: n }); heart.addStereo(L, R, T(c.bar), 0.05); }
  heart.addMono(I.epiano(c.notes[0], BEAT * 3), T(c.bar), 0.07);
  bass.addMono(I.bass(typeof c.bass === 'number' ? c.bass : m(c.bass), BEAT * 3.6, { bright: 0.15, sub: 1 }), T(c.bar), 0.22);
}
for (const [n, dur] of [['F3', 4]]) { const { L, R } = I.harmonium(m(n), T(22) - T(20), { attack: 0.6, release: 0.8, bright: 0.8, seed: 7 }); keys.addStereo(L, R, T(20), 0.04); }
const melody = [[22, 0, 'D5'], [22, 1.5, 'C5'], [22, 2, 'Bb4'], [23, 0, 'C5'], [23, 2, 'A4'], [24, 0, 'Bb4'], [24, 2, 'D5'], [25, 0, 'C5'], [26, 0, 'D5'], [26, 1.5, 'C5'], [26, 2, 'Bb4'], [27, 0, 'C5'], [27, 2, 'A4'], [28, 0, 'G4'], [28, 2, 'A4'], [29, 0, 'C5'], [30, 0, 'F5']];
for (const [bar, beat, n] of melody) { heart.addMono(I.musicBox(m(n)), T(bar, beat), 0.13); verb.addMono(I.musicBox(m(n)), T(bar, beat), 0.05); }
// the brush strokes while she paints, the new sign lifted with a little fanfare
for (let k = 0; k < 6; k++) fx.addMono(I.paperFwip(0.8 + k * 0.05, 30 + k), ev.paint + 0.6 + k * BEAT, 0.08);
for (const [k, n] of [[0, 'C5'], [0.5, 'F5'], [1, 'A5']]) fx.addMono(I.marimba(m(n)), ev.gift + k * BEAT, 0.2);
// golden hour: birds, a distant temple bell
fx.addMono(I.bell(660, 1.6, 2.2, 1.414), ev.golden + 0.4, 0.06);
for (let k = 0; k < 5; k++) amb.addMono(I.voice(m('C6') + Math.floor(rng() * 5), 0.08, { syl: 'e', type: 'alto', seed: 120 + k, glide: 6 }), ev.golden + 1 + k * 0.6 + rng() * 0.2, 0.025, (rng() - 0.5));

// ---------- METER DOWN: click + the series sting ----------
fx.addMono(I.tvClick(), ev.meter, 0.6);
fx.addMono(I.woodTick(1.8), ev.meter, 0.4);
drums.addMono(I.dholak('ghe'), ev.meter, 1);
drums.addMono(I.clap({ spread: 1.2 }), ev.meter, 0.5);
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
